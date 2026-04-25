import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { AuthorityLineChart } from '@/components/authority/charts/AuthorityLineChart'
import { AuthorityMetricCard } from '@/components/authority/charts/AuthorityMetricCard'
import { DataCompletenessIndicator } from '@/components/authority/data-completeness-indicator'
import { SchoolScorecardGrid } from '@/components/authority/school-scorecard-grid'
import { formatCohortValue } from '@/lib/authority/disclosure'
import type { AuthorityOverviewMetrics, SchoolScorecard } from '@/lib/authority/queries'

const SIMD_COLOURS: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', string> = {
  Q1: '#1B3A5C',
  Q2: '#3F5F86',
  Q3: '#6285AE',
  Q4: '#85AAD0',
  Q5: '#AED0EE',
}

const SIMD_LABELS: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', string> = {
  Q1: 'Q1 (most deprived)',
  Q2: 'Q2',
  Q3: 'Q3',
  Q4: 'Q4',
  Q5: 'Q5 (least deprived)',
}

const WEEK_LABEL_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  timeZone: 'Europe/London',
})

export interface OverviewTabProps {
  metrics: AuthorityOverviewMetrics
  scorecards: SchoolScorecard[]
  totalSchoolsInLa: number
}

export function OverviewTab({ metrics, scorecards, totalSchoolsInLa }: OverviewTabProps) {
  if (totalSchoolsInLa === 0) {
    return (
      <EmptyCard
        title="No schools connected yet"
        body={
          <>
            No schools in your local authority area are currently on Pathfinder. Schools can register at{' '}
            <a href="https://pathfinderscot.co.uk/school/register" style={{ color: '#1d4ed8' }}>
              pathfinderscot.co.uk/school/register
            </a>
            . Once a school joins, their aggregated data will appear here.
          </>
        }
      />
    )
  }

  if (metrics.total_schools === 0) {
    return (
      <EmptyCard
        title="No schools in this view"
        body="Adjust the filter bar above to widen the school selection. As a QIO, you may also need to ask your LA admin to add schools to your assignment."
      />
    )
  }

  const totalStudents = metrics.total_students ?? 0
  const noStudents = totalStudents === 0

  return (
    <>
      {/* Data completeness banner */}
      <DataCompletenessBanner
        scorecards={scorecards}
        totalSchoolsInLa={totalSchoolsInLa}
      />

      {/* Headline metric cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <AuthorityMetricCard
          label="Total students"
          value={formatCohortValue(metrics.total_students)}
          subtitle={`Across ${metrics.total_schools} school${metrics.total_schools === 1 ? '' : 's'}`}
        />
        <AuthorityMetricCard
          label="Active in last 30 days"
          value={formatCohortValue(metrics.active_students_30d)}
          subtitle={
            totalStudents > 0 && metrics.active_students_30d != null
              ? `${Math.round((metrics.active_students_30d / totalStudents) * 100)}% of students`
              : 'No active students yet'
          }
          colour={metrics.active_students_30d && metrics.active_students_30d > 0 ? 'green' : 'grey'}
        />
        <AuthorityMetricCard
          label="Data quality"
          value={metrics.overall_data_quality == null ? '—' : `${metrics.overall_data_quality}/5`}
          subtitle={dataQualitySubtitle(metrics.overall_data_quality)}
          colour={dataQualityColour(metrics.overall_data_quality)}
        />
        <AuthorityMetricCard
          label="Schools connected"
          value={String(metrics.total_schools)}
          subtitle={
            totalSchoolsInLa === metrics.total_schools
              ? 'All schools in scope'
              : `of ${totalSchoolsInLa} in your LA`
          }
        />
      </div>

      {/* Two-column layout: SIMD distribution + top subjects */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Panel
          title="SIMD distribution"
          completeness={{
            percentage: metrics.simd_data_completeness_pct,
            label: 'SIMD data',
            tooltip: `${metrics.simd_data_completeness_pct}% of students have a valid SIMD decile`,
          }}
          emptyMessage={
            metrics.simd_data_completeness_pct < 50
              ? `SIMD data requires student postcodes. ${metrics.simd_data_completeness_pct}% of students have postcodes recorded.`
              : undefined
          }
        >
          {noStudents || metrics.simd_distribution.length === 0 ? (
            <p style={emptyTextStyle}>No SIMD data to display.</p>
          ) : (
            <AuthorityBarChart
              data={metrics.simd_distribution
                .filter((d) => d.student_count != null)
                .map((d) => ({
                  label: SIMD_LABELS[d.quintile],
                  value: d.student_count ?? 0,
                  colour: SIMD_COLOURS[d.quintile],
                  secondary:
                    d.percentage != null
                      ? `${d.student_count?.toLocaleString('en-GB')} (${d.percentage}%)`
                      : formatCohortValue(d.student_count),
                }))}
              ariaLabel="Student count per SIMD quintile"
            />
          )}
        </Panel>

        <Panel
          title="Top subjects"
          completeness={{
            percentage:
              totalSchoolsInLa > 0
                ? Math.round((metrics.subject_data_completeness_schools / totalSchoolsInLa) * 100)
                : 0,
            label: 'Subject choice data',
            tooltip: `${metrics.subject_data_completeness_schools} of ${totalSchoolsInLa} schools have subject choice data for the current view`,
          }}
        >
          {metrics.top_subjects.length === 0 ? (
            <p style={emptyTextStyle}>
              No subject choices recorded for the current filters. Subject data appears as schools run their choice rounds.
            </p>
          ) : (
            <AuthorityBarChart
              data={metrics.top_subjects.map((s) => {
                const pct = totalStudents > 0
                  ? Math.round((s.student_count / totalStudents) * 100)
                  : null
                return {
                  label: s.subject_name,
                  value: s.student_count,
                  secondary: pct != null
                    ? `${s.student_count.toLocaleString('en-GB')} (${pct}%)`
                    : s.student_count.toLocaleString('en-GB'),
                }
              })}
              ariaLabel="Top 10 subjects by student count"
            />
          )}
        </Panel>
      </div>

      {/* Engagement trend */}
      <Panel
        title="Engagement trend (last 12 weeks)"
        completeness={{
          percentage:
            totalSchoolsInLa > 0
              ? Math.round((metrics.engagement_active_school_count / totalSchoolsInLa) * 100)
              : 0,
          label: 'Engagement data',
          tooltip: `Based on ${metrics.engagement_active_school_count} school${metrics.engagement_active_school_count === 1 ? '' : 's'} with active tracking`,
        }}
      >
        <AuthorityLineChart
          data={metrics.engagement_trend.map((e) => ({
            label: WEEK_LABEL_FORMAT.format(new Date(e.week_start)),
            value: e.unique_students,
          }))}
          showAxes
          height={140}
          emptyMessage="Engagement tracking is active. Data will appear here as students use the platform."
        />
      </Panel>

      <div style={{ marginTop: '24px' }}>
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: '0 0 12px',
          }}
        >
          School scorecard
        </h2>
        <SchoolScorecardGrid scorecards={scorecards} />
      </div>
    </>
  )
}

