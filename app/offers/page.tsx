import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  Offer,
  OfferCategory,
  OfferWithCategory,
} from '@/types/offers'
import type { Tables } from '@/types/database'
import { OffersClient } from './offers-client'
import { deriveStageFromSchoolStage } from '@/components/offers/offer-filters'

export const metadata: Metadata = {
  title: 'Student Offers & Entitlements | Pathfinder Scotland',
  description:
    "Find every discount, freebie, and entitlement available to Scottish students. Filtered by your school stage -- from S1 through to university.",
  openGraph: {
    title: 'Student Offers & Entitlements | Pathfinder Scotland',
    description:
      "Find every discount, freebie, and entitlement available to Scottish students. Filtered by your school stage -- from S1 through to university.",
  },
  alternates: {
    canonical: '/offers',
  },
}

type OfferRow = Offer & {
  category: Pick<OfferCategory, 'id' | 'name' | 'slug' | 'icon'> | null
}

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    stage?: string
    q?: string
    support_group?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()

  // If support_group is provided, resolve the offer_ids up-front so we can
  // filter the main query to just those tagged offers.
  let supportGroupOfferIds: string[] | null = null
  if (params.support_group) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tagRows } = await (supabase as any)
      .from('offer_support_groups')
      .select('offer_id')
      .eq('support_group', params.support_group)
    supportGroupOfferIds = ((tagRows ?? []) as { offer_id: string }[]).map((r) => r.offer_id)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let offersQuery = (supabase as any)
    .from('offers')
    .select(
      'id, category_id, title, slug, summary, description, brand, offer_type, discount_text, url, affiliate_url, promo_code, min_age, max_age, eligible_stages, scotland_only, requires_young_scot, requires_totum, requires_unidays, requires_student_beans, verification_method, locations, university_specific, seasonal_tags, active_from, active_until, partner_id, is_featured, featured_until, affiliate_network, commission_type, commission_value, cookie_days, last_verified_at, verified_by, is_active, needs_review, image_url, display_order, created_at, updated_at, category:offer_categories ( id, name, slug, icon )'
    )
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('title', { ascending: true })

  if (supportGroupOfferIds !== null) {
    if (supportGroupOfferIds.length === 0) {
      // Requested group has no offers — short-circuit with empty list.
      offersQuery = offersQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    } else {
      offersQuery = offersQuery.in('id', supportGroupOfferIds)
    }
  }

  const [offersRes, categoriesRes, userRes] = await Promise.all([
    offersQuery,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('offer_categories')
      .select('id, name, slug, description, icon, display_order, created_at')
      .order('display_order', { ascending: true }),
    supabase.auth.getUser(),
  ])

  const rawOffers = ((offersRes.data ?? []) as OfferRow[])
  const categories = ((categoriesRes.data ?? []) as OfferCategory[])
  const user = userRes.data.user

  // Load student (for auto-selecting stage) and saved offer ids (to hydrate heart icons)
  let student: Tables<'students'> | null = null
  let savedIds = new Set<string>()

  if (user) {
    const [studentRes, savedRes] = await Promise.all([
      supabase.from('students').select('*').eq('id', user.id).maybeSingle(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('saved_offers')
        .select('offer_id')
        .eq('student_id', user.id),
    ])
    student = (studentRes.data as Tables<'students'> | null) ?? null
    savedIds = new Set(
      ((savedRes.data ?? []) as { offer_id: string }[]).map((r) => r.offer_id)
    )
  }

  const offers: OfferWithCategory[] = rawOffers.map((r) => ({
    ...r,
    is_saved: savedIds.has(r.id),
  }))

  // If logged in and no stage yet set, one-time redirect to pre-filter by their stage.
  // Skip this when a support_group is explicitly requested — that filter is the
  // whole point of the navigation and we don't want to clobber it.
  if (student && !params.stage && !params.support_group) {
    const autoStage = deriveStageFromSchoolStage(student.school_stage)
    if (autoStage) {
      const sp = new URLSearchParams()
      sp.set('stage', autoStage)
      if (params.category) sp.set('category', params.category)
      if (params.q) sp.set('q', params.q)
      redirect(`/offers?${sp.toString()}`)
    }
  }

  return (
    <OffersClient
      offers={offers}
      categories={categories}
      student={student}
      initialCategory={params.category}
      initialSearch={params.q}
    />
  )
}
