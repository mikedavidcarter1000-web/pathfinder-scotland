import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/tracking/classes — list classes.
// Query params:
//   mine=1              — only classes assigned to the current user
//   academic_year=YYYY/YYYY
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const mine = url.searchParams.get('mine') === '1'
  const academicYear = url.searchParams.get('academic_year')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (admin as any)
    .from('class_assignments')
    .select(
      `id, school_id, staff_id, subject_id, year_group, class_code, qualification_type_id, academic_year, created_at,
       subjects:subject_id (id, name),
       qualification_types:qualification_type_id (id, name, short_name, scqf_level),
       staff:staff_id (id, full_name, email, role, department)`
    )
    .eq('school_id', ctx.schoolId)
    .order('year_group', { ascending: true })

  if (mine) q = q.eq('staff_id', ctx.staffId)
  if (academicYear) q = q.eq('academic_year', academicYear)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const classes = (data ?? []) as Array<Record<string, unknown> & { id: string }>

  // Attach student_count for each class (separate query so we don't nest
  // too many embedded selects).
  if (classes.length > 0) {
    const ids = classes.map((c) => c.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: counts } = await (admin as any)
      .from('class_students')
      .select('class_assignment_id')
      .in('class_assignment_id', ids)
    const byClass: Record<string, number> = {}
    for (const row of counts ?? []) {
      const key = row.class_assignment_id as string
      byClass[key] = (byClass[key] ?? 0) + 1
    }
    for (const c of classes) c.student_count = byClass[c.id] ?? 0
  }

  return NextResponse.json({ classes })
}

// POST /api/school/tracking/classes — create a class assignment.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    staff_id?: unknown
    subject_id?: unknown
    year_group?: unknown
    class_code?: unknown
    qualification_type_id?: unknown
    academic_year?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const staffId = typeof body.staff_id === 'string' ? body.staff_id : ''
  const subjectId = typeof body.subject_id === 'string' ? body.subject_id : null
  const yearGroup = typeof body.year_group === 'string' ? body.year_group.trim() : ''
  const classCode = typeof body.class_code === 'string' ? body.class_code.trim() : null
  const qualificationTypeId =
    typeof body.qualification_type_id === 'string' ? body.qualification_type_id : null
  const academicYear = typeof body.academic_year === 'string' ? body.academic_year.trim() : ''

  if (!staffId || !yearGroup || !academicYear) {
    return NextResponse.json({ error: 'staff_id, year_group and academic_year are required.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('class_assignments')
    .insert({
      school_id: ctx.schoolId,
      staff_id: staffId,
      subject_id: subjectId,
      year_group: yearGroup,
      class_code: classCode,
      qualification_type_id: qualificationTypeId,
      academic_year: academicYear,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ class: data })
}
