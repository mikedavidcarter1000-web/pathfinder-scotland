'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ALERT_SEVERITY_COLOURS,
  ALERT_TYPES,
  ALERT_TYPE_LABELS,
  type AlertSeverity,
  type AlertType,
} from '@/lib/authority/alerts'

type AlertRow = {
  id: string
  alert_type: AlertType
  school_id: string | null
  school_name: string | null
  severity: AlertSeverity
  title: string
  detail: Record<string, unknown> | null
  acknowledged: boolean
  acknowledged_at: string | null
  created_at: string
}

const SEVERITIES: AlertSeverity[] = ['info', 'warning', 'critical']

type Props = {
  schoolOptions: Array<{ id: string; name: string }>
}

const PAGE_SIZE = 20

export function AlertsCentreClient({ schoolOptions }: Props) {
  const [alerts, setAlerts] = useState<AlertRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  // Filters
  const [type, setType] = useState<AlertType | ''>('')
  const [severity, setSeverity] = useState<AlertSeverity | ''>('')
  const [ack, setAck] = useState<'all' | 'acknowledged' | 'unacknowledged'>('unacknowledged')
  const [schoolId, setSchoolId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const queryString = useMemo(() => {
    const sp = new URLSearchParams()
    if (type) sp.set('type', type)
    if (severity) sp.set('severity', severity)
    if (ack === 'acknowledged') sp.set('acknowledged', 'true')
    else if (ack === 'unacknowledged') sp.set('acknowledged', 'false')
    if (schoolId) sp.set('school_id', schoolId)
    if (from) sp.set('from', from)
    if (to) sp.set('to', to)
    sp.set('page', String(page))
    sp.set('limit', String(PAGE_SIZE))
    return sp.toString()
  }, [type, severity, ack, schoolId, from, to, page])

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await fetch(`/api/authority/alerts?${queryString}`, { cache: 'no-store' })
      if (!resp.ok) {
        setAlerts([])
        setTotal(0)
        return
      }
      const data = (await resp.json()) as { alerts?: AlertRow[]; total?: number }
      setAlerts(data.alerts ?? [])
      setTotal(data.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  async function acknowledge(id: string) {
    setBusy(true)
    try {
      await fetch(`/api/authority/alerts/${id}/acknowledge`, { method: 'PATCH' })
      await fetchAlerts()
    } finally {
      setBusy(false)
    }
  }

  async function acknowledgeAll() {
    if (!confirm('Acknowledge all unacknowledged alerts?')) return
    setBusy(true)
    try {
      await fetch('/api/authority/alerts/acknowledge-all', { method: 'POST' })
      await fetchAlerts()
    } finally {
      setBusy(false)
    }
  }

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <section
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <Field label="Type">
            <select value={type} onChange={(e) => { setPage(1); setType(e.target.value as AlertType | '') }} style={selectStyle}>
              <option value="">All types</option>
              {ALERT_TYPES.map((t) => (
                <option key={t} value={t}>{ALERT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="Severity">
            <select value={severity} onChange={(e) => { setPage(1); setSeverity(e.target.value as AlertSeverity | '') }} style={selectStyle}>
              <option value="">All severities</option>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={ack} onChange={(e) => { setPage(1); setAck(e.target.value as 'all' | 'acknowledged' | 'unacknowledged') }} style={selectStyle}>
              <option value="unacknowledged">Unacknowledged</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="all">All</option>
            </select>
          </Field>
          <Field label="School">
            <select value={schoolId} onChange={(e) => { setPage(1); setSchoolId(e.target.value) }} style={selectStyle}>
              <option value="">All schools</option>
              {schoolOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="From">
            <input type="date" value={from} onChange={(e) => { setPage(1); setFrom(e.target.value) }} style={selectStyle} />
          </Field>
          <Field label="To">
            <input type="date" value={to} onChange={(e) => { setPage(1); setTo(e.target.value) }} style={selectStyle} />
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>{total} alert{total === 1 ? '' : 's'}</span>
          <button
            type="button"
            onClick={acknowledgeAll}
            disabled={busy || total === 0 || ack === 'acknowledged'}
            style={{
              padding: '8px 14px',
              background: total === 0 || ack === 'acknowledged' ? '#cbd5e1' : '#1B3A5C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: total === 0 || ack === 'acknowledged' ? 'not-allowed' : 'pointer',
            }}
          >
            Acknowledge all
          </button>
        </div>
      </section>

      <section style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {loading && (
          <div style={{ padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>Loading…</div>
        )}
        {!loading && alerts.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
            No alerts match your filters.
          </div>
        )}
        {!loading && alerts.map((a) => {
          const colour = ALERT_SEVERITY_COLOURS[a.severity]
          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 18px',
                borderBottom: '1px solid #f1f3f5',
                borderLeft: `3px solid ${colour.fg}`,
                background: a.acknowledged ? '#fafafa' : '#fff',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: colour.fg,
                      background: colour.bg,
                      border: `1px solid ${colour.border}`,
                      padding: '1px 6px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                    }}
                  >
                    {a.severity}
                  </span>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{ALERT_TYPE_LABELS[a.alert_type]}</span>
                  {a.school_name && <span style={{ fontSize: 12, color: '#6b7280' }}>· {a.school_name}</span>}
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>· {new Date(a.created_at).toLocaleString('en-GB')}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{a.title}</div>
                {a.detail && Object.keys(a.detail).length > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ fontSize: 12, color: '#1D4ED8', cursor: 'pointer' }}>Detail</summary>
                    <pre
                      style={{
                        background: '#f8fafc',
                        padding: 10,
                        borderRadius: 4,
                        fontSize: 11,
                        overflowX: 'auto',
                        marginTop: 6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {JSON.stringify(a.detail, null, 2)}
                    </pre>
                  </details>
                )}
                {a.acknowledged && a.acknowledged_at && (
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                    Acknowledged {new Date(a.acknowledged_at).toLocaleString('en-GB')}
                  </div>
                )}
              </div>
              {!a.acknowledged && (
                <button
                  type="button"
                  onClick={() => acknowledge(a.id)}
                  disabled={busy}
                  style={{
                    flexShrink: 0,
                    padding: '6px 12px',
                    background: '#fff',
                    color: '#1B3A5C',
                    border: '1px solid #1B3A5C',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Acknowledge
                </button>
              )}
            </div>
          )
        })}
        {!loading && total > PAGE_SIZE && (
          <div style={{ padding: 12, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={pagerButtonStyle}
            >
              Previous
            </button>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Page {page} of {lastPage}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              style={pagerButtonStyle}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  fontSize: 13,
  background: '#fff',
}
const pagerButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
        {label}
      </span>
      {children}
    </label>
  )
}
