import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// DELETE /api/school/tracking/classes/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('class_assignments')
    .delete()
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// PATCH
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const patch: Record<string, unknown> = {}
  if (typeof body.staff_id === 'string') patch.staff_id = body.staff_id
  if (typeof body.subject_id === 'string' || body.subject_id === null)
    patch.subject_id = body.subject_id as string | null
  if (typeof body.year_group === 'string') patch.year_group = body.year_group.trim()
  if (typeof body.class_code === 'string' || body.class_code === null)
    patch.class_code = body.class_code as string | null
  if (typeof body.qualification_type_id === 'string' || body.qualification_type_id === null)
    patch.qualification_type_id = body.qualification_type_id as string | null

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('class_assignments')
    .update(patch)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ class: data })
}
