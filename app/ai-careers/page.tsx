'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  useAiCareersHubData,
  type CareerRole,
  type CareerSector,
} from '@/hooks/use-subjects'
import {
  AI_ROLE_SOURCE,
  AI_ROLE_TIER_META,
  ROBOTICS_ROLE_SOURCE,
  getAiRoleTier,
  type AiRoleTier,
} from '@/lib/constants'
import { AiRoleBadge } from '@/components/ui/ai-role-badge'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { classifyError } from '@/lib/errors'

type TierFilter = 'all' | 'resilient' | 'evolving' | 'transforming' | 'new'
type Horizon = 'near' | 'long'
type Metric = 'ai' | 'robotics'

function pickRating(role: CareerRole, metric: Metric, horizon: Horizon): number | null {
  if (metric === 'ai') {
    return horizon === 'near' ? role.ai_rating_2030_2035 : role.ai_rating_2040_2045
  }
  return horizon === 'near' ? role.robotics_rating_2030_2035 : role.robotics_rating_2040_2045
}

export default function AiCareersPage() {
  const { data, isLoading, error, refetch } = useAiCareersHubData()
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [horizon, setHorizon] = useState<Horizon>('near')
  const [expandedSectorIds, setExpandedSectorIds] = useState<Set<string>>(new Set())

  const sectors = data?.sectors ?? []
  const allRoles = data?.allRoles ?? []
  const rolesBySector = data?.rolesBySector ?? new Map<string, CareerRole[]>()

  // Per-metric sector lists with horizon-aware averages. Both panels read
  // from the same sector pool; the metric and horizon determine which rating
  // column drives the average and the badges inside.
  const buildSectorsWithRoles = (metric: Metric) =>
    sectors
      .map((sector) => {
        const sectorRoles = rolesBySector.get(sector.id) ?? []
        const rated = sectorRoles
          .map((r) => pickRating(r, metric, horizon))
          .filter((v): v is number => v != null)
        const avg = rated.length > 0 ? rated.reduce((a, b) => a + b, 0) / rated.length : null
        return { sector, roles: sectorRoles, avg }
      })
      .filter((s) => s.roles.length > 0)

  const aiSectorsWithRoles = useMemo(
    () => buildSectorsWithRoles('ai'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sectors, rolesBySector, horizon],
  )
  const roboticsSectorsWithRoles = useMemo(
    () => buildSectorsWithRoles('robotics'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sectors, rolesBySector, horizon],
  )

  // Search/filter operates on AI ratings at the selected horizon. The
  // "New AI roles" chip remains AI-only (there is no is_new_robotics_role
  // column in the schema).
  const filteredRoles = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return allRoles.filter((role) => {
      if (needle) {
        const haystack = `${role.title} ${role.sector_name}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      const rating = pickRating(role, 'ai', horizon)
      if (tierFilter === 'new') return role.is_new_ai_role === true
      if (tierFilter === 'resilient') return rating != null && rating <= 3 && !role.is_new_ai_role
      if (tierFilter === 'evolving')
        return rating != null && rating >= 4 && rating <= 6 && !role.is_new_ai_role
      if (tierFilter === 'transforming') return rating != null && rating >= 7
      return true
    })
  }, [allRoles, search, tierFilter, horizon])

  const toggleSector = (id: string) => {
    setExpandedSectorIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Subjects that link the most resilient roles. Computed against the role
  // list rather than fetching extra rows — gives us a quick "core subjects"
  // recommendation block at the bottom.
  const resilientSubjectHints = useMemo(() => {
    const hints = new Set<string>()
    for (const role of allRoles) {
      if (role.ai_rating_2030_2035 == null || role.ai_rating_2030_2035 > 3) continue
      // Conservative heuristic: surface the four universally valuable
      // subjects rather than computing per-role mappings here. The mapping
      // table itself lives on /subjects.
      hints.add('Mathematics')
      hints.add('English')
      hints.add('Computing Science')
      hints.add('Sciences')
    }
    return Array.from(hints)
  }, [allRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div className="pf-container" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
          <Skeleton width="50%" height={40} rounded="md" />
          <div style={{ height: '12px' }} />
          <Skeleton width="80%" height={20} rounded="sm" />
          <div style={{ height: '32px' }} />
          <Skeleton variant="card" />
          <div style={{ height: '24px' }} />
          <Skeleton variant="card" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--pf-blue-50)', padding: '48px 16px' }}
      >
        <div className="pf-container">
          <ErrorState
            title={error ? classifyError(error).title : 'Could not load AI careers data'}
            message="Please try again in a moment."
            retryAction={() => refetch()}
            backLink={{ href: '/careers', label: 'Browse career sectors' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Section 1 — Hero */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-900)',
          color: '#fff',
          paddingTop: '72px',
          paddingBottom: '72px',
        }}
      >
        <div className="pf-container">
          <div className="grid md:grid-cols-[1.5fr_1fr] gap-10 items-center">
            <div>
              <span
                className="inline-flex items-center"
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  marginBottom: '20px',
                }}
              >
                AI, Robotics &amp; Careers
              </span>
              <h1
                style={{
                  fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                  lineHeight: 1.15,
                  color: '#fff',
                  marginBottom: '16px',
                }}
              >
                AI, robotics, and the future of careers
              </h1>
              <p
                style={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.65,
                  marginBottom: '24px',
                  maxWidth: '640px',
                }}
              >
                Every career will involve working alongside AI — and some will be reshaped by
                robotics. Explore how both forces change work across two horizons: early career
                (2030–2035) and mid-career (2040–2045).
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/simulator"
                  className="no-underline hover:no-underline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    color: 'var(--pf-blue-900)',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                  }}
                >
                  Test your subject combination
                </Link>
                <Link
                  href="/careers"
                  className="no-underline hover:no-underline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.35)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                  }}
                >
                  Browse all sectors
                </Link>
              </div>
            </div>
            <div
              aria-hidden="true"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
              }}
            >
              {Array.from({ length: 16 }).map((_, i) => {
                // Decorative grid: simulate the 1-10 scale via opacity steps.
                const tier =
                  i < 6 ? 'human-centric' : i < 12 ? 'ai-augmented' : 'ai-exposed'
                const colour =
                  tier === 'human-centric'
                    ? 'rgba(16, 185, 129, 0.55)'
                    : tier === 'ai-augmented'
                      ? 'rgba(245, 158, 11, 0.55)'
                      : 'rgba(239, 68, 68, 0.55)'
                return (
                  <span
                    key={i}
                    style={{
                      display: 'block',
                      aspectRatio: '1 / 1',
                      borderRadius: '8px',
                      backgroundColor: colour,
                      opacity: 0.4 + (i % 4) * 0.2,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — How to read the ratings */}
      <section style={{ backgroundColor: 'var(--pf-white)', padding: '48px 0' }}>
        <div className="pf-container">
          <h2 style={{ marginBottom: '8px' }}>How to read the ratings</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              maxWidth: '720px',
              marginBottom: '24px',
            }}
          >
            Every job role is rated 1–10 based on how much AI is expected to change the work
            over the next decade. The rating describes <em>change</em>, not desirability.
          </p>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          >
            <LegendCard
              tier="resilient"
              example="Healthcare Assistant, Plumber, Primary Teacher"
            />
            <LegendCard
              tier="evolving"
              example="Architect, Marketing Manager, Civil Engineer"
            />
            <LegendCard
              tier="transforming"
              example="Tax Adviser, Junior Lawyer, Data Entry Clerk"
            />
            <LegendCard
              tier="reshaped"
              example="Routine bookkeeping, basic translation"
            />
          </div>
        </div>
      </section>

      {/* Section 3 — Interactive sector explorer */}
      <section
        style={{ backgroundColor: 'var(--pf-grey-100)', padding: '64px 0' }}
        aria-labelledby="explorer-heading"
      >
        <div className="pf-container">
          <h2 id="explorer-heading" style={{ marginBottom: '8px' }}>
            Sector explorer
          </h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              maxWidth: '720px',
              marginBottom: '20px',
            }}
          >
            Search for any job title across all {allRoles.length} roles, or filter to focus on
            resilient, evolving, transforming, or brand-new AI careers. The AI panel reflects
            cognitive and software automation; the Robotics panel reflects embodied and physical
            automation. Switch the horizon below to compare early-career vs mid-career impact.
          </p>

          {/* Horizon toggle — applies to both AI and Robotics panels */}
          <div
            className="flex"
            role="group"
            aria-label="Select time horizon"
            style={{ gap: '8px', marginBottom: '24px' }}
          >
            <HorizonToggle
              label="Near-term (2030–2035)"
              active={horizon === 'near'}
              onClick={() => setHorizon('near')}
            />
            <HorizonToggle
              label="Long-term (2040–2045)"
              active={horizon === 'long'}
              onClick={() => setHorizon('long')}
            />
          </div>

          {/* Search + filter chips */}
          <div className="space-y-4" style={{ marginBottom: '24px' }}>
            <div className="relative">
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
                placeholder="Search for a job title..."
                className="pf-input w-full"
                style={{ paddingLeft: '44px' }}
                aria-label="Search career roles"
              />
            </div>
            <div
              className="flex flex-wrap"
              role="group"
              aria-label="Filter roles by AI tier"
              style={{ gap: '8px' }}
            >
              <FilterChip
                label="All roles"
                active={tierFilter === 'all'}
                onClick={() => setTierFilter('all')}
              />
              <FilterChip
                label="Resilient (1–3)"
                active={tierFilter === 'resilient'}
                onClick={() => setTierFilter('resilient')}
                colour="var(--pf-green-500)"
              />
              <FilterChip
                label="Evolving (4–6)"
                active={tierFilter === 'evolving'}
                onClick={() => setTierFilter('evolving')}
                colour="var(--pf-amber-500)"
              />
              <FilterChip
                label="Transforming (7+)"
                active={tierFilter === 'transforming'}
                onClick={() => setTierFilter('transforming')}
                colour="#C2410C"
              />
              <FilterChip
                label="New AI roles"
                active={tierFilter === 'new'}
                onClick={() => setTierFilter('new')}
                colour="var(--pf-green-500)"
              />
            </div>
          </div>

          {/* Search results panel — only when filtering or searching */}
          {(search.trim() || tierFilter !== 'all') && (
            <div className="pf-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-600)',
                  marginBottom: '12px',
                }}
              >
                {filteredRoles.length} matching role
                {filteredRoles.length === 1 ? '' : 's'}
              </p>
              {filteredRoles.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {filteredRoles.slice(0, 30).map((role) => (
                    <li
                      key={role.id}
                      style={{
                        padding: '10px 0',
                        borderTop: '1px solid var(--pf-grey-100)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: 'var(--pf-grey-900)',
                            margin: 0,
                          }}
                        >
                          {role.title}
                        </p>
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--pf-grey-600)',
                            margin: 0,
                          }}
                        >
                          {role.sector_name}
                        </p>
                      </div>
                      {pickRating(role, 'ai', horizon) != null && (
                        <AiRoleBadge rating={pickRating(role, 'ai', horizon) as number} size="sm" />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                  No roles match the current filters.
                </p>
              )}
              {filteredRoles.length > 30 && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--pf-grey-600)',
                    marginTop: '12px',
                  }}
                >
                  Showing first 30 of {filteredRoles.length} matches. Refine the search to see more.
                </p>
              )}
            </div>
          )}

          {/* AI panel */}
          <h3 style={{ marginTop: '8px', marginBottom: '6px' }}>AI impact by sector</h3>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.875rem',
              marginBottom: '16px',
            }}
          >
            Cognitive and software automation. {horizon === 'near' ? '2030–2035.' : '2040–2045.'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ marginBottom: '40px' }}>
            {aiSectorsWithRoles.map(({ sector, roles, avg }) => (
              <SectorCard
                key={`ai-${sector.id}`}
                sector={sector}
                roles={roles}
                avg={avg}
                metric="ai"
                horizon={horizon}
                expanded={expandedSectorIds.has(`ai-${sector.id}`)}
                onToggle={() => toggleSector(`ai-${sector.id}`)}
              />
            ))}
          </div>

          {/* Robotics panel */}
          <h3 style={{ marginTop: '8px', marginBottom: '6px' }}>Robotics impact by sector</h3>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.875rem',
              marginBottom: '16px',
            }}
          >
            Embodied and physical automation. {horizon === 'near' ? '2030–2035.' : '2040–2045.'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roboticsSectorsWithRoles.map(({ sector, roles, avg }) => (
              <SectorCard
                key={`robotics-${sector.id}`}
                sector={sector}
                roles={roles}
                avg={avg}
                metric="robotics"
                horizon={horizon}
                expanded={expandedSectorIds.has(`robotics-${sector.id}`)}
                onToggle={() => toggleSector(`robotics-${sector.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Key insights */}
      <section style={{ backgroundColor: 'var(--pf-white)', padding: '64px 0' }}>
        <div className="pf-container">
          <h2 style={{ marginBottom: '24px' }}>Key insights from the research</h2>
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            <InsightCard
              title="Resilience comes from combining strengths"
              body="The most future-proof careers blend deep human strengths — judgment, empathy, physical work — with fluency in AI tools. Neither side wins alone."
            />
            <InsightCard
              title="AI creates a barbell effect"
              body="Routine tasks at the centre of jobs are being automated. Strategic, advisory, and creative tasks at the edges become more valuable. The middle is hollowing out."
            />
            <InsightCard
              title="Scotland is investing"
              body="The Lanarkshire AI Growth Zone is a £15bn project. Scotland's AI Strategy 2026–2031 prioritises healthcare, public services, and SMEs. Digital qualifications at Qualifications Scotland are expanding."
            />
          </div>
        </div>
      </section>

      {/* Section 5 — Subject recommendations */}
      <section style={{ backgroundColor: 'var(--pf-blue-50)', padding: '64px 0' }}>
        <div className="pf-container">
          <h2 style={{ marginBottom: '8px' }}>Subjects that prepare you for an AI-augmented world</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              maxWidth: '720px',
              marginBottom: '24px',
            }}
          >
            Every career will look different in ten years. These foundation subjects show up across
            the most resilient roles in nearly every sector.
          </p>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
          >
            {resilientSubjectHints.map((name) => (
              <div
                key={name}
                className="pf-card"
                style={{
                  padding: '16px 20px',
                  borderTop: '3px solid var(--pf-blue-700)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    margin: 0,
                    color: 'var(--pf-grey-900)',
                  }}
                >
                  {name}
                </h3>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px' }}>
            <Link
              href="/simulator"
              className="no-underline hover:no-underline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--pf-blue-700)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
              }}
            >
              Test your subject combination&apos;s AI resilience
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6 — Links + attribution */}
      <section style={{ backgroundColor: 'var(--pf-white)', padding: '64px 0' }}>
        <div className="pf-container">
          <h2 style={{ marginBottom: '20px' }}>Read more</h2>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginBottom: '32px' }}
          >
            <ResourceLink
              href="/blog/ai-changing-careers"
              label="How AI is changing careers"
              description="A friendly walkthrough of how the working world is shifting — and what that means for school choices."
            />
            <ResourceLink
              href="/blog/subjects-for-ai-workplace"
              label="Which subjects prepare you for an AI-powered workplace"
              description="The subjects that show up most in AI-resilient careers, with evidence from across Scotland and the UK."
            />
            <ResourceLink
              href="https://www.apprenticeships.scot"
              label="apprenticeships.scot"
              description="Foundation, Modern, and Graduate apprenticeships across every sector covered here."
              external
            />
            <ResourceLink
              href="https://www.gov.scot"
              label="Scotland AI Strategy"
              description="The Scottish Government's plan for AI investment, skills, and ethics — published 2026."
              external
            />
          </div>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--pf-grey-600)',
              lineHeight: 1.65,
              maxWidth: '820px',
              marginBottom: '8px',
            }}
          >
            {AI_ROLE_SOURCE}
          </p>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--pf-grey-600)',
              lineHeight: 1.65,
              maxWidth: '820px',
            }}
          >
            {ROBOTICS_ROLE_SOURCE}
          </p>
        </div>
      </section>
    </div>
  )
}

