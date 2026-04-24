import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { stripe } from '@/lib/stripe'

export const runtime = 'nodejs'

function resolveOrigin(req: Request): string {
  const rawOrigin = req.headers.get('origin') || ''
  const allowed = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'https://pathfinderscot.co.uk',
    'https://www.pathfinderscot.co.uk',
  ].filter(Boolean) as string[]
  return allowed.includes(rawOrigin) ? rawOrigin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
}

export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('stripe_customer_id')
    .eq('id', ctx.schoolId)
    .maybeSingle()

  const customerId = school?.stripe_customer_id as string | null
  if (!customerId) {
    return NextResponse.json({ error: 'No billing account found.' }, { status: 404 })
  }

  const origin = resolveOrigin(req)

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/school/settings`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[school/billing/portal] stripe error:', err)
    return NextResponse.json({ error: 'Could not create billing portal session.' }, { status: 500 })
  }
}
