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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-teal-50)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container" style={{ paddingTop: '40px', paddingBottom: '32px' }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 style={{ marginBottom: '4px' }}>Universities</h1>
              <p style={{ color: 'var(--pf-grey-600)' }}>
                Explore all 15 Scottish universities
              </p>
            </div>
            <Link
              href="/"
              style={{ color: 'var(--pf-grey-600)' }}
              className="p-2 hover:opacity-80"
              aria-label="Back to home"
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
              className="pf-input"
              style={{ width: 'auto' }}
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
              className="pf-input"
              style={{ width: 'auto' }}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="pf-btn-ghost pf-btn-sm">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* University Type Explainer */}
      <div className="pf-container" style={{ paddingTop: '24px' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(UNIVERSITY_TYPES).map(([key, value]) => {
            const active = typeFilter === key
            return (
              <button
                key={key}
                onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
                className="text-left transition-all rounded-lg"
                style={{
                  padding: '16px',
                  backgroundColor: active ? 'var(--pf-teal-50)' : 'var(--pf-white)',
                  border: active ? '2px solid var(--pf-teal-500)' : '1px solid var(--pf-grey-300)',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <span className="pf-badge-teal inline-flex" style={{ marginBottom: '8px' }}>
                  {value.label}
                </span>
                <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                  {value.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Results */}
      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        {/* Results Count */}
        <div className="mb-6">
          {isLoading ? (
            <div
              className="h-5 w-32 rounded animate-pulse"
              style={{ backgroundColor: 'var(--pf-grey-100)' }}
            />
          ) : (
            <p style={{ color: 'var(--pf-grey-600)' }}>
              {filteredUniversities?.length || 0} universities
              {hasFilters && ' matching your filters'}
            </p>
          )}
        </div>

        {error && (
          <div
            className="rounded-lg mb-6"
            style={{
              padding: '16px',
              backgroundColor: 'rgba(239,68,68,0.08)',
              color: 'var(--pf-red-500)',
            }}
          >
            Failed to load universities. Please try again.
          </div>
        )}

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <UniversityCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && filteredUniversities?.length === 0 && (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 style={{ marginBottom: '8px' }}>No universities found</h3>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
              Try adjusting your filters.
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="pf-btn-primary">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {!isLoading && filteredUniversities && filteredUniversities.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((university) => (
              <UniversityCard key={university.id} university={university} />
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <h2 style={{ marginBottom: '24px' }}>About Scottish Universities</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <InfoBlock title="Ancient Universities">
              Scotland is home to four of the UK&apos;s six ancient universities, founded before 1600.
              St Andrews (1413), Glasgow (1451), Aberdeen (1495), and Edinburgh (1582) are steeped
              in tradition and academic excellence.
            </InfoBlock>
            <InfoBlock title="Russell Group">
              Two Scottish universities — Edinburgh and Glasgow — are members of the Russell Group,
              a collective of 24 leading UK research universities committed to maintaining the
              highest standards of research and education.
            </InfoBlock>
            <InfoBlock title="Free Tuition">
              Scottish students studying at Scottish universities don&apos;t pay tuition fees. The
              Student Awards Agency Scotland (SAAS) covers tuition costs for eligible students.
            </InfoBlock>
            <InfoBlock title="Four-Year Degrees">
              Most Scottish undergraduate degrees are four years, compared to three years in England.
              This allows for a broader education and more time to specialise.
            </InfoBlock>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--pf-grey-600)', lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}
