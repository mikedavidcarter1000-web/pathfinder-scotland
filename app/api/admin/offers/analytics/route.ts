import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'
import { computeOffersAnalytics } from '@/lib/admin-offers-analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireAdminApi()
  if (!guard.ok) return guard.response

  try {
    const analytics = await computeOffersAnalytics(guard.admin)
    return NextResponse.json(analytics)
  } catch (err) {
    console.error('[admin/offers/analytics] error:', err)
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 })
  }
}
