import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { computeCurrentValue } from '../route'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'SIP management is leadership-only' }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from('sip_priorities').select('school_id, target_metric').eq('id', id).maybeSingle()
  if (!existing || existing.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const update: Record<string, unknown> = {}
  if (body.title !== undefined) update.title = body.title
  if (body.description !== undefined) update.description = body.description
  if (body.target_metric !== undefined) update.target_metric = body.target_metric
  if (body.baseline_value !== undefined) update.baseline_value = body.baseline_value
  if (body.target_value !== undefined) update.target_value = body.target_value
  if (body.status !== undefined) update.status = body.status
  if (body.inspection_indicator_id !== undefined) update.inspection_indicator_id = body.inspection_indicator_id
  if (body.recompute_current) {
    const metric = (body.target_metric as string | undefined) ?? existing.target_metric
    update.current_value = await computeCurrentValue(admin, ctx.schoolId, metric)
  } else if (body.current_value !== undefined) {
    update.current_value = body.current_value
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('sip_priorities').update(update).eq('id', id).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ priority: data })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'SIP management is leadership-only' }, { status: 403 })
  }
  const { id } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any).from('sip_priorities').select('school_id').eq('id', id).maybeSingle()
  if (!existing || existing.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('sip_priorities').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
