import type { NationalCareersData } from '@/lib/national/queries'
import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { AuthorityMetricCard } from '@/components/authority/charts/AuthorityMetricCard'
import { formatCohortValue } from '@/lib/authority/disclosure'

export interface NationalCareersTabProps {
  data: NationalCareersData
}

export function NationalCareersTab({ data }: NationalCareersTabProps) {
  const { sector_popularity, regional_variation, pathway_split, la_sector_diversity } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Section title="National career sector popularity (last 90 days)">
        <AuthorityBarChart
          data={sector_popularity.map((s) => ({
            label: s.sector_label,
            value: s.unique_students ?? 0,
            secondary: s.unique_students == null ? '—' : `${formatCohortValue(s.unique_students)} (${s.percentage == null ? '—' : s.percentage.toFixed(1) + '%'})`,
          }))}
          emptyMessage="No career sector exploration in the current view."
        />
      </Section>

      <Section title="Regional variation">
        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: 0 }}>
          LAs grouped into urban (Glasgow, Edinburgh, Dundee, Aberdeen), rural (Highland, Western Isles, Orkney, Shetland, Argyll &amp; Bute, D&amp;G, Borders), and mixed (others). Top sector is the most-explored within each bucket.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {regional_variation.map((r) => (
            <div
              key={r.bucket}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a2e' }}>
                {r.label}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: '4px 0 12px' }}>
                {r.authority_count} authorit{r.authority_count === 1 ? 'y' : 'ies'}
              </p>
              <Stat label="Top sector" value={r.top_sector ?? '—'} />
              <Stat label="Top sector %" value={r.top_sector_pct == null ? '—' : `${r.top_sector_pct.toFixed(1)}%`} />
              <Stat label="Avg sectors / explorer" value={r.avg_sectors_per_student == null ? '—' : r.avg_sectors_per_student.toFixed(1)} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Pathway split (national)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <AuthorityMetricCard label="University interest" value={pathway_split.university_pct == null ? '—' : `${pathway_split.university_pct.toFixed(1)}%`} />
          <AuthorityMetricCard label="College interest" value={pathway_split.college_pct == null ? '—' : `${pathway_split.college_pct.toFixed(1)}%`} />
          <AuthorityMetricCard label="Apprenticeship interest" value={pathway_split.apprenticeship_pct == null ? '—' : `${pathway_split.apprenticeship_pct.toFixed(1)}%`} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <AuthorityMetricCard
            label="Challenge LA university %"
            value={pathway_split.challenge_university_pct == null ? '—' : `${pathway_split.challenge_university_pct.toFixed(1)}%`}
            colour="navy"
          />
          <AuthorityMetricCard
            label="Other LA university %"
            value={pathway_split.other_university_pct == null ? '—' : `${pathway_split.other_university_pct.toFixed(1)}%`}
            colour="grey"
          />
        </div>
      </Section>

      <Section title="LA career sector diversity">
        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: 0 }}>
          Average distinct sectors explored per student who explored at least one. Higher = students sampling broader career possibilities.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={th}>Local authority</th>
                <th style={th}>Avg sectors / explorer</th>
                <th style={th}>Exploring %</th>
              </tr>
            </thead>
            <tbody>
              {la_sector_diversity.map((r) => (
                <tr key={r.authority_code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={td}>{r.authority_name}</td>
                  <td style={td}>{r.avg_sectors_per_student == null ? '—' : r.avg_sectors_per_student.toFixed(1)}</td>
                  <td style={td}>{r.exploring_pct == null ? '—' : `${r.exploring_pct.toFixed(1)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <p style={{ color: '#94a3b8', fontSize: '0.6875rem', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1a1a2e', margin: '2px 0 0', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
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
