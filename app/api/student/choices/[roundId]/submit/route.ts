import { NextResponse } from 'next/server'
import { requireStudentApi } from '@/lib/school/student-auth'

export const runtime = 'nodejs'

// POST /api/student/choices/[roundId]/submit
// Promotes a draft to 'submitted' (or 'parent_pending' if parent approval required).
// Validates every non-reserve column is filled.
export async function POST(_req: Request, { params }: { params: Promise<{ roundId: string }> }) {
  const { roundId } = await params
  const guard = await requireStudentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: round } = await (admin as any)
    .from('choice_rounds')
    .select('id, school_id, status, requires_parent_approval')
    .eq('id', roundId)
    .maybeSingle()
  if (!round) return NextResponse.json({ error: 'Round not found.' }, { status: 404 })
  if (round.status !== 'open') {
    return NextResponse.json({ error: 'This round is not open.' }, { status: 409 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: choice } = await (admin as any)
    .from('student_choices')
    .select('id, status')
    .eq('round_id', roundId)
    .eq('student_id', ctx.userId)
    .maybeSingle()

  if (!choice) {
    return NextResponse.json({ error: 'No draft found. Save your choices before submitting.' }, { status: 404 })
  }
  if (choice.status === 'confirmed') {
    return NextResponse.json({ error: 'Already confirmed.' }, { status: 409 })
  }

  // Validate every non-compulsory column has a selection (or compulsory is auto-selected).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: columns } = await (admin as any)
    .from('choice_round_columns')
    .select('id, label, allow_multiple, max_selections')
    .eq('round_id', roundId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (admin as any)
    .from('student_choice_items')
    .select('column_id, is_reserve')
    .eq('student_choice_id', choice.id)

  const nonReserveByColumn = new Map<string, number>()
  for (const it of items ?? []) {
    if (!it.is_reserve) {
      nonReserveByColumn.set(it.column_id, (nonReserveByColumn.get(it.column_id) ?? 0) + 1)
    }
  }
  const missing: string[] = []
  for (const col of columns ?? []) {
    const count = nonReserveByColumn.get(col.id) ?? 0
    if (count === 0) missing.push(col.label)
  }
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Some columns have no selection: ${missing.join(', ')}.` },
      { status: 400 }
    )
  }

  const newStatus = round.requires_parent_approval ? 'parent_pending' : 'submitted'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('student_choices')
    .update({
      status: newStatus,
      submitted_at: new Date().toISOString(),
      parent_approval_required: !!round.requires_parent_approval,
    })
    .eq('id', choice.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ student_choice: data })
}
