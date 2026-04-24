import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// PATCH /api/school/guidance/interventions/[id]
// Updates an existing intervention -- used for completing follow-ups,
// editing notes, marking action items done.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  // Fetch existing row to enforce ownership / school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from('interventions')
    .select('id, staff_id, school_id')
    .eq('id', id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.school_id !== ctx.schoolId) return NextResponse.json({ error: 'Cross-school access denied' }, { status: 403 })

  const isOwner = existing.staff_id === ctx.staffId
  if (!isOwner && !ctx.canViewSensitiveFlags && !ctx.isAdmin) {
    return NextResponse.json({ error: 'Only the creator or senior staff can edit this intervention.' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof body.title === 'string') updates.title = body.title
  if (typeof body.notes === 'string') updates.notes = body.notes
  if (typeof body.outcome === 'string') updates.outcome = body.outcome
  if (Array.isArray(body.action_items)) updates.action_items = body.action_items
  if (typeof body.follow_up_date === 'string' || body.follow_up_date === null) updates.follow_up_date = body.follow_up_date
  if (typeof body.completed_at === 'string' || body.completed_at === null) updates.completed_at = body.completed_at
  if (typeof body.is_confidential === 'boolean') updates.is_confidential = body.is_confidential

  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('interventions').update(updates).eq('id', id)
  if (error) {
    console.error('[guidance/interventions PATCH] update failed:', error)
    return NextResponse.json({ error: 'Could not update intervention.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
