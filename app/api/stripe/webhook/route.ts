import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  syncSchoolTiersForAuthority,
  logAuthoritySubscriptionEvent,
} from '@/lib/authority/subscription'

// Lazy singletons so import-time evaluation doesn't blow up the build when
// Stripe / service-role env vars are unset (e.g. CI without billing wired
// up). The webhook only runs in environments where Stripe is configured.
let stripeClient: Stripe | null = null
function getStripe(): Stripe {
  if (stripeClient) return stripeClient
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  return stripeClient
}

let supabaseAdminClient: SupabaseClient | null = null
function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminClient) return supabaseAdminClient
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin credentials are not set')
  }
  supabaseAdminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
  return supabaseAdminClient
}

// Throw on any Supabase write error so the outer try/catch returns 500
// and Stripe retries the webhook delivery.
function throwOnError(error: unknown, context: string): void {
  if (error) {
    console.error(`Webhook DB error [${context}]:`, error)
    throw new Error(`DB write failed: ${context}`)
  }
}

// PGRST116 = "no rows returned" from a .single() call — not a DB failure.
// Any other error code is a real problem and should cause a retry.
function isNotFoundError(error: { code?: string } | null | undefined): boolean {
  return error?.code === 'PGRST116'
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'product.created':
      case 'product.updated':
        await handleProductChange(event.data.object as Stripe.Product)
        break

      case 'price.created':
      case 'price.updated':
        await handlePriceChange(event.data.object as Stripe.Price)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// A subscription is treated as an authority subscription when either:
//   (a) its metadata carries type = 'authority' (our checkout sets this), OR
//   (b) there is an existing local_authorities row with
//       stripe_subscription_id = sub.id (renewal fallback when Stripe drops
//       metadata).
async function isAuthoritySubscription(subscription: Stripe.Subscription): Promise<{ authorityId: string | null }> {
  const meta = subscription.metadata ?? {}
  const idFromMeta = typeof meta.authority_id === 'string' ? meta.authority_id : null
  if (meta.type === 'authority' && idFromMeta) {
    return { authorityId: idFromMeta }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: la, error } = await (getSupabaseAdmin() as any)
    .from('local_authorities')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle()
  if (error) {
    console.error('DB error looking up authority by subscription id:', error)
    throw new Error('DB error looking up authority subscription')
  }
  return { authorityId: la?.id ?? null }
}

function mapStripeStatusToAuthority(status: Stripe.Subscription.Status): 'active' | 'expired' | 'cancelled' | 'pending' {
  if (status === 'canceled') return 'cancelled'
  if (status === 'unpaid' || status === 'incomplete_expired') return 'expired'
  if (status === 'incomplete') return 'pending'
  // trialing / active / past_due all stay active. past_due keeps tier
  // access during the dunning window; we surface it in the UI separately.
  return 'active'
}

async function handleAuthoritySubscriptionChange(subscription: Stripe.Subscription, authorityId: string) {
  const status = mapStripeStatusToAuthority(subscription.status)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subAny = subscription as any
  const trialEnd = subAny.trial_end ? new Date(subAny.trial_end * 1000).toISOString() : null
  const trialStart = subAny.trial_start ? new Date(subAny.trial_start * 1000).toISOString() : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {
    subscription_tier: 'standard',
    subscription_status: status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
  }
  if (trialStart) update.trial_started_at = trialStart
  if (trialEnd) update.trial_expires_at = trialEnd

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (getSupabaseAdmin() as any)
    .from('local_authorities')
    .update(update)
    .eq('id', authorityId)
  throwOnError(error, 'handleAuthoritySubscriptionChange')

  // On any active-ish state, sync school tiers. Cancellation revert is
  // handled in handleSubscriptionDeleted, not here, so a past_due dunning
  // event doesn't accidentally tear down bundled access.
  if (status === 'active') {
    try {
      const result = await syncSchoolTiersForAuthority(getSupabaseAdmin(), authorityId)
      console.log(`[authority webhook] tier sync: ${result.updated}/${result.totalCandidates} schools updated`)
    } catch (err) {
      console.error('[authority webhook] tier sync failed:', err)
    }
  }
}

// A subscription is treated as a school subscription when either:
//   (a) its metadata carries type = 'school' (our checkout sets this), OR
//   (b) there is an existing schools row with stripe_subscription_id = sub.id
// so that renewals (where Stripe may not replay metadata) still route.
async function isSchoolSubscription(subscription: Stripe.Subscription): Promise<{ schoolId: string | null; matchedByMetadata: boolean }> {
  const meta = subscription.metadata ?? {}
  const schoolIdFromMeta = typeof meta.school_id === 'string' ? meta.school_id : null
  if (meta.type === 'school' && schoolIdFromMeta) {
    return { schoolId: schoolIdFromMeta, matchedByMetadata: true }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school, error } = await (getSupabaseAdmin() as any)
    .from('schools')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle()
  if (error) {
    console.error('DB error looking up school by subscription id:', error)
    throw new Error('DB error looking up school subscription')
  }
  return { schoolId: school?.id ?? null, matchedByMetadata: false }
}

function mapStripeStatusToSchool(status: Stripe.Subscription.Status): 'active' | 'expired' | 'cancelled' {
  if (status === 'canceled') return 'cancelled'
  if (status === 'unpaid' || status === 'incomplete_expired') return 'expired'
  // past_due stays active (grace period); trialing/active/incomplete -> active.
  return 'active'
}

function mapPriceToSchoolTier(priceId: string | null | undefined): 'standard' | 'premium' {
  if (priceId && priceId === process.env.STRIPE_SCHOOL_PREMIUM_PRICE_ID) return 'premium'
  return 'standard'
}

async function handleSchoolSubscriptionChange(subscription: Stripe.Subscription, schoolId: string) {
  const priceId = subscription.items.data[0]?.price?.id ?? null
  const tier = mapPriceToSchoolTier(priceId)
  const status = mapStripeStatusToSchool(subscription.status)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (getSupabaseAdmin() as any)
    .from('schools')
    .update({
      subscription_tier: tier,
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
    })
    .eq('id', schoolId)
  throwOnError(error, 'handleSchoolSubscriptionChange')
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Route order: authority -> school -> student. Authority and school
  // customers are NOT in stripe_customers (which is keyed on
  // auth.user_id), so they would 404 in the student branch.
  const authorityMatch = await isAuthoritySubscription(subscription)
  if (authorityMatch.authorityId) {
    await handleAuthoritySubscriptionChange(subscription, authorityMatch.authorityId)
    return
  }

  const schoolMatch = await isSchoolSubscription(subscription)
  if (schoolMatch.schoolId) {
    await handleSchoolSubscriptionChange(subscription, schoolMatch.schoolId)
    return
  }

  const customerId = subscription.customer as string

  // Get user ID from customer
  const { data: customer, error: customerError } = await getSupabaseAdmin()
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (customerError && !isNotFoundError(customerError)) {
    console.error('DB error looking up customer:', customerError)
    throw new Error('DB error looking up customer')
  }
  if (!customer) {
    console.error('Customer not found:', customerId)
    return
  }

  const priceId = subscription.items.data[0]?.price?.id
  const sub = subscription as any // Type workaround for Stripe API changes

  const { error } = await getSupabaseAdmin().from('stripe_subscriptions').upsert(
    {
      user_id: customer.user_id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      status: subscription.status as any,
      current_period_start: sub.current_period_start
        ? new Date(sub.current_period_start * 1000).toISOString()
        : null,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancel_at: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      metadata: subscription.metadata,
    },
    { onConflict: 'stripe_subscription_id' }
  )
  throwOnError(error, 'handleSubscriptionChange upsert')
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const authorityMatch = await isAuthoritySubscription(subscription)
  if (authorityMatch.authorityId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (getSupabaseAdmin() as any)
      .from('local_authorities')
      .update({
        subscription_status: 'cancelled',
      })
      .eq('id', authorityMatch.authorityId)
    throwOnError(error, 'handleSubscriptionDeleted authority')
    // Schema spec: do NOT immediately revoke school access on cancellation.
    // The 30-day grace period is enforced by NOT calling
    // revertBundledSchoolTiersForAuthority here. A scheduled job (or
    // admin trigger) handles the revert after the grace window expires.
    void logAuthoritySubscriptionEvent(
      getSupabaseAdmin(),
      authorityMatch.authorityId,
      'subscription_cancelled',
      'stripe_subscription',
      { stripe_subscription_id: subscription.id }
    )
    return
  }

  const schoolMatch = await isSchoolSubscription(subscription)
  if (schoolMatch.schoolId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (getSupabaseAdmin() as any)
      .from('schools')
      .update({
        subscription_status: 'cancelled',
        stripe_subscription_id: null,
      })
      .eq('id', schoolMatch.schoolId)
    throwOnError(error, 'handleSubscriptionDeleted school')
    return
  }

  const { error } = await getSupabaseAdmin()
    .from('stripe_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
  throwOnError(error, 'handleSubscriptionDeleted student')
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const inv = invoice as any // Type workaround for Stripe API changes

  // Authority / school customers are not in stripe_customers (which is
  // keyed on auth.user_id). If this invoice belongs to one, log and
  // exit -- the subscription event already carries the state we need.
  const subscriptionId = typeof inv.subscription === 'string' ? (inv.subscription as string) : null
  if (subscriptionId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: la } = await (getSupabaseAdmin() as any)
      .from('local_authorities')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle()
    if (la?.id) {
      // Re-affirm active status on successful renewal payment.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (getSupabaseAdmin() as any)
        .from('local_authorities')
        .update({ subscription_status: 'active' })
        .eq('id', la.id)
      void logAuthoritySubscriptionEvent(
        getSupabaseAdmin(),
        la.id,
        'payment_succeeded',
        'stripe_invoice',
        { stripe_invoice_id: invoice.id, amount_paid: invoice.amount_paid, currency: invoice.currency }
      )
      return
    }
  }

  const { data: customer, error: customerError } = await getSupabaseAdmin()
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (customerError && !isNotFoundError(customerError)) {
    console.error('DB error looking up customer for payment:', customerError)
    throw new Error('DB error looking up customer for payment')
  }
  if (!customer) {
    console.error('Customer not found for successful payment:', customerId)
    return
  }

  // Invoices without a PaymentIntent (e.g. free trials, £0 invoices) cannot
  // be de-duped via stripe_payment_intent_id — skip recording them here.
  // The subscription-change event carries the state that actually matters.
  if (!inv.payment_intent) {
    console.log('Skipping payment record for invoice with no payment_intent:', invoice.id)
    return
  }

  // Upsert (not insert) on stripe_payment_intent_id so retried webhook
  // deliveries for the same invoice are idempotent.
  const { error } = await getSupabaseAdmin().from('stripe_payments').upsert(
    {
      user_id: customer.user_id,
      stripe_payment_intent_id: inv.payment_intent as string,
      stripe_customer_id: customerId,
      stripe_subscription_id: inv.subscription as string,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      description: invoice.description || `Invoice ${invoice.number}`,
      receipt_url: invoice.hosted_invoice_url,
    },
    { onConflict: 'stripe_payment_intent_id' }
  )
  throwOnError(error, 'handlePaymentSucceeded upsert')
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const inv = invoice as any // Type workaround for Stripe API changes

  // Authority dunning path: if this invoice belongs to an LA subscription,
  // mark it past_due (treated as 'expired' in our enum) and notify. We
  // surface the past_due banner in the LA settings UI; tier access stays
  // until the subscription actually transitions to canceled.
  const subscriptionId = typeof inv.subscription === 'string' ? (inv.subscription as string) : null
  if (subscriptionId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: la } = await (getSupabaseAdmin() as any)
      .from('local_authorities')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle()
    if (la?.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: laErr } = await (getSupabaseAdmin() as any)
        .from('local_authorities')
        .update({ subscription_status: 'expired' })
        .eq('id', la.id)
      throwOnError(laErr, 'handlePaymentFailed authority past_due')
      void logAuthoritySubscriptionEvent(
        getSupabaseAdmin(),
        la.id,
        'payment_failed',
        'stripe_invoice',
        { stripe_invoice_id: invoice.id, amount_due: invoice.amount_due, currency: invoice.currency }
      )
      return
    }
  }

  const { data: customer, error: customerError } = await getSupabaseAdmin()
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (customerError && !isNotFoundError(customerError)) {
    console.error('DB error looking up customer for failed payment:', customerError)
    throw new Error('DB error looking up customer for failed payment')
  }
  if (!customer) {
    console.error('Customer not found for failed payment:', customerId)
    return
  }

  if (!inv.payment_intent) {
    console.log('Skipping payment record for failed invoice with no payment_intent:', invoice.id)
    return
  }

  // Upsert (not insert) on stripe_payment_intent_id so retried webhook
  // deliveries for the same invoice are idempotent.
  const { error } = await getSupabaseAdmin().from('stripe_payments').upsert(
    {
      user_id: customer.user_id,
      stripe_payment_intent_id: inv.payment_intent as string,
      stripe_customer_id: customerId,
      stripe_subscription_id: inv.subscription as string,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      description: `Failed: ${invoice.description || `Invoice ${invoice.number}`}`,
    },
    { onConflict: 'stripe_payment_intent_id' }
  )
  throwOnError(error, 'handlePaymentFailed upsert')
}

