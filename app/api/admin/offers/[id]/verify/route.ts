import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PUT(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid offer id' }, { status: 400 })
  }

  const guard = await requireAdminApi()
  if (!guard.ok) return guard.response

  const today = new Date().toISOString().slice(0, 10)

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (guard.admin as any)
      .from('offers')
      .update({
        last_verified_at: today,
        verified_by: guard.email,
        needs_review: false,
      })
      .eq('id', id)
      .select('id, title, last_verified_at, needs_review, verified_by')
      .maybeSingle()

    if (error) {
      console.error('[admin/offers/verify] update error:', error)
      return NextResponse.json({ error: 'Failed to mark verified' }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }
    return NextResponse.json({ offer: data })
  } catch (err) {
    console.error('[admin/offers/verify] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
