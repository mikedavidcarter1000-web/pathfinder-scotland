import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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
  const { data: school } = await (getSupabaseAdmin() as any)
    .from('schools')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle()
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
  await (getSupabaseAdmin() as any)
    .from('schools')
    .update({
      subscription_tier: tier,
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
    })
    .eq('id', schoolId)
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Route school subscriptions to the school handler first so the student
  // handler doesn't look them up in stripe_customers (school customers are
  // not inserted there).
  const schoolMatch = await isSchoolSubscription(subscription)
  if (schoolMatch.schoolId) {
    await handleSchoolSubscriptionChange(subscription, schoolMatch.schoolId)
    return
  }

  const customerId = subscription.customer as string

  // Get user ID from customer
  const { data: customer } = await getSupabaseAdmin()
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!customer) {
    console.error('Customer not found:', customerId)
    return
  }

  const priceId = subscription.items.data[0]?.price?.id
  const sub = subscription as any // Type workaround for Stripe API changes

  await getSupabaseAdmin().from('stripe_subscriptions').upsert(
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
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const schoolMatch = await isSchoolSubscription(subscription)
  if (schoolMatch.schoolId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (getSupabaseAdmin() as any)
      .from('schools')
      .update({
        subscription_status: 'cancelled',
        stripe_subscription_id: null,
      })
      .eq('id', schoolMatch.schoolId)
    return
  }

  await getSupabaseAdmin()
    .from('stripe_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const inv = invoice as any // Type workaround for Stripe API changes

  const { data: customer } = await getSupabaseAdmin()
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!customer) {
    console.error('Customer not found for successful payment:', customerId)
    return
  }

  await getSupabaseAdmin().from('stripe_payments').insert({
    user_id: customer.user_id,
    stripe_payment_intent_id: inv.payment_intent as string,
    stripe_customer_id: customerId,
    stripe_subscription_id: inv.subscription as string,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    description: invoice.description || `Invoice ${invoice.number}`,
    receipt_url: invoice.hosted_invoice_url,
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const inv = invoice as any // Type workaround for Stripe API changes

  const { data: customer } = await getSupabaseAdmin()
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!customer) {
    console.error('Customer not found for failed payment:', customerId)
    return
  }

  await getSupabaseAdmin().from('stripe_payments').insert({
    user_id: customer.user_id,
    stripe_payment_intent_id: inv.payment_intent as string,
    stripe_customer_id: customerId,
    stripe_subscription_id: inv.subscription as string,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    description: `Failed: ${invoice.description || `Invoice ${invoice.number}`}`,
  })
}

async function handleProductChange(product: Stripe.Product) {
  await getSupabaseAdmin().from('stripe_products').upsert(
    {
      stripe_product_id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      metadata: product.metadata,
    },
    { onConflict: 'stripe_product_id' }
  )
}

async function handlePriceChange(price: Stripe.Price) {
  // Get product reference
  const { data: product } = await getSupabaseAdmin()
    .from('stripe_products')
    .select('id')
    .eq('stripe_product_id', price.product as string)
    .single()

  await getSupabaseAdmin().from('stripe_prices').upsert(
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
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // For school checkouts, stamp the school record immediately so the
  // success page doesn't depend on the subscription webhook arriving first.
  // Stripe may send checkout.session.completed before customer.subscription.*
  // in some configurations.
  const meta = session.metadata ?? {}
  if (meta.type === 'school' && typeof meta.school_id === 'string') {
    const tier = meta.tier === 'premium' ? 'premium' : 'standard'
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (getSupabaseAdmin() as any)
      .from('schools')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer as string,
      })
      .eq('id', meta.school_id)
    return
  }
  // Student / other checkouts -- subscription webhook will handle the state.
  console.log('Checkout completed:', session.id)
}
