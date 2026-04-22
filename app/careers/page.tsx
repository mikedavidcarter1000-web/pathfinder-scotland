'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCareerSectors, type CareerSectorWithCount } from '@/hooks/use-subjects'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { AiImpactBadge } from '@/components/ui/ai-impact-badge'
import { AI_IMPACT_META, isAiImpactRating, type AiImpactRating } from '@/lib/constants'
import { classifyError } from '@/lib/errors'
import {
  classifyRemoteWork,
  getCareerRealitiesBySectorName,
  type RemoteWorkClassification,
} from '@/data/career-realities'

type GrowthTone = 'growing' | 'stable' | 'variable'

function classifyGrowth(outlook: string | null | undefined): GrowthTone {
  if (!outlook) return 'stable'
  const lower = outlook.toLowerCase()
  if (lower.startsWith('strong growth') || lower.startsWith('growing') || lower.startsWith('fastest') || lower.startsWith('strong —') || lower.startsWith('recovering and growing')) {
    return 'growing'
  }
  if (lower.startsWith('changing')) return 'variable'
  return 'stable'
}

const GROWTH_BADGE: Record<GrowthTone, { label: string; bg: string; text: string }> = {
  growing: { label: 'Growing', bg: 'rgba(16, 185, 129, 0.12)', text: 'var(--pf-green-500)' },
  stable: { label: 'Stable', bg: 'rgba(245, 158, 11, 0.14)', text: 'var(--pf-amber-500)' },
  variable: { label: 'Variable', bg: 'var(--pf-grey-100)', text: 'var(--pf-grey-600)' },
}

type AiFilter = 'all' | AiImpactRating

const AI_FILTER_ORDER: AiFilter[] = ['all', 'human-centric', 'ai-augmented', 'ai-exposed']

const AI_RATING_SORT: Record<AiImpactRating, number> = {
  'human-centric': 1,
  'ai-augmented': 2,
  'ai-exposed': 3,
}

