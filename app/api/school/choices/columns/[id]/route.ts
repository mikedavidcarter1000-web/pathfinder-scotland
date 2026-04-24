import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// PATCH /api/school/choices/columns/[id] -- update a column.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>

  // Verify column belongs to this school via round.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: col } = await (admin as any)
    .from('choice_round_columns')
    .select('id, round_id, choice_rounds!inner(school_id, status)')
    .eq('id', id)
    .maybeSingle()
  if (!col || col.choice_rounds.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 })
  }
  if (col.choice_rounds.status === 'finalised') {
    return NextResponse.json({ error: 'Finalised rounds cannot be edited.' }, { status: 409 })
  }

  const patch: Record<string, unknown> = {}
  if (typeof body.label === 'string') patch.label = body.label.trim()
  if (typeof body.description === 'string' || body.description === null) patch.description = body.description
  if (typeof body.is_compulsory === 'boolean') patch.is_compulsory = body.is_compulsory
  if (typeof body.allow_multiple === 'boolean') patch.allow_multiple = body.allow_multiple
  if (typeof body.max_selections === 'number') patch.max_selections = body.max_selections
  if (typeof body.column_position === 'number') patch.column_position = body.column_position

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No updatable fields.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('choice_round_columns')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ column: data })
}

// DELETE /api/school/choices/columns/[id] -- also cascades subjects + choice items.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: col } = await (admin as any)
    .from('choice_round_columns')
    .select('id, choice_rounds!inner(school_id)')
    .eq('id', id)
    .maybeSingle()
  if (!col || col.choice_rounds.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('choice_round_columns')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
