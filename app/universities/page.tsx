'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUniversitiesWithStats, useUniversityCities } from '@/hooks/use-universities'
import { UniversityCard } from '@/components/ui/university-card'
import { UniversityCardSkeleton } from '@/components/ui/loading-skeletons'
import { UNIVERSITY_TYPES } from '@/lib/constants'

export default function UniversitiesPage() {
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [cityFilter, setCityFilter] = useState<string>('')

  const { data: universities, isLoading, error } = useUniversitiesWithStats()
  const cities = useUniversityCities()

  const filteredUniversities = universities?.filter((uni) => {
    if (typeFilter && uni.type !== typeFilter) return false
    if (cityFilter && uni.city !== cityFilter) return false
    return true
  })

  const clearFilters = () => {
    setTypeFilter('')
    setCityFilter('')
  }

  const hasFilters = typeFilter || cityFilter

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
              <p className="text-gray-600 mt-1">
                Explore all 15 Scottish universities
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

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {Object.entries(UNIVERSITY_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* University Type Explainer */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(UNIVERSITY_TYPES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
              className={`p-4 rounded-xl border text-left transition-all ${
                typeFilter === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                key === 'ancient' ? 'bg-purple-100 text-purple-700' :
                key === 'traditional' ? 'bg-blue-100 text-blue-700' :
                key === 'modern' ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {value.label}
              </span>
              <p className="text-sm text-gray-600">{value.description}</p>
            </button>
          ))}
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
              {filteredUniversities?.length || 0} universities
              {hasFilters && ' matching your filters'}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Failed to load universities. Please try again.</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <UniversityCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredUniversities?.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No universities found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters.
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

        {/* University Grid */}
        {!isLoading && filteredUniversities && filteredUniversities.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((university) => (
              <UniversityCard
                key={university.id}
                university={university}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About Scottish Universities</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ancient Universities</h3>
              <p className="text-gray-600 mb-4">
                Scotland is home to four of the UK&apos;s six ancient universities, founded before 1600.
                St Andrews (1413), Glasgow (1451), Aberdeen (1495), and Edinburgh (1582) are
                steeped in tradition and academic excellence.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Russell Group</h3>
              <p className="text-gray-600 mb-4">
                Two Scottish universities - Edinburgh and Glasgow - are members of the Russell Group,
                a collective of 24 leading UK research universities committed to maintaining the
                highest standards of research and education.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Tuition</h3>
              <p className="text-gray-600 mb-4">
                Scottish students studying at Scottish universities don&apos;t pay tuition fees.
                The Student Awards Agency Scotland (SAAS) covers tuition costs for eligible students.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Four-Year Degrees</h3>
              <p className="text-gray-600 mb-4">
                Most Scottish undergraduate degrees are four years, compared to three years in
                England. This allows for a broader education and more time to specialise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
