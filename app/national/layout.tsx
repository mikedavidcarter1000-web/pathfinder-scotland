// Authority-15: shell layout for /national/** routes. Auth guard runs in
// each page (RSC) rather than the layout because Next.js doesn't pass
// searchParams to layouts and we need clean per-route redirects.

import Link from 'next/link'
import { NATIONAL_ROUTES } from '@/lib/national/constants'
import { NationalShell } from '@/components/national/national-shell'

const navItem: React.CSSProperties = {
  color: '#475569',
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  padding: '6px 10px',
  borderRadius: '6px',
}

export default function NationalLayout({ children }: { children: React.ReactNode }) {
  return (
    <NationalShell>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div
          className="pf-container"
          style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '12px 16px', flexWrap: 'wrap' }}
        >
          <Link
            href={NATIONAL_ROUTES.dashboard}
            style={{ ...navItem, color: '#1a1a2e', fontWeight: 700, fontSize: '0.9375rem' }}
          >
            Pathfinder National
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <Link href={NATIONAL_ROUTES.dashboard} style={navItem}>
            Dashboard
          </Link>
          <Link href={NATIONAL_ROUTES.authorities} style={navItem}>
            Authorities
          </Link>
          <Link href={NATIONAL_ROUTES.reports} style={navItem}>
            Reports
          </Link>
          <Link href={NATIONAL_ROUTES.exports} style={navItem}>
            Exports
          </Link>
          <Link href={NATIONAL_ROUTES.settings} style={navItem}>
            Settings
          </Link>
        </div>
      </div>
      {children}
    </NationalShell>
  )
}
