'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import type { Tables } from '@/types/database'
import { BenefitCard } from './benefit-card'
import { BenefitRecommendations } from './benefit-recommendations'

type Benefit = Tables<'student_benefits'>
type Category = Tables<'benefit_categories'>
type Student = Tables<'students'>

type Stage = 's1_s4' | 's5_s6' | 'college' | 'university'

const STAGE_LABELS: Record<Stage, string> = {
  s1_s4: 'S1–S4 pupil',
  s5_s6: 'S5–S6 pupil',
  college: 'College student',
  university: 'University student',
}

function stageFromSchoolStage(
  schoolStage: string | null | undefined
): Stage | null {
  if (!schoolStage) return null
  if (['s1', 's2', 's3', 's4'].includes(schoolStage)) return 's1_s4'
  if (['s5', 's6'].includes(schoolStage)) return 's5_s6'
  if (schoolStage === 'college') return 'college'
  if (schoolStage === 'mature') return 'university'
  return null
}

function stageAppliesToBenefit(stage: Stage, benefit: Benefit): boolean {
  if (stage === 's1_s4') return !!benefit.eligibility_s1_s4
  if (stage === 's5_s6') return !!benefit.eligibility_s5_s6
  if (stage === 'college') return !!benefit.eligibility_college
  if (stage === 'university') return !!benefit.eligibility_university
  return true
}

interface BenefitsClientProps {
  benefits: Benefit[]
  categories: Category[]
  student: Student | null
  studentSubjectNames: string[]
  initialCategory: string | null
  initialFilter: string | null
}

const ALL_CATEGORY = 'all'

