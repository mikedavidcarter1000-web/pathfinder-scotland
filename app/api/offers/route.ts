import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  Offer,
  OfferCategory,
  OfferWithCategory,
  OffersListResponse,
} from '@/types/offers'

export const runtime = 'nodejs'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 24
const MAX_LIMIT = 100

function parseIntParam(value: string | null, fallback: number, max?: number): number {
  if (!value) return fallback
  const n = parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  if (max && n > max) return max
  return n
}

function parseBool(value: string | null): boolean {
  return value === 'true' || value === '1'
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const category = sp.get('category')?.trim() || null
    const stage = sp.get('stage')?.trim() || null
    const supportGroup = sp.get('support_group')?.trim() || null
    const search = sp.get('search')?.trim() || null
    const location = sp.get('location')?.trim() || null
    const featuredOnly = parseBool(sp.get('featured_only'))
    const page = parseIntParam(sp.get('page'), DEFAULT_PAGE)
    const limit = parseIntParam(sp.get('limit'), DEFAULT_LIMIT, MAX_LIMIT)

    const supabase = await createServerSupabaseClient()

    // If filtering by support_group we need to know which offer_ids carry
    // that tag. Resolve upfront so the main query can use a simple .in().
    let offerIdFilter: string[] | null = null
    if (supportGroup) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rows, error } = await (supabase as any)
        .from('offer_support_groups')
        .select('offer_id')
        .eq('support_group', supportGroup)
      if (error) {
        console.error('[offers] support_groups lookup error:', error)
        return NextResponse.json({ error: 'Failed to load offers' }, { status: 500 })
      }
      offerIdFilter = ((rows ?? []) as { offer_id: string }[]).map((r) => r.offer_id)
      if (offerIdFilter.length === 0) {
        const empty: OffersListResponse = {
          offers: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        }
        return NextResponse.json(empty)
      }
    }

    // Resolve category slug -> id so we can filter by indexed column.
    let categoryId: string | null = null
    if (category) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: cat } = await (supabase as any)
        .from('offer_categories')
        .select('id')
        .eq('slug', category)
        .maybeSingle()
      if (!cat) {
        const empty: OffersListResponse = {
          offers: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        }
        return NextResponse.json(empty)
      }
      categoryId = (cat as { id: string }).id
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('offers')
      .select(
        'id, category_id, title, slug, summary, description, brand, offer_type, discount_text, url, affiliate_url, promo_code, min_age, max_age, eligible_stages, scotland_only, requires_young_scot, requires_totum, requires_unidays, requires_student_beans, verification_method, locations, university_specific, seasonal_tags, active_from, active_until, partner_id, is_featured, featured_until, affiliate_network, commission_type, commission_value, cookie_days, last_verified_at, verified_by, is_active, needs_review, image_url, display_order, created_at, updated_at, category:offer_categories ( id, name, slug, icon )',
        { count: 'exact' }
      )
      .eq('is_active', true)

    if (categoryId) query = query.eq('category_id', categoryId)
    if (stage) query = query.contains('eligible_stages', [stage])
    if (location) {
      // Nationwide offers have empty `locations`. Match specific location OR nationwide.
      query = query.or(`locations.cs.{${location}},locations.eq.{}`)
    }
    if (offerIdFilter) query = query.in('id', offerIdFilter)
    if (search) {
      // ilike across title/summary/brand/description. `%` is safe inside PostgREST
      // `or` filters; commas inside the search text would break the filter list
      // so strip them.
      const pattern = `%${search.replace(/[,()]/g, '')}%`
      query = query.or(
        `title.ilike.${pattern},summary.ilike.${pattern},brand.ilike.${pattern},description.ilike.${pattern}`
      )
    }
    if (featuredOnly) {
      const today = new Date().toISOString().slice(0, 10)
      query = query.eq('is_featured', true).or(
        `featured_until.is.null,featured_until.gte.${today}`
      )
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('title', { ascending: true })
      .range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('[offers] query error:', error)
      return NextResponse.json({ error: 'Failed to load offers' }, { status: 500 })
    }

    type Row = Offer & { category: Pick<OfferCategory, 'id' | 'name' | 'slug' | 'icon'> | null }
    const rows = (data ?? []) as Row[]

    // Enrich with is_saved for logged-in students (single IN query).
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let savedIds = new Set<string>()
    if (user && rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: saved } = await (supabase as any)
        .from('saved_offers')
        .select('offer_id')
        .eq('student_id', user.id)
        .in('offer_id', rows.map((r) => r.id))
      savedIds = new Set(((saved ?? []) as { offer_id: string }[]).map((r) => r.offer_id))
    }

    const offers: OfferWithCategory[] = rows.map((r) => ({
      ...r,
      is_saved: user ? savedIds.has(r.id) : false,
    }))

    const total = count ?? offers.length
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0

    const response: OffersListResponse = {
      offers,
      total,
      page,
      limit,
      totalPages,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[offers] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
