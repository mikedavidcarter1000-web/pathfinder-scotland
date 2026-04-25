// Authority-15: placeholder national dashboard. Authority-16 will fill in
// the subjects / equity / careers tabs.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getNationalStaffContext } from '@/lib/national/auth'
import { NATIONAL_ROLE_LABELS } from '@/lib/national/constants'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '16px',
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'subjects', label: 'Subject choices' },
  { key: 'equity', label: 'Equity' },
  { key: 'careers', label: 'Careers' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'benchmarking', label: 'Benchmarking' },
]

export default async function NationalDashboardPage() {
  const ctx = await getNationalStaffContext()
  if (!ctx) redirect('/auth/sign-in?redirect=/national/dashboard')

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '1200px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#1a1a2e',
              marginBottom: '6px',
            }}
          >
            National dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            {ctx.fullName} · {ctx.organisation} · {NATIONAL_ROLE_LABELS[ctx.role]}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '24px',
            paddingBottom: '12px',
          }}
        >
          {TABS.map((t, i) => (
            <span
              key={t.key}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                backgroundColor: i === 0 ? '#1a1a2e' : '#f1f5f9',
                color: i === 0 ? '#fff' : '#475569',
              }}
            >
              {t.label}
            </span>
          ))}
        </div>

        <div style={card}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#1a1a2e',
              marginBottom: '12px',
            }}
          >
            Coming in Authority-16
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '12px' }}>
            The national tier foundation is in place: opt-in toggling for LAs, materialised views aggregating opted-in
            data, the staff directory, and the audit log. The dashboard tabs (subject choices, equity, careers,
            engagement, benchmarking) and the Challenge Authority comparison view are scheduled for Authority-16.
          </p>
          <ul style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7, paddingLeft: '20px' }}>
            <li>Subject choice trends across opted-in LAs (cross-LA comparison, STEM gender heatmap)</li>
            <li>National SIMD gap analysis and Challenge Authority cohort view</li>
            <li>Career exploration patterns and regional variation</li>
            <li>Cross-LA engagement and adoption comparison</li>
          </ul>
        </div>

        <div style={card}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#1a1a2e', fontSize: '1rem', marginBottom: '8px' }}>
            Quick links
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/national/authorities"
              style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none' }}
            >
              Local authorities →
            </Link>
            <Link
              href="/national/settings"
              style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none' }}
            >
              Settings →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
