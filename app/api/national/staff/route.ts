// Authority-15: list and create national staff. Creation is admin-only and
// goes through the create_national_staff SECURITY DEFINER function so the
// CHECK constraints on organisation/role are enforced at the DB.

import { NextResponse } from 'next/server'
import { requireNationalStaffApi, logNationalAction } from '@/lib/national/auth'
import { NATIONAL_ORGANISATIONS, NATIONAL_ROLES, type NationalStaffRole } from '@/lib/national/constants'

export const runtime = 'nodejs'

export async function GET() {
  const guard = await requireNationalStaffApi()
  if (!guard.ok) return guard.response
  const { admin, ctx } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('national_staff')
    .select(
      'id, full_name, email, organisation, role, can_manage_staff, can_export_data, can_access_api, last_active_at, created_at, user_id',
    )
    .order('created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    staff: data ?? [],
    isAdmin: ctx.isAdmin,
    self: { staffId: ctx.staffId, role: ctx.role },
  })
}

export async function POST(req: Request) {
  const guard = await requireNationalStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { admin, ctx } = guard

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, full_name, organisation, role } = (body ?? {}) as {
    email?: string
    full_name?: string
    organisation?: string
    role?: string
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }
  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    return NextResponse.json({ error: 'full_name is required' }, { status: 400 })
  }
  if (!organisation || !NATIONAL_ORGANISATIONS.includes(organisation as (typeof NATIONAL_ORGANISATIONS)[number])) {
    return NextResponse.json({ error: 'organisation is invalid' }, { status: 400 })
  }
  if (!role || !NATIONAL_ROLES.includes(role as NationalStaffRole)) {
    return NextResponse.json({ error: 'role is invalid' }, { status: 400 })
  }

  // Reject duplicates by email (the table has no UNIQUE on email but we
  // don't want two rows for the same person).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from('national_staff')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'A staff record with that email already exists' }, { status: 409 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any).rpc('create_national_staff', {
    p_email: email,
    p_full_name: full_name,
    p_organisation: organisation,
    p_role: role,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logNationalAction(admin, ctx.staffId, 'national_staff_created', 'national_staff', {
    new_staff_id: data,
    email,
    organisation,
    role,
  })

  return NextResponse.json({ ok: true, staffId: data })
}
