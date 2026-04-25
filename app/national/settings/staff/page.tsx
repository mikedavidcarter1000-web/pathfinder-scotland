'use client'

// Authority-15: national staff management. Admin-only inserts; all reads
// fetched via /api/national/staff which enforces requireNationalStaffApi.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  NATIONAL_ORGANISATIONS,
  NATIONAL_ROLES,
  NATIONAL_ROLE_LABELS,
  type NationalOrganisation,
  type NationalStaffRole,
} from '@/lib/national/constants'

type StaffMember = {
  id: string
  full_name: string
  email: string
  organisation: NationalOrganisation
  role: NationalStaffRole
  can_manage_staff: boolean
  can_export_data: boolean
  can_access_api: boolean
  last_active_at: string | null
  created_at: string
  user_id: string | null
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '24px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '6px',
  color: '#1a1a2e',
  fontSize: '0.875rem',
  fontFamily: "'Space Grotesk', sans-serif",
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '0.9375rem',
  outline: 'none',
  boxSizing: 'border-box',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function NationalStaffSettingsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState('')

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [organisation, setOrganisation] = useState<NationalOrganisation>(NATIONAL_ORGANISATIONS[0])
  const [role, setRole] = useState<NationalStaffRole>('national_analyst')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/national/staff')
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setAccessError((d as { error?: string }).error ?? 'Access denied.')
      setLoading(false)
      return
    }
    const d = (await res.json()) as { staff: StaffMember[]; isAdmin: boolean }
    setStaff(d.staff ?? [])
    setIsAdmin(!!d.isAdmin)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/national/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, organisation, role }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult({ error: (d as { error?: string }).error ?? 'Could not create staff record.' })
        return
      }
      setResult({ ok: true })
      setEmail('')
      setFullName('')
      setOrganisation(NATIONAL_ORGANISATIONS[0])
      setRole('national_analyst')
      await load()
    } catch {
      setResult({ error: 'Network error -- please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '48px 16px' }}>
        <p style={{ color: '#64748b' }}>Loading…</p>
      </main>
    )
  }

  if (accessError) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '48px 16px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ color: '#dc2626' }}>{accessError}</p>
          <Link href="/" style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.875rem' }}>
            ← Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '960px' }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1a1a2e',
            marginBottom: '8px',
          }}
        >
          National staff
        </h1>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.9375rem' }}>
          Manage staff at Scottish Government, Education Scotland, SFC, Qualifications Scotland, SDS, and Pathfinder
          Scotland who have access to the national tier dashboards and reports.
        </p>

        {isAdmin && (
          <section style={card}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1a1a2e',
                marginBottom: '16px',
              }}
            >
              Create staff record
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '16px' }}>
              Creates a placeholder record. The invitee will be linked to it once they sign up with the same email.
            </p>

            {result?.ok && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '12px',
                  color: '#166534',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Staff record created.
              </div>
            )}
            {result?.error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '12px',
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {result.error}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label htmlFor="ns-name" style={labelStyle}>
                    Full name
                  </label>
                  <input
                    id="ns-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="ns-email" style={labelStyle}>
                    Email
                  </label>
                  <input
                    id="ns-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label htmlFor="ns-org" style={labelStyle}>
                    Organisation
                  </label>
                  <select
                    id="ns-org"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value as NationalOrganisation)}
                    style={inputStyle}
                  >
                    {NATIONAL_ORGANISATIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ns-role" style={labelStyle}>
                    Role
                  </label>
                  <select
                    id="ns-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as NationalStaffRole)}
                    style={inputStyle}
                  >
                    {NATIONAL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {NATIONAL_ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--pf-blue-700, #1d4ed8)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.9375rem',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Creating…' : 'Create staff record'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section style={card}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#1a1a2e',
              marginBottom: '16px',
            }}
          >
            Staff directory ({staff.length})
          </h2>
          {staff.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>No national staff records yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 8px 8px 0', color: '#475569' }}>Name</th>
                    <th style={{ padding: '8px', color: '#475569' }}>Email</th>
                    <th style={{ padding: '8px', color: '#475569' }}>Organisation</th>
                    <th style={{ padding: '8px', color: '#475569' }}>Role</th>
                    <th style={{ padding: '8px', color: '#475569' }}>Status</th>
                    <th style={{ padding: '8px', color: '#475569' }}>Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px 10px 0', color: '#1a1a2e', fontWeight: 600 }}>{s.full_name}</td>
                      <td style={{ padding: '10px 8px', color: '#475569' }}>{s.email}</td>
                      <td style={{ padding: '10px 8px', color: '#475569' }}>{s.organisation}</td>
                      <td style={{ padding: '10px 8px', color: '#475569' }}>{NATIONAL_ROLE_LABELS[s.role]}</td>
                      <td style={{ padding: '10px 8px', color: s.user_id ? '#166534' : '#a16207', fontWeight: 600 }}>
                        {s.user_id ? 'Active' : 'Pending sign-in'}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#475569' }}>{formatDate(s.last_active_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
