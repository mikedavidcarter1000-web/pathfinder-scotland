import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/choices/rounds/[id] -- round detail with columns & subjects.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: round, error: roundErr } = await (admin as any)
    .from('choice_rounds')
    .select('*')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()

  if (roundErr) return NextResponse.json({ error: roundErr.message }, { status: 500 })
  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: columns } = await (admin as any)
    .from('choice_round_columns')
    .select('*')
    .eq('round_id', id)
    .order('column_position', { ascending: true })

  const columnIds = (columns ?? []).map((c: { id: string }) => c.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: columnSubjects } = columnIds.length
    ? await (admin as any)
        .from('choice_round_column_subjects')
        .select('*, subjects(id, name, is_available_n5, is_available_higher, is_available_adv_higher), qualification_types(id, short_name, name)')
        .in('column_id', columnIds)
        .order('display_order', { ascending: true })
    : { data: [] }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: submissionCount } = await (admin as any)
    .from('student_choices')
    .select('id', { count: 'exact', head: true })
    .eq('round_id', id)
    .in('status', ['submitted', 'parent_pending', 'confirmed'])

  return NextResponse.json({
    round,
    columns: columns ?? [],
    column_subjects: columnSubjects ?? [],
    submission_count: submissionCount ?? 0,
  })
}

// PATCH /api/school/choices/rounds/[id] -- update a round (status transitions, edits).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>

  const patch: Record<string, unknown> = {}
  if (typeof body.name === 'string') patch.name = body.name.trim()
  if (typeof body.academic_year === 'string') patch.academic_year = body.academic_year.trim()
  if (typeof body.year_group === 'string') patch.year_group = body.year_group.trim()
  if (typeof body.transition === 'string' || body.transition === null) patch.transition = body.transition
  if (typeof body.opens_at === 'string' || body.opens_at === null) patch.opens_at = body.opens_at
  if (typeof body.closes_at === 'string' || body.closes_at === null) patch.closes_at = body.closes_at
  if (typeof body.requires_parent_approval === 'boolean') patch.requires_parent_approval = body.requires_parent_approval
  if (typeof body.instructions === 'string' || body.instructions === null) patch.instructions = body.instructions

  if (typeof body.status === 'string') {
    if (!['draft', 'open', 'closed', 'finalised'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    }
    patch.status = body.status
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No updatable fields.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('choice_rounds')
    .update(patch)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ round: data })
}

// DELETE /api/school/choices/rounds/[id] -- admin only.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('choice_rounds')
    .delete()
    .eq('id', id)
    .eq('school_id', ctx.schoolId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
