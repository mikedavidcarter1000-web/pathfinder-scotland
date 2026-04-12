import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createBillingPortalSession, getStripeCustomerId } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
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

    const customerId = await getStripeCustomerId(supabase, user.id)

    if (!customerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

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
    const session = await createBillingPortalSession(
      customerId,
      `${origin}/dashboard`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
