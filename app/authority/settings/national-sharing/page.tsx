'use client'

// Authority-15: per-LA opt-in toggle for sharing aggregated data with the
// national tier. The setting flips local_authorities.share_national and
// records share_national_opted_at. National materialised views read this
// flag and exclude LAs that have not opted in -- so toggling here changes
// what national_admin / national_analyst staff see at the next refresh.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

type State = {
  authorityName: string
  shareNational: boolean
  shareNationalOptedAt: string | null
  isAdmin: boolean
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '24px',
}

type Toast = { kind: 'success' | 'error'; text: string } | null

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NationalSharingSettingsPage() {
  const [state, setState] = useState<State | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<'enable' | 'disable' | null>(null)
  const [toast, setToast] = useState<Toast>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/authority/settings/national-sharing')
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setAccessError((d as { error?: string }).error ?? 'Access denied.')
      setLoading(false)
      return
    }
    const d = (await res.json()) as State
    setState(d)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function applyToggle(next: boolean) {
    setSaving(true)
    setToast(null)
    try {
      const res = await fetch('/api/authority/settings/national-sharing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_national: next }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setToast({ kind: 'error', text: (d as { error?: string }).error ?? 'Could not update setting.' })
        return
      }
      const d = (await res.json()) as { shareNational: boolean; shareNationalOptedAt: string | null }
      setState((prev) =>
        prev
          ? { ...prev, shareNational: d.shareNational, shareNationalOptedAt: d.shareNationalOptedAt }
          : prev,
      )
      setToast({
        kind: 'success',
        text: next
          ? 'National data sharing enabled. Aggregated data will appear in national views at the next refresh.'
          : 'National data sharing disabled. Your authority will be removed from national views at the next refresh.',
      })
    } catch {
      setToast({ kind: 'error', text: 'Network error -- please try again.' })
    } finally {
      setSaving(false)
      setConfirm(null)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '48px 16px' }}>
        <div className="pf-container">
          <p style={{ color: '#64748b' }}>Loading…</p>
        </div>
      </main>
    )
  }

  if (accessError || !state) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '48px 16px' }}>
        <div className="pf-container">
          <p style={{ color: '#dc2626' }}>{accessError || 'Settings unavailable.'}</p>
          <Link href="/authority/dashboard" style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.875rem' }}>
            ← Dashboard
          </Link>
        </div>
      </main>
    )
  }

  const { authorityName, shareNational, shareNationalOptedAt, isAdmin } = state

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 0' }}>
        <div className="pf-container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/authority/dashboard" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#1a1a2e' }}>
            National data sharing
          </span>
        </div>
      </div>

      <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '760px' }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1a1a2e',
            marginBottom: '8px',
          }}
        >
          National data sharing
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9375rem', lineHeight: 1.6 }}>
          When enabled, {authorityName}&apos;s anonymised aggregate data is included in national-level analysis used by
          Scottish Government, Education Scotland, the Scottish Funding Council, Qualifications Scotland, and Skills
          Development Scotland. <strong>No individual student or school-identifiable data is shared at the national
          level</strong> -- data is aggregated to local authority level before inclusion, with statistical disclosure
          control suppressing any cohort smaller than 5.
        </p>

        {toast && (
          <div
            style={{
              backgroundColor: toast.kind === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${toast.kind === 'success' ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
            }}
          >
            <p
              style={{
                color: toast.kind === 'success' ? '#166534' : '#991b1b',
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {toast.text}
            </p>
          </div>
        )}

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#1a1a2e', marginBottom: '6px' }}>
                Share anonymised aggregate data with national bodies
              </p>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '12px' }}>
                Status:{' '}
                <strong style={{ color: shareNational ? '#166534' : '#475569' }}>
                  {shareNational ? 'Enabled' : 'Not enabled'}
                </strong>
              </p>
              <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                Last changed: {formatDate(shareNationalOptedAt)}
              </p>
            </div>

            <div>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setConfirm(shareNational ? 'disable' : 'enable')}
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: shareNational ? '#dc2626' : 'var(--pf-blue-700, #1d4ed8)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.9375rem',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {shareNational ? 'Disable sharing' : 'Enable sharing'}
                </button>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.8125rem', maxWidth: '180px' }}>
                  Only the LA Administrator can change this setting.
                </p>
              )}
            </div>
          </div>
        </div>

        {confirm && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15,23,42,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '16px',
            }}
          >
            <div style={{ ...card, maxWidth: '480px', marginBottom: 0 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.125rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
                {confirm === 'enable' ? 'Enable national data sharing?' : 'Disable national data sharing?'}
              </h2>
              <p style={{ color: '#475569', fontSize: '0.9375rem', marginBottom: '20px', lineHeight: 1.6 }}>
                {confirm === 'enable'
                  ? `This will share anonymised aggregate data from ${authorityName} with national education bodies. Individual student and school data remains private. Continue?`
                  : `This will remove ${authorityName}'s data from national analysis. The change will take effect at the next data refresh. Continue?`}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setConfirm(null)}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#fff',
                    color: '#1a1a2e',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => applyToggle(confirm === 'enable')}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: confirm === 'disable' ? '#dc2626' : 'var(--pf-blue-700, #1d4ed8)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.875rem',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving…' : confirm === 'enable' ? 'Enable' : 'Disable'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
