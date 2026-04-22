import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { INDIVIDUAL_VIEW_ROLES, STAFF_ROLE_LABELS, type SchoolStaffRole } from '@/lib/school/constants'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_FROM = 'Pathfinder Scotland <noreply@pathfinderscot.co.uk>'

const VALID_ROLES: SchoolStaffRole[] = [
  'guidance_teacher',
  'pt_guidance',
  'dyw_coordinator',
  'depute',
  'head_teacher',
  'admin',
]

async function sendResend(to: string, subject: string, text: string, apiKey: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, text }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend API error ${res.status}: ${detail}`)
  }
}

export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as { email?: unknown; role?: unknown } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const role = typeof body.role === 'string' ? body.role : ''

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
  }
  if (!VALID_ROLES.includes(role as SchoolStaffRole)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
  }

  // Fetch school details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('id, name, slug')
    .eq('id', ctx.schoolId)
    .maybeSingle()
  if (!school) {
    return NextResponse.json({ error: 'School not found.' }, { status: 404 })
  }

  // Email the invite link. A separate flow handles actual staff-row creation
  // when the invited person signs up via /school/join?school=slug.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pathfinderscot.co.uk').replace(/\/$/, '')
  const inviteUrl = `${siteUrl}/school/join?school=${encodeURIComponent(school.slug)}&role=${encodeURIComponent(role)}`

  const canIndividual = (INDIVIDUAL_VIEW_ROLES as string[]).includes(role)

  const subject = `${ctx.fullName} has invited you to ${school.name} on Pathfinder Scotland`
  const text = [
    `Hi,`,
    '',
    `${ctx.fullName} has invited you to join ${school.name}'s Pathfinder Scotland dashboard as a ${STAFF_ROLE_LABELS[role as SchoolStaffRole]}.`,
    '',
    `Pathfinder helps Scottish schools see how students are exploring careers, courses, and bursaries, with reporting aligned to the Scottish Career Education Standard and DYW indicators.`,
    '',
    `Your access includes: aggregate dashboard, subject-choice analysis, benchmarking, and reports.`,
    canIndividual ? 'Your role includes individual-student view for guidance meetings.' : 'Your role sees aggregate data only; the school admin can enable individual-student view.',
    '',
    `Accept the invite and create your account:`,
    inviteUrl,
    '',
    '-- Pathfinder Scotland',
  ].join('\n')

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.info('[school/invite-staff] RESEND_API_KEY not set -- returning sent=false', { to: email })
    return NextResponse.json({ sent: false, skipped: 'resend-not-configured', inviteUrl })
  }

  try {
    await sendResend(email, subject, text, apiKey)
  } catch (err) {
    console.error('[school/invite-staff] send failed:', err)
    return NextResponse.json({ error: 'Could not send invite email. Copy the link and share manually.', inviteUrl }, { status: 502 })
  }

  return NextResponse.json({ sent: true, inviteUrl })
}
