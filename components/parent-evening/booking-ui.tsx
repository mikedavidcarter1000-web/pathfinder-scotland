'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/toast'

export type ParentEveningEvening = {
  id: string
  name: string
  event_date: string
  slot_duration_minutes: number
  earliest_slot: string
  latest_slot: string
  status: 'draft' | 'open' | 'closed' | 'completed'
  booking_opens_at: string | null
  booking_closes_at: string | null
}

export type ParentEveningTeacherSlot = { time: string; available: boolean; booked_for_student: boolean }
export type ParentEveningTeacher = {
  staff_id: string
  full_name: string
  department: string | null
  subjects: string[]
  room: string | null
  slots: ParentEveningTeacherSlot[]
  has_availability: boolean
}

export type ParentEveningBookingSummary = {
  id: string
  staff_id: string
  slot_time: string
  booking_status: string
  school_staff: { full_name: string } | null
}

export type ParentEveningData = {
  evening: ParentEveningEvening
  teachers: ParentEveningTeacher[]
  bookings?: ParentEveningBookingSummary[]
  student?: { first_name: string | null; last_name: string | null; school_stage: string | null; registration_class: string | null } | null
}

type Data = ParentEveningData

function normalise(t: string): string { return t.slice(0, 5) }

export function ParentEveningBookingUI({
  studentId,
  studentName,
  fetchData,
  book,
  cancel,
  tokenBased = false,
}: {
  studentId: string
  studentName: string
  fetchData: (studentId: string) => Promise<Data>
  book: (studentId: string, staffId: string, slotTime: string) => Promise<void>
  cancel?: (bookingId: string) => Promise<void>
  tokenBased?: boolean
}) {
  const toast = useToast()
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const d = await fetchData(studentId)
      setData(d)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  async function doBook(staffId: string, time: string) {
    if (busy) return
    // Clash check against existing confirmed bookings for this student
    // at this event.
    const clashes = (data?.bookings ?? []).filter((b) => b.slot_time.slice(0, 5) === time && b.booking_status === 'confirmed')
    if (clashes.length > 0) {
      if (!confirm(`You already have a booking at ${time}. Continue anyway?`)) return
    }
    setBusy(true)
    try {
      await book(studentId, staffId, time)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setBusy(false)
    }
  }

  async function doCancel(bookingId: string) {
    if (!cancel || busy) return
    if (!confirm('Cancel this booking?')) return
    setBusy(true)
    try {
      await cancel(bookingId)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cancel failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p>Loading…</p>
  if (!data) return <p>Could not load event.</p>

  const { evening, teachers } = data
  const isOpen = evening.status === 'open'
  const now = new Date()
  const opensAt = evening.booking_opens_at ? new Date(evening.booking_opens_at) : null
  const closesAt = evening.booking_closes_at ? new Date(evening.booking_closes_at) : null
  const beforeOpen = !!(opensAt && opensAt > now)
  const afterClose = !!(closesAt && closesAt < now)

  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem' }}>{evening.name}</h1>
      <p style={{ opacity: 0.7, margin: 0 }}>
        {new Date(evening.event_date).toLocaleDateString('en-GB')}
        {evening.booking_closes_at ? ` · Bookings close ${new Date(evening.booking_closes_at).toLocaleString('en-GB')}` : null}
      </p>
      <p style={{ margin: '4px 0 10px' }}>Booking appointments for <strong>{studentName}</strong></p>

      {!isOpen && (
        <div style={{ padding: 10, background: '#fef3c7', color: '#92400e', borderRadius: 8, marginBottom: 10 }}>
          Bookings are not currently open for this event.
        </div>
      )}
      {beforeOpen && (
        <div style={{ padding: 10, background: '#e0f2fe', color: '#075985', borderRadius: 8, marginBottom: 10 }}>
          Booking opens {opensAt?.toLocaleString('en-GB')}.
        </div>
      )}
      {afterClose && (
        <div style={{ padding: 10, background: '#fef3c7', color: '#92400e', borderRadius: 8, marginBottom: 10 }}>
          Booking window has closed.
        </div>
      )}

      {data.bookings && data.bookings.length > 0 && (
        <section style={card}>
          <h2 style={h2}>Your bookings ({data.bookings.filter((b) => b.booking_status === 'confirmed').length})</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.bookings.filter((b) => b.booking_status === 'confirmed').map((b) => (
              <li key={b.id} style={{ padding: '8px 0', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{normalise(b.slot_time)}</strong> — {b.school_staff?.full_name ?? 'Staff'}
                </div>
                {cancel && <button onClick={() => doCancel(b.id)} style={btnDanger}>Cancel</button>}
              </li>
            ))}
          </ul>
          {!tokenBased && (
            <div style={{ marginTop: 10 }}>
              <a href={`#my-schedule`} style={{ fontSize: '0.8125rem' }} onClick={(e) => { e.preventDefault(); window.print() }}>Print my schedule</a>
            </div>
          )}
        </section>
      )}

      <section style={card}>
        <h2 style={h2}>Teachers</h2>
        {teachers.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No teachers appear to be teaching this student yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {teachers.map((t) => {
              const isExpanded = expandedTeacher === t.staff_id
              const availableSlots = t.slots.filter((s) => s.available || s.booked_for_student)
              return (
                <li key={t.staff_id} style={{ padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <strong>{t.full_name}</strong>
                      <span style={{ color: '#6b7280', marginLeft: 6, fontSize: '0.8125rem' }}>
                        {t.subjects.join(', ') || t.department || ''}
                        {t.room ? ` · Room ${t.room}` : ''}
                      </span>
                    </div>
                    {!t.has_availability ? (
                      <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>Not available</span>
                    ) : (
                      <button onClick={() => setExpandedTeacher(isExpanded ? null : t.staff_id)} style={btnGhost}>
                        {isExpanded ? 'Hide slots' : `Book (${availableSlots.length} available)`}
                      </button>
                    )}
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {t.slots.length === 0 && <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>No slots.</span>}
                      {t.slots.map((s) => {
                        const disabled = !isOpen || !s.available || beforeOpen || afterClose
                        const booked = s.booked_for_student
                        return (
                          <button
                            key={s.time}
                            disabled={disabled && !booked}
                            onClick={() => { if (!booked) doBook(t.staff_id, s.time) }}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: booked ? '1px solid #166534' : '1px solid #cbd5e1',
                              background: booked ? '#dcfce7' : s.available ? 'white' : '#f3f4f6',
                              color: booked ? '#166534' : s.available ? '#1B3A5C' : '#9ca3af',
                              cursor: disabled && !booked ? 'default' : 'pointer',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                            }}
                          >
                            {s.time}{booked ? ' ✓' : s.available ? '' : ' (booked)'}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, background: 'white', marginTop: 14 }
const h2: React.CSSProperties = { margin: '0 0 8px', fontSize: '1.05rem' }
const btnGhost: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', fontSize: '0.8125rem' }
const btnDanger: React.CSSProperties = { padding: '4px 8px', background: 'transparent', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }
