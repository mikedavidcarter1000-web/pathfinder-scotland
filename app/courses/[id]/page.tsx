'use client'

import { use } from 'react'
import Link from 'next/link'
import { useCourse } from '@/hooks/use-courses'
import { useAuth } from '@/hooks/use-auth'
import { useCourseEligibility } from '@/hooks/use-course-matching'
import { useGradeSummary, useWideningAccessEligibility, useCurrentStudent } from '@/hooks/use-student'
import { DEGREE_TYPES } from '@/lib/constants'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'
import { OfferTracker } from '@/components/ui/offer-tracker'
import type { Tables } from '@/types/database'

type Course = Tables<'courses'> & { university?: Tables<'universities'> }
type Student = Tables<'students'>

interface WideningAccessRequirements {
  simd20_offer?: string
  simd40_offer?: string
  care_experienced_offer?: string
  general_offer?: string
}

interface UniversityWideningInfo {
  programme_name?: string
  url?: string
  description?: string
}

interface UniversityWaDetails {
  name: string | null
  waProgrammeName: string | null
  waProgrammeUrl: string | null
  waPreEntryRequired: boolean
  waPreEntryDetails: string | null
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: course, isLoading, error, refetch } = useCourse(id) as {
    data: Course | null | undefined
    isLoading: boolean
    error: Error | null
    refetch: () => void
  }
  const { user } = useAuth()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const eligibility = useCourseEligibility(course ?? null)
  const gradeSummary = useGradeSummary()
  const wideningAccess = useWideningAccessEligibility()
  const hasGrades = gradeSummary.totalGrades > 0

  useAuthErrorRedirect([error])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--pf-blue-50)]">
        <div className="bg-[var(--pf-white)]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Skeleton width="120px" height={14} rounded="sm" />
            <div style={{ height: '16px' }} />
            <Skeleton width="65%" height={32} rounded="md" />
            <div style={{ height: '10px' }} />
            <Skeleton width="40%" height={18} rounded="sm" />
            <div style={{ height: '16px' }} />
            <div className="flex gap-2">
              <Skeleton width={80} height={22} rounded="full" />
              <Skeleton width={60} height={22} rounded="full" />
              <Skeleton width={100} height={22} rounded="full" />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="pf-card">
                <Skeleton width="40%" height={22} rounded="md" />
                <div style={{ height: '16px' }} />
                <Skeleton variant="table" rows={4} columns={2} />
              </div>
              <div className="pf-card">
                <Skeleton width="50%" height={22} rounded="md" />
                <div style={{ height: '16px' }} />
                <Skeleton variant="text" lines={3} />
              </div>
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

  if (error || !course) {
    const classified = error ? classifyError(error) : null
    const isNotFound = !error || classified?.kind === 'not-found'
    return (
      <div className="min-h-screen bg-[var(--pf-blue-50)]" style={{ padding: '48px 16px' }}>
        <div className="max-w-4xl mx-auto px-4">
          <ErrorState
            title={isNotFound ? 'Course not found' : classified?.title ?? 'Something went wrong'}
            message={
              isNotFound
                ? "The course you're looking for doesn't exist or has been removed."
                : classified?.message ?? 'Please try again in a moment.'
            }
            retryAction={isNotFound ? undefined : () => refetch()}
            backLink={{ href: '/courses', label: 'Browse all courses' }}
          />
        </div>
      </div>
    )
  }

  const university = course.university as
    | (Tables<'universities'> & {
        widening_access_info?: UniversityWideningInfo | null
      })
    | null
  const uniWaDetails: UniversityWaDetails = {
    name: university?.name ?? null,
    waProgrammeName: university?.wa_programme_name ?? null,
    waProgrammeUrl: university?.wa_programme_url ?? null,
    waPreEntryRequired: Boolean(university?.wa_pre_entry_required),
    waPreEntryDetails: university?.wa_pre_entry_details ?? null,
  }

  const entryRequirements = course.entry_requirements as {
    highers?: string
    advanced_highers?: string
    ucas_points?: number
    required_subjects?: string[]
  } | null

  const wideningReqs = course.widening_access_requirements as WideningAccessRequirements | null
  const uniWideningInfo = university?.widening_access_info ?? null

  const hasAnyWaOffers = Boolean(
    wideningReqs &&
      (wideningReqs.simd20_offer ||
        wideningReqs.simd40_offer ||
        wideningReqs.care_experienced_offer ||
        wideningReqs.general_offer)
  )

  const degreeInfo = course.degree_type
    ? DEGREE_TYPES[course.degree_type as keyof typeof DEGREE_TYPES]
    : null

  return (
    <div className="min-h-screen bg-[var(--pf-blue-50)]">
      {/* Header */}
      <div className="bg-[var(--pf-white)]">
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-6 sm:pt-8 sm:pb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3 sm:mb-4 overflow-hidden">
            <Link href="/courses" className="hover:text-gray-700 flex-shrink-0">Courses</Link>
            <span className="flex-shrink-0">/</span>
            {university && (
              <>
                <Link
                  href={`/universities/${university.id}`}
                  className="hover:text-gray-700 truncate"
                >
                  {university.name}
                </Link>
                <span className="flex-shrink-0">/</span>
              </>
            )}
            <span className="text-gray-900 truncate">{course.name}</span>
          </nav>

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1
                className="font-bold text-gray-900 mb-2"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 1.875rem)' }}
              >
                {course.name}
              </h1>
              {university && (
                <p className="text-base sm:text-lg text-gray-600">
                  <Link href={`/universities/${university.id}`} className="hover:text-[var(--pf-blue-700)]">
                    {university.name}
                  </Link>
                  {university.city && ` - ${university.city}`}
                </p>
              )}
            </div>
            <Link
              href="/courses"
              className="text-gray-500 hover:text-gray-700 flex items-center justify-center flex-shrink-0"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label="Back to courses"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {degreeInfo && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--pf-blue-100)] text-[var(--pf-blue-700)]">
                {degreeInfo.label}
              </span>
            )}
            {course.subject_area && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--pf-blue-100)] text-[var(--pf-blue-700)]">
                {course.subject_area}
              </span>
            )}
            {course.ucas_code && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--pf-grey-100)] text-[var(--pf-grey-900)]">
                UCAS: {course.ucas_code}
              </span>
            )}
            {course.duration_years && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--pf-grey-100)] text-[var(--pf-grey-900)]">
                {course.duration_years} years
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Description */}
            {course.description && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this course</h2>
                <p className="text-gray-600 leading-relaxed">{course.description}</p>
              </section>
            )}

            {/* Personalised Eligibility (logged-in students only) */}
            {user && hasGrades && eligibility && (
              <PersonalisedEligibility detail={eligibility} uniWaDetails={uniWaDetails} />
            )}

            {user && !hasGrades && (
              <section>
                <div
                  className="rounded-lg"
                  style={{
                    padding: '16px',
                    backgroundColor: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.25)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: 'var(--pf-amber-500)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', fontWeight: 600 }}>
                        Add your grades to see if you&apos;re eligible
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                        We&apos;ll personalise this page to show exactly how you stack up.
                      </p>
                    </div>
                    <Link href="/dashboard" className="pf-btn-secondary pf-btn-sm">
                      Add grades
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Entry Requirements */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Entry Requirements</h2>
              <div className="pf-card-flat overflow-hidden">
                {entryRequirements ? (
                  <div className="divide-y divide-gray-100">
                    {entryRequirements.highers && (
                      <div className="flex justify-between items-center gap-3 p-4">
                        <span className="text-gray-600 flex-shrink-0">Highers</span>
                        <span className="font-semibold text-gray-900 text-right">{entryRequirements.highers}</span>
                      </div>
                    )}
                    {entryRequirements.advanced_highers && (
                      <div className="flex justify-between items-center gap-3 p-4">
                        <span className="text-gray-600 flex-shrink-0">Advanced Highers</span>
                        <span className="font-semibold text-gray-900 text-right">{entryRequirements.advanced_highers}</span>
                      </div>
                    )}
                    {entryRequirements.ucas_points && (
                      <div className="flex justify-between items-center gap-3 p-4">
                        <span className="text-gray-600 flex-shrink-0">UCAS Points</span>
                        <span className="font-semibold text-gray-900 text-right">{entryRequirements.ucas_points}</span>
                      </div>
                    )}
                    {entryRequirements.required_subjects && entryRequirements.required_subjects.length > 0 && (
                      <div className="p-4">
                        <span className="text-gray-600 block mb-2">Required Subjects</span>
                        <div className="flex flex-wrap gap-2">
                          {entryRequirements.required_subjects.map((subject) => (
                            <span key={subject} className="px-2 py-1 bg-[var(--pf-grey-100)] text-[var(--pf-grey-900)] text-sm rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="p-4 text-gray-500">Entry requirements not available. Check the university website for details.</p>
                )}
              </div>
            </section>

            {/* Widening Access Section */}
            <WideningAccessSection
              student={student ?? null}
              wideningAccess={wideningAccess}
              wideningReqs={wideningReqs}
              standardOffer={entryRequirements?.highers ?? null}
              hasAnyWaOffers={hasAnyWaOffers}
              uniWideningInfo={uniWideningInfo}
              universityName={university?.name ?? null}
              universityWebsite={university?.website ?? null}
              isLoggedIn={!!user}
              uniWaDetails={uniWaDetails}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Offer Tracker (logged-in students only) */}
            {user && university && (
              <OfferTracker
                courseId={course.id}
                universityId={university.id}
                courseName={course.name}
                universityName={university.name}
              />
            )}

            {/* Quick Actions */}
            <div className="pf-card">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  className="w-full pf-btn-primary justify-center"
                  style={{ minHeight: '44px' }}
                >
                  Save to Shortlist
                </button>
                {course.course_url && (
                  <a
                    href={course.course_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-[var(--pf-grey-100)] text-[var(--pf-grey-900)] font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
                    style={{ minHeight: '44px', padding: '12px 16px' }}
                  >
                    View on University Site
                  </a>
                )}
                {university?.website && (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                    style={{ minHeight: '44px', padding: '12px 16px' }}
                  >
                    Visit University Website
                  </a>
                )}
              </div>
            </div>

            {/* University Info */}
            {university && (
              <div className="pf-card">
                <h3 className="font-semibold text-gray-900 mb-4">University</h3>
                <Link href={`/universities/${university.id}`} className="block group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-400">{university.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600">{university.name}</p>
                      {university.city && (
                        <p className="text-sm text-gray-500">{university.city}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Key Facts */}
            <div className="pf-card">
              <h3 className="font-semibold text-gray-900 mb-4">Key Facts</h3>
              <dl className="space-y-3">
                {course.duration_years && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Duration</dt>
                    <dd className="font-medium text-gray-900">
                      {course.duration_years} {course.duration_years === 1 ? 'year' : 'years'}
                    </dd>
                  </div>
                )}
                {course.degree_type && degreeInfo && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Qualification</dt>
                    <dd className="font-medium text-gray-900">{degreeInfo.label}</dd>
                  </div>
                )}
                {course.ucas_code && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">UCAS Code</dt>
                    <dd className="font-medium text-gray-900">{course.ucas_code}</dd>
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

// Personalised eligibility block shown at the top of the main column when a
// logged-in student has grades entered. Uses the shared EligibilityDetail
// from use-course-matching so the /courses list and /courses/[id] stay in sync.
function PersonalisedEligibility({
  detail,
  uniWaDetails,
}: {
  detail: import('@/hooks/use-course-matching').EligibilityDetail
  uniWaDetails: UniversityWaDetails
}) {
  const palette = {
    eligible: {
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.25)',
      accent: 'var(--pf-green-500)',
      title: 'You meet the entry requirements',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      ),
    },
    eligible_via_wa: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.25)',
      accent: 'var(--pf-amber-500)',
      title: 'You meet the widening access entry requirements',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      ),
    },
    possible: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.25)',
      accent: 'var(--pf-amber-500)',
      title: 'You may be close to the entry requirements',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      ),
    },
    missing_subjects: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.25)',
      accent: 'var(--pf-amber-500)',
      title: "You're missing required subjects",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
    ineligible: {
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.25)',
      accent: 'var(--pf-red-500)',
      title: "You don't currently meet requirements",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ),
    },
  }[detail.status]

  // Include the specific programme name from the university where available,
  // so students see "SIMD20 offer via Plus Flag" instead of a generic label.
  const programmeSuffix = uniWaDetails.waProgrammeName
    ? ` via ${uniWaDetails.waProgrammeName}`
    : ''
  const wideningOfferLabel: Record<NonNullable<typeof detail.wideningOfferType>, string> = {
    simd20: `SIMD20 offer${programmeSuffix}`,
    simd40: `SIMD40 offer${programmeSuffix}`,
    care_experienced: `Care-experienced offer${programmeSuffix}`,
    general: `Widening access offer${programmeSuffix}`,
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">How you stack up</h2>
      <div
        className="rounded-lg"
        style={{
          padding: '20px',
          backgroundColor: palette.bg,
          border: `1px solid ${palette.border}`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: palette.accent, color: '#fff' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {palette.icon}
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '6px',
              }}
            >
              {palette.title}
            </p>

            {detail.standardRequirement && (
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
                Standard offer:{' '}
                <span className="pf-data-number" style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>
                  {detail.standardRequirement}
                </span>
                {' · '}
                Your Highers:{' '}
                <span className="pf-data-number" style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>
                  {detail.studentHigherString || '—'}
                </span>
              </p>
            )}

            {/* Met subjects (green ticks) */}
            {detail.metSubjects.length > 0 && (
              <div className="mb-2">
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '4px' }}>
                  Subjects you have
                </p>
                <div className="flex flex-wrap gap-2">
                  {detail.metSubjects.map((s) => (
                    <span key={s} className="pf-badge-green inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing subjects */}
            {detail.missingSubjects.length > 0 && (
              <div className="mb-2">
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '4px' }}>
                  Subjects you still need
                </p>
                <div className="flex flex-wrap gap-2">
                  {detail.missingSubjects.map((s) => (
                    <span key={s} className="pf-badge-amber inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Below-grade subjects */}
            {detail.belowGradeSubjects.length > 0 && (
              <div className="mb-2">
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '4px' }}>
                  Subjects below required grade
                </p>
                <div className="flex flex-wrap gap-2">
                  {detail.belowGradeSubjects.map((s) => (
                    <span key={s} className="pf-badge-red">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Widening access explanation */}
            {detail.isWideningEligible && detail.wideningOfferType && detail.adjustedRequirement && (
              <>
                <p
                  className="mt-3"
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--pf-grey-900)',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                  }}
                >
                  <strong>{wideningOfferLabel[detail.wideningOfferType]}:</strong> reduced offer of{' '}
                  <span className="pf-data-number" style={{ fontWeight: 600 }}>
                    {detail.adjustedRequirement}
                  </span>
                </p>
                {uniWaDetails.waPreEntryRequired && (
                  <p
                    className="mt-2"
                    style={{
                      fontSize: '0.75rem',
                      color: '#B45309',
                      fontWeight: 600,
                      margin: 0,
                      marginTop: '8px',
                    }}
                  >
                    Note: completion of
                    {uniWaDetails.waProgrammeName ? ` ${uniWaDetails.waProgrammeName}` : ' a pre-entry programme'}{' '}
                    is required to access this offer.
                  </p>
                )}
              </>
            )}

            {/* Ineligible / no grades hint */}
            {detail.status === 'ineligible' && !detail.isWideningEligible && (
              <p className="mt-2" style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                Check the widening access section below — you may qualify for a reduced offer if
                you meet other criteria.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Widening access block at the bottom of the main column. Renders in three
// modes depending on who's viewing:
//   (a) Logged-in WA-eligible student  → personalised table + criteria.
//   (b) Logged-in non-eligible student → general info about the university's offers.
//   (c) Logged-out visitor             → same as (b), plus sign-up CTA.
// Always renders when the course has any WA data; never renders otherwise.
type WaSectionProps = {
  student: Student | null
  wideningAccess: ReturnType<typeof useWideningAccessEligibility>
  wideningReqs: WideningAccessRequirements | null
  standardOffer: string | null
  hasAnyWaOffers: boolean
  uniWideningInfo: UniversityWideningInfo | null
  universityName: string | null
  universityWebsite: string | null
  isLoggedIn: boolean
  uniWaDetails: UniversityWaDetails
}

const OFFER_ROW_LABELS: Record<keyof WideningAccessRequirements, string> = {
  simd20_offer: 'SIMD20 (most deprived 20%)',
  simd40_offer: 'SIMD40 (most deprived 40%)',
  care_experienced_offer: 'Care experienced',
  general_offer: 'General widening access',
}

function WideningAccessSection({
  student,
  wideningAccess,
  wideningReqs,
  standardOffer,
  hasAnyWaOffers,
  uniWideningInfo,
  universityName,
  universityWebsite,
  isLoggedIn,
  uniWaDetails,
}: WaSectionProps) {
  // If the course has absolutely no WA data and the student isn't eligible,
  // there's nothing useful to show — skip the section entirely.
  if (!hasAnyWaOffers && !wideningAccess?.isEligible) return null

  // Pick the single most favourable offer the student would actually qualify for.
  // The label includes the university's WA programme name when available, so
  // students see (for example) "SIMD20 offer via Plus Flag: ABBB" instead of
  // a generic "SIMD20 adjusted offer".
  const programmeSuffix = uniWaDetails.waProgrammeName
    ? ` via ${uniWaDetails.waProgrammeName}`
    : ''
  const studentOffer: { offer: string; label: string } | null = (() => {
    if (!wideningAccess?.isEligible || !wideningReqs) return null
    if (wideningAccess.isSIMD20 && wideningReqs.simd20_offer) {
      return {
        offer: wideningReqs.simd20_offer,
        label: `SIMD20 offer${programmeSuffix}`,
      }
    }
    if (wideningAccess.isSIMD40 && wideningReqs.simd40_offer) {
      return {
        offer: wideningReqs.simd40_offer,
        label: `SIMD40 offer${programmeSuffix}`,
      }
    }
    if (wideningAccess.hasCareExperience && wideningReqs.care_experienced_offer) {
      return {
        offer: wideningReqs.care_experienced_offer,
        label: `Care-experienced offer${programmeSuffix}`,
      }
    }
    if (wideningReqs.general_offer) {
      return {
        offer: wideningReqs.general_offer,
        label: `Widening access offer${programmeSuffix}`,
      }
    }
    return null
  })()

  // Which offers does the course publish? Used to list every adjusted offer.
  const offerRows: { key: keyof WideningAccessRequirements; value: string }[] = []
  if (wideningReqs?.simd20_offer) offerRows.push({ key: 'simd20_offer', value: wideningReqs.simd20_offer })
  if (wideningReqs?.simd40_offer) offerRows.push({ key: 'simd40_offer', value: wideningReqs.simd40_offer })
  if (wideningReqs?.care_experienced_offer) offerRows.push({ key: 'care_experienced_offer', value: wideningReqs.care_experienced_offer })
  if (wideningReqs?.general_offer) offerRows.push({ key: 'general_offer', value: wideningReqs.general_offer })

  // Which criteria does the student currently meet?
  const studentCriteria: string[] = []
  if (wideningAccess?.isSIMD20 && student?.simd_decile) {
    studentCriteria.push(`SIMD20 — decile ${student.simd_decile}`)
  } else if (wideningAccess?.isSIMD40 && student?.simd_decile) {
    studentCriteria.push(`SIMD40 — decile ${student.simd_decile}`)
  }
  if (wideningAccess?.hasCareExperience) studentCriteria.push('Care experienced')
  if (wideningAccess?.isYoungCarer) studentCriteria.push('Young carer')
  if (wideningAccess?.isFirstGeneration) studentCriteria.push('First generation')

  return (
    <section>
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: 'var(--pf-grey-900)' }}
      >
        Widening Access
      </h2>

      {/* Personalised panel for eligible students */}
      {wideningAccess?.isEligible && (
        <div
          className="rounded-lg mb-4"
          style={{
            padding: '20px',
            backgroundColor: 'var(--pf-white)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderLeft: '4px solid var(--pf-amber-500)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="flex-shrink-0 rounded-full flex items-center justify-center"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: 'var(--pf-amber-500)',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1.0625rem',
                  color: 'var(--pf-grey-900)',
                  margin: 0,
                  marginBottom: '4px',
                }}
              >
                Based on your profile, you may qualify for adjusted entry
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', margin: 0, lineHeight: 1.6 }}>
                You meet {studentCriteria.length} widening access {studentCriteria.length === 1 ? 'criterion' : 'criteria'}.
                Universities verify these at application — always check the individual programme for confirmation.
              </p>
            </div>
          </div>

          {/* Criteria pills */}
          <div className="mb-4">
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--pf-grey-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
              }}
            >
              Criteria that apply to you
            </p>
            <div className="flex flex-wrap gap-2">
              {studentCriteria.map((c) => (
                <span key={c} className="pf-badge-amber">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Offer comparison table */}
          {studentOffer && standardOffer && (
            <div
              className="rounded-lg overflow-hidden mb-4"
              style={{ border: '1px solid var(--pf-grey-300)' }}
            >
              <div
                className="grid grid-cols-2"
                style={{ backgroundColor: 'var(--pf-grey-100)', padding: '10px 16px' }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--pf-grey-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Offer type
                </span>
                <span
                  className="text-right"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--pf-grey-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Grades required
                </span>
              </div>
              <div
                className="grid grid-cols-2 items-center"
                style={{ padding: '12px 16px', borderTop: '1px solid var(--pf-grey-300)' }}
              >
                <span style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)' }}>Standard offer</span>
                <span
                  className="pf-data-number text-right"
                  style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}
                >
                  {standardOffer}
                </span>
              </div>
              <div
                className="grid grid-cols-2 items-center"
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid var(--pf-grey-300)',
                  backgroundColor: 'rgba(16, 185, 129, 0.06)',
                }}
              >
                <span
                  className="inline-flex items-center gap-2"
                  style={{ fontSize: '0.9375rem', color: 'var(--pf-green-500)', fontWeight: 600 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Your potential offer
                </span>
                <span
                  className="pf-data-number text-right"
                  style={{ fontWeight: 700, color: 'var(--pf-green-500)', fontSize: '1.0625rem' }}
                >
                  {studentOffer.offer}
                </span>
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  borderTop: '1px solid var(--pf-grey-300)',
                  fontSize: '0.75rem',
                  color: 'var(--pf-grey-600)',
                  backgroundColor: 'var(--pf-white)',
                }}
              >
                Applied via: {studentOffer.label}
              </div>
            </div>
          )}

          {/* Pre-entry programme warning — shown when the university requires
              completion of a dedicated pre-entry pathway for WA offers. */}
          {studentOffer && uniWaDetails.waPreEntryRequired && (
            <div
              className="rounded-lg mb-4"
              style={{
                padding: '14px 16px',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderLeft: '3px solid var(--pf-amber-500)',
              }}
            >
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: 'var(--pf-amber-500)', marginTop: '1px' }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#B45309',
                      margin: 0,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Pre-entry programme required
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--pf-grey-900)',
                      margin: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    To receive this adjusted offer you need to complete
                    {uniWaDetails.waProgrammeName ? ` ${uniWaDetails.waProgrammeName}` : ''}
                    {uniWaDetails.waPreEntryDetails
                      ? `. ${uniWaDetails.waPreEntryDetails}`
                      : '. Contact your school, SDS careers adviser, or check the university website for eligibility steps.'}
                  </p>
                  {uniWaDetails.waProgrammeUrl && (
                    <a
                      href={uniWaDetails.waProgrammeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2"
                      style={{
                        color: 'var(--pf-blue-700)',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                      }}
                    >
                      Learn more on the university website
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No adjusted offer for this student's category */}
          {wideningAccess.isEligible && !studentOffer && (
            <p
              className="rounded-lg"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--pf-grey-100)',
                fontSize: '0.875rem',
                color: 'var(--pf-grey-900)',
                margin: 0,
              }}
            >
              This course hasn&apos;t published a specific adjusted offer for your category.
              Contact {universityName ?? 'the university'} directly — many programmes consider
              widening access circumstances on a case-by-case basis.
            </p>
          )}
        </div>
      )}

      {/* General information (always shown when course has WA data) */}
      {hasAnyWaOffers && (
        <div
          className="pf-card-flat overflow-hidden"
          style={{ backgroundColor: 'var(--pf-white)' }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--pf-grey-300)',
              backgroundColor: 'var(--pf-blue-50)',
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--pf-grey-900)',
                margin: 0,
                marginBottom: '4px',
              }}
            >
              {wideningAccess?.isEligible
                ? 'All adjusted offers for this course'
                : `${universityName ?? 'This university'} offers reduced entry for students from widening participation backgrounds`}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', margin: 0 }}>
              Scottish universities apply contextualised admissions for students from under-represented groups.
            </p>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {offerRows.map((row, idx) => (
              <li
                key={row.key}
                className="flex justify-between items-center"
                style={{
                  padding: '14px 20px',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--pf-grey-300)',
                }}
              >
                <span style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                  {OFFER_ROW_LABELS[row.key]}
                </span>
                <span
                  className="pf-data-number"
                  style={{ fontWeight: 600, color: 'var(--pf-grey-900)', fontSize: '0.9375rem' }}
                >
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
          {(uniWideningInfo?.url || uniWideningInfo?.programme_name || universityWebsite) && (
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--pf-grey-300)',
                backgroundColor: 'var(--pf-grey-100)',
                fontSize: '0.8125rem',
              }}
            >
              {uniWideningInfo?.url ? (
                <a
                  href={uniWideningInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  {uniWideningInfo.programme_name
                    ? `Visit ${uniWideningInfo.programme_name}`
                    : 'Visit the widening access page'}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : universityWebsite ? (
                <a
                  href={universityWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  Visit {universityName ?? 'university'} website for full details
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Learn more link — always present */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/widening-access"
          className="pf-btn-ghost pf-btn-sm"
          style={{ color: 'var(--pf-blue-500)' }}
        >
          Learn about widening access schemes
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        {!isLoggedIn && (
          <Link
            href="/auth/sign-up"
            className="pf-btn-secondary pf-btn-sm"
          >
            Check your eligibility
          </Link>
        )}
      </div>
    </section>
  )
}
