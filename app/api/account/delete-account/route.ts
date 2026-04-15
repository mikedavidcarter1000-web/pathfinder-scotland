import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { confirmation } = await req.json()

    if (confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Invalid confirmation — type DELETE to confirm' }, { status: 400 })
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
          // Writable cookies needed for signOut to clear the session
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }) } catch (_) {}
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: '', ...options }) } catch (_) {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Cancel any active Stripe subscription before deletion
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (stripeKey) {
      try {
        const { data: subscription } = await supabase
          .from('stripe_subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .maybeSingle()

        if (subscription?.stripe_subscription_id) {
          // Dynamic import avoids crashing if key is missing at module-load time
          const { default: Stripe } = await import('stripe')
          const stripe = new Stripe(stripeKey, { typescript: true })
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
        }
      } catch (stripeError) {
        // Log the issue but do not block the account deletion
        console.warn('Stripe subscription cancellation warning (proceeding with deletion):', stripeError)
      }
    } else {
      console.warn('STRIPE_SECRET_KEY not configured — skipping subscription cancellation')
    }

    // Delete all user data via the GDPR function (uses auth.uid() internally)
    const { error: deleteError } = await supabase.rpc('delete_user_data')

    if (deleteError) {
      console.error('delete_user_data RPC error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete account data' }, { status: 500 })
    }

    // Completely remove the user from Supabase auth
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false } }
    )

    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (authDeleteError) {
      console.error('Failed to delete auth user:', authDeleteError)
      // Account may be partially deleted, but we must return an error
      return NextResponse.json({ error: 'Failed to complete account deletion' }, { status: 500 })
    }

    // Sign out the user — clears session cookies
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
