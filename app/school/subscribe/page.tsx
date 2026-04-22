'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const FEATURES = [
  'Full school dashboard access',
  'Unlimited staff accounts',
  'Email support',
  'Annual data refresh',
  'Priority access to new features',
  'SIMD & DYW reporting',
  'CES capacity alignment',
  'PDF and CSV exports',
]

export default function SchoolSubscribePage() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [cap, setCap] = useState<number>(10)

  useEffect(() => {
    fetch('/api/school/register')
      .then((r) => r.json())
      .then((d) => {
        setRemaining(d.remaining)
        setCap(d.cap)
      })
      .catch(() => null)
  }, [])

  const foundingAvailable = (remaining ?? 0) > 0

  const contactHref = `/contact?topic=school-subscription`

  return (
    <div className="pf-container pt-8 pb-12" style={{ maxWidth: '820px' }}>
      <Link href="/school/dashboard" style={{ fontSize: '0.875rem', color: 'var(--pf-blue-700)' }}>&larr; Back to dashboard</Link>

      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '2rem', marginTop: '8px' }}>
        Subscribe to Pathfinder for Schools
      </h1>

      <div style={priceCard}>
        {foundingAvailable ? (
          <>
            <div style={badge}>Founding schools</div>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0' }}>GBP 750 per year</p>
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>
              For our first {cap} founding schools. <strong>{remaining} of {cap} places remaining.</strong>
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
              Standard pricing applies from October 2027.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px' }}>
              All founding school places have been taken
            </p>
            <p style={{ margin: 0 }}>Contact us for current pricing.</p>
          </>
        )}

        <Link href={contactHref} style={cta}>
          Register your interest
        </Link>
      </div>

      <section style={{ marginTop: '24px' }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.25rem' }}>Included</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
          {FEATURES.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </section>
    </div>
  )
}

const priceCard: React.CSSProperties = {
  marginTop: '20px',
  padding: '24px',
  border: '2px solid var(--pf-blue-500)',
  borderRadius: '12px',
  backgroundColor: '#fff',
}
const badge: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 10px',
  backgroundColor: 'var(--pf-blue-700, #1D4ED8)',
  color: '#fff',
  borderRadius: '999px',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}
const cta: React.CSSProperties = {
  marginTop: '16px',
  display: 'inline-block',
  padding: '12px 20px',
  backgroundColor: 'var(--pf-blue-700, #1D4ED8)',
  color: '#fff',
  borderRadius: '8px',
  fontWeight: 700,
  textDecoration: 'none',
}
