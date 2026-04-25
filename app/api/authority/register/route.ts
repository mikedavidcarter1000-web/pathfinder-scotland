import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { RESEND_FROM, LA_ADMIN_NOTIFY_EMAIL } from '@/lib/authority/constants'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

// GET: list local_authorities for the registration dropdown
export async function GET() {
  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('local_authorities')
    .select('id, name, code, slug')
    .order('name')
  if (error) {
    return NextResponse.json({ error: 'Could not load authorities' }, { status: 500 })
  }
  return NextResponse.json({ authorities: data })
}

type RegisterBody = {
  authorityId?: unknown
  contactName?: unknown
  contactEmail?: unknown
  contactRole?: unknown
  phone?: unknown
}

// POST: register a new LA admin account
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const admin = getAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })
    }

    const body = (await req.json().catch(() => null)) as RegisterBody | null
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const authorityId = typeof body.authorityId === 'string' ? body.authorityId.trim() : ''
    const contactName = typeof body.contactName === 'string' ? body.contactName.trim() : ''
    const contactEmail = typeof body.contactEmail === 'string' ? body.contactEmail.trim().toLowerCase() : ''
    const contactRole = typeof body.contactRole === 'string' ? body.contactRole.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

    if (!authorityId) return NextResponse.json({ error: 'Select a local authority.' }, { status: 400 })
    if (!contactName) return NextResponse.json({ error: 'Contact name is required.' }, { status: 400 })
    if (!EMAIL_RE.test(contactEmail)) return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    if (!contactRole) return NextResponse.json({ error: 'Contact role/job title is required.' }, { status: 400 })

    // Fetch the authority
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: la } = await (admin as any)
      .from('local_authorities')
      .select('id, name, verified')
      .eq('id', authorityId)
      .maybeSingle()

    if (!la) return NextResponse.json({ error: 'Local authority not found.' }, { status: 404 })

    // Prevent duplicate staff registration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingStaff } = await (admin as any)
      .from('authority_staff')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingStaff) {
      return NextResponse.json(
        { error: 'You are already registered for an authority.' },
        { status: 409 }
      )
    }

    // Create authority_staff row (la_admin, trigger sets permissions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: staffErr } = await (admin as any).from('authority_staff').insert({
      user_id: user.id,
      authority_id: authorityId,
      full_name: contactName,
      email: contactEmail,
      role: 'la_admin',
    })

    if (staffErr) {
      console.error('[authority/register] create staff failed:', staffErr)
      return NextResponse.json({ error: 'Could not create staff record.' }, { status: 500 })
    }

    // Update authority primary contact details; keep subscription_status='pending'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('local_authorities').update({
      primary_contact_name: contactName,
      primary_contact_email: contactEmail,
      primary_contact_role: contactRole,
    }).eq('id', authorityId)

    // Send admin notification
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const subject = `[Pathfinder] LA Registration: ${la.name}`
      const text = [
        `New local authority registration received.`,
        '',
        `Authority: ${la.name}`,
        `Contact: ${contactName}`,
        `Email: ${contactEmail}`,
        `Role: ${contactRole}`,
        phone ? `Phone: ${phone}` : '',
        '',
        `Action required: verify this authority in the Supabase dashboard or admin panel.`,
        `Set local_authorities.verified = true for authority ID: ${authorityId}`,
      ].filter(Boolean).join('\n')

      await sendResend(LA_ADMIN_NOTIFY_EMAIL, subject, text, apiKey).catch((err) =>
        console.error('[authority/register] admin notification failed (non-fatal):', err)
      )
    }

    return NextResponse.json({ ok: true, authorityId, authorityName: la.name })
  } catch (err) {
    console.error('[authority/register] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
