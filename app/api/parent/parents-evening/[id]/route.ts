import { NextResponse } from 'next/server'
import { requireParentApi } from '@/lib/school/student-auth'
import { generateSlots, normaliseTime } from '@/lib/school/parent-evening-slots'

export const runtime = 'nodejs'

// GET /api/parent/parents-evening/[id]?student_id=...
// Returns the evening metadata, the teachers who teach this student, each
// teacher's availability + slot grid + which slots are booked, and the
// parent's existing bookings.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireParentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const studentId = url.searchParams.get('student_id')
  if (!studentId) return NextResponse.json({ error: 'student_id required' }, { status: 400 })
  if (!ctx.linkedStudentIds.includes(studentId)) {
    return NextResponse.json({ error: 'Not linked to this student.' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evening } = await (admin as any)
    .from('parent_evenings')
    .select('id, school_id, name, event_date, slot_duration_minutes, break_between_slots_minutes, earliest_slot, latest_slot, booking_opens_at, booking_closes_at, status')
    .eq('id', id)
    .maybeSingle()
  if (!evening) return NextResponse.json({ error: 'Evening not found' }, { status: 404 })

  // Validate student is at this school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (admin as any)
    .from('school_student_links')
    .select('school_id')
    .eq('school_id', evening.school_id)
    .eq('student_id', studentId)
    .maybeSingle()
  if (!link) return NextResponse.json({ error: 'Student is not at this school.' }, { status: 403 })

  // Teachers who teach this student via class_students -> class_assignments -> school_staff.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classRows } = await (admin as any)
    .from('class_students')
    .select('class_assignments:class_assignment_id(staff_id, subjects:subject_id(name))')
    .eq('student_id', studentId)

  type ClassRow = {
    class_assignments: {
      staff_id: string
      subjects: { name: string } | null
    } | null
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
    return NextResponse.json({ evening, teachers: [], bookings: [] })
  }

  // Staff info and availability.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: staffRows }, { data: availabilityRows }, { data: allBookings }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('school_staff').select('id, full_name, email, department').in('id', teacherIds),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('parent_evening_availability').select('staff_id, available_from, available_to, room, max_consecutive_slots').eq('parent_evening_id', id).in('staff_id', teacherIds),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('parent_evening_bookings').select('id, staff_id, student_id, slot_time, booking_status').eq('parent_evening_id', id).eq('booking_status', 'confirmed'),
  ])

  type Availability = { staff_id: string; available_from: string; available_to: string; room: string | null; max_consecutive_slots: number }
  const availByStaff = new Map<string, Availability>()
  for (const a of ((availabilityRows ?? []) as Availability[])) availByStaff.set(a.staff_id, a)

  type Booking = { id: string; staff_id: string; student_id: string; slot_time: string; booking_status: string }
  const bookingsByStaff = new Map<string, Booking[]>()
  for (const b of ((allBookings ?? []) as Booking[])) {
    const list = bookingsByStaff.get(b.staff_id) ?? []
    list.push(b)
    bookingsByStaff.set(b.staff_id, list)
  }

  const teachersOut = ((staffRows ?? []) as Array<{ id: string; full_name: string; email: string; department: string | null }>)
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
      const myStudentBookings = (bookingsByStaff.get(s.id) ?? []).filter((b) => b.student_id === studentId).map((b) => normaliseTime(b.slot_time))
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

  // This parent's bookings at this event for this student.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: myBookings } = await (admin as any)
    .from('parent_evening_bookings')
    .select('id, staff_id, slot_time, booking_status, school_staff:staff_id(full_name)')
    .eq('parent_evening_id', id)
    .eq('parent_id', ctx.parentId)
    .eq('student_id', studentId)
    .eq('booking_status', 'confirmed')
    .order('slot_time', { ascending: true })

  return NextResponse.json({
    evening,
    teachers: teachersOut,
    bookings: myBookings ?? [],
  })
}

// POST /api/parent/parents-evening/[id]
// Body: { student_id, staff_id, slot_time }
// Books a slot. Uses the admin client (not subject to RLS) but verifies
// the parent<->student link and the student<->school membership.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireParentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    student_id?: unknown
    staff_id?: unknown
    slot_time?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const studentId = typeof body.student_id === 'string' ? body.student_id : ''
  const staffId = typeof body.staff_id === 'string' ? body.staff_id : ''
  const slotTime = typeof body.slot_time === 'string' ? body.slot_time : ''
  if (!studentId || !staffId || !slotTime) return NextResponse.json({ error: 'student_id, staff_id, slot_time required' }, { status: 400 })
  if (!ctx.linkedStudentIds.includes(studentId)) return NextResponse.json({ error: 'Not linked to this student' }, { status: 403 })

  // Evening must be open and student at school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evening } = await (admin as any)
    .from('parent_evenings')
    .select('id, school_id, status, booking_opens_at, booking_closes_at, name, event_date, slot_duration_minutes, break_between_slots_minutes')
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentLink } = await (admin as any)
    .from('school_student_links')
    .select('school_id')
    .eq('student_id', studentId)
    .eq('school_id', evening.school_id)
    .maybeSingle()
  if (!studentLink) return NextResponse.json({ error: 'Student not at this school.' }, { status: 403 })

  // Build prep snapshot via helper.
  const { buildPrepSnapshot } = await import('@/lib/school/parent-evening-prep')
  const prep = await buildPrepSnapshot(admin, evening.school_id, studentId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evening_bookings')
    .insert({
      parent_evening_id: id,
      student_id: studentId,
      staff_id: staffId,
      parent_id: ctx.parentId,
      slot_time: slotTime,
      prep_snapshot: prep,
      booking_status: 'confirmed',
      booked_by: 'parent',
    })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That slot is already booked.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send confirmation email (fire and forget).
  try {
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: teacher } = await (admin as any)
        .from('school_staff')
        .select('full_name')
        .eq('id', staffId)
        .maybeSingle()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: school } = await (admin as any)
        .from('schools')
        .select('name')
        .eq('id', evening.school_id)
        .maybeSingle()
      const fromAddress = process.env.RESEND_FROM_ADDRESS ?? 'noreply@pathfinderscot.co.uk'
      const fromName = process.env.RESEND_FROM_NAME ?? 'Pathfinder Scotland'
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: `${fromName} <${fromAddress}>`,
          to: [ctx.email],
          subject: `${school?.name ?? 'School'} - Appointment confirmed with ${teacher?.full_name ?? 'staff'}`,
          text: `Appointment confirmed: ${teacher?.full_name ?? 'staff'} at ${slotTime.slice(0, 5)} on ${evening.event_date} (${evening.name}).`,
        }),
      })
    }
  } catch {
    // Don't fail the booking if the email fails.
  }

  return NextResponse.json({ ok: true })
}
