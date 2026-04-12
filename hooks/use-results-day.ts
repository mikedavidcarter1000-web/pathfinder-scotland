import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { calculateEligibility, type CourseRequirementRow } from './use-course-matching'
import { compareGradeStrings } from '@/lib/grades'
import type { Tables } from '@/types/database'

// ── Results Day date ────────────────────────────────────────────────
// SQA results 2026 — first Tuesday of August
export const RESULTS_DAY = new Date(2026, 7, 4) // 4 August 2026
export const RESULTS_DAY_DISPLAY = 'Tuesday 4 August 2026'

// ── Countdown ───────────────────────────────────────────────────────
export function useResultsDayCountdown() {
  const now = new Date()
  const diff = RESULTS_DAY.getTime() - now.getTime()
  const daysUntil = Math.ceil(diff / (1000 * 60 * 60 * 24))

  return {
    daysUntil: Math.max(0, daysUntil),
    isBeforeResultsDay: daysUntil > 0,
    isResultsDayOrAfter: daysUntil <= 0,
  }
}

// ── Grade comparison (predicted → actual) ───────────────────────────
export interface GradeComparison {
  subject: string
  qualificationType: string
  predictedGrade: string
  actualGrade: string
  change: 'up' | 'down' | 'same'
}

const GRADE_ORDER = ['A', 'B', 'C', 'D']

export function buildComparisons(
  previousGrades: Tables<'student_grades'>[],
  actualMap: Record<string, string> // gradeId → actual grade
): GradeComparison[] {
  return previousGrades
    .filter((g) => actualMap[g.id] && actualMap[g.id] !== '')
    .map((g) => {
      const predicted = g.grade
      const actual = actualMap[g.id]
      const pIdx = GRADE_ORDER.indexOf(predicted)
      const aIdx = GRADE_ORDER.indexOf(actual)
      let change: 'up' | 'down' | 'same' = 'same'
      if (pIdx >= 0 && aIdx >= 0) {
        if (aIdx < pIdx) change = 'up'
        else if (aIdx > pIdx) change = 'down'
      }
      return {
        subject: g.subject,
        qualificationType: g.qualification_type,
        predictedGrade: predicted,
        actualGrade: actual,
        change,
      }
    })
}

// Overall shift: net grade positions gained or lost
export function overallShift(comparisons: GradeComparison[]): number {
  return comparisons.reduce((sum, c) => {
    const pIdx = GRADE_ORDER.indexOf(c.predictedGrade)
    const aIdx = GRADE_ORDER.indexOf(c.actualGrade)
    if (pIdx < 0 || aIdx < 0) return sum
    return sum + (pIdx - aIdx) // positive = improvement
  }, 0)
}

// ── UCAS points for an arbitrary set of grades ──────────────────────
const UCAS: Record<string, Record<string, number>> = {
  higher: { A: 33, B: 27, C: 21, D: 15 },
  advanced_higher: { A: 56, B: 48, C: 40, D: 32 },
}

export function quickUCASPoints(
  grades: Array<{ grade: string; qualification_type: string }>
): number {
  return grades.reduce((t, g) => t + (UCAS[g.qualification_type]?.[g.grade] ?? 0), 0)
}

// ── Quick eligibility for logged-out users ──────────────────────────
// Runs the full course-matching pipeline with ad-hoc grades (no auth).

type CourseWithUni = Tables<'courses'> & { university: Tables<'universities'> }

export function useQuickEligibility(
  quickGrades: Array<{ subject: string; grade: string }>,
  enabled: boolean
) {
  const supabase = getSupabaseClient()

  // 1. All courses (public, cacheable)
  const { data: courses, isLoading: coursesLoading } = useQuery<CourseWithUni[]>({
    queryKey: ['results-day-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, university:universities(*)')
        .limit(500)
      if (error) throw error
      return (data ?? []) as CourseWithUni[]
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })

  // 2. All course requirements
  const courseIds = useMemo(() => (courses ?? []).map((c) => c.id), [courses])
  const reqKey = useMemo(() => courseIds.slice().sort().join(','), [courseIds])
  const { data: requirements } = useQuery<CourseRequirementRow[]>({
    queryKey: ['results-day-reqs', reqKey],
    queryFn: async () => {
      if (courseIds.length === 0) return []
      const { data, error } = await supabase
        .from('course_subject_requirements')
        .select(
          'course_id, subject_id, qualification_level, min_grade, is_mandatory, subject:subjects(name)'
        )
        .in('course_id', courseIds)
      if (error) throw error
      type JoinRow = {
        course_id: string
        subject_id: string
        qualification_level: string
        min_grade: string | null
        is_mandatory: boolean | null
        subject: { name: string } | null
      }
      return ((data as unknown as JoinRow[]) ?? []).map((r) => ({
        course_id: r.course_id,
        subject_id: r.subject_id,
        subject_name: r.subject?.name ?? '',
        qualification_level: r.qualification_level,
        min_grade: r.min_grade,
        is_mandatory: r.is_mandatory ?? true,
      }))
    },
    enabled: enabled && courseIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  // 3. Build pseudo-grade rows
  const gradeRows = useMemo(
    () =>
      quickGrades
        .filter((g) => g.subject && g.grade && g.grade !== '')
        .map((g) => ({
          id: '',
          student_id: '',
          subject: g.subject,
          subject_id: null as string | null,
          grade: g.grade,
          qualification_type: 'higher' as const,
          predicted: null as boolean | null,
          year: null as number | null,
          created_at: null as string | null,
          updated_at: null as string | null,
          is_actual: true as boolean | null,
          predicted_grade: null as string | null,
        })),
    [quickGrades]
  )

  // 4. Higher string
  const higherString = useMemo(() => {
    return gradeRows
      .filter((g) => g.qualification_type === 'higher')
      .map((g) => g.grade)
      .sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b))
      .slice(0, 5)
      .join('')
  }, [gradeRows])

  // 5. Run eligibility
  const result = useMemo(() => {
    if (!courses || !requirements || !enabled || gradeRows.length === 0) {
      return { courses: [] as (CourseWithUni & { eligibility: ReturnType<typeof calculateEligibility> })[], stats: { eligible: 0, eligibleViaWa: 0, possible: 0, total: 0 }, universityCount: 0 }
    }

    const reqsByCourse = new Map<string, CourseRequirementRow[]>()
    for (const r of requirements) {
      const arr = reqsByCourse.get(r.course_id) ?? []
      arr.push(r)
      reqsByCourse.set(r.course_id, arr)
    }

    const matched = courses.map((course) => ({
      ...course,
      eligibility: calculateEligibility(
        course,
        reqsByCourse.get(course.id) ?? [],
        gradeRows,
        null,
        higherString
      ),
    }))

    const eligible = matched.filter((c) => c.eligibility.status === 'eligible')
    const eligibleViaWa = matched.filter((c) => c.eligibility.status === 'eligible_via_wa')
    const possible = matched.filter((c) => c.eligibility.status === 'possible')

    const uniIds = new Set(
      [...eligible, ...eligibleViaWa].map((c) => c.university_id)
    )

    return {
      courses: matched,
      stats: {
        eligible: eligible.length,
        eligibleViaWa: eligibleViaWa.length,
        possible: possible.length,
        total: matched.length,
      },
      universityCount: uniIds.size,
    }
  }, [courses, requirements, gradeRows, higherString, enabled])

  return { ...result, isLoading: coursesLoading, higherString }
}
