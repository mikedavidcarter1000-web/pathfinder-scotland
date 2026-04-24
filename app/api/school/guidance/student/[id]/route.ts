import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { fetchCaseload, canStaffSeeStudent } from '@/lib/school/guidance-caseload'
import { SHANARRI_INDICATORS, responseToScores } from '@/lib/school/shanarri'
import { matchesBursary, bursaryToMatch } from '@/lib/school/bursary-eligibility'

export const runtime = 'nodejs'

// GET /api/school/guidance/student/[id]
// Returns the student-profile payload used by the 7-tab guidance view.
// Enforces caseload filtering in application code (service-role client
// bypasses RLS, so the gate must live here).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = await params

  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // Verify the caller can see this student under their caseload filter.
  const { staff, students: caseloadStudents } = await fetchCaseload(admin, ctx.userId, ctx.schoolId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentFull } = await (admin as any)
    .from('students')
    .select('*')
    .eq('id', studentId)
    .maybeSingle()

  if (!studentFull) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const inCaseload =
    caseloadStudents.some((s) => s.id === studentId) ||
    canStaffSeeStudent(
      staff,
      { id: studentFull.id, school_id: studentFull.school_id, school_stage: studentFull.school_stage, house_group: studentFull.house_group },
      ctx.schoolId
    )
  if (!inCaseload) {
    return NextResponse.json({ error: 'Student not in your caseload' }, { status: 403 })
  }

  // Tracking entries + class info for the current cycle.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentCycle } = await (admin as any)
    .from('tracking_cycles')
    .select('id, name, academic_year')
    .eq('school_id', ctx.schoolId)
    .eq('is_current', true)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classLinks } = await (admin as any)
    .from('class_students')
    .select('class_assignment_id, class_assignments:class_assignment_id(id, subject_id, qualification_type_id, year_group, subjects:subject_id(id, name), qualification_types:qualification_type_id(id, name, short_name))')
    .eq('student_id', studentId)

  type ClassLink = {
    class_assignment_id: string
    class_assignments: {
      id: string
      subject_id: string | null
      qualification_type_id: string | null
      year_group: string | null
      subjects: { id: string; name: string } | null
      qualification_types: { id: string; name: string; short_name: string } | null
    } | null
  }

  const classIds = ((classLinks ?? []) as ClassLink[])
    .map((c) => c.class_assignment_id)
    .filter((x): x is string => !!x)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentEntries } = currentCycle && classIds.length > 0
    ? await (admin as any)
        .from('tracking_entries')
        .select('class_assignment_id, working_grade, predicted_grade, target_grade, on_track, effort, comment, cycle_id, updated_at')
        .eq('student_id', studentId)
        .eq('cycle_id', currentCycle.id)
        .in('class_assignment_id', classIds)
    : { data: [] }

  type Entry = {
    class_assignment_id: string
    working_grade: string | null
    predicted_grade: string | null
    target_grade: string | null
    on_track: boolean | null
    effort: number | null
    comment: string | null
    cycle_id: string
    updated_at: string
  }
  const entryByClass = new Map<string, Entry>()
  for (const e of (currentEntries ?? []) as Entry[]) entryByClass.set(e.class_assignment_id, e)

  const subjectSnapshots = ((classLinks ?? []) as ClassLink[])
    .map((c) => {
      const ca = c.class_assignments
      if (!ca) return null
      const entry = entryByClass.get(ca.id) ?? null
      return {
        classAssignmentId: ca.id,
        subject: ca.subjects?.name ?? 'Unknown',
        subjectId: ca.subjects?.id ?? null,
        qualificationLevel: ca.qualification_types?.short_name ?? null,
        yearGroup: ca.year_group,
        workingGrade: entry?.working_grade ?? null,
        predictedGrade: entry?.predicted_grade ?? null,
        targetGrade: entry?.target_grade ?? null,
        onTrack: entry?.on_track ?? null,
        effort: entry?.effort ?? null,
        comment: entry?.comment ?? null,
      }
    })
    .filter(Boolean)

  // Tracking history across all cycles for trajectory charts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cycles } = await (admin as any)
    .from('tracking_cycles')
    .select('id, name, academic_year, cycle_number, ends_at')
    .eq('school_id', ctx.schoolId)
    .order('ends_at', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allEntries } = classIds.length > 0
    ? await (admin as any)
        .from('tracking_entries')
        .select('class_assignment_id, cycle_id, working_grade, on_track, effort, comment, updated_at')
        .eq('student_id', studentId)
        .in('class_assignment_id', classIds)
    : { data: [] }

  // Saved courses with eligibility traffic-light (heuristic: grade meets
  // any recorded requirement -> green; missing requirements -> amber;
  // failing required grades -> red). For pre-qualification flows this
  // falls back to "missing" for absent grades.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: savedCourses } = await (admin as any)
    .from('saved_courses')
    .select('course_id, courses:course_id(id, name, entry_requirements, slug, universities:university_id(name))')
    .eq('student_id', studentId)
    .limit(20)

  // Subject choices (from student_choices round system, if any submitted).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: choiceSubmissions } = await (admin as any)
    .from('student_choices')
    .select('id, status, choice_round_id, submitted_at, choice_rounds:choice_round_id(name, transition)')
    .eq('student_id', studentId)
    .in('status', ['submitted', 'parent_pending', 'confirmed'])

  // Grades (student-side entered grades).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: grades } = await (admin as any)
    .from('student_grades')
    .select('subject_name, qualification_level, grade')
    .eq('student_id', studentId)
    .limit(30)

  // Interventions for this student.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: interventions } = await (admin as any)
    .from('interventions')
    .select('id, intervention_type, title, notes, action_items, outcome, related_subject_id, related_course_id, pef_funded, pef_cost, scheduled_at, completed_at, follow_up_date, is_confidential, created_at, staff_id, school_staff:staff_id(full_name, role)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(100)

  // Wellbeing responses for this student (named surveys only -- anonymous
  // responses have student_id = NULL).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wellbeing } = await (admin as any)
    .from('wellbeing_responses')
    .select('id, survey_id, safe_score, healthy_score, achieving_score, nurtured_score, active_score, respected_score, responsible_score, included_score, free_text, submitted_at, wellbeing_surveys:survey_id(name)')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
    .limit(10)

  // ASN
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: asn } = await (admin as any)
    .from('asn_provisions')
    .select('id, provision_type, description, review_date, responsible_staff_id, is_active, created_at, updated_at, school_staff:responsible_staff_id(full_name)')
    .eq('student_id', studentId)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false })

  // Bursary eligibility matches.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bursaries } = await (admin as any)
    .from('bursaries')
    .select('*')
    .eq('is_active', true)

  type BursaryRow = Parameters<typeof matchesBursary>[0]
  type StudentFlags = Parameters<typeof matchesBursary>[1]
  const bursaryMatches = ((bursaries ?? []) as BursaryRow[])
    .filter((b) => matchesBursary(b, studentFull as StudentFlags))
    .slice(0, 20)
    .map(bursaryToMatch)

  // Safeguarding: only return a count (full list is on its own endpoint).
  let safeguardingCount = 0
  if (ctx.canViewSafeguarding) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (admin as any)
      .from('safeguarding_concerns')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)
    safeguardingCount = count ?? 0
  }

  // Transition profile (primary -> secondary) if the student has one.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: transition } = await (admin as any)
    .from('transition_profiles')
    .select('source_primary, transition_year, reading_level, writing_level, listening_talking_level, numeracy_level, snsa_reading_score, snsa_numeracy_score, asn_notes, pastoral_notes')
    .eq('student_id', studentId)
    .order('imported_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Personal statement draft progress. Only counts + timestamps are
  // surfaced here so guidance staff can see who has started / is ready
  // for feedback without seeing the text on the overview panel. Students
  // with no draft simply get psDraft=null.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: psDraftRow } = await (admin as any)
    .from('personal_statement_drafts')
    .select('q1_text, q2_text, q3_text, last_saved_at')
    .eq('student_id', studentId)
    .maybeSingle()
  type PsDraftRow = {
    q1_text: string | null
    q2_text: string | null
    q3_text: string | null
    last_saved_at: string | null
  }
  const psRow = (psDraftRow ?? null) as PsDraftRow | null
  const psDraft = psRow
    ? {
        q1Len: (psRow.q1_text ?? '').length,
        q2Len: (psRow.q2_text ?? '').length,
        q3Len: (psRow.q3_text ?? '').length,
        lastSavedAt: psRow.last_saved_at,
      }
    : null

  const latestWellbeing = (wellbeing && wellbeing.length > 0) ? wellbeing[0] : null

  return NextResponse.json({
    canViewSafeguarding: ctx.canViewSafeguarding,
    canViewSensitiveFlags: ctx.canViewSensitiveFlags,
    student: {
      id: studentFull.id,
      firstName: studentFull.first_name,
      lastName: studentFull.last_name,
      email: studentFull.email,
      schoolStage: studentFull.school_stage,
      registrationClass: studentFull.registration_class,
      houseGroup: studentFull.house_group,
      scn: studentFull.scn,
      lastActiveAt: studentFull.last_active_at,
      simdDecile: studentFull.simd_decile,
      attendancePct: studentFull.attendance_pct,
      hasAsn: studentFull.has_asn,
      flags: {
        careExperienced: !!studentFull.care_experienced,
        fsm: !!studentFull.receives_free_school_meals,
        youngCarer: !!studentFull.is_young_carer,
        asn: !!studentFull.has_asn,
        attendanceConcern: studentFull.attendance_pct !== null && studentFull.attendance_pct < 90,
      },
    },
    tracking: {
      currentCycle: currentCycle ?? null,
      subjects: subjectSnapshots,
      cycles: cycles ?? [],
      historyEntries: allEntries ?? [],
    },
    savedCourses: savedCourses ?? [],
    subjectChoices: choiceSubmissions ?? [],
    grades: grades ?? [],
    interventions: interventions ?? [],
    wellbeing: {
      responses: wellbeing ?? [],
      latest: latestWellbeing ? responseToScores(latestWellbeing) : null,
      indicators: SHANARRI_INDICATORS,
    },
    asn: asn ?? [],
    bursaryMatches,
    safeguardingCount,
    transition: transition ?? null,
    psDraft,
  })
}
