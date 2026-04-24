import { NextResponse } from 'next/server'
import { requireStudentApi } from '@/lib/school/student-auth'

export const runtime = 'nodejs'

// GET /api/student/choices/[roundId] -- round detail + columns + subjects + current draft.
export async function GET(_req: Request, { params }: { params: Promise<{ roundId: string }> }) {
  const { roundId } = await params
  const guard = await requireStudentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: round } = await (admin as any)
    .from('choice_rounds')
    .select('*, schools(name, slug)')
    .eq('id', roundId)
    .in('school_id', ctx.schoolIds.length > 0 ? ctx.schoolIds : ['00000000-0000-0000-0000-000000000000'])
    .maybeSingle()

  if (!round) {
    return NextResponse.json({ error: 'Round not found or not at your school.' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: columns } = await (admin as any)
    .from('choice_round_columns')
    .select('*')
    .eq('round_id', roundId)
    .order('column_position', { ascending: true })

  const columnIds = (columns ?? []).map((c: { id: string }) => c.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: columnSubjects } = columnIds.length > 0
    ? await (admin as any)
        .from('choice_round_column_subjects')
        .select('id, column_id, subject_id, qualification_type_id, capacity, display_order, notes, subjects(id, name, description, why_choose), qualification_types(id, short_name, name)')
        .in('column_id', columnIds)
        .order('display_order', { ascending: true })
    : { data: [] }

  // Student's current submission (may be null).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: myChoice } = await (admin as any)
    .from('student_choices')
    .select('*')
    .eq('round_id', roundId)
    .eq('student_id', ctx.userId)
    .maybeSingle()

  let myItems: unknown[] = []
  if (myChoice) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('student_choice_items')
      .select('*')
      .eq('student_choice_id', myChoice.id)
    myItems = data ?? []
  }

  return NextResponse.json({
    round,
    columns: columns ?? [],
    column_subjects: columnSubjects ?? [],
    my_choice: myChoice,
    my_items: myItems,
  })
}

// PUT /api/student/choices/[roundId] -- create or update the draft.
// Body: { items: [{ column_id, column_subject_id, subject_id, is_reserve? }] }
export async function PUT(req: Request, { params }: { params: Promise<{ roundId: string }> }) {
  const { roundId } = await params
  const guard = await requireStudentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    items?: Array<{ column_id: string; column_subject_id: string; subject_id: string; is_reserve?: boolean; reserve_order?: number }>
    notes?: string
  } | null

  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'items array required.' }, { status: 400 })
  }

  // Round must be open and at a school the student is linked to.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: round } = await (admin as any)
    .from('choice_rounds')
    .select('id, school_id, status, requires_parent_approval')
    .eq('id', roundId)
    .maybeSingle()
  if (!round) return NextResponse.json({ error: 'Round not found.' }, { status: 404 })
  if (!ctx.schoolIds.includes(round.school_id)) {
    return NextResponse.json({ error: 'Not linked to this school.' }, { status: 403 })
  }
  if (round.status !== 'open') {
    return NextResponse.json({ error: 'This round is not open for submissions.' }, { status: 409 })
  }

  // Upsert the student_choices header.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from('student_choices')
    .select('id, status')
    .eq('round_id', roundId)
    .eq('student_id', ctx.userId)
    .maybeSingle()

  let choiceId: string
  if (existing) {
    // Cannot edit once confirmed.
    if (existing.status === 'confirmed') {
      return NextResponse.json({ error: 'Your choices are confirmed and cannot be changed. Contact your school.' }, { status: 409 })
    }
    choiceId = existing.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updErr } = await (admin as any)
      .from('student_choices')
      .update({ notes: typeof body.notes === 'string' ? body.notes : null })
      .eq('id', choiceId)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ins, error: insErr } = await (admin as any)
      .from('student_choices')
      .insert({
        round_id: roundId,
        student_id: ctx.userId,
        school_id: round.school_id,
        status: 'draft',
        parent_approval_required: !!round.requires_parent_approval,
        notes: typeof body.notes === 'string' ? body.notes : null,
      })
      .select('id')
      .single()
    if (insErr || !ins) return NextResponse.json({ error: insErr?.message ?? 'Insert failed' }, { status: 500 })
    choiceId = ins.id
  }

  // Replace items: simplest, correct. Delete existing, insert new.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('student_choice_items').delete().eq('student_choice_id', choiceId)

  if (body.items.length > 0) {
    const rows = body.items.map((i) => ({
      student_choice_id: choiceId,
      column_id: i.column_id,
      column_subject_id: i.column_subject_id,
      subject_id: i.subject_id,
      is_reserve: !!i.is_reserve,
      reserve_order: typeof i.reserve_order === 'number' ? i.reserve_order : null,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: itemsErr } = await (admin as any).from('student_choice_items').insert(rows)
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, student_choice_id: choiceId })
}
