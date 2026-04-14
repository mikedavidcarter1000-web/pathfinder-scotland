import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { ClickType, OfferClickResponse } from '@/types/offers'

export const runtime = 'nodejs'

// Rate limit: 30 clicks per IP per minute. Mirrors /api/benefits/click.
const clickRateMap = new Map<string, { count: number; resetAt: number }>()
const CLICK_RATE_MAX = 30
const CLICK_RATE_WINDOW_MS = 60 * 1000

function isClickRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = clickRateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    clickRateMap.set(ip, { count: 1, resetAt: now + CLICK_RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > CLICK_RATE_MAX
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const ALLOWED_CLICK_TYPES: ReadonlyArray<ClickType> = [
  'outbound',
  'save',
  'unsave',
  'detail_view',
  'copy_code',
]

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    if (isClickRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = (await req.json()) as {
      offer_id?: string
      click_type?: ClickType
      referrer_page?: string
    }

    const offerId = body.offer_id
    const clickType = body.click_type
    const referrerPage = body.referrer_page ?? null

    if (!offerId || typeof offerId !== 'string' || !UUID_RE.test(offerId)) {
      return NextResponse.json({ error: 'Invalid offer_id' }, { status: 400 })
    }
    if (!clickType || !ALLOWED_CLICK_TYPES.includes(clickType)) {
      return NextResponse.json({ error: 'Invalid click_type' }, { status: 400 })
    }
    if (referrerPage !== null && (typeof referrerPage !== 'string' || referrerPage.length > 500)) {
      return NextResponse.json({ error: 'Invalid referrer_page' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Resolve student_id from session only (IDOR prevention).
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const studentId = user?.id ?? null

    // For outbound clicks we need the offer's URL before the client can
    // redirect. Kick off both the insert and the lookup together — the insert
    // is fire-and-forget (we never await it for the response), but for
    // outbound clicks the lookup has to complete before we can reply.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertPromise = (supabase as any).from('offer_clicks').insert({
      offer_id: offerId,
      student_id: studentId,
      click_type: clickType,
      referrer_page: referrerPage,
    })

    if (clickType === 'outbound') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: offer, error: offerError } = await (supabase as any)
        .from('offers')
        .select('url, affiliate_url, is_active')
        .eq('id', offerId)
        .maybeSingle()

      if (offerError || !offer || !offer.is_active) {
        // Still try to surface the insert error for diagnosis but return 404.
        insertPromise.then((res: { error: unknown }) => {
          if (res.error) console.error('[offers/click] insert error:', res.error)
        })
        return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
      }

      const url: string | null = offer.affiliate_url || offer.url || null
      // Don't block the response on the insert.
      insertPromise.then((res: { error: unknown }) => {
        if (res.error) console.error('[offers/click] insert error:', res.error)
      })

      const response: OfferClickResponse = {
        success: true,
        url: url ?? undefined,
      }
      return NextResponse.json(response)
    }

    // Non-outbound: don't block the response on the insert either.
    insertPromise.then((res: { error: unknown }) => {
      if (res.error) console.error('[offers/click] insert error:', res.error)
    })

    const response: OfferClickResponse = { success: true }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[offers/click] unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
