import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'

export const runtime = 'nodejs'

export async function GET() {
  const guard = await requireAuthorityStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const [staffRes, invRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('authority_staff')
      .select('id, full_name, email, role, can_manage_staff, can_export_data, can_configure_alerts, can_access_api, can_build_custom_reports, last_active_at, created_at')
      .eq('authority_id', ctx.authorityId)
      .order('created_at'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('authority_invitations')
      .select('id, email, role, expires_at, accepted, created_at')
      .eq('authority_id', ctx.authorityId)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    staff: staffRes.data ?? [],
    pendingInvitations: invRes.data ?? [],
    isAdmin: ctx.isAdmin,
    authorityName: ctx.authorityName,
  })
}
