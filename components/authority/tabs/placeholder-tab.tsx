import { DASHBOARD_TABS, type DashboardTab } from '@/lib/authority/filters'

export interface PlaceholderTabProps {
  tab: DashboardTab
}

export function PlaceholderTab({ tab }: PlaceholderTabProps) {
  const meta = DASHBOARD_TABS.find((t) => t.id === tab)
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
        Coming soon
      </p>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#1a1a2e',
          margin: '6px 0 0',
        }}
      >
        {meta?.label ?? 'Coming soon'}
      </h2>
      <p
        style={{
          color: '#475569',
          margin: '12px auto 0',
          maxWidth: '560px',
          lineHeight: 1.6,
        }}
      >
        {meta?.description ?? 'This tab will be available soon.'}
      </p>
    </div>
  )
}
