import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as {
    category?: unknown
    department?: unknown
    comment_template?: unknown
  }
  const patch: Record<string, unknown> = {}
  if (typeof body.category === 'string') patch.category = body.category
  if ('department' in body) patch.department = typeof body.department === 'string' && body.department.trim() ? body.department.trim() : null
  if (typeof body.comment_template === 'string') patch.comment_template = body.comment_template.trim()
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('comment_banks')
    .update(patch)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('comment_banks')
    .delete()
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
