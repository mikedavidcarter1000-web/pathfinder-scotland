import { NextResponse } from 'next/server'
import { requireParentApi } from '@/lib/school/student-auth'

export const runtime = 'nodejs'

// GET /api/parent/choices -- list linked students' choice submissions,
// grouped by status (parent_pending first).
export async function GET() {
  const guard = await requireParentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (ctx.linkedStudentIds.length === 0) {
    return NextResponse.json({ choices: [] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: choices } = await (admin as any)
    .from('student_choices')
    .select(`
      id,
      round_id,
      student_id,
      status,
      submitted_at,
      parent_approved_at,
      parent_rejected_at,
      parent_comment,
      choice_rounds(id, name, academic_year, year_group, requires_parent_approval, instructions, schools(name, slug)),
      students(first_name, last_name)
    `)
    .in('student_id', ctx.linkedStudentIds)
    .in('status', ['submitted', 'parent_pending', 'confirmed', 'rejected'])
    .order('submitted_at', { ascending: false })

  return NextResponse.json({ choices: choices ?? [] })
}
