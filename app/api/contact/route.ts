import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  parent: 'Parent / Carer',
  teacher: 'Teacher / Guidance',
  'school-leadership': 'School Leadership',
  funder: 'Funder',
  other: 'Other',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const CONTACT_TO = 'hello@pathfinderscot.co.uk'
const CONTACT_FROM = 'Pathfinder Scotland <noreply@pathfinderscot.co.uk>'

interface RateBucket {
  count: number
  resetAt: number
}

const rateBuckets = new Map<string, RateBucket>()

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const real = request.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  const bucket = rateBuckets.get(ip)
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }
  bucket.count += 1
  return { allowed: true }
}

interface ContactPayload {
  name: string
  email: string
  role: string
  message: string
}

function parseBody(body: unknown): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request body.' }
  const { name, email, role, message } = body as Record<string, unknown>

  if (typeof name !== 'string' || name.trim().length === 0) {
    return { ok: false, error: 'Please tell us your name.' }
  }
  if (name.trim().length > 200) {
    return { ok: false, error: 'Name is too long.' }
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (email.trim().length > 320) {
    return { ok: false, error: 'Email is too long.' }
  }
  if (typeof role !== 'string' || !(role in ROLE_LABELS)) {
    return { ok: false, error: 'Please choose a role.' }
  }
  if (typeof message !== 'string' || message.trim().length < 10) {
    return { ok: false, error: 'Message must be at least 10 characters.' }
  }
  if (message.trim().length > 5000) {
    return { ok: false, error: 'Message is too long (5000 character limit).' }
  }

  return {
    ok: true,
    data: {
      name: name.trim(),
      email: email.trim(),
      role,
      message: message.trim(),
    },
  }
}

function buildEmailBody(payload: ContactPayload, timestamp: string): string {
  return [
    'New contact form submission',
    '',
    `Name:      ${payload.name}`,
    `Email:     ${payload.email}`,
    `Role:      ${ROLE_LABELS[payload.role] ?? payload.role}`,
    `Received:  ${timestamp}`,
    '',
    '— Message —',
    payload.message,
    '',
  ].join('\n')
}

async function sendViaResend(payload: ContactPayload, apiKey: string): Promise<void> {
  const timestamp = new Date().toISOString()
  const subject = `Pathfinder Contact: ${ROLE_LABELS[payload.role] ?? payload.role} — ${payload.name}`
  const text = buildEmailBody(payload, timestamp)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      reply_to: payload.email,
      subject,
      text,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Resend API error ${response.status}: ${detail}`)
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const rate = checkRateLimit(ip)
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please wait a while before sending another message.',
      },
      {
        status: 429,
        headers: rate.retryAfterSeconds
          ? { 'Retry-After': String(rate.retryAfterSeconds) }
          : undefined,
      },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = parseBody(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    const timestamp = new Date().toISOString()
    console.info(
      '[contact] RESEND_API_KEY not set — logging submission instead of sending email:\n' +
        buildEmailBody(parsed.data, timestamp),
    )
    return NextResponse.json({ success: true })
  }

  try {
    await sendViaResend(parsed.data, apiKey)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact] Failed to send via Resend:', error)
    return NextResponse.json(
      { error: 'Something went wrong sending your message. Please try again shortly.' },
      { status: 502 },
    )
  }
}
