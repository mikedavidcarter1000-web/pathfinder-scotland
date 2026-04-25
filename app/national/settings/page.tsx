// Authority-15: national tier settings index. Currently routes to staff
// management. Authority-17 will add audit log viewer and export config.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getNationalStaffContext } from '@/lib/national/auth'
import { NATIONAL_ROUTES } from '@/lib/national/constants'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '12px',
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
}

export default async function NationalSettingsPage() {
  const ctx = await getNationalStaffContext()
  if (!ctx) redirect('/auth/sign-in?redirect=/national/settings')

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '760px' }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1a1a2e',
            marginBottom: '8px',
          }}
        >
          National tier settings
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9375rem' }}>
          Manage staff and view national-tier configuration.
        </p>

        <Link href={NATIONAL_ROUTES.staffSettings} style={card}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1a1a2e',
              marginBottom: '4px',
            }}
          >
            Staff
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            View the national staff directory. {ctx.isAdmin ? 'Create new staff records and manage roles.' : 'Read-only for analysts.'}
          </p>
        </Link>

        <div style={{ ...card, opacity: 0.7 }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1a1a2e',
              marginBottom: '4px',
            }}
          >
            Audit log
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Coming in Authority-17. Captures every dashboard query, export, and staff change made through the national
            tier.
          </p>
        </div>
      </div>
    </main>
  )
}
