'use client'

import { NATIONAL_DASHBOARD_TABS, type NationalDashboardTab } from '@/lib/national/filters'
import { useNationalFilters } from '@/hooks/use-national-filters'

export function NationalDashboardTabs() {
  const { tab, setTab } = useNationalFilters()

  return (
    <nav
      aria-label="National dashboard sections"
      style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '24px',
        overflowX: 'auto',
      }}
    >
      {NATIONAL_DASHBOARD_TABS.map((t) => {
        const active = t.id === tab
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as NationalDashboardTab)}
            aria-current={active ? 'page' : undefined}
            style={{
              padding: '12px 18px',
              border: 'none',
              borderBottom: active ? '2px solid #1d4ed8' : '2px solid transparent',
              background: 'none',
              fontFamily: 'inherit',
              fontSize: '0.9375rem',
              fontWeight: active ? 700 : 500,
              color: active ? '#1d4ed8' : '#64748b',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
