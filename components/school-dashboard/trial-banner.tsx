'use client'

import Link from 'next/link'
import type { DashboardMe } from './types'

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.floor(diff / (24 * 3600 * 1000))
}

export function TrialBanner({ me }: { me: DashboardMe }) {
  const school = me.school
  if (!school) return null
  const expires = school.trial_expires_at
  const days = daysUntil(expires)
  const status = school.subscription_status

  if (status === 'active') return null
  if (status === 'expired') {
    return (
      <div style={{ ...box, backgroundColor: '#FEE2E2', borderColor: '#DC2626' }}>
        <strong>Your free period has expired.</strong> Dashboard is read-only. Your data is preserved.
        <Link href="/school/subscribe" style={ctaLink}>Subscribe to restore access</Link>
      </div>
    )
  }

  const label = school.is_founding_school ? 'Founding School' : 'Trial'
  const when = expires ? new Date(expires).toLocaleDateString('en-GB') : null

  if (days !== null && days <= 7) {
    return (
      <div style={{ ...box, backgroundColor: '#FEE2E2', borderColor: '#DC2626' }}>
        <strong>Your free period expires in {days} days.</strong>{' '}
        <Link href="/school/subscribe" style={ctaLink}>Subscribe to continue</Link>
      </div>
    )
  }
  if (days !== null && days <= 30) {
    return (
      <div style={{ ...box, backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }}>
        <strong>Your free period expires in {days} days.</strong> Subscribe to continue access.{' '}
        <Link href="/school/subscribe" style={ctaLink}>Subscribe</Link>
      </div>
    )
  }

  return (
    <div style={{ ...box, backgroundColor: '#ECFDF5', borderColor: '#10B981' }}>
      <strong>{label}</strong> — free {when ? `until ${when}` : 'for 12 months'}.
      {school.is_founding_school && ' You’re one of our first 10 founding schools.'}
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
