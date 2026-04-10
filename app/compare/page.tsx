'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useComparisonWithCourses } from '@/hooks/use-comparison'
import { useGradeSummary, useCurrentStudent } from '@/hooks/use-student'
import { ComparisonTable } from '@/components/ui/comparison-table'
import { meetsRequirements } from '@/lib/grades'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type CourseWithUni = Tables<'courses'> & { university?: Tables<'universities'> }
type EligibilityStatus = 'eligible' | 'possible' | 'below'

export default function ComparePage() {
  const { courses, removeCourse, clearAll, isLoading, count, maxCourses } =
    useComparisonWithCourses()
  const gradeSummary = useGradeSummary()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }

  const coursesWithEligibility = useMemo(() => {
    return (courses as CourseWithUni[]).map((course) => {
      const reqs = course.entry_requirements as { highers?: string } | null
      const wideningReqs = course.widening_access_requirements as {
        simd20_offer?: string
        simd40_offer?: string
        general_offer?: string
      } | null

      let eligibility: EligibilityStatus | null = null
      if (reqs?.highers && gradeSummary.highers) {
        const isWideningEligible =
          (student?.simd_decile && student.simd_decile <= 4) ||
          student?.care_experienced ||
          student?.is_carer ||
          student?.first_generation

        let adjustedRequirement = reqs.highers
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compare Courses</h1>
          <p className="text-gray-600 mt-1">
            {count > 0
              ? `Comparing ${count} of ${maxCourses} courses side by side.`
              : `Add up to ${maxCourses} courses to compare them side by side.`}
          </p>
        </div>
        {count > 0 && (
          <button
            onClick={clearAll}
            className="shrink-0 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {isLoading && count > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          Loading comparison...
        </div>
      )}

      {!isLoading && count === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Nothing to compare yet</h2>
          <p className="text-gray-600 mb-4">
            Browse courses and use the compare button to add up to {maxCourses} side by side.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Browse courses
          </Link>
        </div>
      )}

      {!isLoading && count > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <ComparisonTable courses={coursesWithEligibility} onRemove={removeCourse} />
        </div>
      )}
    </div>
  )
}
