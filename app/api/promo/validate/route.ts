import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  try {
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
