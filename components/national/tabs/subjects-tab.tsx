import type { NationalSubjectsData } from '@/lib/national/queries'
import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { formatCohortValue } from '@/lib/authority/disclosure'

export interface NationalSubjectsTabProps {
  data: NationalSubjectsData
}

export function NationalSubjectsTab({ data }: NationalSubjectsTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Section title="National subject uptake (top 15)">
        <AuthorityBarChart
          data={data.subjects.slice(0, 15).map((s) => ({
            label: s.subject_name,
            value: s.total_students ?? 0,
            secondary: s.total_students == null ? '—' : formatCohortValue(s.total_students),
          }))}
          emptyMessage="No subject data in the current view."
        />
      </Section>

      <Section title="STEM gender balance (national)">
        {data.stem_gender.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>No STEM data in the current view.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={th}>Subject</th>
                  <th style={th}>Female</th>
                  <th style={th}>Male</th>
                  <th style={th}>Other</th>
                  <th style={th}>Female %</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.stem_gender.map((s) => (
                  <tr key={s.subject_name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={td}>{s.subject_name}</td>
                    <td style={td}>{s.female == null ? '—' : formatCohortValue(s.female)}</td>
                    <td style={td}>{s.male == null ? '—' : formatCohortValue(s.male)}</td>
                    <td style={td}>{s.other == null ? '—' : formatCohortValue(s.other)}</td>
                    <td style={td}>{s.female_pct == null ? '—' : `${s.female_pct.toFixed(1)}%`}</td>
                    <td style={td}>{s.total == null ? '—' : formatCohortValue(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="LA comparison: subject uptake highs and lows">
        {data.la_subject_ranking.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Not enough data for comparison.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={th}>Subject</th>
                  <th style={th}>Highest uptake LA</th>
                  <th style={th}>%</th>
                  <th style={th}>Lowest uptake LA</th>
                  <th style={th}>%</th>
                </tr>
              </thead>
              <tbody>
                {data.la_subject_ranking.map((r) => (
                  <tr key={r.subject_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={td}>{r.subject_name}</td>
                    <td style={td}>{r.high_la?.name ?? '—'}</td>
                    <td style={td}>{r.high_la?.pct == null ? '—' : `${r.high_la.pct.toFixed(1)}%`}</td>
                    <td style={td}>{r.low_la?.name ?? '—'}</td>
                    <td style={td}>{r.low_la?.pct == null ? '—' : `${r.low_la.pct.toFixed(1)}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Subject availability across LAs">
        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: 0 }}>
          Subjects offered in the fewest authorities (out of {data.subject_coverage[0]?.total_authorities ?? 0} in scope).
        </p>
        <AuthorityBarChart
          data={data.subject_coverage.map((c) => ({
            label: c.subject_name,
            value: c.authorities_offering,
            secondary: `${c.authorities_offering} / ${c.total_authorities}`,
          }))}
          emptyMessage="No subject availability data."
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
