import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type AuthorityStaffContext = {
  staffId: string
  userId: string
  email: string
  authorityId: string
  authorityName: string
  role: string
  fullName: string
  isAdmin: boolean
  canManageStaff: boolean
  canExportData: boolean
  canConfigureAlerts: boolean
  canAccessApi: boolean
  canBuildCustomReports: boolean
  verified: boolean
}

export async function requireAuthorityStaffApi(opts?: {
  mustBeAdmin?: boolean
  mustBeVerified?: boolean
}): Promise<
  | { ok: true; ctx: AuthorityStaffContext; admin: SupabaseClient<Database> }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (supabase as any)
    .from('authority_staff')
    .select(`
      id, user_id, email, full_name, role,
      can_manage_staff, can_export_data, can_configure_alerts,
      can_access_api, can_build_custom_reports,
      authority_id,
      local_authorities (id, name, verified)
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Not an authority staff member' }, { status: 403 }),
    }
  }

  const la = staff.local_authorities as { id: string; name: string; verified: boolean } | null

  const ctx: AuthorityStaffContext = {
    staffId: staff.id,
    userId: staff.user_id,
    email: staff.email,
    authorityId: staff.authority_id,
    authorityName: la?.name ?? '',
    role: staff.role,
    fullName: staff.full_name,
    isAdmin: staff.role === 'la_admin',
    canManageStaff: staff.can_manage_staff,
    canExportData: staff.can_export_data,
    canConfigureAlerts: staff.can_configure_alerts,
    canAccessApi: staff.can_access_api,
    canBuildCustomReports: staff.can_build_custom_reports,
    verified: la?.verified ?? false,
  }

  if (opts?.mustBeAdmin && !ctx.isAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'LA admin only' }, { status: 403 }),
    }
  }

  if (opts?.mustBeVerified && !ctx.verified) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authority not yet verified' }, { status: 403 }),
    }
  }

  const admin = getAdminClient()
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Service role not configured' }, { status: 500 }),
    }
  }

  return { ok: true, ctx, admin }
}
