import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})

export const getStripeCustomerId = async (
  supabase: any,
  userId: string
): Promise<string | null> => {
  const { data } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  return data?.stripe_customer_id || null
}

export const createOrRetrieveCustomer = async (
  supabase: any,
  userId: string,
  email: string
): Promise<string> => {
  // Check if customer exists
  const existingCustomerId = await getStripeCustomerId(supabase, userId)
  if (existingCustomerId) {
    return existingCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
  })

  // Save to database
  await supabase.from('stripe_customers').insert({
    user_id: userId,
    stripe_customer_id: customer.id,
    email,
  })

  return customer.id
}

export const createCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  trialDays,
  promoCode,
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
  promoCode?: string
}): Promise<Stripe.Checkout.Session> => {
  const params: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: trialDays
      ? { trial_period_days: trialDays }
      : undefined,
    allow_promotion_codes: !promoCode,
  }

  if (promoCode) {
    // Look up the promotion code
    const promotionCodes = await stripe.promotionCodes.list({
      code: promoCode,
      active: true,
      limit: 1,
    })

    if (promotionCodes.data.length > 0) {
      params.discounts = [{ promotion_code: promotionCodes.data[0].id }]
    }
  }

  return stripe.checkout.sessions.create(params)
}

export const createBillingPortalSession = async (
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> => {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export const cancelSubscription = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> => {
  if (cancelAtPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }
  return stripe.subscriptions.cancel(subscriptionId)
}
