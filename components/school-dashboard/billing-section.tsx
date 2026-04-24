'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

type BillingStatus = {
  subscription_tier: 'trial' | 'standard' | 'premium' | 'authority'
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
  trial_expires_at: string | null
  trial_started_at: string | null
  is_founding_school: boolean
  has_stripe_customer: boolean
  has_stripe_subscription: boolean
  next_billing_date: string | null
  cancel_at_period_end: boolean
  cancel_at: string | null
}

export function BillingSection() {
  const toast = useToast()
  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    fetch('/api/school/billing/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStatus(d))
      .finally(() => setLoading(false))
  }, [])

  async function handleManageBilling() {
    setOpening(true)
    try {
      const res = await fetch('/api/school/billing/portal', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        toast.error('Could not open billing portal', json.error || '')
        return
      }
      if (json.url) window.location.href = json.url
    } catch (err) {
      toast.error('Could not open billing portal', (err as Error).message || '')
    } finally {
      setOpening(false)
    }
  }

  if (loading) {
    return (
      <section style={card}>
        <h2 style={h2}>Billing &amp; Subscription</h2>
        <p style={{ opacity: 0.6 }}>Loading billing details…</p>
      </section>
    )
  }
  if (!status) return null

  const tierLabel: Record<typeof status.subscription_tier, string> = {
    trial: 'Trial',
    standard: 'Standard',
    premium: 'Premium',
    authority: 'Authority',
  }

  const nextBillingDate = status.next_billing_date
    ? new Date(status.next_billing_date).toLocaleDateString('en-GB')
    : null
  const trialExpiry = status.trial_expires_at
    ? new Date(status.trial_expires_at).toLocaleDateString('en-GB')
    : null
  const cancelAtFmt = status.cancel_at
    ? new Date(status.cancel_at).toLocaleDateString('en-GB')
    : null

  const statusColour: Record<typeof status.subscription_status, string> = {
    active: '#047857',
    trial: '#1D4ED8',
    expired: '#DC2626',
    cancelled: '#DC2626',
  }

  return (
    <section style={card}>
      <h2 style={h2}>Billing &amp; Subscription</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '8px 0 12px' }}>
        <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>Current plan:</span>
        <strong style={{ fontSize: '1rem' }}>{tierLabel[status.subscription_tier] ?? status.subscription_tier}</strong>
        <span
          style={{
            ...badge,
            color: statusColour[status.subscription_status],
            borderColor: statusColour[status.subscription_status],
          }}
        >
          {status.subscription_status}
        </span>
        {status.is_founding_school && (
          <span style={{ ...badge, color: '#1D4ED8', borderColor: '#1D4ED8', backgroundColor: '#EFF6FF' }}>
            Founding school
          </span>
        )}
      </div>

      {status.subscription_tier === 'trial' && trialExpiry && (
        <p style={{ margin: '4px 0', fontSize: '0.9375rem' }}>
          <strong>Trial expires:</strong> {trialExpiry}
        </p>
      )}

      {status.has_stripe_subscription && nextBillingDate && !status.cancel_at_period_end && (
        <p style={{ margin: '4px 0', fontSize: '0.9375rem' }}>
          <strong>Next billing date:</strong> {nextBillingDate}
        </p>
      )}

      {status.cancel_at_period_end && cancelAtFmt && (
        <p style={{ margin: '4px 0', fontSize: '0.9375rem', color: '#B91C1C' }}>
          <strong>Your subscription will end on {cancelAtFmt}.</strong> Reactivate from the billing portal.
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        <Link href="/school/subscribe" style={btnSecondary}>Change plan</Link>
        {status.has_stripe_customer ? (
          <button onClick={handleManageBilling} disabled={opening} style={btnPrimary}>
            {opening ? 'Opening…' : 'Manage billing'}
          </button>
        ) : (
          <Link href="/school/subscribe" style={btnPrimary}>Subscribe</Link>
        )}
      </div>

      {status.has_stripe_customer && (
        <p style={{ margin: '10px 0 0', fontSize: '0.8125rem', opacity: 0.7 }}>
          The billing portal lets you update your payment method, download invoices, or cancel.
        </p>
      )}
    </section>
  )
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: 8,
  padding: '16px 20px',
  marginTop: 16,
}

const h2: React.CSSProperties = {
  margin: '0 0 6px',
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: '1.125rem',
}

const badge: React.CSSProperties = {
  padding: '2px 10px',
  border: '1px solid',
  borderRadius: 999,
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const btnPrimary: React.CSSProperties = {
  padding: '10px 16px',
  background: 'var(--pf-blue-700, #1D4ED8)',
  color: '#fff',
  borderRadius: 6,
  fontWeight: 700,
  fontSize: '0.875rem',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
}

const btnSecondary: React.CSSProperties = {
  padding: '10px 16px',
  background: '#fff',
  color: 'var(--pf-blue-700, #1D4ED8)',
  border: '1px solid var(--pf-blue-700, #1D4ED8)',
  borderRadius: 6,
  fontWeight: 700,
  fontSize: '0.875rem',
  cursor: 'pointer',
  textDecoration: 'none',
}
