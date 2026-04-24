'use client'

import Link from 'next/link'
import { getSubscriptionState, STANDARD_PRICE_GBP, PREMIUM_PRICE_GBP } from '@/lib/school/subscription'
import type { DashboardMe } from './types'

// Full-page overlay shown when a school's trial has expired or subscription
// has been cancelled. The dashboard content is still rendered underneath
// (blurred) so the school can see their data is preserved -- creating
// subscribe urgency without data-loss anxiety.
export function SubscriptionOverlay({ me }: { me: DashboardMe }) {
  const school = me.school
  if (!school) return null
  const state = getSubscriptionState(school)

  if (!state.showUpgradePrompt) return null

  const title = state.isCancelled ? 'Your subscription has been cancelled' : 'Your free trial has ended'
  const lead = state.isCancelled
    ? 'Your data is retained. Resubscribe to restore access.'
    : 'Your data is safe and waiting for you. Subscribe to continue.'

  return (
    <div style={scrim} role="dialog" aria-modal="true" aria-labelledby="subscription-overlay-title">
      <div style={card}>
        <h2 id="subscription-overlay-title" style={h2}>{title}</h2>
        <p style={{ margin: '8px 0 20px', fontSize: '1rem' }}>{lead}</p>

        <div style={grid}>
          <div style={planCard}>
            <h3 style={planHeading}>Standard</h3>
            <p style={priceStyle}>GBP {STANDARD_PRICE_GBP.toLocaleString('en-GB')}<span style={perYear}> / year</span></p>
            <ul style={bullets}>
              <li>Grade tracking with custom metrics</li>
              <li>Guidance hub with student profiles</li>
              <li>Leadership analytics dashboard</li>
              <li>HGIOS4 inspection evidence</li>
              <li>SIMD equity analysis</li>
              <li>SQA results import and value-added</li>
              <li>Parent reports (email and PDF)</li>
            </ul>
          </div>
          <div style={{ ...planCard, borderColor: 'var(--pf-blue-700, #1D4ED8)' }}>
            <h3 style={{ ...planHeading, color: 'var(--pf-blue-700, #1D4ED8)' }}>Premium</h3>
            <p style={priceStyle}>GBP {PREMIUM_PRICE_GBP.toLocaleString('en-GB')}<span style={perYear}> / year</span></p>
            <ul style={bullets}>
              <li>Everything in Standard</li>
              <li>DYW employer engagement dashboard</li>
              <li>Parent evening booking</li>
              <li>Alumni destinations tracking</li>
              <li>Primary transition profiles</li>
              <li>CPD and PRD management</li>
              <li>Curriculum rationale generator</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, justifyContent: 'center' }}>
          <Link href="/school/subscribe" style={primaryBtn}>Subscribe now</Link>
          <Link href="/contact?topic=school-subscription" style={secondaryBtn}>Contact us</Link>
        </div>
      </div>
    </div>
  )
}

const scrim: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(3px)',
  WebkitBackdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 60,
}

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 24,
  maxWidth: 780,
  width: '100%',
  boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
  maxHeight: '90vh',
  overflowY: 'auto',
}

const h2: React.CSSProperties = {
  margin: 0,
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: '1.5rem',
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 12,
}

const planCard: React.CSSProperties = {
  border: '2px solid var(--pf-grey-200, #E5E7EB)',
  borderRadius: 8,
  padding: 16,
  background: '#fff',
}

const planHeading: React.CSSProperties = {
  margin: 0,
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: '1.125rem',
}

const priceStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  margin: '6px 0 10px',
}

const perYear: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 400,
  opacity: 0.7,
}

const bullets: React.CSSProperties = {
  paddingLeft: 18,
  margin: 0,
  fontSize: '0.875rem',
  lineHeight: 1.6,
}

const primaryBtn: React.CSSProperties = {
  padding: '12px 20px',
  background: 'var(--pf-blue-700, #1D4ED8)',
  color: '#fff',
  borderRadius: 8,
  fontWeight: 700,
  textDecoration: 'none',
}

const secondaryBtn: React.CSSProperties = {
  padding: '12px 20px',
  background: '#fff',
  color: 'var(--pf-blue-700, #1D4ED8)',
  border: '1px solid var(--pf-blue-700, #1D4ED8)',
  borderRadius: 8,
  fontWeight: 700,
  textDecoration: 'none',
}
