import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminAny = any

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const guard = await requireAuthorityStaffApi({ mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // Confirm the alert belongs to this authority before mutating; for QIO,
  // also clamp to assigned schools.
  const { data: existing } = await (admin as AdminAny)
    .from('authority_alerts')
    .select('id, school_id, authority_id')
    .eq('id', id)
    .maybeSingle()
  if (!existing || existing.authority_id !== ctx.authorityId) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  }
  if (ctx.role === 'qio') {
    const { data: staff } = await (admin as AdminAny)
      .from('authority_staff')
      .select('assigned_school_ids')
      .eq('id', ctx.staffId)
      .maybeSingle()
    const assigned = Array.isArray(staff?.assigned_school_ids) ? (staff!.assigned_school_ids as string[]) : []
    // QIOs may only act on alerts for their assigned schools. Authority-level
    // alerts (school_id IS NULL) are out of scope for QIO -- only LA admin /
    // data analyst roles can acknowledge those.
    if (!existing.school_id || !assigned.includes(existing.school_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { error } = await (admin as AdminAny)
    .from('authority_alerts')
    .update({
      acknowledged: true,
      acknowledged_by: ctx.staffId,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('authority_id', ctx.authorityId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
