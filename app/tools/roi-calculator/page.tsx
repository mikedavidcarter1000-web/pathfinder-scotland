'use client'

import { useMemo, useState, useId } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useWideningAccessEligibility } from '@/hooks/use-student'
import {
  CITIES,
  DURATION_OPTIONS,
  ENGLAND_TUITION_PER_YEAR,
  GRADUATE_PREMIUM,
  GRADUATE_SALARY,
  HOUSEHOLD_OPTIONS,
  LIFETIME_PREMIUM,
  NON_GRADUATE_SALARY,
  PART_TIME_OPTIONS,
  WAGE_18_20,
  WORKING_YEARS,
  calculateAnnualBreakdown,
  formatGBP,
  getCityById,
  getMonthlyRent,
  type AccommodationType,
  type CityId,
  type Duration,
  type HouseholdBracket,
  type PartTimeWork,
} from './constants'

type Inputs = {
  city: CityId
  accommodation: AccommodationType
  household: HouseholdBracket
  work: PartTimeWork
  duration: Duration
}

const DEFAULTS: Inputs = {
  city: 'edinburgh',
  accommodation: 'halls',
  household: '21k-34k',
  work: '10h',
  duration: 4,
}

export default function RoiCalculatorPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [showComparison, setShowComparison] = useState(false)

  // Force living-at-home accommodation when the "at home" city is picked.
  const effectiveAccommodation: AccommodationType =
    inputs.city === 'at-home' ? 'at-home' : inputs.accommodation

  const selectedCity = getCityById(inputs.city)

  const annual = useMemo(
    () =>
      calculateAnnualBreakdown({
        city: selectedCity,
        accommodation: effectiveAccommodation,
        household: inputs.household,
        work: inputs.work,
      }),
    [selectedCity, effectiveAccommodation, inputs.household, inputs.work],
  )

  const degreeTotalNetCost = annual.netCost * inputs.duration
  const englandTuitionTotal = ENGLAND_TUITION_PER_YEAR * inputs.duration

  /**
   * Break-even years: how long after graduation the graduate premium repays
   * the net out-of-pocket cost of the degree. If the student is already in
   * surplus (netCost <= 0) there is no break-even — they finish debt-free.
   */
  const breakEvenYears =
    degreeTotalNetCost <= 0 ? 0 : degreeTotalNetCost / GRADUATE_PREMIUM

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <Hero />
      <CalculatorSection
        inputs={inputs}
        effectiveAccommodation={effectiveAccommodation}
        onChange={setInputs}
        annual={annual}
        duration={inputs.duration}
        degreeTotalNetCost={degreeTotalNetCost}
        englandTuitionTotal={englandTuitionTotal}
        breakEvenYears={breakEvenYears}
      />
      <ComparisonSection
        show={showComparison}
        onToggle={() => setShowComparison((v) => !v)}
        household={inputs.household}
        work={inputs.work}
      />
      <AssumptionsPanel />
      <RelatedLinks />
      <BottomCta />
    </div>
  )
}

// =============================================================================
// Hero
// =============================================================================

function Hero() {
  return (
    <section
      className="pf-section"
      style={{
        backgroundColor: 'var(--pf-blue-50)',
        paddingTop: '56px',
        paddingBottom: '40px',
      }}
    >
      <div className="pf-container">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <span className="pf-badge-blue inline-flex" style={{ marginBottom: '20px' }}>
              Free tool
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                lineHeight: 1.15,
                marginBottom: '16px',
                color: 'var(--pf-grey-900)',
              }}
            >
              What does university actually cost in Scotland?
            </h1>
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                marginBottom: '20px',
                maxWidth: '620px',
              }}
            >
              Scottish students don&apos;t pay tuition fees. Use our calculator to
              see the real cost — and the real return — of studying at a Scottish
              university.
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--pf-grey-600)',
                maxWidth: '620px',
                fontStyle: 'italic',
              }}
            >
              All figures are estimates based on published data. Your actual
              costs will vary.
            </p>
          </div>
          <HeroIllustration />
        </div>
      </div>
    </section>
  )
}

