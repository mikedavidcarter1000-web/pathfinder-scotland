import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/tracking/departments/[dept]?cycle_id=...
// Returns per-class breakdown for the department.
export async function GET(req: Request, { params }: { params: Promise<{ dept: string }> }) {
  const { dept } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const cycleIdParam = url.searchParams.get('cycle_id')
  const deptName = decodeURIComponent(dept)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cq: any = (admin as any).from('tracking_cycles').select('*').eq('school_id', ctx.schoolId)
  cq = cycleIdParam ? cq.eq('id', cycleIdParam) : cq.eq('is_current', true)
  const { data: cycle } = await cq.maybeSingle()

  // Pull staff matching the department
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let staffQ: any = (admin as any)
    .from('school_staff')
    .select('id, full_name, role, department')
    .eq('school_id', ctx.schoolId)
  if (deptName === '(No department)') staffQ = staffQ.is('department', null)
  else staffQ = staffQ.eq('department', deptName)
  const { data: deptStaff } = await staffQ
  const staffIds = ((deptStaff ?? []) as Array<{ id: string }>).map((s) => s.id)

  if (staffIds.length === 0) {
    return NextResponse.json({ cycle, department: deptName, staff: [], classes: [] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classes } = await (admin as any)
    .from('class_assignments')
    .select(
      `id, staff_id, subject_id, year_group, class_code, qualification_type_id,
       subjects:subject_id (id, name),
       qualification_types:qualification_type_id (short_name, name, scqf_level),
       staff:staff_id (id, full_name, role, department)`
    )
    .eq('school_id', ctx.schoolId)
    .in('staff_id', staffIds)

  const classIds = ((classes ?? []) as Array<{ id: string }>).map((c) => c.id)

  // Headcounts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: csLinks } = await (admin as any)
    .from('class_students')
    .select('class_assignment_id, student_id')
    .in('class_assignment_id', classIds.length > 0 ? classIds : ['00000000-0000-0000-0000-000000000000'])
  const headcounts = new Map<string, number>()
  for (const r of (csLinks ?? []) as Array<{ class_assignment_id: string }>) {
    headcounts.set(r.class_assignment_id, (headcounts.get(r.class_assignment_id) ?? 0) + 1)
  }

  // Entries
  let entries: Array<Record<string, unknown>> = []
  if (cycle && classIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: es } = await (admin as any)
      .from('tracking_entries')
      .select('class_assignment_id, working_grade, on_track, effort')
      .eq('cycle_id', cycle.id)
      .in('class_assignment_id', classIds)
    entries = (es ?? []) as Array<Record<string, unknown>>
  }

  // Aggregate per class
  const byClass = new Map<string, { grades: Record<string, number>; on_track: Record<string, number>; effort: Record<string, number>; total: number }>()
  for (const c of (classes ?? []) as Array<{ id: string }>) {
    byClass.set(c.id, { grades: {}, on_track: {}, effort: {}, total: 0 })
  }
  for (const e of entries) {
    const id = e.class_assignment_id as string
    const b = byClass.get(id)
    if (!b) continue
    b.total += 1
    const g = (e.working_grade as string | null) ?? null
    if (g) b.grades[g] = (b.grades[g] ?? 0) + 1
    const o = (e.on_track as string | null) ?? null
    if (o) b.on_track[o] = (b.on_track[o] ?? 0) + 1
    const f = (e.effort as string | null) ?? null
    if (f) b.effort[f] = (b.effort[f] ?? 0) + 1
  }

  type ClsRow = {
    id: string
    staff_id: string
    year_group: string
    class_code: string | null
    subjects: { name: string } | null
    qualification_types: { short_name: string } | null
    staff: { full_name: string; role: string } | null
  }
  const clsList = ((classes ?? []) as ClsRow[]).map((c) => {
    const agg = byClass.get(c.id) ?? { grades: {}, on_track: {}, effort: {}, total: 0 }
    const headcount = headcounts.get(c.id) ?? 0
    const gradeCAAbove =
      (agg.grades['A'] ?? 0) + (agg.grades['B'] ?? 0) + (agg.grades['C'] ?? 0)
    const onTrackPct = headcount === 0 ? 0 : Math.round((((agg.on_track.on_track ?? 0) + (agg.on_track.above ?? 0)) / headcount) * 100)
    const effortGoodPct = headcount === 0 ? 0 : Math.round((((agg.effort.good ?? 0) + (agg.effort.excellent ?? 0)) / headcount) * 100)
    return {
      id: c.id,
      subject_name: c.subjects?.name ?? '—',
      year_group: c.year_group,
      class_code: c.class_code,
      qualification: c.qualification_types?.short_name ?? null,
      teacher: c.staff?.full_name ?? '—',
      teacher_role: c.staff?.role ?? null,
      student_count: headcount,
      graded_count: agg.total,
      completion_pct: headcount === 0 ? 0 : Math.round((agg.total / headcount) * 100),
      grade_counts: agg.grades,
      on_track_counts: agg.on_track,
      effort_counts: agg.effort,
      c_and_above_count: gradeCAAbove,
      on_track_pct: onTrackPct,
      effort_good_pct: effortGoodPct,
    }
  })

  return NextResponse.json({
    cycle,
    department: deptName,
    staff: deptStaff ?? [],
    classes: clsList,
  })
}
