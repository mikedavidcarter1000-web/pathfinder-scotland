import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  Offer,
  OfferCategory,
  OfferWithCategory,
} from '@/types/offers'
import { SavedOffersClient } from './saved-client'

export const metadata: Metadata = {
  title: 'Saved Offers | Pathfinder Scotland',
  description:
    'Your saved student offers and entitlements — everything you bookmarked for later, grouped by category.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/offers/saved',
  },
}

type OfferRow = Offer & {
  category: Pick<OfferCategory, 'id' | 'name' | 'slug' | 'icon'> | null
}

type SavedRow = {
  created_at: string
  offer: OfferRow | null
}

export default async function SavedOffersPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in?redirect=/offers/saved')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('saved_offers')
    .select(
      'created_at, offer:offers ( id, category_id, title, slug, summary, description, brand, offer_type, discount_text, url, affiliate_url, promo_code, min_age, max_age, eligible_stages, scotland_only, requires_young_scot, requires_totum, requires_unidays, requires_student_beans, verification_method, locations, university_specific, seasonal_tags, active_from, active_until, partner_id, is_featured, featured_until, affiliate_network, commission_type, commission_value, cookie_days, last_verified_at, verified_by, is_active, needs_review, image_url, display_order, created_at, updated_at, category:offer_categories ( id, name, slug, icon ) )'
    )
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  const offers: OfferWithCategory[] = ((data ?? []) as SavedRow[])
    .map((r) => r.offer)
    .filter((o): o is OfferRow => o !== null && o.is_active)
    .map((o) => ({ ...o, is_saved: true }))

  return <SavedOffersClient initialOffers={offers} />
}
