'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { getSupabaseClient } from '@/lib/supabase'
import livingCostsData from '@/data/living-costs.json'
import budgetData from '@/data/student-living-budget.json'

type LivingCost = (typeof livingCostsData)[number]
type Toggle = 'home' | 'away'

const MAX_UNIS = 5

const INCOME_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'under_21000', label: 'Under £21,000' },
  { value: '21000_24000', label: '£21,000 – £24,000' },
  { value: '24000_34000', label: '£24,000 – £34,000' },
  { value: '34000_45000', label: '£34,000 – £45,000' },
  { value: 'over_45000', label: 'Over £45,000' },
  { value: 'prefer_not_say', label: 'Prefer not to say' },
]

const POPULAR_QUICK_START = ['edinburgh', 'glasgow', 'dundee', 'strathclyde']

const SAAS_BANDS = budgetData.saas_support as Record<
  string,
  { bursary: number; loan: number; total: number }
>

function getSaasTotal(band: string | null | undefined): {
  bursary: number
  loan: number
  total: number
  isMax: boolean
} {
  if (band && SAAS_BANDS[band]) {
    return { ...SAAS_BANDS[band], isMax: false }
  }
  // Default: maximum support
  return { ...SAAS_BANDS.under_21000, isMax: true }
}

function gbp(n: number): string {
  return `£${n.toLocaleString('en-GB')}`
}

