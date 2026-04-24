import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { stripe } from '@/lib/stripe'
import { getSubscriptionState } from '@/lib/school/subscription'

export const runtime = 'nodejs'

type CheckoutBody = {
  tier?: unknown
  schoolId?: unknown
}

function resolvePriceId(tier: 'standard' | 'premium'): string | null {
  if (tier === 'standard') return process.env.STRIPE_SCHOOL_STANDARD_PRICE_ID ?? null
  return process.env.STRIPE_SCHOOL_PREMIUM_PRICE_ID ?? null
}

function resolveOrigin(req: Request): string {
  const rawOrigin = req.headers.get('origin') || ''
  const allowed = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'https://pathfinderscot.co.uk',
    'https://www.pathfinderscot.co.uk',
  ].filter(Boolean) as string[]
  return allowed.includes(rawOrigin) ? rawOrigin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
}

export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as CheckoutBody | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const tier = body.tier === 'standard' || body.tier === 'premium' ? body.tier : null
  const schoolId = typeof body.schoolId === 'string' ? body.schoolId : null
  if (!tier) return NextResponse.json({ error: 'Invalid tier. Must be "standard" or "premium".' }, { status: 400 })
  if (!schoolId) return NextResponse.json({ error: 'schoolId is required.' }, { status: 400 })
  if (schoolId !== ctx.schoolId) {
    return NextResponse.json({ error: 'You can only subscribe on behalf of your own school.' }, { status: 403 })
  }

  const priceId = resolvePriceId(tier)
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID for ${tier} not configured. Set STRIPE_SCHOOL_${tier.toUpperCase()}_PRICE_ID.` },
      { status: 503 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('id, name, subscription_status, subscription_tier, trial_expires_at, trial_started_at, is_founding_school, stripe_customer_id, stripe_subscription_id')
    .eq('id', ctx.schoolId)
    .maybeSingle()

  if (!school) return NextResponse.json({ error: 'School not found.' }, { status: 404 })

  // Founding schools with an active trial cannot start a paid subscription yet.
  const state = getSubscriptionState(school)
  if (school.is_founding_school && state.isTrial && state.daysRemaining && state.daysRemaining > 0) {
    const when = state.trialExpiresAt ? state.trialExpiresAt.toLocaleDateString('en-GB') : 'the end of your trial'
    return NextResponse.json(
      { error: `Your founding school trial is still active until ${when}. You can subscribe from that date.` },
      { status: 400 }
    )
  }

  // Get or create Stripe customer.
  let customerId = school.stripe_customer_id as string | null
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: ctx.email,
      name: school.name,
      metadata: {
        school_id: school.id,
        school_name: school.name,
        type: 'school',
      },
    })
    customerId = customer.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('schools')
      .update({ stripe_customer_id: customerId })
      .eq('id', school.id)
  }

  const origin = resolveOrigin(req)

  const params: Stripe.Checkout.SessionCreateParams = {
    customer: customerId!,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/school/settings?billing=success`,
    cancel_url: `${origin}/school/subscribe?cancelled=true`,
    metadata: {
      school_id: school.id,
      tier,
      type: 'school',
    },
    subscription_data: {
      trial_period_days: 0,
      metadata: {
        school_id: school.id,
        tier,
        type: 'school',
      },
    },
    // Allow customers to enter Stripe-managed promotion codes at checkout.
    allow_promotion_codes: true,
  }

  // Apply the founding-school discount via a pre-configured Stripe coupon.
  // Stripe will combine this with any customer-entered promotion code.
  if (school.is_founding_school && process.env.STRIPE_FOUNDING_SCHOOL_COUPON_ID) {
    params.discounts = [{ coupon: process.env.STRIPE_FOUNDING_SCHOOL_COUPON_ID }]
    // discounts and allow_promotion_codes are mutually exclusive in Stripe.
    delete params.allow_promotion_codes
  }

  try {
    const session = await stripe.checkout.sessions.create(params)
    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('[school/billing/checkout] stripe error:', err)
    return NextResponse.json({ error: 'Could not create checkout session.' }, { status: 500 })
  }
}
