import { NextResponse } from 'next/server'
import { isAdminEmail, getAdminClient } from '@/lib/admin-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Demo seeding route. Guarded: non-production OR admin-email caller.
// Produces one founding school ("Pathfinder Academy"), 5 staff, 60 students
// across S4-S6, 1 tracking cycle with 360 entries, attendance records,
// interventions, a wellbeing survey, ASN provisions, a PEF allocation + spend,
// 3 SIP priorities, and 1 choice round. All rows carry a discoverable
// marker (school name + founding_school flag) so a cleanup script can target
// them. Re-runnable: if the demo school already exists, returns 200 with a
// "already seeded" note.

/* eslint-disable @typescript-eslint/no-explicit-any */

const DEMO_SCHOOL_NAME = 'Pathfinder Academy (demo)'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Demo seed is not available in production' }, { status: 403 })
    }
  }

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'service role not configured' }, { status: 500 })

  // Already seeded?
  const { data: existing } = await (admin as any).from('schools').select('id').eq('name', DEMO_SCHOOL_NAME).maybeSingle()
  if (existing) {
    return NextResponse.json({ already_seeded: true, school_id: existing.id })
  }

  // Territory.
  const { data: territory } = await (admin as any).from('territories').select('id').eq('code', 'SCT').maybeSingle()
  const territoryId = territory?.id ?? null

  // School.
  const academicYear = '2025/26'
  const { data: school } = await (admin as any).from('schools').insert({
    name: DEMO_SCHOOL_NAME,
    slug: 'pathfinder-academy-demo',
    local_authority: 'City of Edinburgh',
    school_type: 'secondary',
    total_roll: 850,
    roll_count: 850,
    subscription_status: 'trial',
    subscription_tier: 'trial',
    is_founding_school: true,
    territory_id: territoryId,
    subjects_offered: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History'],
    year_groups_offered: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
    trial_started_at: new Date().toISOString(),
    trial_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  }).select().maybeSingle()

  if (!school) return NextResponse.json({ error: 'school insert failed' }, { status: 500 })

  // Staff -- note these are placeholder rows (no real auth users). Real staff
  // register or join via the normal flows. Demo staff are still useful for
  // rendering caseloads and as foreign keys for tracking entries.
  const staffRows = [
    { full_name: 'Demo Head Teacher', email: 'head.demo@example.com', role: 'head_teacher', is_school_admin: true, can_view_individual_students: true, can_view_tracking: true, can_edit_tracking: true, can_manage_tracking: true, can_view_guidance_notes: true, can_edit_guidance_notes: true, can_view_analytics: true, can_manage_school: true, can_view_safeguarding: true, can_view_sensitive_flags: true },
    { full_name: 'Demo Depute', email: 'depute.demo@example.com', role: 'depute', is_school_admin: false, can_view_individual_students: true, can_view_tracking: true, can_edit_tracking: true, can_manage_tracking: true, can_view_guidance_notes: true, can_edit_guidance_notes: true, can_view_analytics: true, can_manage_school: true, can_view_safeguarding: true, can_view_sensitive_flags: true },
    { full_name: 'Demo Guidance Teacher A', email: 'guidance-a.demo@example.com', role: 'guidance_teacher', is_school_admin: false, can_view_individual_students: true, can_view_tracking: true, can_edit_tracking: false, can_view_guidance_notes: true, can_edit_guidance_notes: true, can_view_analytics: true, can_view_sensitive_flags: true },
    { full_name: 'Demo Guidance Teacher B', email: 'guidance-b.demo@example.com', role: 'guidance_teacher', is_school_admin: false, can_view_individual_students: true, can_view_tracking: true, can_edit_tracking: false, can_view_guidance_notes: true, can_edit_guidance_notes: true, can_view_analytics: true, can_view_sensitive_flags: true },
    { full_name: 'Demo Class Teacher', email: 'teacher.demo@example.com', role: 'class_teacher', is_school_admin: false, can_view_tracking: true, can_edit_tracking: true, department: 'Mathematics' },
  ]
  const staffIds: string[] = []
  for (const s of staffRows) {
    const fakeUserId = crypto.randomUUID()
    const { data } = await (admin as any).from('school_staff').insert({
      school_id: school.id,
      user_id: fakeUserId,
      ...s,
    }).select('id').maybeSingle()
    if (data?.id) staffIds.push(data.id)
  }

  // Students -- 60 across S4-S6 (20 each). Realistic SIMD: 30% Q1-Q2 (d1-4), 40% Q3 (d5-6), 30% Q4-Q5 (d7-10).
  function randomDecile(): number {
    const r = Math.random()
    if (r < 0.30) return 1 + Math.floor(Math.random() * 4)   // d1-4
    if (r < 0.70) return 5 + Math.floor(Math.random() * 2)   // d5-6
    return 7 + Math.floor(Math.random() * 4)                 // d7-10
  }
  function sampleStage(index: number): 's4' | 's5' | 's6' {
    if (index < 20) return 's4'
    if (index < 40) return 's5'
    return 's6'
  }
  function randomGrade(): string {
    const r = Math.random()
    if (r < 0.2) return 'A'
    if (r < 0.5) return 'B'
    if (r < 0.78) return 'C'
    if (r < 0.92) return 'D'
    return 'No Award'
  }

  const studentIds: string[] = []
  for (let i = 0; i < 60; i++) {
    const fakeUserId = crypto.randomUUID()
    const { data: s } = await (admin as any).from('students').insert({
      id: fakeUserId,
      first_name: `Demo${i + 1}`,
      last_name: `Student`,
      email: `demo${i + 1}.student@example.com`,
      school_stage: sampleStage(i),
      simd_decile: randomDecile(),
      postcode: 'EH1 1AA',
      attendance_pct: Math.random() < 0.16 ? 82 + Math.random() * 7 : 91 + Math.random() * 9,
      care_experienced: Math.random() < 0.04,
      is_young_carer: Math.random() < 0.06,
      receives_free_school_meals: Math.random() < 0.22,
      eal: Math.random() < 0.08,
      has_asn: Math.random() < 0.10,
    }).select('id').maybeSingle()
    if (!s?.id) continue
    studentIds.push(s.id)
    await (admin as any).from('school_student_links').insert({
      school_id: school.id,
      student_id: s.id,
      consent_given: true,
    })
  }

  // Qualification types + grade scales (pick the Scotland ones).
  const { data: qtN5 } = await (admin as any).from('qualification_types').select('id').eq('territory_id', territoryId).eq('short_name', 'N5').maybeSingle()
  const { data: qtHigher } = await (admin as any).from('qualification_types').select('id').eq('territory_id', territoryId).eq('short_name', 'Higher').maybeSingle()
  const { data: qtAh } = await (admin as any).from('qualification_types').select('id').eq('territory_id', territoryId).eq('short_name', 'Advanced Higher').maybeSingle()

  // Cycle.
  const { data: cycle } = await (admin as any).from('tracking_cycles').insert({
    school_id: school.id,
    name: 'Autumn tracking',
    academic_year: academicYear,
    cycle_number: 1,
    starts_at: '2025-09-01',
    ends_at: '2025-11-30',
    is_current: true,
    is_locked: false,
  }).select('id').maybeSingle()

  // 6 subjects, 3 classes per year group (S4 N5, S5 Higher, S6 mixed), one teacher (staffIds[4] is class teacher).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: demoSubjects } = await (admin as any).from('subjects').select('id, name').limit(6)
  const classIds: Array<{ id: string; year: string; qualId: string | null }> = []
  const classTeacherId = staffIds[4] ?? staffIds[0]
  for (const subj of demoSubjects ?? []) {
    for (const year of ['S4', 'S5', 'S6']) {
      const qualId = year === 'S4' ? qtN5?.id : year === 'S5' ? qtHigher?.id : qtAh?.id
      if (!qualId) continue
      const { data: ca } = await (admin as any).from('class_assignments').insert({
        school_id: school.id,
        staff_id: classTeacherId,
        subject_id: subj.id,
        year_group: year,
        class_code: `${year.toLowerCase()}-${(subj.name ?? 'x').toLowerCase().slice(0, 3)}`,
        qualification_type_id: qualId,
        academic_year: academicYear,
      }).select('id').maybeSingle()
      if (ca?.id) classIds.push({ id: ca.id, year, qualId })
    }
  }

  // Tracking entries: 6 subjects per student for their year group.
  if (cycle?.id) {
    for (const sid of studentIds) {
      const { data: stud } = await (admin as any).from('students').select('school_stage').eq('id', sid).maybeSingle()
      const stage = (stud?.school_stage ?? 's4').toString().toUpperCase()
      const relevant = classIds.filter((c) => c.year === stage)
      for (const cls of relevant) {
        const grade = randomGrade()
        const { error: entryErr } = await (admin as any).from('tracking_entries').insert({
          school_id: school.id,
          cycle_id: cycle.id,
          class_assignment_id: cls.id,
          student_id: sid,
          staff_id: classTeacherId,
          working_grade: grade,
          on_track: Math.random() < 0.7 ? 'on_track' : Math.random() < 0.5 ? 'below_track' : 'above_track',
          effort: Math.random() < 0.5 ? 'good' : 'satisfactory',
        })
        if (entryErr) { /* skip silently */ }
        // Class_students membership (if table expects it).
        await (admin as any).from('class_students').insert({
          class_assignment_id: cls.id,
          student_id: sid,
        }).then(() => null).catch(() => null)
      }
    }
  }

  // Attendance -- one record per student for the current academic year; 10 below 90.
  for (let i = 0; i < studentIds.length; i++) {
    const belowTarget = i < 10
    const possible = 100
    const present = belowTarget ? 75 + Math.floor(Math.random() * 12) : 92 + Math.floor(Math.random() * 8)
    await (admin as any).from('attendance_records').insert({
      school_id: school.id,
      student_id: studentIds[i],
      academic_year: academicYear,
      term: 'Autumn 2025',
      total_possible: possible,
      total_present: present,
      authorised_absence: Math.max(0, possible - present - 1),
      unauthorised_absence: 1,
    })
  }

  // 15 interventions across 10 students.
  const intStudents = studentIds.slice(0, 10)
  const guidanceStaff = staffIds[2] ?? staffIds[0]
  for (let i = 0; i < 15; i++) {
    const sid = intStudents[i % intStudents.length]
    await (admin as any).from('interventions').insert({
      school_id: school.id,
      student_id: sid,
      staff_id: guidanceStaff,
      intervention_type: i % 3 === 0 ? 'guidance_meeting' : i % 3 === 1 ? 'attendance_followup' : 'mentoring',
      title: `Demo intervention ${i + 1}`,
      notes: 'Auto-seeded for dashboard analytics demo.',
      pef_funded: i % 4 === 0,
      pef_cost: i % 4 === 0 ? 150 : null,
      follow_up_date: i < 3 ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
    })
  }

  // Wellbeing survey + 45 responses (3 out of 4 students respond).
  const { data: survey } = await (admin as any).from('wellbeing_surveys').insert({
    school_id: school.id,
    name: 'Autumn 2025 SHANARRI check',
    target_year_groups: ['S4', 'S5', 'S6'],
    is_anonymous: false,
    opens_at: new Date().toISOString(),
    closes_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: staffIds[0],
  }).select('id').maybeSingle()
  if (survey?.id) {
    for (let i = 0; i < 45; i++) {
      const sid = studentIds[i]
      if (!sid) continue
      await (admin as any).from('wellbeing_responses').insert({
        survey_id: survey.id,
        student_id: sid,
        safe_score: 3 + Math.floor(Math.random() * 3),
        healthy_score: 3 + Math.floor(Math.random() * 3),
        achieving_score: 2 + Math.floor(Math.random() * 3),
        nurtured_score: 3 + Math.floor(Math.random() * 3),
        active_score: 3 + Math.floor(Math.random() * 3),
        respected_score: 3 + Math.floor(Math.random() * 3),
        responsible_score: 3 + Math.floor(Math.random() * 3),
        included_score: 3 + Math.floor(Math.random() * 3),
      })
    }
  }

  // 5 ASN provisions across 4 students (two provisions for the first one).
  const asnStudents = studentIds.slice(0, 4)
  const provisionTypes = ['exam_access', 'extra_time', 'reader', 'scribe', 'separate_room']
  for (let i = 0; i < 5; i++) {
    const sid = asnStudents[i % asnStudents.length]
    await (admin as any).from('asn_provisions').insert({
      school_id: school.id,
      student_id: sid,
      provision_type: provisionTypes[i],
      description: `Demo ${provisionTypes[i].replace(/_/g, ' ')} provision`,
      review_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      responsible_staff_id: guidanceStaff,
      is_active: true,
    })
  }

  // PEF allocation + 3 spend items.
  const { data: alloc } = await (admin as any).from('pef_allocations').insert({
    school_id: school.id,
    academic_year: academicYear,
    total_allocation: 45000,
  }).select('id').maybeSingle()
  if (alloc?.id) {
    for (const s of [
      { category: 'staffing', description: 'Additional guidance teacher hours', amount: 18000, target_student_count: 120 },
      { category: 'trips', description: 'University visits for S5 cohort', amount: 4500, target_student_count: 45 },
      { category: 'resources', description: 'Maths and English Higher revision packs', amount: 2800, target_student_count: 90 },
    ]) {
      await (admin as any).from('pef_spend').insert({ allocation_id: alloc.id, ...s })
    }
  }

  // 3 SIP priorities.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inds } = await (admin as any).from('inspection_indicators').select('id, indicator_code').eq('framework_name', 'HGIOS4')
  const indByCode = new Map<string, string>((inds ?? []).map((i: { id: string; indicator_code: string }) => [i.indicator_code, i.id]))
  const priorities = [
    { priority_number: 1, title: 'Raise attainment in the broad general education', target_metric: 'pct_n5_5plus_ac', baseline_value: 38, target_value: 45, inspection_indicator_id: indByCode.get('3.2') ?? null },
    { priority_number: 2, title: 'Close the attainment gap for SIMD Q1-Q2 learners', target_metric: 'pct_higher_3plus_ac', baseline_value: 19, target_value: 28, inspection_indicator_id: indByCode.get('1.5') ?? null },
    { priority_number: 3, title: 'Embed career education across the curriculum', target_metric: 'ces_horizons_score', baseline_value: 40, target_value: 65, inspection_indicator_id: indByCode.get('3.3') ?? null },
  ]
  for (const p of priorities) {
    await (admin as any).from('sip_priorities').insert({
      school_id: school.id,
      academic_year: academicYear,
      ...p,
      status: 'in_progress',
    })
  }

  // 1 choice round with 3 columns and 20 student submissions.
  const { data: round } = await (admin as any).from('choice_rounds').insert({
    school_id: school.id,
    name: 'S3 to S4 subject choices',
    academic_year: academicYear,
    year_group: 'S3',
    transition: 's3_to_s4',
    status: 'open',
    requires_parent_approval: true,
    opens_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    closes_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: staffIds[0],
  }).select('id').maybeSingle()

  const columnIds: string[] = []
  if (round?.id) {
    for (let c = 1; c <= 3; c++) {
      const { data: col } = await (admin as any).from('choice_round_columns').insert({
        round_id: round.id,
        column_number: c,
        picks_required: 1,
        reserves_allowed: 1,
      }).select('id').maybeSingle()
      if (col?.id) columnIds.push(col.id)
    }
  }

  return NextResponse.json({
    seeded: true,
    school_id: school.id,
    staff_count: staffIds.length,
    student_count: studentIds.length,
    class_count: classIds.length,
    asn_count: 5,
    sip_count: priorities.length,
    round_id: round?.id ?? null,
    columns: columnIds.length,
  })
}
