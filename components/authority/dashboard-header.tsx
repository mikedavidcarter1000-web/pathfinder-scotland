import { formatCohortValue } from '@/lib/authority/disclosure'
import type { AuthorityOverviewMetrics } from '@/lib/authority/queries'

export interface DashboardHeaderProps {
  authorityName: string
  subscriptionTier: string | null
  totalSchools: number
  metrics: AuthorityOverviewMetrics | null
  refreshTimestamp: Date | null
}

const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/London',
})

export function DashboardHeader({
  authorityName,
  subscriptionTier,
  totalSchools,
  metrics,
  refreshTimestamp,
}: DashboardHeaderProps) {
  const refreshLabel = refreshTimestamp
    ? TIME_FORMAT.format(refreshTimestamp)
    : 'awaiting first refresh'

  const totalStudentsLabel = metrics?.total_students == null
    ? '—'
    : formatCohortValue(metrics.total_students)

  const activeStudentsLabel = metrics?.active_students_30d == null
    ? '—'
    : formatCohortValue(metrics.active_students_30d)

  const dqScore = metrics?.overall_data_quality
  const dqLabel = dqScore == null ? '—' : `${dqScore}/5`

  return (
    <section
      aria-labelledby="dashboard-header-heading"
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px 28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1
            id="dashboard-header-heading"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: 0,
            }}
          >
            {authorityName}
          </h1>
          <p
            style={{
              color: '#64748b',
              fontSize: '0.875rem',
              margin: '4px 0 0',
            }}
          >
            {subscriptionTier ? `${subscriptionTier} plan` : 'Authority portal'} · Data refreshed {refreshLabel}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
        }}
      >
        <SummaryStat label="Schools connected" value={String(totalSchools)} />
        <SummaryStat label="Total students" value={totalStudentsLabel} />
        <SummaryStat label="Active in last 30 days" value={activeStudentsLabel} />
        <SummaryStat label="Data quality" value={dqLabel} />
      </div>
    </section>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#1a1a2e',
          margin: '4px 0 0',
        }}
      >
        {value}
      </p>
    </div>
  )
}
