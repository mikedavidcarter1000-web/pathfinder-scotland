import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/admin-auth'
import { generateSlots, normaliseTime } from '@/lib/school/parent-evening-slots'

export const runtime = 'nodejs'

// Token-authenticated booking endpoint for parents without accounts.
// Auth = possession of the token. Tokens are issued by the admin and are
// single-student-scoped, so a token grants booking ability only for that
// one student at the one evening.

async function resolveToken(tokenString: string, eveningId: string) {
  const admin = getAdminClient()
  if (!admin) return { error: 'Server misconfigured', status: 500 as const, admin: null, token: null }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: token } = await (admin as any)
    .from('parent_evening_tokens')
    .select('id, parent_evening_id, student_id, expires_at, used_at')
    .eq('token', tokenString)
    .maybeSingle()
  if (!token) return { error: 'Invalid token', status: 404 as const, admin, token: null }
  if (token.parent_evening_id !== eveningId) return { error: 'Token does not match this evening', status: 403 as const, admin, token: null }
  if (new Date(token.expires_at) < new Date()) return { error: 'Token has expired', status: 403 as const, admin, token: null }
  return { error: null, status: 200 as const, admin, token }
}

// GET /api/parents-evening/token/[id]?token=...
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(req.url)
  const tokenString = url.searchParams.get('token')
  if (!tokenString) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const resolved = await resolveToken(tokenString, id)
  if (resolved.error) return NextResponse.json({ error: resolved.error }, { status: resolved.status })
  const { admin, token } = resolved
  if (!admin || !token) return NextResponse.json({ error: 'Internal error' }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evening } = await (admin as any)
    .from('parent_evenings')
    .select('id, school_id, name, event_date, slot_duration_minutes, break_between_slots_minutes, earliest_slot, latest_slot, status, booking_opens_at, booking_closes_at')
    .eq('id', id)
    .maybeSingle()
  if (!evening) return NextResponse.json({ error: 'Evening not found' }, { status: 404 })

  // Student snapshot for display.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, school_stage, registration_class')
    .eq('id', token.student_id)
    .maybeSingle()

  // Teachers who teach this student.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classRows } = await (admin as any)
    .from('class_students')
    .select('class_assignments:class_assignment_id(staff_id, subjects:subject_id(name))')
    .eq('student_id', token.student_id)

  type ClassRow = {
    class_assignments: { staff_id: string; subjects: { name: string } | null } | null
  }
  const teachers = new Map<string, { staff_id: string; subjects: string[] }>()
  for (const cr of ((classRows ?? []) as ClassRow[])) {
    const staffId = cr.class_assignments?.staff_id
    if (!staffId) continue
    const existing = teachers.get(staffId) ?? { staff_id: staffId, subjects: [] }
    const subjectName = cr.class_assignments?.subjects?.name ?? ''
    if (subjectName && !existing.subjects.includes(subjectName)) existing.subjects.push(subjectName)
    teachers.set(staffId, existing)
  }

  const teacherIds = Array.from(teachers.keys())
  if (teacherIds.length === 0) {
    return NextResponse.json({ evening, student, teachers: [], bookings: [] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: staffRows }, { data: availabilityRows }, { data: allBookings }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('school_staff').select('id, full_name, department').in('id', teacherIds),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('parent_evening_availability').select('staff_id, available_from, available_to, room, max_consecutive_slots').eq('parent_evening_id', id).in('staff_id', teacherIds),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('parent_evening_bookings').select('id, staff_id, student_id, slot_time, booking_status').eq('parent_evening_id', id).eq('booking_status', 'confirmed'),
  ])

  type Availability = { staff_id: string; available_from: string; available_to: string; room: string | null; max_consecutive_slots: number }
  const availByStaff = new Map<string, Availability>()
  for (const a of ((availabilityRows ?? []) as Availability[])) availByStaff.set(a.staff_id, a)

  type Booking = { id: string; staff_id: string; student_id: string; slot_time: string }
  const bookingsByStaff = new Map<string, Booking[]>()
  for (const b of ((allBookings ?? []) as Booking[])) {
    const list = bookingsByStaff.get(b.staff_id) ?? []
    list.push(b)
    bookingsByStaff.set(b.staff_id, list)
  }

  const teachersOut = ((staffRows ?? []) as Array<{ id: string; full_name: string; department: string | null }>)
    .map((s) => {
      const av = availByStaff.get(s.id)
      const subjects = teachers.get(s.id)?.subjects ?? []
      const slots = av ? generateSlots(
        normaliseTime(av.available_from),
        normaliseTime(av.available_to),
        evening.slot_duration_minutes,
        evening.break_between_slots_minutes,
        av.max_consecutive_slots,
      ) : []
      const taken = new Set((bookingsByStaff.get(s.id) ?? []).map((b) => normaliseTime(b.slot_time)))
      const myStudentBookings = (bookingsByStaff.get(s.id) ?? []).filter((b) => b.student_id === token.student_id).map((b) => normaliseTime(b.slot_time))
      return {
        staff_id: s.id,
        full_name: s.full_name,
        department: s.department,
        subjects,
        room: av?.room ?? null,
        slots: slots.map((t) => ({ time: t, available: !taken.has(t), booked_for_student: myStudentBookings.includes(t) })),
        has_availability: !!av,
      }
    })
    .sort((a, b) => a.full_name.localeCompare(b.full_name))

  return NextResponse.json({ evening, student, teachers: teachersOut })
}

// POST /api/parents-evening/token/[id]?token=...
// Body: { staff_id, slot_time }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(req.url)
  const tokenString = url.searchParams.get('token')
  if (!tokenString) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const body = (await req.json().catch(() => null)) as { staff_id?: unknown; slot_time?: unknown } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const staffId = typeof body.staff_id === 'string' ? body.staff_id : ''
  const slotTime = typeof body.slot_time === 'string' ? body.slot_time : ''
  if (!staffId || !slotTime) return NextResponse.json({ error: 'staff_id, slot_time required' }, { status: 400 })

  const resolved = await resolveToken(tokenString, id)
  if (resolved.error) return NextResponse.json({ error: resolved.error }, { status: resolved.status })
  const { admin, token } = resolved
  if (!admin || !token) return NextResponse.json({ error: 'Internal error' }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evening } = await (admin as any)
    .from('parent_evenings')
    .select('status, booking_opens_at, booking_closes_at, school_id')
    .eq('id', id)
    .maybeSingle()
  if (!evening) return NextResponse.json({ error: 'Evening not found' }, { status: 404 })
  if (evening.status !== 'open') return NextResponse.json({ error: 'Bookings are not open.' }, { status: 400 })
  const now = new Date()
  if (evening.booking_opens_at && new Date(evening.booking_opens_at) > now) {
    return NextResponse.json({ error: 'Booking window has not started yet.' }, { status: 400 })
  }
  if (evening.booking_closes_at && new Date(evening.booking_closes_at) < now) {
    return NextResponse.json({ error: 'Booking window has closed.' }, { status: 400 })
  }

  const { buildPrepSnapshot } = await import('@/lib/school/parent-evening-prep')
  const prep = await buildPrepSnapshot(admin, evening.school_id, token.student_id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evening_bookings')
    .insert({
      parent_evening_id: id,
      student_id: token.student_id,
      staff_id: staffId,
      parent_id: null,
      slot_time: slotTime,
      prep_snapshot: prep,
      booking_status: 'confirmed',
      booked_by: 'school',
    })
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That slot is already booked.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Mark the token as used, but leave it valid so the parent can come back
  // later and add / cancel bookings within the booking window.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('parent_evening_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', token.id)

  return NextResponse.json({ ok: true })
}
