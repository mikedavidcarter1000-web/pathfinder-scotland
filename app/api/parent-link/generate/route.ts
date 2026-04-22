import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

// Rate limit: 10 invite codes per student per hour — lets a student regenerate
// after a typo without letting a compromised session spam the parent_student_links table.
const generateRateMap = new Map<string, { count: number; resetAt: number }>()
const GENERATE_RATE_MAX = 10
const GENERATE_RATE_WINDOW_MS = 60 * 60 * 1000

function isGenerateRateLimited(userId: string): boolean {
  const now = Date.now()
  const entry = generateRateMap.get(userId)
  if (!entry || now > entry.resetAt) {
    generateRateMap.set(userId, { count: 1, resetAt: now + GENERATE_RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > GENERATE_RATE_MAX
}

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (isGenerateRateLimited(user.id)) {
      return NextResponse.json(
        { error: 'Too many invite codes generated. Please try again later.' },
        { status: 429 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: code, error } = await (supabase as any).rpc(
      'generate_parent_invite_code'
    )

    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('only students')) {
        return NextResponse.json(
          { error: 'Only student accounts can generate invite codes.' },
          { status: 403 }
        )
      }
      console.error('[parent-link/generate] RPC error:', error)
      return NextResponse.json(
        { error: 'Could not generate an invite code. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      code,
      expires_in_hours: 168,
    })
  } catch (err) {
    console.error('[parent-link/generate] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