export function LivingCostsClient() {
  const { user, student } = useAuth()
  const supabase = getSupabaseClient()

  const allUnis = livingCostsData as LivingCost[]
  const unisBySlug = useMemo(() => {
    const map: Record<string, LivingCost> = {}
    for (const u of allUnis) map[u.university_slug] = u
    return map
  }, [allUnis])

  // Friendly display name lookup -- we use a static label since the JSON
  // stores university_slug not name. We also fetch the live universities
  // table to get the proper display name and id (for university profile links).
  const { data: liveUnis } = useQuery({
    queryKey: ['living-costs-uni-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, slug, name')
        .order('name')
      if (error) throw error
      return (data || []) as Array<{ id: string; slug: string; name: string }>
    },
    staleTime: 10 * 60 * 1000,
  })

  const uniMetaBySlug = useMemo(() => {
    const map: Record<string, { id: string; name: string }> = {}
    for (const u of liveUnis || []) {
      map[u.slug] = { id: u.id, name: u.name }
    }
    return map
  }, [liveUnis])

  // Fetch saved-course universities for logged-in student
  const { data: savedUniSlugs } = useQuery({
    queryKey: ['saved-course-uni-slugs', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_courses')
        .select('course:courses(university:universities(slug))')
        .eq('student_id', user!.id)
      if (error) throw error
      type Row = { course: { university: { slug: string } | null } | null }
      const slugs = ((data as unknown as Row[]) || [])
        .map((r) => r.course?.university?.slug)
        .filter((s): s is string => typeof s === 'string')
      return Array.from(new Set(slugs))
    },
    staleTime: 5 * 60 * 1000,
  })

  // State
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [incomeBand, setIncomeBand] = useState<string>('')
  const [toggles, setToggles] = useState<Record<string, Toggle>>({})
  const [hasInitialised, setHasInitialised] = useState(false)

  // Initialise once auth + saved-courses settle
  useEffect(() => {
    if (hasInitialised) return
    // Wait for auth status to be known (student loaded or no user at all)
    if (user && savedUniSlugs === undefined) return

    let initial: string[] = []
    if (savedUniSlugs && savedUniSlugs.length > 0) {
      initial = savedUniSlugs.filter((s) => unisBySlug[s]).slice(0, MAX_UNIS)
    }

    setSelectedSlugs(initial)
    if (student?.household_income_band) {
      setIncomeBand(student.household_income_band)
    }
    setHasInitialised(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, savedUniSlugs, student?.household_income_band, unisBySlug])

  // Default per-uni toggle: 'home' if student's local_authority matches that
  // uni's commutable_from list; otherwise 'away'.
  useEffect(() => {
    setToggles((prev) => {
      const next = { ...prev }
      const localAuthority = student?.local_authority ?? null
      for (const slug of selectedSlugs) {
        if (next[slug]) continue
        const uni = unisBySlug[slug]
        if (!uni) continue
        const commutable =
          localAuthority &&
          uni.commutable_from.some(
            (la) => la.toLowerCase() === localAuthority.toLowerCase(),
          )
        next[slug] = commutable ? 'home' : 'away'
      }
      return next
    })
  }, [selectedSlugs, student?.local_authority, unisBySlug])

  const saas = getSaasTotal(incomeBand && incomeBand !== 'prefer_not_say' ? incomeBand : null)

  const addUni = (slug: string) => {
    if (!slug) return
    if (selectedSlugs.includes(slug)) return
    if (selectedSlugs.length >= MAX_UNIS) return
    setSelectedSlugs((prev) => [...prev, slug])
  }

  const removeUni = (slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug))
  }

  const setToggle = (slug: string, value: Toggle) => {
    setToggles((prev) => ({ ...prev, [slug]: value }))
  }

  const usingSavedCourses =
    !!user && (savedUniSlugs?.length ?? 0) > 0 && selectedSlugs.some((s) => savedUniSlugs?.includes(s))

  const availableUnisForAdd = useMemo(() => {
    return allUnis
      .filter((u) => !selectedSlugs.includes(u.university_slug))
      .map((u) => ({
        slug: u.university_slug,
        name: uniMetaBySlug[u.university_slug]?.name || u.university_slug,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allUnis, selectedSlugs, uniMetaBySlug])

  function calc(slug: string): {
    accommodation: number
    food: number
    travel: number
    courseCosts: number
    social: number
    laundry: number
    total: number
    remaining: number
  } {
    const uni = unisBySlug[slug]
    const toggle = toggles[slug] || 'away'
    if (!uni) {
      return {
        accommodation: 0,
        food: 0,
        travel: 0,
        courseCosts: 0,
        social: 0,
        laundry: 0,
        total: 0,
        remaining: 0,
      }
    }
    const accommodation = toggle === 'home' ? 0 : uni.halls_cheapest_annual
    const food = toggle === 'home' ? budgetData.food_at_home_annual : budgetData.food_away_annual
    const travel = toggle === 'home' ? uni.travel_at_home_annual : uni.travel_away_annual
    const courseCosts = budgetData.course_costs_annual
    const social = budgetData.social_annual
    const laundry = toggle === 'home' ? 0 : budgetData.laundry_away_annual
    const total = accommodation + food + travel + courseCosts + social + laundry
    const remaining = saas.total - total
    return { accommodation, food, travel, courseCosts, social, laundry, total, remaining }
  }

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div className="pf-container" style={{ paddingTop: '48px', paddingBottom: '24px' }}>
          <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)' }}>
            Compare living costs at Scottish universities
          </h1>
          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-600)',
              lineHeight: 1.6,
              maxWidth: '720px',
            }}
          >
            See real accommodation and living costs at every Scottish university, compare
            them against your SAAS funding, and work out what would be left over for everything
            else. You can toggle between living at home and moving away for each university
            independently.
          </p>
        </div>
      </section>

      <div className="pf-container" style={{ paddingBottom: '64px' }}>
        {/* Income band + university selector */}
        <section
          className="pf-card"
          style={{ padding: '20px', marginBottom: '24px' }}
          aria-label="Settings"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr)',
              gap: '20px',
            }}
          >
            <div>
              <label
                htmlFor="income-band"
                style={{
                  display: 'block',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-900)',
                  marginBottom: '6px',
                }}
              >
                Your household income band
              </label>
              <select
                id="income-band"
                value={incomeBand}
                onChange={(e) => setIncomeBand(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  padding: '10px 12px',
                  border: '1px solid var(--pf-grey-300)',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  backgroundColor: 'var(--pf-white)',
                }}
              >
                <option value="">Select your household income band…</option>
                {INCOME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {(!incomeBand || incomeBand === 'prefer_not_say') && (
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--pf-grey-600)',
                    marginTop: '6px',
                    maxWidth: '520px',
                  }}
                >
                  Showing maximum SAAS support ({gbp(SAAS_BANDS.under_21000.total)}). Enter your
                  household income band for a more accurate estimate.
                </p>
              )}
            </div>

            <div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-900)',
                  marginBottom: '6px',
                }}
              >
                Universities to compare ({selectedSlugs.length}/{MAX_UNIS})
              </p>
              {usingSavedCourses && (
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--pf-grey-600)',
                    marginBottom: '10px',
                  }}
                >
                  We have selected the universities where you have saved courses. You can add
                  or remove universities below.
                </p>
              )}
              {!usingSavedCourses && selectedSlugs.length === 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--pf-grey-600)',
                      marginBottom: '8px',
                    }}
                  >
                    Select universities to compare (up to {MAX_UNIS}).
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedSlugs(POPULAR_QUICK_START.filter((s) => unisBySlug[s]))}
                    style={{
                      padding: '8px 14px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      color: 'var(--pf-blue-700)',
                      backgroundColor: 'var(--pf-blue-50)',
                      border: '1px solid var(--pf-blue-100)',
                      borderRadius: '999px',
                      cursor: 'pointer',
                    }}
                  >
                    Popular: Edinburgh vs Glasgow vs Dundee vs Strathclyde
                  </button>
                </div>
              )}

              {/* Selected uni chips */}
              {selectedSlugs.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  {selectedSlugs.map((slug) => {
                    const name = uniMetaBySlug[slug]?.name || slug
                    return (
                      <span
                        key={slug}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          backgroundColor: 'var(--pf-blue-100)',
                          color: 'var(--pf-blue-700)',
                          borderRadius: '999px',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                        }}
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => removeUni(slug)}
                          aria-label={`Remove ${name}`}
                          style={{
                            background: 'transparent',
                            border: 0,
                            color: 'var(--pf-blue-700)',
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1,
                            fontSize: '1rem',
                            fontWeight: 700,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Add uni dropdown */}
              {selectedSlugs.length < MAX_UNIS && (
                <select
                  value=""
                  onChange={(e) => {
                    addUni(e.target.value)
                    e.currentTarget.value = ''
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '10px 12px',
                    border: '1px solid var(--pf-grey-300)',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                    backgroundColor: 'var(--pf-white)',
                  }}
                  aria-label="Add a university"
                >
                  <option value="">Add a university…</option>
                  {availableUnisForAdd.map((u) => (
                    <option key={u.slug} value={u.slug}>
                      {u.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </section>

        {/* Comparison */}
        {selectedSlugs.length === 0 ? (
          <div
            className="pf-card"
            style={{ padding: '32px', textAlign: 'center', color: 'var(--pf-grey-600)' }}
          >
            <p style={{ fontSize: '0.9375rem' }}>
              Add at least one university above to see a cost comparison.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block" style={{ marginBottom: '24px' }}>
              <ComparisonGrid
                slugs={selectedSlugs}
                unisBySlug={unisBySlug}
                uniMetaBySlug={uniMetaBySlug}
                toggles={toggles}
                setToggle={setToggle}
                calc={calc}
                saas={saas}
                studentLocalAuthority={student?.local_authority ?? null}
              />
            </div>

            {/* Mobile cards */}
            <div className="md:hidden" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {selectedSlugs.map((slug) => (
                  <ComparisonCard
                    key={slug}
                    uni={unisBySlug[slug]}
                    name={uniMetaBySlug[slug]?.name || slug}
                    uniId={uniMetaBySlug[slug]?.id}
                    toggle={toggles[slug] || 'away'}
                    setToggle={(v) => setToggle(slug, v)}
                    calc={calc(slug)}
                    saas={saas}
                    studentLocalAuthority={student?.local_authority ?? null}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Free things */}
        <FreeThingsSection />

        {/* Guidance */}
        <GuidanceSection />

        {/* Internal links */}
        <RelatedLinks />

        {/* Caveat */}
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--pf-grey-600)',
            marginTop: '24px',
            maxWidth: '720px',
          }}
        >
          Living-cost figures are indicative averages based on published university
          accommodation rates and Scottish rental data for {budgetData.source}. Verify the
          exact figures on each university&apos;s accommodation page before applying. SAAS
          rates are 2025-26.
        </p>
      </div>
    </div>
  )
}

interface CalcResult {
  accommodation: number
  food: number
  travel: number
  courseCosts: number
  social: number
  laundry: number
  total: number
  remaining: number
}

interface SaasResult {
  bursary: number
  loan: number
  total: number
  isMax: boolean
}

function ComparisonGrid({
  slugs,
  unisBySlug,
  uniMetaBySlug,
  toggles,
  setToggle,
  calc,
  saas,
  studentLocalAuthority,
}: {
  slugs: string[]
  unisBySlug: Record<string, LivingCost>
  uniMetaBySlug: Record<string, { id: string; name: string }>
  toggles: Record<string, Toggle>
  setToggle: (slug: string, value: Toggle) => void
  calc: (slug: string) => CalcResult
  saas: SaasResult
  studentLocalAuthority: string | null
}) {
  const cols = `220px repeat(${slugs.length}, minmax(180px, 1fr))`

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: cols,
    borderTop: '1px solid var(--pf-grey-200)',
    alignItems: 'stretch',
  }

  const labelCell: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: '0.875rem',
    color: 'var(--pf-grey-600)',
    fontWeight: 600,
    backgroundColor: 'var(--pf-grey-50, #F9FAFB)',
  }

  const valueCell: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: '0.9375rem',
    color: 'var(--pf-grey-900)',
  }

  return (
    <div
      className="pf-card"
      style={{ padding: 0, overflow: 'auto' }}
    >
      <div style={{ minWidth: `${220 + slugs.length * 200}px` }}>
        {/* Header row: university names */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: cols,
            backgroundColor: 'var(--pf-white)',
            borderBottom: '2px solid var(--pf-grey-200)',
          }}
        >
          <div style={{ padding: '14px' }} />
          {slugs.map((slug) => {
            const meta = uniMetaBySlug[slug]
            const uni = unisBySlug[slug]
            return (
              <div key={slug} style={{ padding: '14px' }}>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '2px',
                  }}
                >
                  {meta?.id ? (
                    <Link
                      href={`/universities/${meta.id}`}
                      style={{ color: 'var(--pf-blue-700)' }}
                    >
                      {meta.name}
                    </Link>
                  ) : (
                    meta?.name || slug
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                  {uni?.city}
                </div>
                <ToggleControl
                  value={toggles[slug] || 'away'}
                  onChange={(v) => setToggle(slug, v)}
                  uni={uni}
                  studentLocalAuthority={studentLocalAuthority}
                />
              </div>
            )
          })}
        </div>

        {/* Row group: Accommodation */}
        <SectionRow label="Accommodation" cols={cols} />
        <div style={rowStyle}>
          <div style={labelCell}>Yearly accommodation</div>
          {slugs.map((slug) => {
            const c = calc(slug)
            const uni = unisBySlug[slug]
            const toggle = toggles[slug] || 'away'
            return (
              <div key={slug} style={valueCell}>
                <div className="pf-data-number" style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {toggle === 'home' ? '£0' : gbp(c.accommodation)}
                </div>
                {toggle === 'home' ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                    Living at home
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                    Cheapest halls: {gbp(uni.halls_cheapest_weekly)}/wk
                    <br />
                    Private rent avg: {gbp(uni.private_rent_average_weekly)}/wk
                    <br />
                    {uni.halls_url && (
                      <a
                        href={uni.halls_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--pf-blue-700)' }}
                      >
                        Accommodation page →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <SectionRow label="Other costs" cols={cols} />
        <CostRow
          label="Food"
          cols={cols}
          slugs={slugs}
          values={slugs.map((s) => {
            const c = calc(s)
            const t = toggles[s] || 'away'
            return {
              value: c.food,
              note: t === 'home' ? budgetData.food_at_home_label : budgetData.food_away_label,
            }
          })}
        />
        <CostRow
          label="Travel"
          cols={cols}
          slugs={slugs}
          values={slugs.map((s) => {
            const c = calc(s)
            const uni = unisBySlug[s]
            const t = toggles[s] || 'away'
            return {
              value: c.travel,
              note: t === 'home' ? uni.travel_at_home_notes : uni.travel_away_notes,
            }
          })}
        />
        <CostRow
          label="Course costs"
          cols={cols}
          slugs={slugs}
          values={slugs.map((s) => ({
            value: calc(s).courseCosts,
            note: budgetData.course_costs_label,
          }))}
        />
        <CostRow
          label="Social and personal"
          cols={cols}
          slugs={slugs}
          values={slugs.map((s) => ({
            value: calc(s).social,
            note: budgetData.social_label,
          }))}
        />
        <CostRow
          label="Laundry / household"
          cols={cols}
          slugs={slugs}
          values={slugs.map((s) => {
            const c = calc(s)
            const t = toggles[s] || 'away'
            return {
              value: c.laundry,
              note: t === 'home' ? '£0 (living at home)' : budgetData.laundry_away_label,
            }
          })}
        />

        <SectionRow label="Total and SAAS" cols={cols} />
        <div style={rowStyle}>
          <div style={{ ...labelCell, fontWeight: 700, color: 'var(--pf-grey-900)' }}>
            Estimated annual cost
          </div>
          {slugs.map((slug) => {
            const c = calc(slug)
            return (
              <div key={slug} style={valueCell}>
                <div
                  className="pf-data-number"
                  style={{
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: 'var(--pf-grey-900)',
                  }}
                >
                  {gbp(c.total)}
                </div>
              </div>
            )
          })}
        </div>

        <div style={rowStyle}>
          <div style={labelCell}>SAAS support</div>
          {slugs.map((slug) => (
            <div key={slug} style={valueCell}>
              <div className="pf-data-number" style={{ fontWeight: 700, fontSize: '1rem' }}>
                {gbp(saas.total)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                {saas.bursary > 0
                  ? `Bursary: ${gbp(saas.bursary)} (non-repayable) + Loan: ${gbp(saas.loan)}`
                  : `Loan: ${gbp(saas.loan)}`}
                {saas.isMax && (
                  <>
                    <br />
                    <span style={{ fontStyle: 'italic' }}>(maximum support shown)</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={rowStyle}>
          <div style={{ ...labelCell, fontWeight: 700, color: 'var(--pf-grey-900)' }}>
            Remaining for other costs
          </div>
          {slugs.map((slug) => (
            <div key={slug} style={valueCell}>
              <RemainingCell remaining={calc(slug).remaining} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionRow({ label, cols }: { label: string; cols: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        backgroundColor: 'var(--pf-blue-50)',
        borderTop: '1px solid var(--pf-grey-200)',
      }}
    >
      <div
        style={{
          padding: '8px 14px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '0.75rem',
          color: 'var(--pf-blue-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          gridColumn: 'span 99 / span 99',
        }}
      />
    </div>
  )
}

function CostRow({
  label,
  cols,
  slugs,
  values,
}: {
  label: string
  cols: string
  slugs: string[]
  values: Array<{ value: number; note: string }>
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        borderTop: '1px solid var(--pf-grey-200)',
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          fontWeight: 600,
          backgroundColor: 'var(--pf-grey-50, #F9FAFB)',
        }}
      >
        {label}
      </div>
      {slugs.map((slug, i) => {
        const v = values[i]
        return (
          <div
            key={slug}
            style={{
              padding: '12px 14px',
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-900)',
            }}
          >
            <div className="pf-data-number" style={{ fontWeight: 700 }}>
              {gbp(v.value)}
            </div>
            {v.note && (
              <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                {v.note}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ToggleControl({
  value,
  onChange,
  uni,
  studentLocalAuthority,
}: {
  value: Toggle
  onChange: (v: Toggle) => void
  uni: LivingCost | undefined
  studentLocalAuthority: string | null
}) {
  if (!uni) return null
  const commutable =
    studentLocalAuthority &&
    uni.commutable_from.some((la) => la.toLowerCase() === studentLocalAuthority.toLowerCase())

  return (
    <div style={{ marginTop: '10px' }}>
      <div
        role="tablist"
        aria-label="Living arrangement"
        style={{
          display: 'inline-flex',
          padding: '2px',
          backgroundColor: 'var(--pf-grey-100)',
          borderRadius: '999px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      >
        {(['home', 'away'] as Toggle[]).map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt)}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                border: 0,
                cursor: 'pointer',
                color: active ? 'var(--pf-white)' : 'var(--pf-grey-600)',
                backgroundColor: active ? 'var(--pf-blue-700)' : 'transparent',
              }}
            >
              {opt === 'home' ? 'Living at home' : 'Moving away'}
            </button>
          )
        })}
      </div>
      {commutable && (
        <p
          style={{
            fontSize: '0.6875rem',
            color: 'var(--pf-green-500)',
            marginTop: '6px',
            fontWeight: 600,
          }}
        >
          You could commute from {studentLocalAuthority}
        </p>
      )}
    </div>
  )
}

function RemainingCell({ remaining }: { remaining: number }) {
  const positive = remaining >= 0
  const colour = positive ? 'var(--pf-green-500)' : '#B45309'
  const weeklyAbs = Math.round(Math.abs(remaining) / 52)
  return (
    <>
      <div
        className="pf-data-number"
        style={{
          fontWeight: 800,
          fontSize: '1.25rem',
          color: colour,
        }}
      >
        {positive ? gbp(remaining) : `-${gbp(Math.abs(remaining))}`}
      </div>
      {positive ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
          Roughly {gbp(weeklyAbs)}/week left over
        </div>
      ) : (
        <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
          You would need to find an additional {gbp(Math.abs(remaining))} per year. Part-time
          work, additional bursaries, or living at home could cover this.
        </div>
      )}
    </>
  )
}

function ComparisonCard({
  uni,
  name,
  uniId,
  toggle,
  setToggle,
  calc,
  saas,
  studentLocalAuthority,
}: {
  uni: LivingCost | undefined
  name: string
  uniId?: string
  toggle: Toggle
  setToggle: (v: Toggle) => void
  calc: CalcResult
  saas: SaasResult
  studentLocalAuthority: string | null
}) {
  if (!uni) return null

  return (
    <div className="pf-card" style={{ padding: '20px' }}>
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.0625rem',
          color: 'var(--pf-grey-900)',
          margin: 0,
          marginBottom: '4px',
        }}
      >
        {uniId ? (
          <Link href={`/universities/${uniId}`} style={{ color: 'var(--pf-blue-700)' }}>
            {name}
          </Link>
        ) : (
          name
        )}
      </h3>
      <div style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>{uni.city}</div>
      <ToggleControl
        value={toggle}
        onChange={setToggle}
        uni={uni}
        studentLocalAuthority={studentLocalAuthority}
      />

      <dl style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
        <CardRow
          term="Accommodation"
          value={toggle === 'home' ? '£0' : gbp(calc.accommodation)}
          note={
            toggle === 'home'
              ? 'Living at home'
              : `Cheapest halls: ${gbp(uni.halls_cheapest_weekly)}/wk`
          }
        />
        <CardRow term="Food" value={gbp(calc.food)} note="" />
        <CardRow term="Travel" value={gbp(calc.travel)} note="" />
        <CardRow term="Course costs" value={gbp(calc.courseCosts)} note="" />
        <CardRow term="Social" value={gbp(calc.social)} note="" />
        {toggle === 'away' && (
          <CardRow term="Laundry / household" value={gbp(calc.laundry)} note="" />
        )}
      </dl>

      <div
        style={{
          borderTop: '1px solid var(--pf-grey-200)',
          marginTop: '14px',
          paddingTop: '12px',
        }}
      >
        <CardRow
          term="Estimated annual cost"
          value={gbp(calc.total)}
          note=""
          bold
        />
        <CardRow
          term="SAAS support"
          value={gbp(saas.total)}
          note={
            saas.bursary > 0
              ? `Bursary: ${gbp(saas.bursary)} + Loan: ${gbp(saas.loan)}`
              : `Loan: ${gbp(saas.loan)}`
          }
        />
        <div style={{ marginTop: '12px' }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'var(--pf-grey-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Remaining for other costs
          </span>
          <RemainingCell remaining={calc.remaining} />
        </div>
      </div>
    </div>
  )
}

function CardRow({
  term,
  value,
  note,
  bold,
}: {
  term: string
  value: string
  note: string
  bold?: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <div>
        <dt
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
            fontWeight: bold ? 700 : 500,
          }}
        >
          {term}
        </dt>
        {note && (
          <dd style={{ fontSize: '0.6875rem', color: 'var(--pf-grey-600)', margin: 0 }}>
            {note}
          </dd>
        )}
      </div>
      <dd
        className="pf-data-number"
        style={{
          fontSize: bold ? '1rem' : '0.9375rem',
          fontWeight: bold ? 800 : 700,
          color: 'var(--pf-grey-900)',
          margin: 0,
        }}
      >
        {value}
      </dd>
    </div>
  )
}

function FreeThingsSection() {
  return (
    <section
      className="pf-card"
      style={{ padding: '24px', marginBottom: '24px' }}
      aria-labelledby="free-things"
    >
      <h2 id="free-things" style={{ fontSize: '1.25rem', marginBottom: '6px' }}>
        Things that are free for students in Scotland
      </h2>
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--pf-grey-600)',
          marginBottom: '20px',
          maxWidth: '720px',
        }}
      >
        Before you worry about costs, remember that Scottish students get significant support
        that students elsewhere in the UK do not.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {budgetData.free_things.map((thing) => (
          <div
            key={thing.item}
            style={{
              padding: '14px',
              backgroundColor: 'var(--pf-blue-50)',
              border: '1px solid var(--pf-blue-100)',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '4px',
              }}
            >
              {thing.item}
            </div>
            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.45,
              }}
            >
              {thing.detail}
            </div>
            {thing.value_label && (
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--pf-green-500)',
                  marginTop: '6px',
                }}
              >
                {thing.value_label}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function GuidanceSection() {
  return (
    <section
      className="pf-card"
      style={{ padding: '24px', marginBottom: '24px' }}
      aria-labelledby="guidance"
    >
      <h2 id="guidance" style={{ fontSize: '1.25rem', marginBottom: '12px' }}>
        Should you live at home or move away?
      </h2>
      <div style={{ display: 'grid', gap: '14px', maxWidth: '760px' }}>
        <div>
          <h3
            style={{
              fontSize: '1rem',
              marginBottom: '4px',
              color: 'var(--pf-grey-900)',
            }}
          >
            Living at home
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', lineHeight: 1.6 }}>
            Living at home and commuting saves thousands of pounds per year. You keep your
            existing support network, your part-time job, and your routine. Many successful
            students commute -- it does not make your degree worth less. If you are a young
            carer, have family responsibilities, or simply prefer the stability of home,
            commuting is a completely valid choice.
          </p>
        </div>
        <div>
          <h3
            style={{
              fontSize: '1rem',
              marginBottom: '4px',
              color: 'var(--pf-grey-900)',
            }}
          >
            Moving away
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', lineHeight: 1.6 }}>
            Moving away is part of the university experience for many students, and it builds
            independence. If your nearest university does not offer your chosen course, or if
            you want a fresh start, the SAAS funding package is designed to make this
            affordable. The cheapest university cities in Scotland -- Dundee, Stirling,
            Aberdeen -- are significantly cheaper than Edinburgh or Glasgow.
          </p>
        </div>
        <div>
          <h3
            style={{
              fontSize: '1rem',
              marginBottom: '4px',
              color: 'var(--pf-grey-900)',
            }}
          >
            The honest middle ground
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', lineHeight: 1.6 }}>
            There is no right answer. The best choice depends on your course, your finances,
            your family situation, and what you want from university. If cost is the deciding
            factor, use the comparison above to see the real numbers -- you may be surprised
            at how affordable moving away can be, or how much you save by staying home.
          </p>
        </div>
      </div>
    </section>
  )
}

function RelatedLinks() {
  const links: Array<{ href: string; label: string }> = [
    { href: '/tools/simulator', label: 'Subject choice simulator' },
    { href: '/tools/roi-calculator', label: 'University cost and return calculator' },
    { href: '/universities', label: 'Browse all Scottish universities' },
    { href: '/blog/saas-funding-application-guide-scotland', label: 'How to apply for SAAS funding' },
    { href: '/blog/first-generation-university-scotland', label: 'First in your family to go to university?' },
    { href: '/widening-access', label: 'Widening access support' },
  ]
  return (
    <section
      className="pf-card"
      style={{ padding: '20px', marginBottom: '24px' }}
      aria-labelledby="related"
    >
      <h2 id="related" style={{ fontSize: '1rem', marginBottom: '10px' }}>
        Related guides and tools
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '6px' }}>
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              style={{
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
              }}
            >
              {l.label} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
