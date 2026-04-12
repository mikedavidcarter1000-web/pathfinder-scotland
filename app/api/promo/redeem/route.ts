import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, amount } = body

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()
    // amount in GBP — used to calculate the actual discount applied; defaults to 0
    const purchaseAmount: number = typeof amount === 'number' && amount > 0 ? amount : 0

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

    // Auth check — redeem_promo_code uses auth.uid() internally (SECURITY DEFINER)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate first so we can return discount_type and discount_value in the response
    const { data: validateData, error: validateError } = await supabase.rpc(
      'validate_promo_code',
      { p_code: normalizedCode, p_user_id: user.id, p_amount: purchaseAmount }
    )

    if (validateError) {
      console.error('[promo/redeem] Validate error:', validateError)
      return NextResponse.json(
        { success: false, error: 'Failed to validate code' },
        { status: 500 }
      )
    }

    const validation = validateData as {
      valid: boolean
      error?: string
      discount_type?: 'percentage' | 'fixed_amount' | 'free_trial'
      discount_value?: number
    }

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error })
    }

    // Redeem — the DB function re-validates and inserts the redemption record
    // The UNIQUE(promo_code_id, user_id, order_id) constraint prevents double-redemption
    const { data: redeemData, error: redeemError } = await supabase.rpc('redeem_promo_code', {
      p_code: normalizedCode,
      p_amount: purchaseAmount,
    })

    if (redeemError) {
      // Unique constraint violation = already redeemed
      if (redeemError.code === '23505') {
        return NextResponse.json({ success: false, error: 'You have already used this promo code' })
      }
      console.error('[promo/redeem] Redeem error:', redeemError)
      return NextResponse.json(
        { success: false, error: 'Failed to redeem code' },
        { status: 500 }
      )
    }

    const redemption = redeemData as {
      success?: boolean
      valid?: boolean
      error?: string
      redemption_id?: string
      discount_applied?: number
      final_amount?: number
    }

    // The DB function returns { valid: false, error: ... } if re-validation fails at redeem time
    // (e.g. race condition where another user claimed the last use between our validate and redeem)
    if (!redemption.success) {
      return NextResponse.json({ success: false, error: redemption.error })
    }

    return NextResponse.json({
      success: true,
      discount_type: validation.discount_type,
      discount_value: validation.discount_value,
    })
  } catch (err) {
    console.error('[promo/redeem] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
