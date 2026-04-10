'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMatchedCourses } from '@/hooks/use-course-matching'
import { useSubjectAreas, useSavedCourses, useToggleSaveCourse } from '@/hooks/use-courses'
import { useUniversities } from '@/hooks/use-universities'
import { useAuth } from '@/hooks/use-auth'
import { useGradeSummary } from '@/hooks/use-student'
import { CourseCard } from '@/components/ui/course-card'
import { SearchBar } from '@/components/ui/search-bar'
import { CourseCardSkeleton } from '@/components/ui/loading-skeletons'

type EligibilityFilter = 'all' | 'eligible' | 'possible' | 'below'

export default function CoursesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const gradeSummary = useGradeSummary()

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const [search, setSearch] = useState('')
  const [universityId, setUniversityId] = useState<string>('')
  const [subjectArea, setSubjectArea] = useState<string>('')
  const [eligibilityFilter, setEligibilityFilter] = useState<EligibilityFilter>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 12

  const { data: coursesWithEligibility, isLoading, error, stats } = useMatchedCourses({
    universityId: universityId || undefined,
    subjectArea: subjectArea || undefined,
  })

  const { data: universities } = useUniversities()
  const { data: subjectAreas } = useSubjectAreas()
  const { data: savedCourses } = useSavedCourses()
  const { toggle: toggleSave, isSaved, isPending: savePending } = useToggleSaveCourse()

  // Filter courses by search and eligibility
  const filteredCourses = useMemo(() => {
    let courses = coursesWithEligibility || []

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
      courses = courses.filter((course) => course.eligibility === eligibilityFilter)
    }

    return courses
  }, [coursesWithEligibility, search, eligibilityFilter])

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-teal-50)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container" style={{ paddingTop: '40px', paddingBottom: '32px' }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 style={{ marginBottom: '4px' }}>Courses</h1>
              <p style={{ color: 'var(--pf-grey-600)' }}>
                Explore courses across Scottish universities
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={goBack}
              style={{ color: 'var(--pf-grey-600)' }}
              className="p-2 hover:opacity-80"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Eligibility Stats Banner */}
          {hasGrades && stats && (
            <div
              className="mb-6 rounded-lg"
              style={{ padding: '16px', backgroundColor: 'var(--pf-teal-50)' }}
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
                  label={`${stats.total} Total`}
                  sub="All courses"
                  accent="var(--pf-teal-700)"
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

          {/* Search */}
          <div className="mb-6">
            <SearchBar
              placeholder="Search courses by name..."
              onSearch={setSearch}
              showSuggestions={false}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className="pf-input"
              style={{ width: 'auto' }}
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
              className="pf-input"
              style={{ width: 'auto' }}
            >
              <option value="">All Subjects</option>
              {subjectAreas?.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            {hasGrades && (
              <select
                value={eligibilityFilter}
                onChange={(e) => setEligibilityFilter(e.target.value as EligibilityFilter)}
                className="pf-input"
                style={{
                  width: 'auto',
                  backgroundColor: eligibilityFilter !== 'all' ? 'var(--pf-teal-50)' : 'var(--pf-white)',
                  borderColor: eligibilityFilter !== 'all' ? 'var(--pf-teal-500)' : 'var(--pf-grey-300)',
                }}
              >
                <option value="all">All Eligibility</option>
                <option value="eligible">Eligible Only</option>
                <option value="possible">Possible Only</option>
                <option value="below">Below Requirements</option>
              </select>
            )}

            {hasFilters && (
              <button onClick={clearFilters} className="pf-btn-ghost pf-btn-sm">
                Clear filters
              </button>
            )}

            <div className="flex-1" />

            {/* View Toggle */}
            <div
              className="flex items-center gap-1 rounded-lg"
              style={{ padding: '4px', backgroundColor: 'var(--pf-grey-100)' }}
            >
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className="p-2 rounded"
                style={{
                  backgroundColor: viewMode === 'grid' ? 'var(--pf-white)' : 'transparent',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  color: viewMode === 'grid' ? 'var(--pf-teal-700)' : 'var(--pf-grey-600)',
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
                className="p-2 rounded"
                style={{
                  backgroundColor: viewMode === 'list' ? 'var(--pf-white)' : 'transparent',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  color: viewMode === 'list' ? 'var(--pf-teal-700)' : 'var(--pf-grey-600)',
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
              {filteredCourses?.length || 0} courses found
              {hasFilters && ' matching your filters'}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div
            className="rounded-lg mb-6"
            style={{
              padding: '16px',
              backgroundColor: 'rgba(239,68,68,0.08)',
              color: 'var(--pf-red-500)',
            }}
          >
            Failed to load courses. Please try again.
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(9)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCourses?.length === 0 && (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--pf-teal-100)' }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: 'var(--pf-teal-700)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            <h3 style={{ marginBottom: '8px' }}>No courses found</h3>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
              {eligibilityFilter !== 'all'
                ? `No ${eligibilityFilter} courses match your current filters.`
                : 'Try adjusting your filters or search term.'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="pf-btn-primary">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Course Grid/List */}
        {!isLoading && filteredCourses && filteredCourses.length > 0 && (
          <>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {pagedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  eligibility={course.eligibility}
                  compact={viewMode === 'list'}
                  showSaveButton={!!user}
                  isSaved={isSaved(course.id)}
                  onSave={() => toggleSave(course.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Courses pagination"
                className="mt-8 flex items-center justify-between gap-4 flex-wrap"
              >
                <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                  Page{' '}
                  <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>{currentPage}</span>{' '}
                  of{' '}
                  <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>{totalPages}</span>
                  <span style={{ color: 'var(--pf-grey-600)' }}>
                    {' '}· {filteredCourses.length} results
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="pf-btn-secondary pf-btn-sm"
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
                    className="pf-btn-primary pf-btn-sm"
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
