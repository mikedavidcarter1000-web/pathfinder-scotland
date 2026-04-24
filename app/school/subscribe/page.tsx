'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'
import type { DashboardMe } from '@/components/school-dashboard/types'
import {
  STANDARD_PRICE_GBP,
  PREMIUM_PRICE_GBP,
  FOUNDING_DISCOUNT_FRACTION,
  priceForTier,
  getSubscriptionState,
} from '@/lib/school/subscription'

type FoundingStatus = { remaining: number; cap: number; taken: number }

const STANDARD_FEATURES = [
  'Grade tracking with custom metrics',
  'Guidance hub with student profiles',
  'Intervention and safeguarding logging',
  'Leadership analytics dashboard',
  'HGIOS4 inspection evidence',
  'CES career education standard tracking',
  'Subject choice collection with consequence modelling',
  'Parent reports (email and PDF)',
  'SIMD equity analysis',
  'SQA results import and value-added',
  'SEEMIS data import',
]

const PREMIUM_FEATURES = [
  'Everything in Standard, plus:',
  'DYW employer engagement dashboard',
  'Parent evening booking with prep snapshots',
  'Alumni destinations tracking',
  'Primary transition profiles',
  'CPD and PRD management',
  'Curriculum rationale generator',
  'Priority email support',
]

export default function SchoolSubscribePage() {
  return (
    <Suspense fallback={<div className="pf-container pt-8 pb-12"><p>Loading…</p></div>}>
      <SchoolSubscribeInner />
    </Suspense>
  )
}

function SchoolSubscribeInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [founding, setFounding] = useState<FoundingStatus | null>(null)
  const [me, setMe] = useState<DashboardMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<'standard' | 'premium' | null>(null)

  const cancelled = searchParams.get('cancelled') === 'true'

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/subscribe')
      return
    }
    Promise.all([
      fetch('/api/school/register').then((r) => r.json()).catch(() => null),
      fetch('/api/school/me').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([f, m]) => {
        if (f) setFounding(f)
        if (m?.school) setMe(m as DashboardMe)
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  async function handleSubscribe(tier: 'standard' | 'premium') {
    if (!me?.school) return
    setSubscribing(tier)
    try {
      const res = await fetch('/api/school/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, schoolId: me.school.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error('Could not start checkout', json.error || '')
        setSubscribing(null)
        return
      }
      if (json.url) {
        window.location.href = json.url
      }
    } catch (err) {
      toast.error('Could not start checkout', (err as Error).message || '')
      setSubscribing(null)
    }
  }

  async function handleManageBilling() {
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
    }
  }

  if (loading) {
    return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  }

  if (!me?.school) {
    return (
      <div className="pf-container pt-8 pb-12" style={{ maxWidth: 720 }}>
        <p>Sign in to your school account to see subscription options. <Link href="/school/register">Register a school</Link>.</p>
      </div>
    )
  }

  if (!me.staff.isAdmin) {
    return (
      <div className="pf-container pt-8 pb-12" style={{ maxWidth: 720 }}>
        <p>Subscription management is admin-only. Please ask your school admin. <Link href="/school/dashboard">Back to dashboard</Link>.</p>
      </div>
    )
  }

  const state = getSubscriptionState(me.school)
  const foundingAvailable = (founding?.remaining ?? 0) > 0
  const showFoundingDiscount = me.school.is_founding_school || foundingAvailable

  const standardPrice = priceForTier('standard', me.school.is_founding_school)
  const premiumPrice = priceForTier('premium', me.school.is_founding_school)

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 960 }}>
      <Link href="/school/dashboard" style={{ fontSize: '0.875rem', color: 'var(--pf-blue-700)' }}>&larr; Back to dashboard</Link>
      <h1 style={h1}>Choose your Pathfinder Schools plan</h1>
      <p style={{ margin: '6px 0 0', fontSize: '1rem', opacity: 0.8 }}>All plans include full access for unlimited staff accounts.</p>

      {cancelled && (
        <div style={noticeAmber}>
          No problem. You can subscribe any time.
        </div>
      )}

      {state.isExpired && (
        <div style={noticeRed}>
          <strong>Your trial has expired.</strong> Dashboard access is paused but your data is preserved. Subscribe below to restore access.
        </div>
      )}

      {state.isTrial && !state.isExpired && state.trialExpiresAt && (
        <div style={noticeBlue}>
          <strong>Trial expires on {state.trialExpiresAt.toLocaleDateString('en-GB')}</strong>
          {state.daysRemaining !== null ? ` (${state.daysRemaining} day${state.daysRemaining === 1 ? '' : 's'} remaining)` : ''}.
        </div>
      )}

      {state.isActive && !state.isTrial && (
        <div style={noticeGreen}>
          <strong style={{ color: '#047857' }}>Active:</strong> your school is on the <strong>{state.tier}</strong> plan.
          <button onClick={handleManageBilling} style={manageBtn}>Manage billing</button>
        </div>
      )}

      {state.isCancelled && (
        <div style={noticeRed}>
          <strong>Your subscription has been cancelled.</strong> Your data is retained. Resubscribe below to restore access.
        </div>
      )}

      {showFoundingDiscount && (
        <div style={foundingCallout}>
          <strong>Founding school pricing:</strong> GBP {priceForTier('standard', true).toLocaleString('en-GB')}/year for Standard,
          GBP {priceForTier('premium', true).toLocaleString('en-GB')}/year for Premium
          &mdash; <em>{Math.round(FOUNDING_DISCOUNT_FRACTION * 100)}% off for the lifetime of your subscription.</em>
          {founding && founding.remaining > 0 && !me.school.is_founding_school && (
            <> {founding.remaining} of {founding.cap} founding-school places remaining.</>
          )}
        </div>
      )}

      <div style={pricingGrid}>
        <PlanCard
          name="Standard"
          price={standardPrice}
          basePrice={STANDARD_PRICE_GBP}
          discounted={me.school.is_founding_school}
          features={STANDARD_FEATURES}
          currentTier={state.tier}
          thisTier="standard"
          subscribing={subscribing}
          onSubscribe={() => handleSubscribe('standard')}
          onManage={handleManageBilling}
          activePaid={state.isActive && !state.isTrial}
        />
        <PlanCard
          name="Premium"
          highlight
          price={premiumPrice}
          basePrice={PREMIUM_PRICE_GBP}
          discounted={me.school.is_founding_school}
          features={PREMIUM_FEATURES}
          currentTier={state.tier}
          thisTier="premium"
          subscribing={subscribing}
          onSubscribe={() => handleSubscribe('premium')}
          onManage={handleManageBilling}
          activePaid={state.isActive && !state.isTrial}
        />
      </div>

      <p style={{ marginTop: 20, fontSize: '0.875rem', opacity: 0.75 }}>
        Have a promo code? You can enter it at checkout.
      </p>
    </div>
  )
}

