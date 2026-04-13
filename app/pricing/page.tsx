'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { redirectToCheckout } from '@/lib/stripe-client'
import { useToast } from '@/components/ui/toast'

const plans = [
  {
    name: 'Free',
    description: 'Get started with basic features',
    price: 0,
    interval: 'forever',
    priceId: null,
    features: [
      'Browse all universities',
      'View course requirements',
      'Basic eligibility checker',
      'Save up to 5 courses',
    ],
    notIncluded: [
      'Unlimited saved courses',
      'Personalized recommendations',
      'Application tracking',
      'Priority support',
    ],
  },
  {
    name: 'Student',
    description: 'Everything you need for applications',
    price: 4.99,
    interval: 'month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STUDENT_PRICE_ID,
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited saved courses',
      'Personalized course recommendations',
      'Widening access programme matcher',
      'Application deadline reminders',
      'Email support',
    ],
    notIncluded: [],
  },
  {
    name: 'Student Pro',
    description: 'Premium support for your journey',
    price: 9.99,
    interval: 'month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      'Everything in Student',
      'Personal statement review (AI)',
      'Interview preparation guides',
      'Application tracking dashboard',
      'Priority email support',
      'Early access to new features',
    ],
    notIncluded: [],
  },
]

type DiscountType = 'percentage' | 'fixed_amount' | 'free_trial'

interface PromoDiscount {
  discount_type: DiscountType
  discount_value: number
  description?: string
}

/** Returns the discounted monthly price for a plan given the applied promo discount. */
function applyDiscount(price: number, promo: PromoDiscount | null): number {
  if (!promo || price === 0) return price
  if (promo.discount_type === 'percentage') {
    return Math.max(0, price * (1 - promo.discount_value / 100))
  }
  if (promo.discount_type === 'fixed_amount') {
    return Math.max(0, price - promo.discount_value)
  }
  // free_trial doesn't change the displayed price
  return price
}

function PricingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Promo code state
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [promoDiscount, setPromoDiscount] = useState<PromoDiscount | null>(null)

  const checkoutCanceled = searchParams.get('checkout') === 'canceled'

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return

    setPromoLoading(true)
    setPromoError(null)

    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!data.valid) {
        const msg = data.error || 'Invalid promo code'
        setPromoError(msg)
        setAppliedCode(null)
        setPromoDiscount(null)
        toast.error('Invalid promo code', msg)
        return
      }

      setAppliedCode(code)
      setPromoDiscount({
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        description: data.description,
      })
      setPromoError(null)
      toast.success('Promo code applied', data.description ?? 'Discount will be shown on checkout.')
    } catch {
      const msg = 'Failed to validate code. Please try again.'
      setPromoError(msg)
      toast.error("Couldn't check promo code", msg)
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedCode(null)
    setPromoDiscount(null)
    setPromoInput('')
    setPromoError(null)
  }

  const handleSubscribe = async (priceId: string | null, planName: string, planPrice: number) => {
    if (!priceId) {
      router.push(user ? '/dashboard' : '/auth/sign-up')
      return
    }

    if (!user) {
      router.push(`/auth/sign-up?redirect=/pricing&plan=${planName}`)
      return
    }

    setLoading(planName)
    setError(null)

    try {
      const discountedPrice = applyDiscount(planPrice, promoDiscount)

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          // Pass the promo code to Stripe — Stripe looks it up by code name.
          // Requires a matching Promotion Code configured in the Stripe Dashboard.
          promoCode: appliedCode ?? undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      if (data.url) {
        window.location.href = data.url
      } else if (data.sessionId) {
        await redirectToCheckout(data.sessionId)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      toast.error('Checkout failed', msg)
      setLoading(null)
    }
  }

  const getPromoLabel = (promo: PromoDiscount): string => {
    if (promo.discount_type === 'percentage') {
      return promo.discount_value === 100 ? 'FREE access' : `${promo.discount_value}% off`
    }
    if (promo.discount_type === 'fixed_amount') {
      return `£${promo.discount_value} off`
    }
    if (promo.discount_type === 'free_trial') {
      return `${promo.discount_value}-day free trial`
    }
    return 'Discount applied'
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="mb-4"
            style={{ fontSize: 'clamp(1.875rem, 5vw, 2.5rem)' }}
          >
            Simple, transparent pricing
          </h1>
          <p
            className="max-w-2xl mx-auto"
            style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem' }}
          >
            Choose the plan that&apos;s right for your university journey.
            All plans include access to Scotland&apos;s widening access information.
          </p>
        </div>

        {/* Alerts */}
        {checkoutCanceled && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-center">
            Checkout was canceled. Feel free to try again when you&apos;re ready.
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Promo Code Section */}
        <div className="max-w-sm mx-auto mb-10">
          {appliedCode && promoDiscount ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <div>
                <span className="text-green-800 font-semibold text-sm">{appliedCode}</span>
                <span className="text-green-600 text-sm ml-2">— {getPromoLabel(promoDiscount)}</span>
                {promoDiscount.description && (
                  <p className="text-green-600 text-xs mt-0.5">{promoDiscount.description}</p>
                )}
              </div>
              <button
                onClick={handleRemovePromo}
                className="text-green-600 hover:text-green-800 ml-3 text-sm underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              {!promoOpen ? (
                <button
                  onClick={() => setPromoOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline mx-auto block"
                >
                  Have a promo code?
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Enter promo code"
                      aria-label="Promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                      autoFocus
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {promoLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-red-600 text-xs">{promoError}</p>
                  )}
                  <button
                    onClick={() => { setPromoOpen(false); setPromoError(null) }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const discountedPrice = applyDiscount(plan.price, promoDiscount)
            const hasDiscount = promoDiscount && plan.price > 0 && discountedPrice !== plan.price
            const isFree = discountedPrice === 0 && plan.price > 0

            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-gray-600 mt-1">{plan.description}</p>

                  <div className="mt-6">
                    {hasDiscount ? (
                      <div>
                        <span className="text-2xl text-gray-400 line-through mr-2">
                          £{plan.price}
                        </span>
                        <span className="text-4xl font-bold text-green-600">
                          {isFree ? 'Free' : `£${discountedPrice.toFixed(2)}`}
                        </span>
                        {!isFree && (
                          <span className="text-gray-500 ml-1">/{plan.interval}</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price === 0 ? 'Free' : `£${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-500 ml-1">/{plan.interval}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.priceId || null, plan.name, plan.price)}
                    disabled={loading === plan.name}
                    className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } disabled:opacity-50`}
                  >
                    {loading === plan.name ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : plan.price === 0 ? (
                      'Get Started'
                    ) : (
                      'Subscribe'
                    )}
                  </button>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 opacity-50">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Cancel anytime. No questions asked.
            <Link href="/terms" className="text-blue-600 hover:underline ml-1">
              Terms apply
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: 'var(--pf-blue-50)' }}
        >
          <div className="animate-pulse" style={{ color: 'var(--pf-grey-600)' }}>
            Loading...
          </div>
        </div>
      }
    >
      <PricingPageContent />
    </Suspense>
  )
}
