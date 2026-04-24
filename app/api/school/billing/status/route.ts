import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

// Returns the billing status for the current school. Bundles:
//   - subscription_tier / subscription_status / trial dates (from DB)
//   - next billing date (from Stripe subscription, if any)
//   - cancel_at_period_end flag and cancel_at date (from Stripe)
// GET-only; admin-scoped because the Stripe subscription is a billing secret.
export async function GET() {
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('subscription_tier, subscription_status, trial_expires_at, trial_started_at, is_founding_school, stripe_customer_id, stripe_subscription_id')
    .eq('id', ctx.schoolId)
    .maybeSingle()

  if (!school) return NextResponse.json({ error: 'School not found.' }, { status: 404 })

  let nextBillingDate: string | null = null
  let cancelAtPeriodEnd = false
  let cancelAt: string | null = null

  if (school.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(school.stripe_subscription_id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subAny = sub as any
      if (subAny.current_period_end) {
        nextBillingDate = new Date(subAny.current_period_end * 1000).toISOString()
      }
      cancelAtPeriodEnd = !!subAny.cancel_at_period_end
      if (subAny.cancel_at) cancelAt = new Date(subAny.cancel_at * 1000).toISOString()
    } catch (err) {
      console.error('[school/billing/status] stripe retrieve failed:', err)
    }
  }

  return NextResponse.json({
    subscription_tier: school.subscription_tier,
    subscription_status: school.subscription_status,
    trial_expires_at: school.trial_expires_at,
    trial_started_at: school.trial_started_at,
    is_founding_school: school.is_founding_school,
    has_stripe_customer: !!school.stripe_customer_id,
    has_stripe_subscription: !!school.stripe_subscription_id,
    next_billing_date: nextBillingDate,
    cancel_at_period_end: cancelAtPeriodEnd,
    cancel_at: cancelAt,
  })
}
