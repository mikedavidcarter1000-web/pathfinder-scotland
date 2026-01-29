'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { redirectToCheckout } from '@/lib/stripe-client'

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

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkoutCanceled = searchParams.get('checkout') === 'canceled'

  const handleSubscribe = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      // Free plan - just go to dashboard
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
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
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
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Pathfinder</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
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
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mt-1">{plan.description}</p>

                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Free' : `£${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-1">/{plan.interval}</span>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.priceId || null, plan.name)}
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
          ))}
        </div>

        {/* FAQ or Trust Badges */}
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
