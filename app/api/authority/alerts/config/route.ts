import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import { getAlertConfig, updateAlertConfig, type AlertConfig } from '@/lib/authority/alerts'

export const runtime = 'nodejs'

export async function GET() {
  const guard = await requireAuthorityStaffApi({ mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard
  const config = await getAlertConfig(admin, ctx.authorityId)
  return NextResponse.json({ config })
}

export async function PUT(req: Request) {
  // Only LA admins (or staff with can_configure_alerts) may write.
  const guard = await requireAuthorityStaffApi({ mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard
  if (!ctx.canConfigureAlerts) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as Partial<AlertConfig> | null
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const result = await updateAlertConfig(admin, ctx.authorityId, body)
  if (!result.ok) return NextResponse.json({ error: result.error ?? 'Save failed' }, { status: 500 })
  return NextResponse.json({ ok: true, config: result.config })
}
