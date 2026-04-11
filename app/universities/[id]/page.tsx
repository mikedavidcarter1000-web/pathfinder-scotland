'use client'

import { use } from 'react'
import Link from 'next/link'
import { useUniversity, useUniversityCourses } from '@/hooks/use-universities'
import { CourseCard } from '@/components/ui/course-card'
import { CourseCardSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'
import { UNIVERSITY_TYPES } from '@/lib/constants'
import type { Tables } from '@/types/database'

type University = Tables<'universities'>
type Course = Tables<'courses'>

export default function UniversityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: university, isLoading, error, refetch } = useUniversity(id) as {
    data: University | null | undefined
    isLoading: boolean
    error: Error | null
    refetch: () => void
  }
  const { data: courses, isLoading: coursesLoading } = useUniversityCourses(id) as { data: Course[] | undefined; isLoading: boolean }

  useAuthErrorRedirect([error])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--pf-blue-50)]">
        <div className="bg-[var(--pf-white)]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Skeleton width="140px" height={14} rounded="sm" />
            <div style={{ height: '16px' }} />
            <div className="flex items-start gap-4">
              <Skeleton variant="avatar" width={64} height={64} rounded="lg" />
              <div className="flex-1">
                <Skeleton width="60%" height={32} rounded="md" />
                <div style={{ height: '8px' }} />
                <Skeleton width="40%" height={18} rounded="sm" />
              </div>
            </div>
            <div style={{ height: '16px' }} />
            <div className="flex gap-2">
              <Skeleton width={80} height={22} rounded="full" />
              <Skeleton width={100} height={22} rounded="full" />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton variant="card" />
              <Skeleton variant="card" />
            </div>
            <div className="space-y-6">
              <Skeleton variant="card" />
              <Skeleton variant="card" />
            </div>
          </div>
          <SlowLoadingNotice isLoading={isLoading} />
        </div>
      </div>
    )
  }

  if (error || !university) {
    const classified = error ? classifyError(error) : null
    const isNotFound = !error || classified?.kind === 'not-found'
    return (
      <div className="min-h-screen bg-[var(--pf-blue-50)]" style={{ padding: '48px 16px' }}>
        <div className="max-w-4xl mx-auto px-4">
          <ErrorState
            title={isNotFound ? 'University not found' : classified?.title ?? 'Something went wrong'}
            message={
              isNotFound
                ? "The university you're looking for doesn't exist or has been removed."
                : classified?.message ?? 'Please try again in a moment.'
            }
            retryAction={isNotFound ? undefined : () => refetch()}
            backLink={{ href: '/universities', label: 'Browse all universities' }}
          />
        </div>
      </div>
    )
  }

  const typeInfo = university.type
    ? UNIVERSITY_TYPES[university.type as keyof typeof UNIVERSITY_TYPES]
    : null

  const typeColors: Record<string, string> = {
    ancient: 'bg-[var(--pf-blue-100)] text-[var(--pf-blue-700)]',
    traditional: 'bg-blue-100 text-blue-700',
    modern: 'bg-green-100 text-green-700',
    specialist: 'bg-orange-100 text-orange-700',
  }

  const wideningAccessInfo = university.widening_access_info as {
    programs?: string[]
    eligibility_criteria?: string[]
  } | null

  return (
    <div className="min-h-screen bg-[var(--pf-blue-50)]">
      {/* Header */}
      <div className="bg-[var(--pf-white)]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/universities" className="hover:text-gray-700">Universities</Link>
            <span>/</span>
            <span className="text-gray-900">{university.name}</span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Logo Placeholder */}
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-gray-400">{university.name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{university.name}</h1>
                {university.city && (
                  <p className="text-lg text-gray-600 flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {university.city}
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/universities"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {typeInfo && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeColors[university.type!] || 'bg-[var(--pf-grey-100)] text-[var(--pf-grey-900)]'}`}>
                {typeInfo.label}
              </span>
            )}
            {university.russell_group && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[rgba(245,158,11,0.12)] text-[var(--pf-amber-500)]">
                Russell Group
              </span>
            )}
            {university.founded_year && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--pf-grey-100)] text-[var(--pf-grey-900)]">
                Est. {university.founded_year}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {university.description && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">{university.description}</p>
              </section>
            )}

            {/* Widening Access */}
            {wideningAccessInfo && (wideningAccessInfo.programs || wideningAccessInfo.eligibility_criteria) && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Widening Access</h2>
                <div className="bg-[var(--pf-blue-50)] border border-[var(--pf-blue-100)] rounded-xl p-6">
                  {wideningAccessInfo.programs && wideningAccessInfo.programs.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium text-[var(--pf-blue-900)] mb-2">Access Programmes</h3>
                      <div className="flex flex-wrap gap-2">
                        {wideningAccessInfo.programs.map((program) => (
                          <span key={program} className="px-3 py-1 bg-[var(--pf-blue-100)] text-[var(--pf-blue-700)] text-sm rounded-full">
                            {program}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {wideningAccessInfo.eligibility_criteria && wideningAccessInfo.eligibility_criteria.length > 0 && (
                    <div>
                      <h3 className="font-medium text-[var(--pf-blue-900)] mb-2">Eligibility Criteria</h3>
                      <ul className="space-y-1">
                        {wideningAccessInfo.eligibility_criteria.map((criteria) => (
                          <li key={criteria} className="text-[var(--pf-blue-700)] text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Courses */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Courses {courses && `(${courses.length})`}
                </h2>
              </div>

              {coursesLoading ? (
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : courses && courses.length > 0 ? (
                <div className="grid gap-4">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={{ ...course, university: university }}
                      compact
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={EmptyStateIcons.book}
                  title="No courses listed yet"
                  message="We don't have any courses on file for this university yet. Check back soon."
                  actionLabel="Browse all courses"
                  actionHref="/courses"
                  tone="subtle"
                />
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="pf-card">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {university.website && (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pf-btn-primary w-full"
                  >
                    Visit Website
                  </a>
                )}
                <Link
                  href={`/courses?universityId=${university.id}`}
                  className="pf-btn-secondary w-full"
                >
                  Browse All Courses
                </Link>
              </div>
            </div>

            {/* Key Facts */}
            <div className="pf-card">
              <h3 className="font-semibold text-gray-900 mb-4">Key Facts</h3>
              <dl className="space-y-3">
                {university.founded_year && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Founded</dt>
                    <dd className="font-medium text-gray-900">{university.founded_year}</dd>
                  </div>
                )}
                {university.city && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Location</dt>
                    <dd className="font-medium text-gray-900">{university.city}</dd>
                  </div>
                )}
                {typeInfo && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium text-gray-900">{typeInfo.label}</dd>
                  </div>
                )}
                {university.russell_group && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Russell Group</dt>
                    <dd className="font-medium text-gray-900">Yes</dd>
                  </div>
                )}
                {courses && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Courses</dt>
                    <dd className="font-medium text-gray-900">{courses.length}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
