import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard
  const { id } = await params

  const body = (await req.json().catch(() => null)) as {
    canViewIndividualStudents?: unknown
    isSchoolAdmin?: unknown
    role?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const update: Record<string, string | boolean> = {}
  if (typeof body.canViewIndividualStudents === 'boolean') update.can_view_individual_students = body.canViewIndividualStudents
  if (typeof body.isSchoolAdmin === 'boolean') update.is_school_admin = body.isSchoolAdmin
  if (typeof body.role === 'string') update.role = body.role

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('school_staff')
    .update(update)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
  if (error) return NextResponse.json({ error: 'Could not update staff.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard
  const { id } = await params

  // Prevent admin deleting themselves
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: target } = await (admin as any)
    .from('school_staff')
    .select('user_id')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (target.user_id === ctx.userId) {
    return NextResponse.json({ error: 'You cannot remove yourself. Ask another admin to do it.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('school_staff').delete().eq('id', id).eq('school_id', ctx.schoolId)
  if (error) return NextResponse.json({ error: 'Could not delete.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
