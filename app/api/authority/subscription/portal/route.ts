import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import { createBillingPortalSession } from '@/lib/stripe'

export const runtime = 'nodejs'

function resolveOrigin(req: Request): string {
  const rawOrigin = req.headers.get('origin') || ''
  const allowed = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'https://pathfinderscot.co.uk',
    'https://www.pathfinderscot.co.uk',
  ].filter(Boolean) as string[]
  return allowed.includes(rawOrigin)
    ? rawOrigin
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export async function POST(req: Request) {
  const guard = await requireAuthorityStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: la } = await (admin as any)
    .from('local_authorities')
    .select('stripe_customer_id')
    .eq('id', ctx.authorityId)
    .maybeSingle()

  if (!la?.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer for this authority.' }, { status: 404 })
  }

  const origin = resolveOrigin(req)

  try {
    const session = await createBillingPortalSession(
      la.stripe_customer_id as string,
      `${origin}/authority/settings/subscription`
    )
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[authority/subscription/portal] stripe error:', err)
    return NextResponse.json({ error: 'Could not open billing portal.' }, { status: 500 })
  }
}
