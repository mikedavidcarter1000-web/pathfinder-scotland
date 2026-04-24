import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { getCesCapacities } from '@/lib/school/analytics'

export async function GET() {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Analytics is leadership-only' }, { status: 403 })
  }

  const ces = await getCesCapacities(admin, ctx.schoolId)

  // DYW summary: percentage who explored 3+ sectors, saved 1+ course, completed quiz.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any)
    .from('school_student_links').select('student_id').eq('school_id', ctx.schoolId)
  const ids: string[] = (links ?? []).map((l: { student_id: string }) => l.student_id)
  let quizzedPct = 0
  let savedPct = 0
  let comparedPct = 0
  if (ids.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: quizzes } = await (admin as any).from('quiz_results').select('student_id').in('student_id', ids)
    const quizSet = new Set<string>((quizzes ?? []).map((q: { student_id: string }) => q.student_id))
    quizzedPct = Math.round((quizSet.size / ids.length) * 1000) / 10
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: saved } = await (admin as any).from('saved_courses').select('student_id').in('student_id', ids)
    const savedSet = new Set<string>((saved ?? []).map((s: { student_id: string }) => s.student_id))
    savedPct = Math.round((savedSet.size / ids.length) * 1000) / 10
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: compared } = await (admin as any).from('saved_comparisons').select('user_id').in('user_id', ids)
    const compSet = new Set<string>((compared ?? []).map((c: { user_id: string }) => c.user_id))
    comparedPct = Math.round((compSet.size / ids.length) * 1000) / 10
  }

  return NextResponse.json({
    ces,
    dyw_summary: {
      quizzed_pct: quizzedPct,
      saved_course_pct: savedPct,
      compared_careers_pct: comparedPct,
      total_students: ids.length,
    },
  })
}
