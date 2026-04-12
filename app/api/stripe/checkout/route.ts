import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createOrRetrieveCustomer, createCheckoutSession } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const { priceId, promoCode } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create or get Stripe customer
    const customerId = await createOrRetrieveCustomer(
      supabase,
      user.id,
      user.email!
    )

    // Validate origin to prevent open redirect attacks
    const rawOrigin = req.headers.get('origin') || ''
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      'http://localhost:3000',
      'https://pathfinderscot.co.uk',
      'https://www.pathfinderscot.co.uk',
    ].filter(Boolean)
    const origin = allowedOrigins.includes(rawOrigin)
      ? rawOrigin
      : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${origin}/dashboard?checkout=success`,
      cancelUrl: `${origin}/pricing?checkout=canceled`,
      promoCode,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
