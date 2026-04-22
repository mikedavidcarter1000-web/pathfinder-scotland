import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const { id: studentId } = await params

  // Verify the student is linked to this school
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (admin as any)
    .from('school_student_links')
    .select('school_id')
    .eq('school_id', ctx.schoolId)
    .eq('student_id', studentId)
    .maybeSingle()
  if (!link) {
    return NextResponse.json({ error: 'Student not in your school.' }, { status: 404 })
  }

  // Safe columns only
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: s } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, school_stage, simd_decile, postcode, last_active_at')
    .eq('id', studentId)
    .maybeSingle()
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Saved courses with entry requirements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: saved } = await (admin as any)
    .from('saved_courses')
    .select('course_id, courses!inner(id, title, university_id, entry_requirements)')
    .eq('student_id', studentId)

  // Predicted grades
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: grades } = await (admin as any)
    .from('student_grades')
    .select('subject_name, qualification_level, grade')
    .eq('student_id', studentId)

  // Subject choices grouped by transition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: choices } = await (admin as any)
    .from('student_subject_choices')
    .select('subject_name, transition, rank_order, is_reserve')
    .eq('student_id', studentId)
    .order('transition')
    .order('rank_order')

  // Checklist progress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: checklist } = await (admin as any)
    .from('student_checklist_progress')
    .select('item_id, completed_at')
    .eq('student_id', studentId)

  return NextResponse.json({
    student: {
      id: s.id,
      firstName: s.first_name,
      lastName: s.last_name,
      schoolStage: s.school_stage,
      simdDecile: s.simd_decile,
      simdAdjustedEligible: typeof s.simd_decile === 'number' && s.simd_decile <= 4,
      lastActiveAt: s.last_active_at,
    },
    savedCourses: saved ?? [],
    grades: grades ?? [],
    subjectChoices: choices ?? [],
    checklistCount: (checklist ?? []).length,
  })
}
