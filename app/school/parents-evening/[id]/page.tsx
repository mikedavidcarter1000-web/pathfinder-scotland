'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'

type Evening = {
  id: string
  school_id: string
  name: string
  event_date: string
  earliest_slot: string
  latest_slot: string
  slot_duration_minutes: number
  break_between_slots_minutes: number
  booking_opens_at: string | null
  booking_closes_at: string | null
  status: 'draft' | 'open' | 'closed' | 'completed'
}

type StaffRow = { id: string; full_name: string; email: string; role: string; department: string | null }
type AvailabilityRow = {
  id: string
  parent_evening_id: string
  staff_id: string
  available_from: string
  available_to: string
  room: string | null
  max_consecutive_slots: number
}
type BookingRow = {
  id: string
  student_id: string
  staff_id: string
  parent_id: string | null
  slot_time: string
  prep_snapshot: {
    student?: { first_name: string | null; last_name: string | null; attendance_pct: number | null }
    subjects?: Array<{ subject: string; working_grade: string | null; on_track: string | null }>
    saved_courses?: Array<{ title: string; university: string }>
    active_flags?: string[]
  } | null
  booking_status: 'confirmed' | 'cancelled' | 'no_show'
  booked_by: 'parent' | 'school'
  students: { first_name: string | null; last_name: string | null; school_stage: string | null; registration_class: string | null } | null
  school_staff: { full_name: string; email: string; department: string | null } | null
  parents: { full_name: string | null; email: string | null } | null
}

type Tab = 'setup' | 'bookings' | 'schedule' | 'summary'

function normalise(t: string | null | undefined): string {
  return (t ?? '').slice(0, 5)
}

