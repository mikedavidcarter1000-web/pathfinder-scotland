import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi()
  if (!guard.ok) return guard.response

  const sp = req.nextUrl.searchParams
  const categorySlug = sp.get('category')?.trim() || null
  const status = sp.get('status')?.trim() || null // active | inactive | needs_review | all
  const search = sp.get('search')?.trim() || null

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (guard.admin as any)
      .from('offers')
      .select(
        'id, category_id, title, slug, brand, offer_type, discount_text, url, affiliate_url, promo_code, is_featured, featured_until, is_active, needs_review, last_verified_at, updated_at, category:offer_categories ( id, name, slug, icon )'
      )
      .order('updated_at', { ascending: false })
      .limit(500)

    if (status === 'active') query = query.eq('is_active', true)
    else if (status === 'inactive') query = query.eq('is_active', false)
    else if (status === 'needs_review') query = query.eq('needs_review', true)

    if (categorySlug) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: cat } = await (guard.admin as any)
        .from('offer_categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle()
      if (cat) query = query.eq('category_id', (cat as { id: string }).id)
    }

    if (search) {
      const pattern = `%${search.replace(/[,()]/g, '')}%`
      query = query.or(
        `title.ilike.${pattern},brand.ilike.${pattern},slug.ilike.${pattern}`
      )
    }

    const { data, error } = await query
    if (error) {
      console.error('[admin/offers] query error:', error)
      return NextResponse.json({ error: 'Failed to load offers' }, { status: 500 })
    }

    return NextResponse.json({ offers: data ?? [] })
  } catch (err) {
    console.error('[admin/offers] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
