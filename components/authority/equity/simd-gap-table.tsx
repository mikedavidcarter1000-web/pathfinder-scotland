'use client'

import { Fragment, useState } from 'react'
import type { SimdGapMetricRow } from '@/lib/authority/equity-queries'

const GAP_BAND_THRESHOLDS = {
  low: 5, // < 5pp = green
  mid: 15, // 5-15pp = amber, > 15pp = red
} as const

function gapBandColour(gap: number | null, unit: 'count' | 'percent' | 'avg'): {
  bg: string
  fg: string
  label: string
} {
  if (gap == null) return { bg: '#f1f5f9', fg: '#64748b', label: 'No data' }
  const abs = Math.abs(gap)
  // For percent metrics, the band is in percentage points. For
  // averages/counts, the threshold is interpreted in the same units --
  // 5 subjects difference is "large", 1 is "small".
  if (unit === 'percent') {
    if (abs < GAP_BAND_THRESHOLDS.low) return { bg: '#dcfce7', fg: '#166534', label: 'Small gap' }
    if (abs <= GAP_BAND_THRESHOLDS.mid) return { bg: '#fef3c7', fg: '#92400e', label: 'Moderate gap' }
    return { bg: '#fee2e2', fg: '#991b1b', label: 'Wide gap' }
  }
  if (abs < 1) return { bg: '#dcfce7', fg: '#166534', label: 'Small gap' }
  if (abs <= 3) return { bg: '#fef3c7', fg: '#92400e', label: 'Moderate gap' }
  return { bg: '#fee2e2', fg: '#991b1b', label: 'Wide gap' }
}

function formatValue(v: number | null, unit: 'count' | 'percent' | 'avg'): string {
  if (v == null) return '—'
  if (unit === 'percent') return `${v.toFixed(1)}%`
  if (unit === 'avg') return v.toFixed(1)
  return v.toLocaleString('en-GB')
}

function formatGap(v: number | null, unit: 'count' | 'percent' | 'avg'): string {
  if (v == null) return '—'
  const formatted = unit === 'percent' ? `${Math.abs(v).toFixed(1)}pp` : Math.abs(v).toFixed(1)
  return formatted
}

function directionLabel(d: SimdGapMetricRow['gap_direction']): string {
  if (d == null) return ''
  if (d === 'q1_lower') return 'Q1 lower'
  if (d === 'q5_lower') return 'Q5 lower'
  return 'Equal'
}

export interface SimdGapTableProps {
  metrics: SimdGapMetricRow[]
}

export function SimdGapTable({ metrics }: SimdGapTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (metrics.length === 0) {
    return (
      <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '16px 0', margin: 0 }}>
        No metrics to display.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={th}>Metric</th>
            <th style={{ ...th, textAlign: 'right' }}>SIMD Q1</th>
            <th style={{ ...th, textAlign: 'right' }}>SIMD Q5</th>
            <th style={{ ...th, textAlign: 'right' }}>Gap</th>
            <th style={th}>Status</th>
            <th style={{ ...th, textAlign: 'center' }}>Per school</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => {
            const band = gapBandColour(m.gap, m.metric_unit)
            const isExpanded = expanded === m.metric_key
            const hasSchoolBreakdown = m.per_school.length > 0
            return (
              <Fragment key={m.metric_key}>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={td}>
                    <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{m.metric_name}</div>
                    {m.notes && (
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>
                        {m.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>{formatValue(m.q1_value, m.metric_unit)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{formatValue(m.q5_value, m.metric_unit)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        backgroundColor: band.bg,
                        color: band.fg,
                      }}
                    >
                      {formatGap(m.gap, m.metric_unit)}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ color: band.fg, fontWeight: 600 }}>{band.label}</span>
                    {m.gap_direction && (
                      <span style={{ color: '#64748b', marginLeft: '8px', fontSize: '0.75rem' }}>
                        ({directionLabel(m.gap_direction)})
                      </span>
                    )}
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    {hasSchoolBreakdown ? (
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : m.metric_key)}
                        aria-expanded={isExpanded}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          backgroundColor: isExpanded ? '#eff6ff' : '#fff',
                          cursor: 'pointer',
                          color: '#1d4ed8',
                          fontWeight: 600,
                        }}
                      >
                        {isExpanded ? 'Hide' : 'Show'} ({m.per_school.length})
                      </button>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                </tr>
                {isExpanded && hasSchoolBreakdown && (
                  <tr>
                    <td colSpan={6} style={{ padding: '0', backgroundColor: '#f8fafc' }}>
                      <div style={{ padding: '12px 24px' }}>
                        <p
                          style={{
                            color: '#64748b',
                            fontSize: '0.75rem',
                            margin: '0 0 8px',
                            fontStyle: 'italic',
                          }}
                        >
                          Schools with both Q1 and Q5 cohorts of fewer than 5 students are
                          omitted to prevent identification.
                        </p>
                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.8125rem',
                          }}
                        >
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <th style={th}>School</th>
                              <th style={{ ...th, textAlign: 'right' }}>Q1</th>
                              <th style={{ ...th, textAlign: 'right' }}>Q5</th>
                              <th style={{ ...th, textAlign: 'right' }}>Gap</th>
                            </tr>
                          </thead>
                          <tbody>
                            {m.per_school.map((row) => (
                              <tr key={row.school_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={td}>{row.school_name}</td>
                                <td style={{ ...td, textAlign: 'right' }}>
                                  {formatValue(row.q1_value, m.metric_unit)}
                                </td>
                                <td style={{ ...td, textAlign: 'right' }}>
                                  {formatValue(row.q5_value, m.metric_unit)}
                                </td>
                                <td style={{ ...td, textAlign: 'right' }}>
                                  {formatGap(row.gap, m.metric_unit)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
      {/* Suppression note for the whole table */}
      <p
        style={{
          color: '#64748b',
          fontSize: '0.75rem',
          margin: '12px 0 0',
        }}
      >
        Reporting suppressed where the relevant SIMD cohort has fewer than 5 students.
        Values shown as &ldquo;&mdash;&rdquo; indicate data is unavailable for the current filters.
      </p>
    </div>
  )
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontWeight: 600,
  color: '#475569',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const td: React.CSSProperties = {
  padding: '10px 12px',
  color: '#1a1a2e',
  verticalAlign: 'top',
}

