import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import leaverDestinations from '@/data/leaver-destinations.json'
import cesMapping from '@/data/ces-capacity-mapping.json'

export const runtime = 'nodejs'

type LeaverRecord = {
  council: string
  university_pct: number
  college_pct: number
  employment_pct: number
  training_pct: number
  other_pct: number
  needs_verification?: boolean
}

type LeaverFile = { academic_year?: string; source?: string; councils: LeaverRecord[] }

// Scotland averages (approx -- SFC 2022-23 published national figures)
const SCOTLAND_AVG = {
  university_pct: 40,
  college_pct: 25,
  employment_pct: 22,
  training_pct: 4,
  other_pct: 9,
}

export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('id, local_authority')
    .eq('id', ctx.schoolId)
    .maybeSingle()

  const councilName = school?.local_authority || null

  const leaverFile = leaverDestinations as LeaverFile
  const councilData = councilName
    ? leaverFile.councils.find((c) => c.council === councilName) || null
    : null

  // Linked student IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: linkRows } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', ctx.schoolId)
  const studentIds: string[] = (linkRows ?? []).map((r: { student_id: string }) => r.student_id)
  const total = studentIds.length

  // CES capacities: for each capacity, % of students who have completed >=1 indicator
  const capacities = Object.entries(cesMapping).map(([key, val]) => ({
    key,
    ...(val as { label: string; description: string; indicators: string[] }),
  }))

  let ces = { self: 0, strengths: 0, horizons: 0, networks: 0 }
  if (total > 0) {
    // Indicators that map to data we can measure:
    // quiz_completed -> quiz_results rows
    // career_sectors_explored -> saved_courses.categories
    // subjects_chosen -> student_subject_choices
    // grades_tracked -> student_grades
    // courses_saved / universities_browsed / careers_explored -> saved_courses
    const [quizRes, subRes, gradesRes, savedRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('quiz_results').select('student_id').in('student_id', studentIds),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('student_subject_choices').select('student_id').in('student_id', studentIds),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('student_grades').select('student_id').in('student_id', studentIds),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('saved_courses').select('student_id').in('student_id', studentIds),
    ])
    const setOf = (d: { student_id: string }[] | null) => new Set((d ?? []).map((r) => r.student_id))
    const didQuiz = setOf(quizRes.data)
    const didSubs = setOf(subRes.data)
    const didGrades = setOf(gradesRes.data)
    const didSaved = setOf(savedRes.data)

    const selfSet = new Set([...didQuiz, ...didSaved])
    const strengthsSet = new Set([...didSubs, ...didGrades])
    const horizonsSet = didSaved
    ces = {
      self: Math.round((selfSet.size / total) * 100),
      strengths: Math.round((strengthsSet.size / total) * 100),
      horizons: Math.round((horizonsSet.size / total) * 100),
      networks: 0,
    }
  }

  // DYW indicators
  let dywExplored = 0
  let dywSaved = 0
  let dywQuiz = 0
  let dywSimd12Engaged = 0
  let simd12Total = 0

  if (total > 0) {
    const [quizRes, savedRes, studentsRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('quiz_results').select('student_id').in('student_id', studentIds),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('saved_courses').select('student_id').in('student_id', studentIds),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('students').select('id, simd_decile, last_active_at').in('id', studentIds),
    ])
    const savedSet = new Set((savedRes.data ?? []).map((r: { student_id: string }) => r.student_id))
    const quizSet = new Set((quizRes.data ?? []).map((r: { student_id: string }) => r.student_id))
    dywSaved = savedSet.size
    dywQuiz = quizSet.size
    // Explored: proxy = saved >0 or quiz completed
    dywExplored = new Set([...savedSet, ...quizSet]).size
    for (const s of (studentsRes.data ?? []) as Array<{ id: string; simd_decile: number | null; last_active_at: string | null }>) {
      if (typeof s.simd_decile === 'number' && s.simd_decile <= 2) {
        simd12Total += 1
        // "engaged with widening access content" proxy: last_active_at in past 90 days
        if (s.last_active_at) {
          const t = new Date(s.last_active_at).getTime()
          if (Date.now() - t < 90 * 24 * 3600 * 1000) dywSimd12Engaged += 1
        }
      }
    }
  }

  return NextResponse.json({
    councilName,
    councilData,
    scotlandAvg: SCOTLAND_AVG,
    academicYear: leaverFile.academic_year ?? null,
    source: leaverFile.source ?? null,
    ces,
    capacities,
    total,
    dyw: {
      exploredPct: total > 0 ? Math.round((dywExplored / total) * 100) : 0,
      exploredCount: dywExplored,
      savedPct: total > 0 ? Math.round((dywSaved / total) * 100) : 0,
      savedCount: dywSaved,
      quizPct: total > 0 ? Math.round((dywQuiz / total) * 100) : 0,
      quizCount: dywQuiz,
      simd12EngagedPct: simd12Total > 0 ? Math.round((dywSimd12Engaged / simd12Total) * 100) : 0,
      simd12EngagedCount: dywSimd12Engaged,
      simd12Total,
    },
  })
}