async function handleProductChange(product: Stripe.Product) {
  const { error } = await getSupabaseAdmin().from('stripe_products').upsert(
    {
      stripe_product_id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      metadata: product.metadata,
    },
    { onConflict: 'stripe_product_id' }
  )
  throwOnError(error, 'handleProductChange upsert')
}

async function handlePriceChange(price: Stripe.Price) {
  // Get product reference
  const { data: product, error: productError } = await getSupabaseAdmin()
    .from('stripe_products')
    .select('id')
    .eq('stripe_product_id', price.product as string)
    .single()

  if (productError && !isNotFoundError(productError)) {
    console.error('DB error looking up product for price:', productError)
    throw new Error('DB error looking up product for price')
  }

  const { error } = await getSupabaseAdmin().from('stripe_prices').upsert(
    {
      stripe_price_id: price.id,
      product_id: product?.id,
      stripe_product_id: price.product as string,
      active: price.active,
      currency: price.currency,
      unit_amount: price.unit_amount,
      recurring_interval: price.recurring?.interval,
      recurring_interval_count: price.recurring?.interval_count,
      trial_period_days: price.recurring?.trial_period_days,
      metadata: price.metadata,
    },
    { onConflict: 'stripe_price_id' }
  )
  throwOnError(error, 'handlePriceChange upsert')
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // For school / authority checkouts, stamp the LA / school record
  // immediately so the success page doesn't depend on the subscription
  // webhook arriving first. Stripe may send checkout.session.completed
  // before customer.subscription.* in some configurations.
  const meta = session.metadata ?? {}

  if (meta.type === 'authority' && typeof meta.authority_id === 'string') {
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null
    const isFounding = meta.founding_authority === 'true'
    // local_authorities.subscription_status CHECK only allows
    // pending|active|expired|cancelled. Trial state is expressed via
    // trial_expires_at (set when the founding authority qualifies);
    // the UI infers "in trial" from trial_expires_at > now.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {
      subscription_tier: 'standard',
      subscription_status: 'active',
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer as string,
    }
    if (isFounding) {
      const startedAt = new Date()
      const expiresAt = new Date(startedAt.getTime() + 365 * 24 * 60 * 60 * 1000)
      update.trial_started_at = startedAt.toISOString()
      update.trial_expires_at = expiresAt.toISOString()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (getSupabaseAdmin() as any)
      .from('local_authorities')
      .update(update)
      .eq('id', meta.authority_id)
    throwOnError(error, 'handleCheckoutCompleted authority update')

    try {
      const result = await syncSchoolTiersForAuthority(getSupabaseAdmin(), meta.authority_id)
      console.log(`[authority webhook] checkout sync: ${result.updated}/${result.totalCandidates} schools updated`)
    } catch (err) {
      console.error('[authority webhook] checkout sync failed:', err)
    }

    void logAuthoritySubscriptionEvent(
      getSupabaseAdmin(),
      meta.authority_id,
      'subscription_activated',
      'stripe_subscription',
      {
        stripe_subscription_id: subscriptionId,
        founding_authority: isFounding,
        school_count: meta.school_count ?? null,
      }
    )
    return
  }

  if (meta.type === 'school' && typeof meta.school_id === 'string') {
    const tier = meta.tier === 'premium' ? 'premium' : 'standard'
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (getSupabaseAdmin() as any)
      .from('schools')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer as string,
      })
      .eq('id', meta.school_id)
    throwOnError(error, 'handleCheckoutCompleted school update')
    return
  }
  // Student / other checkouts -- subscription webhook will handle the state.
  console.log('Checkout completed:', session.id)
}
