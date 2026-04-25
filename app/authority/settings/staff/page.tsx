'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AUTHORITY_ROLE_LABELS, AUTHORITY_ROLES, type AuthorityStaffRole } from '@/lib/authority/constants'

type StaffMember = {
  id: string
  full_name: string
  email: string
  role: AuthorityStaffRole
  can_manage_staff: boolean
  can_export_data: boolean
  can_configure_alerts: boolean
  can_access_api: boolean
  can_build_custom_reports: boolean
  last_active_at: string | null
  created_at: string
}

type PendingInvitation = {
  id: string
  email: string
  role: AuthorityStaffRole
  expires_at: string
  created_at: string
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

export default function StaffSettingsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [pending, setPending] = useState<PendingInvitation[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [authorityName, setAuthorityName] = useState('')
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState('')

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AuthorityStaffRole>('qio')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ joinUrl?: string; error?: string } | null>(null)

  const loadStaff = useCallback(async () => {
    const res = await fetch('/api/authority/staff')
    if (!res.ok) {
      const d = await res.json()
      setAccessError(d.error ?? 'Access denied.')
      setLoading(false)
      return
    }
    const d = await res.json()
    setStaff(d.staff ?? [])
    setPending(d.pendingInvitations ?? [])
    setIsAdmin(d.isAdmin ?? false)
    setAuthorityName(d.authorityName ?? '')
    setLoading(false)
  }, [])

  useEffect(() => { loadStaff() }, [loadStaff])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteResult(null)
    const res = await fetch('/api/authority/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    const d = await res.json()
    setInviting(false)
    if (!res.ok) {
      setInviteResult({ error: d.error ?? 'Could not send invitation.' })
      return
    }
    setInviteResult({ joinUrl: d.joinUrl })
    setInviteEmail('')
    loadStaff()
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
  const roleTag: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '99px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '48px 16px' }}>
        <div className="pf-container"><p style={{ color: '#64748b' }}>Loading…</p></div>
      </main>
    )
  }

  if (accessError) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '48px 16px' }}>
        <div className="pf-container">
          <p style={{ color: '#dc2626' }}>{accessError}</p>
          <Link href="/authority/dashboard" style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.875rem' }}>← Dashboard</Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 0' }}>
        <div className="pf-container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/authority/dashboard" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>← Dashboard</Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#1a1a2e' }}>
            Staff — {authorityName}
          </span>
        </div>
      </div>

      <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '860px' }}>
        {/* Invite form (admins only) */}
        {isAdmin && (
          <div style={card}>
            <h2 style={sectionHead}>Invite a team member</h2>
            <form onSubmit={handleInvite} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle} htmlFor="inviteEmail">Email address</label>
                <input
                  id="inviteEmail"
                  type="email"
                  required
                  style={inputStyle}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@council.gov.uk"
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="inviteRole">Role</label>
                <select
                  id="inviteRole"
                  style={{ ...inputStyle, backgroundColor: '#fff' }}
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AuthorityStaffRole)}
                >
                  {AUTHORITY_ROLES.filter((r) => r !== 'la_admin').map((r) => (
                    <option key={r} value={r}>{AUTHORITY_ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={inviting}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--pf-blue-700, #1d4ed8)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  whiteSpace: 'nowrap',
                }}
              >
                {inviting ? 'Sending…' : 'Send invite'}
              </button>
            </form>
            {inviteResult?.error && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '12px' }}>{inviteResult.error}</p>
            )}
            {inviteResult?.joinUrl && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginTop: '12px' }}>
                <p style={{ color: '#166534', margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Invitation sent.</p>
                <p style={{ color: '#166534', margin: '4px 0 0', fontSize: '0.8125rem' }}>
                  Share this link if the email does not arrive:{' '}
                  <code style={{ wordBreak: 'break-all' }}>{inviteResult.joinUrl}</code>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pending invitations */}
        {pending.length > 0 && (
          <div style={card}>
            <h2 style={sectionHead}>Pending invitations</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  {['Email', 'Role', 'Expires'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', color: '#374151' }}>{inv.email}</td>
                    <td style={{ padding: '10px 12px' }}><span style={roleTag}>{AUTHORITY_ROLE_LABELS[inv.role]}</span></td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>
                      {new Date(inv.expires_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Staff list */}
        <div style={card}>
          <h2 style={sectionHead}>Current team ({staff.length})</h2>
          {staff.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No staff members yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  {['Name', 'Email', 'Role', 'Last active'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', color: '#1a1a2e', fontWeight: 500 }}>{s.full_name}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{s.email}</td>
                    <td style={{ padding: '10px 12px' }}><span style={roleTag}>{AUTHORITY_ROLE_LABELS[s.role]}</span></td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                      {s.last_active_at
                        ? new Date(s.last_active_at).toLocaleDateString('en-GB')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
