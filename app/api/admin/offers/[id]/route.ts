import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Editable fields allowed via this endpoint. Anything else needs Supabase Studio.
const ALLOWED_FIELDS = [
  'url',
  'affiliate_url',
  'promo_code',
  'discount_text',
  'is_active',
  'is_featured',
  'featured_until',
] as const

type EditableField = (typeof ALLOWED_FIELDS)[number]
type UpdatePayload = Partial<Record<EditableField, unknown>>

function validateField(field: EditableField, value: unknown): string | null {
  switch (field) {
    case 'is_active':
    case 'is_featured':
      if (typeof value !== 'boolean') return `${field} must be a boolean`
      return null
    case 'featured_until':
      if (value === null) return null
      if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) {
        return 'featured_until must be an ISO date (YYYY-MM-DD) or null'
      }
      return null
    case 'url':
    case 'affiliate_url':
      if (value === null) return null
      if (typeof value !== 'string' || value.length > 2000) {
        return `${field} must be a string under 2000 chars or null`
      }
      if (value.length > 0 && !/^https?:\/\//i.test(value)) {
        return `${field} must start with http:// or https://`
      }
      return null
    case 'promo_code':
      if (value === null) return null
      if (typeof value !== 'string' || value.length > 100) {
        return 'promo_code must be a string under 100 chars or null'
      }
      return null
    case 'discount_text':
      if (value === null) return null
      if (typeof value !== 'string' || value.length > 500) {
        return 'discount_text must be a string under 500 chars or null'
      }
      return null
    default:
      return 'Unknown field'
  }
}

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

  let body: UpdatePayload
  try {
    body = (await req.json()) as UpdatePayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      const err = validateField(field, body[field])
      if (err) return NextResponse.json({ error: err }, { status: 400 })
      // Empty strings get normalised to null so we don't accumulate blanks.
      const v = body[field]
      update[field] = typeof v === 'string' && v.trim() === '' ? null : v
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 })
  }

  // If toggling is_featured off, also clear featured_until unless explicitly set.
  if (update.is_featured === false && !('featured_until' in update)) {
    update.featured_until = null
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (guard.admin as any)
      .from('offers')
      .update(update)
      .eq('id', id)
      .select(
        'id, title, slug, is_active, is_featured, featured_until, url, affiliate_url, promo_code, discount_text, last_verified_at, needs_review, updated_at'
      )
      .maybeSingle()

    if (error) {
      console.error('[admin/offers PUT] update error:', error)
      return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    return NextResponse.json({ offer: data })
  } catch (err) {
    console.error('[admin/offers PUT] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
