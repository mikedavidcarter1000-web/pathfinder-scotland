import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

const GUIDANCE_ROLES = new Set(['guidance_teacher', 'pt_guidance', 'depute', 'head_teacher'])

// PATCH /api/school/guidance/asn/[id] -- update provision
// DELETE /api/school/guidance/asn/[id] -- admin only (soft delete via is_active)

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (!GUIDANCE_ROLES.has(ctx.role) && !ctx.isAdmin) {
    return NextResponse.json({ error: 'Only guidance staff and school leadership can edit ASN provisions.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from('asn_provisions')
    .select('id, school_id')
    .eq('id', id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.school_id !== ctx.schoolId) return NextResponse.json({ error: 'Cross-school access denied' }, { status: 403 })

  const updates: Record<string, unknown> = {}
  if (typeof body.description === 'string') updates.description = body.description
  if (typeof body.review_date === 'string' || body.review_date === null) updates.review_date = body.review_date
  if (typeof body.responsible_staff_id === 'string' || body.responsible_staff_id === null) updates.responsible_staff_id = body.responsible_staff_id
  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active

  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('asn_provisions').update(updates).eq('id', id)
  if (error) {
    console.error('[guidance/asn PATCH] update failed:', error)
    return NextResponse.json({ error: 'Could not update provision.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from('asn_provisions')
    .select('school_id')
    .eq('id', id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.school_id !== ctx.schoolId) return NextResponse.json({ error: 'Cross-school access denied' }, { status: 403 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('asn_provisions').delete().eq('id', id)
  if (error) {
    console.error('[guidance/asn DELETE] failed:', error)
    return NextResponse.json({ error: 'Could not delete provision.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
