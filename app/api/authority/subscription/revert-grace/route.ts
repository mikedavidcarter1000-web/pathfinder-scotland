import { NextResponse } from 'next/server'
import { authoriseCron } from '@/lib/authority/cron-auth'
import { getAdminClient } from '@/lib/admin-auth'
import {
  revertBundledSchoolTiersForAuthority,
  logAuthoritySubscriptionEvent,
} from '@/lib/authority/subscription'

export const runtime = 'nodejs'

const GRACE_PERIOD_DAYS = 30

// Cron-triggered revert: for any local_authorities row that was
// cancelled more than 30 days ago, revoke bundled-school Standard tier
// access. Schools that purchased their own tier (subscription_source =
// 'individual') are left untouched.
//
// Schedule: daily. Vercel cron entry should hit this with the
// CRON_SECRET bearer token. Idempotent -- once a school is reverted,
// it has subscription_source = 'individual' and will not be picked up
// again.
export async function POST(req: Request) {
  if (!authoriseCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })

  const cutoff = new Date(Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // updated_at flips when subscription_status moves to 'cancelled'
  // (set_local_authorities_updated_at trigger). It's a reasonable proxy
  // for "cancellation date" without adding a dedicated cancelled_at
  // column.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: candidates, error } = await (admin as any)
    .from('local_authorities')
    .select('id, name, updated_at')
    .eq('subscription_status', 'cancelled')
    .lt('updated_at', cutoff)

  if (error) {
    console.error('[revert-grace] candidate lookup failed:', error)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }

  const results: Array<{ authorityId: string; authorityName: string; reverted: number }> = []
  for (const la of (candidates ?? []) as Array<{ id: string; name: string }>) {
    try {
      const r = await revertBundledSchoolTiersForAuthority(admin, la.id)
      results.push({ authorityId: la.id, authorityName: r.authorityName, reverted: r.updated })
      if (r.updated > 0) {
        await logAuthoritySubscriptionEvent(
          admin,
          la.id,
          'school_tier_revert',
          'schools',
          { reason: 'grace_period_expired', ...r }
        )
      }
    } catch (err) {
      console.error(`[revert-grace] revert failed for authority ${la.id}:`, err)
    }
  }

  return NextResponse.json({
    cutoff,
    candidatesScanned: results.length,
    schoolsReverted: results.reduce((acc, r) => acc + r.reverted, 0),
    perAuthority: results,
  })
}
