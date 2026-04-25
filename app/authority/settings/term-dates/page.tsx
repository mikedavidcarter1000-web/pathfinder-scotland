'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { TermDates, TermDatesForYear } from '@/lib/academic-year'

type TermKey = 'term_1' | 'term_2' | 'term_3' | 'term_4'

const TERM_LABELS: Record<TermKey, string> = {
  term_1: 'Term 1 (Autumn)',
  term_2: 'Term 2 (Winter)',
  term_3: 'Term 3 (Spring)',
  term_4: 'Term 4 (Summer)',
}

const ORDER: TermKey[] = ['term_1', 'term_2', 'term_3', 'term_4']

function defaultsForYear(academicYear: string): TermDatesForYear {
  // Permissive Scottish defaults: Aug-mid -> mid-Oct, late-Oct -> mid-Dec,
  // early-Jan -> late-Mar, mid-Apr -> late-Jun. LAs override with exact dates.
  const m = /^(\d{4})-\d{2}$/.exec(academicYear)
  if (!m) return {}
  const y = Number(m[1])
  return {
    term_1: { start: `${y}-08-19`, end: `${y}-10-10` },
    term_2: { start: `${y}-10-27`, end: `${y}-12-19` },
    term_3: { start: `${y + 1}-01-06`, end: `${y + 1}-03-27` },
    term_4: { start: `${y + 1}-04-14`, end: `${y + 1}-06-26` },
  }
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '4px',
  color: '#1a1a2e',
  fontSize: '0.8125rem',
  fontFamily: "'Space Grotesk', sans-serif",
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const sectionHead: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: '1.125rem',
  color: '#1a1a2e',
  marginBottom: '16px',
}
const card: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '24px',
}

type Toast = { kind: 'success' | 'error'; text: string } | null

export default function TermDatesSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState('')
  const [currentYear, setCurrentYear] = useState('')
  const [nextYear, setNextYear] = useState('')
  const [termDates, setTermDates] = useState<TermDates>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/authority/term-dates')
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setAccessError((d as { error?: string }).error ?? 'Access denied.')
      setLoading(false)
      return
    }
    const d = (await res.json()) as { currentYear: string; nextYear: string; termDates: TermDates }
    setCurrentYear(d.currentYear)
    setNextYear(d.nextYear)
    // Pre-populate any unconfigured year with defaults so the UI is editable.
    const merged: TermDates = { ...d.termDates }
    for (const y of [d.currentYear, d.nextYear]) {
      if (!merged[y]) merged[y] = defaultsForYear(y)
    }
    setTermDates(merged)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function updateTerm(year: string, term: TermKey, field: 'start' | 'end', value: string) {
    setTermDates((prev) => {
      const yearCfg: TermDatesForYear = { ...(prev[year] ?? {}) }
      const existing = yearCfg[term] ?? { start: '', end: '' }
      yearCfg[term] = { ...existing, [field]: value }
      return { ...prev, [year]: yearCfg }
    })
  }

  function applyDefaults(year: string) {
    setTermDates((prev) => ({ ...prev, [year]: defaultsForYear(year) }))
  }

  async function handleSave() {
    setSaving(true)
    setToast(null)
    try {
      const res = await fetch('/api/authority/term-dates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term_dates: termDates }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setToast({ kind: 'error', text: (d as { error?: string }).error ?? 'Could not save term dates.' })
        return
      }
      setToast({ kind: 'success', text: 'Term dates saved.' })
    } catch {
      setToast({ kind: 'error', text: 'Network error -- please try again.' })
    } finally {
      setSaving(false)
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

  if (accessError) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '48px 16px' }}>
        <div className="pf-container">
          <p style={{ color: '#dc2626' }}>{accessError}</p>
          <Link href="/authority/dashboard" style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.875rem' }}>
            ← Dashboard
          </Link>
        </div>
      </main>
    )
  }

  const years = [currentYear, nextYear]

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 0' }}>
        <div className="pf-container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/authority/dashboard" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#1a1a2e' }}>
            Term dates
          </span>
        </div>
      </div>

      <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '860px' }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1a1a2e',
            marginBottom: '8px',
          }}
        >
          Term dates
        </h1>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.9375rem' }}>
          Configure your authority&apos;s term dates so dashboards can group activity by term. Defaults follow a generic
          Scottish calendar; override with your own dates if your LA differs.
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

        {years.map((year) => {
          const cfg = termDates[year] ?? {}
          return (
            <div key={year} style={card}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <h2 style={{ ...sectionHead, marginBottom: 0 }}>{year}</h2>
                <button
                  type="button"
                  onClick={() => applyDefaults(year)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#fff',
                    color: '#1a1a2e',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Reset to defaults
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {ORDER.map((termKey) => {
                  const w = cfg[termKey] ?? { start: '', end: '' }
                  return (
                    <div key={termKey}>
                      <p
                        style={{
                          ...labelStyle,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontSize: '0.75rem',
                        }}
                      >
                        {TERM_LABELS[termKey]}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <label style={labelStyle} htmlFor={`${year}-${termKey}-start`}>
                            Start
                          </label>
                          <input
                            id={`${year}-${termKey}-start`}
                            type="date"
                            style={inputStyle}
                            value={w.start}
                            onChange={(e) => updateTerm(year, termKey, 'start', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={labelStyle} htmlFor={`${year}-${termKey}-end`}>
                            End
                          </label>
                          <input
                            id={`${year}-${termKey}-end`}
                            type="date"
                            style={inputStyle}
                            value={w.end}
                            onChange={(e) => updateTerm(year, termKey, 'end', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'var(--pf-blue-700, #1d4ed8)',
            color: '#fff',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.9375rem',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save term dates'}
        </button>
      </div>
    </main>
  )
}
