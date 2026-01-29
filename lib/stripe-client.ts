import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Stripe not loaded')
  }
  // Use the newer redirect approach
  const result = await (stripe as any).redirectToCheckout({ sessionId })
  if (result?.error) {
    throw new Error(result.error.message)
  }
  return result
}
