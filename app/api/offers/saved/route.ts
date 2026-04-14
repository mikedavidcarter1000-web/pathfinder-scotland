import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  Offer,
  OfferCategory,
  OfferWithCategory,
  SavedOffersResponse,
} from '@/types/offers'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // saved_offers -> offers -> offer_categories. RLS scopes saved_offers to
    // the current student automatically.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('saved_offers')
      .select(
        'created_at, offer:offers ( id, category_id, title, slug, summary, description, brand, offer_type, discount_text, url, affiliate_url, promo_code, min_age, max_age, eligible_stages, scotland_only, requires_young_scot, requires_totum, requires_unidays, requires_student_beans, verification_method, locations, university_specific, seasonal_tags, active_from, active_until, partner_id, is_featured, featured_until, affiliate_network, commission_type, commission_value, cookie_days, last_verified_at, verified_by, is_active, needs_review, image_url, display_order, created_at, updated_at, category:offer_categories ( id, name, slug, icon ) )'
      )
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[offers/saved] query error:', error)
      return NextResponse.json({ error: 'Failed to load saved offers' }, { status: 500 })
    }

    type OfferRow = Offer & { category: Pick<OfferCategory, 'id' | 'name' | 'slug' | 'icon'> | null }
    type SavedRow = { offer: OfferRow | null }

    const offers: OfferWithCategory[] = ((data ?? []) as SavedRow[])
      .map((r) => r.offer)
      .filter((o): o is OfferRow => o !== null && o.is_active)
      .map((o) => ({ ...o, is_saved: true }))

    const response: SavedOffersResponse = { offers }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[offers/saved] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
