import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

type SavedCourseRow = {
  course:
    | {
        name: string | null
        university: { name: string | null } | null
        subject_area: string | null
      }
    | null
}

type SubjectChoiceRow = {
  transition: string | null
  subject: { name: string | null } | null
}

type GradeRow = {
  subject: string | null
  grade: string | null
  qualification_type: string | null
  is_actual: boolean | null
  predicted: boolean | null
}

type QuizRow = {
  top_types: string[] | null
  completed_at: string | null
}

type ContextResponse = {
  authenticated: boolean
  firstName?: string | null
  schoolStage?: string | null
  savedCourses?: { name: string; university: string; subjectArea: string | null }[]
  currentSubjects?: string[]
  grades?: { subject: string; grade: string; qualification: string }[]
  topRiasec?: string[]
}

export async function GET(): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const body: ContextResponse = { authenticated: false }
    return NextResponse.json(body)
  }

  const [studentRes, savedRes, choicesRes, gradesRes, quizRes] = await Promise.all([
    supabase
      .from('students')
      .select('first_name, school_stage')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('saved_courses')
      .select('course:courses(name, subject_area, university:universities(name))')
      .eq('student_id', user.id)
      .limit(5),
    supabase
      .from('student_subject_choices')
      .select('transition, subject:subjects(name)')
      .eq('student_id', user.id),
    supabase
      .from('student_grades')
      .select('subject, grade, qualification_type, is_actual, predicted')
      .eq('student_id', user.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('quiz_results')
      .select('top_types, completed_at')
      .eq('student_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const savedCourses = ((savedRes.data ?? []) as unknown as SavedCourseRow[])
    .map((row) => ({
      name: row.course?.name ?? '',
      university: row.course?.university?.name ?? '',
      subjectArea: row.course?.subject_area ?? null,
    }))
    .filter((c) => c.name)

  const stageForCurrent = pickCurrentTransition(studentRes.data?.school_stage ?? null)
  const currentSubjects = (((choicesRes.data ?? []) as unknown) as SubjectChoiceRow[])
    .filter((r) => !stageForCurrent || r.transition === stageForCurrent)
    .map((r) => r.subject?.name ?? '')
    .filter(Boolean)

  const grades = (((gradesRes.data ?? []) as unknown) as GradeRow[])
    .filter((g) => !!g.subject && !!g.grade)
    .map((g) => ({
      subject: g.subject as string,
      grade: g.grade as string,
      qualification: g.qualification_type ?? '',
    }))

  const quizRow = (quizRes.data ?? null) as QuizRow | null
  const topRiasec = quizRow?.top_types ?? []

  const body: ContextResponse = {
    authenticated: true,
    firstName: studentRes.data?.first_name ?? null,
    schoolStage: studentRes.data?.school_stage ?? null,
    savedCourses,
    currentSubjects,
    grades,
    topRiasec,
  }

  return NextResponse.json(body)
}

function pickCurrentTransition(stage: string | null): string | null {
  switch (stage) {
    case 's2':
      return 's2_to_s3'
    case 's3':
      return 's3_to_s4'
    case 's4':
      return 's4_to_s5'
    case 's5':
      return 's5_to_s6'
    default:
      return null
  }
}
