import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export interface OffersAnalyticsSummary {
  totalOffers: number
  activeOffers: number
  inactiveOffers: number
  clicksLast7Days: number
  clicksLast30Days: number
  clicksAllTime: number
  uniqueStudentsLast30Days: number
  offersNeedingReview: number
}

export interface TopOfferRow {
  offerId: string
  title: string
  slug: string
  categoryName: string
  clickCount: number
  uniqueStudents: number
}

export interface CategoryClicksRow {
  categoryName: string
  categorySlug: string
  clickCount: number
  percentage: number
}

export interface SupportReferralRow {
  referrerPage: string
  clickCount: number
  topOfferTitle: string | null
  topOfferSlug: string | null
}

export interface SavedOfferRow {
  offerId: string
  title: string
  slug: string
  categoryName: string
  saveCount: number
}

export interface StaleOfferRow {
  offerId: string
  title: string
  slug: string
  categoryName: string
  lastVerifiedAt: string | null
  daysSinceVerification: number | null
}

export interface OffersAnalytics {
  summary: OffersAnalyticsSummary
  topOffersLast30Days: TopOfferRow[]
  clicksByCategoryLast30Days: CategoryClicksRow[]
  supportHubReferrals: SupportReferralRow[]
  mostSavedOffers: SavedOfferRow[]
  staleOffers: StaleOfferRow[]
}

type ClickRow = {
  id: string
  offer_id: string
  student_id: string | null
  click_type: string
  referrer_page: string | null
  created_at: string
}

type OfferMini = {
  id: string
  title: string
  slug: string
  is_active: boolean
  needs_review: boolean
  last_verified_at: string | null
  category_id: string
}

type CategoryMini = { id: string; name: string; slug: string }

const DAY_MS = 24 * 60 * 60 * 1000

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS)
}

/**
 * Computes every analytics view required by the admin dashboard in a single
 * batched fetch. Uses the service-role admin client so it can read `offer_clicks`
 * (no public RLS read policy) and `partners`.
 */
