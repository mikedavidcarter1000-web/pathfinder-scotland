// Server-side helpers for the LA Stripe subscription flow:
//   - sync school tiers when an LA subscription activates / cancels
//   - log entries to authority_audit_log
//
// All callers must use the service-role admin client (RLS on
// local_authorities + schools forbids cross-LA writes).

import type { SupabaseClient } from '@supabase/supabase-js'

export type SchoolTierSyncResult = {
  totalCandidates: number
  updated: number
  skipped: number
  authorityName: string
}

// Grant Standard tier to every visible school in this LA's area whose
// current tier is null or 'free' or 'trial'. Existing 'standard' /
// 'premium' rows are left alone (we do not downgrade Premium and a school
// that already shows Standard may have purchased it themselves -- the
// subscription_source flag distinguishes the two going forward).
//
// All updated rows are stamped with subscription_source='authority_bundle'
// so a later cancellation can revert exactly the rows we granted.
export async function syncSchoolTiersForAuthority(
  admin: SupabaseClient,
  authorityId: string
): Promise<SchoolTierSyncResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: la } = await (admin as any)
    .from('local_authorities')
    .select('id, name, subscription_status')
    .eq('id', authorityId)
    .maybeSingle()

  if (!la) {
    return { totalCandidates: 0, updated: 0, skipped: 0, authorityName: '' }
  }

  // Only sync when the LA is actually active. A pending / cancelled /
  // expired LA must not silently grant tier access. Founding-LA trial
  // state is also stored as 'active' (with trial_expires_at set).
  if (la.subscription_status !== 'active') {
    return {
      totalCandidates: 0,
      updated: 0,
      skipped: 0,
      authorityName: la.name as string,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: schools } = await (admin as any)
    .from('schools')
    .select('id, subscription_tier, subscription_source, visible_to_authority')
    .eq('local_authority', la.name)
    .eq('visible_to_authority', true)

  const candidates = (schools ?? []) as Array<{
    id: string
    subscription_tier: string | null
    subscription_source: string | null
  }>

  // Only upgrade schools that have no paid tier yet. Existing 'standard'
  // and 'premium' rows are left alone; they may have purchased their
  // own subscription and we must not overwrite that.
  const toGrant = candidates.filter((s) => {
    const tier = s.subscription_tier
    return tier === null || tier === 'trial'
  })

  if (toGrant.length === 0) {
    return {
      totalCandidates: candidates.length,
      updated: 0,
      skipped: candidates.length,
      authorityName: la.name as string,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('schools')
    .update({
      subscription_tier: 'standard',
      subscription_status: 'active',
      subscription_source: 'authority_bundle',
    })
    .in('id', toGrant.map((s) => s.id))

  if (error) {
    throw new Error(`syncSchoolTiersForAuthority update failed: ${error.message}`)
  }

  return {
    totalCandidates: candidates.length,
    updated: toGrant.length,
    skipped: candidates.length - toGrant.length,
    authorityName: la.name as string,
  }
}

// Cancellation revert: set bundled schools back to 'free' so they lose
// LA-granted access. Schools whose subscription_source is 'individual'
// are left untouched -- they purchased their own tier.
//
// This is called after the 30-day grace period in the webhook handler
// (or immediately on hard-cancel; the grace period is enforced by NOT
// calling this on customer.subscription.deleted unless the deletion is
// explicit).
export async function revertBundledSchoolTiersForAuthority(
  admin: SupabaseClient,
  authorityId: string
): Promise<SchoolTierSyncResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: la } = await (admin as any)
    .from('local_authorities')
    .select('id, name')
    .eq('id', authorityId)
    .maybeSingle()

  if (!la) {
    return { totalCandidates: 0, updated: 0, skipped: 0, authorityName: '' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: schools } = await (admin as any)
    .from('schools')
    .select('id, subscription_source')
    .eq('local_authority', la.name)
    .eq('subscription_source', 'authority_bundle')

  const bundled = (schools ?? []) as Array<{ id: string }>

  if (bundled.length === 0) {
    return {
      totalCandidates: 0,
      updated: 0,
      skipped: 0,
      authorityName: la.name as string,
    }
  }

  // 'free' is not a valid subscription_tier value (CHECK constraint allows
  // trial / standard / premium / authority or NULL). Setting tier to
  // NULL + status to 'cancelled' is the canonical "no paid access" state.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('schools')
    .update({
      subscription_tier: null,
      subscription_status: 'cancelled',
      subscription_source: 'individual',
    })
    .in('id', bundled.map((s) => s.id))

  if (error) {
    throw new Error(`revertBundledSchoolTiersForAuthority update failed: ${error.message}`)
  }

  return {
    totalCandidates: bundled.length,
    updated: bundled.length,
    skipped: 0,
    authorityName: la.name as string,
  }
}

// Fire-and-forget audit log insert. The webhook handler must NOT block
// on this -- a failed audit insert should not retry the entire webhook
// (Stripe will redeliver if we 500, and that re-runs the subscription
// state writes too).
export async function logAuthoritySubscriptionEvent(
  admin: SupabaseClient,
  authorityId: string,
  action: string,
  resource: string,
  filters: Record<string, unknown>
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('authority_audit_log').insert({
      authority_id: authorityId,
      action,
      resource,
      filters_applied: filters,
    })
  } catch (err) {
    console.error('[authority audit] insert failed:', err)
  }
}
