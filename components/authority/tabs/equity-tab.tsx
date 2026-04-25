import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { AuthorityMetricCard } from '@/components/authority/charts/AuthorityMetricCard'
import { DataCompletenessIndicator } from '@/components/authority/data-completeness-indicator'
import { DemographicGroupCard } from '@/components/authority/equity/demographic-group-card'
import { EquityExportButton } from '@/components/authority/equity/equity-export-button'
import { GenderGapTable } from '@/components/authority/equity/gender-gap-table'
import { SimdDistributionChart } from '@/components/authority/equity/simd-distribution-chart'
import { SimdGapTable } from '@/components/authority/equity/simd-gap-table'
import { WaToolUsageTable } from '@/components/authority/equity/wa-tool-usage-table'
import { formatCohortValue } from '@/lib/authority/disclosure'
import type { EquityTabData } from '@/lib/authority/equity-queries'

const DATA_COMPLETENESS_THRESHOLD = 70

export interface EquityTabProps {
  data: EquityTabData
  totalSchoolsInLa: number
}

export function EquityTab({ data, totalSchoolsInLa }: EquityTabProps) {
  if (data.scope_school_count === 0) {
    return (
      <EmptyCard
        title="No schools in this view"
        body="Adjust the filter bar above to widen the school selection. As a QIO, you may also need to ask your LA admin to add schools to your assignment."
      />
    )
  }

  const overallDemographicPct = data.data_completeness.overall_demographic_pct
  const scopeSubtitle =
    totalSchoolsInLa > data.scope_school_count
      ? ` (${data.scope_school_count} of ${totalSchoolsInLa} in your LA)`
      : ''
  const showDemographicCallout = overallDemographicPct < DATA_COMPLETENESS_THRESHOLD

  // Headline summary text for the SIMD gap card.
  const gap = data.simd_gap
  const summaryText =
    gap.measurable === 0
      ? 'No measurable SIMD gap. Both the Q1 and Q5 cohorts must be at least 5 students for analysis. If you have filtered to a single SIMD quintile, clear that filter to compare Q1 and Q5.'
      : `Q1 students currently lag Q5 students on ${gap.q1_lagging} of ${gap.measurable} measured indicators${gap.q5_lagging > 0 ? `; Q5 students lag on ${gap.q5_lagging}` : ''}.`

  // LA-wide Q1 percentage for the distribution chart overlay
  const totalStudents = data.simd_distribution_per_school.reduce(
    (acc, r) => acc + ((r.total ?? 0)),
    0,
  )
  const totalQ1Across = data.simd_distribution_per_school.reduce(
    (acc, r) => acc + ((r.Q1 ?? 0)),
    0,
  )
  const laQ1Pct = totalStudents > 0 ? Math.round((totalQ1Across / totalStudents) * 100) : null

  return (
    <>
      {/* Page header with export button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: 0,
            }}
          >
            Equity and widening access
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>
            SIMD aspiration gap, demographic group engagement, gender balance and widening
            access tool usage across {data.scope_school_count} school
            {data.scope_school_count === 1 ? '' : 's'}{scopeSubtitle}.
          </p>
        </div>
        <EquityExportButton />
      </div>

      {/* Data completeness callout */}
      {showDemographicCallout && (
        <DataCompletenessCallout completeness={data.data_completeness} />
      )}

      {/* Headline cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <AuthorityMetricCard
          label="SIMD Q1 cohort"
          value={formatCohortValue(gap.q1_cohort_size)}
          subtitle="Most-deprived 20% of postcodes"
        />
        <AuthorityMetricCard
          label="SIMD Q5 cohort"
          value={formatCohortValue(gap.q5_cohort_size)}
          subtitle="Least-deprived 20% of postcodes"
        />
        <AuthorityMetricCard
          label="Q1 lagging on"
          value={gap.measurable === 0 ? '—' : `${gap.q1_lagging}/${gap.measurable}`}
          subtitle="Indicators where Q1 trails Q5"
          colour={
            gap.measurable === 0
              ? 'grey'
              : gap.q1_lagging === 0
                ? 'green'
                : gap.q1_lagging >= Math.ceil(gap.measurable / 2)
                  ? 'red'
                  : 'amber'
          }
        />
        <AuthorityMetricCard
          label="Demographic data"
          value={`${overallDemographicPct}%`}
          subtitle="Average demographic flag completeness"
          colour={
            overallDemographicPct >= 80 ? 'green'
              : overallDemographicPct >= 50 ? 'amber'
                : 'red'
          }
        />
      </div>

      {/* SIMD gap analysis */}
      <Panel
        title="SIMD aspiration gap"
        completeness={{
          percentage: data.data_completeness.field_pct.simd,
          label: 'SIMD data',
          tooltip: `${data.data_completeness.field_pct.simd}% of students have a valid SIMD decile`,
        }}
        emptyMessage={gap.measurable === 0 && gap.q1_cohort_size != null && gap.q5_cohort_size != null
          ? 'Both Q1 and Q5 cohorts have at least 5 students, but no metric returned measurable data. Subject and engagement data will populate as schools enter their academic year.'
          : undefined}
      >
        <p style={summaryStyle}>{summaryText}</p>
        <SimdGapTable metrics={gap.metrics} />
        {gap.metrics.some((m) => m.gap != null) && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={subSectionTitle}>Q1 vs Q5 across measured indicators</h4>
            <SimdGapBarChart metrics={gap.metrics} />
          </div>
        )}
      </Panel>

      {/* SIMD quintile distribution per school */}
      <Panel
        title="SIMD distribution per school"
        completeness={{
          percentage: data.data_completeness.field_pct.simd,
          label: 'SIMD data',
          tooltip: 'Each bar shows quintile distribution at that school. Dashed line marks the LA-wide Q1 share.',
        }}
      >
        <SimdDistributionChart rows={data.simd_distribution_per_school} laAverageQ1Pct={laQ1Pct} />
      </Panel>

      {/* Demographic group cards */}
      <Panel
        title="Demographic group engagement"
        completeness={{
          percentage: overallDemographicPct,
          label: 'Demographic flags',
          tooltip:
            'Average completeness across care-experienced, FSM, ASN, EAL, and young carer flags. Schools improve their score by importing SEEMIS data or using the guidance teacher flagging tool.',
        }}
      >
        <p style={summaryStyle}>
          Each card compares the demographic group against everyone else in the current
          filter scope. Cohorts of fewer than 5 students are suppressed.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          <DemographicGroupCard metrics={data.demographic_groups.care_experienced} />
          <DemographicGroupCard metrics={data.demographic_groups.fsm} />
          <DemographicGroupCard metrics={data.demographic_groups.asn} />
          <DemographicGroupCard metrics={data.demographic_groups.eal} />
          <DemographicGroupCard metrics={data.demographic_groups.young_carer} />
        </div>
      </Panel>

      {/* Gender gap analysis */}
      <Panel
        title="Gender gap across all subjects"
        completeness={{
          percentage: data.data_completeness.field_pct.gender,
          label: 'Gender data',
          tooltip:
            'Subjects sorted by largest absolute pp gap between male and female uptake. Top 5 with gaps of 30pp+ are highlighted.',
        }}
      >
        {data.gender_gap.length === 0 ? (
          <p style={emptyTextStyle}>No subject data to display gender gap analysis.</p>
        ) : (
          <>
            {/* Top 10 most-imbalanced bar chart */}
            <h4 style={subSectionTitle}>Top 10 most-imbalanced subjects</h4>
            <AuthorityBarChart
              data={data.gender_gap
                .filter((r) => r.gap_percentage_points != null)
                .slice(0, 10)
                .map((r) => ({
                  label: r.subject_name,
                  value: r.gap_percentage_points ?? 0,
                  secondary: `${(r.gap_percentage_points ?? 0).toFixed(1)}pp`,
                  colour: r.direction === 'female_higher' ? '#b91c1c' : '#1d4ed8',
                }))}
              ariaLabel="Top 10 subjects by gender gap"
            />
            <h4 style={{ ...subSectionTitle, marginTop: '20px' }}>Full subject list (sorted by gap)</h4>
            <GenderGapTable rows={data.gender_gap} highlightTopN={5} />
          </>
        )}
      </Panel>

      {/* Widening access tool usage */}
      <Panel
        title="Widening access tool usage (Q1 vs Q5)"
        completeness={{
          percentage: data.data_completeness.field_pct.simd,
          label: 'Engagement data',
          tooltip:
            'Comparing how SIMD Q1 and Q5 students are using the bursary, entitlements, support and widening access tools. Last 90 days.',
        }}
      >
        <WaToolUsageTable rows={data.wa_tool_usage} />
      </Panel>
    </>
  )
}

