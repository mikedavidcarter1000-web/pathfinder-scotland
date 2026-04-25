import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import { stripe } from '@/lib/stripe'
import { calculateLAPrice } from '@/lib/authority/pricing'

export const runtime = 'nodejs'

// Returns the current subscription state for the calling authority.
// Combines the local DB row with live data from Stripe (next billing
// date, cancel-at-period-end flag, recent invoices) so the UI can show
// a complete picture without making the client hit Stripe directly.
export async function GET() {
  const guard = await requireAuthorityStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: la } = await (admin as any)
    .from('local_authorities')
    .select(`
      id, name, subscription_tier, subscription_status,
      trial_started_at, trial_expires_at,
      stripe_customer_id, stripe_subscription_id
    `)
    .eq('id', ctx.authorityId)
    .maybeSingle()

  if (!la) return NextResponse.json({ error: 'Authority not found.' }, { status: 404 })

  // School count for the breakdown display (auto from current schools).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: schoolCount } = await (admin as any)
    .from('schools')
    .select('id', { count: 'exact', head: true })
    .eq('local_authority', la.name)
    .eq('visible_to_authority', true)

  let nextBillingDate: string | null = null
  let cancelAtPeriodEnd = false
  let cancelAt: string | null = null
  let invoices: Array<{
    id: string
    number: string | null
    amount: number
    currency: string
    status: string | null
    hostedUrl: string | null
    pdfUrl: string | null
    createdAt: string
  }> = []

  if (la.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(la.stripe_subscription_id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subAny = sub as any
      if (subAny.current_period_end) {
        nextBillingDate = new Date(subAny.current_period_end * 1000).toISOString()
      }
      cancelAtPeriodEnd = !!subAny.cancel_at_period_end
      if (subAny.cancel_at) cancelAt = new Date(subAny.cancel_at * 1000).toISOString()
    } catch (err) {
      console.error('[authority/subscription] stripe sub retrieve failed:', err)
    }
  }

  if (la.stripe_customer_id) {
    try {
      const list = await stripe.invoices.list({ customer: la.stripe_customer_id, limit: 10 })
      invoices = list.data.map((inv) => ({
        id: inv.id ?? '',
        number: inv.number ?? null,
        amount: inv.amount_paid || inv.amount_due || 0,
        currency: inv.currency,
        status: inv.status ?? null,
        hostedUrl: inv.hosted_invoice_url ?? null,
        pdfUrl: inv.invoice_pdf ?? null,
        createdAt: new Date(inv.created * 1000).toISOString(),
      }))
    } catch (err) {
      console.error('[authority/subscription] stripe invoice list failed:', err)
    }
  }

  const breakdown = calculateLAPrice(schoolCount ?? 0)

  return NextResponse.json({
    authority: {
      id: la.id,
      name: la.name,
      subscription_tier: la.subscription_tier,
      subscription_status: la.subscription_status,
      trial_started_at: la.trial_started_at,
      trial_expires_at: la.trial_expires_at,
      has_stripe_customer: !!la.stripe_customer_id,
      has_stripe_subscription: !!la.stripe_subscription_id,
    },
    schoolCount: schoolCount ?? 0,
    pricing: breakdown,
    nextBillingDate,
    cancelAtPeriodEnd,
    cancelAt,
    invoices,
  })
}
