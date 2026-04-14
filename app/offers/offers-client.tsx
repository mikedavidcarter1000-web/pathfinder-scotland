'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { OfferCategory, OfferWithCategory } from '@/types/offers'
import type { Tables } from '@/types/database'
import { OfferCard } from '@/components/offers/offer-card'
import {
  OfferFilters,
  stageFilterToApi,
  type StageFilterValue,
} from '@/components/offers/offer-filters'

interface OffersClientProps {
  offers: OfferWithCategory[]
  categories: OfferCategory[]
  student: Tables<'students'> | null
  initialCategory?: string
  initialSearch?: string
}

const PAGE_SIZE = 24

// Map current month -> seasonal tag and friendly heading.
// Returns null when there's no active season (e.g. early/mid autumn, mid spring).
function getCurrentSeason(now: Date): { tag: string; heading: string; subtitle: string } | null {
  const month = now.getMonth() // 0 = Jan, 11 = Dec
  if (month === 7 || month === 8) {
    return {
      tag: 'freshers',
      heading: 'Freshers Essentials',
      subtitle: 'Kit yourself out for starting uni or college this autumn.',
    }
  }
  if (month >= 4 && month <= 5) {
    return {
      tag: 'exam-season',
      heading: 'Exam Season Support',
      subtitle: 'Free resources and discounts to help you through revision.',
    }
  }
  if (month >= 5 && month <= 7) {
    return {
      tag: 'summer',
      heading: 'Summer Offers',
      subtitle: 'Student discounts to make the summer stretch further.',
    }
  }
  if (month === 10 || month === 11) {
    return {
      tag: 'winter',
      heading: 'Winter Deals',
      subtitle: 'Warm clothes, festive deals, and Christmas savings.',
    }
  }
  return null
}