export default function EveningDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ''
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('setup')
  const [evening, setEvening] = useState<Evening | null>(null)
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [availability, setAvailability] = useState<AvailabilityRow[]>([])
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tokenResult, setTokenResult] = useState<Array<{ student_id: string; name: string; year_group: string; url: string }> | null>(null)
  const [showTokenForm, setShowTokenForm] = useState(false)
  const [tokenYear, setTokenYear] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/school/parents-evening/${id}`)
    if (!res.ok) {
      if (res.status === 404) toast.error('Evening not found.')
      setLoading(false)
      return
    }
    const d = await res.json()
    setEvening(d.evening)
    setStaff(d.staff ?? [])
    setAvailability(d.availability ?? [])
    setBookings(d.bookings ?? [])
    setLoading(false)
  }, [id, toast])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/parents-evening/${id}`)
      return
    }
    if (id) load()
  }, [authLoading, user, router, id, load])

  async function saveAvailability(staffId: string, next: Partial<AvailabilityRow>) {
    const existing = availability.find((a) => a.staff_id === staffId)
    const payload = {
      staff_id: staffId,
      available_from: next.available_from ?? existing?.available_from ?? evening?.earliest_slot,
      available_to: next.available_to ?? existing?.available_to ?? evening?.latest_slot,
      room: 'room' in next ? next.room : existing?.room,
      max_consecutive_slots: next.max_consecutive_slots ?? existing?.max_consecutive_slots ?? 20,
    }
    const res = await fetch(`/api/school/parents-evening/${id}/availability`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const d = await res.json()
    if (!res.ok) {
      toast.error(d.error ?? 'Save failed.')
      return
    }
    await load()
  }

  async function removeAvailability(staffId: string) {
    const res = await fetch(`/api/school/parents-evening/${id}/availability?staff_id=${staffId}`, { method: 'DELETE' })
    if (!res.ok) {
      const d = await res.json()
      toast.error(d.error ?? 'Remove failed.')
      return
    }
    await load()
  }

  async function changeStatus(status: Evening['status']) {
    const res = await fetch(`/api/school/parents-evening/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const d = await res.json()
    if (!res.ok) {
      toast.error(d.error ?? 'Could not update status.')
      return
    }
    toast.success(`Status: ${status}`)
    await load()
  }

  async function cancelBooking(bookingId: string) {
    if (!confirm('Cancel this booking?')) return
    const res = await fetch(`/api/school/parents-evening/${id}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ booking_status: 'cancelled' }),
    })
    if (!res.ok) {
      const d = await res.json()
      toast.error(d.error ?? 'Cancel failed.')
      return
    }
    await load()
  }

  async function generateTokens() {
    const res = await fetch(`/api/school/parents-evening/${id}/tokens`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ year_group: tokenYear || undefined }),
    })
    const d = await res.json()
    if (!res.ok) {
      toast.error(d.error ?? 'Token generation failed.')
      return
    }
    setTokenResult(d.tokens ?? [])
    toast.success(`Generated ${d.tokens?.length ?? 0} booking links.`)
  }

  function downloadTokensCsv() {
    if (!tokenResult || tokenResult.length === 0) return
    const header = 'Student ID,Name,Year Group,Booking URL\n'
    const rows = tokenResult.map((t) =>
      [t.student_id, `"${t.name.replace(/"/g, '""')}"`, t.year_group, t.url].join(',')
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parent-evening-${id}-tokens.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const availabilityByStaff = useMemo(() => {
    const m = new Map<string, AvailabilityRow>()
    for (const a of availability) m.set(a.staff_id, a)
    return m
  }, [availability])

  const staffWithAvailability = useMemo(() =>
    staff.filter((s) => availabilityByStaff.has(s.id))
  , [staff, availabilityByStaff])

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  if (!evening) return <div className="pf-container pt-8 pb-12"><p>Evening not found.</p></div>

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/school/parents-evening" style={{ fontSize: '0.875rem' }}>&larr; Parents&apos; evenings</Link>
      </div>
      <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem' }}>{evening.name}</h1>
      <p style={{ opacity: 0.7, margin: 0 }}>
        {new Date(evening.event_date).toLocaleDateString('en-GB')} &middot; {normalise(evening.earliest_slot)}&ndash;{normalise(evening.latest_slot)} &middot; {evening.slot_duration_minutes}-min slots
      </p>

      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {evening.status === 'draft' && <button onClick={() => changeStatus('open')} style={btnPrimary}>Open bookings</button>}
        {evening.status === 'open' && <button onClick={() => changeStatus('closed')} style={btnGhost}>Close bookings</button>}
        {evening.status === 'closed' && <button onClick={() => changeStatus('completed')} style={btnGhost}>Mark completed</button>}
        <span style={{ padding: '6px 10px', background: '#f3f4f6', borderRadius: 6, fontSize: '0.8125rem' }}>
          Status: <strong>{evening.status}</strong>
        </span>
      </div>

      <nav style={{ display: 'flex', gap: 2, marginTop: 16, borderBottom: '1px solid #e5e7eb' }}>
        {(['setup', 'bookings', 'schedule', 'summary'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: tab === t ? 'white' : 'transparent',
              borderBottom: tab === t ? '2px solid #1B3A5C' : '2px solid transparent',
              fontWeight: tab === t ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {tab === 'setup' && (
        <section style={card}>
          <h2 style={h2}>Staff availability</h2>
          <p style={{ fontSize: '0.8125rem', opacity: 0.7, marginTop: 0 }}>
            Tick a teacher to add their default availability window. They can refine from their own dashboard.
          </p>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={th}>Staff</th>
                <th style={th}>Dept</th>
                <th style={th}>Available</th>
                <th style={th}>From</th>
                <th style={th}>To</th>
                <th style={th}>Room</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => {
                const av = availabilityByStaff.get(s.id)
                const isAvailable = !!av
                return (
                  <tr key={s.id}>
                    <td style={td}><strong>{s.full_name}</strong></td>
                    <td style={td}>{s.department ?? ''}</td>
                    <td style={td}>
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => {
                          if (e.target.checked) saveAvailability(s.id, {})
                          else removeAvailability(s.id)
                        }}
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="time"
                        value={normalise(av?.available_from ?? evening.earliest_slot)}
                        disabled={!isAvailable}
                        onChange={(e) => saveAvailability(s.id, { available_from: e.target.value })}
                        style={{ ...inp, width: 110 }}
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="time"
                        value={normalise(av?.available_to ?? evening.latest_slot)}
                        disabled={!isAvailable}
                        onChange={(e) => saveAvailability(s.id, { available_to: e.target.value })}
                        style={{ ...inp, width: 110 }}
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="text"
                        value={av?.room ?? ''}
                        disabled={!isAvailable}
                        onBlur={(e) => saveAvailability(s.id, { room: e.target.value })}
                        defaultValue={av?.room ?? ''}
                        placeholder="e.g. M12"
                        style={{ ...inp, width: 120 }}
                      />
                    </td>
                    <td style={td}></td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1rem' }}>Magic-link booking</h3>
            <p style={{ fontSize: '0.8125rem', opacity: 0.7, margin: 0 }}>
              Generate booking URLs for parents without Pathfinder accounts. Each URL is unique and tied to one student.
            </p>
            {!showTokenForm ? (
              <button onClick={() => setShowTokenForm(true)} style={{ ...btnGhost, marginTop: 8 }}>Generate booking links</button>
            ) : (
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: '0.8125rem' }}>Year group:{' '}
                  <select value={tokenYear} onChange={(e) => setTokenYear(e.target.value)} style={inp}>
                    <option value="">All</option>
                    <option value="s1">S1</option>
                    <option value="s2">S2</option>
                    <option value="s3">S3</option>
                    <option value="s4">S4</option>
                    <option value="s5">S5</option>
                    <option value="s6">S6</option>
                  </select>
                </label>{' '}
                <button onClick={generateTokens} style={btnPrimary}>Generate</button>{' '}
                <button onClick={() => setShowTokenForm(false)} style={btnGhost}>Cancel</button>
              </div>
            )}

            {tokenResult && tokenResult.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{tokenResult.length} links created</strong>
                  <button onClick={downloadTokensCsv} style={btnGhost}>Download CSV</button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'bookings' && (
        <section style={card}>
          <h2 style={h2}>Bookings ({bookings.filter((b) => b.booking_status === 'confirmed').length} confirmed)</h2>
          {bookings.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No bookings yet.</p>
          ) : (
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={th}>Slot</th>
                  <th style={th}>Student</th>
                  <th style={th}>Teacher</th>
                  <th style={th}>Parent</th>
                  <th style={th}>Booked</th>
                  <th style={th}>Status</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={td}>{normalise(b.slot_time)}</td>
                    <td style={td}>{b.students?.last_name ?? ''}, {b.students?.first_name ?? ''} <span style={{ color: '#6b7280' }}>&middot; {b.students?.school_stage?.toUpperCase()} {b.students?.registration_class}</span></td>
                    <td style={td}>{b.school_staff?.full_name ?? ''}</td>
                    <td style={td}>{b.parents?.full_name ?? <span style={{ color: '#9ca3af' }}>(unlinked)</span>}</td>
                    <td style={td}>{b.booked_by === 'parent' ? 'Parent' : 'School'}</td>
                    <td style={td}>{b.booking_status}</td>
                    <td style={td}>
                      {b.booking_status === 'confirmed' && <button onClick={() => cancelBooking(b.id)} style={btnDanger}>Cancel</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {tab === 'schedule' && (
        <section style={card}>
          <h2 style={h2}>Teacher schedules</h2>
          <p style={{ fontSize: '0.8125rem', opacity: 0.7, margin: '0 0 10px' }}>
            Printable schedule with prep snapshots for each booked meeting.
          </p>
          {staffWithAvailability.length === 0 ? (
            <p style={{ opacity: 0.6 }}>Add staff availability first.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {staffWithAvailability.map((s) => {
                const count = bookings.filter((b) => b.staff_id === s.id && b.booking_status === 'confirmed').length
                return (
                  <li key={s.id} style={{ padding: '8px 0', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{s.full_name}</strong>{' '}
                      <span style={{ color: '#6b7280' }}>{s.department} &middot; {count} booking{count === 1 ? '' : 's'}</span>
                    </div>
                    <a href={`/api/school/parents-evening/${id}/schedule?staff_id=${s.id}`} target="_blank" rel="noopener noreferrer" style={btnGhost}>
                      Print schedule
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
            <a href={`/api/school/parents-evening/${id}/schedule`} target="_blank" rel="noopener noreferrer" style={btnPrimary}>Print all schedules</a>
          </div>
        </section>
      )}

      {tab === 'summary' && (
        <SummaryTab id={id} evening={evening} staff={staff} bookings={bookings} availability={availability} />
      )}
    </div>
  )
}

function SummaryTab({
  id, evening, staff, bookings, availability,
}: {
  id: string
  evening: Evening
  staff: StaffRow[]
  bookings: BookingRow[]
  availability: AvailabilityRow[]
}) {
  const confirmedBookings = bookings.filter((b) => b.booking_status === 'confirmed')
  // Students with bookings at this event.
  const studentsBooked = new Set(confirmedBookings.map((b) => b.student_id))
  const staffBooked = new Set(confirmedBookings.map((b) => b.staff_id))

  const availableStaff = availability.length
  const utilisation = availableStaff === 0
    ? 0
    : Math.round((staffBooked.size / availableStaff) * 100)

  return (
    <section style={card}>
      <h2 style={h2}>Summary</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <Stat label="Confirmed bookings" value={confirmedBookings.length} />
        <Stat label="Students with a booking" value={studentsBooked.size} />
        <Stat label="Staff with availability" value={availableStaff} />
        <Stat label="Staff utilisation" value={`${utilisation}%`} />
      </div>
      <div style={{ marginTop: 14, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: '0.875rem' }}>
        <strong>Event:</strong> {evening.name} &middot; {new Date(evening.event_date).toLocaleDateString('en-GB')}<br />
        <strong>Staff without availability:</strong> {staff.filter((s) => !availability.some((a) => a.staff_id === s.id)).map((s) => s.full_name).join(', ') || 'None'}
      </div>
      <p style={{ marginTop: 10, fontSize: '0.8125rem', opacity: 0.7 }}>
        Schedule print and bookings list available from the Schedule / Bookings tabs. Student-specific prep data is captured at booking time (see prep snapshots in the printable schedule).
      </p>
      {/* Suppress unused variable warning -- future work may expose admin reminders here */}
      <div style={{ display: 'none' }}>{id}</div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1B3A5C' }}>{value}</div>
    </div>
  )
}

const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, background: 'white', marginTop: 14 }
const h2: React.CSSProperties = { margin: '0 0 10px', fontSize: '1.05rem' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 4 }
const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280' }
const td: React.CSSProperties = { padding: '8px 10px', borderTop: '1px solid #f3f4f6' }
const inp: React.CSSProperties = { padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.875rem' }
const btnPrimary: React.CSSProperties = { padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }
const btnGhost: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-block' }
const btnDanger: React.CSSProperties = { padding: '4px 8px', background: 'transparent', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }
