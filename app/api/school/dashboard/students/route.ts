import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function GET() {
  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: linkRows } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', ctx.schoolId)
  const studentIds: string[] = (linkRows ?? []).map((r: { student_id: string }) => r.student_id)

  if (studentIds.length === 0) {
    return NextResponse.json({ students: [] })
  }

  // Read safe columns only -- never sensitive flags
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, email, school_stage, simd_decile, last_active_at')
    .in('id', studentIds)

  const ids = (rows ?? []).map((r: { id: string }) => r.id)

  // Aggregate counts in parallel
  const [savedByStudent, quizByStudent, exploredByStudent] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('saved_courses').select('student_id').in('student_id', ids),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('quiz_results').select('student_id').in('student_id', ids),
    // Explored careers via saved_careers if exists -- else use empty
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('saved_courses')
      .select('student_id, courses!inner(category)')
      .in('student_id', ids),
  ])

  const countBy = (arr: { student_id: string }[] | null) => {
    const map = new Map<string, number>()
    for (const r of arr ?? []) map.set(r.student_id, (map.get(r.student_id) || 0) + 1)
    return map
  }
  const savedCount = countBy(savedByStudent.data)
  const quizCount = countBy(quizByStudent.data)
  const categoriesPerStudent = new Map<string, Set<string>>()
  for (const r of (exploredByStudent.data ?? []) as Array<{ student_id: string; courses?: { category?: string | null } }>) {
    const cat = r.courses?.category
    if (!cat) continue
    if (!categoriesPerStudent.has(r.student_id)) categoriesPerStudent.set(r.student_id, new Set())
    categoriesPerStudent.get(r.student_id)!.add(cat)
  }

  const students = (rows ?? []).map((r: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    school_stage: string | null
    simd_decile: number | null
    last_active_at: string | null
  }) => ({
    id: r.id,
    firstName: r.first_name ?? '',
    lastName: r.last_name ?? '',
    email: r.email ?? '',
    schoolStage: r.school_stage,
    simdDecile: r.simd_decile,
    lastActiveAt: r.last_active_at,
    coursesSaved: savedCount.get(r.id) || 0,
    sectorsExplored: categoriesPerStudent.get(r.id)?.size || 0,
    quizCompleted: (quizCount.get(r.id) || 0) > 0,
  }))

  return NextResponse.json({ students })
}
