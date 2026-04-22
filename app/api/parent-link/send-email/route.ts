import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const sendEmailRateMap = new Map<string, { count: number; resetAt: number }>()
const SEND_EMAIL_RATE_MAX = 10
const SEND_EMAIL_RATE_WINDOW_MS = 60 * 60 * 1000

function isSendEmailRateLimited(userId: string): boolean {
  const now = Date.now()
  const entry = sendEmailRateMap.get(userId)
  if (!entry || now > entry.resetAt) {
    sendEmailRateMap.set(userId, { count: 1, resetAt: now + SEND_EMAIL_RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > SEND_EMAIL_RATE_MAX
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FROM = 'Pathfinder Scotland <noreply@pathfinderscot.co.uk>'

function inviteEmailBody(params: {
  studentName: string
  inviteUrl: string
  code: string
}) {
  const { studentName, inviteUrl, code } = params
  return {
    subject: `${studentName} has invited you to Pathfinder Scotland`,
    text: [
      `Hi,`,
      '',
      `${studentName} has invited you to view their Pathfinder Scotland account so you can follow their university journey.`,
      '',
      `Pathfinder helps Scottish students navigate Highers, widening access, bursaries, and course choices. As a linked parent you can see their saved courses, predicted grades, and what funding they may qualify for. You cannot edit anything -- your child stays in control of their profile.`,
      '',
      `Click the link below to accept the invite and create your free parent account:`,
      inviteUrl,
      '',
      `Or enter this code on pathfinderscot.co.uk/parent/join:`,
      `    ${code}`,
      '',
      `The invite expires in 7 days. If you weren't expecting this email you can safely ignore it.`,
      '',
      '-- Pathfinder Scotland',
    ].join('\n'),
  }
}

async function sendResend(to: string, subject: string, text: string, apiKey: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, text }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend API error ${res.status}: ${detail}`)
  }
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

    if (isSendEmailRateLimited(user.id)) {
      return NextResponse.json(
        { error: 'Too many invites sent. Please wait an hour before trying again.' },
        { status: 429 }
      )
    }

    const body = (await req.json().catch(() => null)) as {
      code?: unknown
      email?: unknown
    } | null

    const code = body?.code
    const email = body?.email
    if (typeof code !== 'string' || code.trim().length < 6) {
      return NextResponse.json(
        { error: 'Generate an invite code first.' },
        { status: 400 }
      )
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // Verify this code actually belongs to the signed-in student and is pending
    const { data: link, error: linkError } = await supabase
      .from('parent_student_links')
      .select('id, status, expires_at, student_id')
      .eq('invite_code', code.trim())
      .eq('student_id', user.id)
      .maybeSingle()

    if (linkError || !link) {
      return NextResponse.json(
        { error: 'Invite code not found. Generate a fresh one and try again.' },
        { status: 404 }
      )
    }
    if (link.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invite code has already been redeemed or revoked.' },
        { status: 409 }
      )
    }
    if (link.expires_at && new Date(link.expires_at).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'Invite code has expired. Generate a new one first.' },
        { status: 410 }
      )
    }

    const { data: student } = await supabase
      .from('students')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .maybeSingle()

    const studentName =
      [student?.first_name, student?.last_name].filter(Boolean).join(' ') ||
      student?.email ||
      'A Pathfinder student'

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      'https://pathfinderscot.co.uk'
    const inviteUrl = `${siteUrl}/parent/join?code=${encodeURIComponent(code.trim())}`

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.info(
        '[parent-link/send-email] RESEND_API_KEY not set -- returning sent=false',
        { to: email }
      )
      return NextResponse.json({ sent: false, skipped: 'resend-not-configured' })
    }

    const msg = inviteEmailBody({ studentName, inviteUrl, code: code.trim() })
    try {
      await sendResend(email.trim(), msg.subject, msg.text, apiKey)
    } catch (err) {
      console.error('[parent-link/send-email] send failed:', err)
      return NextResponse.json(
        { error: 'Could not send the email. Try copying the link instead.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[parent-link/send-email] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
