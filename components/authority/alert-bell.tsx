'use client'

// Authority-13: alert bell for the LA portal. Polls /api/authority/alerts
// every 60s for unacknowledged alerts and shows a count badge + dropdown
// preview. Mirrors the school NotificationBell behaviour for consistency.

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ALERT_SEVERITY_COLOURS, ALERT_TYPE_LABELS, type AlertSeverity, type AlertType } from '@/lib/authority/alerts'

type AlertRow = {
  id: string
  alert_type: AlertType
  school_id: string | null
  school_name: string | null
  severity: AlertSeverity
  title: string
  acknowledged: boolean
  created_at: string
}

const POLL_MS = 60_000

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(iso).toLocaleDateString('en-GB')
}

export function AuthorityAlertBell() {
  const [rows, setRows] = useState<AlertRow[]>([])
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const fetchRows = useCallback(async () => {
    try {
      const resp = await fetch('/api/authority/alerts?acknowledged=false&limit=5', { cache: 'no-store' })
      if (!resp.ok) return
      const data = (await resp.json()) as { alerts?: AlertRow[] }
      setRows(data.alerts ?? [])
    } catch {
      // Network errors are silent; next poll retries.
    }
  }, [])

  useEffect(() => {
    // Initial fetch happens after mount; setInterval handles ongoing polling.
    void fetchRows()
    const id = setInterval(() => {
      void fetchRows()
    }, POLL_MS)
    return () => clearInterval(id)
  }, [fetchRows])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const panel = panelRef.current
      const btn = buttonRef.current
      const target = e.target as Node
      if (panel && !panel.contains(target) && btn && !btn.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const unreadCount = rows.length

  return (
    <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 1000 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Alerts (${unreadCount} unacknowledged)` : 'Alerts'}
        aria-expanded={open}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          background: '#fff',
          color: '#1B3A5C',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
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
          aria-label="Authority alerts"
          style={{
            position: 'absolute',
            right: 0,
            top: 48,
            width: 380,
            maxWidth: '90vw',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
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
            <strong style={{ fontSize: 14 }}>Alerts</strong>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{unreadCount} unacknowledged</span>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {rows.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                No new alerts. All clear.
              </div>
            )}
            {rows.map((r) => {
              const colour = ALERT_SEVERITY_COLOURS[r.severity]
              return (
                <Link
                  key={r.id}
                  href="/authority/alerts"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderBottom: '1px solid #f8fafc',
                    color: '#111827',
                    textDecoration: 'none',
                    borderLeft: `3px solid ${colour.fg}`,
                    background: '#fff',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 700,
                      color: colour.fg,
                      background: colour.bg,
                      border: `1px solid ${colour.border}`,
                      padding: '1px 6px',
                      borderRadius: 4,
                      marginBottom: 4,
                      textTransform: 'uppercase',
                    }}
                  >
                    {r.severity}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {ALERT_TYPE_LABELS[r.alert_type]} · {relativeTime(r.created_at)}
                  </div>
                </Link>
              )
            })}
          </div>
          <div style={{ padding: '8px 14px', borderTop: '1px solid #f1f3f5', textAlign: 'center' }}>
            <Link href="/authority/alerts" onClick={() => setOpen(false)} style={{ fontSize: 13, color: '#1D4ED8' }}>
              View all alerts
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
