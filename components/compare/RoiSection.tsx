'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { RoleComparisonData } from './ComparisonGrid'
import { NumericBar } from './NumericBar'
import {
  calculateROI,
  type EntryQualification,
  type RoiResult,
} from '@/lib/earnings/roi-calculator'

export interface RoiSectionProps {
  roles: RoleComparisonData[]
}

function formatGbpShort(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(2)}m`
  if (value >= 1_000) return `£${Math.round(value / 1000)}k`
  return `£${Math.round(value)}`
}

function roundUpTo(value: number, step: number): number {
  if (value <= 0) return step
  return Math.ceil(value / step) * step
}

export function RoiSection({ roles }: RoiSectionProps) {
  const roiByRole = useMemo<RoiResult[]>(
    () =>
      roles.map((r) =>
        calculateROI({
          role: {
            title: r.title,
            typicalEntryQualification:
              (r.typicalEntryQualification ?? null) as EntryQualification | null,
            typicalStartingSalaryGbp: r.typicalStartingSalaryGbp,
            typicalExperiencedSalaryGbp: r.typicalExperiencedSalaryGbp,
            typicalEntryAge: r.typicalEntryAge,
          },
        }),
      ),
    [roles],
  )

  const studyCostMax = roundUpTo(
    Math.max(...roiByRole.map((r) => r.studyCostTotal), 0),
    5000,
  )
  const saasMax = roundUpTo(
    Math.max(...roiByRole.map((r) => r.saasSupportTotal), 0),
    5000,
  )
  const netMax = roundUpTo(
    Math.max(...roiByRole.map((r) => r.netLifetimeValue), 0),
    100_000,
  )

  return (
    <div style={{ padding: '4px 0 8px' }}>
      <NumericBar
        fieldName="Study cost (total)"
        entries={roles.map((r, i) => {
          const roi = roiByRole[i]
          return {
            careerName: r.title,
            value: roi.requiresStudy ? Math.round(roi.studyCostTotal) : 0,
            displayLabel: roi.requiresStudy
              ? `${formatGbpShort(roi.studyCostTotal)} over ${roi.studyYears} yr`
              : 'No study cost',
          }
        })}
        maxForScale={Math.max(studyCostMax, 1000)}
        direction="negative"
      />
      <NumericBar
        fieldName="SAAS support (total)"
        entries={roles.map((r, i) => {
          const roi = roiByRole[i]
          return {
            careerName: r.title,
            value: roi.requiresStudy ? Math.round(roi.saasSupportTotal) : 0,
            displayLabel: roi.requiresStudy
              ? `${formatGbpShort(roi.saasSupportTotal)} over ${roi.studyYears} yr`
              : 'No SAAS needed',
          }
        })}
        maxForScale={Math.max(saasMax, 1000)}
        direction="positive"
      />
      <NumericBar
        fieldName="Net lifetime value"
        entries={roles.map((r, i) => {
          const roi = roiByRole[i]
          return {
            careerName: r.title,
            value: Math.round(roi.netLifetimeValue),
            displayLabel: formatGbpShort(roi.netLifetimeValue),
          }
        })}
        maxForScale={netMax}
        direction="positive"
      />

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
          ROI assumes an average Scottish university city (Glasgow-equivalent
          rents), university halls, and a mid-income household (&pound;21k-&pound;34k)
          for SAAS support. Part-time work modelled at ~10 hours/week term-time.
        </p>
        <p style={{ margin: '4px 0' }}>
          For personalised figures based on your own city, accommodation, and
          household income, use the{' '}
          <Link
            href="/tools/roi-calculator"
            style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
          >
            ROI calculator
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
