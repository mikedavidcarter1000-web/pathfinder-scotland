import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Rate limit: max 30 clicks per IP per minute (prevents click spam)
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

export async function POST(req: Request) {
  try {
    // Rate limit click tracking to prevent spam
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    if (isClickRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = (await req.json()) as {
      benefit_id?: string
      source_page?: string
    }
    const benefitId = body.benefit_id
    const sourcePage = body.source_page ?? null

    if (!benefitId || typeof benefitId !== 'string') {
      return NextResponse.json({ error: 'benefit_id is required' }, { status: 400 })
    }

    // Validate benefit_id is a UUID to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(benefitId)) {
      return NextResponse.json({ error: 'Invalid benefit_id format' }, { status: 400 })
    }

    // Validate source_page if provided (max 500 chars, no script injection)
    if (sourcePage && (typeof sourcePage !== 'string' || sourcePage.length > 500)) {
      return NextResponse.json({ error: 'Invalid source_page' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Look up the benefit so we know the redirect URL and whether to log the
    // click as an affiliate click.
    const { data: benefit, error: benefitError } = await supabase
      .from('student_benefits')
      .select('id, url, affiliate_url, is_active')
      .eq('id', benefitId)
      .single()

    if (benefitError || !benefit || !benefit.is_active) {
      return NextResponse.json({ error: 'Benefit not found' }, { status: 404 })
    }

    // Resolve student_id from the session — only use auth.uid(), never
    // accept student_id from the request body (IDOR prevention).
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const studentId = user?.id ?? null

    const isAffiliate = !!benefit.affiliate_url

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any).from('benefit_clicks').insert({
      benefit_id: benefit.id,
      student_id: studentId,
      is_affiliate: isAffiliate,
      source_page: sourcePage,
    })

    if (insertError) {
      // Log but still return the redirect URL — losing an analytics event
      // shouldn't break the student's experience.
      console.error('[benefits/click] insert error:', insertError)
    }

    return NextResponse.json({
      success: true,
      redirect_url: benefit.affiliate_url || benefit.url,
      is_affiliate: isAffiliate,
    })
  } catch (err) {
    console.error('[benefits/click] unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