function dataQualityColour(score: 1 | 2 | 3 | 4 | 5 | null) {
  if (score == null) return 'grey' as const
  if (score >= 4) return 'green' as const
  if (score === 3) return 'amber' as const
  return 'red' as const
}

function dataQualitySubtitle(score: 1 | 2 | 3 | 4 | 5 | null): string {
  if (score == null) return 'Awaiting demographic data'
  if (score >= 4) return 'Demographic data is complete'
  if (score === 3) return 'Demographic data partially populated'
  return 'Demographic data incomplete'
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

function DataCompletenessBanner({
  scorecards,
  totalSchoolsInLa,
}: {
  scorecards: SchoolScorecard[]
  totalSchoolsInLa: number
}) {
  if (scorecards.length === 0) return null
  const lowQuality = scorecards.filter((s) => s.data_quality_score < 3).length
  if (lowQuality === 0) return null
  const completeCount = totalSchoolsInLa - lowQuality
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
      <p style={{ color: '#92400e', margin: 0, fontWeight: 600 }}>
        Data completeness: {completeCount} of {totalSchoolsInLa} schools have complete demographic data.
      </p>
      <p style={{ color: '#92400e', margin: '4px 0 0', fontSize: '0.8125rem' }}>
        Schools with incomplete data may not appear accurately in equity metrics. Schools can improve their score by running a SEEMIS import in their school portal.
      </p>
    </div>
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
