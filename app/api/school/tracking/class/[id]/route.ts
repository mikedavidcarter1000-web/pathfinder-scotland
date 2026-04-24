import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/tracking/class/[id]?cycle_id=...
// Returns the class, students, current tracking entries, custom-metric definitions,
// grade-scale options keyed to the class's qualification type, and comment-bank
// templates (for the teacher's department, falling back to all).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const cycleIdParam = url.searchParams.get('cycle_id')

  // 1) Class assignment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cls, error: clsErr } = await (admin as any)
    .from('class_assignments')
    .select(
      `id, school_id, staff_id, subject_id, year_group, class_code, qualification_type_id, academic_year,
       subjects:subject_id (id, name),
       qualification_types:qualification_type_id (id, name, short_name, scqf_level),
       staff:staff_id (id, full_name, role, department)`
    )
    .eq('id', classId)
    .maybeSingle()
  if (clsErr) return NextResponse.json({ error: clsErr.message }, { status: 500 })
  if (!cls || cls.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Class not found.' }, { status: 404 })
  }

  // 2) Students in the class
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: csLinks } = await (admin as any)
    .from('class_students')
    .select('student_id, students:student_id (id, first_name, last_name, registration_class, house_group)')
    .eq('class_assignment_id', classId)

  type StudentRow = {
    id: string
    first_name: string | null
    last_name: string | null
    registration_class: string | null
    house_group: string | null
  }
  const students: StudentRow[] = ((csLinks ?? []) as Array<{ student_id: string; students: StudentRow | null }>)
    .map((r) => r.students)
    .filter((s): s is StudentRow => !!s)
    .sort((a, b) => (a.last_name ?? '').localeCompare(b.last_name ?? ''))

  // 3) Resolve current cycle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cycleQuery: any = (admin as any)
    .from('tracking_cycles')
    .select('*')
    .eq('school_id', ctx.schoolId)
  cycleQuery = cycleIdParam ? cycleQuery.eq('id', cycleIdParam) : cycleQuery.eq('is_current', true)
  const { data: cycleRow } = await cycleQuery.maybeSingle()

  // 4) Existing tracking entries for this class/cycle
  let entries: Array<Record<string, unknown>> = []
  if (cycleRow) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: entriesData } = await (admin as any)
      .from('tracking_entries')
      .select('*')
      .eq('cycle_id', cycleRow.id)
      .eq('class_assignment_id', classId)
    entries = (entriesData ?? []) as Array<Record<string, unknown>>
  }

  // 5) Grade scale for this qualification type
  let gradeScale: Array<Record<string, unknown>> = []
  if (cls.qualification_type_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: gs } = await (admin as any)
      .from('grade_scales')
      .select('id, grade_label, ucas_points, sort_order, is_pass')
      .eq('qualification_type_id', cls.qualification_type_id)
      .order('sort_order', { ascending: true })
    gradeScale = (gs ?? []) as Array<Record<string, unknown>>
  }

  // 6) Custom metrics (active only)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: metrics } = await (admin as any)
    .from('school_tracking_metrics')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // 7) Comment bank (department-scoped first, then general)
  const staffDept = (cls.staff as { department?: string | null } | null)?.department ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: comments } = await (admin as any)
    .from('comment_banks')
    .select('id, department, category, comment_template')
    .eq('school_id', ctx.schoolId)
    .or(staffDept ? `department.eq.${staffDept},department.is.null` : 'department.is.null,department.not.is.null')
    .order('category', { ascending: true })

  return NextResponse.json({
    class: cls,
    students,
    cycle: cycleRow,
    entries,
    grade_scale: gradeScale,
    metrics: metrics ?? [],
    comments: comments ?? [],
  })
}
