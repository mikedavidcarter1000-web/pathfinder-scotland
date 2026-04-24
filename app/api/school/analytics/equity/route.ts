import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import {
  getSimdGap,
  getEquityGroupBreakdowns,
} from '@/lib/school/analytics'

export async function GET() {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Analytics is leadership-only' }, { status: 403 })
  }

  const simd = await getSimdGap(admin, ctx.schoolId)

  // Equity breakdowns of sensitive flags gated by can_view_sensitive_flags.
  const canSensitive = ctx.canViewSensitiveFlags || ctx.isAdmin
  const equityGroups = canSensitive ? await getEquityGroupBreakdowns(admin, ctx.schoolId) : []

  // WA pipeline: of SIMD Q1-Q2 students, how many saved a course / made subject choices.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any)
    .from('school_student_links').select('student_id').eq('school_id', ctx.schoolId)
  const allIds: string[] = (links ?? []).map((l: { student_id: string }) => l.student_id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentRows } = await (admin as any)
    .from('students').select('id, simd_decile').in('id', allIds.length ? allIds : [''])
  const q12Ids: string[] = (studentRows ?? [])
    .filter((s: { simd_decile: number | null }) => s.simd_decile && s.simd_decile <= 4)
    .map((s: { id: string }) => s.id)

  let savedAny = 0
  let savedWA = 0
  let madeChoices = 0
  if (q12Ids.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: saved } = await (admin as any).from('saved_courses').select('student_id, course_id').in('student_id', q12Ids)
    const savedStudents = new Set<string>((saved ?? []).map((s: { student_id: string }) => s.student_id))
    savedAny = savedStudents.size

    const courseIds = Array.from(new Set((saved ?? []).map((s: { course_id: string }) => s.course_id)))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: courses } = courseIds.length
      ? await (admin as any).from('courses').select('id, widening_access_requirements').in('id', courseIds)
      : { data: [] }
    // widening_access_requirements is JSONB; treat any non-null non-empty object / array as "has WA offer".
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasWa = (value: any): boolean => {
      if (value == null) return false
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object') return Object.keys(value).length > 0
      return true
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const waCourseIds = new Set<string>((courses ?? []).filter((c: any) => hasWa(c.widening_access_requirements)).map((c: { id: string }) => c.id))
    const waStudents = new Set<string>((saved ?? []).filter((s: { course_id: string }) => waCourseIds.has(s.course_id)).map((s: { student_id: string }) => s.student_id))
    savedWA = waStudents.size

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: choices } = await (admin as any).from('student_subject_choices').select('student_id').in('student_id', q12Ids)
    const choiceStudents = new Set<string>((choices ?? []).map((c: { student_id: string }) => c.student_id))
    madeChoices = choiceStudents.size
  }

  return NextResponse.json({
    simd_gap: simd,
    equity_groups: equityGroups,
    can_view_sensitive_flags: canSensitive,
    wa_pipeline: {
      q12_total: q12Ids.length,
      saved_any_pct: q12Ids.length > 0 ? Math.round((savedAny / q12Ids.length) * 1000) / 10 : 0,
      saved_wa_pct: q12Ids.length > 0 ? Math.round((savedWA / q12Ids.length) * 1000) / 10 : 0,
      made_choices_pct: q12Ids.length > 0 ? Math.round((madeChoices / q12Ids.length) * 1000) / 10 : 0,
    },
  })
}
