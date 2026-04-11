'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useComparisonWithCourses } from '@/hooks/use-comparison'
import { useCurrentStudent, useStudentGrades, useGradeSummary } from '@/hooks/use-student'
import { ComparisonTable } from '@/components/ui/comparison-table'
import { calculateEligibility, type EligibilityDetail } from '@/hooks/use-course-matching'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type StudentGrade = Tables<'student_grades'>
type CourseWithUni = Tables<'courses'> & { university?: Tables<'universities'> }

// Fetch course_subject_requirements for the comparison set only, so the same
// relational eligibility logic used on /courses applies here too.
function useRequirementsForCourses(courseIds: string[]) {
  const supabase = getSupabaseClient()
  const key = courseIds.slice().sort().join(',')
  return useQuery({
    queryKey: ['compare-requirements', key],
    enabled: courseIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_subject_requirements')
        .select(
          `course_id, subject_id, qualification_level, min_grade, is_mandatory, subject:subjects(name)`
        )
        .in('course_id', courseIds)
      if (error) throw error
      type Row = {
        course_id: string
        subject_id: string
        qualification_level: string
        min_grade: string | null
        is_mandatory: boolean | null
        subject: { name: string } | null
      }
      return ((data as unknown as Row[]) || []).map((r) => ({
        course_id: r.course_id,
        subject_id: r.subject_id,
        subject_name: r.subject?.name ?? '',
        qualification_level: r.qualification_level,
        min_grade: r.min_grade,
        is_mandatory: r.is_mandatory ?? true,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}

export default function ComparePage() {
  const { courses, removeCourse, clearAll, isLoading, count, maxCourses } =
    useComparisonWithCourses()
  const gradeSummary = useGradeSummary()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const { data: studentGrades } = useStudentGrades() as { data: StudentGrade[] | undefined }

  const courseIds = useMemo(() => (courses as CourseWithUni[]).map((c) => c.id), [courses])
  const { data: requirements } = useRequirementsForCourses(courseIds)

  const coursesWithEligibility = useMemo<
    (CourseWithUni & { eligibility: EligibilityDetail | null })[]
  >(() => {
    const reqsByCourse = new Map<string, typeof requirements>()
    for (const row of requirements ?? []) {
      const existing = reqsByCourse.get(row.course_id) ?? []
      existing!.push(row)
      reqsByCourse.set(row.course_id, existing)
    }

    return (courses as CourseWithUni[]).map((course) => {
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
