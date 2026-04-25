import type { NationalEquityData } from '@/lib/national/queries'
import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { AuthorityMetricCard } from '@/components/authority/charts/AuthorityMetricCard'
import { formatCohortValue } from '@/lib/authority/disclosure'

export interface NationalEquityTabProps {
  data: NationalEquityData
}

export function NationalEquityTab({ data }: NationalEquityTabProps) {
  const { simd_summary, la_equity_gap, challenge_vs_other, demographic_groups } = data

  const sortedGap = [...la_equity_gap].sort((a, b) => (b.gap_pct_points ?? -Infinity) - (a.gap_pct_points ?? -Infinity))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Section title="National SIMD activity gap">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <AuthorityMetricCard
            label="SIMD Q1 students"
            value={simd_summary.q1_count == null ? '—' : formatCohortValue(simd_summary.q1_count)}
            subtitle="Most deprived"
          />
          <AuthorityMetricCard
            label="SIMD Q5 students"
            value={simd_summary.q5_count == null ? '—' : formatCohortValue(simd_summary.q5_count)}
            subtitle="Least deprived"
          />
          <AuthorityMetricCard
            label="Q1 active in 30d"
            value={simd_summary.q1_active_pct == null ? '—' : `${simd_summary.q1_active_pct.toFixed(1)}%`}
            colour={simd_summary.q1_active_pct != null && simd_summary.q5_active_pct != null && simd_summary.q1_active_pct < simd_summary.q5_active_pct ? 'amber' : 'navy'}
          />
          <AuthorityMetricCard
            label="Q5 active in 30d"
            value={simd_summary.q5_active_pct == null ? '—' : `${simd_summary.q5_active_pct.toFixed(1)}%`}
          />
        </div>
      </Section>

      <Section title="Challenge Authorities vs other LAs">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <ChallengeStat
            title="Challenge Authorities"
            colour="#1d4ed8"
            q1Pct={challenge_vs_other.challenge.q1_pct}
            q1ActivePct={challenge_vs_other.challenge.q1_active_pct}
          />
          <ChallengeStat
            title="Other authorities"
            colour="#475569"
            q1Pct={challenge_vs_other.other.q1_pct}
            q1ActivePct={challenge_vs_other.other.q1_active_pct}
          />
        </div>
      </Section>

      <Section title="LA equity gap ranking">
        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: 0 }}>
          Gap = SIMD Q5 active% − SIMD Q1 active%. Positive values mean the most-affluent quintile is more active than the most-deprived. Sorted largest gap first.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={th}>Local authority</th>
                <th style={th}>Type</th>
                <th style={th}>Q1 students</th>
                <th style={th}>Q5 students</th>
                <th style={th}>Q1 active %</th>
                <th style={th}>Q5 active %</th>
                <th style={th}>Gap (pp)</th>
              </tr>
            </thead>
            <tbody>
              {sortedGap.map((r) => (
                <tr key={r.authority_code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={td}>{r.authority_name}</td>
                  <td style={td}>
                    {r.is_challenge_authority ? (
                      <span style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.75rem' }}>Challenge</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Standard</span>
                    )}
                  </td>
                  <td style={td}>{r.q1_count == null ? '—' : formatCohortValue(r.q1_count)}</td>
                  <td style={td}>{r.q5_count == null ? '—' : formatCohortValue(r.q5_count)}</td>
                  <td style={td}>{r.q1_active_pct == null ? '—' : `${r.q1_active_pct.toFixed(1)}%`}</td>
                  <td style={td}>{r.q5_active_pct == null ? '—' : `${r.q5_active_pct.toFixed(1)}%`}</td>
                  <td style={{ ...td, fontWeight: 600, color: r.gap_pct_points != null && r.gap_pct_points > 10 ? '#991b1b' : '#1a1a2e' }}>
                    {r.gap_pct_points == null ? '—' : `${r.gap_pct_points > 0 ? '+' : ''}${r.gap_pct_points.toFixed(1)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Demographic group engagement (national, per-LA suppressed)">
        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: 0 }}>
          Counts below 5 per LA are suppressed from the national total to prevent re-identification within small cohorts.
        </p>
        <AuthorityBarChart
          data={demographic_groups.map((g) => ({
            label: g.label,
            value: g.student_count ?? 0,
            secondary: g.student_count == null ? '—' : `${formatCohortValue(g.student_count)} (${g.active_pct == null ? '—' : g.active_pct.toFixed(1) + '% active'})`,
          }))}
          emptyMessage="No demographic data available at the national level."
        />
      </Section>
    </div>
  )
}

function ChallengeStat({
  title,
  colour,
  q1Pct,
  q1ActivePct,
}: {
  title: string
  colour: string
  q1Pct: number | null
  q1ActivePct: number | null
}) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${colour}`,
      }}
    >
      <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#1a1a2e' }}>
        {title}
      </h3>
      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '0.6875rem', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>Q1 share</p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, margin: '4px 0 0', color: '#1a1a2e' }}>
            {q1Pct == null ? '—' : `${q1Pct.toFixed(1)}%`}
          </p>
        </div>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '0.6875rem', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>Q1 active 30d</p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, margin: '4px 0 0', color: '#1a1a2e' }}>
            {q1ActivePct == null ? '—' : `${q1ActivePct.toFixed(1)}%`}
          </p>
        </div>
      </div>
    </div>
  )
}

const th: React.CSSProperties = { padding: '10px 12px', color: '#475569', fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.8125rem' }
const td: React.CSSProperties = { padding: '10px 12px', color: '#1a1a2e' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>{title}</h2>
      {children}
    </section>
  )
}
