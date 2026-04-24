import { getAdminClient } from '@/lib/admin-auth'
import { getSubscriptionState, type SubscriptionState, isPremiumFeature } from '@/lib/school/subscription'

// Server-side helper: fetch the current subscription state for a given
// school. Returns null if the service role client isn't configured.
export async function fetchSchoolSubscriptionState(schoolId: string): Promise<SubscriptionState | null> {
  const admin = getAdminClient()
  if (!admin) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('schools')
    .select('subscription_status, subscription_tier, trial_expires_at, trial_started_at, is_founding_school, stripe_subscription_id')
    .eq('id', schoolId)
    .maybeSingle()
  if (!data) return null
  return getSubscriptionState(data)
}

// Client-side lookup via /api/school/me result (passed in). Useful inside
// client components that already hold the `DashboardMe` object.
export { getSubscriptionState, isPremiumFeature }
