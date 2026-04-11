'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useSavedCourses, useToggleSaveCourse } from '@/hooks/use-courses'
import { useGradeSummary, useCurrentStudent, useStudentGrades } from '@/hooks/use-student'
import { CourseCard } from '@/components/ui/course-card'
import { CourseCardSkeleton } from '@/components/ui/loading-skeletons'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'
import { calculateEligibility, type EligibilityDetail } from '@/hooks/use-course-matching'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type StudentGrade = Tables<'student_grades'>
type Course = Tables<'courses'> & { university?: Tables<'universities'> }
type SavedCourse = Tables<'saved_courses'> & { course?: Course }

export default function SavedCoursesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const {
    data: savedCourses,
    isLoading,
    error,
    refetch,
  } = useSavedCourses() as {
    data: SavedCourse[] | undefined
    isLoading: boolean
    error: Error | null
    refetch: () => void
  }
  const { toggle: toggleSave, isSaved } = useToggleSaveCourse()
  const gradeSummary = useGradeSummary()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const { data: studentGrades } = useStudentGrades() as { data: StudentGrade[] | undefined }

  useAuthErrorRedirect([error])

  const items = useMemo(() => (savedCourses || []).filter((sc) => !!sc.course), [savedCourses])
  const courseIds = useMemo(() => items.map((sc) => sc.course!.id), [items])

  // Share the same relational requirement logic as the /courses page so saved
  // cards show identical eligibility status (no drift between views).
  const supabase = getSupabaseClient()
  const reqKey = courseIds.slice().sort().join(',')
  const { data: requirements } = useQuery({
    queryKey: ['saved-requirements', reqKey],
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in?redirect=/saved')
    }
  }, [authLoading, user, router])

  if (authLoading || !user) return null

  const reqsByCourse = new Map<string, typeof requirements>()
  for (const row of requirements ?? []) {
    const existing = reqsByCourse.get(row.course_id) ?? []
    existing!.push(row)
    reqsByCourse.set(row.course_id, existing)
  }

  const getEligibility = (course: Course): EligibilityDetail | null => {
    if (!studentGrades || studentGrades.length === 0) return null
    return calculateEligibility(
      course,
      reqsByCourse.get(course.id) ?? [],
      studentGrades,
      student ?? null,
      gradeSummary.highers || ''
    )
  }

  return (
    <div className="pf-container pt-8 sm:pt-10 pb-12 sm:pb-16">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1
            className="font-bold"
            style={{ color: 'var(--pf-grey-900)', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
          >
            Saved Courses
          </h1>
          <p style={{ color: 'var(--pf-grey-600)', marginTop: '4px', fontSize: '0.9375rem' }}>
            {items.length > 0
              ? `You have ${items.length} course${items.length === 1 ? '' : 's'} saved (UCAS allows up to 5 choices).`
              : 'Save courses as you browse to build your shortlist.'}
          </p>
        </div>
        <Link
          href="/courses"
          className="pf-btn-secondary pf-btn-sm self-start sm:shrink-0 justify-center"
        >
          Browse courses
        </Link>
      </div>

      {isLoading && (
        <>
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
          <SlowLoadingNotice isLoading={isLoading} />
        </>
      )}

      {!isLoading && error && (
        <ErrorState
          title={classifyError(error).title}
          message={classifyError(error).message}
          retryAction={() => refetch()}
          backLink={{ href: '/courses', label: 'Browse courses' }}
        />
      )}

      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          icon={EmptyStateIcons.bookmark}
          title="No saved courses yet"
          message="Browse courses and save the ones you're interested in to build your shortlist."
          actionLabel="Browse courses"
          actionHref="/courses"
        />
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((sc) => {
            const course = sc.course!
            return (
              <CourseCard
                key={sc.id}
                course={course}
                eligibility={getEligibility(course)}
                showSaveButton
                isSaved={isSaved(course.id)}
                onSave={() => toggleSave(course.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
