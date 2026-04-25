import { formatCohortValue } from '@/lib/authority/disclosure'
import type { GenderGapRow } from '@/lib/authority/equity-queries'

export interface GenderGapTableProps {
  rows: GenderGapRow[]
  /** Visual highlight on top N most-imbalanced rows. */
  highlightTopN?: number
  /** Cap rendered rows; defaults to all. Useful when tab needs an "show top 20" preview. */
  limit?: number
}

function formatPct(v: number | null): string {
  if (v == null) return '—'
  return `${v.toFixed(1)}%`
}

function formatGap(v: number | null): string {
  if (v == null) return '—'
  return `${v.toFixed(1)}pp`
}

function directionLabel(d: GenderGapRow['direction']): { label: string; colour: string } {
  if (d == null) return { label: '—', colour: '#94a3b8' }
  if (d === 'balanced') return { label: 'Balanced', colour: '#166534' }
  if (d === 'male_higher') return { label: 'Male-leaning', colour: '#1d4ed8' }
  return { label: 'Female-leaning', colour: '#b91c1c' }
}

export function GenderGapTable({ rows, highlightTopN = 5, limit }: GenderGapTableProps) {
  if (rows.length === 0) {
    return (
      <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '16px 0', margin: 0 }}>
        No subjects to display.
      </p>
    )
  }

  const displayRows = limit != null ? rows.slice(0, limit) : rows

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={th}>Subject</th>
            <th style={{ ...th, textAlign: 'right' }}>Female</th>
            <th style={{ ...th, textAlign: 'right' }}>Male</th>
            <th style={{ ...th, textAlign: 'right' }}>Gap</th>
            <th style={th}>Direction</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((r, idx) => {
            const dir = directionLabel(r.direction)
            const isTop =
              idx < highlightTopN
              && r.gap_percentage_points != null
              && r.gap_percentage_points >= 30
            return (
              <tr
                key={r.subject_id}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: isTop ? '#fef3c7' : undefined,
                }}
              >
                <td style={td}>
                  <span style={{ fontWeight: 600 }}>{r.subject_name}</span>
                  {r.subject_category && (
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '6px' }}>
                      ({r.subject_category})
                    </span>
                  )}
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {formatCohortValue(r.female_count)}{' '}
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatPct(r.female_percentage)}</span>
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {formatCohortValue(r.male_count)}{' '}
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatPct(r.male_percentage)}</span>
                </td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>
                  {formatGap(r.gap_percentage_points)}
                </td>
                <td style={{ ...td, color: dir.colour, fontWeight: 600 }}>{dir.label}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
