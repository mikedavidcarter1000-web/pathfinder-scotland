import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import {
  syncSchoolTiersForAuthority,
  logAuthoritySubscriptionEvent,
} from '@/lib/authority/subscription'

export const runtime = 'nodejs'

// Manual trigger for the bundled-school tier sync. Admins of an active
// authority can run this if a new school joined Pathfinder after the
// webhook last fired and the tier sync didn't pick them up automatically.
export async function POST() {
  const guard = await requireAuthorityStaffApi({ mustBeAdmin: true, mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // Refuse to sync if the authority is not currently active / trial.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: la } = await (admin as any)
    .from('local_authorities')
    .select('subscription_status')
    .eq('id', ctx.authorityId)
    .maybeSingle()

  if (!la) return NextResponse.json({ error: 'Authority not found.' }, { status: 404 })
  if (la.subscription_status !== 'active') {
    return NextResponse.json(
      { error: `Authority is not in an active subscription state (current: ${la.subscription_status}).` },
      { status: 400 }
    )
  }

  try {
    const result = await syncSchoolTiersForAuthority(admin, ctx.authorityId)
    void logAuthoritySubscriptionEvent(
      admin,
      ctx.authorityId,
      'school_tier_sync',
      'schools',
      { manual: true, ...result }
    )
    return NextResponse.json(result)
  } catch (err) {
    console.error('[authority/subscribe/sync-schools] failed:', err)
    return NextResponse.json({ error: 'Sync failed.' }, { status: 500 })
  }
}