function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        maxWidth: '340px',
        margin: '0 auto',
        backgroundColor: 'var(--pf-white)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 45, 114, 0.1)',
      }}
    >
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          color: 'var(--pf-blue-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '16px',
        }}
      >
        The Scotland difference
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <IllustrationRow
          label="Tuition (Scotland)"
          value="£0"
          emphasis="var(--pf-green-500)"
        />
        <IllustrationRow
          label="Tuition (England)"
          value={formatGBP(ENGLAND_TUITION_PER_YEAR * 4)}
          emphasis="var(--pf-red-500)"
          sub="Over 4 years"
        />
        <div
          style={{
            borderTop: '1px solid var(--pf-grey-100)',
            paddingTop: '14px',
            fontSize: '0.75rem',
            color: 'var(--pf-grey-600)',
            lineHeight: 1.5,
          }}
        >
          SAAS covers your tuition. You only need to plan for rent and living
          costs.
        </div>
      </div>
    </div>
  )
}

function IllustrationRow({
  label,
  value,
  emphasis,
  sub,
}: {
  label: string
  value: string
  emphasis: string
  sub?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      <div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: '0.6875rem',
              color: 'var(--pf-grey-600)',
              marginTop: '2px',
            }}
          >
            {sub}
          </div>
        )}
      </div>
      <div
        className="pf-data-number"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.25rem',
          color: emphasis,
        }}
      >
        {value}
      </div>
    </div>
  )
}

// =============================================================================
// Calculator — inputs + results
// =============================================================================