function PlanCard({
  name,
  price,
  basePrice,
  discounted,
  features,
  currentTier,
  thisTier,
  subscribing,
  onSubscribe,
  onManage,
  highlight,
  activePaid,
}: {
  name: string
  price: number
  basePrice: number
  discounted: boolean
  features: string[]
  currentTier: 'trial' | 'standard' | 'premium' | 'authority'
  thisTier: 'standard' | 'premium'
  subscribing: 'standard' | 'premium' | null
  onSubscribe: () => void
  onManage: () => void
  highlight?: boolean
  activePaid: boolean
}) {
  const isCurrent = activePaid && currentTier === thisTier
  const isUpgrade = activePaid && currentTier === 'standard' && thisTier === 'premium'
  const isDowngrade = activePaid && currentTier === 'premium' && thisTier === 'standard'
  const loading = subscribing === thisTier

  return (
    <div
      style={{
        ...planCard,
        ...(highlight ? { borderColor: 'var(--pf-blue-700, #1D4ED8)', boxShadow: '0 2px 12px rgba(29, 78, 216, 0.12)' } : {}),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.25rem' }}>
          {name}
        </h2>
        {isCurrent && <span style={activeBadge}>Active</span>}
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: '2rem', fontWeight: 700 }}>GBP {price.toLocaleString('en-GB')}</span>
        <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>/ year</span>
        {discounted && (
          <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', opacity: 0.6, marginLeft: 6 }}>
            GBP {basePrice.toLocaleString('en-GB')}
          </span>
        )}
      </div>
      <ul style={featureList}>
        {features.map((f, i) => (
          <li key={i} style={{ listStyle: i === 0 && f.startsWith('Everything') ? 'none' : 'disc', fontWeight: i === 0 && f.startsWith('Everything') ? 600 : 400 }}>{f}</li>
        ))}
      </ul>

      {isCurrent ? (
        <button onClick={onManage} style={btnSecondary}>Manage billing</button>
      ) : isUpgrade ? (
        <button onClick={onSubscribe} disabled={loading} style={btnPrimary}>
          {loading ? 'Opening checkout…' : 'Upgrade to Premium'}
        </button>
      ) : isDowngrade ? (
        <button onClick={onManage} style={btnSecondary}>Change plan</button>
      ) : (
        <button onClick={onSubscribe} disabled={loading} style={highlight ? btnPrimary : btnSecondary}>
          {loading ? 'Opening checkout…' : 'Subscribe'}
        </button>
      )}
    </div>
  )
}

const h1: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: '1.75rem',
  margin: '12px 0 0',
}

const pricingGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16,
  marginTop: 20,
}

const planCard: React.CSSProperties = {
  padding: 20,
  border: '2px solid var(--pf-grey-200, #E5E7EB)',
  borderRadius: 12,
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
}

const featureList: React.CSSProperties = {
  paddingLeft: 18,
  margin: '16px 0',
  fontSize: '0.9375rem',
  lineHeight: 1.7,
  flexGrow: 1,
}

const btnPrimary: React.CSSProperties = {
  padding: '12px 18px',
  background: 'var(--pf-blue-700, #1D4ED8)',
  color: '#fff',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: '0.9375rem',
  border: 'none',
  cursor: 'pointer',
  marginTop: 'auto',
}

const btnSecondary: React.CSSProperties = {
  padding: '12px 18px',
  background: '#fff',
  color: 'var(--pf-blue-700, #1D4ED8)',
  border: '1px solid var(--pf-blue-700, #1D4ED8)',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: '0.9375rem',
  cursor: 'pointer',
  marginTop: 'auto',
}

const manageBtn: React.CSSProperties = {
  marginLeft: 12,
  padding: '6px 12px',
  background: '#fff',
  color: '#047857',
  border: '1px solid #10B981',
  borderRadius: 6,
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
}

const noticeBase: React.CSSProperties = {
  marginTop: 16,
  padding: '12px 16px',
  borderRadius: 8,
  border: '1px solid',
  fontSize: '0.9375rem',
}

const noticeAmber: React.CSSProperties = { ...noticeBase, backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }
const noticeRed: React.CSSProperties = { ...noticeBase, backgroundColor: '#FEE2E2', borderColor: '#DC2626' }
const noticeBlue: React.CSSProperties = { ...noticeBase, backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }
const noticeGreen: React.CSSProperties = { ...noticeBase, backgroundColor: '#ECFDF5', borderColor: '#10B981' }

const foundingCallout: React.CSSProperties = {
  marginTop: 16,
  padding: '12px 16px',
  border: '1px solid var(--pf-blue-200, #BFDBFE)',
  backgroundColor: 'var(--pf-blue-50, #EFF6FF)',
  borderRadius: 8,
  fontSize: '0.9375rem',
}

const activeBadge: React.CSSProperties = {
  padding: '2px 10px',
  backgroundColor: '#ECFDF5',
  color: '#047857',
  border: '1px solid #10B981',
  borderRadius: 999,
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}
