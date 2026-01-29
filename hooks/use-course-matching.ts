import { useMemo } from 'react'
import { useStudentGrades, useCurrentStudent, useGradeSummary } from './use-student'
import { useCourses } from './use-courses'
import { meetsRequirements, adjustGradesForWidening } from '@/lib/grades'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
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

// Check eligibility for a single course
export function useCourseEligibility(course: Tables<'courses'> | null) {
  const gradeSummary = useGradeSummary()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }

  return useMemo(() => {
    if (!course) return null

    const entryReqs = course.entry_requirements as EntryRequirements | null
    const wideningReqs = course.widening_access_requirements as WideningAccessRequirements | null

    if (!entryReqs?.highers) {
      return { status: 'eligible' as const, reason: 'No specific requirements' }
    }

    const studentGrades = gradeSummary.highers || ''
    const requiredGrades = entryReqs.highers

    // Check if student qualifies for widening access
    const isWideningEligible =
      student?.simd_decile && student.simd_decile <= 4 ||
      student?.care_experienced ||
      student?.is_carer ||
      student?.first_generation

    // Get the appropriate requirement based on widening access status
    let adjustedRequirement = requiredGrades

    if (isWideningEligible && wideningReqs) {
      if (student?.simd_decile && student.simd_decile <= 2 && wideningReqs.simd20_offer) {
        adjustedRequirement = wideningReqs.simd20_offer
      } else if (student?.simd_decile && student.simd_decile <= 4 && wideningReqs.simd40_offer) {
        adjustedRequirement = wideningReqs.simd40_offer
      } else if (student?.care_experienced && wideningReqs.care_experienced_offer) {
        adjustedRequirement = wideningReqs.care_experienced_offer
      } else if (wideningReqs.general_offer) {
        adjustedRequirement = wideningReqs.general_offer
      }
    }

    const status = meetsRequirements(studentGrades, adjustedRequirement, false)

    const reasons = {
      eligible: isWideningEligible
        ? `Meets widening access requirements (${adjustedRequirement})`
        : `Meets standard requirements (${requiredGrades})`,
      possible: `Close to meeting requirements (need ${adjustedRequirement}, have ${studentGrades || 'no grades'})`,
      below: `Below requirements (need ${adjustedRequirement}, have ${studentGrades || 'no grades'})`,
    }

    return {
      status,
      reason: reasons[status],
      standardRequirement: requiredGrades,
      adjustedRequirement,
      studentGrades,
      isWideningEligible,
    }
  }, [course, gradeSummary.highers, student])
}

// Get all courses with eligibility status
export function useMatchedCourses(filters?: {
  universityId?: string
  subjectArea?: string
  onlyEligible?: boolean
}) {
  const { data: courses, isLoading, error } = useCourses(filters) as { data: Course[] | undefined; isLoading: boolean; error: Error | null }
  const gradeSummary = useGradeSummary()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }

  const coursesWithEligibility = useMemo(() => {
    if (!courses) return []

    return courses.map((course) => {
      const entryReqs = course.entry_requirements as EntryRequirements | null
      const wideningReqs = course.widening_access_requirements as WideningAccessRequirements | null

      let eligibility: 'eligible' | 'possible' | 'below' | null = null

      if (entryReqs?.highers && gradeSummary.highers) {
        const isWideningEligible =
          (student?.simd_decile && student.simd_decile <= 4) ||
          student?.care_experienced ||
          student?.is_carer ||
          student?.first_generation

        let adjustedRequirement = entryReqs.highers

        if (isWideningEligible && wideningReqs) {
          if (student?.simd_decile && student.simd_decile <= 2 && wideningReqs.simd20_offer) {
            adjustedRequirement = wideningReqs.simd20_offer
          } else if (student?.simd_decile && student.simd_decile <= 4 && wideningReqs.simd40_offer) {
            adjustedRequirement = wideningReqs.simd40_offer
          } else if (wideningReqs.general_offer) {
            adjustedRequirement = wideningReqs.general_offer
          }
        }

        eligibility = meetsRequirements(gradeSummary.highers, adjustedRequirement, false)
      }

      return { ...course, eligibility }
    })
  }, [courses, gradeSummary.highers, student])

  // Filter to only eligible if requested
  const filtered = filters?.onlyEligible
    ? coursesWithEligibility.filter((c) => c.eligibility === 'eligible' || c.eligibility === 'possible')
    : coursesWithEligibility

  return {
    data: filtered,
    isLoading,
    error,
    stats: {
      total: coursesWithEligibility.length,
      eligible: coursesWithEligibility.filter((c) => c.eligibility === 'eligible').length,
      possible: coursesWithEligibility.filter((c) => c.eligibility === 'possible').length,
      below: coursesWithEligibility.filter((c) => c.eligibility === 'below').length,
    },
  }
}

// Calculate what grades are needed for a specific course
export function useGradeGap(course: Tables<'courses'> | null) {
  const gradeSummary = useGradeSummary()

  return useMemo(() => {
    if (!course) return null

    const entryReqs = course.entry_requirements as EntryRequirements | null
    if (!entryReqs?.highers) return null

    const required = entryReqs.highers
    const current = gradeSummary.highers || ''

    const gradeOrder = ['A', 'B', 'C', 'D', 'E']
    const gaps: { position: number; needed: string; have: string }[] = []

    for (let i = 0; i < required.length; i++) {
      const requiredGrade = required[i]
      const currentGrade = current[i] || 'None'

      const reqIdx = gradeOrder.indexOf(requiredGrade)
      const curIdx = currentGrade === 'None' ? 99 : gradeOrder.indexOf(currentGrade)

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
