import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useStudentGrades, useCurrentStudent, useGradeSummary } from './use-student'
import { useCourses } from './use-courses'
import { compareGradeStrings } from '@/lib/grades'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type StudentGrade = Tables<'student_grades'>
type Course = Tables<'courses'> & { university?: Tables<'universities'> }

interface EntryRequirements {
  highers?: string
  advanced_highers?: string
  ucas_points?: number
  required_subjects?: string[]
}

interface WideningAccessRequirements {
  simd20_offer?: string
  simd40_offer?: string
  care_experienced_offer?: string
  general_offer?: string
}

export interface CourseRequirementRow {
  course_id: string
  subject_id: string
  subject_name: string
  qualification_level: string
  min_grade: string | null
  is_mandatory: boolean
}

export type EligibilityStatus =
  | 'eligible'
  | 'eligible_via_wa'
  | 'possible'
  | 'missing_subjects'
  | 'ineligible'

export type WideningOfferType = 'simd20' | 'simd40' | 'care_experienced' | 'general'

export interface EligibilityDetail {
  status: EligibilityStatus
  missingSubjects: string[]
  belowGradeSubjects: string[]
  metSubjects: string[]
  isWideningEligible: boolean
  wideningCriteria: WideningOfferType[]
  standardRequirement: string | null
  adjustedRequirement: string | null
  studentHigherString: string
  wideningOfferType: WideningOfferType | null
}

// Ordered from best → worst so we can use indexOf to compare.
const GRADE_ORDER = ['A', 'B', 'C', 'D', 'E']

function gradeIndex(grade: string | null | undefined): number {
  if (!grade) return 99
  const idx = GRADE_ORDER.indexOf(grade.toUpperCase())
  return idx === -1 ? 99 : idx
}

function meetsMinGrade(studentGrade: string | null, minGrade: string | null): boolean {
  if (!minGrade) return !!studentGrade // no explicit min but student must at least have the subject
  if (!studentGrade) return false
  return gradeIndex(studentGrade) <= gradeIndex(minGrade)
}

// Map qualification_level from course_subject_requirements onto the
// student_grades.qualification_type enum so we can match rows.
const LEVEL_TO_QUAL_TYPE: Record<string, string> = {
  higher: 'higher',
  adv_higher: 'advanced_higher',
  n5: 'national_5',
}

function isWideningEligibleStudent(student: Student | null | undefined): boolean {
  if (!student) return false
  return Boolean(
    (student.simd_decile !== null && student.simd_decile !== undefined && student.simd_decile <= 4) ||
      student.care_experienced ||
      student.is_carer ||
      student.first_generation
  )
}

// Enumerate every WA criterion a student meets. Useful for UI that wants to
// list all applicable schemes (e.g. the course detail table), as distinct from
// selectWideningOffer which picks the single most favourable offer to apply.
export function getStudentWideningCriteria(
  student: Student | null | undefined
): WideningOfferType[] {
  if (!student) return []
  const criteria: WideningOfferType[] = []
  if (student.simd_decile !== null && student.simd_decile !== undefined && student.simd_decile <= 2) {
    criteria.push('simd20')
  } else if (student.simd_decile !== null && student.simd_decile !== undefined && student.simd_decile <= 4) {
    criteria.push('simd40')
  }
  if (student.care_experienced) criteria.push('care_experienced')
  // is_carer and first_generation fall under the generic widening category
  // for offer-matching purposes (no dedicated JSONB field), but still count
  // as criteria the student can claim.
  if ((student.is_carer || student.first_generation) && !criteria.includes('general')) {
    criteria.push('general')
  }
  return criteria
}

