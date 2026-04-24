import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET columns for a round (staff only; student-facing is via /api/student/choices/[roundId]).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roundId } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: round } = await (admin as any)
    .from('choice_rounds')
    .select('id')
    .eq('id', roundId)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('choice_round_columns')
    .select('*')
    .eq('round_id', roundId)
    .order('column_position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ columns: data ?? [] })
}

// POST a new column for a round. Requires can_manage_tracking.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roundId } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: round } = await (admin as any)
    .from('choice_rounds')
    .select('id, status')
    .eq('id', roundId)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  if (round.status === 'finalised') {
    return NextResponse.json({ error: 'Finalised rounds cannot be edited.' }, { status: 409 })
  }

  const body = (await req.json().catch(() => null)) as {
    label?: unknown
    description?: unknown
    column_position?: unknown
    is_compulsory?: unknown
    allow_multiple?: unknown
    max_selections?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const label = typeof body.label === 'string' ? body.label.trim() : ''
  if (!label) return NextResponse.json({ error: 'Label is required.' }, { status: 400 })

  // Determine next column_position if not provided.
  let position = typeof body.column_position === 'number' ? body.column_position : null
  if (position === null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (admin as any)
      .from('choice_round_columns')
      .select('column_position')
      .eq('round_id', roundId)
      .order('column_position', { ascending: false })
      .limit(1)
    position = existing && existing.length > 0 ? existing[0].column_position + 1 : 1
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('choice_round_columns')
    .insert({
      round_id: roundId,
      column_position: position,
      label,
      description: typeof body.description === 'string' ? body.description : null,
      is_compulsory: !!body.is_compulsory,
      allow_multiple: !!body.allow_multiple,
      max_selections: typeof body.max_selections === 'number' ? body.max_selections : 1,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ column: data })
}
