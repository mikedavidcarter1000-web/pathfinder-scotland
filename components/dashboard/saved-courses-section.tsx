'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useSavedCourses, useRemoveSavedCourse } from '@/hooks/use-courses'
import { useGradeSummary, useCurrentStudent, useStudentGrades } from '@/hooks/use-student'
import { EligibilityBadge } from '@/components/ui/eligibility-badge'
import { calculateEligibility, type EligibilityDetail } from '@/hooks/use-course-matching'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type StudentGrade = Tables<'student_grades'>
type Course = Tables<'courses'> & { university?: Tables<'universities'> }
type SavedCourse = Tables<'saved_courses'> & { course?: Course }

export function SavedCoursesSection() {
  const { data: savedCourses, isLoading } = useSavedCourses() as { data: SavedCourse[] | undefined; isLoading: boolean }
  const gradeSummary = useGradeSummary()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const { data: studentGrades } = useStudentGrades() as { data: StudentGrade[] | undefined }
  const removeCourse = useRemoveSavedCourse()

  // Same relational requirement lookup used on /courses, scoped to the saved set.
  const supabase = getSupabaseClient()
  const courseIds = useMemo(
    () => (savedCourses ?? []).map((sc) => sc.course?.id).filter((id): id is string => !!id),
    [savedCourses]
  )
  const reqKey = courseIds.slice().sort().join(',')
  const { data: requirements } = useQuery({
    queryKey: ['saved-section-requirements', reqKey],
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

  if (isLoading) {
    return (
      <div className="pf-card">
        <div className="animate-pulse">
          <div className="h-6 w-32 rounded mb-4" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

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

  const handleRemove = async (courseId: string) => {
    await removeCourse.mutateAsync(courseId)
  }

  return (
    <div className="pf-card">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Saved Courses</h2>
        <Link
          href="/courses"
          style={{
            fontSize: '0.875rem',
            color: 'var(--pf-teal-700)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}
        >
          Browse courses
        </Link>
      </div>

      {!savedCourses || savedCourses.length === 0 ? (
        <div
          className="text-center rounded-lg"
          style={{
            padding: '32px 16px',
            backgroundColor: 'var(--pf-teal-50)',
            border: '1px dashed var(--pf-teal-500)',
          }}
        >
          <svg
            className="w-8 h-8 mx-auto mb-2"
            style={{ color: 'var(--pf-teal-500)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
            No courses saved yet
          </p>
          <Link
            href="/courses"
            className="mt-2 inline-block"
            style={{
              fontSize: '0.875rem',
              color: 'var(--pf-teal-700)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
            }}
          >
            Start exploring courses
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedCourses.slice(0, 5).map((savedCourse) => {
            const course = savedCourse.course
            if (!course) return null

            const eligibility = getEligibility(course)
            const entryReqs = course.entry_requirements as { highers?: string } | null

            return (
              <div
                key={savedCourse.id}
                className="group flex items-center gap-4 rounded-lg transition-colors"
                style={{ padding: '12px', backgroundColor: 'var(--pf-teal-50)' }}
              >
                <Link href={`/courses/${course.id}`} className="flex-1 min-w-0 no-underline hover:no-underline">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3
                        className="truncate"
                        style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', margin: 0 }}
                      >
                        {course.name}
                      </h3>
                      <p
                        className="truncate"
                        style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}
                      >
                        {course.university?.name}
                      </p>
                    </div>
                    {eligibility && (
                      <EligibilityBadge
                        status={eligibility.status}
                        size="sm"
                        missingSubjects={eligibility.missingSubjects}
                      />
                    )}
                  </div>
                  {entryReqs?.highers && (
                    <p
                      className="mt-1"
                      style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}
                    >
                      Requires: {entryReqs.highers}
                    </p>
                  )}
                </Link>
                <button
                  onClick={() => handleRemove(course.id)}
                  disabled={removeCourse.isPending}
                  className="flex-shrink-0 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
                  style={{ color: 'var(--pf-grey-600)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--pf-red-500)'
                    e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--pf-grey-600)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}

          {savedCourses.length > 5 && (
            <Link
              href="/courses"
              className="block text-center py-2"
              style={{
                fontSize: '0.875rem',
                color: 'var(--pf-teal-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              View all {savedCourses.length} saved courses
            </Link>
          )}
        </div>
      )}

      {/* UCAS Reminder */}
      {savedCourses && savedCourses.length > 0 && savedCourses.length < 5 && (
        <div
          className="mt-4 rounded-lg"
          style={{
            padding: '12px',
            backgroundColor: 'var(--pf-teal-100)',
          }}
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--pf-teal-700)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {5 - savedCourses.length} more {savedCourses.length === 4 ? 'spot' : 'spots'} available
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--pf-teal-900)', marginTop: '4px' }}>
            UCAS allows up to 5 course choices on your application.
          </p>
        </div>
      )}
    </div>
  )
}
