'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BursaryCard } from './bursary-card'
import { BursaryFilters } from './bursary-filters'
import {
  type Bursary,
  type BursaryMatch,
  type StudentMatchRow,
  type MatchStatus,
  type BrowseCategory,
  type StudentProfile,
  type BursaryFilterState,
  BROWSE_CATEGORY_LABELS,
  categoriseBursary,
  profileToFilters,
  emptyFilters,
  applyBursaryFilters,
} from './types'

interface BursariesClientProps {
  loggedIn: boolean
  bursaries: Bursary[]
  matches?: BursaryMatch[]
  matchStatuses?: StudentMatchRow[]
  missingProfile?: string[]
  matchError?: string | null
  studentProfile?: StudentProfile | null
}

function formatGbp(n: number): string {
  return `£${n.toLocaleString('en-GB')}`
}

function Hero({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section
      style={{
        backgroundColor: 'var(--pf-blue-50)',
        paddingTop: '64px',
        paddingBottom: '48px',
      }}
    >
      <div className="pf-container">
        <div style={{ maxWidth: '720px' }}>
          <span
            className="pf-badge-blue"
            style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '16px' }}
          >
            Bursary finder
          </span>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--pf-blue-900)',
              lineHeight: 1.1,
              marginTop: '16px',
              marginBottom: '16px',
            }}
          >
            Find funding you&rsquo;re eligible for
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--pf-grey-900)',
              lineHeight: 1.5,
              marginBottom: '24px',
            }}
          >
            We check your profile against every bursary, grant, and entitlement available to
            Scottish students &mdash; so you don&rsquo;t miss out.
          </p>
          {!loggedIn && (
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/auth/sign-in?redirect=/bursaries"
                className="pf-btn-primary no-underline hover:no-underline"
              >
                Sign in to see your personalised results
              </Link>
              <Link
                href="/auth/sign-up"
                className="pf-btn-secondary no-underline hover:no-underline"
              >
                Create free account
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function StatCards({
  totalValue,
  eligibleCount,
  checkCount,
}: {
  totalValue: number
  eligibleCount: number
  checkCount: number
}) {
  const cards = [
    {
      label: 'Potential annual value',
      value: totalValue > 0 ? formatGbp(totalValue) : '—',
      tone: 'blue' as const,
    },
    {
      label: 'Eligible',
      value: String(eligibleCount),
      tone: 'green' as const,
    },
    {
      label: 'To check',
      value: String(checkCount),
      tone: 'amber' as const,
    },
  ]

  const toneStyles: Record<
    'blue' | 'green' | 'amber',
    { bg: string; fg: string; label: string }
  > = {
    blue: { bg: 'var(--pf-blue-50)', fg: 'var(--pf-blue-700)', label: 'var(--pf-blue-700)' },
    green: { bg: 'rgba(16, 185, 129, 0.10)', fg: '#047857', label: '#047857' },
    amber: { bg: 'rgba(245, 158, 11, 0.12)', fg: '#B45309', label: '#B45309' },
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => {
        const s = toneStyles[c.tone]
        return (
          <div
            key={c.label}
            style={{
              backgroundColor: s.bg,
              borderRadius: '8px',
              padding: '20px 24px',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '1.75rem',
                color: s.fg,
                lineHeight: 1.1,
              }}
            >
              {c.value}
            </div>
            <div
              style={{
                fontSize: '0.8125rem',
                color: s.label,
                marginTop: '4px',
                fontWeight: 600,
              }}
            >
              {c.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SectionHeader({
  title,
  count,
  accent,
  subtitle,
}: {
  title: string
  count: number
  accent: string
  subtitle?: string
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div className="flex items-center gap-3 flex-wrap">
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.375rem',
            fontWeight: 700,
            color: 'var(--pf-grey-900)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <span
          className="pf-badge"
          style={{
            backgroundColor: accent,
            color: '#fff',
            fontWeight: 700,
            minWidth: '28px',
            justifyContent: 'center',
          }}
        >
          {count}
        </span>
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--pf-grey-600)',
            marginTop: '4px',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

function ProfileBanner({ missingProfile }: { missingProfile: string[] }) {
  if (missingProfile.length === 0) return null
  return (
    <div
      role="status"
      style={{
        backgroundColor: 'rgba(245, 158, 11, 0.10)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '8px',
        padding: '16px 20px',
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <strong
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.9375rem',
              color: '#78350F',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Your profile is incomplete &mdash; we may be missing bursaries you&rsquo;re eligible for.
          </strong>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '0.875rem',
              color: '#78350F',
              lineHeight: 1.6,
            }}
          >
            {missingProfile.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <Link
          href="/onboarding"
          className="pf-btn-primary pf-btn-sm no-underline hover:no-underline"
          style={{ flexShrink: 0 }}
        >
          Complete profile
        </Link>
      </div>
    </div>
  )
}

function BrowseView({ bursaries }: { bursaries: Bursary[] }) {
  const grouped = useMemo(() => {
    const groups: Record<BrowseCategory, Bursary[]> = {
      secondary: [],
      undergraduate: [],
      college: [],
      professional: [],
      charitable: [],
      universal: [],
    }
    for (const b of bursaries) {
      groups[categoriseBursary(b)].push(b)
    }
    return groups
  }, [bursaries])

  const order: BrowseCategory[] = [
    'secondary',
    'undergraduate',
    'college',
    'professional',
    'charitable',
    'universal',
  ]

  return (
    <div className="flex flex-col gap-4">
      {order.map((cat) => {
        const items = grouped[cat]
        if (items.length === 0) return null
        return (
          <details
            key={cat}
            open={cat === 'universal' || cat === 'secondary'}
            style={{
              backgroundColor: 'var(--pf-white)',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              padding: '20px 24px',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '1.125rem',
                color: 'var(--pf-grey-900)',
              }}
            >
              {BROWSE_CATEGORY_LABELS[cat]}{' '}
              <span
                style={{
                  fontWeight: 500,
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                }}
              >
                ({items.length})
              </span>
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {items.map((b) => (
                <BursaryCard key={b.id} bursary={b} />
              ))}
            </div>
          </details>
        )
      })}
    </div>
  )
}

export function BursariesClient({
  loggedIn,
  bursaries,
  matches = [],
  matchStatuses = [],
  missingProfile = [],
  matchError = null,
  studentProfile = null,
}: BursariesClientProps) {
  const [showDismissed, setShowDismissed] = useState(false)
  const [showOther, setShowOther] = useState(false)
  const [filters, setFilters] = useState<BursaryFilterState>(
    loggedIn && studentProfile ? profileToFilters(studentProfile) : emptyFilters()
  )

  const filteredBursaries = useMemo(
    () => applyBursaryFilters(bursaries, filters),
    [bursaries, filters]
  )

  const filteredBursaryIds = useMemo(
    () => new Set(filteredBursaries.map(b => b.id)),
    [filteredBursaries]
  )

  const bursaryById = useMemo(() => {
    const m = new Map<string, Bursary>()
    for (const b of bursaries) m.set(b.id, b)
    return m
  }, [bursaries])

  const statusById = useMemo(() => {
    const m = new Map<string, MatchStatus>()
    for (const r of matchStatuses) m.set(r.bursary_id, r.match_status)
    return m
  }, [matchStatuses])

  // Partition matched results by confidence and tracking status.
  const {
    definite,
    maybe,
    applied,
    dismissed,
    matchedIds,
  } = useMemo(() => {
    const definite: BursaryMatch[] = []
    const maybe: BursaryMatch[] = []
    const applied: BursaryMatch[] = []
    const dismissed: BursaryMatch[] = []
    const matchedIds = new Set<string>()
    for (const m of matches) {
      matchedIds.add(m.bursary_id)
      const status = statusById.get(m.bursary_id) ?? 'eligible'
      if (status === 'applied' || status === 'received') {
        applied.push(m)
        continue
      }
      if (status === 'dismissed') {
        dismissed.push(m)
        continue
      }
      if (m.match_confidence === 'definite') definite.push(m)
      else maybe.push(m)
    }
    return { definite, maybe, applied, dismissed, matchedIds }
  }, [matches, statusById])

  const otherBursaries = useMemo(
    () => bursaries.filter((b) => !matchedIds.has(b.id)),
    [bursaries, matchedIds]
  )

  // Sum up maximum annual value of confirmed (definite) matches only.
  const totalValue = useMemo(() => {
    let sum = 0
    for (const m of definite) {
      const b = bursaryById.get(m.bursary_id)
      if (b?.amount_max) sum += Number(b.amount_max)
    }
    return Math.round(sum)
  }, [definite, bursaryById])

  // --- Apply filters to matched sections ---
  const fDefinite = useMemo(
    () => definite.filter(m => filteredBursaryIds.has(m.bursary_id)),
    [definite, filteredBursaryIds]
  )
  const fMaybe = useMemo(
    () => maybe.filter(m => filteredBursaryIds.has(m.bursary_id)),
    [maybe, filteredBursaryIds]
  )
  const fApplied = useMemo(
    () => applied.filter(m => filteredBursaryIds.has(m.bursary_id)),
    [applied, filteredBursaryIds]
  )
  const fDismissed = useMemo(
    () => dismissed.filter(m => filteredBursaryIds.has(m.bursary_id)),
    [dismissed, filteredBursaryIds]
  )
  const fOther = useMemo(
    () => otherBursaries.filter(b => filteredBursaryIds.has(b.id)),
    [otherBursaries, filteredBursaryIds]
  )

  const renderCard = (m: BursaryMatch) => {
    const b = bursaryById.get(m.bursary_id)
    if (!b) return null
    return (
      <BursaryCard
        key={m.bursary_id}
        bursary={b}
        confidence={m.match_confidence}
        initialStatus={statusById.get(m.bursary_id) ?? 'eligible'}
        showActions
      />
    )
  }

  // --- Logged out: browse mode only ---
  if (!loggedIn) {
    return (
      <>
        <Hero loggedIn={false} />
        <section style={{ paddingTop: '32px', paddingBottom: '64px' }}>
          <div className="pf-container">
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--pf-grey-900)',
                marginBottom: '8px',
              }}
            >
              Browse all bursaries
            </h2>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-600)',
                marginBottom: '24px',
                maxWidth: '680px',
              }}
            >
              Sign in to see which of these you&rsquo;re eligible for based on your profile.
              Use the filters below to find bursaries relevant to you.
            </p>
            <div className="flex flex-col gap-6">
              <BursaryFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(emptyFilters())}
                isPersonalised={false}
                resultCount={filteredBursaries.length}
              />
              {filteredBursaries.length === 0 ? (
                <div
                  style={{
                    backgroundColor: 'var(--pf-white)',
                    borderRadius: '8px',
                    padding: '32px 24px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontSize: '1rem',
                      color: 'var(--pf-grey-600)',
                      lineHeight: 1.5,
                    }}
                  >
                    No matching bursaries found. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                <BrowseView bursaries={filteredBursaries} />
              )}
            </div>
          </div>
        </section>
      </>
    )
  }

  // --- Logged in: personalised results ---
  const hasAnyMatches = fDefinite.length + fMaybe.length + fApplied.length > 0

  return (
    <>
      <Hero loggedIn={true} />
      <section style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <div className="pf-container">
          <div className="flex flex-col gap-8">
            {matchError && (
              <div
                role="alert"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  color: '#991B1B',
                  fontSize: '0.875rem',
                }}
              >
                {matchError}
              </div>
            )}

            <StatCards
              totalValue={totalValue}
              eligibleCount={fDefinite.length}
              checkCount={fMaybe.length}
            />

            <ProfileBanner missingProfile={missingProfile} />

            <BursaryFilters
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(studentProfile ? profileToFilters(studentProfile) : emptyFilters())}
              isPersonalised={true}
              resultCount={fDefinite.length + fMaybe.length + fApplied.length + fOther.length}
            />

            {!hasAnyMatches && !matchError && (
              <div
                style={{
                  backgroundColor: 'var(--pf-white)',
                  borderRadius: '8px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                }}
              >
                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    lineHeight: 1.5,
                  }}
                >
                  We didn&rsquo;t find specific matches based on your current profile, but
                  here&rsquo;s what&rsquo;s available to all Scottish students.
                </p>
              </div>
            )}

            {fApplied.length > 0 && (
              <details open>
                <summary
                  style={{
                    cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--pf-blue-700)',
                    marginBottom: '12px',
                  }}
                >
                  Applied ({fApplied.length})
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {fApplied.map(renderCard)}
                </div>
              </details>
            )}

            {fDefinite.length > 0 && (
              <section>
                <SectionHeader
                  title="You're eligible"
                  count={fDefinite.length}
                  accent="#10B981"
                  subtitle="Your profile confirms you meet the eligibility criteria."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fDefinite.map(renderCard)}
                </div>
              </section>
            )}

            {fMaybe.length > 0 && (
              <section>
                <SectionHeader
                  title="You may be eligible"
                  count={fMaybe.length}
                  accent="#F59E0B"
                  subtitle="Check the criteria -- these depend on details we can't fully verify from your profile."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fMaybe.map(renderCard)}
                </div>
              </section>
            )}

            {fOther.length > 0 && (
              <section>
                <button
                  type="button"
                  onClick={() => setShowOther((v) => !v)}
                  className="flex items-center gap-2"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'var(--pf-blue-700)',
                    padding: '8px 0',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-expanded={showOther}
                >
                  Other support available ({fOther.length})
                  <svg
                    className={`w-4 h-4 transition-transform ${showOther ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--pf-grey-600)',
                    marginBottom: '12px',
                    marginTop: '-4px',
                  }}
                >
                  Worth browsing if you have circumstances you haven&rsquo;t added to your profile.
                </p>
                {showOther && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fOther.map((b) => (
                      <BursaryCard key={b.id} bursary={b} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {fDismissed.length > 0 && (
              <section>
                <button
                  type="button"
                  onClick={() => setShowDismissed((v) => !v)}
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-600)',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 0',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  aria-expanded={showDismissed}
                >
                  {showDismissed ? 'Hide' : 'Show'} dismissed ({fDismissed.length})
                </button>
                {showDismissed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {fDismissed.map(renderCard)}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
