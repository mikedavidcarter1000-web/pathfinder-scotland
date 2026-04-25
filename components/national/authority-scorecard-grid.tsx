import Link from 'next/link'
import type { AuthorityScorecard } from '@/lib/national/queries'
import { formatCohortValue } from '@/lib/authority/disclosure'

export interface AuthorityScorecardGridProps {
  scorecards: AuthorityScorecard[]
}

export function AuthorityScorecardGrid({ scorecards }: AuthorityScorecardGridProps) {
  if (scorecards.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          color: '#64748b',
          fontSize: '0.875rem',
          fontStyle: 'italic',
        }}
      >
        No authorities in the current view.
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <th style={th}>Local authority</th>
              <th style={th}>Type</th>
              <th style={th}>Schools</th>
              <th style={th}>Students</th>
              <th style={th}>Active 30d</th>
              <th style={th}>SIMD Q1 %</th>
              <th style={th}>Top 3 subjects</th>
            </tr>
          </thead>
          <tbody>
            {scorecards.map((s) => (
              <tr key={s.authority_code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={td}>
                  <Link
                    href={`/national/authorities/${encodeURIComponent(s.authority_code)}`}
                    style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}
                  >
                    {s.authority_name}
                  </Link>
                </td>
                <td style={td}>
                  {s.is_challenge_authority ? (
                    <span
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Challenge
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Standard</span>
                  )}
                  <span style={{ marginLeft: '6px', color: '#64748b', fontSize: '0.75rem' }}>· {s.urban_rural}</span>
                </td>
                <td style={td}>{s.school_count}</td>
                <td style={td}>{s.student_count == null ? '—' : formatCohortValue(s.student_count)}</td>
                <td style={td}>{s.active_pct_30d == null ? '—' : `${s.active_pct_30d.toFixed(1)}%`}</td>
                <td style={td}>{s.simd_q1_pct == null ? '—' : `${s.simd_q1_pct.toFixed(1)}%`}</td>
                <td style={td}>
                  {s.top_3_subjects.length === 0
                    ? '—'
                    : s.top_3_subjects.map((sub) => sub.subject_name).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = {
  padding: '12px 16px',
  color: '#475569',
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: '0.8125rem',
}

const td: React.CSSProperties = {
  padding: '12px 16px',
  color: '#1a1a2e',
}
