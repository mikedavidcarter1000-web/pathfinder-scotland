import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/parents-evening -- list all parent evenings at the school
export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('parent_evenings')
    .select('id, name, event_date, status, slot_duration_minutes, break_between_slots_minutes, earliest_slot, latest_slot, booking_opens_at, booking_closes_at, created_at')
    .eq('school_id', ctx.schoolId)
    .order('event_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Row = { id: string; status: string }
  const ids = ((data ?? []) as Row[]).map((r) => r.id)
  let countsById = new Map<string, number>()
  if (ids.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: bookings } = await (admin as any)
      .from('parent_evening_bookings')
      .select('parent_evening_id')
      .in('parent_evening_id', ids)
      .eq('booking_status', 'confirmed')
    countsById = new Map<string, number>()
    for (const b of ((bookings ?? []) as Array<{ parent_evening_id: string }>)) {
      countsById.set(b.parent_evening_id, (countsById.get(b.parent_evening_id) ?? 0) + 1)
    }
  }

  const enriched = ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    ...r,
    bookings_count: countsById.get(r.id as string) ?? 0,
  }))

  return NextResponse.json({ evenings: enriched })
}

// POST /api/school/parents-evening -- create a new evening (admin only)
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    name?: unknown
    event_date?: unknown
    earliest_slot?: unknown
    latest_slot?: unknown
    slot_duration_minutes?: unknown
    break_between_slots_minutes?: unknown
    booking_opens_at?: unknown
    booking_closes_at?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const eventDate = typeof body.event_date === 'string' ? body.event_date : ''
  const earliest = typeof body.earliest_slot === 'string' ? body.earliest_slot : ''
  const latest = typeof body.latest_slot === 'string' ? body.latest_slot : ''
  const slotDuration = typeof body.slot_duration_minutes === 'number' ? body.slot_duration_minutes : 5
  const breakMinutes = typeof body.break_between_slots_minutes === 'number' ? body.break_between_slots_minutes : 1
  const opensAt = typeof body.booking_opens_at === 'string' ? body.booking_opens_at : null
  const closesAt = typeof body.booking_closes_at === 'string' ? body.booking_closes_at : null

  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  if (!eventDate) return NextResponse.json({ error: 'Event date is required.' }, { status: 400 })
  if (!earliest || !latest) return NextResponse.json({ error: 'Earliest / latest slot times are required.' }, { status: 400 })
  if (slotDuration < 3 || slotDuration > 30) return NextResponse.json({ error: 'Slot duration must be 3-30 minutes.' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('parent_evenings')
    .insert({
      school_id: ctx.schoolId,
      name,
      event_date: eventDate,
      earliest_slot: earliest,
      latest_slot: latest,
      slot_duration_minutes: slotDuration,
      break_between_slots_minutes: breakMinutes,
      booking_opens_at: opensAt,
      booking_closes_at: closesAt,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}
