import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendParentLinkEmails } from '@/lib/parent-link-emails'

export const runtime = 'nodejs'

// Rate limit: 10 redeem attempts per parent per hour. Low enough to stop
// brute-forcing the 8-char invite code space, high enough for a genuine typo retry.
const redeemLinkRateMap = new Map<string, { count: number; resetAt: number }>()
const REDEEM_LINK_RATE_MAX = 10
const REDEEM_LINK_RATE_WINDOW_MS = 60 * 60 * 1000

function isRedeemLinkRateLimited(userId: string): boolean {
  const now = Date.now()
  const entry = redeemLinkRateMap.get(userId)
  if (!entry || now > entry.resetAt) {
    redeemLinkRateMap.set(userId, { count: 1, resetAt: now + REDEEM_LINK_RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > REDEEM_LINK_RATE_MAX
}

interface RedeemResult {
  link_id: string
  student_id: string
  student_first_name: string | null
  student_last_name: string | null
  student_email: string
  parent_id: string
  parent_name: string
  parent_email: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (isRedeemLinkRateLimited(user.id)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait an hour before trying again.' },
        { status: 429 }
      )
    }

    const body = (await req.json().catch(() => null)) as { code?: unknown } | null
    const code = body?.code
    if (typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter an invite code.' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc(
      'redeem_parent_invite_code',
      { p_code: code.trim() }
    )

    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('invalid or expired')) {
        return NextResponse.json(
          { error: 'Invite code is invalid or has expired. Ask your child to generate a new one.' },
          { status: 400 }
        )
      }
      if (msg.includes('already linked')) {
        return NextResponse.json(
          { error: 'You are already linked to this student.' },
          { status: 409 }
        )
      }
      if (msg.includes('parent profile')) {
        return NextResponse.json(
          { error: 'You need a parent account to redeem an invite code. Create one first.' },
          { status: 403 }
        )
      }
      if (msg.includes('invite code format')) {
        return NextResponse.json(
          { error: 'Invite code should be 8 characters like ABCD-1234.' },
          { status: 400 }
        )
      }
      console.error('[parent-link/redeem] RPC error:', error)
      return NextResponse.json(
        { error: 'Could not redeem the invite code. Please try again.' },
        { status: 500 }
      )
    }

    const result = data as RedeemResult
    const studentName =
      [result.student_first_name, result.student_last_name].filter(Boolean).join(' ') ||
      result.student_email

    // Emails are best-effort. The link is already active either way.
    try {
      await sendParentLinkEmails({
        parentName: result.parent_name,
        parentEmail: result.parent_email,
        studentName,
        studentEmail: result.student_email,
      })
    } catch (emailErr) {
      console.error('[parent-link/redeem] email send failed:', emailErr)
    }

    return NextResponse.json({
      link_id: result.link_id,
      student_id: result.student_id,
      student_name: studentName,
    })
  } catch (err) {
    console.error('[parent-link/redeem] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
