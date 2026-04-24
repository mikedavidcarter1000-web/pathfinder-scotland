import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

type HeatmapSubject = {
  column_subject_id: string
  subject_id: string
  subject_name: string
  capacity: number | null
  current_demand: number
  oversubscribed: boolean
  fill_pct: number | null
}

type HeatmapColumn = {
  column_id: string
  column_position: number
  label: string
  is_compulsory: boolean
  allow_multiple: boolean
  subjects: HeatmapSubject[]
}

// GET /api/school/choices/rounds/[id]/heatmap
// Returns per-column subject demand, capacity, oversubscription flag, and fill pct.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: roundId } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: round } = await (admin as any)
    .from('choice_rounds')
    .select('id, name, year_group, academic_year, status, school_id')
    .eq('id', roundId)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })

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
        .select('id, column_id, subject_id, capacity, current_demand, display_order, subjects(name)')
        .in('column_id', columnIds)
        .order('display_order', { ascending: true })
    : { data: [] }

  const byCol = new Map<string, HeatmapSubject[]>()
  for (const cs of columnSubjects ?? []) {
    const row: HeatmapSubject = {
      column_subject_id: cs.id,
      subject_id: cs.subject_id,
      subject_name: cs.subjects?.name ?? 'Unknown',
      capacity: cs.capacity,
      current_demand: cs.current_demand ?? 0,
      oversubscribed: cs.capacity !== null && (cs.current_demand ?? 0) > cs.capacity,
      fill_pct: cs.capacity !== null && cs.capacity > 0 ? Math.round(((cs.current_demand ?? 0) / cs.capacity) * 100) : null,
    }
    const arr = byCol.get(cs.column_id) ?? []
    arr.push(row)
    byCol.set(cs.column_id, arr)
  }

  const heatmap: HeatmapColumn[] = (columns ?? []).map((c: { id: string; column_position: number; label: string; is_compulsory: boolean; allow_multiple: boolean }) => ({
    column_id: c.id,
    column_position: c.column_position,
    label: c.label,
    is_compulsory: c.is_compulsory,
    allow_multiple: c.allow_multiple,
    subjects: byCol.get(c.id) ?? [],
  }))

  // Submission stats.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: total } = await (admin as any)
    .from('student_choices')
    .select('id', { count: 'exact', head: true })
    .eq('round_id', roundId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: committed } = await (admin as any)
    .from('student_choices')
    .select('id', { count: 'exact', head: true })
    .eq('round_id', roundId)
    .in('status', ['submitted', 'parent_pending', 'confirmed'])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: drafts } = await (admin as any)
    .from('student_choices')
    .select('id', { count: 'exact', head: true })
    .eq('round_id', roundId)
    .eq('status', 'draft')

  return NextResponse.json({
    round,
    heatmap,
    stats: {
      total: total ?? 0,
      committed: committed ?? 0,
      drafts: drafts ?? 0,
    },
  })
}
