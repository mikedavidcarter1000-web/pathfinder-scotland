'use client'

import Link from 'next/link'
import { getSubscriptionState } from '@/lib/school/subscription'
import type { DashboardMe } from './types'

export function TrialBanner({ me }: { me: DashboardMe }) {
  const school = me.school
  if (!school) return null
  const state = getSubscriptionState(school)

  if (state.isExpired) {
    return (
      <div style={{ ...box, backgroundColor: '#FEE2E2', borderColor: '#DC2626' }}>
        <strong>Your free trial has expired.</strong> Dashboard access is paused. Your data is preserved.{' '}
        <Link href="/school/subscribe" style={ctaLink}>Subscribe to restore access</Link>
      </div>
    )
  }

  if (state.isCancelled) {
    return (
      <div style={{ ...box, backgroundColor: '#FEE2E2', borderColor: '#DC2626' }}>
        <strong>Your subscription has been cancelled.</strong> Your data is retained.{' '}
        <Link href="/school/subscribe" style={ctaLink}>Resubscribe to restore access</Link>
      </div>
    )
  }

  if (!state.isTrial) return null

  const label = state.isFoundingSchool ? 'Founding school trial' : 'Trial'
  const when = state.trialExpiresAt ? state.trialExpiresAt.toLocaleDateString('en-GB') : null
  const days = state.daysRemaining ?? null

  if (days !== null && days <= 7) {
    return (
      <div style={{ ...box, backgroundColor: '#FEE2E2', borderColor: '#DC2626' }}>
        <strong>Your trial expires in {days} day{days === 1 ? '' : 's'}.</strong> Subscribe to keep your data.{' '}
        <Link href="/school/subscribe" style={ctaLink}>Subscribe now</Link>
      </div>
    )
  }
  if (days !== null && days <= 30) {
    return (
      <div style={{ ...box, backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }}>
        <strong>Your trial expires in {days} days.</strong> Subscribe to keep access to your data.{' '}
        <Link href="/school/subscribe" style={ctaLink}>Subscribe now</Link>
      </div>
    )
  }

  return (
    <div style={{ ...box, backgroundColor: '#ECFDF5', borderColor: '#10B981' }}>
      <strong>{label}</strong>{when ? ` — free until ${when}` : ''}{days !== null ? ` (${days} days remaining)` : ''}.
      {state.isFoundingSchool && ' You’re one of our first 10 founding schools.'}
    </div>
  )
}

const box: React.CSSProperties = {
  padding: '12px 16px',
  border: '1px solid',
  borderRadius: '8px',
  marginBottom: '16px',
  fontSize: '0.9375rem',
}

const ctaLink: React.CSSProperties = {
  marginLeft: '8px',
  fontWeight: 700,
  color: 'var(--pf-blue-700)',
}
