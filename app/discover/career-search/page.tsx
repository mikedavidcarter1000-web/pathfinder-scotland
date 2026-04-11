'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  useCareerSectors,
  useCareerSectorDetail,
  type CareerSectorWithCount,
  type CareerSubjectRow,
  type CareerRole,
} from '@/hooks/use-subjects'
import { useCourses } from '@/hooks/use-courses'
import {
  getCurricularAreaColour,
  RELEVANCE_STYLES,
  AI_ROLE_SOURCE,
} from '@/lib/constants'
import { AiRoleBadge } from '@/components/ui/ai-role-badge'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { classifyError } from '@/lib/errors'

function CareerSearchPageContent() {
  const searchParams = useSearchParams()
  const initialSectorParam = searchParams.get('sector') || null

  const [sectorId, setSectorId] = useState<string | null>(initialSectorParam)
  const [search, setSearch] = useState('')

  const {
    data: sectors,
    isLoading: sectorsLoading,
    error: sectorsError,
    refetch: refetchSectors,
  } = useCareerSectors()

  const {
    data: detail,
    isLoading: detailLoading,
    error: detailError,
  } = useCareerSectorDetail(sectorId)

  // Search filter for sectors
  const filteredSectors = useMemo(() => {
    if (!sectors) return []
    if (!search.trim()) return sectors
    const needle = search.trim().toLowerCase()
    return sectors.filter(
      (s) =>
        s.name.toLowerCase().includes(needle) ||
        s.description?.toLowerCase().includes(needle)
    )
  }, [sectors, search])

  // Course search — only fires when user has typed 2+ characters
  const { data: matchingCourses, isLoading: coursesSearching } = useCourses(
    search.trim().length >= 2 ? { search: search.trim(), limit: 6 } : { limit: 0 }
  )
  const showCourseMatches =
    search.trim().length >= 2 && !sectorId && (matchingCourses?.length ?? 0) > 0

  const handleBack = () => setSectorId(null)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-100)',
        }}
      >
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <nav aria-label="Breadcrumb" style={{ marginBottom: '12px' }}>
            <Link
              href="/discover"
              style={{
                color: 'var(--pf-blue-700)',
                fontSize: '0.875rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Discover
            </Link>
          </nav>
          <h1 style={{ marginBottom: '8px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
            {detail ? "Here's what you'll need" : 'What are you interested in?'}
          </h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', maxWidth: '720px' }}>
            {detail
              ? `These are the school subjects that lead to ${detail.sector.name.toLowerCase()} careers and degrees.`
              : "Pick a career area below, or search for a degree or job title. We'll show you the subjects you need."}
          </p>
        </div>
      </div>

      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {/* STEP 1: Browse / search — only when no sector is selected */}
        {!sectorId && (
          <>
            {/* Search bar */}
            <div className="mb-8">
              <label htmlFor="career-search-input" className="pf-label">
                Search careers, degrees, or job titles
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                  style={{ color: 'var(--pf-grey-600)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="career-search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Medicine, Software Engineer, Architecture..."
                  className="pf-input w-full"
                  style={{ paddingLeft: '44px' }}
                  aria-label="Search for a career or degree"
                />
              </div>
            </div>

            {/* Direct course matches */}
            {showCourseMatches && (
              <div className="mb-8">
                <h2 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>
                  Matching university courses
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {matchingCourses!.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="pf-card-hover no-underline hover:no-underline flex items-start gap-3"
                      style={{ padding: '16px' }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--pf-blue-100)',
                          color: 'var(--pf-blue-700)',
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 600,
                            color: 'var(--pf-grey-900)',
                            fontSize: '0.9375rem',
                            lineHeight: 1.3,
                            marginBottom: '4px',
                          }}
                        >
                          {course.name}
                        </p>
                        {course.university && (
                          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                            {course.university.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {search.trim().length >= 2 && coursesSearching && (
              <p
                className="mb-6"
                style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}
              >
                Searching courses...
              </p>
            )}

            {/* Sector grid */}
            <div className="mb-4 flex items-baseline justify-between">
              <h2 style={{ fontSize: '1.125rem' }}>
                {search.trim() ? 'Matching career areas' : 'All career areas'}
              </h2>
              {!sectorsLoading && filteredSectors.length > 0 && (
                <span style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem' }}>
                  {filteredSectors.length}
                  {filteredSectors.length === 1 ? ' area' : ' areas'}
                </span>
              )}
            </div>

            {sectorsLoading && <SectorGridSkeleton />}

            {!sectorsLoading && sectorsError && (
              <ErrorState
                title={classifyError(sectorsError).title}
                message="Couldn't load career areas. Please try again."
                retryAction={() => refetchSectors()}
              />
            )}

            {!sectorsLoading && !sectorsError && filteredSectors.length === 0 && (
              <div
                className="pf-card text-center"
                style={{ padding: '40px 24px' }}
              >
                <p style={{ color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
                  No career areas match &quot;{search}&quot;.
                </p>
                <button
                  onClick={() => setSearch('')}
                  className="pf-btn-ghost pf-btn-sm"
                >
                  Clear search
                </button>
              </div>
            )}

            {!sectorsLoading && !sectorsError && filteredSectors.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSectors.map((sector) => (
                  <SectorCard
                    key={sector.id}
                    sector={sector}
                    onSelect={() => setSectorId(sector.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* STEP 2: Selected sector detail */}
        {sectorId && (
          <>
            {/* Back button */}
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 mb-6"
              style={{
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                minHeight: '44px',
              }}
              aria-label="Back to career areas"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All career areas
            </button>

            {detailLoading && (
              <div className="space-y-6">
                <Skeleton variant="card" />
                <Skeleton variant="card" />
                <Skeleton variant="card" />
              </div>
            )}

            {!detailLoading && detailError && (
              <ErrorState
                title={classifyError(detailError).title}
                message="Couldn't load subjects for this career area. Please try again."
                retryAction={handleBack}
              />
            )}

            {!detailLoading && !detailError && detail && (
              <div className="space-y-8">
                {/* Sector header */}
                <div className="pf-card" style={{ padding: '24px' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{detail.sector.name}</h2>
                  {detail.sector.description && (
                    <p style={{ color: 'var(--pf-grey-600)', lineHeight: 1.6, marginBottom: '12px' }}>
                      {detail.sector.description}
                    </p>
                  )}
                  <Link
                    href={`/careers/${detail.sector.id}`}
                    className="inline-flex items-center gap-1 no-underline hover:no-underline"
                    style={{
                      color: 'var(--pf-blue-500)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    See full sector page with jobs and salaries
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Job roles grouped by AI impact level */}
                {detail.career_roles.length > 0 && (
                  <SectorRolesPanel roles={detail.career_roles} />
                )}

                {/* Essential */}
                {detail.subjects_by_relevance.essential.length > 0 && (
                  <RelevanceGroup
                    eyebrow={RELEVANCE_STYLES.essential.label}
                    title="You'll almost certainly need these"
                    description="Essential subjects — direct prerequisites for degree courses in this area."
                    relevance="essential"
                    subjects={detail.subjects_by_relevance.essential}
                  />
                )}

                {/* Recommended */}
                {detail.subjects_by_relevance.recommended.length > 0 && (
                  <RelevanceGroup
                    eyebrow={RELEVANCE_STYLES.recommended.label}
                    title="These will strengthen your application"
                    description="Recommended — widely preferred by universities and employers in this field."
                    relevance="recommended"
                    subjects={detail.subjects_by_relevance.recommended}
                  />
                )}

                {/* Related */}
                {detail.subjects_by_relevance.related.length > 0 && (
                  <RelevanceGroup
                    eyebrow={RELEVANCE_STYLES.related.label}
                    title="These develop useful skills for this field"
                    description="Related — build transferable skills that support this career."
                    relevance="related"
                    subjects={detail.subjects_by_relevance.related}
                  />
                )}

                {/* CTAs */}
                <div
                  className="pf-card"
                  style={{
                    backgroundColor: 'var(--pf-blue-900)',
                    padding: '32px',
                    color: '#fff',
                  }}
                >
                  <h2 style={{ color: '#fff', marginBottom: '8px', fontSize: '1.375rem' }}>
                    Ready to check your path?
                  </h2>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: '24px',
                      fontSize: '0.9375rem',
                    }}
                  >
                    Plan these subjects into your senior phase, or see the full list of university courses they open up.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={(() => {
                        // Pass essential + recommended subject IDs so the pathways
                        // planner can highlight them as "suggested for this career".
                        // Related subjects are excluded — the sector-detail page
                        // already treats them as nice-to-haves.
                        const suggested = [
                          ...detail.subjects_by_relevance.essential,
                          ...detail.subjects_by_relevance.recommended,
                        ].map((s) => s.id)
                        const params = new URLSearchParams()
                        if (suggested.length > 0) params.set('suggest', suggested.join(','))
                        params.set('sector', detail.sector.id)
                        params.set('stage', 's3')
                        return `/pathways?${params.toString()}`
                      })()}
                      className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
                      style={{
                        backgroundColor: '#fff',
                        color: 'var(--pf-blue-900)',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        minHeight: '48px',
                      }}
                    >
                      Plan these subjects
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      href={`/subjects?career_sector=${detail.sector.id}`}
                      className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
                      style={{
                        backgroundColor: 'transparent',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.35)',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        minHeight: '48px',
                      }}
                    >
                      Explore these subjects in depth
                    </Link>
                    <Link
                      href="/courses"
                      className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
                      style={{
                        backgroundColor: 'transparent',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.35)',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        minHeight: '48px',
                      }}
                    >
                      See university courses
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- */

function SectorCard({
  sector,
  onSelect,
}: {
  sector: CareerSectorWithCount
  onSelect: () => void
}) {
  return (
    <div className="pf-card-hover flex flex-col h-full" style={{ padding: '24px' }}>
      <button
        onClick={onSelect}
        className="text-left flex flex-col flex-1"
        style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
        aria-label={`Show subjects for ${sector.name}`}
      >
        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'var(--pf-blue-100)',
            color: 'var(--pf-blue-700)',
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3
          style={{
            fontSize: '1.0625rem',
            marginBottom: '6px',
            color: 'var(--pf-grey-900)',
          }}
        >
          {sector.name}
        </h3>
        {sector.description && (
          <p
            className="line-clamp-3"
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              marginBottom: '16px',
              flex: 1,
            }}
          >
            {sector.description}
          </p>
        )}
        <div className="flex items-center justify-between" style={{ marginTop: 'auto' }}>
          <span className="pf-badge-blue">
            {sector.subject_count} {sector.subject_count === 1 ? 'subject' : 'subjects'}
          </span>
          <span
            style={{
              color: 'var(--pf-blue-700)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Quick view
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </button>
      <Link
        href={`/careers/${sector.id}`}
        className="no-underline hover:no-underline inline-flex items-center justify-center"
        style={{
          marginTop: '12px',
          padding: '8px',
          fontSize: '0.8125rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          color: 'var(--pf-blue-700)',
          borderTop: '1px solid var(--pf-grey-100)',
        }}
      >
        See full sector page →
      </Link>
    </div>
  )
}

function SectorGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="pf-card">
          <Skeleton width="48px" height={48} rounded="md" />
          <div style={{ height: '16px' }} />
          <Skeleton width="70%" height={18} rounded="sm" />
          <div style={{ height: '12px' }} />
          <Skeleton width="100%" height={12} rounded="sm" />
          <div style={{ height: '4px' }} />
          <Skeleton width="85%" height={12} rounded="sm" />
          <div style={{ height: '16px' }} />
          <Skeleton width="30%" height={22} rounded="full" />
        </div>
      ))}
    </div>
  )
}

function RelevanceGroup({
  eyebrow,
  title,
  description,
  relevance,
  subjects,
}: {
  eyebrow: string
  title: string
  description: string
  relevance: 'essential' | 'recommended' | 'related'
  subjects: CareerSubjectRow[]
}) {
  const styles = RELEVANCE_STYLES[relevance]
  return (
    <section aria-labelledby={`group-${relevance}`}>
      <div style={{ marginBottom: '16px' }}>
        <span
          className={`pf-badge ${styles.bg} ${styles.text}`}
          style={{ marginBottom: '8px', display: 'inline-flex' }}
        >
          {eyebrow}
        </span>
        <h2
          id={`group-${relevance}`}
          style={{ marginTop: '8px', marginBottom: '4px', fontSize: '1.25rem' }}
        >
          {title}
        </h2>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </section>
  )
}

function SubjectCard({ subject }: { subject: CareerSubjectRow }) {
  const area = subject.curricular_area
  const areaColour = getCurricularAreaColour(area?.name)

  const levels: string[] = []
  if (subject.is_available_n5) levels.push('N5')
  if (subject.is_available_higher) levels.push('H')
  if (subject.is_available_adv_higher) levels.push('AH')

  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full"
      style={{ padding: 0, overflow: 'hidden' }}
      aria-label={`View details for ${subject.name}`}
    >
      <div className={`h-1 bg-gradient-to-r ${areaColour.bar}`} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <h3
            style={{
              color: 'var(--pf-grey-900)',
              fontSize: '1rem',
              marginBottom: '8px',
              lineHeight: 1.3,
            }}
            className="line-clamp-2"
          >
            {subject.name}
          </h3>
          {area && (
            <span className={`pf-area-badge ${areaColour.bg} ${areaColour.text}`}>
              {area.name}
            </span>
          )}
        </div>

        {/* Progression preview */}
        {levels.length > 0 && (
          <div
            className="flex items-center gap-1 mb-3"
            aria-label={`Available at ${levels.join(', ')}`}
          >
            {levels.map((lvl, idx) => (
              <span
                key={lvl}
                className="flex items-center"
                style={{ fontSize: '0.75rem' }}
              >
                <span
                  className="pf-badge-grey"
                  style={{ minWidth: '34px', justifyContent: 'center' }}
                >
                  {lvl}
                </span>
                {idx < levels.length - 1 && (
                  <svg
                    className="w-3 h-3 mx-1"
                    style={{ color: 'var(--pf-grey-300)' }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        )}

        {subject.course_count > 0 && (
          <p
            className="mb-3"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
            }}
          >
            Required by{' '}
            <span style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
              {subject.course_count}
            </span>{' '}
            university {subject.course_count === 1 ? 'course' : 'courses'}
          </p>
        )}

        <div className="mt-auto">
          <span
            className="flex w-full items-center justify-center"
            style={{
              minHeight: '40px',
              padding: '8px',
              fontSize: '0.8125rem',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              color: 'var(--pf-blue-700)',
              backgroundColor: 'var(--pf-blue-100)',
              borderRadius: '6px',
            }}
          >
            View subject
          </span>
        </div>
      </div>
    </Link>
  )
}

function SectorRolesPanel({ roles }: { roles: CareerRole[] }) {
  const resilient = roles.filter((r) => !r.is_new_ai_role && r.ai_rating <= 3)
  const evolving = roles.filter((r) => !r.is_new_ai_role && r.ai_rating >= 4 && r.ai_rating <= 6)
  const transforming = roles.filter((r) => !r.is_new_ai_role && r.ai_rating >= 7 && r.ai_rating <= 9)
  const reshaped = roles.filter((r) => !r.is_new_ai_role && r.ai_rating === 10)
  const newAiRoles = roles.filter((r) => r.is_new_ai_role)

  return (
    <section aria-labelledby="sector-roles-heading">
      <h2 id="sector-roles-heading" style={{ marginTop: '8px', marginBottom: '4px', fontSize: '1.25rem' }}>
        Job roles in this sector
      </h2>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          marginBottom: '20px',
        }}
      >
        How AI is shaping each job, grouped by how much the role is changing.
      </p>

      <div className="space-y-5">
        {resilient.length > 0 && (
          <RoleGroupCard
            title="Resilient roles"
            subtitle="AI assists, but the role stays human at its core."
            range="1–3"
            accent="var(--pf-green-500)"
            bg="rgba(16, 185, 129, 0.05)"
            roles={resilient}
          />
        )}
        {evolving.length > 0 && (
          <RoleGroupCard
            title="Evolving roles"
            subtitle="AI changes how the work is done. People who learn to use it thrive."
            range="4–6"
            accent="var(--pf-amber-500)"
            bg="rgba(245, 158, 11, 0.05)"
            roles={evolving}
          />
        )}
        {transforming.length > 0 && (
          <RoleGroupCard
            title="Transforming roles"
            subtitle="Routine tasks automated; the role shifts toward strategy and judgment."
            range="7–9"
            accent="#C2410C"
            bg="rgba(249, 115, 22, 0.05)"
            roles={transforming}
          />
        )}
        {reshaped.length > 0 && (
          <RoleGroupCard
            title="Reshaped roles"
            subtitle="The job as it exists today is largely automated. New careers emerge alongside."
            range="10"
            accent="var(--pf-red-500)"
            bg="rgba(239, 68, 68, 0.05)"
            roles={reshaped}
          />
        )}
        {newAiRoles.length > 0 && (
          <div
            className="pf-card"
            style={{
              padding: '20px 24px',
              borderTop: '3px solid var(--pf-green-500)',
              backgroundColor: 'rgba(16, 185, 129, 0.04)',
            }}
          >
            <h3
              style={{
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '4px',
              }}
            >
              New careers you could pioneer
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                marginBottom: '12px',
              }}
            >
              Roles created in the last few years that didn&apos;t exist for previous generations.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {newAiRoles.map((role) => (
                <li key={role.id}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '0.75rem',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      color: 'var(--pf-green-500)',
                    }}
                  >
                    {role.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p
        style={{
          fontSize: '0.6875rem',
          color: 'var(--pf-grey-600)',
          marginTop: '16px',
          lineHeight: 1.6,
        }}
      >
        {AI_ROLE_SOURCE}
      </p>
    </section>
  )
}

function RoleGroupCard({
  title,
  subtitle,
  range,
  accent,
  bg,
  roles,
}: {
  title: string
  subtitle: string
  range: string
  accent: string
  bg: string
  roles: CareerRole[]
}) {
  return (
    <div
      className="pf-card"
      style={{
        padding: '20px 24px',
        borderLeft: `3px solid ${accent}`,
        backgroundColor: bg,
      }}
    >
      <div
        className="flex items-baseline justify-between"
        style={{ gap: '12px', marginBottom: '4px' }}
      >
        <h3 style={{ fontSize: '1rem', color: accent, margin: 0 }}>{title}</h3>
        <span
          style={{
            fontSize: '0.75rem',
            color: accent,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}
        >
          AI rating {range}
        </span>
      </div>
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--pf-grey-600)',
          marginBottom: '12px',
        }}
      >
        {subtitle}
      </p>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {roles.map((role) => (
          <li
            key={role.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '8px 0',
              borderTop: '1px solid var(--pf-grey-100)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-900)',
                  margin: 0,
                  marginBottom: '2px',
                }}
              >
                {role.title}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--pf-grey-600)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {role.ai_description}
              </p>
            </div>
            <AiRoleBadge rating={role.ai_rating} size="sm" showLabel={false} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CareerSearchPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: 'var(--pf-blue-50)' }}
        >
          <div className="animate-pulse" style={{ color: 'var(--pf-grey-600)' }}>
            Loading...
          </div>
        </div>
      }
    >
      <CareerSearchPageContent />
    </Suspense>
  )
}
