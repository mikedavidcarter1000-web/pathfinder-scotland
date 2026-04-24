import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Evidence edit is leadership-only' }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  // Scope to own school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any).from('inspection_evidence').select('school_id').eq('id', id).maybeSingle()
  if (!existing || existing.school_id !== ctx.schoolId) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const update: Record<string, unknown> = {}
  if (body.title !== undefined) update.title = body.title
  if (body.description !== undefined) update.description = body.description
  if (body.source !== undefined) update.source = body.source
  if (body.evidence_type !== undefined) update.evidence_type = body.evidence_type

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any).from('inspection_evidence').update(update).eq('id', id).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ evidence: data })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Evidence delete is leadership-only' }, { status: 403 })
  }
  const { id } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any).from('inspection_evidence').select('school_id').eq('id', id).maybeSingle()
  if (!existing || existing.school_id !== ctx.schoolId) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('inspection_evidence').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
