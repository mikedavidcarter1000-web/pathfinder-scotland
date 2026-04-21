'use client'

import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RoleComparisonData } from './ComparisonGrid'
import { NumericBar } from './NumericBar'
import {
  UK_MEDIAN_SALARY_GBP,
  calculateLifetimeEarnings,
  type LifetimeCalculatorResult,
} from '@/lib/earnings/lifetime-calculator'
import { trainingSlugForTitle } from '@/lib/earnings/role-slug'

export interface EarningsSectionProps {
  roles: RoleComparisonData[]
}

const SERIES_COLOURS = ['#E8593C', '#1B3A5C', '#0072CE'] as const
const TRAINING_OPACITY = 0.4
const FIRST_AGE = 16
const LAST_AGE = 68
const BIN_WIDTH = 2

interface RoleSeries {
  role: RoleComparisonData
  colour: string
  displayedResult: LifetimeCalculatorResult
  netUkMedian: number
}

interface Bin {
  ageBin: number
  ageLabel: string
  perRole: Array<{ value: number; isTraining: boolean }>
}

function roundUpTo(value: number, step: number): number {
  if (value <= 0) return step
  return Math.ceil(value / step) * step
}

function formatGbpShort(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(2)}m`
  if (value >= 1_000) return `£${Math.round(value / 1000)}k`
  return `£${Math.round(value)}`
}

function formatGbpFull(value: number): string {
  return `£${Math.round(value).toLocaleString('en-GB')}`
}

function buildBins(series: RoleSeries[]): Bin[] {
  const bins: Bin[] = []
  for (let age = FIRST_AGE; age <= LAST_AGE; age += BIN_WIDTH) {
    const ageTo = Math.min(age + BIN_WIDTH - 1, LAST_AGE)
    const perRole = series.map((s) => {
      const yearly = s.displayedResult.yearly
      const entries = yearly.filter((y) => y.age >= age && y.age <= ageTo)
      const avg = entries.length
        ? entries.reduce((t, y) => t + y.value, 0) / entries.length
        : 0
      const allTraining = entries.every((y) => y.age < s.role.typicalEntryAge)
      return { value: avg, isTraining: allTraining }
    })
    bins.push({
      ageBin: age,
      ageLabel: age === ageTo ? `${age}` : `${age}-${ageTo}`,
      perRole,
    })
  }
  return bins
}

interface ToggleProps {
  pressed: boolean
  onChange: (next: boolean) => void
  label: string
  describedBy?: string
}

function Toggle({ pressed, onChange, label, describedBy }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-describedby={describedBy}
      onClick={() => onChange(!pressed)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        minHeight: '36px',
        borderRadius: '999px',
        border: `1px solid ${pressed ? 'var(--pf-blue-700)' : 'var(--pf-grey-300)'}`,
        background: pressed ? 'var(--pf-blue-50)' : 'var(--pf-white)',
        color: pressed ? 'var(--pf-blue-900)' : 'var(--pf-grey-600)',
        cursor: 'pointer',
        fontSize: '0.8125rem',
        fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '24px',
          height: '14px',
          borderRadius: '999px',
          background: pressed ? 'var(--pf-blue-700)' : 'var(--pf-grey-300)',
          position: 'relative',
          transition: 'background 150ms',
          flex: '0 0 auto',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: pressed ? '12px' : '2px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'var(--pf-white)',
            transition: 'left 150ms',
          }}
        />
      </span>
      {label}
    </button>
  )
}

export function EarningsSection({ roles }: EarningsSectionProps) {
  const [mode, setMode] = useState<'gross' | 'net'>('net')
  const [includePension, setIncludePension] = useState<boolean>(false)
  const [projectionOpen, setProjectionOpen] = useState<boolean>(false)

  const series = useMemo<RoleSeries[]>(() => {
    return roles.map((role, idx) => {
      const slug = trainingSlugForTitle(role.title)
      const starting = role.typicalStartingSalaryGbp ?? 0
      const experienced = role.typicalExperiencedSalaryGbp ?? 0
      const input = {
        roleSlug: slug ?? '__none__',
        typicalStartingSalaryGbp: starting,
        typicalExperiencedSalaryGbp: experienced,
        typicalEntryAge: role.typicalEntryAge,
      }
      const displayedResult = calculateLifetimeEarnings({
        ...input,
        options: { mode, includeEmployerPension: includePension },
      })
      const netUkMedian = calculateLifetimeEarnings({
        roleSlug: '__none__',
        typicalStartingSalaryGbp: UK_MEDIAN_SALARY_GBP,
        typicalExperiencedSalaryGbp: UK_MEDIAN_SALARY_GBP,
        typicalEntryAge: 16,
        options: { mode, includeEmployerPension: false },
      }).yearly[0].value
      return {
        role,
        colour: SERIES_COLOURS[idx % SERIES_COLOURS.length],
        displayedResult,
        netUkMedian,
      }
    })
  }, [roles, mode, includePension])

  const startingValues = series.map((s) => s.displayedResult.yearly.find(
    (y) => y.age === s.role.typicalEntryAge,
  )?.value ?? 0)
  const experiencedValues = series.map((s) => {
    const targetAge = Math.min(s.role.typicalEntryAge + 14, LAST_AGE)
    return s.displayedResult.yearly.find((y) => y.age === targetAge)?.value ?? 0
  })
  const lifetimeValues = series.map((s) => s.displayedResult.lifetimeTotal)

  const salaryScaleMax = roundUpTo(
    Math.max(...experiencedValues, ...startingValues, series[0]?.netUkMedian ?? 0),
    5000,
  )
  const lifetimeScaleMax = roundUpTo(Math.max(...lifetimeValues), 100_000)

  const referenceLabel =
    mode === 'net'
      ? `UK median net (~${formatGbpShort(series[0]?.netUkMedian ?? 0)})`
      : `UK median (${formatGbpShort(UK_MEDIAN_SALARY_GBP)})`
  const referenceValue =
    mode === 'net' ? series[0]?.netUkMedian ?? UK_MEDIAN_SALARY_GBP : UK_MEDIAN_SALARY_GBP

  const bins = useMemo(() => buildBins(series), [series])

  const hasCommonSelfEmployment = roles.some(
    (r) => r.selfEmploymentViability === 'Common',
  )
  const commonSelfEmploymentNames = roles
    .filter((r) => r.selfEmploymentViability === 'Common')
    .map((r) => r.title)

  const chartData = bins.map((bin) => {
    const row: Record<string, string | number> = { ageLabel: bin.ageLabel }
    series.forEach((s, i) => {
      row[`career${i}`] = Math.round(bin.perRole[i].value)
    })
    return row
  })

  const chartMinWidth = Math.max(bins.length * 36 * Math.max(series.length, 1), 600)

  return (
    <div style={{ padding: '4px 0 8px' }}>
      <div
        role="group"
        aria-label="Earnings display toggles"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 0 12px',
          borderBottom: '1px solid var(--pf-grey-100)',
          marginBottom: '4px',
        }}
      >
        <Toggle
          pressed={mode === 'net'}
          onChange={(next) => setMode(next ? 'net' : 'gross')}
          label={
            mode === 'net' ? 'Show: Net (after tax)' : 'Show: Gross (before tax)'
          }
        />
        <Toggle
          pressed={includePension}
          onChange={setIncludePension}
          label="Include employer pension contributions"
        />
      </div>

      <NumericBar
        fieldName="Starting salary"
        entries={series.map((s, i) => ({
          careerName: s.role.title,
          value: Math.round(startingValues[i]),
          displayLabel: formatGbpShort(startingValues[i]),
        }))}
        maxForScale={salaryScaleMax}
        referenceValue={referenceValue}
        referenceLabel={referenceLabel}
        direction="positive"
      />
      <NumericBar
        fieldName="Experienced salary"
        entries={series.map((s, i) => ({
          careerName: s.role.title,
          value: Math.round(experiencedValues[i]),
          displayLabel: formatGbpShort(experiencedValues[i]),
        }))}
        maxForScale={salaryScaleMax}
        referenceValue={referenceValue}
        referenceLabel={referenceLabel}
        direction="positive"
      />
      <NumericBar
        fieldName="Lifetime earnings"
        entries={series.map((s, i) => ({
          careerName: s.role.title,
          value: Math.round(lifetimeValues[i]),
          displayLabel: formatGbpShort(lifetimeValues[i]),
        }))}
        maxForScale={lifetimeScaleMax}
        direction="positive"
      />

      <div style={{ padding: '12px 0 4px' }}>
        <button
          type="button"
          aria-expanded={projectionOpen}
          aria-controls="pf-earnings-projection"
          onClick={() => setProjectionOpen((v) => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            minHeight: '40px',
            borderRadius: '6px',
            border: '1px solid var(--pf-blue-700)',
            background: projectionOpen ? 'var(--pf-blue-50)' : 'var(--pf-white)',
            color: 'var(--pf-blue-700)',
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            cursor: 'pointer',
          }}
        >
          <span aria-hidden="true">{projectionOpen ? '▾' : '▸'}</span>
          {projectionOpen ? 'Hide lifetime projection' : 'Show lifetime projection'}
        </button>
      </div>

      {projectionOpen ? (
        <div id="pf-earnings-projection" style={{ padding: '12px 0' }}>
          <div
            style={{ overflowX: 'auto', width: '100%' }}
            className="scrollbar-thin"
          >
            <div style={{ minWidth: chartMinWidth, height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 12, right: 16, bottom: 28, left: 48 }}
                  barCategoryGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="ageLabel"
                    tick={{ fontSize: 11, fill: '#4A4A5A' }}
                    label={{
                      value: 'Age',
                      position: 'insideBottom',
                      offset: -12,
                      fontSize: 12,
                      fill: '#4A4A5A',
                    }}
                  />
                  <YAxis
                    tickFormatter={(v) => formatGbpShort(Number(v))}
                    tick={{ fontSize: 11, fill: '#4A4A5A' }}
                    width={64}
                    label={{
                      value: mode === 'net' ? 'Annual (net)' : 'Annual (gross)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 8,
                      fontSize: 12,
                      fill: '#4A4A5A',
                    }}
                  />
                  <Tooltip
                    formatter={(v) => formatGbpFull(Number(v))}
                    labelFormatter={(label) => `Age ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
                  {series.map((s, i) => (
                    <Bar
                      key={s.role.id}
                      dataKey={`career${i}`}
                      name={s.role.title}
                      fill={s.colour}
                      isAnimationActive={false}
                      radius={[2, 2, 0, 0]}
                    >
                      {bins.map((bin, bi) => (
                        <Cell
                          key={bi}
                          fill={s.colour}
                          fillOpacity={
                            bin.perRole[i].isTraining ? TRAINING_OPACITY : 1
                          }
                        />
                      ))}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: '0.75rem',
              color: 'var(--pf-grey-600)',
              fontStyle: 'italic',
            }}
          >
            Paler fill indicates training-phase years (pre-entry qualification or
            apprenticeship). Scroll horizontally on narrow screens.
          </p>

          <div
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            <table>
              <caption>
                Annual {mode === 'net' ? 'net' : 'gross'} earnings by age for
                {' '}
                {roles.map((r) => r.title).join(', ')}.
                {' '}
                Values in GBP.
                {' '}
                {includePension ? 'Includes employer pension.' : 'Excludes employer pension.'}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Age</th>
                  {series.map((s) => (
                    <th key={s.role.id} scope="col">
                      {s.role.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bins.map((bin) => (
                  <tr key={bin.ageBin}>
                    <th scope="row">{bin.ageLabel}</th>
                    {bin.perRole.map((cell, i) => (
                      <td key={i}>
                        {formatGbpFull(cell.value)}
                        {cell.isTraining ? ' (training)' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {hasCommonSelfEmployment ? (
        <div
          role="note"
          style={{
            margin: '12px 0 0',
            padding: '8px 12px',
            background: 'var(--pf-blue-50)',
            border: '1px solid var(--pf-blue-100)',
            borderRadius: '6px',
            color: 'var(--pf-blue-900)',
            fontSize: '0.8125rem',
          }}
        >
          Earnings for {commonSelfEmploymentNames.join(', ')} vary widely due to
          self-employment -- actual figures depend on client base, marketing, and
          business overheads.
        </div>
      ) : null}

      <div
        style={{
          margin: '14px 0 0',
          padding: '10px 12px',
          background: 'var(--pf-grey-100)',
          borderRadius: '6px',
          color: 'var(--pf-grey-600)',
          fontSize: '0.75rem',
          lineHeight: 1.55,
        }}
      >
        <p style={{ margin: '4px 0' }}>
          Figures are in today&rsquo;s money (not adjusted for inflation).
        </p>
        <p style={{ margin: '4px 0' }}>
          Net figures apply Scottish income tax rates for 2025-26 and Class 1 NI;
          they exclude student loan repayments (typically 9% above the plan
          threshold for up to 40 years).
        </p>
        <p style={{ margin: '4px 0' }}>
          Retirement age assumed to be 68 (State Pension age).
        </p>
        <p style={{ margin: '4px 0' }}>
          Training phase earnings are modelled where applicable (e.g. Medicine,
          Law, apprenticeships). Main career earnings follow a two-phase model:
          starting salary at typical entry age, rising linearly to experienced
          salary over 15 years, flat thereafter to retirement.
        </p>
      </div>
    </div>
  )
}
