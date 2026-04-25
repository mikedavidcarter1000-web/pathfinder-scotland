// Authority-15: opt-in toggle for sharing aggregated LA data with the
// national tier. Only la_admin can flip this. Reads / writes go through
// the service-role admin client so RLS doesn't gate the LA admin's own
// settings update.

import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'

export const runtime = 'nodejs'

export async function GET() {
  const guard = await requireAuthorityStaffApi({ mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('local_authorities')
    .select('id, name, share_national, share_national_opted_at')
    .eq('id', ctx.authorityId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    authorityName: data.name,
    shareNational: !!data.share_national,
    shareNationalOptedAt: data.share_national_opted_at,
    isAdmin: ctx.isAdmin,
  })
}

export async function PATCH(req: Request) {
  const guard = await requireAuthorityStaffApi({ mustBeAdmin: true, mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const shareNational = (body as { share_national?: unknown })?.share_national
  if (typeof shareNational !== 'boolean') {
    return NextResponse.json(
      { error: 'share_national must be a boolean' },
      { status: 400 },
    )
  }

  const now = new Date().toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('local_authorities')
    .update({
      share_national: shareNational,
      share_national_opted_at: now,
      updated_at: now,
    })
    .eq('id', ctx.authorityId)
    .select('share_national, share_national_opted_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit trail. Same dedup pattern as authority-alerts: insert a single
  // row per change, action distinguishes enable from disable so the audit
  // log reads as a clear timeline.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('authority_audit_log').insert({
    authority_id: ctx.authorityId,
    staff_id: ctx.staffId,
    action: shareNational ? 'national_sharing_enabled' : 'national_sharing_disabled',
    resource: 'local_authorities.share_national',
    filters_applied: { share_national: shareNational },
  })

  return NextResponse.json({
    ok: true,
    shareNational: !!data.share_national,
    shareNationalOptedAt: data.share_national_opted_at,
  })
}