function CalculatorSection({
  inputs,
  effectiveAccommodation,
  onChange,
  annual,
  duration,
  degreeTotalNetCost,
  englandTuitionTotal,
  breakEvenYears,
}: {
  inputs: Inputs
  effectiveAccommodation: AccommodationType
  onChange: (value: Inputs) => void
  annual: ReturnType<typeof calculateAnnualBreakdown>
  duration: Duration
  degreeTotalNetCost: number
  englandTuitionTotal: number
  breakEvenYears: number
}) {
  return (
    <section
      style={{ backgroundColor: 'var(--pf-white)', paddingTop: '48px', paddingBottom: '48px' }}
    >
      <div className="pf-container">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
          <InputsCard
            inputs={inputs}
            effectiveAccommodation={effectiveAccommodation}
            onChange={onChange}
          />
          <ResultsCard
            annual={annual}
            duration={duration}
            degreeTotalNetCost={degreeTotalNetCost}
            englandTuitionTotal={englandTuitionTotal}
            breakEvenYears={breakEvenYears}
          />
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------------------
// Inputs card
// -----------------------------------------------------------------------------

function InputsCard({
  inputs,
  effectiveAccommodation,
  onChange,
}: {
  inputs: Inputs
  effectiveAccommodation: AccommodationType
  onChange: (value: Inputs) => void
}) {
  const cityId = useId()
  const householdId = useId()
  const accommodationName = useId()
  const workName = useId()
  const durationName = useId()

  const isAtHome = inputs.city === 'at-home'

  return (
    <div
      className="pf-card-flat"
      style={{
        padding: '28px',
        position: 'relative',
      }}
    >
      <h2 style={{ marginBottom: '8px', fontSize: '1.375rem' }}>Your plan</h2>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', marginBottom: '24px' }}>
        Tell us a bit about where and how you&apos;d study.
      </p>

      {/* City */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor={cityId} className="pf-label">
          Where would you study?
        </label>
        <select
          id={cityId}
          className="pf-input"
          value={inputs.city}
          onChange={(e) =>
            onChange({
              ...inputs,
              city: e.target.value as CityId,
              // snap accommodation to "at home" when the home option is picked.
              accommodation:
                e.target.value === 'at-home' ? 'at-home' : inputs.accommodation === 'at-home' ? 'halls' : inputs.accommodation,
            })
          }
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Accommodation */}
      <fieldset
        style={{
          marginBottom: '20px',
          border: 'none',
          padding: 0,
          margin: '0 0 20px 0',
          opacity: isAtHome ? 0.7 : 1,
        }}
      >
        <legend className="pf-label" style={{ padding: 0, marginBottom: '6px' }}>
          Where would you live?
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <RadioOption
            name={accommodationName}
            value="halls"
            checked={effectiveAccommodation === 'halls'}
            disabled={isAtHome}
            onChange={() => onChange({ ...inputs, accommodation: 'halls' })}
            label="University halls (first year)"
          />
          <RadioOption
            name={accommodationName}
            value="private"
            checked={effectiveAccommodation === 'private'}
            disabled={isAtHome}
            onChange={() => onChange({ ...inputs, accommodation: 'private' })}
            label="Private rented flat (shared)"
          />
          <RadioOption
            name={accommodationName}
            value="at-home"
            checked={effectiveAccommodation === 'at-home'}
            onChange={() => onChange({ ...inputs, accommodation: 'at-home' })}
            label="Living at home with family"
          />
        </div>
        {isAtHome && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--pf-grey-600)',
              marginTop: '8px',
              fontStyle: 'italic',
            }}
          >
            Living at home is automatically selected when you choose the
            &ldquo;living at home&rdquo; city option.
          </p>
        )}
      </fieldset>

      {/* Household income */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor={householdId} className="pf-label">
          What&apos;s your household income?
        </label>
        <select
          id={householdId}
          className="pf-input"
          value={inputs.household}
          onChange={(e) =>
            onChange({ ...inputs, household: e.target.value as HouseholdBracket })
          }
        >
          {HOUSEHOLD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Part-time work */}
      <fieldset
        style={{ marginBottom: '20px', border: 'none', padding: 0, margin: '0 0 20px 0' }}
      >
        <legend className="pf-label" style={{ padding: 0, marginBottom: '6px' }}>
          Would you work part-time?
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PART_TIME_OPTIONS.map((opt) => (
            <RadioOption
              key={opt.value}
              name={workName}
              value={opt.value}
              checked={inputs.work === opt.value}
              onChange={() => onChange({ ...inputs, work: opt.value })}
              label={opt.label}
            />
          ))}
        </div>
      </fieldset>

      {/* Duration */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend className="pf-label" style={{ padding: 0, marginBottom: '6px' }}>
          Course duration
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DURATION_OPTIONS.map((opt) => (
            <RadioOption
              key={opt.value}
              name={durationName}
              value={String(opt.value)}
              checked={inputs.duration === opt.value}
              onChange={() => onChange({ ...inputs, duration: opt.value })}
              label={opt.label}
            />
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function RadioOption({
  name,
  value,
  checked,
  disabled,
  onChange,
  label,
}: {
  name: string
  value: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${checked ? 'var(--pf-blue-500)' : 'var(--pf-grey-300)'}`,
        backgroundColor: checked ? 'var(--pf-blue-50)' : 'var(--pf-white)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s',
        fontSize: '0.9375rem',
        color: 'var(--pf-grey-900)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{ accentColor: 'var(--pf-blue-700)' }}
      />
      {label}
    </label>
  )
}

// -----------------------------------------------------------------------------
// Results card
// -----------------------------------------------------------------------------

function ResultsCard({
  annual,
  duration,
  degreeTotalNetCost,
  englandTuitionTotal,
  breakEvenYears,
}: {
  annual: ReturnType<typeof calculateAnnualBreakdown>
  duration: Duration
  degreeTotalNetCost: number
  englandTuitionTotal: number
  breakEvenYears: number
}) {
  const isSurplus = annual.netCost <= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <WideningAccessBanner />

      {/* A — Outgoings */}
      <ResultSection
        title="Your estimated annual costs"
        rows={[
          { label: 'Accommodation', value: formatGBP(annual.accommodation) },
          { label: 'Living expenses (9 months)', value: formatGBP(annual.livingCosts) },
        ]}
        total={{ label: 'Total outgoings', value: formatGBP(annual.totalOutgoings) }}
        footerNote={<TuitionFreeNote />}
      />

      {/* B — Income */}
      <ResultSection
        title="Your estimated annual income"
        rows={[
          { label: 'SAAS support', value: formatGBP(annual.saasSupport) },
          { label: 'Part-time work', value: formatGBP(annual.partTimeIncome) },
        ]}
        total={{ label: 'Total income', value: formatGBP(annual.totalIncome) }}
      />

      {/* C — Net cost */}
      <NetCostCard netCost={annual.netCost} isSurplus={isSurplus} />

      {/* D — Degree total + England comparison */}
      <DegreeTotalCard
        duration={duration}
        degreeTotalNetCost={degreeTotalNetCost}
        englandTuitionTotal={englandTuitionTotal}
      />

      {/* E — Graduate return */}
      <GraduateReturnCard
        breakEvenYears={breakEvenYears}
        degreeTotalNetCost={degreeTotalNetCost}
      />
    </div>
  )
}

function ResultSection({
  title,
  rows,
  total,
  footerNote,
}: {
  title: string
  rows: { label: string; value: string }[]
  total: { label: string; value: string }
  footerNote?: React.ReactNode
}) {
  return (
    <div
      className="pf-card-flat"
      style={{ padding: '24px' }}
    >
      <h3 style={{ fontSize: '1.0625rem', marginBottom: '12px', fontWeight: 600 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map((r) => (
          <ResultRow key={r.label} label={r.label} value={r.value} />
        ))}
      </div>
      <div
        style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--pf-grey-100)',
        }}
      >
        <ResultRow label={total.label} value={total.value} strong />
      </div>
      {footerNote}
    </div>
  )
}

function ResultRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: '16px',
      }}
    >
      <span
        style={{
          fontSize: strong ? '0.9375rem' : '0.875rem',
          fontWeight: strong ? 600 : 400,
          color: strong ? 'var(--pf-grey-900)' : 'var(--pf-grey-600)',
          fontFamily: strong ? "'Space Grotesk', sans-serif" : "'Inter', sans-serif",
        }}
      >
        {label}
      </span>
      <span
        className="pf-data-number"
        style={{
          fontSize: strong ? '1.0625rem' : '0.9375rem',
          fontWeight: strong ? 600 : 500,
          color: 'var(--pf-grey-900)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function TuitionFreeNote() {
  return (
    <div
      style={{
        marginTop: '14px',
        padding: '12px 14px',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#047857"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0, marginTop: '2px' }}
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            color: '#047857',
            fontSize: '0.875rem',
          }}
        >
          Tuition: £0 (funded by SAAS)
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--pf-grey-600)',
            marginTop: '2px',
          }}
        >
          No tuition fees for Scottish students at Scottish universities.
        </div>
      </div>
    </div>
  )
}

function NetCostCard({
  netCost,
  isSurplus,
}: {
  netCost: number
  isSurplus: boolean
}) {
  const bgColour = isSurplus ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
  const textColour = isSurplus ? '#047857' : '#B45309'
  const amount = Math.abs(netCost)

  return (
    <div
      className="pf-card-flat"
      style={{
        padding: '24px',
        backgroundColor: bgColour,
        boxShadow: 'none',
        borderLeft: `4px solid ${isSurplus ? 'var(--pf-green-500)' : 'var(--pf-amber-500)'}`,
      }}
    >
      <h3
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: textColour,
          marginBottom: '6px',
        }}
      >
        Your annual net cost
      </h3>
      <div
        className="pf-data-number"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '2.5rem',
          fontWeight: 700,
          color: textColour,
          lineHeight: 1.1,
          marginBottom: '8px',
        }}
      >
        {isSurplus && netCost < 0 ? '+' : ''}
        {formatGBP(amount)}
      </div>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-900)',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {isSurplus ? (
          <>
            You could cover your costs and have{' '}
            <strong>{formatGBP(amount)}</strong> left over each year.
          </>
        ) : (
          <>
            Estimated gap: <strong>{formatGBP(amount)}/year</strong>. SAAS
            student loans can help cover this — they&apos;re income-contingent and
            only repayable when you earn above a threshold.
          </>
        )}
      </p>
    </div>
  )
}

function DegreeTotalCard({
  duration,
  degreeTotalNetCost,
  englandTuitionTotal,
}: {
  duration: Duration
  degreeTotalNetCost: number
  englandTuitionTotal: number
}) {
  const absTotal = Math.abs(degreeTotalNetCost)
  const isSurplus = degreeTotalNetCost <= 0

  return (
    <div className="pf-card-flat" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.0625rem', marginBottom: '12px', fontWeight: 600 }}>
        Total over your degree
      </h3>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', marginBottom: '16px' }}>
        Your {duration}-year degree could cost approximately{' '}
        <strong style={{ color: 'var(--pf-grey-900)' }}>
          {isSurplus ? `${formatGBP(0)} (surplus of ${formatGBP(absTotal)})` : formatGBP(absTotal)}
        </strong>{' '}
        in total.
      </p>
      <div
        style={{
          padding: '14px 16px',
          borderLeft: '4px solid var(--pf-blue-500)',
          backgroundColor: 'var(--pf-blue-50)',
          borderRadius: '0 8px 8px 0',
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--pf-blue-700)',
            marginBottom: '4px',
          }}
        >
          Compare: England
        </div>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--pf-grey-900)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          English tuition alone is {formatGBP(ENGLAND_TUITION_PER_YEAR)}/year —
          that&apos;s{' '}
          <strong>{formatGBP(englandTuitionTotal)}</strong> for a {duration}-year
          degree before living costs. Scottish students avoid this entirely.
        </p>
      </div>
    </div>
  )
}

function GraduateReturnCard({
  breakEvenYears,
  degreeTotalNetCost,
}: {
  breakEvenYears: number
  degreeTotalNetCost: number
}) {
  const yearsLabel = breakEvenYears <= 0
    ? 'immediately — your income already covers your costs'
    : breakEvenYears < 1
      ? 'less than a year'
      : `${breakEvenYears.toFixed(1)} years`

  return (
    <div className="pf-card-flat" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.0625rem', marginBottom: '12px', fontWeight: 600 }}>
        The graduate return
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <StatBlock label="Avg. graduate salary" value={formatGBP(GRADUATE_SALARY)} suffix="/year" />
        <StatBlock label="Avg. non-graduate" value={formatGBP(NON_GRADUATE_SALARY)} suffix="/year" />
        <StatBlock label="Graduate premium" value={formatGBP(GRADUATE_PREMIUM)} suffix="/year" emphasis />
      </div>
      <p style={{ color: 'var(--pf-grey-900)', fontSize: '0.9375rem', lineHeight: 1.5, marginBottom: '10px' }}>
        Based on average salaries, your investment could pay for itself in{' '}
        <strong>{yearsLabel}</strong>
        {degreeTotalNetCost > 0
          ? ` (${formatGBP(degreeTotalNetCost)} net cost ÷ ${formatGBP(GRADUATE_PREMIUM)} premium).`
          : '.'}
      </p>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>
        Over a {WORKING_YEARS}-year career, the graduate premium adds up to
        roughly <strong>{formatGBP(LIFETIME_PREMIUM)}</strong> — a rough
        estimate; earnings vary significantly by subject and sector.
      </p>
    </div>
  )
}

function StatBlock({
  label,
  value,
  suffix,
  emphasis,
}: {
  label: string
  value: string
  suffix?: string
  emphasis?: boolean
}) {
  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: emphasis ? 'var(--pf-blue-50)' : 'var(--pf-grey-100)',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--pf-grey-600)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div
        className="pf-data-number"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1.125rem',
          color: emphasis ? 'var(--pf-blue-700)' : 'var(--pf-grey-900)',
        }}
      >
        {value}
        {suffix && (
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--pf-grey-600)', marginLeft: '2px' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// Widening access banner (logged-in eligible students only)
// =============================================================================

function WideningAccessBanner() {
  const { user } = useAuth()
  const eligibility = useWideningAccessEligibility()

  if (!user || !eligibility?.isEligible) return null

  return (
    <div
      className="pf-card-flat"
      style={{
        padding: '18px 20px',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderLeft: '4px solid var(--pf-amber-500)',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#B45309',
          marginBottom: '6px',
        }}
      >
        You may be eligible for extra financial support
      </div>
      <p style={{ color: 'var(--pf-grey-900)', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 10px' }}>
        {eligibility.hasCareExperience && (
          <>
            Care-experienced Scottish students receive a{' '}
            <strong>£8,400 bursary</strong> regardless of household income.{' '}
          </>
        )}
        Some universities also offer additional bursaries for SIMD20 students,
        and there are scholarships you can apply for directly.
      </p>
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <Link
          href="/widening-access"
          style={{ color: 'var(--pf-blue-700)', fontWeight: 600, fontSize: '0.875rem' }}
        >
          Widening access details →
        </Link>
        <Link
          href="/resources#funding--financial-support"
          style={{ color: 'var(--pf-blue-700)', fontWeight: 600, fontSize: '0.875rem' }}
        >
          Scholarships & bursaries →
        </Link>
      </div>
    </div>
  )
}

// =============================================================================
// City comparison
// =============================================================================

function ComparisonSection({
  show,
  onToggle,
  household,
  work,
}: {
  show: boolean
  onToggle: () => void
  household: HouseholdBracket
  work: PartTimeWork
}) {
  // For a fair comparison we hold accommodation type constant at "private
  // shared" (the default most students end up in after first year), except
  // for the "at home" option where it falls through to 0. Household income
  // and part-time work mirror the user's current inputs.
  const rows = useMemo(() => {
    return CITIES.map((city) => {
      const accommodation: AccommodationType =
        city.id === 'at-home' ? 'at-home' : 'private'
      const annual = calculateAnnualBreakdown({
        city,
        accommodation,
        household,
        work,
      })
      const monthlyRent = getMonthlyRent(city, accommodation)
      return {
        city,
        accommodation,
        monthlyRent,
        totalOutgoings: annual.totalOutgoings,
        netCost: annual.netCost,
      }
    })
  }, [household, work])

  const cheapest = useMemo(() => {
    const nonHome = rows.filter((r) => r.city.id !== 'at-home')
    if (nonHome.length === 0) return null
    return nonHome.reduce((min, r) => (r.netCost < min.netCost ? r : min), nonHome[0])
  }, [rows])

  return (
    <section
      style={{ backgroundColor: 'var(--pf-grey-100)', paddingTop: '48px', paddingBottom: '48px' }}
    >
      <div className="pf-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ marginBottom: '6px' }}>Compare cities</h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', margin: 0 }}>
              Same household income and part-time work, different cities. Private
              shared accommodation is used for each city so the comparison is fair.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={show ? 'pf-btn-secondary' : 'pf-btn-primary'}
            style={{ whiteSpace: 'nowrap' }}
            aria-expanded={show}
          >
            {show ? 'Hide comparison' : 'Compare all cities'}
          </button>
        </div>

        {show && (
          <div
            style={{
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            {rows.map((row) => {
              const isCheapest = cheapest?.city.id === row.city.id
              const isHome = row.city.id === 'at-home'
              return (
                <ComparisonCard
                  key={row.city.id}
                  label={row.city.label}
                  monthlyRent={row.monthlyRent}
                  annualOutgoings={row.totalOutgoings}
                  annualNetCost={row.netCost}
                  degreeTotal={row.netCost * 4}
                  isCheapest={isCheapest}
                  isHome={isHome}
                />
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function ComparisonCard({
  label,
  monthlyRent,
  annualOutgoings,
  annualNetCost,
  degreeTotal,
  isCheapest,
  isHome,
}: {
  label: string
  monthlyRent: number
  annualOutgoings: number
  annualNetCost: number
  degreeTotal: number
  isCheapest: boolean
  isHome: boolean
}) {
  const highlight = isHome || isCheapest
  const highlightColour = isHome ? 'var(--pf-green-500)' : 'var(--pf-blue-500)'

  return (
    <div
      className="pf-card-flat"
      style={{
        padding: '18px',
        borderTop: `3px solid ${highlight ? highlightColour : 'var(--pf-grey-300)'}`,
        position: 'relative',
      }}
    >
      {highlight && (
        <span
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '0.6875rem',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            color: isHome ? '#047857' : 'var(--pf-blue-700)',
            backgroundColor: isHome ? 'rgba(16, 185, 129, 0.12)' : 'var(--pf-blue-50)',
            borderRadius: '9999px',
            padding: '2px 10px',
          }}
        >
          {isHome ? 'Most affordable' : 'Cheapest city'}
        </span>
      )}
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '10px',
          paddingRight: highlight ? '100px' : 0,
        }}
      >
        {label}
      </div>
      {isHome ? (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
            lineHeight: 1.5,
            margin: '0 0 10px',
          }}
        >
          <strong style={{ color: '#047857' }}>£0 rent</strong> — the most
          affordable option if your course is commutable.
        </p>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <MiniStat label="Monthly rent" value={isHome ? '£0' : formatGBP(monthlyRent)} />
        <MiniStat label="Annual costs" value={formatGBP(annualOutgoings)} />
        <MiniStat
          label="Annual net cost"
          value={annualNetCost <= 0 ? `+${formatGBP(Math.abs(annualNetCost))}` : formatGBP(annualNetCost)}
          positive={annualNetCost <= 0}
        />
        <MiniStat
          label="4-year total"
          value={degreeTotal <= 0 ? `+${formatGBP(Math.abs(degreeTotal))}` : formatGBP(degreeTotal)}
          positive={degreeTotal <= 0}
          strong
        />
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  positive,
  strong,
}: {
  label: string
  value: string
  positive?: boolean
  strong?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        fontSize: '0.8125rem',
      }}
    >
      <span style={{ color: 'var(--pf-grey-600)' }}>{label}</span>
      <span
        className="pf-data-number"
        style={{
          fontWeight: strong ? 600 : 500,
          color: positive ? '#047857' : 'var(--pf-grey-900)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

// =============================================================================
// Assumptions panel
// =============================================================================

function AssumptionsPanel() {
  return (
    <section
      style={{ backgroundColor: 'var(--pf-white)', paddingTop: '48px', paddingBottom: '48px' }}
    >
      <div className="pf-container">
        <details
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            padding: '20px 24px',
            borderRadius: '8px',
            backgroundColor: 'var(--pf-grey-100)',
            border: '1px solid var(--pf-grey-300)',
          }}
        >
          <summary
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-900)',
              cursor: 'pointer',
              listStyle: 'none',
            }}
          >
            How we calculated this
          </summary>
          <div
            style={{
              marginTop: '16px',
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-900)',
              lineHeight: 1.6,
            }}
          >
            <h3 style={{ fontSize: '1rem', marginTop: '12px', marginBottom: '6px' }}>Rent estimates</h3>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
              Rent figures are estimates based on NatWest Student Living Index,
              Save the Student UK rent surveys, Unipol and accommodation
              provider listings, and direct university accommodation pages, as of
              April 2026. Actual rents vary by property, contract length, and
              provider.
            </p>

            <h3 style={{ fontSize: '1rem', marginTop: '12px', marginBottom: '6px' }}>Living costs</h3>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
              Monthly living costs of around £420 (food, transport, books,
              phone, social) are based on NUS and SAAS estimates for Scottish
              students. The &ldquo;living at home&rdquo; figure of around £190/month is a
              more conservative estimate that assumes family absorbs food and
              utility costs. The academic year is treated as 9 months of living
              costs.
            </p>

            <h3 style={{ fontSize: '1rem', marginTop: '12px', marginBottom: '6px' }}>SAAS support</h3>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
              SAAS support figures are approximate combined estimates for the
              2025/26 academic year. SAAS provides a mix of non-repayable young
              student bursary and income-assessed student loan. Loans are only
              repayable once you earn above a threshold after graduation, and
              are written off after 30 years. Exact amounts depend on your
              individual circumstances — check{' '}
              <a
                href="https://www.saas.gov.uk"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
              >
                saas.gov.uk
              </a>{' '}
              for current rates. Scottish tuition fees are paid in full by SAAS
              for Scottish domiciled first-degree students.
            </p>

            <h3 style={{ fontSize: '1rem', marginTop: '12px', marginBottom: '6px' }}>Part-time work</h3>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
              Part-time work income is based on the UK National Living Wage for
              18–20-year-olds of {formatGBP(WAGE_18_20, { withPence: true })}/hour
              (April 2025). Calculations assume 40 working weeks (term time),
              adjusted by your chosen hours per week. Summer-only income assumes
              approximately {formatGBP(3500)} earned over the summer holiday.
            </p>

            <h3 style={{ fontSize: '1rem', marginTop: '12px', marginBottom: '6px' }}>Graduate salary data</h3>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
              Graduate salary figures draw on HESA Graduate Outcomes, ONS Annual
              Survey of Hours and Earnings, and Universities Scotland published
              briefings. Individual earnings vary significantly by subject, career,
              and sector. The lifetime premium figure is a rough estimate across a{' '}
              {WORKING_YEARS}-year working life.
            </p>

            <h3 style={{ fontSize: '1rem', marginTop: '12px', marginBottom: '6px' }}>What this calculator does not cover</h3>
            <ul style={{ color: 'var(--pf-grey-600)', marginBottom: '12px', paddingLeft: '20px' }}>
              <li>Travel costs to and from home (for away-from-home students)</li>
              <li>Course-specific costs (lab kits, uniform, field trips, placements)</li>
              <li>Disability-related costs or Disabled Students&apos; Allowance (DSA)</li>
              <li>Variation in living costs within a city</li>
              <li>Parental contributions or other private funding</li>
              <li>Childcare for student parents</li>
            </ul>

            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.8125rem', fontStyle: 'italic' }}>
              This calculator provides estimates only, not financial advice.
              Last updated: April 2026.
            </p>
          </div>
        </details>
      </div>
    </section>
  )
}

// =============================================================================
// Related links
// =============================================================================

function RelatedLinks() {
  return (
    <section
      style={{ backgroundColor: 'var(--pf-blue-50)', paddingTop: '48px', paddingBottom: '48px' }}
    >
      <div className="pf-container">
        <h2 style={{ marginBottom: '6px', textAlign: 'center' }}>
          Want to go deeper?
        </h2>
        <p
          style={{
            color: 'var(--pf-grey-600)',
            textAlign: 'center',
            marginBottom: '32px',
            maxWidth: '580px',
            margin: '0 auto 32px',
          }}
        >
          The numbers only tell part of the story. Here&apos;s where to read more,
          check official sources, and explore alternatives.
        </p>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
        >
          <RelatedCard
            category="Blog"
            title="The real cost of university in Scotland"
            body="A deeper read on how SAAS, rent, and living costs work in practice."
            href="/blog/cost-of-university-scotland"
          />
          <RelatedCard
            category="External"
            title="SAAS — official student finance"
            body="Check current rates, apply for funding, or see the full bursary breakdown."
            href="https://www.saas.gov.uk"
            external
          />
          <RelatedCard
            category="Resources"
            title="Scholarships & bursaries"
            body="Additional funding on top of SAAS — worth hundreds to thousands of pounds."
            href="/resources#funding--financial-support"
          />
          <RelatedCard
            category="Alternatives"
            title="Not sure about university?"
            body="Foundation, Modern, and Graduate Apprenticeships — earn while you learn."
            href="/pathways/alternatives"
          />
        </div>
      </div>
    </section>
  )
}

function RelatedCard({
  category,
  title,
  body,
  href,
  external,
}: {
  category: string
  title: string
  body: string
  href: string
  external?: boolean
}) {
  const content = (
    <>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--pf-blue-700)',
          marginBottom: '6px',
        }}
      >
        {category}
      </div>
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '6px',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          margin: 0,
          flex: 1,
        }}
      >
        {body}
      </p>
    </>
  )

  const sharedStyle: React.CSSProperties = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    borderTop: '3px solid var(--pf-blue-700)',
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="pf-card-hover no-underline hover:no-underline"
        style={sharedStyle}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className="pf-card-hover no-underline hover:no-underline"
      style={sharedStyle}
    >
      {content}
    </Link>
  )
}

// =============================================================================
// Bottom CTA
// =============================================================================

function BottomCta() {
  return (
    <section
      style={{
        backgroundColor: 'var(--pf-blue-900)',
        color: '#fff',
        paddingTop: '56px',
        paddingBottom: '56px',
      }}
    >
      <div className="pf-container text-center">
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>
          Ready to plan your path?
        </h2>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.85)',
            maxWidth: '560px',
            margin: '0 auto 24px',
            fontSize: '1rem',
          }}
        >
          Pathfinder helps you plan subject choices, match courses, and check
          widening access eligibility — all free.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/auth/sign-up"
            className="no-underline hover:no-underline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 28px',
              backgroundColor: '#fff',
              color: 'var(--pf-blue-900)',
              borderRadius: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              minHeight: '48px',
            }}
          >
            Create a free account
          </Link>
          <Link
            href="/courses"
            className="no-underline hover:no-underline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 28px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#fff',
              borderRadius: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              minHeight: '48px',
            }}
          >
            Browse courses
          </Link>
        </div>
      </div>
    </section>
  )
}