function selectWideningOffer(
  student: Student | null | undefined,
  wideningReqs: WideningAccessRequirements | null
): { offer: string | null; type: WideningOfferType | null } {
  if (!student || !wideningReqs) return { offer: null, type: null }
  if (student.simd_decile !== null && student.simd_decile !== undefined && student.simd_decile <= 2 && wideningReqs.simd20_offer) {
    return { offer: wideningReqs.simd20_offer, type: 'simd20' }
  }
  if (student.simd_decile !== null && student.simd_decile !== undefined && student.simd_decile <= 4 && wideningReqs.simd40_offer) {
    return { offer: wideningReqs.simd40_offer, type: 'simd40' }
  }
  if (student.care_experienced && wideningReqs.care_experienced_offer) {
    return { offer: wideningReqs.care_experienced_offer, type: 'care_experienced' }
  }
  if (wideningReqs.general_offer) {
    return { offer: wideningReqs.general_offer, type: 'general' }
  }
  return { offer: null, type: null }
}

// Core eligibility calculation. Pure function — no hooks or queries.
export function calculateEligibility(
  course: Course,
  requirements: CourseRequirementRow[],
  studentGrades: StudentGrade[],
  student: Student | null | undefined,
  studentHigherString: string
): EligibilityDetail {
  const entryReqs = (course.entry_requirements as EntryRequirements | null) ?? null
  const wideningReqs = (course.widening_access_requirements as WideningAccessRequirements | null) ?? null

  const isWidening = isWideningEligibleStudent(student)
  const wideningCriteria = getStudentWideningCriteria(student)
  const wideningOffer = isWidening ? selectWideningOffer(student, wideningReqs) : { offer: null, type: null as WideningOfferType | null }

  const standardRequirement = entryReqs?.highers ?? null
  const adjustedRequirement = wideningOffer.offer ?? standardRequirement

  // --- Subject-level checks via the relational requirements table ---
  const mandatory = requirements.filter((r) => r.is_mandatory)
  const missingSubjects: string[] = []
  const belowGradeSubjects: string[] = []
  const metSubjects: string[] = []

  for (const req of mandatory) {
    const qualType = LEVEL_TO_QUAL_TYPE[req.qualification_level]
    // Prefer matching by subject_id first (normalised), fall back to name match
    // so freshly-added subjects the backfill hasn't touched still resolve.
    const studentGrade =
      studentGrades.find(
        (g) =>
          (!qualType || g.qualification_type === qualType) &&
          ((g.subject_id && g.subject_id === req.subject_id) ||
            g.subject.toLowerCase() === req.subject_name.toLowerCase())
      ) ?? null

    if (!studentGrade) {
      missingSubjects.push(req.subject_name)
      continue
    }
    if (!meetsMinGrade(studentGrade.grade, req.min_grade)) {
      belowGradeSubjects.push(req.subject_name)
      continue
    }
    metSubjects.push(req.subject_name)
  }

  // --- Fallback: check entry_requirements.required_subjects (legacy JSONB) ---
  // Only used if the relational table has no rows for this course. Names are
  // compared case-insensitively against both normalised subject names and
  // legacy free-text grades.
  if (requirements.length === 0 && entryReqs?.required_subjects?.length) {
    for (const reqName of entryReqs.required_subjects) {
      const hit = studentGrades.find(
        (g) => g.subject.toLowerCase().trim() === reqName.toLowerCase().trim()
      )
      if (!hit) {
        missingSubjects.push(reqName)
      } else {
        metSubjects.push(reqName)
      }
    }
  }

  // --- Overall grade-string comparison (Highers) ---
  // If a course has no grade requirement at all we treat it as eligible by
  // default (assuming the student has grades at all). Otherwise compare the
  // student's top Highers against the standard and widening offers.
  let overallMeetsStandard: boolean | null = null
  let overallMeetsAdjusted: boolean | null = null
  if (standardRequirement) {
    if (!studentHigherString) {
      overallMeetsStandard = false
      overallMeetsAdjusted = false
    } else {
      overallMeetsStandard = compareGradeStrings(studentHigherString, standardRequirement) >= 0
      overallMeetsAdjusted = adjustedRequirement
        ? compareGradeStrings(studentHigherString, adjustedRequirement) >= 0
        : overallMeetsStandard
    }
  }

  // --- Status assembly ---
  // A WA-adjusted offer only applies if (a) the student is WA-eligible,
  // (b) the course published an adjusted offer, and (c) the student's grades
  // actually clear that adjusted bar.
  const hasWaAdjustedOffer = Boolean(
    isWidening && wideningOffer.offer && wideningOffer.offer !== standardRequirement
  )
  const clearsWaAdjustedOffer = Boolean(hasWaAdjustedOffer && overallMeetsAdjusted)

  let status: EligibilityStatus
  if (missingSubjects.length > 0) {
    status = 'missing_subjects'
  } else if (belowGradeSubjects.length > 0) {
    // Subject-specific grade below min: if the student is WA-eligible, still
    // surface it as possible rather than slamming the door shut.
    status = isWidening ? 'possible' : 'ineligible'
  } else if (overallMeetsStandard === null) {
    // No grade string required at all — treat as eligible as long as there
    // are no missing subjects.
    status = 'eligible'
  } else if (overallMeetsStandard) {
    status = 'eligible'
  } else if (clearsWaAdjustedOffer) {
    // Student doesn't meet the standard offer but DOES clear the adjusted
    // offer for their WA category — this is a firm match, not a near-miss.
    status = 'eligible_via_wa'
  } else {
    // Close call: within ~2 grade positions → 'possible' so students aren't
    // immediately discouraged. Beyond that → 'ineligible'.
    const gap = standardRequirement && studentHigherString
      ? calculateGradeGap(studentHigherString, standardRequirement)
      : 99
    status = gap <= 2 ? 'possible' : 'ineligible'
  }

  return {
    status,
    missingSubjects,
    belowGradeSubjects,
    metSubjects,
    isWideningEligible: isWidening,
    wideningCriteria,
    standardRequirement,
    adjustedRequirement,
    studentHigherString,
    wideningOfferType: wideningOffer.type,
  }
}

