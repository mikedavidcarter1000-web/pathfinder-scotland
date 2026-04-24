// School subscription state + feature-gating helpers.
//
// The schools table carries two related columns:
//   subscription_status : 'trial' | 'active' | 'expired' | 'cancelled'
//   subscription_tier   : 'trial' | 'standard' | 'premium' | 'authority'
//
// The product rules encoded here are:
//   - 'trial' tier with a future trial_expires_at -> all features, counting down
//   - 'trial' tier with trial_expires_at in the past -> read-only; dashboard overlay
//   - 'standard' -> core features, premium features show upgrade prompt
//   - 'premium' / 'authority' -> all features
//   - 'cancelled' status -> expired-like, but allow resubscribe
//
// Feature gating reads `isPremiumFeature(path)` and cross-references the tier.

export type SchoolSubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled'
export type SchoolSubscriptionTier = 'trial' | 'standard' | 'premium' | 'authority'

export type SchoolSubscriptionInput = {
  subscription_status: SchoolSubscriptionStatus | string | null
  subscription_tier: SchoolSubscriptionTier | string | null
  trial_expires_at: string | null
  trial_started_at: string | null
  is_founding_school: boolean | null
  stripe_subscription_id: string | null
}

export type SubscriptionState = {
  isActive: boolean
  isTrial: boolean
  isCancelled: boolean
  isFoundingSchool: boolean
  status: SchoolSubscriptionStatus
  tier: SchoolSubscriptionTier
  trialExpiresAt: Date | null
  daysRemaining: number | null
  isExpiringSoon: boolean
  isExpired: boolean
  showUpgradePrompt: boolean
  message: string
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
}

export function getSubscriptionState(school: SchoolSubscriptionInput): SubscriptionState {
  const rawStatus = (school.subscription_status ?? 'trial') as string
  const rawTier = (school.subscription_tier ?? 'trial') as string
  const status: SchoolSubscriptionStatus =
    rawStatus === 'active' || rawStatus === 'expired' || rawStatus === 'cancelled'
      ? rawStatus
      : 'trial'
  const tier: SchoolSubscriptionTier =
    rawTier === 'standard' || rawTier === 'premium' || rawTier === 'authority'
      ? rawTier
      : 'trial'

  const isFoundingSchool = !!school.is_founding_school
  const trialExpiresAt = school.trial_expires_at ? new Date(school.trial_expires_at) : null
  const now = new Date()

  const daysRemaining =
    tier === 'trial' && trialExpiresAt ? Math.max(daysBetween(now, trialExpiresAt), 0) : null
  const trialExpired = tier === 'trial' && trialExpiresAt ? trialExpiresAt.getTime() < now.getTime() : false

  const hasStripeSub = !!school.stripe_subscription_id
  const isActivePaid = status === 'active' && hasStripeSub && (tier === 'standard' || tier === 'premium' || tier === 'authority')

  const isExpired = status === 'expired' || trialExpired
  const isCancelled = status === 'cancelled'
  const isTrial = tier === 'trial' && !isExpired
  const isActive = isActivePaid || isTrial
  const isExpiringSoon = isTrial && daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30

  let message = ''
  if (isExpired) {
    message = 'Your trial has expired. Subscribe to continue using Pathfinder Schools.'
  } else if (isCancelled) {
    message = 'Your subscription has been cancelled. Your data is retained. Resubscribe to restore access.'
  } else if (isTrial) {
    const when = trialExpiresAt ? trialExpiresAt.toLocaleDateString('en-GB') : null
    message = isFoundingSchool
      ? `Founding school trial${when ? ` until ${when}` : ''}.`
      : `Trial${when ? ` until ${when}` : ''}.`
  } else if (isActivePaid) {
    message = tier === 'premium' ? 'Premium subscription active.' : 'Standard subscription active.'
  } else {
    message = 'Subscription status unknown.'
  }

  return {
    isActive,
    isTrial,
    isCancelled,
    isFoundingSchool,
    status,
    tier,
    trialExpiresAt,
    daysRemaining,
    isExpiringSoon,
    isExpired,
    showUpgradePrompt: isExpired || isCancelled,
    message,
  }
}

// --- Feature gating -------------------------------------------------------

// Paths where the feature is premium-only. Trial schools see all features
// (they are evaluating the whole product); standard schools see an upgrade
// prompt instead of the feature content.
const PREMIUM_FEATURE_PATHS = [
  '/school/dyw',
  '/school/parents-evening',
  '/school/inspection/curriculum',
] as const

// Sub-paths within otherwise-free areas that are premium-only. The first
// element is the parent path (e.g. /school/import) and the tuple lists the
// children that are gated. Used by the import page's tab-level gating
// rather than pure middleware gating.
export const PREMIUM_SUB_FEATURES = {
  '/school/import': ['destinations', 'transition'],
  '/school/cpd': ['school-cpd'],
} as const

export function isPremiumFeature(path: string): boolean {
  return PREMIUM_FEATURE_PATHS.some((p) => path === p || path.startsWith(p + '/'))
}

export function canAccessFeature(state: SubscriptionState, path: string): boolean {
  if (state.isExpired || state.isCancelled) return false
  if (state.isTrial) return true
  if (state.tier === 'premium' || state.tier === 'authority') return true
  if (!isPremiumFeature(path)) return true
  return false
}

// --- Pricing --------------------------------------------------------------

export const STANDARD_PRICE_GBP = 1500
export const PREMIUM_PRICE_GBP = 2500
export const FOUNDING_DISCOUNT_FRACTION = 0.5 // 50% off

export function priceForTier(tier: 'standard' | 'premium', foundingSchool: boolean): number {
  const base = tier === 'standard' ? STANDARD_PRICE_GBP : PREMIUM_PRICE_GBP
  return foundingSchool ? Math.round(base * (1 - FOUNDING_DISCOUNT_FRACTION)) : base
}
