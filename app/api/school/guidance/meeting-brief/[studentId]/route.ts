import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { canStaffSeeStudent, fetchCaseload } from '@/lib/school/guidance-caseload'
import { SHANARRI_INDICATORS, responseToScores } from '@/lib/school/shanarri'
import { renderMeetingBriefHtml, type MeetingBriefData } from '@/lib/school/guidance-brief'

export const runtime = 'nodejs'

// GET /api/school/guidance/meeting-brief/[studentId]
// Returns an HTML page optimised for browser print-to-PDF. Mirrors the
// pattern used by parent reports: no dependency on puppeteer or react-pdf.
export async function GET(_req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params

  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // Caseload check.
  const { staff } = await fetchCaseload(admin, ctx.userId, ctx.schoolId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentFull } = await (admin as any)
    .from('students')
    .select('*')
    .eq('id', studentId)
    .maybeSingle()
  if (!studentFull) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  if (!canStaffSeeStudent(staff, studentFull, ctx.schoolId)) {
    return NextResponse.json({ error: 'Student not in your caseload' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('name')
    .eq('id', ctx.schoolId)
    .maybeSingle()

  // Tracking snapshot (current cycle).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentCycle } = await (admin as any)
    .from('tracking_cycles')
    .select('id')
    .eq('school_id', ctx.schoolId)
    .eq('is_current', true)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classLinks } = await (admin as any)
    .from('class_students')
    .select('class_assignment_id, class_assignments:class_assignment_id(id, subjects:subject_id(name), qualification_types:qualification_type_id(short_name))')
    .eq('student_id', studentId)

  type ClassLink = {
    class_assignment_id: string
    class_assignments: { id: string; subjects: { name: string } | null; qualification_types: { short_name: string } | null } | null
  }
  const classIds = ((classLinks ?? []) as ClassLink[])
    .map((c) => c.class_assignment_id)
    .filter((x): x is string => !!x)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: entries } = currentCycle && classIds.length > 0
    ? await (admin as any)
        .from('tracking_entries')
        .select('class_assignment_id, working_grade, on_track')
        .eq('student_id', studentId)
        .eq('cycle_id', currentCycle.id)
        .in('class_assignment_id', classIds)
    : { data: [] }

  type Entry = { class_assignment_id: string; working_grade: string | null; on_track: boolean | null }
  const byClass = new Map<string, Entry>()
  for (const e of (entries ?? []) as Entry[]) byClass.set(e.class_assignment_id, e)

  const subjects = ((classLinks ?? []) as ClassLink[]).map((c) => {
    const ca = c.class_assignments
    const entry = ca ? byClass.get(ca.id) : undefined
    return {
      subject: ca?.subjects?.name ?? 'Unknown',
      grade: entry?.working_grade ?? null,
      qualificationLevel: ca?.qualification_types?.short_name ?? null,
      onTrack: entry?.on_track ?? null,
    }
  })

  // Saved courses (eligibility is pragmatic: flag missing grades as "needs review").
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: saved } = await (admin as any)
    .from('saved_courses')
    .select('courses:course_id(name, universities:university_id(name))')
    .eq('student_id', studentId)
    .limit(8)

  type SavedRow = { courses: { name: string; universities: { name: string } | null } | null }
  const savedCourses = ((saved ?? []) as SavedRow[]).map((s) => ({
    title: s.courses?.name ?? 'Course',
    university: s.courses?.universities?.name ?? 'University',
    eligibilityNote: entries && entries.length > 0 ? 'Review required-subject match' : 'No grades on record',
  }))

  // Recent interventions + outstanding action items.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: interventions } = await (admin as any)
    .from('interventions')
    .select('intervention_type, title, outcome, action_items, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(3)

  type InterventionRow = {
    intervention_type: string
    title: string
    outcome: string | null
    action_items: Array<{ description: string; due_date?: string; is_completed?: boolean }> | null
    created_at: string
  }
  const interventionSummaries = ((interventions ?? []) as InterventionRow[]).map((i) => ({
    date: i.created_at.slice(0, 10),
    type: i.intervention_type,
    title: i.title,
    outcome: i.outcome,
  }))

  const actionItems: Array<{ description: string; dueDate: string | null; isCompleted: boolean }> = []
  for (const i of ((interventions ?? []) as InterventionRow[])) {
    for (const a of i.action_items ?? []) {
      if (a && !a.is_completed) {
        actionItems.push({
          description: a.description,
          dueDate: a.due_date ?? null,
          isCompleted: false,
        })
      }
    }
  }

  // Latest SHANARRI (if any).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: latestWellbeing } = await (admin as any)
    .from('wellbeing_responses')
    .select('safe_score, healthy_score, achieving_score, nurtured_score, active_score, respected_score, responsible_score, included_score')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const shanarri = latestWellbeing
    ? SHANARRI_INDICATORS.map((ind) => {
        const scores = responseToScores(latestWellbeing as Record<string, unknown>)
        return { label: ind.label, score: scores[ind.key] ?? null }
      })
    : null

  // ASN.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: asn } = await (admin as any)
    .from('asn_provisions')
    .select('provision_type, description')
    .eq('student_id', studentId)
    .eq('is_active', true)

  const data: MeetingBriefData = {
    student: {
      firstName: studentFull.first_name ?? '',
      lastName: studentFull.last_name ?? '',
      schoolStage: studentFull.school_stage,
      registrationClass: studentFull.registration_class,
      houseGroup: studentFull.house_group,
      simdDecile: studentFull.simd_decile,
      scn: studentFull.scn,
      attendancePct: studentFull.attendance_pct,
    },
    generatedAt: new Date().toISOString(),
    school: { name: school?.name ?? 'School' },
    subjects,
    savedCourses,
    interventions: interventionSummaries,
    actionItems,
    shanarri,
    asn: ((asn ?? []) as Array<{ provision_type: string; description: string | null }>).map((a) => ({
      type: a.provision_type,
      description: a.description,
    })),
    flags: {
      careExperienced: !!studentFull.care_experienced,
      fsm: !!studentFull.receives_free_school_meals,
      youngCarer: !!studentFull.is_young_carer,
      asn: !!studentFull.has_asn,
      attendanceConcern: studentFull.attendance_pct !== null && studentFull.attendance_pct < 90,
    },
    simdNote: studentFull.simd_decile !== null && studentFull.simd_decile <= 4
      ? 'Eligible for widening-access adjusted offers at most Scottish universities.'
      : 'Not SIMD-eligible for adjusted offers.',
  }

  const html = renderMeetingBriefHtml(data)
  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
