import { NextResponse } from 'next/server'
import { requireParentApi } from '@/lib/school/student-auth'

export const runtime = 'nodejs'

// DELETE /api/parent/parents-evening/[id]/bookings/[bookingId]
// Cancel a booking the parent made. Keeps the row with status='cancelled'
// rather than deleting, so the slot stays audit-traceable.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; bookingId: string }> }) {
  const { id, bookingId } = await params
  const guard = await requireParentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking } = await (admin as any)
    .from('parent_evening_bookings')
    .select('id, parent_id, student_id, staff_id, slot_time, parent_evening_id, school_staff:staff_id(full_name), parent_evenings:parent_evening_id(name, event_date, school_id, schools:school_id(name))')
    .eq('id', bookingId)
    .eq('parent_evening_id', id)
    .maybeSingle()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.parent_id !== ctx.parentId) {
    return NextResponse.json({ error: 'You can only cancel your own bookings.' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evening_bookings')
    .update({ booking_status: 'cancelled' })
    .eq('id', bookingId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fire-and-forget cancellation email.
  try {
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const fromAddress = process.env.RESEND_FROM_ADDRESS ?? 'noreply@pathfinderscot.co.uk'
      const fromName = process.env.RESEND_FROM_NAME ?? 'Pathfinder Scotland'
      const schoolName = (booking.parent_evenings as unknown as { schools: { name: string } | null })?.schools?.name ?? 'School'
      const teacherName = (booking.school_staff as unknown as { full_name: string })?.full_name ?? 'staff'
      const eventName = (booking.parent_evenings as unknown as { name: string })?.name ?? ''
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: `${fromName} <${fromAddress}>`,
          to: [ctx.email],
          subject: `${schoolName} - Appointment cancelled`,
          text: `Your appointment with ${teacherName} at ${booking.slot_time.slice(0, 5)} (${eventName}) has been cancelled.`,
        }),
      })
    }
  } catch {}

  return NextResponse.json({ ok: true })
}
