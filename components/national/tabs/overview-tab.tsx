import type { NationalOverview, AuthorityScorecard } from '@/lib/national/queries'
import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { AuthorityMetricCard } from '@/components/authority/charts/AuthorityMetricCard'
import { AuthorityScorecardGrid } from '../authority-scorecard-grid'
import { formatCohortValue } from '@/lib/authority/disclosure'

export interface NationalOverviewTabProps {
  overview: NationalOverview
  scorecards: AuthorityScorecard[]
}

const SIMD_COLOURS: Record<string, string> = {
  Q1: '#1B3A5C',
  Q2: '#2E5780',
  Q3: '#5B7FAA',
  Q4: '#8FAAC9',
  Q5: '#C2D2E5',
}

export function NationalOverviewTab({ overview, scorecards }: NationalOverviewTabProps) {
  const { challenge_summary } = overview

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <AuthorityMetricCard label="Authorities opted in" value={String(overview.total_authorities_opted_in)} />
        <AuthorityMetricCard label="Schools" value={String(overview.total_schools)} />
        <AuthorityMetricCard
          label="Total students"
          value={overview.total_students == null ? '—' : formatCohortValue(overview.total_students)}
        />
        <AuthorityMetricCard
          label="Active in last 30 days"
          value={overview.active_students_30d == null ? '—' : formatCohortValue(overview.active_students_30d)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <ChallengeCard
          title={`Challenge Authorities (${challenge_summary.challenge.authority_count})`}
          summary={challenge_summary.challenge}
          colour="#1d4ed8"
        />
        <ChallengeCard
          title={`Other authorities (${challenge_summary.other.authority_count})`}
          summary={challenge_summary.other}
          colour="#475569"
        />
      </div>

      <Section title="National SIMD distribution">
        <AuthorityBarChart
          data={overview.simd_distribution.map((r) => ({
            label: r.quintile + (r.quintile === 'Q1' ? ' (most deprived)' : r.quintile === 'Q5' ? ' (least deprived)' : ''),
            value: r.student_count ?? 0,
            colour: SIMD_COLOURS[r.quintile],
            secondary: r.percentage == null ? '—' : `${r.percentage}%`,
          }))}
          emptyMessage="No SIMD data available."
        />
      </Section>

      <Section title="Top 10 subjects nationally">
        <AuthorityBarChart
          data={overview.top_subjects_national.map((s) => ({
            label: s.subject_name,
            value: s.student_count,
            secondary: s.student_count.toLocaleString('en-GB'),
          }))}
          emptyMessage="No subject data available."
        />
      </Section>

      <Section title={`Local authority scorecards (${scorecards.length})`}>
        <AuthorityScorecardGrid scorecards={scorecards} />
      </Section>
    </div>
  )
}

function ChallengeCard({
  title,
  summary,
  colour,
}: {
  title: string
  summary: { authority_count: number; student_count: number | null; active_pct: number | null; simd_q1_pct: number | null }
  colour: string
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
      <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a2e', fontFamily: "'Space Grotesk', sans-serif" }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
        <SummaryStat label="Students" value={summary.student_count == null ? '—' : formatCohortValue(summary.student_count)} />
        <SummaryStat label="Active 30d" value={summary.active_pct == null ? '—' : `${summary.active_pct.toFixed(1)}%`} />
        <SummaryStat label="SIMD Q1" value={summary.simd_q1_pct == null ? '—' : `${summary.simd_q1_pct.toFixed(1)}%`} />
      </div>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem', color: '#1a1a2e', margin: '2px 0 0' }}>
        {value}
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
