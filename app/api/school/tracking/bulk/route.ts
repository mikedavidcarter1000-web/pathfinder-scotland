import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// POST /api/school/tracking/bulk — apply the same field to multiple students
// in one round-trip. Body: { cycle_id, class_assignment_id, field_name,
// value, student_ids[] }.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustEditTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    cycle_id?: unknown
    class_assignment_id?: unknown
    field_name?: unknown
    value?: unknown
    student_ids?: unknown
    custom_metric_key?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const cycleId = typeof body.cycle_id === 'string' ? body.cycle_id : ''
  const classAssignmentId = typeof body.class_assignment_id === 'string' ? body.class_assignment_id : ''
  const fieldName = typeof body.field_name === 'string' ? body.field_name : ''
  const value = body.value ?? null
  const customKey = typeof body.custom_metric_key === 'string' ? body.custom_metric_key : null
  const ids = Array.isArray(body.student_ids)
    ? body.student_ids.filter((v): v is string => typeof v === 'string')
    : []

  if (!cycleId || !classAssignmentId || !fieldName || ids.length === 0) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cycle } = await (admin as any)
    .from('tracking_cycles')
    .select('id, is_locked, school_id')
    .eq('id', cycleId)
    .maybeSingle()
  if (!cycle || cycle.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Cycle not found.' }, { status: 404 })
  }
  if (cycle.is_locked) {
    return NextResponse.json({ error: 'This cycle is locked.' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cls } = await (admin as any)
    .from('class_assignments')
    .select('id, school_id, staff_id')
    .eq('id', classAssignmentId)
    .maybeSingle()
  if (!cls || cls.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Class not found.' }, { status: 404 })
  }
  if (!ctx.isAdmin && cls.staff_id !== ctx.staffId) {
    return NextResponse.json({ error: 'Not your class.' }, { status: 403 })
  }

  // For custom metrics, we need to merge per student (no single UPDATE can
  // atomically mutate JSONB across the row set without reading each first).
  // We read existing in one query, then upsert per row.
  if (fieldName === 'custom_metric') {
    if (!customKey) return NextResponse.json({ error: 'custom_metric_key required.' }, { status: 400 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (admin as any)
      .from('tracking_entries')
      .select('student_id, custom_metrics')
      .eq('cycle_id', cycleId)
      .eq('class_assignment_id', classAssignmentId)
      .in('student_id', ids)
    const current = new Map<string, Record<string, unknown>>()
    for (const r of (existing ?? []) as Array<{ student_id: string; custom_metrics: Record<string, unknown> | null }>) {
      current.set(r.student_id, (r.custom_metrics as Record<string, unknown>) ?? {})
    }
    const upserts = ids.map((sid) => ({
      school_id: ctx.schoolId,
      cycle_id: cycleId,
      class_assignment_id: classAssignmentId,
      student_id: sid,
      staff_id: ctx.staffId,
      custom_metrics: { ...(current.get(sid) ?? {}), [customKey]: value },
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from('tracking_entries')
      .upsert(upserts, { onConflict: 'cycle_id,class_assignment_id,student_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, updated: ids.length })
  }

  const upserts = ids.map((sid) => ({
    school_id: ctx.schoolId,
    cycle_id: cycleId,
    class_assignment_id: classAssignmentId,
    student_id: sid,
    staff_id: ctx.staffId,
    [fieldName]: value,
  }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('tracking_entries')
    .upsert(upserts, { onConflict: 'cycle_id,class_assignment_id,student_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, updated: ids.length })
}