function SimdGapBarChart({ metrics }: { metrics: EquityTabData['simd_gap']['metrics'] }) {
  // Render a paired-bar view: each metric shows Q1 then Q5 normalised
  // to a percentage scale where possible. Counts and averages are
  // normalised against the larger of the pair so the bar contrast
  // remains readable.
  const renderable = metrics.filter((m) => m.q1_value != null && m.q5_value != null)
  if (renderable.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {renderable.map((m) => {
        const q1 = m.q1_value ?? 0
        const q5 = m.q5_value ?? 0
        const isPercent = m.metric_unit === 'percent'
        const max = isPercent ? 100 : Math.max(q1, q5, 1) * 1.1
        const q1Pct = (q1 / max) * 100
        const q5Pct = (q5 / max) * 100
        const fmt = (v: number) =>
          isPercent ? `${v.toFixed(1)}%` : v.toFixed(1)
        return (
          <div key={m.metric_key}>
            <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '4px' }}>
              {m.metric_name}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 60px', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#1B3A5C', fontWeight: 600 }}>Q1</span>
              <div style={barTrack}>
                <div style={{ ...barFill, width: `${q1Pct}%`, backgroundColor: '#1B3A5C' }} />
              </div>
              <span style={{ fontSize: '0.75rem', textAlign: 'right' }}>{fmt(q1)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 60px', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#85AAD0', fontWeight: 600 }}>Q5</span>
              <div style={barTrack}>
                <div style={{ ...barFill, width: `${q5Pct}%`, backgroundColor: '#85AAD0' }} />
              </div>
              <span style={{ fontSize: '0.75rem', textAlign: 'right' }}>{fmt(q5)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DataCompletenessCallout({
  completeness,
}: {
  completeness: EquityTabData['data_completeness']
}) {
  const { field_pct, overall_demographic_pct } = completeness
  return (
    <div
      role="status"
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '24px',
      }}
    >
      <p style={{ color: '#92400e', margin: 0, fontWeight: 700 }}>
        Equity metrics depend on demographic data. Currently {overall_demographic_pct}% of
        students have demographic flags populated.
      </p>
      <p style={{ color: '#92400e', margin: '4px 0 8px', fontSize: '0.8125rem' }}>
        Schools can improve this by importing SEEMIS data or using the guidance teacher
        flagging tool. Per-flag completeness:
      </p>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 18px',
          fontSize: '0.75rem',
          color: '#78350f',
        }}
      >
        <li>Gender: {field_pct.gender}%</li>
        <li>SIMD: {field_pct.simd}%</li>
        <li>Care-experienced: {field_pct.care_experienced}%</li>
        <li>ASN: {field_pct.has_asn}%</li>
        <li>FSM: {field_pct.receives_free_school_meals}%</li>
        <li>EAL: {field_pct.eal}%</li>
        <li>Young carer: {field_pct.is_young_carer}%</li>
      </ul>
    </div>
  )
}

const summaryStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#475569',
  fontSize: '0.875rem',
  lineHeight: 1.5,
}

const subSectionTitle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#1a1a2e',
  margin: '0 0 12px',
}

const barTrack: React.CSSProperties = {
  height: '10px',
  borderRadius: '3px',
  backgroundColor: '#f1f5f9',
  overflow: 'hidden',
  position: 'relative',
}

const barFill: React.CSSProperties = {
  height: '100%',
  borderRadius: '3px',
}

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  padding: '24px 0',
  color: '#94a3b8',
  fontStyle: 'italic',
  fontSize: '0.875rem',
  textAlign: 'center',
}

function Panel({
  title,
  completeness,
  emptyMessage,
  children,
}: {
  title: string
  completeness?: { percentage: number; label: string; tooltip?: string }
  emptyMessage?: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: '#1a1a2e',
            margin: 0,
          }}
        >
          {title}
        </h3>
        {completeness && (
          <DataCompletenessIndicator
            completenessPercentage={completeness.percentage}
            label={completeness.label}
            tooltipText={completeness.tooltip}
          />
        )}
      </div>
      {emptyMessage && (
        <p
          style={{
            margin: '0 0 12px',
            fontSize: '0.8125rem',
            color: '#92400e',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '10px 12px',
          }}
        >
          {emptyMessage}
        </p>
      )}
      {children}
    </section>
  )
}

function EmptyCard({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '40px 28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#1a1a2e',
          margin: 0,
        }}
      >
        {title}
      </h2>
      <p style={{ color: '#475569', margin: '12px auto 0', maxWidth: '520px', lineHeight: 1.6 }}>
        {body}
      </p>
    </div>
  )
}
