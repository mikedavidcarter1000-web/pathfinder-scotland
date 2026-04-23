'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import livingCostsData from '@/data/living-costs.json'
import budgetData from '@/data/student-living-budget.json'

type LivingCost = (typeof livingCostsData)[number]

const SAAS_BANDS = budgetData.saas_support as Record<
  string,
  { bursary: number; loan: number; total: number }
>

function gbp(n: number): string {
  return `£${n.toLocaleString('en-GB')}`
}

function findData(slug: string | null | undefined): LivingCost | undefined {
  if (!slug) return undefined
  return (livingCostsData as LivingCost[]).find((u) => u.university_slug === slug)
}

export function UniversityLivingCostsSection({
  slug,
  name,
}: {
  slug: string | null | undefined
  name: string
}) {
  const { student } = useAuth()
  const data = findData(slug)

  if (!data) return null

  // Hide if all figures are zero (i.e. genuinely empty)
  const isEmpty =
    data.halls_cheapest_annual === 0 &&
    data.private_rent_average_weekly === 0 &&
    data.needs_verification

  if (isEmpty) return null

  const localAuthority = student?.local_authority ?? null
  const commutable =
    localAuthority &&
    data.commutable_from.some((la) => la.toLowerCase() === localAuthority.toLowerCase())

  const incomeBand = student?.household_income_band
  const saas =
    incomeBand && SAAS_BANDS[incomeBand]
      ? SAAS_BANDS[incomeBand]
      : null

  // SAAS budget summary uses cheapest halls as the accommodation figure
  const annualCost =
    data.halls_cheapest_annual +
    budgetData.food_away_annual +
    data.travel_away_annual +
    budgetData.course_costs_annual +
    budgetData.social_annual +
    budgetData.laundry_away_annual

  const remaining = saas ? saas.total - annualCost : null

  return (
    <section aria-labelledby="living-costs-heading">
      <h2
        id="living-costs-heading"
        className="text-xl font-semibold text-gray-900 mb-4"
      >
        Living costs
      </h2>

      <div className="pf-card" style={{ padding: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '14px',
          }}
        >
          <Stat
            label="Cheapest halls"
            value={`${gbp(data.halls_cheapest_weekly)}/wk`}
            subValue={`${gbp(data.halls_cheapest_annual)} per year`}
          />
          <Stat
            label="Private rent (city avg)"
            value={`${gbp(data.private_rent_average_weekly)}/wk`}
            subValue=""
          />
          <Stat
            label="Campus type"
            value={
              data.campus_or_city === 'campus'
                ? 'Self-contained campus'
                : data.campus_or_city === 'distributed'
                  ? 'Distributed network'
                  : 'City university'
            }
            subValue={data.city}
          />
          <Stat
            label="Cost reputation"
            value={data.cost_reputation}
            subValue=""
          />
        </div>

        {commutable && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--pf-green-50, #ecfdf5)',
              border: '1px solid var(--pf-green-200, #a7f3d0)',
              borderRadius: '6px',
              marginBottom: '12px',
              fontSize: '0.875rem',
              color: 'var(--pf-grey-900)',
            }}
          >
            You could commute to {name} from home in {localAuthority}.
          </div>
        )}

        {saas && remaining !== null && (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--pf-grey-900)',
              marginBottom: '12px',
            }}
          >
            With your SAAS support of {gbp(saas.total)}, studying here would leave
            approximately{' '}
            <strong style={{ color: remaining >= 0 ? 'var(--pf-green-500)' : '#B45309' }}>
              {remaining >= 0 ? gbp(remaining) : `-${gbp(Math.abs(remaining))}`}
            </strong>{' '}
            per year for everything else (using cheapest halls).
          </p>
        )}

        {data.local_tips && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginBottom: '12px',
              lineHeight: 1.5,
            }}
          >
            {data.local_tips}
          </p>
        )}

        <Link
          href="/tools/living-costs"
          style={{
            color: 'var(--pf-blue-700)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          Compare living costs across universities →
        </Link>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  subValue,
}: {
  label: string
  value: string
  subValue: string
}) {
  return (
    <div>
      <div
        style={{
          fontSize: '0.6875rem',
          color: 'var(--pf-grey-600)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 700,
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div
        className="pf-data-number"
        style={{
          fontSize: '1.0625rem',
          fontWeight: 700,
          color: 'var(--pf-grey-900)',
        }}
      >
        {value}
      </div>
      {subValue && (
        <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>{subValue}</div>
      )}
    </div>
  )
}