export async function computeOffersAnalytics(
  admin: SupabaseClient<Database>
): Promise<OffersAnalytics> {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS)

  // Pull all offers (active + inactive) with category info. Offer count is
  // small enough that a full scan is fine — this is admin-only telemetry.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offersRes = await (admin as any)
    .from('offers')
    .select(
      'id, title, slug, is_active, needs_review, last_verified_at, category_id'
    )
  const offers: OfferMini[] = (offersRes.data ?? []) as OfferMini[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoriesRes = await (admin as any)
    .from('offer_categories')
    .select('id, name, slug')
  const categories: CategoryMini[] = (categoriesRes.data ?? []) as CategoryMini[]
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  // Clicks for last 30 days — this is the main analytics window. We also need
  // an all-time count; fetch that separately as a head-only count to avoid
  // dragging the full table into memory.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clicks30Res = await (admin as any)
    .from('offer_clicks')
    .select('id, offer_id, student_id, click_type, referrer_page, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(50000)
  const clicks30: ClickRow[] = (clicks30Res.data ?? []) as ClickRow[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTimeRes = await (admin as any)
    .from('offer_clicks')
    .select('id', { count: 'exact', head: true })
  const clicksAllTime = allTimeRes.count ?? 0

  // Saved offers (all-time, admin only)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedRes = await (admin as any).from('saved_offers').select('offer_id')
  const savedRows: { offer_id: string }[] = (savedRes.data ?? []) as { offer_id: string }[]

  // ---- Summary ----
  const activeOffers = offers.filter((o) => o.is_active).length
  const inactiveOffers = offers.length - activeOffers
  const needsReviewCount = offers.filter((o) => o.needs_review).length

  const clicks7 = clicks30.filter((c) => new Date(c.created_at) >= sevenDaysAgo)
  const uniqueStudents30 = new Set(
    clicks30.map((c) => c.student_id).filter((s): s is string => !!s)
  )

  const summary: OffersAnalyticsSummary = {
    totalOffers: offers.length,
    activeOffers,
    inactiveOffers,
    clicksLast7Days: clicks7.length,
    clicksLast30Days: clicks30.length,
    clicksAllTime,
    uniqueStudentsLast30Days: uniqueStudents30.size,
    offersNeedingReview: needsReviewCount,
  }

  // ---- Top 10 offers by clicks (last 30 days) ----
  // Only count outbound + detail_view; save/unsave/copy_code aren't engagement
  // signals in the same sense.
  const engagementTypes = new Set(['outbound', 'detail_view'])
  const engagementClicks = clicks30.filter((c) => engagementTypes.has(c.click_type))

  const offerCounts = new Map<string, { count: number; students: Set<string> }>()
  for (const c of engagementClicks) {
    const bucket = offerCounts.get(c.offer_id) ?? { count: 0, students: new Set() }
    bucket.count++
    if (c.student_id) bucket.students.add(c.student_id)
    offerCounts.set(c.offer_id, bucket)
  }

  const offerById = new Map(offers.map((o) => [o.id, o]))
  const topOffersLast30Days: TopOfferRow[] = Array.from(offerCounts.entries())
    .map(([id, bucket]) => {
      const offer = offerById.get(id)
      const category = offer ? categoryById.get(offer.category_id) : undefined
      return {
        offerId: id,
        title: offer?.title ?? '(deleted offer)',
        slug: offer?.slug ?? '',
        categoryName: category?.name ?? '—',
        clickCount: bucket.count,
        uniqueStudents: bucket.students.size,
      }
    })
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 10)

  // ---- Clicks by category (last 30 days) ----
  const categoryCounts = new Map<string, number>()
  for (const c of engagementClicks) {
    const offer = offerById.get(c.offer_id)
    if (!offer) continue
    categoryCounts.set(offer.category_id, (categoryCounts.get(offer.category_id) ?? 0) + 1)
  }
  const categoryTotal = Array.from(categoryCounts.values()).reduce((a, b) => a + b, 0)
  const clicksByCategoryLast30Days: CategoryClicksRow[] = Array.from(categoryCounts.entries())
    .map(([catId, count]) => {
      const cat = categoryById.get(catId)
      return {
        categoryName: cat?.name ?? 'Unknown',
        categorySlug: cat?.slug ?? 'unknown',
        clickCount: count,
        percentage: categoryTotal > 0 ? Math.round((count / categoryTotal) * 1000) / 10 : 0,
      }
    })
    .sort((a, b) => b.clickCount - a.clickCount)

  // ---- Support hub referral tracking (last 30 days) ----
  // Any click whose referrer_page starts with /support/. Group by referrer and
  // find the top offer per referrer.
  const supportClicks = clicks30.filter(
    (c) => typeof c.referrer_page === 'string' && c.referrer_page.startsWith('/support/')
  )
  const referrerBuckets = new Map<string, { count: number; perOffer: Map<string, number> }>()
  for (const c of supportClicks) {
    const key = c.referrer_page as string
    const bucket = referrerBuckets.get(key) ?? { count: 0, perOffer: new Map() }
    bucket.count++
    bucket.perOffer.set(c.offer_id, (bucket.perOffer.get(c.offer_id) ?? 0) + 1)
    referrerBuckets.set(key, bucket)
  }
  const supportHubReferrals: SupportReferralRow[] = Array.from(referrerBuckets.entries())
    .map(([referrer, bucket]) => {
      let topOfferId: string | null = null
      let topCount = 0
      for (const [oid, count] of bucket.perOffer.entries()) {
        if (count > topCount) {
          topCount = count
          topOfferId = oid
        }
      }
      const offer = topOfferId ? offerById.get(topOfferId) : undefined
      return {
        referrerPage: referrer,
        clickCount: bucket.count,
        topOfferTitle: offer?.title ?? null,
        topOfferSlug: offer?.slug ?? null,
      }
    })
    .sort((a, b) => b.clickCount - a.clickCount)

  // ---- Most saved offers (all-time) ----
  const saveCounts = new Map<string, number>()
  for (const row of savedRows) {
    saveCounts.set(row.offer_id, (saveCounts.get(row.offer_id) ?? 0) + 1)
  }
  const mostSavedOffers: SavedOfferRow[] = Array.from(saveCounts.entries())
    .map(([id, count]) => {
      const offer = offerById.get(id)
      const category = offer ? categoryById.get(offer.category_id) : undefined
      return {
        offerId: id,
        title: offer?.title ?? '(deleted offer)',
        slug: offer?.slug ?? '',
        categoryName: category?.name ?? '—',
        saveCount: count,
      }
    })
    .sort((a, b) => b.saveCount - a.saveCount)
    .slice(0, 10)

  // ---- Stale offers (needs_review = true) ----
  const staleOffers: StaleOfferRow[] = offers
    .filter((o) => o.needs_review)
    .map((o) => {
      const category = categoryById.get(o.category_id)
      const days = o.last_verified_at
        ? daysBetween(new Date(o.last_verified_at), now)
        : null
      return {
        offerId: o.id,
        title: o.title,
        slug: o.slug,
        categoryName: category?.name ?? '—',
        lastVerifiedAt: o.last_verified_at,
        daysSinceVerification: days,
      }
    })
    .sort((a, b) => {
      const da = a.daysSinceVerification ?? Number.MAX_SAFE_INTEGER
      const db = b.daysSinceVerification ?? Number.MAX_SAFE_INTEGER
      return db - da
    })

  return {
    summary,
    topOffersLast30Days,
    clicksByCategoryLast30Days,
    supportHubReferrals,
    mostSavedOffers,
    staleOffers,
  }
}
