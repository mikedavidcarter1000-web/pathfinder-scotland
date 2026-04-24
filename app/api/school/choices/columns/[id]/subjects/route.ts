import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET subjects for a column.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: columnId } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: col } = await (admin as any)
    .from('choice_round_columns')
    .select('id, choice_rounds!inner(school_id)')
    .eq('id', columnId)
    .maybeSingle()
  if (!col || col.choice_rounds.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('choice_round_column_subjects')
    .select('*, subjects(id, name), qualification_types(id, short_name, name)')
    .eq('column_id', columnId)
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ column_subjects: data ?? [] })
}

// POST -- add subject(s) to column. Body: { subject_id, qualification_type_id?, capacity?, notes? }
// or bulk: { subjects: [{ subject_id, ... }] }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: columnId } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: col } = await (admin as any)
    .from('choice_round_columns')
    .select('id, choice_rounds!inner(school_id, status)')
    .eq('id', columnId)
    .maybeSingle()
  if (!col || col.choice_rounds.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 })
  }
  if (col.choice_rounds.status === 'finalised') {
    return NextResponse.json({ error: 'Finalised rounds cannot be edited.' }, { status: 409 })
  }

  const body = (await req.json().catch(() => null)) as
    | {
        subjects?: Array<{
          subject_id: string
          qualification_type_id?: string | null
          capacity?: number | null
          display_order?: number
          notes?: string | null
        }>
        subject_id?: string
        qualification_type_id?: string | null
        capacity?: number | null
        notes?: string | null
        display_order?: number
      }
    | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const batch = Array.isArray(body.subjects) && body.subjects.length > 0
    ? body.subjects
    : body.subject_id
      ? [{
          subject_id: body.subject_id,
          qualification_type_id: body.qualification_type_id ?? null,
          capacity: body.capacity ?? null,
          display_order: body.display_order ?? 0,
          notes: body.notes ?? null,
        }]
      : []

  if (batch.length === 0) {
    return NextResponse.json({ error: 'At least one subject_id is required.' }, { status: 400 })
  }

  const rows = batch.map((s, idx) => ({
    column_id: columnId,
    subject_id: s.subject_id,
    qualification_type_id: s.qualification_type_id ?? null,
    capacity: s.capacity ?? null,
    display_order: s.display_order ?? idx,
    notes: s.notes ?? null,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('choice_round_column_subjects')
    .upsert(rows, { onConflict: 'column_id,subject_id' })
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ column_subjects: data ?? [] })
}
