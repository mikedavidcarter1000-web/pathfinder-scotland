// Authority-15: server-side guard for /national/** API routes and server
// components. Mirrors lib/authority/auth.ts so the call sites read the same.
//
// last_active_at is bumped on every guarded call via the service-role admin
// client. There is no RLS policy that allows a national_staff member to
// update their own row (because RLS cannot constrain WHICH columns get
// updated, and we don't want to let non-admins change their own role).

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { NationalStaffRole } from './constants'

export type NationalStaffContext = {
  staffId: string
  userId: string
  email: string
  fullName: string
  organisation: string
  role: NationalStaffRole
  isAdmin: boolean
  canManageStaff: boolean
  canExportData: boolean
  canAccessApi: boolean
}

export async function requireNationalStaffApi(opts?: {
  mustBeAdmin?: boolean
}): Promise<
  | { ok: true; ctx: NationalStaffContext; admin: SupabaseClient<Database> }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const admin = getAdminClient()
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Service role not configured' }, { status: 500 }),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('national_staff')
    .select(
      'id, user_id, email, full_name, organisation, role, can_manage_staff, can_export_data, can_access_api',
    )
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Not a national staff member' }, { status: 403 }),
    }
  }

  const ctx: NationalStaffContext = {
    staffId: staff.id,
    userId: staff.user_id,
    email: staff.email,
    fullName: staff.full_name,
    organisation: staff.organisation,
    role: staff.role as NationalStaffRole,
    isAdmin: staff.role === 'national_admin',
    canManageStaff: staff.can_manage_staff,
    canExportData: staff.can_export_data,
    canAccessApi: staff.can_access_api,
  }

  if (opts?.mustBeAdmin && !ctx.isAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'National admin only' }, { status: 403 }),
    }
  }

  // Fire-and-forget last_active_at bump. Failure here must not block the
  // request; the column is purely observational.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (admin as any)
    .from('national_staff')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', ctx.staffId)

  return { ok: true, ctx, admin }
}

// Server-side helper for /national/** RSC pages that need to redirect
// unauthenticated users rather than return JSON. Returns the staff ctx if
// the user is national staff, otherwise returns null and the caller is
// expected to redirect.
export async function getNationalStaffContext(): Promise<NationalStaffContext | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = getAdminClient()
  if (!admin) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('national_staff')
    .select(
      'id, user_id, email, full_name, organisation, role, can_manage_staff, can_export_data, can_access_api',
    )
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) return null

  return {
    staffId: staff.id,
    userId: staff.user_id,
    email: staff.email,
    fullName: staff.full_name,
    organisation: staff.organisation,
    role: staff.role as NationalStaffRole,
    isAdmin: staff.role === 'national_admin',
    canManageStaff: staff.can_manage_staff,
    canExportData: staff.can_export_data,
    canAccessApi: staff.can_access_api,
  }
}

// Append a row to national_audit_log. Service-role insert so RLS can't
// silently drop a record. Failure is logged but never propagates.
export async function logNationalAction(
  admin: SupabaseClient<Database>,
  staffId: string,
  action: string,
  resource?: string,
  filtersApplied?: Record<string, unknown>,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('national_audit_log').insert({
    staff_id: staffId,
    action,
    resource: resource ?? null,
    filters_applied: filtersApplied ?? null,
  })
  if (error) {
    // eslint-disable-next-line no-console
    console.error('national audit log insert failed:', error.message)
  }
}
