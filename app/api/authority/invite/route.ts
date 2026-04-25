import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import { RESEND_FROM, AUTHORITY_ROLE_LABELS, type AuthorityStaffRole } from '@/lib/authority/constants'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_ROLES: AuthorityStaffRole[] = ['la_admin', 'qio', 'data_analyst']

async function sendResend(to: string, subject: string, text: string, apiKey: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, text }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend error ${res.status}: ${detail}`)
  }
}

export async function POST(req: Request) {
  const guard = await requireAuthorityStaffApi({ mustBeAdmin: true, mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    email?: unknown
    role?: unknown
    assignedSchoolIds?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const role = typeof body.role === 'string' ? body.role : ''
  const assignedSchoolIds = Array.isArray(body.assignedSchoolIds) ? body.assignedSchoolIds : null

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
  if (!VALID_ROLES.includes(role as AuthorityStaffRole)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
  }

  // Create the invitation (service role bypasses RLS)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invitation, error: invErr } = await (admin as any)
    .from('authority_invitations')
    .insert({
      authority_id: ctx.authorityId,
      invited_by: ctx.staffId,
      email,
      role,
    })
    .select('id, token')
    .single()

  if (invErr || !invitation) {
    console.error('[authority/invite] create invitation failed:', invErr)
    return NextResponse.json({ error: 'Could not create invitation.' }, { status: 500 })
  }

  // If QIO with school assignments, store on invitation for use in join flow
  if (role === 'qio' && assignedSchoolIds) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('authority_invitations')
      .update({ /* stored in join metadata */ })
      .eq('id', invitation.id)
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pathfinderscot.co.uk').replace(/\/$/, '')
  const joinUrl = `${siteUrl}/authority/join?token=${invitation.token}`

  const roleLabel = AUTHORITY_ROLE_LABELS[role as AuthorityStaffRole]
  const subject = `${ctx.fullName} has invited you to join ${ctx.authorityName} on Pathfinder Scotland`
  const text = [
    `Hi,`,
    '',
    `${ctx.fullName} has invited you to join ${ctx.authorityName}'s Pathfinder Scotland authority portal as a ${roleLabel}.`,
    '',
    `Pathfinder gives local authorities real-time insight into subject choices, career exploration, equity metrics, and curriculum breadth across all their schools.`,
    '',
    `This invitation expires in 7 days.`,
    '',
    `Accept the invite and create your account:`,
    joinUrl,
    '',
    '-- Pathfinder Scotland',
  ].join('\n')

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.info('[authority/invite] RESEND_API_KEY not set -- returning sent=false', { to: email })
    return NextResponse.json({ sent: false, skipped: 'resend-not-configured', joinUrl })
  }

  try {
    await sendResend(email, subject, text, apiKey)
  } catch (err) {
    console.error('[authority/invite] send failed:', err)
    return NextResponse.json({
      error: 'Could not send invite email. Copy the link and share manually.',
      joinUrl,
    }, { status: 502 })
  }

  return NextResponse.json({ sent: true, joinUrl })
}
