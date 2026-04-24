import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

type ColumnRow = {
  id: string
  round_id: string
  column_position: number
  label: string
  description: string | null
  is_compulsory: boolean
  allow_multiple: boolean
  max_selections: number
}

type ColumnSubjectRow = {
  id: string
  column_id: string
  subject_id: string
  qualification_type_id: string | null
  capacity: number | null
  display_order: number
  notes: string | null
}

// POST /api/school/choices/rounds/[id]/copy-from
// Body: { source_round_id: string }
// Copies column structure + column_subjects from source round into target.
// Does NOT copy student_choices. Fails if target already has columns.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetId } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as { source_round_id?: unknown } | null
  const sourceId = typeof body?.source_round_id === 'string' ? body.source_round_id : ''
  if (!sourceId) return NextResponse.json({ error: 'source_round_id is required.' }, { status: 400 })

  // Both rounds must belong to this school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rounds } = await (admin as any)
    .from('choice_rounds')
    .select('id, school_id')
    .in('id', [sourceId, targetId])

  const target = (rounds ?? []).find((r: { id: string }) => r.id === targetId)
  const source = (rounds ?? []).find((r: { id: string }) => r.id === sourceId)
  if (!target || target.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Target round not found.' }, { status: 404 })
  }
  if (!source || source.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Source round not found.' }, { status: 404 })
  }

  // Target must have zero columns to avoid surprise overwrites.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: existingColumns } = await (admin as any)
    .from('choice_round_columns')
    .select('id', { count: 'exact', head: true })
    .eq('round_id', targetId)
  if ((existingColumns ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Target round already has columns. Delete them first or copy into a fresh round.' },
      { status: 409 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sourceColumns } = await (admin as any)
    .from('choice_round_columns')
    .select('*')
    .eq('round_id', sourceId)
    .order('column_position', { ascending: true })

  if (!sourceColumns || sourceColumns.length === 0) {
    return NextResponse.json({ error: 'Source round has no columns to copy.' }, { status: 400 })
  }

  const sourceColIds = (sourceColumns as ColumnRow[]).map((c) => c.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sourceSubjects } = await (admin as any)
    .from('choice_round_column_subjects')
    .select('*')
    .in('column_id', sourceColIds)

  // Insert columns, keep old_id -> new_id map.
  const columnInserts = (sourceColumns as ColumnRow[]).map((c) => ({
    round_id: targetId,
    column_position: c.column_position,
    label: c.label,
    description: c.description,
    is_compulsory: c.is_compulsory,
    allow_multiple: c.allow_multiple,
    max_selections: c.max_selections,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newColumns, error: insertColErr } = await (admin as any)
    .from('choice_round_columns')
    .insert(columnInserts)
    .select('id, column_position')

  if (insertColErr) {
    return NextResponse.json({ error: insertColErr.message }, { status: 500 })
  }

  // Build old->new map by column_position (unique within round).
  const positionToNewId = new Map<number, string>()
  for (const c of newColumns as { id: string; column_position: number }[]) {
    positionToNewId.set(c.column_position, c.id)
  }
  const oldIdToNewId = new Map<string, string>()
  for (const c of sourceColumns as ColumnRow[]) {
    const newId = positionToNewId.get(c.column_position)
    if (newId) oldIdToNewId.set(c.id, newId)
  }

  if ((sourceSubjects ?? []).length > 0) {
    const subjectInserts = (sourceSubjects as ColumnSubjectRow[])
      .map((s) => {
        const newColId = oldIdToNewId.get(s.column_id)
        if (!newColId) return null
        return {
          column_id: newColId,
          subject_id: s.subject_id,
          qualification_type_id: s.qualification_type_id,
          capacity: s.capacity,
          display_order: s.display_order,
          notes: s.notes,
        }
      })
      .filter((s): s is NonNullable<typeof s> => !!s)

    if (subjectInserts.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertSubErr } = await (admin as any)
        .from('choice_round_column_subjects')
        .insert(subjectInserts)
      if (insertSubErr) {
        return NextResponse.json({ error: insertSubErr.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ ok: true, columns_copied: newColumns.length })
}
