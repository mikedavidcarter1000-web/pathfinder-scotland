import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useCurrentStudent, useStudentGrades, useGradeSummary } from './use-student'
import {
  calculateEligibility,
  type CourseRequirementRow,
  type EligibilityStatus,
} from './use-course-matching'
import { compareGradeStrings } from '@/lib/grades'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type StudentGrade = Tables<'student_grades'>
type Course = Tables<'courses'> & { university?: Tables<'universities'> }

// ── Public types ──────────────────────────────────────────────────────

export interface GradeEntry {
  subject: string
  grade: string // A, B, C, D
  subjectId?: string | null
}

export interface CourseInfo {
  id: string
  name: string
  universityName: string
}

export interface SubjectSensitivity {
  subject: string
  currentGrade: string

  upgradeGrade: string | null
  upgradeDelta: number
  upgradeCourses: CourseInfo[]

  downgradeGrade: string | null
  downgradeDelta: number
  downgradeCourses: CourseInfo[]

  worstCaseGrade: string
  worstCaseDelta: number
  worstCaseCourses: CourseInfo[]
}

export interface MissingSubjectResult {
  subject: string
  subjectId: string
  gradeNeeded: string
  coursesUnlocked: number
  courses: CourseInfo[]
}

export interface SensitivityAnalysis {
  baseline: {
    eligibleCount: number
    eligibleCourses: CourseInfo[]
    eligibleViaWaCount: number
    universityCount: number
  }
  sensitivity: SubjectSensitivity[]
  missingSubjects: MissingSubjectResult[]
  biggestRisk: SubjectSensitivity | null
  waComparison: {
    withoutWa: number
    withWa: number
    difference: number
  } | null
}

// ── Constants ─────────────────────────────────────────────────────────

const HIGHER_GRADES = ['A', 'B', 'C', 'D']

function gradeUp(grade: string): string | null {
  const idx = HIGHER_GRADES.indexOf(grade)
  return idx > 0 ? HIGHER_GRADES[idx - 1] : null
}

function gradeDown(grade: string): string | null {
  const idx = HIGHER_GRADES.indexOf(grade)
  return idx >= 0 && idx < HIGHER_GRADES.length - 1 ? HIGHER_GRADES[idx + 1] : null
}

// ── Helpers ───────────────────────────────────────────────────────────

function buildHigherString(grades: GradeEntry[]): string {
  const gradeValues: Record<string, number> = { A: 5, B: 4, C: 3, D: 2 }
  return grades
    .filter((g) => g.grade && HIGHER_GRADES.includes(g.grade))
    .sort((a, b) => (gradeValues[b.grade] || 0) - (gradeValues[a.grade] || 0))
    .map((g) => g.grade)
    .join('')
}

function toVirtualStudentGrades(grades: GradeEntry[]): StudentGrade[] {
  return grades.map((g, i) => ({
    id: `virtual-${i}`,
    student_id: '',
    subject: g.subject,
    grade: g.grade,
    qualification_type: 'higher',
    subject_id: g.subjectId ?? null,
    predicted: false,
    year: null,
    created_at: '',
    updated_at: '',
  })) as StudentGrade[]
}

function toCourseInfo(course: Course): CourseInfo {
  return {
    id: course.id,
    name: course.name,
    universityName: (course.university as Tables<'universities'> | undefined)?.name ?? 'Unknown',
  }
}

function isEligible(status: EligibilityStatus): boolean {
  return status === 'eligible' || status === 'eligible_via_wa'
}

/** Count eligible courses for a given grade set, optionally overriding student for WA. */
function countEligible(
  courses: Course[],
  reqsByCourse: Map<string, CourseRequirementRow[]>,
  virtualGrades: StudentGrade[],
  higherString: string,
  student: Student | null,
): { eligible: CourseInfo[]; eligibleViaWa: number } {
  const eligible: CourseInfo[] = []
  let eligibleViaWa = 0

  for (const course of courses) {
    const reqs = reqsByCourse.get(course.id) ?? []
    const detail = calculateEligibility(course, reqs, virtualGrades, student, higherString)
    if (isEligible(detail.status)) {
      eligible.push(toCourseInfo(course))
      if (detail.status === 'eligible_via_wa') eligibleViaWa++
    }
  }

  return { eligible, eligibleViaWa }
}

// ── Core analysis (pure function) ─────────────────────────────────────

