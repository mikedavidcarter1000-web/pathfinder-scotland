import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// PATCH /api/school/choices/column-subjects/[id] -- update capacity / display_order / notes.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>

  // Verify via join.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (admin as any)
    .from('choice_round_column_subjects')
    .select('id, choice_round_columns!inner(round_id, choice_rounds!inner(school_id, status))')
    .eq('id', id)
    .maybeSingle()
  if (!row || row.choice_round_columns.choice_rounds.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Row not found' }, { status: 404 })
  }
  if (row.choice_round_columns.choice_rounds.status === 'finalised') {
    return NextResponse.json({ error: 'Finalised rounds cannot be edited.' }, { status: 409 })
  }

  const patch: Record<string, unknown> = {}
  if (typeof body.capacity === 'number' || body.capacity === null) patch.capacity = body.capacity
  if (typeof body.display_order === 'number') patch.display_order = body.display_order
  if (typeof body.notes === 'string' || body.notes === null) patch.notes = body.notes
  if (typeof body.qualification_type_id === 'string' || body.qualification_type_id === null) {
    patch.qualification_type_id = body.qualification_type_id
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No updatable fields.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('choice_round_column_subjects')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ column_subject: data })
}

// DELETE /api/school/choices/column-subjects/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (admin as any)
    .from('choice_round_column_subjects')
    .select('id, choice_round_columns!inner(choice_rounds!inner(school_id))')
    .eq('id', id)
    .maybeSingle()
  if (!row || row.choice_round_columns.choice_rounds.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Row not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('choice_round_column_subjects')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
