'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  calculateLAPrice,
  FOUNDING_AUTHORITY_TRIAL_MONTHS,
  type LAPriceBreakdown,
} from '@/lib/authority/pricing'

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '6px',
  color: '#1a1a2e',
  fontSize: '0.875rem',
  fontFamily: "'Space Grotesk', sans-serif",
}

const inputStyle: React.CSSProperties = {
  width: '120px',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '1rem',
  outline: 'none',
}

function formatGbp(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SubscribeClient({
  authorityName,
  schoolCount,
  isFoundingAuthority,
  contactEmail,
}: {
  authorityName: string
  schoolCount: number
  isFoundingAuthority: boolean
  contactEmail: string
}) {
  const [count, setCount] = useState<number>(schoolCount)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const breakdown: LAPriceBreakdown = useMemo(() => calculateLAPrice(count), [count])

  async function handleSubscribe() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/authority/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolCount: count }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not start checkout.')
        setSubmitting(false)
        return
      }
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError('Checkout did not return a URL.')
    } catch (err) {
      console.error(err)
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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
        Subscribe -- {authorityName}
      </h1>
      <p style={{ color: '#4b5563', marginBottom: '32px' }}>
        Annual subscription to the Pathfinder LA Portal. Pricing is base
        platform fee + per-school, with volume discounts above 10 and 20
        schools.
      </p>

      {isFoundingAuthority && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <strong style={{ color: '#047857' }}>
            You qualify as a founding authority.
          </strong>
          <p style={{ color: '#065f46', margin: '6px 0 0', fontSize: '0.9375rem' }}>
            Free for {FOUNDING_AUTHORITY_TRIAL_MONTHS} months. Standard
            pricing applies thereafter on the same line items below. You
            will not be charged today, but Stripe requires a card on file
            so the subscription can renew automatically.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '16px' }}>
            School count
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 0 }}>
            Auto-populated from {schoolCount} school{schoolCount === 1 ? '' : 's'} in
            your LA area on Pathfinder. Adjust if you are planning ahead.
          </p>
          <label style={labelStyle} htmlFor="schoolCount">
            Number of schools
          </label>
          <input
            id="schoolCount"
            type="number"
            min={0}
            max={50}
            step={1}
            value={count}
            onChange={(e) => {
              const v = Number(e.target.value)
              setCount(Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0)
            }}
            style={inputStyle}
          />
          <p style={{ color: '#6b7280', fontSize: '0.8125rem', marginTop: '12px' }}>
            All schools in your LA area receive Standard tier access at no
            additional per-school cost. Schools that want Premium can
            upgrade individually for &pound;1,000/year.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '16px' }}>
            Pricing breakdown
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '6px 0' }}>Base platform fee</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatGbp(breakdown.base)}
                </td>
              </tr>
              {breakdown.perSchoolBreakdown.map((tier) =>
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
                <td style={{ padding: '12px 0 6px', fontWeight: 700 }}>
                  Total per year
                </td>
                <td
                  style={{
                    padding: '12px 0 6px',
                    textAlign: 'right',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                  }}
                >
                  {formatGbp(breakdown.annualPounds)}
                </td>
              </tr>
            </tbody>
          </table>

          {breakdown.savingsVsIndividual > 0 ? (
            <p style={{ color: '#047857', marginTop: '16px', fontSize: '0.9375rem' }}>
              Saving {formatGbp(breakdown.savingsVsIndividual)} vs your schools
              buying Premium individually ({formatGbp(breakdown.schoolCount * 2500)}).
            </p>
          ) : (
            <p style={{ color: '#6b7280', marginTop: '16px', fontSize: '0.875rem' }}>
              Includes the analytics layer, all reports, alerts, and Standard
              school access for every school in your area.
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        {error && (
          <p style={{ color: '#b91c1c', marginBottom: '12px' }} role="alert">
            {error}
          </p>
        )}
        <button
          onClick={handleSubscribe}
          disabled={submitting}
          style={{
            background: '#3b82f6',
            color: '#ffffff',
            padding: '14px 32px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting
            ? 'Starting checkout...'
            : isFoundingAuthority
              ? 'Start free 12-month trial'
              : `Subscribe -- ${formatGbp(breakdown.annualPounds)}/year`}
        </button>
        <p style={{ color: '#6b7280', fontSize: '0.8125rem', marginTop: '12px' }}>
          Billing contact: {contactEmail || 'set during checkout'}.
        </p>
      </div>
    </main>
  )
}
