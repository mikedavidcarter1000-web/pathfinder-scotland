'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'
import { SubmitButton } from '@/components/ui/submit-button'
import { SCOTTISH_LOCAL_AUTHORITIES, STAFF_ROLE_LABELS, type SchoolStaffRole } from '@/lib/school/constants'
import type { DashboardMe } from '@/components/school-dashboard/types'
import { BillingSection } from '@/components/school-dashboard/billing-section'

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
  return (
    <Suspense fallback={<div className="pf-container pt-8 pb-12"><p>Loading…</p></div>}>
      <SchoolSettingsInner />
    </Suspense>
  )
}

function SchoolSettingsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  useEffect(() => {
    if (searchParams.get('billing') === 'success') {
      toast.success('Subscription activated', 'Thank you for subscribing to Pathfinder Schools.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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

      <BillingSection />

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

      <TrackingMetricsSection />

      <CommentBankLink />

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

function CommentBankLink() {
  return (
    <section style={card}>
      <h2 style={h2}>Comment bank</h2>
      <p style={{ margin: '6px 0 10px', fontSize: '0.9375rem' }}>
        Manage reusable comment templates used in parent reports and the grade entry grid.
      </p>
      <Link href="/school/tracking/comments" style={{ display: 'inline-block', padding: '8px 14px', background: '#1B3A5C', color: 'white', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
        Open comment bank &rarr;
      </Link>
    </section>
  )
}

type Metric = {
  id: string
  metric_name: string
  metric_key: string
  scale_type: 'rating' | 'yes_no' | 'custom'
  scale_options: string[] | null
  colour_coding: Record<string, string> | null
  applies_to_departments: string[] | null
  sort_order: number
  is_active: boolean
}

function TrackingMetricsSection() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Metric | null>(null)
  const toast = useToast()

  useEffect(() => {
    fetch('/api/school/tracking/metrics')
      .then((r) => r.json())
      .then((d) => setMetrics(d.metrics ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(
    data: Omit<Metric, 'id' | 'is_active' | 'metric_key'> & { metric_key?: string },
    id?: string
  ) {
    const res = id
      ? await fetch(`/api/school/tracking/metrics/${id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        })
      : await fetch('/api/school/tracking/metrics', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        })
    const d = await res.json()
    if (!res.ok) {
      toast.error(d.error ?? 'Save failed.')
      return
    }
    if (id) setMetrics((prev) => prev.map((m) => (m.id === id ? d.metric : m)))
    else setMetrics((prev) => [...prev, d.metric])
    setAdding(false)
    setEditing(null)
  }

  async function toggleActive(m: Metric) {
    const res = await fetch(`/api/school/tracking/metrics/${m.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ is_active: !m.is_active }),
    })
    if (res.ok) {
      const d = await res.json()
      setMetrics((prev) => prev.map((x) => (x.id === m.id ? d.metric : x)))
    }
  }

  return (
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={h2}>Tracking metrics</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
            Custom columns shown in the grade entry grid.
          </p>
        </div>
        <button onClick={() => setAdding(true)} style={{ padding: '6px 12px', background: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>
          Add metric
        </button>
      </div>
      {loading ? (
        <p style={{ opacity: 0.6 }}>Loading metrics…</p>
      ) : metrics.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No custom metrics yet.</p>
      ) : (
        <table style={{ ...tbl, marginTop: 10 }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Scale</th>
              <th style={th}>Options</th>
              <th style={th}>Order</th>
              <th style={th}>Active</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.id}>
                <td style={td}>{m.metric_name}</td>
                <td style={td}>{m.scale_type}</td>
                <td style={td}>{(m.scale_options ?? []).join(', ') || '—'}</td>
                <td style={td}>{m.sort_order}</td>
                <td style={td}>
                  <input type="checkbox" checked={m.is_active} onChange={() => toggleActive(m)} />
                </td>
                <td style={td}>
                  <button onClick={() => setEditing(m)} style={{ padding: '4px 10px', border: '1px solid #cbd5e1', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: '0.75rem' }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(adding || editing) && (
        <MetricEditor
          initial={editing}
          onClose={() => { setAdding(false); setEditing(null) }}
          onSave={(data) => handleSave(data, editing?.id)}
        />
      )}
    </section>
  )
}

function MetricEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: Metric | null
  onClose: () => void
  onSave: (data: {
    metric_name: string
    metric_key?: string
    scale_type: 'rating' | 'yes_no' | 'custom'
    scale_options: string[] | null
    colour_coding: Record<string, string> | null
    applies_to_departments: string[] | null
    sort_order: number
  }) => void
}) {
  const [name, setName] = useState(initial?.metric_name ?? '')
  const [scaleType, setScaleType] = useState<'rating' | 'yes_no' | 'custom'>(initial?.scale_type ?? 'rating')
  const [optsInput, setOptsInput] = useState<string>((initial?.scale_options ?? ['Excellent', 'Good', 'Satisfactory', 'Concern']).join(', '))
  const [coloursInput, setColoursInput] = useState<string>(JSON.stringify(initial?.colour_coding ?? { Excellent: '#22c55e', Good: '#3b82f6', Satisfactory: '#f59e0b', Concern: '#ef4444' }))
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 10)

  function handle(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    let options: string[] | null = null
    if (scaleType === 'rating' || scaleType === 'custom') {
      options = optsInput.split(',').map((s) => s.trim()).filter(Boolean)
    }
    let colours: Record<string, string> | null = null
    try {
      colours = coloursInput.trim() ? JSON.parse(coloursInput) : null
    } catch {
      colours = null
    }
    onSave({
      metric_name: name.trim(),
      scale_type: scaleType,
      scale_options: options,
      colour_coding: colours,
      applies_to_departments: null,
      sort_order: sortOrder,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handle} style={{ background: 'white', borderRadius: 10, padding: 20, width: 'min(90vw, 500px)' }}>
        <h3 style={{ margin: '0 0 12px' }}>{initial ? 'Edit metric' : 'Add metric'}</h3>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.875rem', marginBottom: 10 }}>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }} required />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.875rem', marginBottom: 10 }}>
          Scale type
          <select value={scaleType} onChange={(e) => setScaleType(e.target.value as 'rating' | 'yes_no' | 'custom')} style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }}>
            <option value="rating">Rating</option>
            <option value="yes_no">Yes / No</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {scaleType !== 'yes_no' && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.875rem', marginBottom: 10 }}>
            Options (comma separated)
            <input value={optsInput} onChange={(e) => setOptsInput(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
          </label>
        )}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.875rem', marginBottom: 10 }}>
          Colour coding (JSON)
          <textarea value={coloursInput} onChange={(e) => setColoursInput(e.target.value)} rows={3} style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontFamily: 'monospace', fontSize: '0.8125rem' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.875rem', marginBottom: 16 }}>
          Sort order
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value || '10', 10))} style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
        </label>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, background: 'white', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" style={{ padding: '8px 12px', background: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Save</button>
        </div>
      </form>
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
