'use client'

import Link from 'next/link'

// Renders in place of premium-only feature content when the school is on
// the standard tier. Not an overlay -- the calling page shows this instead
// of the feature.
export function UpgradePrompt({
  featureName,
  description,
}: {
  featureName: string
  description?: string
}) {
  return (
    <div className="pf-container pt-8 pb-12" style={{ maxWidth: 720 }}>
      <div style={card}>
        <div style={diamond} aria-hidden>♦</div>
        <h1 style={h1}>This feature is available on the Premium plan</h1>
        <p style={{ margin: '8px 0 0', fontSize: '1rem' }}>
          <strong>{featureName}</strong>
          {description ? ` — ${description}` : ''}
        </p>
        <p style={{ margin: '14px 0', fontSize: '0.9375rem', opacity: 0.8 }}>
          Upgrade to unlock DYW employer engagement, parent evening booking, alumni destinations,
          primary transition profiles, school-wide CPD &amp; PRD management, and the curriculum
          rationale generator.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <Link href="/school/subscribe" style={primaryBtn}>Upgrade to Premium &mdash; GBP 2,500/year</Link>
          <Link href="/school/dashboard" style={secondaryBtn}>Or continue with Standard</Link>
        </div>
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--pf-grey-200, #E5E7EB)',
  borderRadius: 12,
  padding: 24,
  textAlign: 'left',
}

const diamond: React.CSSProperties = {
  fontSize: '2rem',
  color: 'var(--pf-blue-700, #1D4ED8)',
  marginBottom: 6,
}

const h1: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: '1.375rem',
  margin: 0,
}

const primaryBtn: React.CSSProperties = {
  padding: '10px 16px',
  background: 'var(--pf-blue-700, #1D4ED8)',
  color: '#fff',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: '0.9375rem',
  textDecoration: 'none',
}

const secondaryBtn: React.CSSProperties = {
  padding: '10px 16px',
  background: '#fff',
  color: 'var(--pf-blue-700, #1D4ED8)',
  border: '1px solid var(--pf-blue-700, #1D4ED8)',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: '0.9375rem',
  textDecoration: 'none',
}