export default function CareersIndexPage() {
  const { data: sectors, isLoading, error, refetch } = useCareerSectors()
  const [search, setSearch] = useState('')
  const [aiFilter, setAiFilter] = useState<AiFilter>('all')
  const [sortByAi, setSortByAi] = useState(false)

  const filtered = useMemo(() => {
    if (!sectors) return []
    const needle = search.trim().toLowerCase()
    const bySearch = !needle
      ? sectors.slice()
      : sectors.filter((s) => {
          if (s.name.toLowerCase().includes(needle)) return true
          if (s.description?.toLowerCase().includes(needle)) return true
          const jobs = (s.example_jobs || []) as string[]
          if (jobs.some((job) => job.toLowerCase().includes(needle))) return true
          return false
        })

    const byAi =
      aiFilter === 'all'
        ? bySearch
        : bySearch.filter((s) => s.ai_impact_rating === aiFilter)

    if (sortByAi) {
      return byAi.slice().sort((a, b) => {
        const ra = isAiImpactRating(a.ai_impact_rating) ? AI_RATING_SORT[a.ai_impact_rating] : 99
        const rb = isAiImpactRating(b.ai_impact_rating) ? AI_RATING_SORT[b.ai_impact_rating] : 99
        if (ra !== rb) return ra - rb
        return a.name.localeCompare(b.name)
      })
    }

    return byAi
  }, [sectors, search, aiFilter, sortByAi])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <div className="mb-5 sm:mb-6">
            <h1 style={{ marginBottom: '4px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
              Explore Career Sectors
            </h1>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', maxWidth: '760px' }}>
              Discover 16 career areas and see which subjects, qualifications, and university
              courses lead there.
            </p>
          </div>

          {/* AI & Careers banner */}
          <Link
            href="/ai-careers"
            className="no-underline hover:no-underline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--pf-blue-100)',
              borderLeft: '4px solid var(--pf-blue-700)',
              color: 'var(--pf-blue-900)',
              marginBottom: '20px',
            }}
          >
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--pf-blue-700)',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--pf-blue-900)',
                  margin: 0,
                  marginBottom: '2px',
                }}
              >
                See how AI affects every career sector
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-blue-900)',
                  opacity: 0.85,
                  margin: 0,
                }}
              >
                A 1–10 rating for every job role, with research from Anthropic, OpenAI, and the
                World Economic Forum.
              </p>
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'var(--pf-blue-700)',
                whiteSpace: 'nowrap',
              }}
            >
              AI &amp; Careers →
            </span>
          </Link>

          {/* Compare careers banner */}
          <Link
            href="/careers/compare"
            className="no-underline hover:no-underline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 18px',
              borderRadius: '8px',
              backgroundColor: 'rgba(232, 89, 60, 0.10)',
              borderLeft: '4px solid #E8593C',
              color: 'var(--pf-grey-900)',
              marginBottom: '20px',
            }}
          >
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#E8593C',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="M7 14v4" />
                <path d="M12 9v9" />
                <path d="M17 4v14" />
              </svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--pf-grey-900)',
                  margin: 0,
                  marginBottom: '2px',
                }}
              >
                Compare careers side by side
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-700)',
                  margin: 0,
                }}
              >
                Pick up to three careers and see them compared across pay, hours, progression, and
                more.
              </p>
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#E8593C',
                whiteSpace: 'nowrap',
              }}
            >
              Compare →
            </span>
          </Link>

          {/* Search */}
          <label htmlFor="careers-search" className="sr-only">
            Search career sectors
          </label>
          <div className="relative" style={{ maxWidth: '520px' }}>
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
              id="careers-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by sector or job title (e.g. nurse, architect, engineer)"
              className="pf-input w-full"
              style={{ paddingLeft: '44px' }}
            />
          </div>

          {/* AI impact filter + sort */}
          <div
            className="flex flex-wrap items-center"
            style={{ marginTop: '16px', gap: '8px' }}
            role="group"
            aria-label="Filter by AI impact rating"
          >
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                marginRight: '4px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              AI impact:
            </span>
            {AI_FILTER_ORDER.map((key) => {
              const active = aiFilter === key
              const isAll = key === 'all'
              const meta = isAll ? null : AI_IMPACT_META[key]
              const label = isAll ? 'All' : meta!.label
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAiFilter(key)}
                  aria-pressed={active}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    border: active
                      ? '1px solid var(--pf-blue-700)'
                      : '1px solid var(--pf-grey-300)',
                    backgroundColor: active
                      ? isAll
                        ? 'var(--pf-blue-700)'
                        : meta!.bg
                      : 'var(--pf-white)',
                    color: active
                      ? isAll
                        ? 'var(--pf-white)'
                        : meta!.text
                      : 'var(--pf-grey-600)',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setSortByAi((v) => !v)}
              aria-pressed={sortByAi}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.75rem',
                border: sortByAi
                  ? '1px solid var(--pf-blue-700)'
                  : '1px solid var(--pf-grey-300)',
                backgroundColor: sortByAi ? 'var(--pf-blue-100)' : 'var(--pf-white)',
                color: sortByAi ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
                cursor: 'pointer',
                marginLeft: '8px',
              }}
            >
              {sortByAi ? 'Sorted by AI impact' : 'Sort by AI impact'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {isLoading && <SectorGridSkeleton />}

        {!isLoading && error && (
          <ErrorState
            title={classifyError(error).title}
            message="Couldn't load career sectors. Please try again."
            retryAction={() => refetch()}
          />
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="pf-card text-center" style={{ padding: '40px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
              No career sectors match &quot;{search}&quot;.
            </p>
            <button onClick={() => setSearch('')} className="pf-btn-ghost pf-btn-sm">
              Clear search
            </button>
          </div>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <>
            <div
              className="flex items-baseline justify-between"
              style={{ marginBottom: '16px' }}
            >
              <h2 style={{ fontSize: '1.125rem' }}>
                {search.trim() ? 'Matching sectors' : 'All sectors'}
              </h2>
              <span style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem' }}>
                {filtered.length} {filtered.length === 1 ? 'area' : 'areas'}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((sector) => (
                <SectorCard key={sector.id} sector={sector} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SectorCard({ sector }: { sector: CareerSectorWithCount }) {
  const tone = classifyGrowth(sector.growth_outlook)
  const growth = GROWTH_BADGE[tone]

  return (
    <Link
      href={`/careers/${sector.id}`}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full"
      style={{ padding: 0, overflow: 'hidden' }}
      aria-label={`View ${sector.name}`}
    >
      <div
        className="relative"
        style={{
          width: '100%',
          height: '160px',
          background:
            'linear-gradient(135deg, var(--pf-blue-100) 0%, var(--pf-blue-50) 100%)',
          overflow: 'hidden',
        }}
      >
        {sector.card_image_url ? (
          <Image
            src={sector.card_image_url}
            alt={`${sector.name} careers`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-10 h-10"
              style={{ color: 'var(--pf-blue-700)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1" style={{ padding: '20px 24px 24px' }}>

      <h3
        style={{
          fontSize: '1.0625rem',
          marginBottom: '8px',
          color: 'var(--pf-grey-900)',
        }}
      >
        {sector.name}
      </h3>

      {sector.description && (
        <p
          className="line-clamp-2"
          style={{
            color: 'var(--pf-grey-600)',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            marginBottom: '16px',
          }}
        >
          {sector.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: '12px' }}>
        <span className="pf-badge-blue">
          {sector.subject_count} {sector.subject_count === 1 ? 'subject' : 'subjects'}
        </span>
        <span
          className="inline-flex items-center"
          style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: growth.bg,
            color: growth.text,
          }}
        >
          {growth.label}
        </span>
        {isAiImpactRating(sector.ai_impact_rating) && (
          <AiImpactBadge
            rating={sector.ai_impact_rating}
            size="sm"
            showIcon={false}
            labelOverride={AI_IMPACT_META[sector.ai_impact_rating].label}
          />
        )}
        <WorkLocationBadge sectorName={sector.name} />
      </div>

      {sector.salary_range_entry && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
            marginBottom: '12px',
          }}
        >
          Entry level{' '}
          <span style={{ color: 'var(--pf-grey-900)', fontWeight: 500 }}>
            {sector.salary_range_entry}
          </span>
        </p>
      )}

      <div className="mt-auto">
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
          Explore
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
      </div>
    </Link>
  )
}

const WORK_LOCATION_META: Record<
  RemoteWorkClassification,
  { label: string; icon: 'building' | 'laptop' }
> = {
  'on-site': { label: 'Mostly on-site', icon: 'building' },
  hybrid: { label: 'Often hybrid', icon: 'laptop' },
}

function WorkLocationBadge({ sectorName }: { sectorName: string }) {
  const realities = getCareerRealitiesBySectorName(sectorName)
  if (!realities) return null
  const { label, icon } = WORK_LOCATION_META[classifyRemoteWork(realities.remoteHybrid)]
  return (
    <span
      className="inline-flex items-center"
      title={realities.remoteHybrid}
      style={{
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: 'var(--pf-grey-100)',
        color: 'var(--pf-grey-600)',
        gap: '5px',
      }}
    >
      {icon === 'building' ? (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="2" width="16" height="20" rx="1" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2" />
        </svg>
      ) : (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="12" rx="1" />
          <path d="M2 20h20" />
        </svg>
      )}
      {label}
    </span>
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
          <Skeleton width="40%" height={22} rounded="full" />
        </div>
      ))}
    </div>
  )
}
