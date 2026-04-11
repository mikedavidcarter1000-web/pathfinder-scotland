'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMatchedCourses } from '@/hooks/use-course-matching'
import { useSubjectAreas, useSavedCourses, useToggleSaveCourse } from '@/hooks/use-courses'
import { useUniversities } from '@/hooks/use-universities'
import { useAuth } from '@/hooks/use-auth'
import { useGradeSummary } from '@/hooks/use-student'
import { CourseCard } from '@/components/ui/course-card'
import { SearchBar } from '@/components/ui/search-bar'
import { CourseCardSkeleton } from '@/components/ui/loading-skeletons'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { useToast } from '@/components/ui/toast'
import { ParentNotice } from '@/components/ui/parent-notice'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'

type EligibilityFilter = 'all' | 'eligible' | 'eligible_via_wa' | 'possible' | 'missing_subjects' | 'ineligible'

export default function CoursesPage() {
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
      <CoursesPageContent />
    </Suspense>
  )
}

function CoursesPageContent() {
  const { user } = useAuth()
  const gradeSummary = useGradeSummary()
  const searchParams = useSearchParams()

  // Pre-filter by a specific set of course IDs passed via ?ids=uuid1,uuid2,...
  // (e.g. from the simulator's "View all X matches" link). Empty string → no prefilter.
  const idFilter = useMemo(() => {
    const param = searchParams.get('ids')
    if (!param) return null
    const set = new Set(param.split(',').map((s) => s.trim()).filter(Boolean))
    return set.size > 0 ? set : null
  }, [searchParams])

  const [search, setSearch] = useState('')
  const [universityId, setUniversityId] = useState<string>('')
  const [subjectArea, setSubjectArea] = useState<string>('')
  const [eligibilityFilter, setEligibilityFilter] = useState<EligibilityFilter>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 12

  const { data: coursesWithEligibility, isLoading, error, stats, refetch } = useMatchedCourses({
    universityId: universityId || undefined,
    subjectArea: subjectArea || undefined,
  })

  useAuthErrorRedirect([error])

  const { data: universities } = useUniversities()
  const { data: subjectAreas } = useSubjectAreas()
  const { data: savedCourses } = useSavedCourses()
  const { toggle: toggleSave, isSaved, isPending: savePending } = useToggleSaveCourse()
  const toast = useToast()

  const handleToggleSave = async (courseId: string) => {
    const wasSaved = isSaved(courseId)
    try {
      await toggleSave(courseId)
      toast.success(wasSaved ? 'Removed from saved' : 'Added to saved')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.'
      toast.error("Couldn't update saved courses", message)
    }
  }

  // Filter courses by search and eligibility
  const filteredCourses = useMemo(() => {
    let courses = coursesWithEligibility || []

    // Pre-filter to a specific course set when arriving from the simulator.
    if (idFilter) {
      courses = courses.filter((course) => idFilter.has(course.id))
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      courses = courses.filter((course) =>
        course.name.toLowerCase().includes(searchLower) ||
        course.university?.name.toLowerCase().includes(searchLower)
      )
    }

    // Eligibility filter
    if (eligibilityFilter !== 'all') {
      courses = courses.filter((course) => course.eligibility?.status === eligibilityFilter)
    }

    return courses
  }, [coursesWithEligibility, search, eligibilityFilter, idFilter])

  // Reset to first page whenever filters or search change so users don't land on
  // an out-of-range page when the result set shrinks.
  useEffect(() => {
    setPage(1)
  }, [search, universityId, subjectArea, eligibilityFilter])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedCourses = useMemo(
    () => filteredCourses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredCourses, currentPage]
  )

  const clearFilters = () => {
    setSearch('')
    setUniversityId('')
    setSubjectArea('')
    setEligibilityFilter('all')
  }

  const hasFilters = search || universityId || subjectArea || eligibilityFilter !== 'all'
  const hasGrades = gradeSummary.totalGrades > 0
  const prefilterCount = idFilter?.size ?? 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <ParentNotice>
        Browse university courses and check entry requirements. Your child can check
        their personal eligibility from their own account.
      </ParentNotice>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <div className="mb-5 sm:mb-6">
            <h1 style={{ marginBottom: '4px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Courses</h1>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
              Explore courses across Scottish universities
            </p>
          </div>

          {/* Eligibility Stats Banner */}
          {hasGrades && stats && (
            <div
              className="mb-6 rounded-lg"
              style={{ padding: '16px', backgroundColor: 'var(--pf-blue-50)' }}
            >
              <div className="flex flex-wrap items-center gap-4">
                <StatPill
                  label={`${stats.eligible} Eligible`}
                  sub="Meet requirements"
                  accent="var(--pf-green-500)"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                />
                {stats.eligibleViaWa > 0 && (
                  <StatPill
                    label={`${stats.eligibleViaWa} Via widening access`}
                    sub="Adjusted offer meets your grades"
                    accent="var(--pf-amber-500)"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                  />
                )}
                <StatPill
                  label={`${stats.possible} Possible`}
                  sub="Close to requirements"
                  accent="var(--pf-amber-500)"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                />
                <StatPill
                  label={`${stats.missingSubjects} Missing subjects`}
                  sub="Need more subjects"
                  accent="var(--pf-blue-700)"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatPill
                  label={`${stats.total} Total`}
                  sub="All courses"
                  accent="var(--pf-grey-600)"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  }
                />
                <div className="flex-1" />
                <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                  Based on your{' '}
                  <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>
                    {gradeSummary.highers || 'grades'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* No Grades Banner */}
          {user && !hasGrades && (
            <div
              className="mb-6 rounded-lg"
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
                  <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
                    Add your grades to see which courses you&apos;re eligible for.
                  </p>
                </div>
                <Link href="/dashboard" className="pf-btn-secondary pf-btn-sm">
                  Add grades
                </Link>
              </div>
            </div>
          )}

          {/* Pre-filter notice when arriving from the simulator */}
          {idFilter && (
            <div
              className="mb-6 rounded-lg flex items-start gap-3"
              style={{
                padding: '16px',
                backgroundColor: 'var(--pf-blue-100)',
                borderLeft: '3px solid var(--pf-blue-700)',
              }}
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--pf-blue-700)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <div className="flex-1">
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Showing {prefilterCount} course{prefilterCount === 1 ? '' : 's'} matched by your subject combination
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', margin: '4px 0 0 0' }}>
                  These were matched in the simulator. You can still search and filter within this list.
                </p>
              </div>
              <Link
                href="/courses"
                className="pf-btn-ghost pf-btn-sm"
                style={{ whiteSpace: 'nowrap' }}
              >
                Show all courses
              </Link>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <SearchBar
              placeholder="Search courses by name..."
              onSearch={setSearch}
              showSuggestions={false}
              ariaLabel="Search courses"
            />
          </div>

          {/* Filters — stack on mobile, row on sm+ */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
              <select
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                aria-label="Filter by university"
                className="pf-input w-full lg:w-auto"
              >
                <option value="">All Universities</option>
                {universities?.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>

              <select
                value={subjectArea}
                onChange={(e) => setSubjectArea(e.target.value)}
                aria-label="Filter by subject area"
                className="pf-input w-full lg:w-auto"
              >
                <option value="">All Subjects</option>
                {subjectAreas?.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>

              {hasGrades && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setEligibilityFilter((prev) => (prev === 'eligible' ? 'all' : 'eligible'))
                    }
                    className="pf-btn pf-btn-sm w-full lg:w-auto justify-center"
                    aria-pressed={eligibilityFilter === 'eligible'}
                    style={{
                      backgroundColor:
                        eligibilityFilter === 'eligible' ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                      color:
                        eligibilityFilter === 'eligible' ? 'var(--pf-white)' : 'var(--pf-blue-700)',
                      border: '1px solid var(--pf-blue-700)',
                      minHeight: '44px',
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Eligible for me
                  </button>
                  <select
                    value={eligibilityFilter}
                    onChange={(e) => setEligibilityFilter(e.target.value as EligibilityFilter)}
                    aria-label="Filter by eligibility"
                    className="pf-input w-full lg:w-auto"
                    style={{
                      backgroundColor: eligibilityFilter !== 'all' ? 'var(--pf-blue-50)' : 'var(--pf-white)',
                      borderColor: eligibilityFilter !== 'all' ? 'var(--pf-blue-500)' : 'var(--pf-grey-300)',
                    }}
                  >
                    <option value="all">All eligibility</option>
                    <option value="eligible">Eligible</option>
                    <option value="eligible_via_wa">Eligible via widening access</option>
                    <option value="possible">Possible match</option>
                    <option value="missing_subjects">Missing subjects</option>
                    <option value="ineligible">Not eligible</option>
                  </select>
                </>
              )}

              {hasFilters && (
                <button onClick={clearFilters} className="pf-btn-ghost pf-btn-sm w-full lg:w-auto justify-center">
                  Clear filters
                </button>
              )}
            </div>

            {/* View Toggle — own row on mobile, right-aligned */}
            <div className="flex justify-end">
              <div
                className="flex items-center gap-1 rounded-lg"
                style={{ padding: '4px', backgroundColor: 'var(--pf-grey-100)' }}
              >
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className="rounded inline-flex items-center justify-center"
                  style={{
                    minWidth: '44px',
                    minHeight: '36px',
                    padding: '8px',
                    backgroundColor: viewMode === 'grid' ? 'var(--pf-white)' : 'transparent',
                    boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    color: viewMode === 'grid' ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className="rounded inline-flex items-center justify-center"
                  style={{
                    minWidth: '44px',
                    minHeight: '36px',
                    padding: '8px',
                    backgroundColor: viewMode === 'list' ? 'var(--pf-white)' : 'transparent',
                    boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    color: viewMode === 'list' ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {/* Results Count */}
        <div className="mb-6">
          {isLoading ? (
            <div
              className="h-5 w-32 rounded animate-pulse"
              style={{ backgroundColor: 'var(--pf-grey-100)' }}
            />
          ) : (
            <p style={{ color: 'var(--pf-grey-600)' }}>
              {filteredCourses?.length || 0} {(filteredCourses?.length ?? 0) === 1 ? 'course' : 'courses'} found
              {hasFilters && ' matching your filters'}
            </p>
          )}
        </div>

        {/* Error State */}
        {!isLoading && error && (
          <ErrorState
            title={classifyError(error).title}
            message="Something went wrong loading courses. Please try again."
            retryAction={() => refetch()}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <>
            <div className={`grid gap-5 sm:gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(9)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
            <SlowLoadingNotice isLoading={isLoading} />
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCourses?.length === 0 &&
          (() => {
            // Specific message for the "eligible" filter case vs the generic
            // "no results" case so the CTA matches what the student should do.
            if (eligibilityFilter === 'eligible' || eligibilityFilter === 'eligible_via_wa') {
              return (
                <EmptyState
                  icon={EmptyStateIcons.graduationCap}
                  title="No eligible courses yet"
                  message="Add more grades or explore different subjects to find courses you qualify for."
                  actionLabel="Add grades"
                  actionHref="/dashboard"
                  secondaryLabel="Clear filters"
                  onSecondary={hasFilters ? clearFilters : undefined}
                />
              )
            }
            return (
              <EmptyState
                icon={EmptyStateIcons.book}
                title="No courses match your search"
                message="Try different search terms or adjust your filters."
                actionLabel={hasFilters ? 'Clear all filters' : undefined}
                onAction={hasFilters ? clearFilters : undefined}
              />
            )
          })()}

        {/* Course Grid/List */}
        {!isLoading && !error && filteredCourses && filteredCourses.length > 0 && (
          <>
            <div className={`grid gap-5 sm:gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {pagedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  eligibility={course.eligibility}
                  compact={viewMode === 'list'}
                  showSaveButton={!!user}
                  isSaved={isSaved(course.id)}
                  onSave={() => handleToggleSave(course.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Courses pagination"
                className="mt-8 flex flex-col sm:flex-row items-center sm:justify-between gap-4"
              >
                <p
                  className="text-center sm:text-left"
                  style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}
                >
                  Page{' '}
                  <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>{currentPage}</span>{' '}
                  of{' '}
                  <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>{totalPages}</span>
                  <span style={{ color: 'var(--pf-grey-600)' }}>
                    {' '}· {filteredCourses.length} {filteredCourses.length === 1 ? 'result' : 'results'}
                  </span>
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="pf-btn-secondary pf-btn-sm flex-1 sm:flex-none justify-center"
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="pf-btn-primary pf-btn-sm flex-1 sm:flex-none justify-center"
                    style={{ minHeight: '44px' }}
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatPill({
  label,
  sub,
  accent,
  icon,
}: {
  label: string
  sub: string
  accent: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--pf-grey-900)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>{sub}</p>
      </div>
    </div>
  )
}