export function runSensitivityAnalysis(
  inputGrades: GradeEntry[],
  courses: Course[],
  allRequirements: CourseRequirementRow[],
  student: Student | null,
  allHigherSubjects: Array<{ id: string; name: string }>,
): SensitivityAnalysis {
  // Index requirements by course_id
  const reqsByCourse = new Map<string, CourseRequirementRow[]>()
  for (const row of allRequirements) {
    const arr = reqsByCourse.get(row.course_id) ?? []
    arr.push(row)
    reqsByCourse.set(row.course_id, arr)
  }

  // ── Baseline ──
  const baselineGrades = toVirtualStudentGrades(inputGrades)
  const baselineString = buildHigherString(inputGrades)
  const baseline = countEligible(courses, reqsByCourse, baselineGrades, baselineString, student)
  const baselineSet = new Set(baseline.eligible.map((c) => c.id))
  const baselineUnis = new Set(baseline.eligible.map((c) => c.universityName))

  // ── Per-subject sensitivity ──
  const sensitivity: SubjectSensitivity[] = []

  for (let i = 0; i < inputGrades.length; i++) {
    const entry = inputGrades[i]
    const currentGrade = entry.grade

    // Grade UP
    const upGrade = gradeUp(currentGrade)
    let upgradeDelta = 0
    let upgradeCourses: CourseInfo[] = []
    if (upGrade) {
      const modified = inputGrades.map((g, j) =>
        j === i ? { ...g, grade: upGrade } : g,
      )
      const modGrades = toVirtualStudentGrades(modified)
      const modString = buildHigherString(modified)
      const result = countEligible(courses, reqsByCourse, modGrades, modString, student)
      const newSet = new Set(result.eligible.map((c) => c.id))
      upgradeCourses = result.eligible.filter((c) => !baselineSet.has(c.id))
      upgradeDelta = upgradeCourses.length
    }

    // Grade DOWN
    const downGrade = gradeDown(currentGrade)
    let downgradeDelta = 0
    let downgradeCourses: CourseInfo[] = []
    if (downGrade) {
      const modified = inputGrades.map((g, j) =>
        j === i ? { ...g, grade: downGrade } : g,
      )
      const modGrades = toVirtualStudentGrades(modified)
      const modString = buildHigherString(modified)
      const result = countEligible(courses, reqsByCourse, modGrades, modString, student)
      const downSet = new Set(result.eligible.map((c) => c.id))
      downgradeCourses = baseline.eligible.filter((c) => !downSet.has(c.id))
      downgradeDelta = -downgradeCourses.length
    }

    // Worst case (grade D)
    let worstCaseDelta = 0
    let worstCaseCourses: CourseInfo[] = []
    const worstGrade = 'D'
    if (currentGrade !== 'D') {
      const modified = inputGrades.map((g, j) =>
        j === i ? { ...g, grade: worstGrade } : g,
      )
      const modGrades = toVirtualStudentGrades(modified)
      const modString = buildHigherString(modified)
      const result = countEligible(courses, reqsByCourse, modGrades, modString, student)
      const worstSet = new Set(result.eligible.map((c) => c.id))
      worstCaseCourses = baseline.eligible.filter((c) => !worstSet.has(c.id))
      worstCaseDelta = -worstCaseCourses.length
    }

    sensitivity.push({
      subject: entry.subject,
      currentGrade,
      upgradeGrade: upGrade,
      upgradeDelta,
      upgradeCourses,
      downgradeGrade: downGrade,
      downgradeDelta,
      downgradeCourses,
      worstCaseGrade: worstGrade,
      worstCaseDelta,
      worstCaseCourses,
    })
  }

  // Sort by highest improvement potential
  sensitivity.sort((a, b) => b.upgradeDelta - a.upgradeDelta)

  // ── Missing subjects (top 5 most impactful) ──
  const studentSubjects = new Set(
    inputGrades.map((g) => g.subject.toLowerCase().trim()),
  )
  const candidateSubjects = allHigherSubjects.filter(
    (s) => !studentSubjects.has(s.name.toLowerCase().trim()),
  )

  const missingResults: MissingSubjectResult[] = []
  for (const candidate of candidateSubjects) {
    // Simulate adding at grade B (realistic target)
    const extended = [
      ...inputGrades,
      { subject: candidate.name, grade: 'B', subjectId: candidate.id },
    ]
    const extGrades = toVirtualStudentGrades(extended)
    const extString = buildHigherString(extended)
    const result = countEligible(courses, reqsByCourse, extGrades, extString, student)
    const newCourses = result.eligible.filter((c) => !baselineSet.has(c.id))
    if (newCourses.length > 0) {
      missingResults.push({
        subject: candidate.name,
        subjectId: candidate.id,
        gradeNeeded: 'B',
        coursesUnlocked: newCourses.length,
        courses: newCourses,
      })
    }
  }
  missingResults.sort((a, b) => b.coursesUnlocked - a.coursesUnlocked)
  const topMissing = missingResults.slice(0, 5)

  // ── Biggest risk ──
  const biggestRisk = sensitivity.reduce<SubjectSensitivity | null>((worst, s) => {
    if (!worst) return s
    return s.downgradeDelta < worst.downgradeDelta ? s : worst
  }, null)

  // ── WA comparison ──
  let waComparison: SensitivityAnalysis['waComparison'] = null
  if (student && isWideningEligible(student)) {
    // Count without WA (null student)
    const withoutWa = countEligible(courses, reqsByCourse, baselineGrades, baselineString, null)
    waComparison = {
      withoutWa: withoutWa.eligible.length,
      withWa: baseline.eligible.length,
      difference: baseline.eligible.length - withoutWa.eligible.length,
    }
  }

  return {
    baseline: {
      eligibleCount: baseline.eligible.length,
      eligibleCourses: baseline.eligible,
      eligibleViaWaCount: baseline.eligibleViaWa,
      universityCount: baselineUnis.size,
    },
    sensitivity,
    missingSubjects: topMissing,
    biggestRisk,
    waComparison,
  }
}

