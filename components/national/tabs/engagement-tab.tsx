import type { NationalEngagementData } from '@/lib/national/queries'
import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { AuthorityLineChart } from '@/components/authority/charts/AuthorityLineChart'
import { AuthorityMetricCard } from '@/components/authority/charts/AuthorityMetricCard'
import { formatCohortValue } from '@/lib/authority/disclosure'

export interface NationalEngagementTabProps {
  data: NationalEngagementData
}

export function NationalEngagementTab({ data }: NationalEngagementTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Section title="National engagement headline">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <AuthorityMetricCard
            label="Active in last 30 days"
            value={data.national_active_count == null ? '—' : formatCohortValue(data.national_active_count)}
          />
          <AuthorityMetricCard
            label="National activation rate"
            value={data.national_active_pct_30d == null ? '—' : `${data.national_active_pct_30d.toFixed(1)}%`}
          />
        </div>
      </Section>

      <Section title="Weekly active students (last 12 weeks)">
        <AuthorityLineChart
          data={data.weekly_trend.map((w) => ({ label: w.week_start.slice(5), value: w.unique_students }))}
          height={200}
          showAxes
          emptyMessage="Not enough data for a weekly trend yet."
        />
      </Section>

      <Section title="LA activation ranking">
        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: 0 }}>
          Active = student with at least one platform event in the last 30 days. Sorted highest activation first.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={th}>Local authority</th>
                <th style={th}>Type</th>
                <th style={th}>Students</th>
                <th style={th}>Active %</th>
              </tr>
            </thead>
            <tbody>
              {data.la_activation_ranking.map((r) => (
                <tr key={r.authority_code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={td}>{r.authority_name}</td>
                  <td style={td}>
                    {r.is_challenge_authority ? (
                      <span style={{ color: '#1d4ed8', fontWeight: 600, fontSize: '0.75rem' }}>Challenge</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Standard</span>
                    )}
                  </td>
                  <td style={td}>{r.student_count == null ? '—' : formatCohortValue(r.student_count)}</td>
                  <td style={td}>{r.active_pct == null ? '—' : `${r.active_pct.toFixed(1)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Feature adoption (national, by event category)">
        <AuthorityBarChart
          data={data.feature_adoption.map((f) => ({
            label: f.feature,
            value: f.unique_students ?? 0,
            secondary: f.unique_students == null ? '—' : `${formatCohortValue(f.unique_students)} (${f.percentage == null ? '—' : f.percentage.toFixed(1) + '%'})`,
          }))}
          emptyMessage="No engagement data in the current view."
        />
      </Section>
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