function LegendCard({ tier, example }: { tier: AiRoleTier; example: string }) {
  const meta = AI_ROLE_TIER_META[tier]
  return (
    <div
      className="pf-card"
      style={{
        padding: '20px',
        borderTop: `3px solid ${meta.text}`,
      }}
    >
      <div
        className="flex items-baseline"
        style={{ gap: '8px', marginBottom: '6px' }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1.125rem',
            color: meta.text,
          }}
        >
          {meta.range}
        </span>
        <h3
          style={{
            fontSize: '0.9375rem',
            color: meta.text,
            margin: 0,
          }}
        >
          {meta.label}
        </h3>
      </div>
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--pf-grey-600)',
          lineHeight: 1.55,
          marginBottom: '8px',
        }}
      >
        {meta.description}
      </p>
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--pf-grey-600)',
          fontStyle: 'italic',
          margin: 0,
        }}
      >
        {example}
      </p>
    </div>
  )
}

function HorizonToggle({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flex: 1,
        padding: '10px 16px',
        borderRadius: '8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: '0.875rem',
        border: active
          ? '1px solid var(--pf-blue-700)'
          : '1px solid var(--pf-grey-300)',
        backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-white)',
        color: active ? '#fff' : 'var(--pf-grey-700)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function FilterChip({
  label,
  active,
  onClick,
  colour,
}: {
  label: string
  active: boolean
  onClick: () => void
  colour?: string
}) {
  const accent = colour ?? 'var(--pf-blue-700)'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '8px 16px',
        borderRadius: '9999px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: '0.8125rem',
        border: active ? `1px solid ${accent}` : '1px solid var(--pf-grey-300)',
        backgroundColor: active ? accent : 'var(--pf-white)',
        color: active ? '#fff' : 'var(--pf-grey-600)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function SectorCard({
  sector,
  roles,
  avg,
  metric,
  horizon,
  expanded,
  onToggle,
}: {
  sector: CareerSector
  roles: CareerRole[]
  avg: number | null
  metric: Metric
  horizon: Horizon
  expanded: boolean
  onToggle: () => void
}) {
  const tier = avg != null ? AI_ROLE_TIER_META[getAiRoleTier(avg)] : null
  return (
    <div
      className="pf-card"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <div className="flex items-start justify-between" style={{ gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--pf-grey-900)',
                margin: 0,
                marginBottom: '4px',
              }}
            >
              {sector.name}
            </h3>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--pf-grey-600)',
                margin: 0,
              }}
            >
              {roles.length} role{roles.length === 1 ? '' : 's'}
            </p>
          </div>
          {tier && avg != null && (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: tier.bg,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                color: tier.text,
                whiteSpace: 'nowrap',
              }}
            >
              avg {avg.toFixed(1)}/10
            </div>
          )}
        </div>
      </button>
      {expanded && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '12px 0 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {roles.map((role) => (
            <li
              key={role.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '6px 0',
                fontSize: '0.75rem',
                borderTop: '1px solid var(--pf-grey-100)',
              }}
            >
              <span
                style={{
                  color: 'var(--pf-grey-900)',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {role.title}
                {metric === 'ai' && role.is_new_ai_role && (
                  <span
                    style={{
                      marginLeft: '6px',
                      fontSize: '0.625rem',
                      color: 'var(--pf-green-500)',
                      fontWeight: 600,
                    }}
                  >
                    NEW
                  </span>
                )}
              </span>
              {pickRating(role, metric, horizon) != null && (
                <AiRoleBadge
                  rating={pickRating(role, metric, horizon) as number}
                  size="sm"
                  showLabel={false}
                  metric={metric === 'ai' ? 'AI' : 'Robotics'}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: '12px' }}>
        <Link
          href={`/careers/${sector.id}`}
          style={{
            color: 'var(--pf-blue-700)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        >
          See full sector page →
        </Link>
      </div>
    </div>
  )
}

function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="pf-card"
      style={{ padding: '24px', borderLeft: '3px solid var(--pf-blue-700)' }}
    >
      <h3
        style={{
          fontSize: '1rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  )
}

function ResourceLink({
  href,
  label,
  description,
  external,
}: {
  href: string
  label: string
  description: string
  external?: boolean
}) {
  const sharedStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: 'var(--pf-blue-50)',
    color: 'var(--pf-grey-900)',
    textDecoration: 'none',
  }
  const content = (
    <>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.9375rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '4px',
        }}
      >
        {label} {external ? '↗' : '→'}
      </span>
      <span
        style={{
          fontSize: '0.8125rem',
          color: 'var(--pf-grey-600)',
          lineHeight: 1.55,
        }}
      >
        {description}
      </span>
    </>
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={sharedStyle}>
        {content}
      </a>
    )
  }
  return (
    <Link href={href} style={sharedStyle} className="no-underline hover:no-underline">
      {content}
    </Link>
  )
}
