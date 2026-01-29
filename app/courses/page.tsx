'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
  const { user } = useAuth()
  const gradeSummary = useGradeSummary()
  const [search, setSearch] = useState('')
  const [universityId, setUniversityId] = useState<string>('')
  const [subjectArea, setSubjectArea] = useState<string>('')
  const [eligibilityFilter, setEligibilityFilter] = useState<EligibilityFilter>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  const clearFilters = () => {
    setSearch('')
    setUniversityId('')
    setSubjectArea('')
    setEligibilityFilter('all')
  }

  const hasFilters = search || universityId || subjectArea || eligibilityFilter !== 'all'
  const hasGrades = gradeSummary.totalGrades > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600 mt-1">
                Explore thousands of courses across Scottish universities
              </p>
            </div>
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {/* Eligibility Stats Banner */}
          {hasGrades && stats && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stats.eligible} Eligible</p>
                    <p className="text-xs text-gray-500">Meet requirements</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stats.possible} Possible</p>
                    <p className="text-xs text-gray-500">Close to requirements</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stats.total} Total</p>
                    <p className="text-xs text-gray-500">All courses</p>
                  </div>
                </div>
                <div className="flex-1" />
                <p className="text-sm text-gray-600">
                  Based on your <span className="font-medium">{gradeSummary.highers || 'grades'}</span>
                </p>
              </div>
            </div>
          )}

          {/* No Grades Banner */}
          {user && !hasGrades && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    Add your grades to see which courses you&apos;re eligible for.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                >
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
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Subjects</option>
              {subjectAreas?.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            {/* Eligibility Filter */}
            {hasGrades && (
              <select
                value={eligibilityFilter}
                onChange={(e) => setEligibilityFilter(e.target.value as EligibilityFilter)}
                className={`px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  eligibilityFilter !== 'all' ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <option value="all">All Eligibility</option>
                <option value="eligible">Eligible Only</option>
                <option value="possible">Possible Only</option>
                <option value="below">Below Requirements</option>
              </select>
            )}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear filters
              </button>
            )}

            <div className="flex-1" />

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6">
          {isLoading ? (
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-gray-600">
              {filteredCourses?.length || 0} courses found
              {hasFilters && ' matching your filters'}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Failed to load courses. Please try again.</p>
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">
              {eligibilityFilter !== 'all'
                ? `No ${eligibilityFilter} courses match your current filters.`
                : 'Try adjusting your filters or search term.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Course Grid/List */}
        {!isLoading && filteredCourses && filteredCourses.length > 0 && (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredCourses.map((course) => (
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
        )}
      </div>
    </div>
  )
}
