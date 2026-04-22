import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// Anonymous rate limit keyed off IP to slow brute-force on the invite code space
// (8 alphanumeric chars, so ~32^8 = 1.1e12, but rate-limit is defence in depth).
const validateRateMap = new Map<string, { count: number; resetAt: number }>()
const VALIDATE_RATE_MAX = 30
const VALIDATE_RATE_WINDOW_MS = 60 * 60 * 1000

function ipOf(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

function isValidateRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = validateRateMap.get(key)
  if (!entry || now > entry.resetAt) {
    validateRateMap.set(key, { count: 1, resetAt: now + VALIDATE_RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > VALIDATE_RATE_MAX
}

function normaliseCode(raw: string): string | null {
  const stripped = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (stripped.length !== 8) return null
  return `${stripped.slice(0, 4)}-${stripped.slice(4)}`
}

export async function POST(req: Request) {
  try {
    if (isValidateRateLimited(ipOf(req))) {
      return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 })
    }

    const body = (await req.json().catch(() => null)) as { code?: unknown } | null
    const raw = typeof body?.code === 'string' ? body.code : ''
    const normalised = normaliseCode(raw)
    if (!normalised) {
      return NextResponse.json(
        { valid: false, reason: 'format' },
        { status: 400 }
      )
    }

    const admin = getAdminClient()
    if (!admin) {
      return NextResponse.json(
        { error: 'Server not configured.' },
        { status: 500 }
      )
    }

    const { data: link, error } = await admin
      .from('parent_student_links')
      .select('id, status, expires_at, student_id')
      .eq('invite_code', normalised)
      .maybeSingle()

    if (error) {
      console.error('[parent-link/validate-code] lookup error:', error)
      return NextResponse.json({ valid: false, reason: 'error' }, { status: 500 })
    }

    if (!link) {
      return NextResponse.json({ valid: false, reason: 'not-found' })
    }

    if (link.status !== 'pending') {
      return NextResponse.json({ valid: false, reason: 'already-redeemed' })
    }

    if (link.expires_at && new Date(link.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ valid: false, reason: 'expired' })
    }

    // Fetch child's first name for a friendlier join screen
    const { data: student } = await admin
      .from('students')
      .select('first_name')
      .eq('id', link.student_id)
      .maybeSingle()

    return NextResponse.json({
      valid: true,
      normalised_code: normalised,
      student_first_name: student?.first_name ?? null,
    })
  } catch (err) {
    console.error('[parent-link/validate-code] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
