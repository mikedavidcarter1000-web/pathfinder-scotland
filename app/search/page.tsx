'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSearch } from '@/hooks/use-search'
import { CourseCard } from '@/components/ui/course-card'
import { UniversityCard } from '@/components/ui/university-card'

type SearchTab = 'all' | 'courses' | 'universities'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<SearchTab>('all')

  const { data, isLoading, error } = useSearch(query, {
    enabled: query.length >= 2,
  })

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const courses = data?.courses || []
  const universities = data?.universities || []

  const totalResults = courses.length + universities.length

  const tabs: { id: SearchTab; label: string; count: number }[] = [
    { id: 'all', label: 'All Results', count: totalResults },
    { id: 'courses', label: 'Courses', count: courses.length },
    { id: 'universities', label: 'Universities', count: universities.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, universities, subjects..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          {query.length >= 2 && (
            <div className="flex gap-1 mt-4 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {query.length < 2 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Search Pathfinder</h2>
            <p className="text-gray-600">
              Enter at least 2 characters to search courses and universities.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-6 w-64 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-48 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Search Error</h2>
            <p className="text-gray-600">Something went wrong. Please try again.</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find anything matching &quot;{query}&quot;.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/courses"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse all courses
              </Link>
              <Link
                href="/universities"
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                View universities
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Courses Section */}
            {(activeTab === 'all' || activeTab === 'courses') && courses.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Courses ({courses.length})
                    </h2>
                    {courses.length > 3 && (
                      <button
                        onClick={() => setActiveTab('courses')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all
                      </button>
                    )}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  {(activeTab === 'all' ? courses.slice(0, 4) : courses).map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}

            {/* Universities Section */}
            {(activeTab === 'all' || activeTab === 'universities') && universities.length > 0 && (
              <section>
                {activeTab === 'all' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Universities ({universities.length})
                    </h2>
                    {universities.length > 3 && (
                      <button
                        onClick={() => setActiveTab('universities')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all
                      </button>
                    )}
                  </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(activeTab === 'all' ? universities.slice(0, 3) : universities).map((uni) => (
                    <UniversityCard key={uni.id} university={uni} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
