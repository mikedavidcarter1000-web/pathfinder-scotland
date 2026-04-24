import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// POST /api/school/parents-evening/[id]/availability
// Body: { staff_id, available_from, available_to, room?, max_consecutive_slots? }
// Admins can set for any staff; non-admin staff can only set their own.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    staff_id?: unknown
    available_from?: unknown
    available_to?: unknown
    room?: unknown
    max_consecutive_slots?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const staffId = typeof body.staff_id === 'string' ? body.staff_id : ''
  const availableFrom = typeof body.available_from === 'string' ? body.available_from : ''
  const availableTo = typeof body.available_to === 'string' ? body.available_to : ''
  const room = typeof body.room === 'string' ? body.room : null
  const maxConsecutive = typeof body.max_consecutive_slots === 'number' ? body.max_consecutive_slots : 20

  if (!staffId) return NextResponse.json({ error: 'staff_id required' }, { status: 400 })
  if (!availableFrom || !availableTo) return NextResponse.json({ error: 'Availability window required' }, { status: 400 })

  // Non-admins can only set their own availability.
  if (!ctx.isAdmin && staffId !== ctx.staffId) {
    return NextResponse.json({ error: 'You can only set availability for yourself.' }, { status: 403 })
  }

  // Verify the evening belongs to this school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evening } = await (admin as any)
    .from('parent_evenings')
    .select('id, school_id')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!evening) return NextResponse.json({ error: 'Evening not found' }, { status: 404 })

  // Upsert availability for this staff member.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evening_availability')
    .upsert({
      parent_evening_id: id,
      staff_id: staffId,
      available_from: availableFrom,
      available_to: availableTo,
      room,
      max_consecutive_slots: maxConsecutive,
    }, { onConflict: 'parent_evening_id,staff_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/school/parents-evening/[id]/availability?staff_id=...
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const staffId = url.searchParams.get('staff_id')
  if (!staffId) return NextResponse.json({ error: 'staff_id required' }, { status: 400 })

  if (!ctx.isAdmin && staffId !== ctx.staffId) {
    return NextResponse.json({ error: 'You can only remove your own availability.' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evening_availability')
    .delete()
    .eq('parent_evening_id', id)
    .eq('staff_id', staffId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
