import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// PUT /api/school/parents-evening/[id]/bookings/[bookingId]
// Admin can update booking_status (cancel, mark no-show).
export async function PUT(req: Request, { params }: { params: Promise<{ id: string; bookingId: string }> }) {
  const { id, bookingId } = await params
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { admin } = guard

  const body = (await req.json().catch(() => null)) as { booking_status?: unknown } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const status = typeof body.booking_status === 'string' ? body.booking_status : ''
  if (!['confirmed', 'cancelled', 'no_show'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evening_bookings')
    .update({ booking_status: status })
    .eq('id', bookingId)
    .eq('parent_evening_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/school/parents-evening/[id]/bookings/[bookingId]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; bookingId: string }> }) {
  const { id, bookingId } = await params
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evening_bookings')
    .delete()
    .eq('id', bookingId)
    .eq('parent_evening_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
