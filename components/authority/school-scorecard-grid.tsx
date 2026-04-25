import Link from 'next/link'
import { formatCohortValue } from '@/lib/authority/disclosure'
import type { SchoolScorecard } from '@/lib/authority/queries'

const QUALITY_COLOURS: Record<1 | 2 | 3 | 4 | 5, { bg: string; fg: string; label: string }> = {
  5: { bg: '#dcfce7', fg: '#166534', label: 'Excellent' },
  4: { bg: '#d1fae5', fg: '#065f46', label: 'Good' },
  3: { bg: '#fef3c7', fg: '#92400e', label: 'Fair' },
  2: { bg: '#fed7aa', fg: '#9a3412', label: 'Limited' },
  1: { bg: '#fee2e2', fg: '#991b1b', label: 'Sparse' },
}

const LAST_ACTIVITY_FORMAT = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeZone: 'Europe/London',
})

export interface SchoolScorecardGridProps {
  scorecards: SchoolScorecard[]
}

export function SchoolScorecardGrid({ scorecards }: SchoolScorecardGridProps) {
  if (scorecards.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '40px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          textAlign: 'center',
          color: '#64748b',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>No schools to display</p>
        <p style={{ margin: '6px 0 0', fontSize: '0.875rem' }}>
          Adjust your filters or invite schools to join Pathfinder.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflowX: 'auto',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
          minWidth: '920px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
            <Th>School</Th>
            <Th align="right">Students</Th>
            <Th align="right">Activation</Th>
            <Th>Data quality</Th>
            <Th>Top subject</Th>
            <Th align="right">SIMD Q1 %</Th>
            <Th align="right">Engagement</Th>
            <Th>Last activity</Th>
          </tr>
        </thead>
        <tbody>
          {scorecards.map((s) => {
            const dqColour = QUALITY_COLOURS[s.data_quality_score]
            const lastActivity = s.last_activity_at
              ? LAST_ACTIVITY_FORMAT.format(new Date(s.last_activity_at))
              : '—'
            const topSubject = s.top_3_subjects[0]?.subject_name ?? '—'

            return (
              <tr
                key={s.school_id}
                style={{ borderTop: '1px solid #e2e8f0' }}
              >
                <Td>
                  <Link
                    href={`/authority/schools/${encodeURIComponent(s.school_seed_code ?? s.school_id)}`}
                    style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}
                  >
                    {s.school_name}
                  </Link>
                  {s.school_seed_code && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        marginTop: '2px',
                      }}
                    >
                      Seed {s.school_seed_code}
                    </span>
                  )}
                </Td>
                <Td align="right">{formatCohortValue(s.student_count)}</Td>
                <Td align="right">
                  {s.activation_rate_pct == null ? '—' : `${s.activation_rate_pct}%`}
                </Td>
                <Td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '999px',
                      backgroundColor: dqColour.bg,
                      color: dqColour.fg,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {dqColour.label} ({s.data_quality_score}/5)
                  </span>
                </Td>
                <Td>{topSubject}</Td>
                <Td align="right">
                  {s.simd_q1_percentage == null ? '—' : `${s.simd_q1_percentage}%`}
                </Td>
                <Td align="right">
                  {s.engagement_score == null ? '—' : s.engagement_score.toFixed(1)}
                </Td>
                <Td>{lastActivity}</Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      style={{
        padding: '12px 16px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: align,
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td
      style={{
        padding: '14px 16px',
        verticalAlign: 'top',
        textAlign: align,
        color: '#1a1a2e',
      }}
    >
      {children}
    </td>
  )
}
