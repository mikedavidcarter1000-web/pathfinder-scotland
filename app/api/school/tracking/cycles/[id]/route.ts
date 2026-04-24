import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// PATCH /api/school/tracking/cycles/[id] — update a cycle (rename, reschedule,
// lock/unlock, set as current). Requires can_manage_tracking or is_school_admin.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as {
    name?: unknown
    starts_at?: unknown
    ends_at?: unknown
    is_current?: unknown
    is_locked?: unknown
  }

  const patch: Record<string, unknown> = {}
  if (typeof body.name === 'string') patch.name = body.name.trim()
  if (typeof body.starts_at === 'string') patch.starts_at = body.starts_at
  if (typeof body.ends_at === 'string') patch.ends_at = body.ends_at
  if (typeof body.is_current === 'boolean') patch.is_current = body.is_current
  if (typeof body.is_locked === 'boolean') patch.is_locked = body.is_locked

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('tracking_cycles')
    .update(patch)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cycle: data })
}

// DELETE /api/school/tracking/cycles/[id] — admin only.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('tracking_cycles')
    .delete()
    .eq('id', id)
    .eq('school_id', ctx.schoolId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
