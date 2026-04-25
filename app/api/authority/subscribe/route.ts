import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import { stripe } from '@/lib/stripe'
import {
  calculateLAPrice,
  isFoundingAuthority,
  FOUNDING_AUTHORITY_TRIAL_DAYS,
} from '@/lib/authority/pricing'

export const runtime = 'nodejs'

type SubscribeBody = {
  schoolCount?: unknown
}

type LAPriceEnv = {
  base: string | undefined
  tier1: string | undefined
  tier2: string | undefined
  tier3: string | undefined
}

function readPriceEnv(): LAPriceEnv {
  return {
    base: process.env.STRIPE_LA_BASE_PRICE_ID,
    tier1: process.env.STRIPE_LA_TIER1_PRICE_ID,
    tier2: process.env.STRIPE_LA_TIER2_PRICE_ID,
    tier3: process.env.STRIPE_LA_TIER3_PRICE_ID,
  }
}

function resolveOrigin(req: Request): string {
  const rawOrigin = req.headers.get('origin') || ''
  const allowed = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'https://pathfinderscot.co.uk',
    'https://www.pathfinderscot.co.uk',
  ].filter(Boolean) as string[]
  return allowed.includes(rawOrigin)
    ? rawOrigin
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export async function POST(req: Request) {
  const guard = await requireAuthorityStaffApi({ mustBeAdmin: true, mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as SubscribeBody | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const rawCount = Number(body.schoolCount)
  if (!Number.isFinite(rawCount) || rawCount < 0 || rawCount > 200) {
    return NextResponse.json(
      { error: 'schoolCount must be a non-negative integer (max 200).' },
      { status: 400 }
    )
  }
  const schoolCount = Math.floor(rawCount)

  const breakdown = calculateLAPrice(schoolCount)

  const env = readPriceEnv()
  if (!env.base) {
    return NextResponse.json(
      { error: 'Stripe LA pricing is not configured on the server (STRIPE_LA_BASE_PRICE_ID missing).' },
      { status: 503 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: la } = await (admin as any)
    .from('local_authorities')
    .select('id, name, subscription_status, stripe_customer_id, stripe_subscription_id, primary_contact_email')
    .eq('id', ctx.authorityId)
    .maybeSingle()

  if (!la) return NextResponse.json({ error: 'Authority not found.' }, { status: 404 })

  if (la.subscription_status === 'active') {
    return NextResponse.json(
      { error: 'You already have an active subscription. Manage it from settings.' },
      { status: 400 }
    )
  }

  // Build line items: base fee + per-school tier prices with quantities
  // matching the calculator.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: env.base, quantity: 1 },
  ]
  const tierEnvByRange: Record<'1-10' | '11-20' | '21+', string | undefined> = {
    '1-10': env.tier1,
    '11-20': env.tier2,
    '21+': env.tier3,
  }
  for (const tier of breakdown.perSchoolBreakdown) {
    if (tier.count === 0) continue
    const priceId = tierEnvByRange[tier.range]
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price ID for tier ${tier.range} not configured.` },
        { status: 503 }
      )
    }
    lineItems.push({ price: priceId, quantity: tier.count })
  }

  // Get or create the Stripe customer for this LA. LA customers do not
  // live in stripe_customers (which is keyed on auth.user_id) -- their
  // customer id lives on local_authorities.stripe_customer_id only.
  let customerId = la.stripe_customer_id as string | null
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: la.primary_contact_email ?? ctx.email,
      name: la.name,
      metadata: {
        authority_id: la.id,
        authority_name: la.name,
        type: 'authority',
      },
    })
    customerId = customer.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('local_authorities')
      .update({ stripe_customer_id: customerId })
      .eq('id', la.id)
  }

  // Founding-authority eligibility -- recompute server-side; never trust the
  // client. The check excludes the candidate authority itself.
  const founding = await isFoundingAuthority(admin, la.id)

  const origin = resolveOrigin(req)

  const params: Stripe.Checkout.SessionCreateParams = {
    customer: customerId!,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${origin}/authority/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/authority/subscribe?cancelled=true`,
    metadata: {
      authority_id: la.id,
      authority_name: la.name,
      school_count: String(schoolCount),
      founding_authority: founding ? 'true' : 'false',
      type: 'authority',
    },
    subscription_data: {
      trial_period_days: founding ? FOUNDING_AUTHORITY_TRIAL_DAYS : undefined,
      metadata: {
        authority_id: la.id,
        authority_name: la.name,
        school_count: String(schoolCount),
        founding_authority: founding ? 'true' : 'false',
        type: 'authority',
      },
    },
    allow_promotion_codes: true,
  }

  try {
    const session = await stripe.checkout.sessions.create(params)
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      annualPounds: breakdown.annualPounds,
      foundingAuthority: founding,
    })
  } catch (err) {
    console.error('[authority/subscribe] stripe error:', err)
    return NextResponse.json({ error: 'Could not create checkout session.' }, { status: 500 })
  }
}
