'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type NotificationRow = {
  id: string
  school_id: string
  notification_type: string
  title: string
  body: string
  channel: string
  sent_at: string | null
  created_at: string
  read_by: string[]
  target_role: string | null
}

type TabKey =
  | 'all'
  | 'unread'
  | 'choices'
  | 'tracking'
  | 'parent_evening'
  | 'guidance'
  | 'custom'

const TABS: { key: TabKey; label: string; types?: string[] }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'choices', label: 'Choices', types: ['choice_deadline'] },
  { key: 'tracking', label: 'Tracking', types: ['tracking_deadline', 'report_ready'] },
  {
    key: 'parent_evening',
    label: "Parents' Evening",
    types: ['parent_evening_reminder', 'booking_confirmation'],
  },
  {
    key: 'guidance',
    label: 'Guidance',
    types: [
      'intervention_followup',
      'safeguarding_escalation',
      'asn_review_due',
      'attendance_alert',
      'bursary_reminder',
    ],
  },
  { key: 'custom', label: 'Custom', types: ['custom'] },
]

const YEAR_GROUPS = ['s1', 's2', 's3', 's4', 's5', 's6']

type StaffRow = { id: string; full_name: string; role: string }

export default function SchoolNotificationsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [me, setMe] = useState<null | {
    staff: { userId: string; staffId: string; role: string; isAdmin: boolean; fullName: string }
  }>(null)
  const [rows, setRows] = useState<NotificationRow[]>([])
  const [tab, setTab] = useState<TabKey>('all')
  const [loading, setLoading] = useState(true)
  const [showBulk, setShowBulk] = useState(false)
  const [staffList, setStaffList] = useState<StaffRow[]>([])

  const loadRows = useCallback(async () => {
    const resp = await fetch('/api/school/notifications?limit=200', { cache: 'no-store' })
    if (resp.ok) {
      const data = (await resp.json()) as { notifications: NotificationRow[] }
      setRows(data.notifications ?? [])
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/notifications')
      return
    }
    Promise.all([
      fetch('/api/school/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/school/notifications?limit=200').then((r) => (r.ok ? r.json() : { notifications: [] })),
    ]).then(([meData, notifData]) => {
      if (meData) setMe(meData)
      setRows(notifData?.notifications ?? [])
      setLoading(false)
    })
  }, [authLoading, user, router])

  const userId = me?.staff.userId ?? null
  const isLeadership = !!me && (me.staff.isAdmin || me.staff.role === 'depute' || me.staff.role === 'head_teacher')

  const filtered = useMemo(() => {
    const current = TABS.find((t) => t.key === tab)
    if (!current) return rows
    if (tab === 'all') return rows
    if (tab === 'unread') {
      return rows.filter((r) => !r.read_by?.includes(userId ?? ''))
    }
    if (current.types) {
      const set = new Set(current.types)
      return rows.filter((r) => set.has(r.notification_type))
    }
    return rows
  }, [rows, tab, userId])

  async function markRead(id: string) {
    await fetch('/api/school/notifications/mark-read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notification_id: id }),
    })
    if (userId) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, read_by: [...(r.read_by ?? []), userId] } : r))
      )
    }
  }

  async function markAll() {
    await fetch('/api/school/notifications/mark-all-read', { method: 'POST' })
    if (userId) {
      setRows((prev) => prev.map((r) => ({ ...r, read_by: [...(r.read_by ?? []), userId] })))
    }
  }

  async function loadStaffList() {
    const resp = await fetch('/api/school/staff', { cache: 'no-store' })
    if (resp.ok) {
      const data = (await resp.json()) as { staff?: StaffRow[] }
      setStaffList(data.staff ?? [])
    }
  }

  if (authLoading || loading) {
    return (
      <div className="pf-container pt-8 pb-12">
        <p>Loading notifications…</p>
      </div>
    )
  }
  if (!me) return null

  const unreadCount = rows.filter((r) => !r.read_by?.includes(userId ?? '')).length

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Notifications</h1>
        {unreadCount > 0 && (
          <button type="button" onClick={markAll} style={secondaryBtn}>
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div role="tablist" style={tabStrip}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            style={{ ...tabBtn, ...(tab === t.key ? tabActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No notifications in this tab.</div>
        )}
        {filtered.map((r) => {
          const isRead = userId ? r.read_by?.includes(userId) : false
          return (
            <div
              key={r.id}
              style={{
                padding: 14,
                borderBottom: '1px solid #f1f3f5',
                background: isRead ? '#fff' : '#f0f7ff',
                borderLeft: isRead ? '4px solid transparent' : '4px solid #1D4ED8',
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: isRead ? 500 : 700, fontSize: 15, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#374151', marginBottom: 4 }}>
                    {r.body}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    {new Date(r.created_at).toLocaleString('en-GB')} · {r.notification_type.replace(/_/g, ' ')} ·
                    channel {r.channel}
                  </div>
                </div>
                {!isRead && (
                  <button type="button" onClick={() => markRead(r.id)} style={linkBtn}>
                    Mark read
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isLeadership && (
        <div style={{ marginTop: 32, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Send a message</h2>
            <button
              type="button"
              onClick={() => {
                setShowBulk((v) => !v)
                if (!showBulk && staffList.length === 0) loadStaffList()
              }}
              style={primaryBtn}
            >
              {showBulk ? 'Close' : 'New message'}
            </button>
          </div>
          {showBulk && <BulkMessageForm staffList={staffList} onSent={loadRows} />}
          {!showBulk && (
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              Leadership can send notifications to staff, parents, or students. Emails go out via Resend using the
              branded template.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function BulkMessageForm({
  staffList,
  onSent,
}: {
  staffList: StaffRow[]
  onSent: () => void
}) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [channel, setChannel] = useState<'in_app' | 'email' | 'both'>('in_app')
  const [kind, setKind] = useState<string>('all_staff')
  const [value, setValue] = useState<string>('')
  const [ids, setIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [needsConfirm, setNeedsConfirm] = useState(false)

  async function send(confirm = false) {
    setStatus(null)
    if (!title.trim() || !body.trim()) {
      setStatus('Title and body required.')
      return
    }
    if (!confirm) {
      // Rough preview count only -- real count is server-side.
      if (channel !== 'in_app') {
        if (kind === 'all_staff' && staffList.length > 200) {
          setNeedsConfirm(true)
          return
        }
      }
    }
    setBusy(true)
    try {
      const resp = await fetch('/api/school/notifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          channel,
          recipients: { kind, value: value || undefined, ids },
        }),
      })
      if (resp.ok) {
        const data = (await resp.json()) as {
          recipient_count: number
          emails_sent: number
          emails_failed: number
        }
        setStatus(
          `Sent to ${data.recipient_count} recipient${data.recipient_count === 1 ? '' : 's'}. ` +
            (channel !== 'in_app' ? `Emails: ${data.emails_sent} sent, ${data.emails_failed} failed.` : '')
        )
        setTitle('')
        setBody('')
        setNeedsConfirm(false)
        onSent()
      } else {
        const err = await resp.json().catch(() => ({ error: 'Send failed' }))
        setStatus(err.error ?? 'Send failed')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <label style={label}>
        <span style={labelText}>Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} style={input} />
      </label>
      <label style={label}>
        <span style={labelText}>Message</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={5000} style={textarea} />
      </label>
      <label style={label}>
        <span style={labelText}>Recipients</span>
        <select value={kind} onChange={(e) => setKind(e.target.value)} style={input}>
          <option value="all_staff">All staff</option>
          <option value="year_group_parents">All parents in year group</option>
          <option value="year_group_students">All students in year group</option>
          <option value="specific_staff">Specific staff</option>
          <option value="role">All staff with role</option>
        </select>
      </label>
      {(kind === 'year_group_parents' || kind === 'year_group_students') && (
        <label style={label}>
          <span style={labelText}>Year group</span>
          <select value={value} onChange={(e) => setValue(e.target.value)} style={input}>
            <option value="">-- pick --</option>
            {YEAR_GROUPS.map((y) => (
              <option key={y} value={y}>
                {y.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      )}
      {kind === 'role' && (
        <label style={label}>
          <span style={labelText}>Role</span>
          <select value={value} onChange={(e) => setValue(e.target.value)} style={input}>
            <option value="">-- pick --</option>
            <option value="class_teacher">Class teacher</option>
            <option value="faculty_head">Faculty head</option>
            <option value="guidance_teacher">Guidance teacher</option>
            <option value="pt_guidance">PT Guidance</option>
            <option value="dyw_coordinator">DYW Coordinator</option>
            <option value="depute">Depute</option>
            <option value="head_teacher">Head teacher</option>
          </select>
        </label>
      )}
      {kind === 'specific_staff' && (
        <label style={label}>
          <span style={labelText}>Staff (Ctrl/Cmd-click to pick multiple)</span>
          <select
            multiple
            size={Math.min(8, Math.max(3, staffList.length))}
            value={ids}
            onChange={(e) => setIds(Array.from(e.target.selectedOptions).map((o) => o.value))}
            style={{ ...input, height: 'auto', minHeight: 80 }}
          >
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.role})
              </option>
            ))}
          </select>
        </label>
      )}
      <label style={label}>
        <span style={labelText}>Channel</span>
        <select value={channel} onChange={(e) => setChannel(e.target.value as 'in_app' | 'email' | 'both')} style={input}>
          <option value="in_app">In-app only</option>
          <option value="email">Email only</option>
          <option value="both">Both</option>
        </select>
      </label>
      {needsConfirm && (
        <div style={{ padding: 8, background: '#fef3c7', borderRadius: 4, fontSize: 13 }}>
          This will send a high volume of emails. Confirm to proceed.
        </div>
      )}
      {status && <div style={{ fontSize: 13 }}>{status}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => send(needsConfirm)} disabled={busy} style={primaryBtn}>
          {busy ? 'Sending…' : needsConfirm ? 'Confirm & send' : 'Send'}
        </button>
      </div>
    </div>
  )
}

const tabStrip: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  borderBottom: '2px solid #e5e7eb',
  overflowX: 'auto',
}
const tabBtn: React.CSSProperties = {
  padding: '8px 12px',
  border: 'none',
  borderBottom: '2px solid transparent',
  marginBottom: -2,
  background: 'transparent',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  color: '#4b5563',
  whiteSpace: 'nowrap',
}
const tabActive: React.CSSProperties = {
  borderBottomColor: '#1D4ED8',
  color: '#1D4ED8',
}
const primaryBtn: React.CSSProperties = {
  padding: '8px 14px',
  background: '#1D4ED8',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
}
const secondaryBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: '#fff',
  color: '#1B3A5C',
  border: '1px solid #c5d6ec',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
}
const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#1D4ED8',
  cursor: 'pointer',
  fontSize: 12,
  textDecoration: 'underline',
}
const label: React.CSSProperties = { display: 'flex', flexDirection: 'column' as const }
const labelText: React.CSSProperties = { fontSize: 13, fontWeight: 500, marginBottom: 4 }
const input: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #d0d5dd',
  borderRadius: 4,
  fontSize: 14,
}
const textarea: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #d0d5dd',
  borderRadius: 4,
  fontSize: 14,
  fontFamily: 'inherit',
}
