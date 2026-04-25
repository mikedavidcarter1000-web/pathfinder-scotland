import { formatCohortValue } from '@/lib/authority/disclosure'
import type { SchoolSimdDistribution } from '@/lib/authority/equity-queries'

const SIMD_COLOURS: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', string> = {
  Q1: '#1B3A5C',
  Q2: '#3F5F86',
  Q3: '#6285AE',
  Q4: '#85AAD0',
  Q5: '#AED0EE',
}

const SIMD_LABELS: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', string> = {
  Q1: 'Q1 most deprived',
  Q2: 'Q2',
  Q3: 'Q3',
  Q4: 'Q4',
  Q5: 'Q5 least deprived',
}

export interface SimdDistributionChartProps {
  rows: SchoolSimdDistribution[]
  /** LA-wide Q1 percentage to overlay as a comparison line; null if unknown. */
  laAverageQ1Pct: number | null
}

export function SimdDistributionChart({ rows, laAverageQ1Pct }: SimdDistributionChartProps) {
  if (rows.length === 0) {
    return (
      <p style={emptyStyle}>
        No school distribution data to display. Schools appear here once student SIMD
        data is recorded.
      </p>
    )
  }

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          fontSize: '0.75rem',
          color: '#475569',
        }}
      >
        {(['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] as const).map((q) => (
          <span key={q} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: SIMD_COLOURS[q],
              }}
            />
            {SIMD_LABELS[q]}
          </span>
        ))}
        {laAverageQ1Pct != null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <span
              style={{
                display: 'inline-block',
                width: '14px',
                height: '0',
                borderTop: '2px dashed #ef4444',
              }}
            />
            LA Q1 avg ({laAverageQ1Pct.toFixed(0)}%)
          </span>
        )}
      </div>

      {/* Per-school stacked bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map((r) => {
          const total =
            (r.Q1 ?? 0) + (r.Q2 ?? 0) + (r.Q3 ?? 0) + (r.Q4 ?? 0) + (r.Q5 ?? 0)
          if (total === 0) {
            return (
              <div
                key={r.school_id}
                style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px', alignItems: 'center', gap: '12px' }}
              >
                <span style={{ fontSize: '0.8125rem', color: '#1a1a2e', fontWeight: 600 }}>
                  {r.school_name}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  Insufficient SIMD data
                </span>
                <span />
              </div>
            )
          }

          const pct = (n: number | null) => (n == null ? 0 : (n / total) * 100)
          const segments = (['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] as const).map((q) => ({
            quintile: q,
            value: r[q] ?? 0,
            pct: pct(r[q]),
            colour: SIMD_COLOURS[q],
          }))
          const q1ActualPct = r.q1_percentage ?? 0

          return (
            <div
              key={r.school_id}
              style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px', alignItems: 'center', gap: '12px' }}
            >
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: '#1a1a2e',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={r.school_name}
              >
                {r.school_name}
              </span>
              <div
                role="img"
                aria-label={`SIMD distribution for ${r.school_name}: ${segments.map((s) => `${s.quintile} ${s.value} (${s.pct.toFixed(0)}%)`).join(', ')}`}
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '24px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
              >
                {segments.map((s) => (
                  <span
                    key={s.quintile}
                    title={`${s.quintile}: ${formatCohortValue(s.value)} (${s.pct.toFixed(0)}%)`}
                    style={{
                      backgroundColor: s.colour,
                      width: `${s.pct}%`,
                      height: '100%',
                    }}
                  />
                ))}
                {/* LA Q1 average overlay */}
                {laAverageQ1Pct != null && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${laAverageQ1Pct}%`,
                      width: 0,
                      borderLeft: '2px dashed #ef4444',
                    }}
                  />
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'right' }}>
                {formatCohortValue(r.total)}{' '}
                <span style={{ color: '#94a3b8' }}>(Q1 {q1ActualPct.toFixed(0)}%)</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const emptyStyle: React.CSSProperties = {
  margin: 0,
  padding: '24px 0',
  color: '#94a3b8',
  fontStyle: 'italic',
  fontSize: '0.875rem',
  textAlign: 'center',
}
