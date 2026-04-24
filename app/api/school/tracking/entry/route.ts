import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// Whitelist of fields the grid can patch via this endpoint. Keep restrictive:
// cycle_id / class_assignment_id / student_id are unique-key components and
// must not be patched (would violate the UNIQUE and silently create dupes).
const ALLOWED_FIELDS = new Set([
  'working_grade',
  'on_track',
  'effort',
  'comment',
  'comment_bank_id',
  'is_predicted_grade',
  'actual_grade',
])

const ON_TRACK_VALUES = new Set(['above', 'on_track', 'below', 'significantly_below', null])
const EFFORT_VALUES = new Set(['excellent', 'good', 'satisfactory', 'concern', null])

// POST /api/school/tracking/entry — upsert a single field on the tracking
// row keyed by (cycle_id, class_assignment_id, student_id). This is the
// auto-save endpoint hit on every cell change in the grid.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustEditTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    cycle_id?: unknown
    class_assignment_id?: unknown
    student_id?: unknown
    field_name?: unknown
    value?: unknown
    custom_metric_key?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const cycleId = typeof body.cycle_id === 'string' ? body.cycle_id : ''
  const classAssignmentId = typeof body.class_assignment_id === 'string' ? body.class_assignment_id : ''
  const studentId = typeof body.student_id === 'string' ? body.student_id : ''
  const fieldName = typeof body.field_name === 'string' ? body.field_name : ''
  const customKey = typeof body.custom_metric_key === 'string' ? body.custom_metric_key : null

  if (!cycleId || !classAssignmentId || !studentId || !fieldName) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Guard: the cycle must not be locked.
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

  // Guard: class must belong to this school; teacher must own it or be admin.
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

  // Build the patch. Custom metrics go into the custom_metrics JSONB blob,
  // other fields are whitelisted columns.
  let patch: Record<string, unknown> = {}
  if (fieldName === 'custom_metric') {
    if (!customKey) return NextResponse.json({ error: 'custom_metric_key required.' }, { status: 400 })
    // Read current entry to merge custom_metrics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (admin as any)
      .from('tracking_entries')
      .select('custom_metrics')
      .eq('cycle_id', cycleId)
      .eq('class_assignment_id', classAssignmentId)
      .eq('student_id', studentId)
      .maybeSingle()
    const blob = (existing?.custom_metrics as Record<string, unknown> | null) ?? {}
    const newBlob = { ...blob, [customKey]: body.value ?? null }
    patch = { custom_metrics: newBlob }
  } else {
    if (!ALLOWED_FIELDS.has(fieldName)) {
      return NextResponse.json({ error: `Field ${fieldName} is not editable.` }, { status: 400 })
    }
    if (fieldName === 'on_track' && body.value !== null && body.value !== undefined) {
      if (!ON_TRACK_VALUES.has(body.value as string)) {
        return NextResponse.json({ error: 'Invalid on_track value.' }, { status: 400 })
      }
    }
    if (fieldName === 'effort' && body.value !== null && body.value !== undefined) {
      if (!EFFORT_VALUES.has(body.value as string)) {
        return NextResponse.json({ error: 'Invalid effort value.' }, { status: 400 })
      }
    }
    patch[fieldName] = body.value ?? null
  }

  // Upsert via the UNIQUE(cycle_id, class_assignment_id, student_id) index.
  const insertRow = {
    school_id: ctx.schoolId,
    cycle_id: cycleId,
    class_assignment_id: classAssignmentId,
    student_id: studentId,
    staff_id: ctx.staffId,
    ...patch,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('tracking_entries')
    .upsert(insertRow, { onConflict: 'cycle_id,class_assignment_id,student_id' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}
