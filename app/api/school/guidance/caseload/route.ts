import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { fetchCaseload } from '@/lib/school/guidance-caseload'

export const runtime = 'nodejs'

// GET /api/school/guidance/caseload
// Returns the caller's visible students + key stats + counts of open
// actions. Guidance-only; class teachers see a 403.
export async function GET() {
  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const { students } = await fetchCaseload(admin, ctx.userId, ctx.schoolId)
  const studentIds = students.map((s) => s.id)

  if (studentIds.length === 0) {
    return NextResponse.json({
      stats: {
        totalStudents: 0,
        interventionsThisMonth: 0,
        overdueFollowUps: 0,
        asnReviewsDueThisMonth: 0,
        pendingSurveys: 0,
      },
      students: [],
      overdueList: [],
      canViewSafeguarding: ctx.canViewSafeguarding,
      canViewSensitiveFlags: ctx.canViewSensitiveFlags,
    })
  }

  // Students table — full record for the list row.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentDetail } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, school_stage, house_group, registration_class, last_active_at, care_experienced, receives_free_school_meals, is_young_carer, has_asn, attendance_pct')
    .in('id', studentIds)

  // Active safeguarding concerns per student (for red outline badge).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: safeguarding } = ctx.canViewSafeguarding
    ? await (admin as any)
        .from('safeguarding_concerns')
        .select('student_id, resolved_at')
        .in('student_id', studentIds)
        .is('resolved_at', null)
    : { data: [] }

  const hasActiveSafeguarding = new Map<string, boolean>()
  for (const row of (safeguarding ?? []) as Array<{ student_id: string }>) {
    hasActiveSafeguarding.set(row.student_id, true)
  }

  // Intervention counts + overdue follow-ups per student.
  const nowIso = new Date().toISOString()
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: interventionRows } = await (admin as any)
    .from('interventions')
    .select('id, student_id, created_at, follow_up_date, completed_at, title, staff_id')
    .in('student_id', studentIds)

  const interventionCount = new Map<string, number>()
  let interventionsThisMonth = 0
  const overdueList: Array<{
    id: string
    studentId: string
    studentName: string
    title: string
    dueDate: string
    daysOverdue: number
  }> = []

  type InterventionRow = {
    id: string
    student_id: string
    created_at: string
    follow_up_date: string | null
    completed_at: string | null
    title: string
    staff_id: string | null
  }

  for (const r of (interventionRows ?? []) as InterventionRow[]) {
    interventionCount.set(r.student_id, (interventionCount.get(r.student_id) ?? 0) + 1)
    if (new Date(r.created_at) >= monthStart) interventionsThisMonth += 1
    if (r.follow_up_date && !r.completed_at) {
      const due = new Date(r.follow_up_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (due <= today) {
        const ms = today.getTime() - due.getTime()
        const daysOverdue = Math.max(0, Math.floor(ms / 86400000))
        overdueList.push({
          id: r.id,
          studentId: r.student_id,
          studentName: '',
          title: r.title,
          dueDate: r.follow_up_date,
          daysOverdue,
        })
      }
    }
  }

  // Fill student names on overdue list now that we have studentDetail.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studentNameById = new Map<string, string>()
  for (const s of ((studentDetail ?? []) as Array<{ id: string; first_name: string | null; last_name: string | null }>)) {
    const name = `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim()
    studentNameById.set(s.id, name || 'Unknown student')
  }
  for (const o of overdueList) {
    o.studentName = studentNameById.get(o.studentId) ?? 'Unknown'
  }

  // ASN review dates
  const monthEndIso = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1, 0)
    d.setHours(23, 59, 59, 999)
    return d.toISOString()
  })()
  void nowIso
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: asnRows } = await (admin as any)
    .from('asn_provisions')
    .select('student_id, review_date')
    .in('student_id', studentIds)
    .eq('is_active', true)
    .lte('review_date', monthEndIso.slice(0, 10))

  const asnReviewsDueThisMonth = (asnRows ?? []).length

  // Active surveys targeting any of the stages represented in the caseload
  // (just a counter -- the student-facing surface handles the detail).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: openSurveys } = await (admin as any)
    .from('wellbeing_surveys')
    .select('id, target_year_groups, opens_at, closes_at')
    .eq('school_id', ctx.schoolId)

  const pendingSurveys = ((openSurveys ?? []) as Array<{ opens_at: string | null; closes_at: string | null }>).filter(
    (s) => (!s.opens_at || new Date(s.opens_at) <= new Date()) && (!s.closes_at || new Date(s.closes_at) >= new Date())
  ).length

  // Build student rows.
  type DetailRow = {
    id: string
    first_name: string | null
    last_name: string | null
    school_stage: string | null
    house_group: string | null
    registration_class: string | null
    last_active_at: string | null
    care_experienced: boolean | null
    receives_free_school_meals: boolean | null
    is_young_carer: boolean | null
    has_asn: boolean | null
    attendance_pct: number | null
  }

  const rows = ((studentDetail ?? []) as DetailRow[]).map((s) => ({
    id: s.id,
    firstName: s.first_name ?? '',
    lastName: s.last_name ?? '',
    schoolStage: s.school_stage,
    houseGroup: s.house_group,
    registrationClass: s.registration_class,
    lastActiveAt: s.last_active_at,
    interventionCount: interventionCount.get(s.id) ?? 0,
    flags: {
      careExperienced: !!s.care_experienced,
      fsm: !!s.receives_free_school_meals,
      youngCarer: !!s.is_young_carer,
      asn: !!s.has_asn,
      attendanceConcern: s.attendance_pct !== null && s.attendance_pct < 90,
      hasActiveSafeguarding: !!hasActiveSafeguarding.get(s.id),
    },
  }))

  overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue)

  return NextResponse.json({
    stats: {
      totalStudents: rows.length,
      interventionsThisMonth,
      overdueFollowUps: overdueList.length,
      asnReviewsDueThisMonth,
      pendingSurveys,
    },
    students: rows,
    overdueList: overdueList.slice(0, 20),
    canViewSafeguarding: ctx.canViewSafeguarding,
    canViewSensitiveFlags: ctx.canViewSensitiveFlags,
  })
}
