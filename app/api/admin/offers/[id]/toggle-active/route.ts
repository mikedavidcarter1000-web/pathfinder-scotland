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

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current, error: readErr } = await (guard.admin as any)
      .from('offers')
      .select('id, is_active')
      .eq('id', id)
      .maybeSingle()

    if (readErr) {
      console.error('[admin/offers/toggle-active] read error:', readErr)
      return NextResponse.json({ error: 'Failed to read offer' }, { status: 500 })
    }
    if (!current) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

    const next = !(current as { is_active: boolean }).is_active

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (guard.admin as any)
      .from('offers')
      .update({ is_active: next })
      .eq('id', id)
      .select('id, title, is_active')
      .maybeSingle()

    if (error) {
      console.error('[admin/offers/toggle-active] update error:', error)
      return NextResponse.json({ error: 'Failed to toggle' }, { status: 500 })
    }
    return NextResponse.json({ offer: data })
  } catch (err) {
    console.error('[admin/offers/toggle-active] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
