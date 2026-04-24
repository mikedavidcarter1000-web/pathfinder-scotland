import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/parents-evening/[id] -- full detail with availability and booking summary
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evening } = await (admin as any)
    .from('parent_evenings')
    .select('*')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!evening) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // All staff at the school (for the Setup tab).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staffRows } = await (admin as any)
    .from('school_staff')
    .select('id, full_name, email, role, department')
    .eq('school_id', ctx.schoolId)
    .order('full_name', { ascending: true })

  // Availability rows
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: availability } = await (admin as any)
    .from('parent_evening_availability')
    .select('*')
    .eq('parent_evening_id', id)

  // Bookings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bookings } = await (admin as any)
    .from('parent_evening_bookings')
    .select(
      `id, student_id, staff_id, parent_id, slot_time, prep_snapshot, booking_status, booked_by, created_at,
       students:student_id(first_name, last_name, school_stage, registration_class),
       school_staff:staff_id(full_name, email, department),
       parents:parent_id(full_name, email)`
    )
    .eq('parent_evening_id', id)
    .order('slot_time', { ascending: true })

  return NextResponse.json({
    evening,
    staff: staffRows ?? [],
    availability: availability ?? [],
    bookings: bookings ?? [],
  })
}

// PUT /api/school/parents-evening/[id] -- admin update (status transitions, booking window)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    status?: unknown
    booking_opens_at?: unknown
    booking_closes_at?: unknown
    name?: unknown
    event_date?: unknown
    earliest_slot?: unknown
    latest_slot?: unknown
    slot_duration_minutes?: unknown
    break_between_slots_minutes?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const patch: Record<string, unknown> = {}
  if (typeof body.status === 'string' && ['draft', 'open', 'closed', 'completed'].includes(body.status)) {
    patch.status = body.status
  }
  if (typeof body.booking_opens_at === 'string' || body.booking_opens_at === null) patch.booking_opens_at = body.booking_opens_at
  if (typeof body.booking_closes_at === 'string' || body.booking_closes_at === null) patch.booking_closes_at = body.booking_closes_at
  if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim()
  if (typeof body.event_date === 'string') patch.event_date = body.event_date
  if (typeof body.earliest_slot === 'string') patch.earliest_slot = body.earliest_slot
  if (typeof body.latest_slot === 'string') patch.latest_slot = body.latest_slot
  if (typeof body.slot_duration_minutes === 'number') patch.slot_duration_minutes = body.slot_duration_minutes
  if (typeof body.break_between_slots_minutes === 'number') patch.break_between_slots_minutes = body.break_between_slots_minutes

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })

  // Draft->Open gate: require at least 5 staff with availability rows.
  if (patch.status === 'open') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (admin as any)
      .from('parent_evening_availability')
      .select('id', { count: 'exact', head: true })
      .eq('parent_evening_id', id)
    if ((count ?? 0) < 1) {
      return NextResponse.json({ error: 'At least one staff member must have availability before opening bookings.' }, { status: 400 })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: before } = await (admin as any)
    .from('parent_evenings')
    .select('status, name, event_date, booking_closes_at')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evenings')
    .update(patch)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If we just flipped status from not-open to open, notify parents of
  // students at the school. Year group targeting is not available on the
  // evening itself -- the convention is that an admin sets up one evening
  // per year group by name, so we broadcast to every active parent.
  if (patch.status === 'open' && before && before.status !== 'open') {
    try {
      const { sendSchoolNotification, templates } = await import('@/lib/school/notifications')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: linkRows } = await (admin as any)
        .from('school_student_links')
        .select('student_id')
        .eq('school_id', ctx.schoolId)
      type LR = { student_id: string }
      const studentIds = ((linkRows ?? []) as LR[]).map((r) => r.student_id)
      if (studentIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: parentLinks } = await (admin as any)
          .from('parent_student_links')
          .select('parent_id')
          .in('student_id', studentIds)
          .eq('status', 'active')
        type PL = { parent_id: string | null }
        const parentIds = Array.from(
          new Set(
            ((parentLinks ?? []) as PL[]).map((r) => r.parent_id).filter((v): v is string => !!v)
          )
        )
        if (parentIds.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: school } = await (admin as any)
            .from('schools')
            .select('name, settings')
            .eq('id', ctx.schoolId)
            .maybeSingle()
          const schoolName = (school?.name as string | null) ?? 'School'
          const settings = (school?.settings as Record<string, unknown> | null) ?? {}
          const headerColour =
            typeof settings['primary_colour'] === 'string'
              ? (settings['primary_colour'] as string)
              : '#1B3A5C'
          const logoUrl = typeof settings['logo_url'] === 'string' ? (settings['logo_url'] as string) : null
          const appBase = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pathfinderscot.co.uk'
          const emailOverride = templates.parentEveningOpen({
            schoolName,
            eveningName: before.name as string,
            eventDate: before.event_date as string,
            bookingCloses: (before.booking_closes_at as string | null) ?? 'the closing date',
            bookingUrl: `${appBase}/parent/parents-evening/${id}`,
            headerColour,
            logoUrl,
          })
          await sendSchoolNotification({
            admin,
            schoolId: ctx.schoolId,
            type: 'parent_evening_reminder',
            title: `Book your ${before.name} appointments`,
            body: `Booking is now open for ${before.name} on ${before.event_date}. Please book your appointments before the window closes.`,
            targetParentIds: parentIds,
            channel: 'both',
            createdBy: ctx.userId,
            emailOverride,
          })
        }
      }
    } catch {
      // Best-effort.
    }
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/school/parents-evening/[id] -- admin only
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('parent_evenings')
    .delete()
    .eq('id', id)
    .eq('school_id', ctx.schoolId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
