import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/admin-auth'
import { AUTHORITY_ROLE_LABELS, type AuthorityStaffRole } from '@/lib/authority/constants'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invitation } = await (admin as any)
    .from('authority_invitations')
    .select('id, email, role, expires_at, accepted, authority_id, local_authorities(name)')
    .eq('token', token)
    .maybeSingle()

  if (!invitation) return NextResponse.json({ error: 'Invalid invitation token.' }, { status: 404 })
  if (invitation.accepted) return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 410 })
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 })
  }

  const la = invitation.local_authorities as { name: string } | null
  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    roleLabel: AUTHORITY_ROLE_LABELS[invitation.role as AuthorityStaffRole] ?? invitation.role,
    authorityName: la?.name ?? '',
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })

  const body = (await req.json().catch(() => null)) as {
    fullName?: unknown
    password?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!fullName) return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invitation } = await (admin as any)
    .from('authority_invitations')
    .select('id, email, role, expires_at, accepted, authority_id')
    .eq('token', token)
    .maybeSingle()

  if (!invitation) return NextResponse.json({ error: 'Invalid invitation token.' }, { status: 404 })
  if (invitation.accepted) return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 410 })
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 })
  }

  // Create auth user (email_confirm: true bypasses the email confirmation step)
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
  })

  if (authErr || !authData.user) {
    console.error('[authority/join] create user failed:', authErr)
    if (authErr?.message?.toLowerCase().includes('already registered')) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Sign in instead.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Could not create account.' }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: staffErr } = await (admin as any).from('authority_staff').insert({
    user_id: authData.user.id,
    authority_id: invitation.authority_id,
    full_name: fullName,
    email: invitation.email,
    role: invitation.role,
  })

  if (staffErr) {
    await admin.auth.admin.deleteUser(authData.user.id).catch(() => {})
    console.error('[authority/join] create staff failed:', staffErr)
    return NextResponse.json({ error: 'Could not create staff record.' }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('authority_invitations')
    .update({ accepted: true, accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return NextResponse.json({ ok: true, email: invitation.email })
}
