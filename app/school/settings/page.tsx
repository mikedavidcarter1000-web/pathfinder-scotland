'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'
import { SubmitButton } from '@/components/ui/submit-button'
import { SCOTTISH_LOCAL_AUTHORITIES, STAFF_ROLE_LABELS, type SchoolStaffRole } from '@/lib/school/constants'
import type { DashboardMe } from '@/components/school-dashboard/types'

type StaffRow = {
  id: string
  user_id: string
  full_name: string
  email: string
  role: string
  is_school_admin: boolean
  can_view_individual_students: boolean
}

const INVITE_ROLES: SchoolStaffRole[] = [
  'guidance_teacher',
  'pt_guidance',
  'dyw_coordinator',
  'depute',
  'head_teacher',
  'admin',
]

export default function SchoolSettingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [me, setMe] = useState<DashboardMe | null>(null)
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)

  const [schoolName, setSchoolName] = useState('')
  const [postcode, setPostcode] = useState('')
  const [localAuthority, setLocalAuthority] = useState('')
  const [savingSchool, setSavingSchool] = useState(false)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<SchoolStaffRole>('guidance_teacher')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/settings')
      return
    }
    Promise.all([
      fetch('/api/school/me').then((r) => r.json()),
      fetch('/api/school/staff').then((r) => r.json()),
    ])
      .then(([m, s]) => {
        if (m?.school) {
          setMe(m)
          setSchoolName(m.school.name)
          setPostcode(m.school.postcode ?? '')
          setLocalAuthority(m.school.local_authority ?? '')
        } else {
          router.replace('/school/register')
        }
        setStaff(s.staff ?? [])
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  if (loading || !me || !me.school) {
    return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  }

  if (!me.staff.isAdmin) {
    return (
      <div className="pf-container pt-8 pb-12">
        <p>School admin access only. <Link href="/school/dashboard">Back to dashboard</Link>.</p>
      </div>
    )
  }

  async function saveSchool(e: React.FormEvent) {
    e.preventDefault()
    setSavingSchool(true)
    try {
      const res = await fetch('/api/school/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: schoolName, postcode, localAuthority }),
      })
      if (res.ok) toast.success('Saved', 'School details updated.')
      else toast.error('Could not save', '')
    } finally {
      setSavingSchool(false)
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/school/invite-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const json = await res.json()
      if (res.ok) {
        toast.success(json.sent ? 'Invite sent' : 'Invite link ready', json.inviteUrl ? `Share: ${json.inviteUrl}` : '')
        setInviteEmail('')
      } else {
        toast.error('Could not invite', json.error || '')
      }
    } finally {
      setSending(false)
    }
  }

  async function togglePermission(row: StaffRow, field: 'can_view_individual_students' | 'is_school_admin') {
    const body =
      field === 'can_view_individual_students'
        ? { canViewIndividualStudents: !row.can_view_individual_students }
        : { isSchoolAdmin: !row.is_school_admin }
    const res = await fetch(`/api/school/staff/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setStaff((prev) =>
        prev.map((s) => (s.id === row.id ? { ...s, [field]: !s[field] } : s))
      )
    }
  }

  async function removeStaff(row: StaffRow) {
    if (!confirm(`Remove ${row.full_name || row.email}?`)) return
    const res = await fetch(`/api/school/staff/${row.id}`, { method: 'DELETE' })
    if (res.ok) setStaff((prev) => prev.filter((s) => s.id !== row.id))
  }

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '900px' }}>
      <Link href="/school/dashboard" style={{ fontSize: '0.875rem', color: 'var(--pf-blue-700)' }}>&larr; Dashboard</Link>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem', marginTop: '12px' }}>Settings</h1>

      <section style={card}>
        <h2 style={h2}>School details</h2>
        <form onSubmit={saveSchool} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={label}>
            <span>School name</span>
            <input style={input} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
          </label>
          <label style={label}>
            <span>Postcode</span>
            <input style={input} value={postcode} onChange={(e) => setPostcode(e.target.value)} />
          </label>
          <label style={label}>
            <span>Local authority</span>
            <select style={input} value={localAuthority} onChange={(e) => setLocalAuthority(e.target.value)}>
              <option value="">Select...</option>
              {SCOTTISH_LOCAL_AUTHORITIES.map((la) => <option key={la} value={la}>{la}</option>)}
            </select>
          </label>
          <SubmitButton isLoading={savingSchool}>Save</SubmitButton>
        </form>
      </section>

      <section style={card}>
        <h2 style={h2}>Join code</h2>
        <p style={{ margin: '6px 0 0', fontSize: '0.9375rem' }}>
          Share this code with your students so they can link their Pathfinder accounts:
        </p>
        <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, padding: '12px 16px', backgroundColor: 'var(--pf-grey-50)', border: '1px solid var(--pf-grey-200)', borderRadius: '6px', marginTop: '8px', display: 'inline-block' }}>
          {me.joinCode?.code ?? '—'}
        </div>
      </section>

      <section style={card}>
        <h2 style={h2}>Invite colleagues</h2>
        <form onSubmit={sendInvite} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="colleague@school.edu"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ ...input, flex: '1 1 220px' }}
            required
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as SchoolStaffRole)} style={input}>
            {INVITE_ROLES.map((r) => <option key={r} value={r}>{STAFF_ROLE_LABELS[r]}</option>)}
          </select>
          <SubmitButton isLoading={sending}>Send invite</SubmitButton>
        </form>
      </section>

      <section style={card}>
        <h2 style={h2}>Staff ({staff.length})</h2>
        <table style={tbl}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Role</th>
              <th style={th}>Individual view</th>
              <th style={th}>Admin</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td style={td}>
                  <div>{s.full_name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{s.email}</div>
                </td>
                <td style={td}>{STAFF_ROLE_LABELS[s.role as SchoolStaffRole] || s.role}</td>
                <td style={td}>
                  <label style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={s.can_view_individual_students} onChange={() => togglePermission(s, 'can_view_individual_students')} />
                  </label>
                </td>
                <td style={td}>
                  <label style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={s.is_school_admin} onChange={() => togglePermission(s, 'is_school_admin')} />
                  </label>
                </td>
                <td style={td}>
                  {s.user_id !== me.staff.userId && (
                    <button onClick={() => removeStaff(s)} style={dangerBtn}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: '8px',
  padding: '16px 20px',
  marginTop: '16px',
}
const h2: React.CSSProperties = { margin: '0 0 10px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem' }
const label: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', fontWeight: 600 }
const input: React.CSSProperties = { padding: '8px 12px', border: '1px solid var(--pf-grey-300)', borderRadius: '6px', fontSize: '0.9375rem', fontWeight: 400 }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid var(--pf-grey-200)', fontWeight: 700 }
const td: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid var(--pf-grey-100)' }
const dangerBtn: React.CSSProperties = { padding: '4px 10px', border: '1px solid #DC2626', color: '#DC2626', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem' }
