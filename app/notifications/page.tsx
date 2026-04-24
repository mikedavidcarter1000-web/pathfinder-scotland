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
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
] as const
type TabKey = (typeof TABS)[number]['key']

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [rows, setRows] = useState<NotificationRow[]>([])
  const [tab, setTab] = useState<TabKey>('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const resp = await fetch('/api/notifications?limit=200', { cache: 'no-store' })
    if (resp.ok) {
      const data = (await resp.json()) as { notifications: NotificationRow[] }
      setRows(data.notifications ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/notifications')
      return
    }
    load()
  }, [authLoading, user, router, load])

  const filtered = useMemo(() => {
    if (tab === 'unread') return rows.filter((r) => !r.read_by?.includes(user?.id ?? ''))
    return rows
  }, [rows, tab, user])

  async function markRead(id: string) {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notification_id: id }),
    })
    if (user) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, read_by: [...(r.read_by ?? []), user.id] } : r))
      )
    }
  }

  async function markAll() {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    if (user) setRows((prev) => prev.map((r) => ({ ...r, read_by: [...(r.read_by ?? []), user.id] })))
  }

  if (authLoading || loading) {
    return (
      <div className="pf-container pt-8 pb-12">
        <p>Loading notifications…</p>
      </div>
    )
  }

  const unread = rows.filter((r) => !r.read_by?.includes(user?.id ?? '')).length

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Notifications</h1>
        {unread > 0 && (
          <button type="button" onClick={markAll} style={secondaryBtn}>
            Mark all as read ({unread})
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
          <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
            No notifications to show.
          </div>
        )}
        {filtered.map((r) => {
          const isRead = user ? r.read_by?.includes(user.id) : false
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
                    {new Date(r.created_at).toLocaleString('en-GB')} · {r.notification_type.replace(/_/g, ' ')}
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