export function BenefitsClient({
  benefits,
  categories,
  student,
  studentSubjectNames,
  initialCategory,
  initialFilter,
}: BenefitsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory && categories.some((c) => c.slug === initialCategory)
      ? initialCategory
      : ALL_CATEGORY
  )
  const [stageFilter, setStageFilter] = useState<Stage | null>(() =>
    stageFromSchoolStage(student?.school_stage)
  )
  const [search, setSearch] = useState('')
  const [scotlandOnly, setScotlandOnly] = useState(false)
  const [includeMeansTested, setIncludeMeansTested] = useState(true)
  const [showCareExperiencedOnly, setShowCareExperiencedOnly] = useState(
    initialFilter === 'care-experienced'
  )

  // Keep the stage filter in sync with the student profile on first load.
  useEffect(() => {
    const derived = stageFromSchoolStage(student?.school_stage)
    if (derived && stageFilter == null) setStageFilter(derived)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.school_stage])

  const filteredBenefits = useMemo(() => {
    const searchLower = search.trim().toLowerCase()
    return benefits.filter((b) => {
      if (!b.is_active) return false
      if (selectedCategory !== ALL_CATEGORY && b.category !== selectedCategory) return false
      if (stageFilter && !stageAppliesToBenefit(stageFilter, b)) return false
      if (scotlandOnly && !b.is_scotland_only) return false
      if (!includeMeansTested && b.is_means_tested) return false
      if (showCareExperiencedOnly && !b.is_care_experienced_only) return false
      if (searchLower) {
        const hay = `${b.name} ${b.provider} ${b.short_description ?? ''}`.toLowerCase()
        if (!hay.includes(searchLower)) return false
      }
      return true
    })
  }, [
    benefits,
    selectedCategory,
    stageFilter,
    search,
    scotlandOnly,
    includeMeansTested,
    showCareExperiencedOnly,
  ])

  const governmentBenefits = useMemo(
    () => filteredBenefits.filter((b) => b.is_government_scheme),
    [filteredBenefits]
  )
  const commercialBenefits = useMemo(
    () => filteredBenefits.filter((b) => !b.is_government_scheme),
    [filteredBenefits]
  )

  const anyAffiliateVisible = commercialBenefits.some((b) => b.affiliate_url)

  const categoryTabs = useMemo(() => {
    return [
      { slug: ALL_CATEGORY, name: 'All' },
      ...categories.map((c) => ({ slug: c.slug, name: c.name.replace(/ &.*$/, '') })),
    ]
  }, [categories])

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          paddingTop: '48px',
          paddingBottom: '48px',
        }}
      >
        <div className="pf-container">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3">
              <div
                className="pf-badge-blue inline-flex mb-3"
                style={{ fontWeight: 600 }}
              >
                100+ benefits
              </div>
              <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}>
                Student Benefits &amp; Discounts
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
                Every free entitlement and discount available to Scottish students — from
                free bus travel to 50% off Spotify.
              </p>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: 'var(--pf-blue-700)',
                  fontSize: '0.9375rem',
                }}
              >
                Scotland offers the most generous student benefits package in the UK.
              </p>
            </div>
            <div className="lg:col-span-2" aria-hidden="true">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Personalised support estimate (logged-in students only) */}
      {student && (
        <section style={{ backgroundColor: 'var(--pf-white)', paddingTop: '32px' }}>
          <div className="pf-container">
            <SupportEstimateCard student={student} />
          </div>
        </section>
      )}

      {/* Recommendations rail */}
      <section style={{ backgroundColor: 'var(--pf-white)', paddingTop: '32px' }}>
        <div className="pf-container">
          <BenefitRecommendations
            benefits={benefits}
            student={student}
            studentSubjectNames={studentSubjectNames}
          />
        </div>
      </section>

      {/* Filter bar */}
      <section
        style={{
          backgroundColor: 'var(--pf-white)',
          position: 'sticky',
          top: 64,
          zIndex: 10,
          borderBottom: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="pf-container" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            {categoryTabs.map((tab) => {
              const active = selectedCategory === tab.slug
              return (
                <button
                  key={tab.slug}
                  onClick={() => setSelectedCategory(tab.slug)}
                  className="whitespace-nowrap rounded-full transition-colors"
                  style={{
                    padding: '8px 16px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    border: '1px solid var(--pf-grey-300)',
                    backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                    color: active ? '#fff' : 'var(--pf-grey-900)',
                    borderColor: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-300)',
                  }}
                >
                  {tab.name}
                </button>
              )
            })}
          </div>

          {/* Secondary filters */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            <label className="flex flex-col">
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: 'var(--pf-grey-600)',
                  marginBottom: '4px',
                }}
              >
                I am a…
              </span>
              <select
                className="pf-input"
                style={{ minHeight: '40px', padding: '8px 12px', fontSize: '0.9375rem' }}
                value={stageFilter ?? ''}
                onChange={(e) =>
                  setStageFilter(e.target.value === '' ? null : (e.target.value as Stage))
                }
              >
                <option value="">Any stage</option>
                {(Object.keys(STAGE_LABELS) as Stage[]).map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col sm:col-span-1 lg:col-span-2">
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: 'var(--pf-grey-600)',
                  marginBottom: '4px',
                }}
              >
                Search
              </span>
              <input
                type="search"
                placeholder="Search benefits by name or provider..."
                className="pf-input"
                style={{ minHeight: '40px', padding: '8px 12px', fontSize: '0.9375rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <div className="flex flex-col justify-end gap-2">
              <ToggleRow
                label="Scotland-only"
                checked={scotlandOnly}
                onChange={setScotlandOnly}
              />
              <ToggleRow
                label="Show means-tested"
                checked={includeMeansTested}
                onChange={setIncludeMeansTested}
              />
              <ToggleRow
                label="Care-experienced only"
                checked={showCareExperiencedOnly}
                onChange={setShowCareExperiencedOnly}
              />
            </div>
          </div>

          {(showCareExperiencedOnly ||
            stageFilter ||
            scotlandOnly ||
            !includeMeansTested ||
            selectedCategory !== ALL_CATEGORY ||
            search) && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                Showing {filteredBenefits.length} of {benefits.length}
              </span>
              <button
                onClick={() => {
                  setSelectedCategory(ALL_CATEGORY)
                  setSearch('')
                  setScotlandOnly(false)
                  setIncludeMeansTested(true)
                  setShowCareExperiencedOnly(false)
                  setStageFilter(stageFromSchoolStage(student?.school_stage))
                }}
                style={{
                  color: 'var(--pf-blue-500)',
                  fontSize: '0.8125rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Government schemes */}
      {governmentBenefits.length > 0 && (
        <section style={{ backgroundColor: 'var(--pf-blue-50)', padding: '48px 0' }}>
          <div className="pf-container">
            <div className="mb-6">
              <h2 style={{ marginBottom: '6px', fontSize: '1.5rem' }}>
                Government Schemes
              </h2>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  maxWidth: '640px',
                }}
              >
                Free entitlements from the Scottish Government and NHS. These are the
                highest-value supports — and we never take affiliate payments for linking
                to them.
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              {governmentBenefits.map((b) => (
                <BenefitCard
                  key={b.id}
                  benefit={b}
                  stage={stageFilter}
                  variant="government"
                  sourcePage="/benefits"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Commercial discounts */}
      <section style={{ padding: '48px 0' }}>
        <div className="pf-container">
          <div className="mb-6">
            <h2 style={{ marginBottom: '6px', fontSize: '1.5rem' }}>
              Commercial Discounts
            </h2>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.9375rem',
                maxWidth: '640px',
              }}
            >
              Discounts from retailers, restaurants, and services — typically unlocked
              through UNiDAYS, Student Beans, Young Scot, or direct student verification.
            </p>
            {anyAffiliateVisible && (
              <p
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                  fontSize: '0.8125rem',
                  maxWidth: '720px',
                }}
              >
                <strong>Affiliate disclosure:</strong> Some links on this page may earn
                Pathfinder Scotland a small commission at no cost to you. Government
                schemes are never affiliated.
              </p>
            )}
          </div>

          {commercialBenefits.length === 0 ? (
            <div
              className="pf-card text-center"
              style={{
                maxWidth: '480px',
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: '40px 24px',
              }}
            >
              <h3 style={{ marginBottom: '6px' }}>No matching benefits</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                Try removing a filter or changing category.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {commercialBenefits.map((b) => (
                <BenefitCard
                  key={b.id}
                  benefit={b}
                  stage={stageFilter}
                  variant="commercial"
                  sourcePage="/benefits"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cross-links */}
      <section style={{ backgroundColor: 'var(--pf-grey-100)', padding: '48px 0' }}>
        <div className="pf-container">
          <div className="grid md:grid-cols-3 gap-4">
            <CrossLinkCard
              href="/widening-access"
              title="Widening access"
              description="Reduced entry grades and guaranteed offers for eligible students."
            />
            <CrossLinkCard
              href="/tools/roi-calculator"
              title="Cost calculator"
              description="Model the cost and return of different pathways."
            />
            <CrossLinkCard
              href="/parents"
              title="For parents"
              description="Find out what your child is entitled to."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

// Compute a rough, transparent estimate of a student's annual support package
// from known profile signals (care-experienced, school stage, SIMD). Household
// income isn't on the students table, so we use SIMD decile as a proxy: decile
// 1–2 triggers the largest means-tested awards, decile 3–4 the smaller tier.
function SupportEstimateCard({ student }: { student: Student }) {
  const items: Array<{ label: string; amount: number }> = []

  const simd = student.simd_decile ?? null
  const stage = student.school_stage ?? null
  const isCare = !!student.care_experienced
  const isYoungEnoughForBus = stage !== 'mature'
  const isUniOrCollege = stage === 'college' || stage === 'mature'
  const isSchoolPupil =
    stage === 's2' || stage === 's3' || stage === 's4' ||
    stage === 's5' || stage === 's6'
  const isS5orS6 = stage === 's5' || stage === 's6'

  if (isCare && stage === 'mature') {
    items.push({ label: 'Care Experienced Students Bursary', amount: 9000 })
    items.push({ label: 'Summer Accommodation Grant', amount: 1330 })
  }

  if (simd !== null && simd <= 2 && stage === 'mature') {
    items.push({ label: 'Young Students Bursary (estimated)', amount: 2000 })
  } else if (simd !== null && simd <= 4 && stage === 'mature') {
    items.push({ label: 'Young Students Bursary (estimated)', amount: 1125 })
  }

  if (isS5orS6 && simd !== null && simd <= 4) {
    items.push({ label: 'Education Maintenance Allowance (~38 weeks)', amount: 1140 })
  }

  if (isYoungEnoughForBus) {
    items.push({ label: 'Free bus travel (est. value)', amount: 500 })
  }

  if (isSchoolPupil || isUniOrCollege) {
    items.push({ label: 'Free NHS prescriptions / eye tests', amount: 60 })
  }

  const total = items.reduce((acc, i) => acc + i.amount, 0)
  if (items.length === 0) return null

  return (
    <div
      className="pf-card mb-6"
      style={{
        borderLeft: '4px solid var(--pf-blue-700)',
        padding: '24px',
        backgroundColor: 'var(--pf-white)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3">
        <h2 style={{ fontSize: '1.25rem', marginBottom: 0 }}>
          Your estimated annual support package
        </h2>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1.75rem',
            color: 'var(--pf-blue-700)',
          }}
        >
          £{total.toLocaleString('en-GB')}/year
        </div>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
        Based on your profile ({[
          isCare && 'care-experienced',
          simd !== null && `SIMD decile ${simd}`,
          stage && `stage: ${stage.toUpperCase()}`,
        ].filter(Boolean).join(', ')}).
      </p>
      <ul style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', listStyle: 'none', padding: 0 }}>
        {items.map((i) => (
          <li
            key={i.label}
            className="flex justify-between"
            style={{ padding: '6px 0', borderBottom: '1px solid var(--pf-grey-100)' }}
          >
            <span>{i.label}</span>
            <strong style={{ fontWeight: 600 }}>£{i.amount.toLocaleString('en-GB')}</strong>
          </li>
        ))}
      </ul>
      <p
        style={{
          marginTop: '12px',
          fontSize: '0.75rem',
          color: 'var(--pf-grey-600)',
          fontStyle: 'italic',
        }}
      >
        This is an estimate — apply to each scheme individually to confirm your actual entitlement.
      </p>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label
      className="flex items-center gap-2 cursor-pointer"
      style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: '18px', height: '18px', accentColor: 'var(--pf-blue-700)' }}
      />
      {label}
    </label>
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
  // Minimal SVG illustration — geometric tiles representing benefits.
  return (
    <svg viewBox="0 0 360 260" className="w-full h-auto" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#005EB8" />
          <stop offset="100%" stopColor="#002D72" />
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="160" height="100" rx="10" fill="url(#g1)" />
      <rect x="180" y="12" width="170" height="60" rx="10" fill="#E0EDF7" />
      <rect x="180" y="80" width="82" height="60" rx="10" fill="#0072CE" />
      <rect x="268" y="80" width="82" height="60" rx="10" fill="#E0EDF7" />
      <rect x="12" y="120" width="78" height="68" rx="10" fill="#0072CE" />
      <rect x="96" y="120" width="76" height="68" rx="10" fill="#E0EDF7" />
      <rect x="180" y="148" width="170" height="40" rx="10" fill="#005EB8" />
      <rect x="12" y="196" width="340" height="52" rx="10" fill="#F0F5FA" stroke="#0072CE" />
      <text
        x="30"
        y="58"
        fill="#fff"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="18"
      >
        £10,000+
      </text>
      <text
        x="30"
        y="82"
        fill="#fff"
        fontFamily="Inter, sans-serif"
        fontSize="11"
        opacity="0.85"
      >
        in free software &amp; tools
      </text>
      <text
        x="198"
        y="48"
        fill="#002D72"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="14"
      >
        Free bus travel
      </text>
      <text
        x="30"
        y="160"
        fill="#fff"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="14"
      >
        50% off
      </text>
      <text
        x="30"
        y="176"
        fill="#fff"
        fontFamily="Inter, sans-serif"
        fontSize="10"
        opacity="0.85"
      >
        Spotify
      </text>
      <text
        x="112"
        y="160"
        fill="#002D72"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="14"
      >
        Free NHS
      </text>
      <text
        x="196"
        y="173"
        fill="#fff"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="700"
        fontSize="14"
      >
        Young Scot Rewards
      </text>
      <text
        x="32"
        y="228"
        fill="#002D72"
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight="600"
        fontSize="13"
      >
        + 90 more brands and schemes
      </text>
    </svg>
  )
}
