import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/tracking/departments — department-level roll-up for faculty
// heads and leadership. Returns per-department stats: teacher count, class
// count, student count, completion %, grade distribution, on-track breakdown,
// effort breakdown.
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const cycleIdParam = url.searchParams.get('cycle_id')

  // Resolve the target cycle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cq: any = (admin as any).from('tracking_cycles').select('*').eq('school_id', ctx.schoolId)
  cq = cycleIdParam ? cq.eq('id', cycleIdParam) : cq.eq('is_current', true)
  const { data: cycle } = await cq.maybeSingle()

  // Pull staff so we can group by department
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('school_staff')
    .select('id, full_name, role, department')
    .eq('school_id', ctx.schoolId)

  // Pull classes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classes } = await (admin as any)
    .from('class_assignments')
    .select('id, staff_id, subject_id, year_group, qualification_type_id, academic_year, subjects:subject_id(name)')
    .eq('school_id', ctx.schoolId)

  // Pull class_students for headcounts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: csLinks } = await (admin as any)
    .from('class_students')
    .select('class_assignment_id, student_id')

  // Pull entries for this cycle
  let entries: Array<Record<string, unknown>> = []
  if (cycle) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: es } = await (admin as any)
      .from('tracking_entries')
      .select('class_assignment_id, working_grade, on_track, effort, student_id')
      .eq('cycle_id', cycle.id)
    entries = (es ?? []) as Array<Record<string, unknown>>
  }

  type ClassRow = {
    id: string
    staff_id: string
    subject_id: string | null
    year_group: string
    qualification_type_id: string | null
    subjects: { name: string } | null
  }
  type StaffRow = { id: string; department: string | null }

  const staffMap = new Map<string, StaffRow>(((staff ?? []) as StaffRow[]).map((s) => [s.id, s]))
  const deptByClass = new Map<string, string>()
  for (const c of (classes ?? []) as ClassRow[]) {
    const st = staffMap.get(c.staff_id)
    deptByClass.set(c.id, st?.department ?? '(No department)')
  }

  // Headcount per class
  const studentsPerClass = new Map<string, Set<string>>()
  for (const r of (csLinks ?? []) as Array<{ class_assignment_id: string; student_id: string }>) {
    const set = studentsPerClass.get(r.class_assignment_id) ?? new Set<string>()
    set.add(r.student_id)
    studentsPerClass.set(r.class_assignment_id, set)
  }

  type Bucket = {
    department: string
    teacher_count: number
    class_count: number
    student_count: number
    expected_entries: number
    actual_entries: number
    grade_counts: Record<string, number>
    on_track_counts: Record<string, number>
    effort_counts: Record<string, number>
  }
  const byDept = new Map<string, Bucket>()
  const staffByDept = new Map<string, Set<string>>()

  function bucket(dept: string): Bucket {
    let b = byDept.get(dept)
    if (!b) {
      b = {
        department: dept,
        teacher_count: 0,
        class_count: 0,
        student_count: 0,
        expected_entries: 0,
        actual_entries: 0,
        grade_counts: {},
        on_track_counts: {},
        effort_counts: {},
      }
      byDept.set(dept, b)
    }
    return b
  }

  for (const s of (staff ?? []) as Array<{ id: string; department: string | null }>) {
    const dept = s.department ?? '(No department)'
    const set = staffByDept.get(dept) ?? new Set<string>()
    set.add(s.id)
    staffByDept.set(dept, set)
  }
  for (const [dept, set] of staffByDept.entries()) {
    bucket(dept).teacher_count = set.size
  }

  for (const c of (classes ?? []) as ClassRow[]) {
    const dept = deptByClass.get(c.id) ?? '(No department)'
    const b = bucket(dept)
    b.class_count += 1
    b.student_count += studentsPerClass.get(c.id)?.size ?? 0
    b.expected_entries += studentsPerClass.get(c.id)?.size ?? 0
  }

  for (const e of entries) {
    const classId = e.class_assignment_id as string
    const dept = deptByClass.get(classId) ?? '(No department)'
    const b = bucket(dept)
    b.actual_entries += 1
    const grade = (e.working_grade as string | null) ?? null
    if (grade) b.grade_counts[grade] = (b.grade_counts[grade] ?? 0) + 1
    const ot = (e.on_track as string | null) ?? null
    if (ot) b.on_track_counts[ot] = (b.on_track_counts[ot] ?? 0) + 1
    const ef = (e.effort as string | null) ?? null
    if (ef) b.effort_counts[ef] = (b.effort_counts[ef] ?? 0) + 1
  }

  const departments = Array.from(byDept.values())
    .map((d) => ({
      ...d,
      completion_pct: d.expected_entries === 0 ? 0 : Math.round((d.actual_entries / d.expected_entries) * 100),
    }))
    .sort((a, b) => a.department.localeCompare(b.department))

  return NextResponse.json({ cycle, departments })
}