function calculateGradeGap(studentGrades: string, requiredGrades: string): number {
  let gap = 0
  for (let i = 0; i < requiredGrades.length; i++) {
    const s = studentGrades[i] ?? 'E'
    const r = requiredGrades[i]
    const sIdx = GRADE_ORDER.indexOf(s)
    const rIdx = GRADE_ORDER.indexOf(r)
    if (sIdx === -1 || rIdx === -1) continue
    if (sIdx > rIdx) gap += sIdx - rIdx
  }
  return gap
}

// -----------------------------------------------------------
// Data hooks
// -----------------------------------------------------------

// Fetch all course_subject_requirements for a set of course IDs, with the
// joined subject name flattened onto the row. Returns an empty array when
// courseIds is empty to avoid wasted round-trips.
function useCourseRequirements(courseIds: string[]) {
  const supabase = getSupabaseClient()
  const key = courseIds.slice().sort().join(',')

  return useQuery<CourseRequirementRow[]>({
    queryKey: ['course-requirements', key],
    enabled: courseIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_subject_requirements')
        .select(
          `
          course_id,
          subject_id,
          qualification_level,
          min_grade,
          is_mandatory,
          subject:subjects(name)
        `
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
      return ((data as unknown as JoinRow[]) || []).map((row) => ({
        course_id: row.course_id,
        subject_id: row.subject_id,
        subject_name: row.subject?.name ?? '',
        qualification_level: row.qualification_level,
        min_grade: row.min_grade,
        is_mandatory: row.is_mandatory ?? true,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Single-course eligibility. Used on /courses/[id].
export function useCourseEligibility(course: Tables<'courses'> | null) {
  const gradeSummary = useGradeSummary()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const { data: studentGrades } = useStudentGrades() as { data: StudentGrade[] | undefined }
  const { data: requirements, isLoading: reqLoading } = useCourseRequirements(
    course?.id ? [course.id] : []
  )

  return useMemo<EligibilityDetail | null>(() => {
    if (!course) return null
    if (reqLoading) return null
    return calculateEligibility(
      course as Course,
      requirements ?? [],
      studentGrades ?? [],
      student ?? null,
      gradeSummary.highers || ''
    )
  }, [course, requirements, reqLoading, studentGrades, student, gradeSummary.highers])
}

// Multi-course matching for /courses listing.
export function useMatchedCourses(filters?: {
  universityId?: string
  subjectArea?: string
  onlyEligible?: boolean
}) {
  const { data: courses, isLoading, error, refetch } = useCourses({
    universityId: filters?.universityId,
    subjectArea: filters?.subjectArea,
    limit: 500,
  }) as {
    data: Course[] | undefined
    isLoading: boolean
    error: Error | null
    refetch: () => void
  }

  const gradeSummary = useGradeSummary()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const { data: studentGrades } = useStudentGrades() as { data: StudentGrade[] | undefined }

  const courseIds = useMemo(() => (courses ?? []).map((c) => c.id), [courses])
  const { data: requirements } = useCourseRequirements(courseIds)

  const coursesWithEligibility = useMemo(() => {
    if (!courses) return []

    // Index requirements by course_id once so the per-course loop is O(1).
    const reqsByCourse = new Map<string, CourseRequirementRow[]>()
    for (const row of requirements ?? []) {
      const existing = reqsByCourse.get(row.course_id) ?? []
      existing.push(row)
      reqsByCourse.set(row.course_id, existing)
    }

    return courses.map((course) => {
      const hasAnyGrades = (studentGrades?.length ?? 0) > 0
      const detail = hasAnyGrades
        ? calculateEligibility(
            course,
            reqsByCourse.get(course.id) ?? [],
            studentGrades ?? [],
            student ?? null,
            gradeSummary.highers || ''
          )
        : null
      return { ...course, eligibility: detail }
    })
  }, [courses, requirements, studentGrades, student, gradeSummary.highers])

  const filtered = filters?.onlyEligible
    ? coursesWithEligibility.filter(
        (c) =>
          c.eligibility?.status === 'eligible' ||
          c.eligibility?.status === 'eligible_via_wa' ||
          c.eligibility?.status === 'possible'
      )
    : coursesWithEligibility

  return {
    data: filtered,
    isLoading,
    error,
    refetch,
    stats: {
      total: coursesWithEligibility.length,
      eligible: coursesWithEligibility.filter((c) => c.eligibility?.status === 'eligible').length,
      eligibleViaWa: coursesWithEligibility.filter((c) => c.eligibility?.status === 'eligible_via_wa').length,
      possible: coursesWithEligibility.filter((c) => c.eligibility?.status === 'possible').length,
      missingSubjects: coursesWithEligibility.filter((c) => c.eligibility?.status === 'missing_subjects').length,
      ineligible: coursesWithEligibility.filter((c) => c.eligibility?.status === 'ineligible').length,
    },
  }
}

// Grade gap detail for /courses/[id] — shows what the student would need to
// add to meet the standard offer.
export function useGradeGap(course: Tables<'courses'> | null) {
  const gradeSummary = useGradeSummary()

  return useMemo(() => {
    if (!course) return null

    const entryReqs = course.entry_requirements as EntryRequirements | null
    if (!entryReqs?.highers) return null

    const required = entryReqs.highers
    const current = gradeSummary.highers || ''

    const gaps: { position: number; needed: string; have: string }[] = []

    for (let i = 0; i < required.length; i++) {
      const requiredGrade = required[i]
      const currentGrade = current[i] || 'None'

      const reqIdx = GRADE_ORDER.indexOf(requiredGrade)
      const curIdx = currentGrade === 'None' ? 99 : GRADE_ORDER.indexOf(currentGrade)

      if (curIdx > reqIdx) {
        gaps.push({
          position: i + 1,
          needed: requiredGrade,
          have: currentGrade === 'None' ? 'Missing' : currentGrade,
        })
      }
    }

    return {
      required,
      current,
      gaps,
      totalGap: gaps.length,
      isEligible: gaps.length === 0,
    }
  }, [course, gradeSummary.highers])
}
