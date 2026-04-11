'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useSavedCourses, useToggleSaveCourse } from '@/hooks/use-courses'
import { useGradeSummary, useCurrentStudent, useStudentGrades } from '@/hooks/use-student'
import { CourseCard } from '@/components/ui/course-card'
import { CourseCardSkeleton } from '@/components/ui/loading-skeletons'
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
  const { data: savedCourses, isLoading } = useSavedCourses() as {
    data: SavedCourse[] | undefined
    isLoading: boolean
  }
  const { toggle: toggleSave, isSaved } = useToggleSaveCourse()
  const gradeSummary = useGradeSummary()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const { data: studentGrades } = useStudentGrades() as { data: StudentGrade[] | undefined }

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved Courses</h1>
          <p className="text-gray-600 mt-1">
            {items.length > 0
              ? `You have ${items.length} course${items.length === 1 ? '' : 's'} saved (UCAS allows up to 5 choices).`
              : 'Save courses as you browse to build your shortlist.'}
          </p>
        </div>
        <Link
          href="/courses"
          className="shrink-0 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          Browse courses
        </Link>
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No saved courses yet</h2>
          <p className="text-gray-600 mb-4">
            Tap the heart on any course to add it to your shortlist.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Browse courses
          </Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
