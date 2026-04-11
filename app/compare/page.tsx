'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useComparisonWithCourses } from '@/hooks/use-comparison'
import { useCurrentStudent, useStudentGrades, useGradeSummary } from '@/hooks/use-student'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { calculateEligibility, type EligibilityDetail } from '@/hooks/use-course-matching'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { Tables } from '@/types/database'

const ComparisonTable = dynamic(
  () => import('@/components/ui/comparison-table').then((m) => ({ default: m.ComparisonTable })),
  {
    ssr: false,
    loading: () => (
      <div className="p-6">
        <Skeleton variant="table" rows={6} columns={3} />
      </div>
    ),
  }
)

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
    <div className="pf-container pt-8 sm:pt-10 pb-12 sm:pb-16">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1
            className="font-bold"
            style={{ color: 'var(--pf-grey-900)', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
          >
            Compare Courses
          </h1>
          <p style={{ color: 'var(--pf-grey-600)', marginTop: '4px', fontSize: '0.9375rem' }}>
            {count > 0
              ? `Comparing ${count} of ${maxCourses} courses side by side.`
              : `Add up to ${maxCourses} courses to compare them side by side.`}
          </p>
        </div>
        {count > 0 && (
          <button onClick={clearAll} className="pf-btn-secondary pf-btn-sm self-start sm:shrink-0 justify-center">
            Clear all
          </button>
        )}
      </div>

      {isLoading && count > 0 && (
        <div className="pf-card">
          <Skeleton variant="table" rows={6} columns={count} />
        </div>
      )}

      {!isLoading && count === 0 && (
        <div className="pf-card">
          <EmptyState
            icon={EmptyStateIcons.columns}
            title="Nothing to compare yet"
            message={`Save at least 2 courses, then come back to compare them side by side.`}
            actionLabel="Browse courses"
            actionHref="/courses"
          />
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
