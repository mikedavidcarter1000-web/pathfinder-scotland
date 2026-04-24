import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const body = await req.json().catch(() => ({}))
  const update: Record<string, unknown> = {}
  const editable = [
    'title', 'provider', 'cpd_type', 'date_completed', 'hours',
    'reflection', 'impact_on_practice', 'hgios4_indicator_id',
    'gtcs_standard', 'evidence_url', 'certificate_url',
  ]
  for (const k of editable) {
    if (k in body) update[k] = body[k]
  }

  // RLS restricts to own rows; we double-check school_id for defence in depth.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('cpd_records')
    .update(update)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .eq('staff_id', ctx.staffId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  const isLeadership = ctx.isAdmin || ctx.role === 'depute' || ctx.role === 'head_teacher'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (admin as any).from('cpd_records').delete().eq('id', id).eq('school_id', ctx.schoolId)
  if (!isLeadership) q = q.eq('staff_id', ctx.staffId)
  const { error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
