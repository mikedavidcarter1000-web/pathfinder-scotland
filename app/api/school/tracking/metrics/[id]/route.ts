import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const patch: Record<string, unknown> = {}
  if (typeof body.metric_name === 'string') patch.metric_name = body.metric_name.trim()
  if (typeof body.scale_type === 'string') patch.scale_type = body.scale_type
  if (Array.isArray(body.scale_options)) patch.scale_options = body.scale_options
  if (body.colour_coding && typeof body.colour_coding === 'object') patch.colour_coding = body.colour_coding
  if (body.applies_to_departments === null || Array.isArray(body.applies_to_departments))
    patch.applies_to_departments = body.applies_to_departments
  if (typeof body.sort_order === 'number') patch.sort_order = body.sort_order
  if (typeof body.is_active === 'boolean') patch.is_active = body.is_active

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('school_tracking_metrics')
    .update(patch)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ metric: data })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard
  // Soft-delete: mark inactive rather than removing so historical entries
  // that reference this metric in their JSONB blob still render.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('school_tracking_metrics')
    .update({ is_active: false })
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ metric: data })
}
