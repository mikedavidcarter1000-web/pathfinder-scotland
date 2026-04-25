'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Invoice = {
  id: string
  number: string | null
  amount: number
  currency: string
  status: string | null
  hostedUrl: string | null
  pdfUrl: string | null
  createdAt: string
}

type SubscriptionData = {
  authority: {
    id: string
    name: string
    subscription_tier: string
    subscription_status: string
    trial_started_at: string | null
    trial_expires_at: string | null
    has_stripe_customer: boolean
    has_stripe_subscription: boolean
  }
  schoolCount: number
  pricing: {
    annual: number
    annualPounds: number
    base: number
    schoolCount: number
    perSchoolBreakdown: Array<{ range: string; count: number; rate: number; subtotal: number }>
    savingsVsIndividual: number
  }
  nextBillingDate: string | null
  cancelAtPeriodEnd: boolean
  cancelAt: string | null
  invoices: Invoice[]
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
}

function formatGbp(amount: number, currency = 'gbp'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(iso: string | null): string {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('en-GB')
}

function statusBadgeColour(status: string, isTrial: boolean): { bg: string; fg: string; label: string } {
  if (isTrial) return { bg: '#eff6ff', fg: '#1d4ed8', label: 'TRIAL' }
  switch (status) {
    case 'active':
      return { bg: '#ecfdf5', fg: '#047857', label: 'ACTIVE' }
    case 'expired':
      return { bg: '#fff7ed', fg: '#b45309', label: 'PAST DUE' }
    case 'cancelled':
      return { bg: '#fef2f2', fg: '#b91c1c', label: 'CANCELLED' }
    case 'pending':
      return { bg: '#f3f4f6', fg: '#374151', label: 'PENDING' }
    default:
      return { bg: '#f3f4f6', fg: '#374151', label: status.toUpperCase() }
  }
}

export function SubscriptionManageClient() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/authority/subscription')
        const body = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(body.error ?? 'Could not load subscription.')
          return
        }
        setData(body as SubscriptionData)
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Network error.')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/authority/subscription/portal', { method: 'POST' })
      const body = await res.json()
      if (!res.ok || !body.url) {
        setError(body.error ?? 'Could not open the billing portal.')
        return
      }
      window.location.href = body.url
    } catch (err) {
      console.error(err)
      setError('Network error opening billing portal.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (error) {
    return (
      <main style={{ padding: '40px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ color: '#b91c1c' }}>{error}</p>
        <p style={{ marginTop: '16px' }}>
          <Link href="/authority/dashboard" style={{ color: '#3b82f6' }}>
            Back to dashboard
          </Link>
        </p>
      </main>
    )
  }

  if (!data) {
    return <p style={{ padding: '32px' }}>Loading subscription details...</p>
  }

  const { authority, pricing, schoolCount, nextBillingDate, cancelAtPeriodEnd, cancelAt, invoices } =
    data
  // Trial = active + trial_expires_at in the future. The DB CHECK on
  // local_authorities.subscription_status only allows
  // pending|active|expired|cancelled, so trial state is derived from
  // the trial_expires_at timestamp, not stored as its own status.
  const isTrial = authority.subscription_status === 'active'
    && !!authority.trial_expires_at
    && new Date(authority.trial_expires_at).getTime() > Date.now()
  const isExpired = authority.subscription_status === 'expired'
  const isCancelled = authority.subscription_status === 'cancelled'
  const badge = statusBadgeColour(authority.subscription_status, isTrial)

  return (
    <main style={{ padding: '40px 24px', maxWidth: '960px', margin: '0 auto' }}>
      <Link
        href="/authority/dashboard"
        style={{ color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'none' }}
      >
        &larr; Back to dashboard
      </Link>
      <h1
        style={{
          fontSize: '2rem',
          fontFamily: "'Space Grotesk', sans-serif",
          margin: '12px 0 6px',
        }}
      >
        Subscription
      </h1>
      <p style={{ color: '#4b5563', marginBottom: '24px' }}>{authority.name}</p>

      <section style={{ ...cardStyle, marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '8px' }}>
              Current plan
            </h2>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '999px',
                background: badge.bg,
                color: badge.fg,
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              {badge.label} -- {authority.subscription_tier}
            </span>
            {isTrial && (
              <p style={{ marginTop: '12px', color: '#1d4ed8' }}>
                Founding-authority trial. Standard pricing applies from{' '}
                {formatDate(authority.trial_expires_at)}.
              </p>
            )}
            {isExpired && (
              <p style={{ marginTop: '12px', color: '#b45309' }}>
                Last invoice failed. Update the payment method in the billing portal to
                continue access.
              </p>
            )}
            {isCancelled && (
              <p style={{ marginTop: '12px', color: '#b91c1c' }}>
                Subscription cancelled.{' '}
                <Link href="/authority/subscribe" style={{ color: '#1d4ed8' }}>
                  Resubscribe
                </Link>{' '}
                to restore access.
              </p>
            )}
            {cancelAtPeriodEnd && (
              <p style={{ marginTop: '12px', color: '#b45309' }}>
                Set to cancel on {formatDate(cancelAt ?? nextBillingDate)}. Reverse this in
                the billing portal.
              </p>
            )}
          </div>
          {authority.has_stripe_customer && (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 600,
                cursor: portalLoading ? 'wait' : 'pointer',
                opacity: portalLoading ? 0.6 : 1,
              }}
            >
              {portalLoading ? 'Opening...' : 'Manage subscription'}
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '20px',
          }}
        >
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8125rem', margin: 0 }}>
              Next billing date
            </p>
            <p style={{ fontWeight: 600, margin: '4px 0 0' }}>{formatDate(nextBillingDate)}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8125rem', margin: 0 }}>Annual cost</p>
            <p style={{ fontWeight: 600, margin: '4px 0 0' }}>
              {formatGbp(pricing.annualPounds)}
            </p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.8125rem', margin: 0 }}>
              Schools covered
            </p>
            <p style={{ fontWeight: 600, margin: '4px 0 0' }}>{schoolCount}</p>
          </div>
        </div>
      </section>

      <section style={{ ...cardStyle, marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '12px' }}>
          Pricing breakdown
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 0' }}>Base platform fee</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatGbp(pricing.base)}</td>
            </tr>
            {pricing.perSchoolBreakdown.map((tier) =>
              tier.count > 0 ? (
                <tr key={tier.range}>
                  <td style={{ padding: '6px 0' }}>
                    Schools {tier.range}: {tier.count} &times; {formatGbp(tier.rate)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatGbp(tier.subtotal)}
                  </td>
                </tr>
              ) : null
            )}
            <tr style={{ borderTop: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 0 6px', fontWeight: 700 }}>Total per year</td>
              <td
                style={{
                  padding: '12px 0 6px',
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                }}
              >
                {formatGbp(pricing.annualPounds)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '12px' }}>
          Recent invoices
        </h2>
        {invoices.length === 0 ? (
          <p style={{ color: '#6b7280', margin: 0 }}>No invoices yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: '0.8125rem' }}>
                <th style={{ padding: '6px 0' }}>Date</th>
                <th style={{ padding: '6px 0' }}>Number</th>
                <th style={{ padding: '6px 0' }}>Amount</th>
                <th style={{ padding: '6px 0' }}>Status</th>
                <th style={{ padding: '6px 0', textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 0' }}>{formatDate(inv.createdAt)}</td>
                  <td style={{ padding: '8px 0' }}>{inv.number ?? inv.id.slice(0, 12)}</td>
                  <td style={{ padding: '8px 0' }}>
                    {formatGbp(inv.amount / 100, inv.currency)}
                  </td>
                  <td style={{ padding: '8px 0' }}>{inv.status ?? '--'}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right' }}>
                    {inv.hostedUrl ? (
                      <a
                        href={inv.hostedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3b82f6', textDecoration: 'none' }}
                      >
                        View
                      </a>
                    ) : (
                      '--'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
