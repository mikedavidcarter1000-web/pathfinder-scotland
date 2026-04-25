import type { NationalOverview } from '@/lib/national/queries'
import { formatCohortValue } from '@/lib/authority/disclosure'

const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/London',
})

export interface NationalHeaderProps {
  staffName: string
  organisation: string
  overview: NationalOverview | null
  refreshTimestamp: Date | null
}

export function NationalHeader({ staffName, organisation, overview, refreshTimestamp }: NationalHeaderProps) {
  const refreshLabel = refreshTimestamp ? TIME_FORMAT.format(refreshTimestamp) : 'awaiting first refresh'

  return (
    <section
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px 28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '24px',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: 0,
          }}
        >
          National education insights
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>
          {staffName} · {organisation} · Data refreshed {refreshLabel}
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}
      >
        <Stat label="Authorities opted in" value={overview ? String(overview.total_authorities_opted_in) : '—'} />
        <Stat label="Schools" value={overview ? String(overview.total_schools) : '—'} />
        <Stat
          label="Total students"
          value={overview?.total_students == null ? '—' : formatCohortValue(overview.total_students)}
        />
        <Stat
          label="Active in last 30 days"
          value={overview?.active_students_30d == null ? '—' : formatCohortValue(overview.active_students_30d)}
        />
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
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
