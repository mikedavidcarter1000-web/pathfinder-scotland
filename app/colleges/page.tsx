'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useColleges } from '@/hooks/use-colleges'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'
import { trackEngagement } from '@/lib/engagement/track'
import type { Tables } from '@/types/database'

type College = Tables<'colleges'>

const REGIONS = [
  'Aberdeen and Aberdeenshire',
  'Ayrshire',
  'Dumfries and Galloway',
  'Edinburgh and Lothians',
  'Fife',
  'Forth Valley',
  'Glasgow',
  'Highlands and Islands',
  'Lanarkshire',
  'Scottish Borders',
  'Tayside',
  'West of Scotland',
]

export default function CollegesPage() {
  const [regionFilter, setRegionFilter] = useState('')
  const [swapFilter, setSwapFilter] = useState(false)
  const [uhiFilter, setUhiFilter] = useState(false)
  const [faFilter, setFaFilter] = useState(false)
  const [schoolsFilter, setSchoolsFilter] = useState(false)
  const [search, setSearch] = useState('')

  const { data: colleges, isLoading, error, refetch } = useColleges()

  useAuthErrorRedirect([error])

  useEffect(() => {
    trackEngagement('page_view', 'college', null)
  }, [])

  // Client-side filtering to support search across name + course_areas
  const filteredColleges = useMemo(() => {
    if (!colleges) return []
    return colleges.filter((c) => {
      if (regionFilter && c.region !== regionFilter) return false
      if (swapFilter && !c.has_swap) return false
      if (uhiFilter && !c.uhi_partner) return false
      if (faFilter && !c.has_foundation_apprenticeships) return false
      if (schoolsFilter && !c.schools_programme) return false
      if (search.trim()) {
        const needle = search.trim().toLowerCase()
        const nameMatch = c.name.toLowerCase().includes(needle)
        const areaMatch = c.course_areas?.some((a) =>
          a.toLowerCase().includes(needle)
        )
        if (!nameMatch && !areaMatch) return false
      }
      return true
    })
  }, [colleges, regionFilter, swapFilter, uhiFilter, faFilter, schoolsFilter, search])

  const hasFilters = regionFilter || swapFilter || uhiFilter || faFilter || schoolsFilter || search.trim()

  const clearFilters = () => {
    setRegionFilter('')
    setSwapFilter(false)
    setUhiFilter(false)
    setFaFilter(false)
    setSchoolsFilter(false)
    setSearch('')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Hero */}
      <div style={{ backgroundColor: 'var(--pf-blue-900)' }}>
        <div className="pf-container" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div style={{ maxWidth: '640px' }}>
              <h1 style={{ color: '#fff', marginBottom: '12px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
                Scottish Colleges
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                24 colleges across Scotland offering hundreds of courses, apprenticeships,
                and direct routes into university
              </p>
            </div>
            {/* Visual element — geometric college pathway illustration */}
            <div
              className="hidden md:flex items-center justify-center flex-shrink-0"
              style={{ width: '200px', height: '140px' }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                {/* College building */}
                <rect x="20" y="60" width="60" height="50" rx="4" fill="rgba(255,255,255,0.15)" />
                <rect x="35" y="70" width="12" height="14" rx="2" fill="rgba(255,255,255,0.25)" />
                <rect x="53" y="70" width="12" height="14" rx="2" fill="rgba(255,255,255,0.25)" />
                <rect x="40" y="90" width="20" height="20" rx="2" fill="rgba(255,255,255,0.2)" />
                <polygon points="50,40 15,60 85,60" fill="rgba(255,255,255,0.2)" />
                {/* Arrow path */}
                <path d="M85 85 L115 85" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 3" />
                <path d="M115 80 L125 85 L115 90" fill="rgba(255,255,255,0.4)" />
                {/* University building */}
                <rect x="130" y="50" width="55" height="60" rx="4" fill="rgba(255,255,255,0.2)" />
                <rect x="140" y="62" width="10" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
                <rect x="155" y="62" width="10" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
                <rect x="170" y="62" width="10" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
                <rect x="147" y="84" width="22" height="26" rx="2" fill="rgba(255,255,255,0.25)" />
                <polygon points="157,30 125,50 190,50" fill="rgba(255,255,255,0.25)" />
                {/* Graduation cap on top */}
                <rect x="148" y="22" width="18" height="4" rx="1" fill="rgba(255,255,255,0.35)" />
                <polygon points="157,14 143,24 171,24" fill="rgba(255,255,255,0.35)" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ backgroundColor: 'var(--pf-white)', borderBottom: '1px solid var(--pf-grey-100)' }}>
        <div className="pf-container py-4">
          <div className="flex flex-col gap-3">
            {/* Row 1: region + search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                aria-label="Filter by region"
                className="pf-input w-full sm:w-auto"
              >
                <option value="">All Regions</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <div className="relative flex-1">
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
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search colleges by name or course area..."
                  className="pf-input w-full"
                  style={{ paddingLeft: '44px' }}
                  aria-label="Search colleges"
                />
              </div>
            </div>

            {/* Row 2: toggle filters */}
            <div className="flex flex-wrap gap-2">
              <ToggleButton active={swapFilter} onClick={() => setSwapFilter(!swapFilter)}>
                SWAP colleges
              </ToggleButton>
              <ToggleButton active={uhiFilter} onClick={() => setUhiFilter(!uhiFilter)}>
                UHI partners
              </ToggleButton>
              <ToggleButton active={faFilter} onClick={() => setFaFilter(!faFilter)}>
                Has Foundation Apprenticeships
              </ToggleButton>
              <ToggleButton active={schoolsFilter} onClick={() => setSchoolsFilter(!schoolsFilter)}>
                Schools programmes
              </ToggleButton>

              {hasFilters && (
                <button onClick={clearFilters} className="pf-btn-ghost pf-btn-sm">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        {/* Results count */}
        <div className="mb-6">
          {isLoading ? (
            <div
              className="h-5 w-40 rounded animate-pulse"
              style={{ backgroundColor: 'var(--pf-grey-100)' }}
            />
          ) : (
            <p style={{ color: 'var(--pf-grey-600)' }}>
              {filteredColleges.length} {filteredColleges.length === 1 ? 'college' : 'colleges'}
              {hasFilters && ' matching your filters'}
            </p>
          )}
        </div>

        {!isLoading && error && (
          <ErrorState
            title={classifyError(error).title}
            message="Something went wrong loading colleges. Please try again."
            retryAction={() => refetch()}
          />
        )}

        {isLoading && (
          <>
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <CollegeCardSkeleton key={i} />
              ))}
            </div>
            <SlowLoadingNotice isLoading={isLoading} />
          </>
        )}

        {!isLoading && !error && filteredColleges.length === 0 && (
          <EmptyState
            icon={EmptyStateIcons.building}
            title="No colleges found"
            message="Try adjusting your filters or search term."
            actionLabel={hasFilters ? 'Clear all filters' : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        )}

        {!isLoading && !error && filteredColleges.length > 0 && (
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
            {filteredColleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container py-12">
          <h2 style={{ marginBottom: '24px', fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>
            About Scottish Colleges
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <InfoBlock title="Routes to University">
              Many college HNC and HND qualifications articulate directly into year 2 or 3
              of a university degree. This is one of the most cost-effective routes to a
              degree in Scotland.
            </InfoBlock>
            <InfoBlock title="SWAP Access">
              SWAP (Scottish Wider Access Programme) offers free access courses for adults
              (typically 18+) without traditional qualifications, leading to guaranteed
              university interviews upon completion.
            </InfoBlock>
            <InfoBlock title="Free Tuition">
              Full-time further education courses at Scottish colleges are free for eligible
              Scottish students. Many students also receive bursary support for living costs.
            </InfoBlock>
            <InfoBlock title="Apprenticeships">
              Colleges deliver Foundation Apprenticeships for school pupils (S4-S6) and
              Modern Apprenticeships that combine paid work with college study.
            </InfoBlock>
          </div>
        </div>
      </div>
    </div>
  )
}

function CollegeCard({ college }: { college: College }) {
  const MAX_PILLS = 8
  const areas = college.course_areas || []
  const visibleAreas = areas.slice(0, MAX_PILLS)
  const remaining = areas.length - MAX_PILLS

  return (
    <Link
      href={`/colleges/${college.id}`}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full"
      style={{ padding: 0, overflow: 'hidden' }}
      aria-label={`View ${college.name}`}
    >
      {/* Campus image / gradient placeholder */}
      <div
        className="relative"
        style={{
          height: '160px',
          background:
            'linear-gradient(135deg, var(--pf-blue-100) 0%, var(--pf-blue-50) 100%)',
          overflow: 'hidden',
        }}
      >
        {college.card_image_url ? (
          <Image
            src={college.card_image_url}
            alt={`${college.name} campus`}
            width={640}
            height={400}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="w-full h-full"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="rounded-lg flex items-center justify-center"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--pf-white)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.75rem',
                  color: 'var(--pf-blue-700)',
                }}
              >
                {college.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '24px' }} className="flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-3">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.125rem',
              color: 'var(--pf-grey-900)',
              marginBottom: '6px',
              lineHeight: 1.3,
            }}
          >
            {college.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1"
              style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {college.city}, {college.region}
            </span>
            {college.student_count && (
              <span style={{ color: 'var(--pf-grey-600)', fontSize: '0.8125rem' }}>
                · {college.student_count.toLocaleString()} students
              </span>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {college.has_swap && (
            <span className="pf-badge-amber" title="SWAP (Scottish Wider Access Programme) — free access courses for adults without traditional qualifications, leading to guaranteed university interviews">
              {college.swap_hub ? `SWAP ${college.swap_hub}` : 'SWAP'}
            </span>
          )}
          {college.uhi_partner && (
            <span className="pf-badge-blue">UHI Partner</span>
          )}
          {college.schools_programme && (
            <span className="pf-badge-green">Schools Programme</span>
          )}
          {college.has_foundation_apprenticeships && (
            <span className="pf-badge-blue">Foundation Apprenticeships</span>
          )}
        </div>

        {/* Course area pills */}
        {visibleAreas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {visibleAreas.map((area) => (
              <span
                key={area}
                className="pf-badge-grey"
              >
                {area}
              </span>
            ))}
            {remaining > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--pf-grey-100)',
                  color: 'var(--pf-grey-600)',
                }}
              >
                +{remaining} more
              </span>
            )}
          </div>
        )}

        {/* Distinctive features */}
        {college.distinctive_features && (
          <p
            className="line-clamp-2 mb-3"
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
            }}
          >
            {college.distinctive_features}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto">
          <span
            className="flex w-full items-center justify-center gap-1"
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
            View college
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

function CollegeCardSkeleton() {
  return (
    <div className="pf-card" style={{ padding: '24px' }}>
      <Skeleton width="70%" height={22} rounded="sm" />
      <div style={{ height: '8px' }} />
      <Skeleton width="50%" height={16} rounded="sm" />
      <div style={{ height: '12px' }} />
      <div className="flex gap-2">
        <Skeleton width={70} height={22} rounded="full" />
        <Skeleton width={80} height={22} rounded="full" />
      </div>
      <div style={{ height: '12px' }} />
      <div className="flex flex-wrap gap-1.5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} width={60 + i * 10} height={22} rounded="full" />
        ))}
      </div>
      <div style={{ height: '16px' }} />
      <Skeleton width="100%" height={40} rounded="md" />
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '6px 14px',
        borderRadius: '9999px',
        fontSize: '0.8125rem',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        border: active ? '2px solid var(--pf-blue-700)' : '1px solid var(--pf-grey-300)',
        backgroundColor: active ? 'var(--pf-blue-100)' : 'var(--pf-white)',
        color: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-900)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        minHeight: '36px',
      }}
    >
      {children}
    </button>
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
