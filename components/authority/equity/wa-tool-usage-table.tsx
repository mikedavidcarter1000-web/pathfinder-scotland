import { formatCohortValue } from '@/lib/authority/disclosure'
import type { WaToolUsageRow } from '@/lib/authority/equity-queries'

export interface WaToolUsageTableProps {
  rows: WaToolUsageRow[]
}

function formatPct(v: number | null): string {
  if (v == null) return '—'
  return `${v.toFixed(1)}%`
}

function formatGap(v: number | null): string {
  if (v == null) return '—'
  return `${v.toFixed(1)}pp`
}

export function WaToolUsageTable({ rows }: WaToolUsageTableProps) {
  if (rows.length === 0) {
    return (
      <p style={emptyStyle}>
        Widening access tool usage data will appear as students use the bursary finder,
        entitlements checker, and support hub.
      </p>
    )
  }

  // If every row is null, show an empty state instead of a table of dashes.
  const anyData = rows.some(
    (r) => r.q1_unique_users != null || r.q5_unique_users != null,
  )

  if (!anyData) {
    return (
      <p style={emptyStyle}>
        Widening access tool usage data will appear as students use the bursary finder,
        entitlements checker, and support hub.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={th}>Tool</th>
            <th style={{ ...th, textAlign: 'right' }}>Q1 users</th>
            <th style={{ ...th, textAlign: 'right' }}>Q1 %</th>
            <th style={{ ...th, textAlign: 'right' }}>Q5 users</th>
            <th style={{ ...th, textAlign: 'right' }}>Q5 %</th>
            <th style={{ ...th, textAlign: 'right' }}>Gap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.tool_key} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ ...td, fontWeight: 600 }}>{r.tool_label}</td>
              <td style={{ ...td, textAlign: 'right' }}>{formatCohortValue(r.q1_unique_users)}</td>
              <td style={{ ...td, textAlign: 'right' }}>{formatPct(r.q1_percentage)}</td>
              <td style={{ ...td, textAlign: 'right' }}>{formatCohortValue(r.q5_unique_users)}</td>
              <td style={{ ...td, textAlign: 'right' }}>{formatPct(r.q5_percentage)}</td>
              <td style={{ ...td, textAlign: 'right' }}>{formatGap(r.gap_percentage_points)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p
        style={{
          color: '#64748b',
          fontSize: '0.75rem',
          margin: '12px 0 0',
        }}
      >
        Comparing SIMD Q1 (most deprived) and Q5 (least deprived) cohorts. Tracks last
        90 days of activity. Cohorts and counts below 5 are suppressed.
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
}

const emptyStyle: React.CSSProperties = {
  margin: 0,
  padding: '24px 0',
  color: '#94a3b8',
  fontStyle: 'italic',
  fontSize: '0.875rem',
  textAlign: 'center',
}
