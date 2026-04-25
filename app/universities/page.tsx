'use client'

import { useEffect, useState } from 'react'
import { useUniversitiesWithStats, useUniversityCities } from '@/hooks/use-universities'
import { UniversityCard } from '@/components/ui/university-card'
import { UniversityCardSkeleton } from '@/components/ui/loading-skeletons'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'
import { UNIVERSITY_TYPES } from '@/lib/constants'
import { trackEngagement } from '@/lib/engagement/track'

export default function UniversitiesPage() {
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [cityFilter, setCityFilter] = useState<string>('')

  const { data: universities, isLoading, error, refetch } = useUniversitiesWithStats()
  const cities = useUniversityCities()

  useAuthErrorRedirect([error])

  useEffect(() => {
    trackEngagement('page_view', 'university', null)
  }, [])

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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <div className="mb-5 sm:mb-6">
            <h1 style={{ marginBottom: '4px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Universities</h1>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
              {universities && universities.length > 0
                ? `Explore all ${universities.length} Scottish universities`
                : 'Explore Scottish universities'}
            </p>
          </div>

          {/* Filters — stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by university type"
              className="pf-input w-full sm:w-auto"
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
              aria-label="Filter by city"
              className="pf-input w-full sm:w-auto"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="pf-btn-ghost pf-btn-sm w-full sm:w-auto justify-center">
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
                  backgroundColor: active ? 'var(--pf-blue-50)' : 'var(--pf-white)',
                  border: active ? '2px solid var(--pf-blue-500)' : '1px solid var(--pf-grey-300)',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <span className="pf-badge-blue inline-flex" style={{ marginBottom: '8px' }}>
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
              {filteredUniversities?.length || 0} {(filteredUniversities?.length ?? 0) === 1 ? 'university' : 'universities'}
              {hasFilters && ' matching your filters'}
            </p>
          )}
        </div>

        {!isLoading && error && (
          <ErrorState
            title={classifyError(error).title}
            message="Something went wrong loading universities. Please try again."
            retryAction={() => refetch()}
          />
        )}

        {isLoading && (
          <>
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <UniversityCardSkeleton key={i} />
              ))}
            </div>
            <SlowLoadingNotice isLoading={isLoading} />
          </>
        )}

        {!isLoading && !error && filteredUniversities?.length === 0 && (
          <EmptyState
            icon={EmptyStateIcons.building}
            title="No universities found"
            message="Try adjusting your filters."
            actionLabel={hasFilters ? 'Clear all filters' : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        )}

        {!isLoading && !error && filteredUniversities && filteredUniversities.length > 0 && (
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((university) => (
              <UniversityCard key={university.id} university={university} />
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container py-12">
          <h2 style={{ marginBottom: '24px', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>About Scottish Universities</h2>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
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
