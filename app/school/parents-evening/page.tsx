'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'

type Evening = {
  id: string
  name: string
  event_date: string
  status: 'draft' | 'open' | 'closed' | 'completed'
  slot_duration_minutes: number
  break_between_slots_minutes: number
  earliest_slot: string
  latest_slot: string
  booking_opens_at: string | null
  booking_closes_at: string | null
  bookings_count: number
}

const STATUS_LABEL: Record<Evening['status'], { label: string; colour: string }> = {
  draft: { label: 'Draft', colour: '#6b7280' },
  open: { label: 'Open', colour: '#059669' },
  closed: { label: 'Closed', colour: '#b45309' },
  completed: { label: 'Completed', colour: '#4338ca' },
}

export default function ParentsEveningListPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const [evenings, setEvenings] = useState<Evening[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    event_date: '',
    earliest_slot: '16:30',
    latest_slot: '20:30',
    slot_duration_minutes: 5,
    break_between_slots_minutes: 1,
    booking_opens_at: '',
    booking_closes_at: '',
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/parents-evening')
      return
    }
    refresh()
  }, [authLoading, user, router])

  async function refresh() {
    setLoading(true)
    const res = await fetch('/api/school/parents-evening')
    const d = await res.json()
    setEvenings(d.evenings ?? [])
    setLoading(false)
  }

  async function create() {
    if (!form.name.trim() || !form.event_date) {
      toast.error('Name and date required.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/school/parents-evening', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slot_duration_minutes: Number(form.slot_duration_minutes),
          break_between_slots_minutes: Number(form.break_between_slots_minutes),
          booking_opens_at: form.booking_opens_at ? new Date(form.booking_opens_at).toISOString() : null,
          booking_closes_at: form.booking_closes_at ? new Date(form.booking_closes_at).toISOString() : null,
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error ?? 'Could not create.')
        return
      }
      toast.success('Parent evening created.')
      setCreating(false)
      setForm({ name: '', event_date: '', earliest_slot: '16:30', latest_slot: '20:30', slot_duration_minutes: 5, break_between_slots_minutes: 1, booking_opens_at: '', booking_closes_at: '' })
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/school/dashboard" style={{ fontSize: '0.875rem' }}>&larr; Dashboard</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem' }}>Parents&apos; evenings</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>Create events, set staff availability, and manage parent bookings.</p>
        </div>
        <button onClick={() => setCreating(!creating)} style={btnPrimary}>{creating ? 'Close' : 'New evening'}</button>
      </div>

      {creating && (
        <section style={{ ...card, background: '#f8fafc' }}>
          <h2 style={h2}>New parents&apos; evening</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            <label style={lab}>Name
              <input style={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="S4 parents' evening" />
            </label>
            <label style={lab}>Date
              <input type="date" style={inp} value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            </label>
            <label style={lab}>Earliest slot
              <input type="time" style={inp} value={form.earliest_slot} onChange={(e) => setForm({ ...form, earliest_slot: e.target.value })} />
            </label>
            <label style={lab}>Latest slot
              <input type="time" style={inp} value={form.latest_slot} onChange={(e) => setForm({ ...form, latest_slot: e.target.value })} />
            </label>
            <label style={lab}>Slot duration (min)
              <select style={inp} value={form.slot_duration_minutes} onChange={(e) => setForm({ ...form, slot_duration_minutes: Number(e.target.value) })}>
                <option value={5}>5</option>
                <option value={7}>7</option>
                <option value={10}>10</option>
              </select>
            </label>
            <label style={lab}>Break between slots (min)
              <select style={inp} value={form.break_between_slots_minutes} onChange={(e) => setForm({ ...form, break_between_slots_minutes: Number(e.target.value) })}>
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </label>
            <label style={lab}>Booking opens
              <input type="datetime-local" style={inp} value={form.booking_opens_at} onChange={(e) => setForm({ ...form, booking_opens_at: e.target.value })} />
            </label>
            <label style={lab}>Booking closes
              <input type="datetime-local" style={inp} value={form.booking_closes_at} onChange={(e) => setForm({ ...form, booking_closes_at: e.target.value })} />
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={create} disabled={saving} style={btnPrimary}>{saving ? 'Creating…' : 'Create evening'}</button>
          </div>
        </section>
      )}

      <section style={card}>
        {evenings.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No parents&apos; evenings scheduled yet.</p>
        ) : (
          <table style={tbl}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Date</th>
                <th style={th}>Slot</th>
                <th style={th}>Status</th>
                <th style={th}>Bookings</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {evenings.map((e) => {
                const status = STATUS_LABEL[e.status]
                return (
                  <tr key={e.id}>
                    <td style={td}><strong>{e.name}</strong></td>
                    <td style={td}>{new Date(e.event_date).toLocaleDateString('en-GB')}</td>
                    <td style={td}>{e.earliest_slot.slice(0, 5)}&ndash;{e.latest_slot.slice(0, 5)} &middot; {e.slot_duration_minutes} min</td>
                    <td style={td}><span style={{ background: status.colour, color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem' }}>{status.label}</span></td>
                    <td style={td}>{e.bookings_count}</td>
                    <td style={td}><Link href={`/school/parents-evening/${e.id}`} style={btnGhost}>Open</Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, background: 'white', marginTop: 14 }
const h2: React.CSSProperties = { margin: '0 0 10px', fontSize: '1.05rem' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280' }
const td: React.CSSProperties = { padding: '10px', borderTop: '1px solid #f3f4f6' }
const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' }
const lab: React.CSSProperties = { display: 'flex', flexDirection: 'column', fontSize: '0.8125rem', fontWeight: 600, gap: 4 }
const btnPrimary: React.CSSProperties = { padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }
const btnGhost: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-block' }
