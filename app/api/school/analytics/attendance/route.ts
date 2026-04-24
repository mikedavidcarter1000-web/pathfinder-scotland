import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { getAttendanceCorrelation, attendanceBand } from '@/lib/school/analytics'

export async function GET() {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Analytics is leadership-only' }, { status: 403 })
  }

  // Any attendance records at all?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (admin as any)
    .from('attendance_records')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', ctx.schoolId)
  if (!count || count === 0) {
    return NextResponse.json({ has_data: false })
  }

  const correlation = await getAttendanceCorrelation(admin, ctx.schoolId)

  // Distribution (just latest year records grouped by band).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: records } = await (admin as any)
    .from('attendance_records')
    .select('student_id, attendance_pct, academic_year, is_below_90')
    .eq('school_id', ctx.schoolId)
    .order('academic_year', { ascending: false })
  const years = Array.from(new Set((records ?? []).map((r: { academic_year: string }) => r.academic_year)))
  const latestYear = years[0]
  const latest = (records ?? []).filter((r: { academic_year: string }) => r.academic_year === latestYear)
  const latestByStudent = new Map<string, { pct: number; is_below_90: boolean }>()
  for (const r of latest) {
    if (!latestByStudent.has(r.student_id)) {
      latestByStudent.set(r.student_id, { pct: Number(r.attendance_pct), is_below_90: !!r.is_below_90 })
    }
  }
  const distribution: Record<string, number> = { '95-100%': 0, '90-95%': 0, '85-90%': 0, '<85%': 0 }
  for (const v of latestByStudent.values()) distribution[attendanceBand(v.pct)] += 1

  // Scatter-plot sample: up to 200 (student_id, attendance_pct, avg_grade) points. Names not included.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cycle } = await (admin as any)
    .from('tracking_cycles')
    .select('id').eq('school_id', ctx.schoolId)
    .or('is_locked.eq.true,is_current.eq.true')
    .order('is_locked', { ascending: false })
    .limit(1)
    .maybeSingle()
  const scatter: Array<{ pct: number; grade: number }> = []
  if (cycle?.id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: entries } = await (admin as any)
      .from('tracking_entries').select('student_id, working_grade').eq('cycle_id', cycle.id).eq('school_id', ctx.schoolId)
    const gradeByStudent = new Map<string, number[]>()
    for (const e of entries ?? []) {
      const g = (e.working_grade ?? '').toString().trim().toUpperCase()
      let num = 0
      if (g === 'A') num = 4; else if (g === 'B') num = 3; else if (g === 'C') num = 2; else if (g === 'D') num = 1
      if (num > 0) {
        const arr = gradeByStudent.get(e.student_id) ?? []
        arr.push(num)
        gradeByStudent.set(e.student_id, arr)
      }
    }
    for (const [sid, data] of latestByStudent.entries()) {
      const grades = gradeByStudent.get(sid)
      if (grades && grades.length > 0) {
        scatter.push({
          pct: Math.round(data.pct * 10) / 10,
          grade: Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 100) / 100,
        })
      }
      if (scatter.length >= 200) break
    }
  }

  return NextResponse.json({
    has_data: true,
    distribution,
    correlation,
    scatter,
    risk_list_visible: ctx.canViewIndividualStudents || ctx.isAdmin,
  })
}
