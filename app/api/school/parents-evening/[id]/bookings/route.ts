import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { buildPrepSnapshot } from '@/lib/school/parent-evening-prep'

export const runtime = 'nodejs'

// POST /api/school/parents-evening/[id]/bookings  (admin book-on-behalf)
// Body: { student_id, staff_id, slot_time, parent_id? }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    student_id?: unknown
    staff_id?: unknown
    slot_time?: unknown
    parent_id?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const studentId = typeof body.student_id === 'string' ? body.student_id : ''
  const staffId = typeof body.staff_id === 'string' ? body.staff_id : ''
  const slotTime = typeof body.slot_time === 'string' ? body.slot_time : ''
  const parentId = typeof body.parent_id === 'string' ? body.parent_id : null
  if (!studentId || !staffId || !slotTime) {
    return NextResponse.json({ error: 'student_id, staff_id, slot_time required' }, { status: 400 })
  }

  // Evening belongs to school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evening } = await (admin as any)
    .from('parent_evenings')
    .select('id')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!evening) return NextResponse.json({ error: 'Evening not found' }, { status: 404 })

  const prep = await buildPrepSnapshot(admin, ctx.schoolId, studentId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evening_bookings')
    .insert({
      parent_evening_id: id,
      student_id: studentId,
      staff_id: staffId,
      parent_id: parentId,
      slot_time: slotTime,
      prep_snapshot: prep,
      booking_status: 'confirmed',
      booked_by: 'school',
    })
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That slot is already booked.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
