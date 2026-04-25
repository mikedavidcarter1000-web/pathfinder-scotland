// Pathfinder LA Portal pricing engine.
//
// Pricing model (per docs/Pathfinder_Local_Authority_Portal_Architecture.md
// section 10):
//   - Base platform fee: GBP 5,000 / year
//   - Per-school, schools 1-10:  GBP 1,500 / school / year
//   - Per-school, schools 11-20: GBP 1,250 / school / year
//   - Per-school, schools 21+:   GBP 1,000 / school / year
//
// All amounts are inclusive of nothing and exclusive of nothing -- the LA
// pays the calculated total annually. The first 3 verified, active LAs
// qualify as founding authorities (free for 12 months, then standard
// pricing).
//
// School upgrade: an LA-bundled school gets Standard tier (GBP 1,500/year
// value) included. Premium upgrade is GBP 1,000/year (the difference
// between Premium GBP 2,500 and Standard GBP 1,500).

import type { SupabaseClient } from '@supabase/supabase-js'

export const LA_BASE_FEE_GBP = 5000
export const LA_TIER_1_RATE_GBP = 1500
export const LA_TIER_2_RATE_GBP = 1250
export const LA_TIER_3_RATE_GBP = 1000
export const LA_TIER_1_MAX = 10
export const LA_TIER_2_MAX = 20

export const SCHOOL_STANDARD_PRICE_GBP = 1500
export const SCHOOL_PREMIUM_PRICE_GBP = 2500
export const SCHOOL_UPGRADE_PRICE_GBP = SCHOOL_PREMIUM_PRICE_GBP - SCHOOL_STANDARD_PRICE_GBP

export const FOUNDING_AUTHORITY_LIMIT = 3
export const FOUNDING_AUTHORITY_TRIAL_MONTHS = 12
// Stripe takes the trial as a day count. 365 covers a calendar year of
// renewal alignment within Stripe's 730-day cap on trial_period_days.
export const FOUNDING_AUTHORITY_TRIAL_DAYS = 365

export type TierBreakdown = {
  range: '1-10' | '11-20' | '21+'
  count: number
  rate: number
  subtotal: number
}

export type LAPriceBreakdown = {
  annual: number
  annualPounds: number
  base: number
  schoolCount: number
  perSchoolBreakdown: TierBreakdown[]
  includedSchoolTier: 'standard'
  savingsVsIndividual: number
}

// Calculate the annual LA subscription price for a given school count.
// Returns the total in pence (Stripe-friendly) and a per-tier breakdown.
//
// Negative or non-finite school counts collapse to 0 -- the calculator
// charges only the base fee. Decimal counts are rounded down (you can't
// subscribe half a school).
export function calculateLAPrice(schoolCount: number): LAPriceBreakdown {
  const safeCount = Number.isFinite(schoolCount) && schoolCount > 0
    ? Math.floor(schoolCount)
    : 0

  const tier1Count = Math.min(safeCount, LA_TIER_1_MAX)
  const tier2Count = Math.max(0, Math.min(safeCount - LA_TIER_1_MAX, LA_TIER_2_MAX - LA_TIER_1_MAX))
  const tier3Count = Math.max(0, safeCount - LA_TIER_2_MAX)

  const perSchoolBreakdown: TierBreakdown[] = [
    {
      range: '1-10',
      count: tier1Count,
      rate: LA_TIER_1_RATE_GBP,
      subtotal: tier1Count * LA_TIER_1_RATE_GBP,
    },
    {
      range: '11-20',
      count: tier2Count,
      rate: LA_TIER_2_RATE_GBP,
      subtotal: tier2Count * LA_TIER_2_RATE_GBP,
    },
    {
      range: '21+',
      count: tier3Count,
      rate: LA_TIER_3_RATE_GBP,
      subtotal: tier3Count * LA_TIER_3_RATE_GBP,
    },
  ]

  const annualPounds = LA_BASE_FEE_GBP + perSchoolBreakdown.reduce((acc, t) => acc + t.subtotal, 0)
  const annual = annualPounds * 100

  // Compare to the cost of every school buying Premium individually.
  // Negative means the LA bundle costs more than individual purchase
  // (only true at very small school counts where the analytics layer
  // still has to be paid for).
  const individualCostPounds = safeCount * SCHOOL_PREMIUM_PRICE_GBP
  const savingsVsIndividual = individualCostPounds - annualPounds

  return {
    annual,
    annualPounds,
    base: LA_BASE_FEE_GBP,
    schoolCount: safeCount,
    perSchoolBreakdown,
    includedSchoolTier: 'standard',
    savingsVsIndividual,
  }
}

// First 3 LAs to reach subscription_status = 'active' qualify as founding
// authorities (free for 12 months). This function is intentionally narrow:
// it does NOT consult the candidate authority's own row, so the caller
// must check that the authority is not already 'active' before applying
// founding terms (otherwise an existing founding authority would be
// counted against itself).
//
// Returns true when fewer than 3 active subscriptions currently exist.
export async function isFoundingAuthority(
  admin: SupabaseClient,
  candidateAuthorityId: string
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (admin as any)
    .from('local_authorities')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_status', 'active')
    .neq('id', candidateAuthorityId)

  if (error) {
    // Fail closed -- if we cannot count active authorities, do not award
    // founding pricing. The error is logged by the caller.
    return false
  }

  return (count ?? 0) < FOUNDING_AUTHORITY_LIMIT
}

// Premium upgrade for a school whose authority covers the Standard tier.
export function getSchoolUpgradePrice(): number {
  return SCHOOL_UPGRADE_PRICE_GBP
}
