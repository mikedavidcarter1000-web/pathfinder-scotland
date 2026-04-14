import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { SaveOfferResponse } from '@/types/offers'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { offer_id?: string }
    const offerId = body.offer_id

    if (!offerId || typeof offerId !== 'string' || !UUID_RE.test(offerId)) {
      return NextResponse.json({ error: 'Invalid offer_id' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: lookupError } = await (supabase as any)
      .from('saved_offers')
      .select('offer_id')
      .eq('student_id', user.id)
      .eq('offer_id', offerId)
      .maybeSingle()

    if (lookupError) {
      console.error('[offers/save] lookup error:', lookupError)
      return NextResponse.json({ error: 'Failed to toggle save' }, { status: 500 })
    }

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any)
        .from('saved_offers')
        .delete()
        .eq('student_id', user.id)
        .eq('offer_id', offerId)

      if (deleteError) {
        console.error('[offers/save] delete error:', deleteError)
        return NextResponse.json({ error: 'Failed to unsave offer' }, { status: 500 })
      }

      const response: SaveOfferResponse = { saved: false }
      return NextResponse.json(response)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from('saved_offers')
      .insert({ student_id: user.id, offer_id: offerId })

    if (insertError) {
      // Could be FK violation if offer_id is bogus. Treat as 400.
      console.error('[offers/save] insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save offer' }, { status: 400 })
    }

    const response: SaveOfferResponse = { saved: true }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[offers/save] unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