export function OffersClient({
  offers,
  categories,
  student,
  initialCategory,
  initialSearch,
}: OffersClientProps) {
  const searchParams = useSearchParams()

  // Live state comes from the URL so changing filters is shareable/bookmarkable.
  const urlCategory = searchParams.get('category') ?? initialCategory ?? 'all'
  const urlStage = (searchParams.get('stage') ?? '') as StageFilterValue
  const urlSearch = searchParams.get('q') ?? initialSearch ?? ''
  const urlPage = parseInt(searchParams.get('page') ?? '1', 10)

  const effectiveStage: StageFilterValue = urlStage

  const [visibleCount, setVisibleCount] = useState<number>(
    Math.max(PAGE_SIZE, urlPage * PAGE_SIZE)
  )

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [urlCategory, effectiveStage, urlSearch])

  // In-memory filtering over the full offers list (~62 offers; small enough).
  const filteredOffers = useMemo(() => {
    const apiStage = stageFilterToApi(effectiveStage)
    const q = urlSearch.trim().toLowerCase()

    return offers.filter((o) => {
      if (urlCategory !== 'all' && o.category?.slug !== urlCategory) return false
      if (apiStage) {
        // Match any stage inside the selected band
        const band = bandForStageFilter(effectiveStage)
        if (!o.eligible_stages.some((s) => band.includes(s))) return false
      }
      if (q) {
        const hay = [o.title, o.summary ?? '', o.description ?? '', o.brand ?? '']
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [offers, urlCategory, effectiveStage, urlSearch])

  // Split into featured, seasonal, and regular — featured first, seasonal second,
  // then everything else (excluding duplicates).
  const now = new Date()
  const season = getCurrentSeason(now)

  const featuredOffers = useMemo(() => {
    const today = now.toISOString().slice(0, 10)
    return filteredOffers.filter(
      (o) => o.is_featured && (!o.featured_until || o.featured_until >= today)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredOffers])

  const seasonalOffers = useMemo(() => {
    if (!season) return []
    return filteredOffers.filter((o) => o.seasonal_tags?.includes(season.tag))
  }, [filteredOffers, season])

  const featuredIds = new Set(featuredOffers.map((o) => o.id))
  const seasonalIds = new Set(seasonalOffers.map((o) => o.id))

  const regularOffers = useMemo(
    () =>
      filteredOffers.filter(
        (o) => !featuredIds.has(o.id) && !seasonalIds.has(o.id)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredOffers, featuredOffers, seasonalOffers]
  )

  const visibleRegular = regularOffers.slice(0, visibleCount)
  const hasMore = visibleRegular.length < regularOffers.length

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          paddingTop: '40px',
          paddingBottom: '40px',
        }}
      >
        <div className="pf-container">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3">
              <div
                className="pf-badge-blue inline-flex mb-3"
                style={{ fontWeight: 600 }}
              >
                {offers.length}+ student offers
              </div>
              <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}>
                Student Offers &amp; Entitlements
              </h1>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  maxWidth: '640px',
                }}
              >
                Discounts, freebies, and money you&apos;re entitled to — filtered by your
                stage, so you only see what applies to you.
              </p>
              {!student && (
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    color: 'var(--pf-blue-700)',
                    fontSize: '0.9375rem',
                  }}
                >
                  <Link
                    href="/auth/sign-in?redirect=/offers"
                    style={{ color: 'var(--pf-blue-700)', textDecoration: 'underline' }}
                  >
                    Sign in
                  </Link>{' '}
                  to save offers and auto-filter by your stage.
                </p>
              )}
            </div>
            <div className="lg:col-span-2" aria-hidden="true">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <OfferFilters
        categories={categories}
        initialCategory={urlCategory}
        initialStage={effectiveStage}
        initialSearch={urlSearch}
      />

      {/* Featured */}
      {featuredOffers.length > 0 && (
        <section
          style={{
            backgroundColor: 'var(--pf-blue-50)',
            padding: '40px 0',
          }}
        >
          <div className="pf-container">
            <div className="mb-5">
              <h2 style={{ marginBottom: '4px', fontSize: '1.5rem' }}>Featured offers</h2>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  maxWidth: '640px',
                  margin: 0,
                }}
              >
                Highlighted offers worth a look right now.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredOffers.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seasonal */}
      {season && seasonalOffers.length > 0 && (
        <section style={{ padding: '40px 0', backgroundColor: 'var(--pf-white)' }}>
          <div className="pf-container">
            <div className="mb-5">
              <h2 style={{ marginBottom: '4px', fontSize: '1.5rem' }}>{season.heading}</h2>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  maxWidth: '640px',
                  margin: 0,
                }}
              >
                {season.subtitle}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {seasonalOffers.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main grid */}
      <section style={{ padding: '40px 0' }}>
        <div className="pf-container">
          <div className="mb-5 flex items-baseline justify-between gap-3 flex-wrap">
            <h2 style={{ marginBottom: '4px', fontSize: '1.5rem' }}>
              {featuredOffers.length > 0 || seasonalOffers.length > 0 ? 'All offers' : 'Browse offers'}
            </h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
              {filteredOffers.length} result{filteredOffers.length === 1 ? '' : 's'}
            </span>
          </div>

          {regularOffers.length === 0 ? (
            <EmptyState hasAnyResults={filteredOffers.length > 0} />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleRegular.map((o) => (
                  <OfferCard key={o.id} offer={o} />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="pf-btn-secondary"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Cross-links */}
      <section style={{ backgroundColor: 'var(--pf-grey-100)', padding: '40px 0' }}>
        <div className="pf-container">
          <div className="grid md:grid-cols-3 gap-4">
            <CrossLinkCard
              href="/benefits"
              title="Student benefits"
              description="Government schemes, bus passes, and NHS entitlements."
            />
            <CrossLinkCard
              href="/bursaries"
              title="Bursaries & funding"
              description="Grants, bursaries, and scholarships you could apply for."
            />
            <CrossLinkCard
              href="/widening-access"
              title="Widening access"
              description="Reduced entry grades and guaranteed offers for eligible students."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function bandForStageFilter(stage: StageFilterValue): string[] {
  switch (stage) {
    case 's1_s4':
      return ['s1', 's2', 's3', 's4']
    case 's5_s6':
      return ['s5', 's6']
    case 'college':
      return ['college']
    case 'undergraduate':
      return ['undergraduate']
    case 'postgraduate':
      return ['postgraduate']
    default:
      return []
  }
}

function EmptyState({ hasAnyResults }: { hasAnyResults: boolean }) {
  return (
    <div
      className="pf-card text-center"
      style={{
        maxWidth: '480px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '40px 24px',
      }}
    >
      <h3 style={{ marginBottom: '6px' }}>
        {hasAnyResults ? 'Nothing left after filters' : 'No matching offers'}
      </h3>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', marginBottom: '12px' }}>
        Try removing a filter or broadening your search.
      </p>
      <Link
        href="/offers"
        style={{
          color: 'var(--pf-blue-500)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        Clear all filters
      </Link>
    </div>
  )
}

function CrossLinkCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="pf-card-hover no-underline hover:no-underline"
      style={{ display: 'block' }}
    >
      <h3 style={{ fontSize: '1.0625rem', marginBottom: '6px', color: 'var(--pf-grey-900)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
        {description}
      </p>
      <span
        style={{
          color: 'var(--pf-blue-500)',
          fontSize: '0.8125rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
        }}
      >
        Open →
      </span>
    </Link>
  )
}

function HeroVisual() {
  return (
    <svg viewBox="0 0 360 260" className="w-full h-auto" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="offers-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0072CE" />
          <stop offset="100%" stopColor="#002D72" />
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="160" height="80" rx="10" fill="url(#offers-g1)" />
      <rect x="180" y="12" width="170" height="80" rx="10" fill="#E0EDF7" />
      <rect x="12" y="100" width="96" height="68" rx="10" fill="#005EB8" />
      <rect x="116" y="100" width="118" height="68" rx="10" fill="#E0EDF7" />
      <rect x="242" y="100" width="108" height="68" rx="10" fill="#0072CE" />
      <rect x="12" y="176" width="338" height="72" rx="10" fill="#F0F5FA" stroke="#0072CE" />
      <text x="30" y="48" fill="#fff" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="18">
        Free
      </text>
      <text x="30" y="72" fill="#fff" fontFamily="Inter, sans-serif" fontSize="11" opacity="0.9">
        bus travel under 22
      </text>
      <text x="200" y="48" fill="#002D72" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="16">
        £30/week
      </text>
      <text x="200" y="72" fill="#002D72" fontFamily="Inter, sans-serif" fontSize="11">
        EMA for 16-19s
      </text>
      <text x="30" y="140" fill="#fff" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="16">
        50% off
      </text>
      <text x="130" y="140" fill="#002D72" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="16">
        ScotRail
      </text>
      <text x="258" y="140" fill="#fff" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="16">
        UNiDAYS
      </text>
      <text x="32" y="218" fill="#002D72" fontFamily="'Space Grotesk', sans-serif" fontWeight="600" fontSize="13">
        + dozens more brands &amp; entitlements
      </text>
    </svg>
  )
}
