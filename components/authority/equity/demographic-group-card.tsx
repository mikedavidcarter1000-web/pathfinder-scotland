import type { DemographicGroupMetrics } from '@/lib/authority/equity-queries'

export interface DemographicGroupCardProps {
  metrics: DemographicGroupMetrics
}

interface ComparisonRow {
  label: string
  group: string
  comparison: string
  gap: string | null
  /** When the group value is meaningfully better/worse than comparison */
  band: 'good' | 'neutral' | 'concern' | null
}

function formatPct(v: number | null): string {
  if (v == null) return '—'
  return `${v.toFixed(1)}%`
}

function formatAvg(v: number | null): string {
  if (v == null) return '—'
  return v.toFixed(1)
}

function formatGap(group: number | null, comparison: number | null, unit: 'pct' | 'avg'): string | null {
  if (group == null || comparison == null) return null
  const diff = group - comparison
  const sign = diff > 0 ? '+' : ''
  if (unit === 'pct') return `${sign}${diff.toFixed(1)}pp`
  return `${sign}${diff.toFixed(1)}`
}

function gapBand(group: number | null, comparison: number | null): 'good' | 'neutral' | 'concern' | null {
  if (group == null || comparison == null) return null
  const diff = group - comparison
  if (Math.abs(diff) < 5) return 'neutral'
  return diff < 0 ? 'concern' : 'good'
}

const BAND_COLOURS: Record<'good' | 'neutral' | 'concern', { bg: string; fg: string; border: string }> = {
  good: { bg: '#dcfce7', fg: '#166534', border: '#86efac' },
  neutral: { bg: '#f1f5f9', fg: '#475569', border: '#cbd5e1' },
  concern: { bg: '#fee2e2', fg: '#991b1b', border: '#fca5a5' },
}

export function DemographicGroupCard({ metrics }: DemographicGroupCardProps) {
  if (metrics.suppressed) {
    return (
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px 22px',
          minHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: '#1a1a2e',
            margin: '0 0 8px',
          }}
        >
          {metrics.group_label}
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 12px' }}>
          Fewer than 5 {metrics.group_label.toLowerCase()} students identified.
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
          Data suppressed to prevent identification. Increase demographic-flag completeness in
          schools to unlock this section -- particularly via SEEMIS import or guidance teacher entry.
        </p>
      </div>
    )
  }

  const rows: ComparisonRow[] = [
    {
      label: 'Avg subjects',
      group: formatAvg(metrics.subject_count_avg),
      comparison: formatAvg(metrics.comparison_subject_count_avg),
      gap: formatGap(metrics.subject_count_avg, metrics.comparison_subject_count_avg, 'avg'),
      band: gapBand(metrics.subject_count_avg, metrics.comparison_subject_count_avg),
    },
    {
      label: 'Active 30d',
      group: formatPct(metrics.engagement_rate_pct),
      comparison: formatPct(metrics.comparison_engagement_rate_pct),
      gap: formatGap(metrics.engagement_rate_pct, metrics.comparison_engagement_rate_pct, 'pct'),
      band: gapBand(metrics.engagement_rate_pct, metrics.comparison_engagement_rate_pct),
    },
    {
      label: 'Career sectors',
      group: formatAvg(metrics.career_sectors_explored_avg),
      comparison: formatAvg(metrics.comparison_career_sectors_explored_avg),
      gap: formatGap(metrics.career_sectors_explored_avg, metrics.comparison_career_sectors_explored_avg, 'avg'),
      band: gapBand(metrics.career_sectors_explored_avg, metrics.comparison_career_sectors_explored_avg),
    },
  ]

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 22px',
        minHeight: '180px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: '#1a1a2e',
            margin: 0,
          }}
        >
          {metrics.group_label}
        </h3>
        <span style={{ fontSize: '0.875rem', color: '#475569' }}>
          {metrics.cohort_size?.toLocaleString('en-GB') ?? '—'} students
          {metrics.percentage_of_cohort != null && (
            <span style={{ color: '#94a3b8', marginLeft: '4px' }}>
              ({metrics.percentage_of_cohort.toFixed(1)}%)
            </span>
          )}
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <th style={th}>Metric</th>
            <th style={{ ...th, textAlign: 'right' }}>Group</th>
            <th style={{ ...th, textAlign: 'right' }}>Other</th>
            <th style={{ ...th, textAlign: 'right' }}>Gap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const bandStyle = r.band ? BAND_COLOURS[r.band] : null
            return (
              <tr key={r.label} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={td}>{r.label}</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{r.group}</td>
                <td style={{ ...td, textAlign: 'right', color: '#64748b' }}>{r.comparison}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {r.gap == null ? (
                    <span style={{ color: '#cbd5e1' }}>—</span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        backgroundColor: bandStyle?.bg ?? '#f1f5f9',
                        color: bandStyle?.fg ?? '#475569',
                        border: bandStyle ? `1px solid ${bandStyle.border}` : 'none',
                        fontSize: '0.75rem',
                      }}
                    >
                      {r.gap}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Pathway plans note (no source table yet) */}
      <p
        style={{
          color: '#94a3b8',
          fontSize: '0.6875rem',
          fontStyle: 'italic',
          margin: '10px 0 0',
        }}
      >
        Pathway plans comparison appears once the pathway plans feature ships.
      </p>
    </div>
  )
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  fontWeight: 600,
  color: '#475569',
  fontSize: '0.6875rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const td: React.CSSProperties = {
  padding: '6px 8px',
  color: '#1a1a2e',
}
