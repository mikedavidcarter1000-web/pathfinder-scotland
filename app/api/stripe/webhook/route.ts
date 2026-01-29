import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Create admin Supabase client for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

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

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Get user ID from customer
  const { data: customer } = await supabaseAdmin
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

  await supabaseAdmin.from('stripe_subscriptions').upsert(
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
  await supabaseAdmin
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

  const { data: customer } = await supabaseAdmin
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  await supabaseAdmin.from('stripe_payments').insert({
    user_id: customer?.user_id,
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

  const { data: customer } = await supabaseAdmin
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  await supabaseAdmin.from('stripe_payments').insert({
    user_id: customer?.user_id,
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
  await supabaseAdmin.from('stripe_products').upsert(
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
  const { data: product } = await supabaseAdmin
    .from('stripe_products')
    .select('id')
    .eq('stripe_product_id', price.product as string)
    .single()

  await supabaseAdmin.from('stripe_prices').upsert(
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
  // Checkout completed - subscription should already be handled by subscription webhooks
  console.log('Checkout completed:', session.id)
}
