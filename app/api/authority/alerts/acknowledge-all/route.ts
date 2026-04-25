import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'

export const runtime = 'nodejs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminAny = any

export async function POST() {
  const guard = await requireAuthorityStaffApi({ mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  let allowedSchoolIds: string[] | null = null
  if (ctx.role === 'qio') {
    const { data: staff } = await (admin as AdminAny)
      .from('authority_staff')
      .select('assigned_school_ids')
      .eq('id', ctx.staffId)
      .maybeSingle()
    allowedSchoolIds = Array.isArray(staff?.assigned_school_ids) ? (staff!.assigned_school_ids as string[]) : []
    if (allowedSchoolIds.length === 0) {
      return NextResponse.json({ ok: true, updated: 0 })
    }
  }

  let query = (admin as AdminAny)
    .from('authority_alerts')
    .update({
      acknowledged: true,
      acknowledged_by: ctx.staffId,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('authority_id', ctx.authorityId)
    .eq('acknowledged', false)

  if (allowedSchoolIds) query = query.in('school_id', allowedSchoolIds)

  const { error, count } = await query.select('id', { count: 'exact', head: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, updated: count ?? 0 })
}
