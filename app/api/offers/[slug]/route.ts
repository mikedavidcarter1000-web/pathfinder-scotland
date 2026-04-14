import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  Offer,
  OfferCategory,
  OfferDetail,
  OfferDetailResponse,
  OfferWithCategory,
  SupportGroup,
} from '@/types/offers'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: offer, error: offerError } = await (supabase as any)
      .from('offers')
      .select(
        'id, category_id, title, slug, summary, description, brand, offer_type, discount_text, url, affiliate_url, promo_code, min_age, max_age, eligible_stages, scotland_only, requires_young_scot, requires_totum, requires_unidays, requires_student_beans, verification_method, locations, university_specific, seasonal_tags, active_from, active_until, partner_id, is_featured, featured_until, affiliate_network, commission_type, commission_value, cookie_days, last_verified_at, verified_by, is_active, needs_review, image_url, display_order, created_at, updated_at, category:offer_categories ( id, name, slug, icon )'
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (offerError) {
      console.error('[offers/:slug] query error:', offerError)
      return NextResponse.json({ error: 'Failed to load offer' }, { status: 500 })
    }

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    type OfferRow = Offer & { category: Pick<OfferCategory, 'id' | 'name' | 'slug' | 'icon'> | null }
    const offerRow = offer as OfferRow

    // Support groups
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sg } = await (supabase as any)
      .from('offer_support_groups')
      .select('support_group')
      .eq('offer_id', offerRow.id)

    const supportGroups: SupportGroup[] = ((sg ?? []) as { support_group: SupportGroup }[]).map(
      (r) => r.support_group
    )

    // Related offers: same category, different offer, active, limit 4
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: relatedData } = await (supabase as any)
      .from('offers')
      .select(
        'id, category_id, title, slug, summary, description, brand, offer_type, discount_text, url, affiliate_url, promo_code, min_age, max_age, eligible_stages, scotland_only, requires_young_scot, requires_totum, requires_unidays, requires_student_beans, verification_method, locations, university_specific, seasonal_tags, active_from, active_until, partner_id, is_featured, featured_until, affiliate_network, commission_type, commission_value, cookie_days, last_verified_at, verified_by, is_active, needs_review, image_url, display_order, created_at, updated_at, category:offer_categories ( id, name, slug, icon )'
      )
      .eq('category_id', offerRow.category_id)
      .eq('is_active', true)
      .neq('id', offerRow.id)
      .order('display_order', { ascending: true })
      .limit(4)

    const related = ((relatedData ?? []) as OfferRow[]) as OfferWithCategory[]

    // is_saved resolution
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let isSaved = false
    let savedRelated = new Set<string>()
    if (user) {
      const ids = [offerRow.id, ...related.map((r) => r.id)]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: saved } = await (supabase as any)
        .from('saved_offers')
        .select('offer_id')
        .eq('student_id', user.id)
        .in('offer_id', ids)
      const savedSet = new Set(((saved ?? []) as { offer_id: string }[]).map((r) => r.offer_id))
      isSaved = savedSet.has(offerRow.id)
      savedRelated = savedSet
    }

    const detail: OfferDetail = {
      ...offerRow,
      support_groups: supportGroups,
      is_saved: isSaved,
    }

    const response: OfferDetailResponse = {
      offer: detail,
      related: related.map((r) => ({ ...r, is_saved: user ? savedRelated.has(r.id) : false })),
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[offers/:slug] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
