'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  useUniversity,
  useUniversityBenefits,
  useUniversityCourses,
} from '@/hooks/use-universities'
import { useUniversityArticulation, type ArticulationWithCollege } from '@/hooks/use-colleges'
import { CourseCard } from '@/components/ui/course-card'
import { CourseCardSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { InstitutionHero } from '@/components/ui/institution-hero'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'
import { UNIVERSITY_TYPES } from '@/lib/constants'
import { UniversityRankingsSection } from '@/components/universities/rankings-section'
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
  const { data: uniBenefits } = useUniversityBenefits(id)
  const { data: collegeArticulation, isLoading: articulationLoading } = useUniversityArticulation(id)

  useAuthErrorRedirect([error])

  const articulationByCollege = useMemo(() => {
    if (!collegeArticulation || collegeArticulation.length === 0) return []
    const groups: Record<string, { college_id: string; college_name: string; routes: ArticulationWithCollege[] }> = {}
    for (const r of collegeArticulation) {
      if (!groups[r.college_id]) {
        groups[r.college_id] = { college_id: r.college_id, college_name: r.college_name, routes: [] }
      }
      groups[r.college_id].routes.push(r)
    }
    return Object.values(groups).sort((a, b) => a.college_name.localeCompare(b.college_name))
  }, [collegeArticulation])

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

  // Prefer the newer `university_type` text column ("established" tier) over the
  // original enum column which still uses "traditional".
  const typeKey = (university.university_type ?? university.type) as
    | keyof typeof UNIVERSITY_TYPES
    | null
  const typeInfo = typeKey ? UNIVERSITY_TYPES[typeKey] ?? null : null

  const typeColors: Record<string, string> = {
    ancient: 'bg-[var(--pf-blue-100)] text-[var(--pf-blue-700)]',
    traditional: 'bg-[var(--pf-blue-100)] text-[var(--pf-blue-700)]',
    established: 'bg-[var(--pf-blue-100)] text-[var(--pf-blue-700)]',
    modern: 'bg-[rgba(16,185,129,0.12)] text-[var(--pf-green-500)]',
    specialist: 'bg-[rgba(245,158,11,0.12)] text-[#B45309]',
  }

  const wideningAccessInfo = university.widening_access_info as {
    programs?: string[]
    eligibility_criteria?: string[]
  } | null

  // Courses at this university that publish adjusted WA offers. Used to build
  // the side-by-side standard vs WA grade comparison table.
  const coursesWithWa: Array<{
    id: string
    name: string
    standard: string | null
    adjusted: string | null
    category: string | null
  }> = []
  if (courses) {
    for (const c of courses) {
      const wa = c?.widening_access_requirements as
        | Record<string, { highers?: string } | string | undefined>
        | null
      if (!wa || typeof wa !== 'object') continue
      const entry = c?.entry_requirements as { highers?: string } | null
      const standardOffer = entry?.highers ?? null

      // Pick the most favourable adjusted offer available.
      const simd20 =
        typeof wa.simd20 === 'object' && wa.simd20
          ? (wa.simd20 as { highers?: string }).highers
          : typeof wa.simd20_offer === 'string'
            ? wa.simd20_offer
            : undefined
      const simd40 =
        typeof wa.simd40 === 'object' && wa.simd40
          ? (wa.simd40 as { highers?: string }).highers
          : typeof wa.simd40_offer === 'string'
            ? wa.simd40_offer
            : undefined
      const care =
        typeof wa.care_experienced === 'object' && wa.care_experienced
          ? (wa.care_experienced as { highers?: string }).highers
          : typeof wa.care_experienced_offer === 'string'
            ? wa.care_experienced_offer
            : undefined
      const general =
        typeof wa.wa_minimum === 'object' && wa.wa_minimum
          ? (wa.wa_minimum as { highers?: string }).highers
          : typeof wa.general_offer === 'string'
            ? wa.general_offer
            : undefined

      const adjusted = simd20 ?? care ?? simd40 ?? general ?? null
      const label = simd20
        ? 'SIMD20'
        : care
          ? 'Care experienced'
          : simd40
            ? 'SIMD40'
            : general
              ? 'WA minimum'
              : null

      if (adjusted) {
        coursesWithWa.push({
          id: c.id,
          name: c.name,
          standard: standardOffer,
          adjusted,
          category: label,
        })
      }
    }
  }
  const waCourseExamples = coursesWithWa.slice(0, 5)

  const hasAnyWaData = Boolean(
    university?.wa_programme_name ||
    university?.wa_programme_description ||
    university?.care_experienced_guarantee ||
    university?.wa_grade_reduction ||
    university?.wa_bursary_info ||
    university?.articulation_info ||
    (university?.shep_programmes && university.shep_programmes.length > 0) ||
    waCourseExamples.length > 0
  )

  return (
    <div className="min-h-screen bg-[var(--pf-blue-50)]">
      {/* Hero banner */}
      <InstitutionHero
        imageUrl={university.hero_image_url}
        alt={`${university.name} campus`}
      />

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
              {/* Logo / Image Placeholder */}
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                {university?.image_url || university?.logo_url ? (
                  <Image
                    src={university.image_url || university.logo_url || '/logo-icon.png'}
                    alt={university.name || 'University Logo'}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">{university?.name?.charAt(0) || 'U'}</span>
                )}
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
            {typeInfo && typeKey && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeColors[typeKey] || 'bg-[var(--pf-grey-100)] text-[var(--pf-grey-900)]'}`}
                title={typeInfo.description}
              >
                {typeInfo.label}
              </span>
            )}
            {university.russell_group === true && (
              <span className="pf-badge-amber">
                Russell Group
              </span>
            )}
            {university.founded_year != null && (
              <span className="pf-badge-grey">
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

            {/* Rankings and institutional outcomes */}
            <UniversityRankingsSection university={university} />

            {/* Widening Access — comprehensive section */}
            {hasAnyWaData && (
              <WideningAccessDetailSection
                university={university}
                waCourseExamples={waCourseExamples}
                legacyInfo={wideningAccessInfo}
              />
            )}

            {/* Financial Support — university-specific benefits/bursaries */}
            {uniBenefits && uniBenefits.length > 0 && (
              <FinancialSupportSection benefits={uniBenefits} />
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

            {/* College Routes In */}
            {!articulationLoading && articulationByCollege.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">College to University Routes</h2>
                  <span className="pf-badge-blue">{collegeArticulation?.length || 0} routes</span>
                </div>
                <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '20px' }}>
                  You can start at college and transfer into {university.name} with advanced standing
                </p>

                <div className="space-y-6">
                  {articulationByCollege.map((group) => (
                    <div key={group.college_id} className="pf-card" style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '1.0625rem', marginBottom: '12px' }}>
                        <Link
                          href={`/colleges/${group.college_id}`}
                          style={{ color: 'var(--pf-blue-700)' }}
                        >
                          {group.college_name}
                        </Link>
                      </h3>
                      <div className="overflow-x-auto -mx-2 px-2">
                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.875rem',
                            minWidth: '460px',
                          }}
                        >
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--pf-grey-300)' }}>
                              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--pf-grey-600)', fontWeight: 600, fontSize: '0.8125rem' }}>
                                College Qualification
                              </th>
                              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--pf-grey-600)', fontWeight: 600, fontSize: '0.8125rem' }}>
                                University Degree
                              </th>
                              <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--pf-grey-600)', fontWeight: 600, fontSize: '0.8125rem' }}>
                                Entry Year
                              </th>
                              <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--pf-grey-600)', fontWeight: 600, fontSize: '0.8125rem' }}>
                                WP?
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.routes.map((route) => (
                              <tr key={route.id} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                                <td style={{ padding: '10px 12px', color: 'var(--pf-grey-900)' }}>
                                  {route.college_qualification}
                                </td>
                                <td style={{ padding: '10px 12px', color: 'var(--pf-grey-900)' }}>
                                  {route.university_degree}
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                                  Year {route.entry_year}
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                  {route.is_widening_participation ? (
                                    <span className="pf-badge-amber" title={route.wp_eligibility || 'Widening participation'}>WP</span>
                                  ) : (
                                    <span style={{ color: 'var(--pf-grey-300)' }}>—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="pf-card">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {(university.website_url || university.website) && (
                  <a
                    href={university.website_url || university.website || undefined}
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

            {/* Official Links */}
            {(university.website_url ||
              university.widening_access_url ||
              university.scholarships_url ||
              university.undergraduate_url) && (
                <UniversityLinksCard
                  university={{
                    name: university.name,
                    website_url: university.website_url,
                    widening_access_url: university.widening_access_url,
                    scholarships_url: university.scholarships_url,
                    undergraduate_url: university.undergraduate_url,
                  }}
                />
              )}

            {/* Key Facts */}
            <div className="pf-card" id="key-facts">
              <h3 className="font-semibold text-gray-900 mb-4">Key Facts</h3>
              <dl className="space-y-3">
                {university.founded_year != null && (
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
                {university.russell_group === true && (
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

type WaCourseExample = {
  id: string
  name: string
  standard: string | null
  adjusted: string | null
  category: string | null
}

type LegacyWaInfo = {
  programs?: string[]
  eligibility_criteria?: string[]
} | null

function WideningAccessDetailSection({
  university,
  waCourseExamples,
  legacyInfo,
}: {
  university: University
  waCourseExamples: WaCourseExample[]
  legacyInfo: LegacyWaInfo
}) {
  const shepList = (university.shep_programmes ?? []).filter(Boolean)

  return (
    <section aria-labelledby="wa-section-title">
      <div className="flex items-center gap-3 mb-4">
        <span className="pf-badge-amber">Widening Access</span>
        {university.wa_pre_entry_required === true && (
          <span
            className="pf-badge"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.18)',
              color: '#B45309',
              fontWeight: 600,
            }}
          >
            Pre-entry programme required
          </span>
        )}
      </div>
      <h2
        id="wa-section-title"
        className="mb-4"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1.5rem',
          color: 'var(--pf-grey-900)',
        }}
      >
        How {university.name} supports widening access
      </h2>

      {/* Programme card */}
      {(university.wa_programme_name || university.wa_programme_description) && (
        <div
          className="pf-card mb-4"
          style={{ borderLeft: '4px solid var(--pf-amber-500)' }}
        >
          {university.wa_programme_name && (
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1.125rem',
                color: 'var(--pf-grey-900)',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              {university.wa_programme_name}
            </h3>
          )}
          {university.wa_programme_description && (
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {university.wa_programme_description}
            </p>
          )}

          {university.wa_pre_entry_required && (
            <div
              className="mt-4 rounded-lg"
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderLeft: '3px solid var(--pf-amber-500)',
              }}
            >
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#B45309',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                  marginBottom: '4px',
                }}
              >
                Pre-entry programme required
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', margin: 0, lineHeight: 1.55 }}>
                This university requires completion of a pre-entry programme for adjusted WA offers.
                {university.wa_pre_entry_details ? ` ${university.wa_pre_entry_details}` : ''}
              </p>
            </div>
          )}

          {university.wa_programme_url && (
            <a
              href={university.wa_programme_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4"
              style={{
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Learn more on the university website
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Care experienced guarantee — most prominent callout */}
      {university.care_experienced_guarantee && (
        <div
          className="rounded-lg mb-4"
          style={{
            padding: '20px 24px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderLeft: '4px solid var(--pf-green-500)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 rounded-full flex items-center justify-center"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(16, 185, 129, 0.16)',
                color: 'var(--pf-green-500)',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1.0625rem',
                  color: '#047857',
                  margin: 0,
                  marginBottom: '6px',
                }}
              >
                Care-Experienced Guarantee
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--pf-grey-900)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {university.care_experienced_guarantee}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grade reduction summary + course comparison table */}
      {(university.wa_grade_reduction || waCourseExamples.length > 0) && (
        <div className="pf-card mb-4">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-900)',
              margin: 0,
              marginBottom: '12px',
            }}
          >
            Grade reductions at a glance
          </h3>

          {university.wa_grade_reduction && (
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                margin: 0,
                marginBottom: waCourseExamples.length > 0 ? '16px' : 0,
              }}
            >
              {university.wa_grade_reduction}
            </p>
          )}

          {waCourseExamples.length > 0 && (
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--pf-grey-300)' }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '2fr 1fr 1fr',
                  backgroundColor: 'var(--pf-grey-100)',
                  padding: '10px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--pf-grey-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>Course</span>
                <span className="text-center">Standard</span>
                <span className="text-center">WA offer</span>
              </div>
              {waCourseExamples.map((ex, idx) => (
                <Link
                  key={ex.id}
                  href={`/courses/${ex.id}`}
                  className="no-underline hover:no-underline grid"
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr',
                    padding: '12px 14px',
                    borderTop: idx === 0 ? 'none' : '1px solid var(--pf-grey-300)',
                    alignItems: 'center',
                    backgroundColor:
                      idx % 2 === 0 ? 'var(--pf-white)' : 'var(--pf-blue-50)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--pf-grey-900)',
                      fontWeight: 500,
                    }}
                  >
                    {ex.name}
                    {ex.category && (
                      <span
                        className="ml-2"
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--pf-grey-600)',
                          fontWeight: 500,
                        }}
                      >
                        · {ex.category}
                      </span>
                    )}
                  </span>
                  <span
                    className="pf-data-number text-center"
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--pf-grey-900)',
                      fontWeight: 600,
                    }}
                  >
                    {ex.standard ?? '—'}
                  </span>
                  <span
                    className="pf-data-number text-center"
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--pf-green-500)',
                      fontWeight: 700,
                    }}
                  >
                    {ex.adjusted}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bursary / additional support */}
      {university.wa_bursary_info && (
        <div
          className="pf-card mb-4"
          style={{ borderLeft: '4px solid var(--pf-blue-700)' }}
        >
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-900)',
              margin: 0,
              marginBottom: '8px',
            }}
          >
            Additional Support
          </h3>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-600)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {university.wa_bursary_info}
          </p>
        </div>
      )}

      {/* Articulation routes */}
      {university.articulation_info && (
        <div className="pf-card mb-4">
          <div className="flex items-start gap-3 mb-2">
            <div
              className="flex-shrink-0 rounded-lg flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--pf-blue-100)',
                color: 'var(--pf-blue-700)',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1.0625rem',
                  color: 'var(--pf-grey-900)',
                  margin: 0,
                  marginBottom: '6px',
                }}
              >
                College to University Routes
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--pf-grey-600)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {university.articulation_info}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Link
              href="/pathways/alternatives"
              className="inline-flex items-center gap-1"
              style={{
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Explore alternative pathways
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* SHEP programme badges */}
      {shepList.length > 0 && (
        <div className="pf-card mb-4">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-900)',
              margin: 0,
              marginBottom: '8px',
            }}
          >
            Recognised SHEP programmes
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {shepList.map((name) => (
              <span
                key={name}
                className="pf-badge"
                style={{
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                  fontWeight: 600,
                }}
              >
                {name}
              </span>
            ))}
          </div>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Participation in these regional programmes can itself trigger reduced offers at
            Scottish universities — they are not just an outreach activity.
          </p>
          <Link
            href="/widening-access#shep"
            className="inline-flex items-center gap-1 mt-3"
            style={{
              color: 'var(--pf-blue-700)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            About SHEP programmes
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Legacy eligibility criteria list (only shown if present in the JSONB) */}
      {legacyInfo?.eligibility_criteria && legacyInfo.eligibility_criteria.length > 0 && (
        <div className="pf-card">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-900)',
              margin: 0,
              marginBottom: '12px',
            }}
          >
            Eligibility criteria
          </h3>
          <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {legacyInfo.eligibility_criteria.map((criteria) => (
              <li
                key={criteria}
                className="flex items-start gap-2"
                style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--pf-green-500)', marginTop: '3px' }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function UniversityLinksCard({
  university,
}: {
  university: {
    name: string
    website_url: string | null
    widening_access_url: string | null
    scholarships_url: string | null
    undergraduate_url: string | null
  }
}) {
  const items: Array<{ label: string; url: string | null }> = [
    { label: `Visit ${university.name}`, url: university.website_url },
    { label: `Widening access at ${university.name}`, url: university.widening_access_url },
    { label: 'Scholarships and funding', url: university.scholarships_url },
    { label: 'Browse all undergraduate courses', url: university.undergraduate_url },
  ].filter((i) => i.url)

  if (items.length === 0) return null

  return (
    <div className="pf-card">
      <h3 className="font-semibold text-gray-900 mb-4">Links</h3>
      <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item) => (
          <li key={item.url!}>
            <a
              href={item.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 no-underline hover:no-underline"
              style={{
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                padding: '6px 0',
              }}
            >
              <span>{item.label} &rarr;</span>
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FinancialSupportSection({
  benefits,
}: {
  benefits: Tables<'student_benefits'>[]
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Support</h2>
      <p className="text-sm text-gray-600 mb-4">
        University-specific bursaries and accommodation support on top of SAAS funding.
      </p>
      <div className="grid gap-4">
        {benefits.map((b) => (
          <div
            key={b.id}
            className="pf-card"
            style={{
              borderLeft: '4px solid var(--pf-blue-700)',
              padding: '20px',
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-gray-900" style={{ fontSize: '1rem' }}>
                {b.name}
              </h3>
              {b.is_care_experienced_only && (
                <span
                  className="pf-badge"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: '#B45309',
                    fontSize: '0.6875rem',
                  }}
                >
                  Care-experienced
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '1.125rem',
                color: 'var(--pf-blue-700)',
                marginBottom: '8px',
              }}
            >
              {b.discount_value}
            </div>
            <p className="text-sm text-gray-600">
              {b.short_description || b.description}
            </p>
            {b.eligibility_details && (
              <p className="text-xs text-gray-500 mt-2">
                <strong>Eligibility:</strong> {b.eligibility_details}
              </p>
            )}
            {b.url && (
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium mt-3 inline-block"
                style={{ color: 'var(--pf-blue-700)' }}
              >
                Details on university site →
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
