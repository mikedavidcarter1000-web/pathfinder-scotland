'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

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

type Audience = 'staff' | 'student' | 'parent'

type Props = {
  audience: Audience
  // The sign-in user id -- used to check read_by membership client-side.
  userId: string | null
  // Override the default /school/notifications or /notifications link.
  viewAllHref?: string
}

const POLL_MS = 60_000

const TYPE_ICONS: Record<string, string> = {
  choice_deadline: '📝',
  tracking_deadline: '📊',
  report_ready: '📄',
  parent_evening_reminder: '🗓️',
  intervention_followup: '✅',
  safeguarding_escalation: '⚠️',
  asn_review_due: '🧩',
  results_available: '🎓',
  booking_confirmation: '👍',
  attendance_alert: '📍',
  bursary_reminder: '💷',
  custom: '🔔',
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.max(0, Math.floor((now - then) / 1000))
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 2) return 'Yesterday'
  if (diffDay < 7) return `${diffDay} days ago`
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB')
}

export function NotificationBell({ audience, userId, viewAllHref }: Props) {
  const [rows, setRows] = useState<NotificationRow[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const listEndpoint = audience === 'staff' ? '/api/school/notifications?limit=20' : '/api/notifications?limit=20'
  const markReadEndpoint = audience === 'staff' ? '/api/school/notifications/mark-read' : '/api/notifications/mark-read'
  const markAllEndpoint = audience === 'staff' ? '/api/school/notifications/mark-all-read' : '/api/notifications/mark-read'
  const viewAll = viewAllHref ?? (audience === 'staff' ? '/school/notifications' : '/notifications')

  const fetchRows = useCallback(async () => {
    try {
      const resp = await fetch(listEndpoint, { cache: 'no-store' })
      if (!resp.ok) return
      const data = (await resp.json()) as { notifications?: NotificationRow[] }
      setRows(data.notifications ?? [])
    } catch {
      // Network errors are silent; next poll will retry.
    }
  }, [listEndpoint])

  useEffect(() => {
    fetchRows()
    const id = setInterval(fetchRows, POLL_MS)
    return () => clearInterval(id)
  }, [fetchRows])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const panel = panelRef.current
      const btn = buttonRef.current
      const target = e.target as Node
      if (panel && !panel.contains(target) && btn && !btn.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const unread = userId ? rows.filter((r) => !r.read_by?.includes(userId)) : rows
  const unreadCount = unread.length

  async function handleMarkRead(id: string) {
    setBusy(true)
    try {
      await fetch(markReadEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ notification_id: id }),
      })
      if (userId) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read_by: [...(r.read_by ?? []), userId] } : r)))
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleMarkAll() {
    setBusy(true)
    try {
      await fetch(markAllEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: audience === 'staff' ? null : JSON.stringify({ all: true }),
      })
      if (userId) {
        setRows((prev) => prev.map((r) => ({ ...r, read_by: [...(r.read_by ?? []), userId] })))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        aria-expanded={open}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 8,
          border: 'none',
          background: 'transparent',
          color: '#1B3A5C',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              borderRadius: 9,
              background: '#DC2626',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          style={{
            position: 'absolute',
            right: 0,
            top: 48,
            width: 360,
            maxWidth: '90vw',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '1px solid #f1f3f5',
            }}
          >
            <strong style={{ fontSize: 14 }}>Notifications</strong>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={busy}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#1D4ED8',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {rows.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                No notifications yet.
              </div>
            )}
            {rows.map((r) => {
              const isRead = userId ? r.read_by?.includes(userId) : false
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    if (!isRead) handleMarkRead(r.id)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderBottom: '1px solid #f8fafc',
                    background: isRead ? '#ffffff' : '#f0f7ff',
                    cursor: isRead ? 'default' : 'pointer',
                    border: 'none',
                    borderLeft: isRead ? '3px solid transparent' : '3px solid #1D4ED8',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }} aria-hidden="true">
                      {TYPE_ICONS[r.notification_type] ?? '🔔'}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: isRead ? 500 : 700,
                          fontSize: 14,
                          color: '#111827',
                          marginBottom: 2,
                          wordBreak: 'break-word',
                        }}
                      >
                        {r.title}
                      </div>
                      <div
                        style={{
                          color: '#4b5563',
                          fontSize: 13,
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {r.body.slice(0, 120)}
                        {r.body.length > 120 ? '…' : ''}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                        {relativeTime(r.created_at)}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ padding: '8px 14px', borderTop: '1px solid #f1f3f5', textAlign: 'center' }}>
            <Link href={viewAll} onClick={() => setOpen(false)} style={{ fontSize: 13, color: '#1D4ED8' }}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
