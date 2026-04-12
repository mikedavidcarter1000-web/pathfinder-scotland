import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Rate limit: max 10 attempts per IP per 15 minutes (prevents promo code enumeration)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

export async function POST(req: Request) {
  try {
    // Rate limit by IP to prevent brute-force code enumeration
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { valid: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { code } = body

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ valid: false, error: 'Code is required' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    // Call the DB function — available to authenticated and anon users
    const { data, error } = await supabase.rpc('validate_promo_code', {
      p_code: normalizedCode,
    })

    if (error) {
      console.error('[promo/validate] DB error:', error)
      return NextResponse.json(
        { valid: false, error: 'Failed to validate code' },
        { status: 500 }
      )
    }

    const result = data as {
      valid: boolean
      error?: string
      discount_type?: 'percentage' | 'fixed_amount' | 'free_trial'
      discount_value?: number
      description?: string
      promo_code_id?: string
    }

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error })
    }

    return NextResponse.json({
      valid: true,
      discount_type: result.discount_type,
      discount_value: result.discount_value,
      description: result.description,
    })
  } catch (err) {
    console.error('[promo/validate] Unexpected error:', err)
    return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400 })
  }
}
