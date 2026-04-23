import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const TRANSITION_FOR_STAGE: Record<string, string> = {
  s2: 's2_to_s3',
  s3: 's3_to_s4',
  s4: 's4_to_s5',
  s5: 's5_to_s6',
}

const PREVIOUS_TRANSITION: Record<string, string | null> = {
  s2_to_s3: null,
  s3_to_s4: 's2_to_s3',
  s4_to_s5: 's3_to_s4',
  s5_to_s6: 's4_to_s5',
}

const TRANSITION_LABEL: Record<string, string> = {
  s2_to_s3: 'S2 into S3 — choosing National 4/5 subjects',
  s3_to_s4: 'S3 into S4 — choosing National 5 subjects',
  s4_to_s5: 'S4 into S5 — choosing Highers',
  s5_to_s6: 'S5 into S6 — choosing Advanced Highers',
}

const SAAS_COPY: Record<string, { bursary: string; loan: string }> = {
  under_21000: {
    bursary: 'You may receive a bursary of up to £2,000 per year (non-repayable)',
    loan: 'plus a student loan of up to £9,400 per year from SAAS.',
  },
  '21000_24000': {
    bursary: 'You may receive a bursary of up to £1,125 per year (non-repayable)',
    loan: 'plus a student loan of up to £9,400 per year from SAAS.',
  },
  '24000_34000': {
    bursary: 'You may receive a bursary of up to £500 per year (non-repayable)',
    loan: 'plus a student loan of up to £9,400 per year from SAAS.',
  },
  '34000_45000': {
    bursary: 'You are eligible for',
    loan: 'a student loan of up to £8,400 per year from SAAS.',
  },
  over_45000: {
    bursary: 'You are eligible for',
    loan: 'a student loan of up to £8,400 per year from SAAS.',
  },
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Student profile
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('first_name, last_name, school_stage, school_name, simd_decile, household_income_band')
    .eq('id', user.id)
    .single()

  if (studentError || !student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const stage = student.school_stage as string | null
  if (!stage || !['s2', 's3', 's4', 's5'].includes(stage)) {
    return NextResponse.json({ redirect: true, stage })
  }

  const currentTransition = TRANSITION_FOR_STAGE[stage]
  const previousTransition = PREVIOUS_TRANSITION[currentTransition] ?? null

  // Course choice rules (generic for this transition)
  const { data: rules } = await supabase
    .from('course_choice_rules')
    .select('total_subjects, compulsory_subjects, num_free_choices, num_reserves, breadth_requirements')
    .eq('transition', currentTransition)
    .eq('is_generic', true)
    .limit(1)
    .maybeSingle()

  // Current transition choices with subject names and career sector links
  const { data: currentChoicesRaw } = await supabase
    .from('student_subject_choices')
    .select(`
      id, rank_order, is_reserve, subject_id,
      subject:subjects(
        id, name,
        career_links:subject_career_sectors(
          career_sector:career_sectors(id, name)
        )
      )
    `)
    .eq('student_id', user.id)
    .eq('transition', currentTransition)
    .order('rank_order', { nullsFirst: false })

  // Previous transition choices
  let previousChoicesRaw: { id: string; rank_order: number | null; subject_id: string; subject: { id: string; name: string } | null }[] = []
  if (previousTransition) {
    const { data } = await supabase
      .from('student_subject_choices')
      .select('id, rank_order, subject_id, subject:subjects(id, name)')
      .eq('student_id', user.id)
      .eq('transition', previousTransition)
      .order('rank_order', { nullsFirst: false })
    previousChoicesRaw = (data as typeof previousChoicesRaw) ?? []
  }

  // Student grades
  const { data: grades } = await supabase
    .from('student_grades')
    .select('subject_id, grade, predicted_grade, qualification_type, is_actual, predicted')
    .eq('student_id', user.id)

  // University course requirement counts for current choices (Higher + Advanced Higher)
  const chosenSubjectIds = (currentChoicesRaw ?? [])
    .map((c) => (c as { subject_id: string }).subject_id)
    .filter(Boolean)

  const courseCountsBySubject: Record<string, number> = {}
  if (chosenSubjectIds.length > 0) {
    const { data: reqRows } = await supabase
      .from('course_subject_requirements')
      .select('subject_id')
      .in('subject_id', chosenSubjectIds)
      .in('qualification_level', ['higher', 'adv_higher'])

    for (const row of reqRows ?? []) {
      const sid = (row as { subject_id: string }).subject_id
      if (sid) courseCountsBySubject[sid] = (courseCountsBySubject[sid] ?? 0) + 1
    }
  }

  // Saved courses (name + university)
  const { data: savedCoursesRaw } = await supabase
    .from('saved_courses')
    .select('id, course_id, course:courses(id, name, university:universities(name))')
    .eq('student_id', user.id)
    .limit(10)

  // Subject requirements for saved courses
  const savedCourseIds = (savedCoursesRaw ?? [])
    .map((sc) => (sc as { course_id: string }).course_id)
    .filter(Boolean)

  const requirementsByCourseId: Record<string, { subject_name: string; subject_id: string; qualification_level: string; is_mandatory: boolean | null }[]> = {}
  if (savedCourseIds.length > 0) {
    const { data: reqData } = await supabase
      .from('course_subject_requirements')
      .select('course_id, subject_id, qualification_level, is_mandatory, subject:subjects(name)')
      .in('course_id', savedCourseIds)

    for (const row of reqData ?? []) {
      const r = row as { course_id: string; subject_id: string; qualification_level: string; is_mandatory: boolean | null; subject: { name: string } | null }
      if (!requirementsByCourseId[r.course_id]) requirementsByCourseId[r.course_id] = []
      requirementsByCourseId[r.course_id].push({
        subject_name: r.subject?.name ?? 'Unknown',
        subject_id: r.subject_id,
        qualification_level: r.qualification_level,
        is_mandatory: r.is_mandatory,
      })
    }
  }

  // Bursary matches
  const { data: matchRows } = await supabase
    .from('student_bursary_matches')
    .select('bursary:bursaries(name, amount_description)')
    .eq('student_id', user.id)
    .limit(3)

  const bursaries = (matchRows ?? [])
    .map((m) => (m as { bursary: { name: string; amount_description: string | null } | null }).bursary)
    .filter(Boolean)
    .slice(0, 3) as { name: string; amount_description: string | null }[]

  // Build grade lookup by subject_id
  const gradeBySubjectId: Record<string, { grade: string | null; predicted_grade: string | null; qualification_type: string | null; is_actual: boolean | null; predicted: boolean | null }> = {}
  for (const g of grades ?? []) {
    const gr = g as { subject_id: string | null; grade: string; predicted_grade: string | null; qualification_type: string | null; is_actual: boolean | null; predicted: boolean | null }
    if (gr.subject_id) gradeBySubjectId[gr.subject_id] = gr
  }

  // Assemble current choices
  const currentChoices = (currentChoicesRaw ?? []).map((c) => {
    const row = c as {
      id: string
      rank_order: number | null
      is_reserve: boolean | null
      subject_id: string
      subject: {
        id: string
        name: string
        career_links: { career_sector: { id: string; name: string } | null }[]
      } | null
    }
    return {
      id: row.id,
      rank_order: row.rank_order,
      is_reserve: row.is_reserve,
      subject_name: row.subject?.name ?? 'Unknown',
      subject_id: row.subject_id,
      career_sectors: (row.subject?.career_links ?? [])
        .map((cl) => cl.career_sector?.name)
        .filter((n): n is string => !!n),
      uni_course_count: courseCountsBySubject[row.subject_id] ?? 0,
    }
  })

  // Assemble previous choices with grades
  const previousChoices = previousChoicesRaw.map((c) => {
    const grade = gradeBySubjectId[c.subject_id]
    return {
      id: c.id,
      rank_order: c.rank_order,
      subject_name: c.subject?.name ?? 'Unknown',
      subject_id: c.subject_id,
      grade_actual: grade?.is_actual ? grade.grade : null,
      grade_predicted: grade?.predicted_grade ?? (grade?.predicted ? grade.grade : null),
      qualification_type: grade?.qualification_type ?? null,
    }
  })

  // Assemble saved courses
  const savedCourses = (savedCoursesRaw ?? []).map((sc) => {
    const row = sc as {
      id: string
      course_id: string
      course: { id: string; name: string; university: { name: string } | null } | null
    }
    return {
      id: row.id,
      course_name: row.course?.name ?? 'Unknown course',
      university_name: row.course?.university?.name ?? 'Unknown university',
      course_id: row.course_id,
      requirements: requirementsByCourseId[row.course_id] ?? [],
    }
  })

  const saas = student.household_income_band && SAAS_COPY[student.household_income_band]
    ? SAAS_COPY[student.household_income_band]
    : null

  const missingDataFlags = {
    noGrades: !grades || grades.length === 0,
    noSavedCourses: savedCourses.length === 0,
    noCurrentChoices: currentChoices.length === 0,
    noPreviousChoices: previousChoices.length === 0,
    noPostcode: !student.simd_decile,
  }

  return NextResponse.json({
    student: {
      first_name: student.first_name,
      last_name: student.last_name,
      school_stage: student.school_stage,
      school_name: student.school_name,
      simd_decile: student.simd_decile,
    },
    transition: currentTransition,
    transitionLabel: TRANSITION_LABEL[currentTransition],
    previousTransition,
    rules: rules ? {
      total_subjects: rules.total_subjects,
      compulsory_subjects: (rules.compulsory_subjects as string[] | null) ?? [],
      num_free_choices: rules.num_free_choices,
      num_reserves: rules.num_reserves ?? 1,
      breadth_requirements: rules.breadth_requirements,
    } : null,
    currentChoices,
    previousChoices,
    savedCourses,
    bursaries,
    saas,
    simdDeprived: student.simd_decile !== null && student.simd_decile <= 4,
    missingDataFlags,
    generatedAt: new Date().toISOString(),
  })
}
