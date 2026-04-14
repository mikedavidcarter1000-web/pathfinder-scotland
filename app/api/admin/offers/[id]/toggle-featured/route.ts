import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid offer id' }, { status: 400 })
  }

  const guard = await requireAdminApi()
  if (!guard.ok) return guard.response

  // Body is optional: { featured_until?: string | null }. If featuring, an
  // optional date ends the feature window; if unfeaturing, we also clear it.
  let featuredUntilInput: string | null | undefined = undefined
  try {
    const text = await req.text()
    if (text) {
      const body = JSON.parse(text) as { featured_until?: string | null }
      if ('featured_until' in body) {
        featuredUntilInput = body.featured_until ?? null
      }
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    featuredUntilInput !== undefined &&
    featuredUntilInput !== null &&
    !ISO_DATE_RE.test(featuredUntilInput)
  ) {
    return NextResponse.json(
      { error: 'featured_until must be YYYY-MM-DD or null' },
      { status: 400 }
    )
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current, error: readErr } = await (guard.admin as any)
      .from('offers')
      .select('id, is_featured')
      .eq('id', id)
      .maybeSingle()

    if (readErr) {
      console.error('[admin/offers/toggle-featured] read error:', readErr)
      return NextResponse.json({ error: 'Failed to read offer' }, { status: 500 })
    }
    if (!current) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

    const nextFeatured = !(current as { is_featured: boolean }).is_featured

    const update: { is_featured: boolean; featured_until?: string | null } = {
      is_featured: nextFeatured,
    }
    if (nextFeatured) {
      // Featuring: apply date if provided (else leave existing value untouched)
      if (featuredUntilInput !== undefined) update.featured_until = featuredUntilInput
    } else {
      // Unfeaturing: always clear the window
      update.featured_until = null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (guard.admin as any)
      .from('offers')
      .update(update)
      .eq('id', id)
      .select('id, title, is_featured, featured_until')
      .maybeSingle()

    if (error) {
      console.error('[admin/offers/toggle-featured] update error:', error)
      return NextResponse.json({ error: 'Failed to toggle featured' }, { status: 500 })
    }
    return NextResponse.json({ offer: data })
  } catch (err) {
    console.error('[admin/offers/toggle-featured] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