function isWideningEligible(student: Student): boolean {
  return Boolean(
    (student.simd_decile !== null && student.simd_decile !== undefined && student.simd_decile <= 4) ||
      student.care_experienced ||
      student.is_carer ||
      student.first_generation,
  )
}

// ── Data fetching hooks ───────────────────────────────────────────────

function useAllCoursesWithUni() {
  const supabase = getSupabaseClient()
  return useQuery<Course[]>({
    queryKey: ['all-courses-with-uni'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, university:universities(*)')
        .order('name')
      if (error) throw error
      return (data ?? []) as Course[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

function useAllCourseRequirements(courseIds: string[]) {
  const supabase = getSupabaseClient()
  const key = courseIds.length > 0 ? 'loaded' : 'empty'

  return useQuery<CourseRequirementRow[]>({
    queryKey: ['all-course-requirements', key],
    enabled: courseIds.length > 0,
    queryFn: async () => {
      // Fetch in batches of 200 to stay within Supabase limits
      const batchSize = 200
      const allRows: CourseRequirementRow[] = []

      for (let i = 0; i < courseIds.length; i += batchSize) {
        const batch = courseIds.slice(i, i + batchSize)
        const { data, error } = await supabase
          .from('course_subject_requirements')
          .select(`
            course_id,
            subject_id,
            qualification_level,
            min_grade,
            is_mandatory,
            subject:subjects(name)
          `)
          .in('course_id', batch)

        if (error) throw error

        type JoinRow = {
          course_id: string
          subject_id: string
          qualification_level: string
          min_grade: string | null
          is_mandatory: boolean | null
          subject: { name: string } | null
        }
        for (const row of (data as unknown as JoinRow[]) || []) {
          allRows.push({
            course_id: row.course_id,
            subject_id: row.subject_id,
            subject_name: row.subject?.name ?? '',
            qualification_level: row.qualification_level,
            min_grade: row.min_grade,
            is_mandatory: row.is_mandatory ?? true,
          })
        }
      }

      return allRows
    },
    staleTime: 5 * 60 * 1000,
  })
}

function useHigherSubjects() {
  const supabase = getSupabaseClient()
  return useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['higher-subjects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('is_available_higher', true)
        .order('name')
      if (error) throw error
      return (data ?? []) as Array<{ id: string; name: string }>
    },
    staleTime: 10 * 60 * 1000,
  })
}

// ── Main hook ─────────────────────────────────────────────────────────

export function useGradeSensitivity(inputGrades: GradeEntry[]) {
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const { data: courses, isLoading: coursesLoading } = useAllCoursesWithUni()
  const courseIds = useMemo(() => (courses ?? []).map((c) => c.id), [courses])
  const { data: requirements, isLoading: reqsLoading } = useAllCourseRequirements(courseIds)
  const { data: higherSubjects, isLoading: subjectsLoading } = useHigherSubjects()

  const isLoading = coursesLoading || reqsLoading || subjectsLoading
  const hasData = !!(courses && requirements && higherSubjects)
  const hasGrades = inputGrades.length >= 3

  const analysis = useMemo<SensitivityAnalysis | null>(() => {
    if (!hasData || !hasGrades) return null
    return runSensitivityAnalysis(
      inputGrades,
      courses!,
      requirements!,
      student ?? null,
      higherSubjects!,
    )
  }, [inputGrades, courses, requirements, student, higherSubjects, hasData, hasGrades])

  return {
    analysis,
    isLoading,
    isReady: hasData,
    student: student ?? null,
    isWideningAccess: student ? isWideningEligible(student) : false,
  }
}
