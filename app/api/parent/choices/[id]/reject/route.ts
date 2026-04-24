import { NextResponse } from 'next/server'
import { requireParentApi } from '@/lib/school/student-auth'

export const runtime = 'nodejs'

// POST /api/parent/choices/[id]/reject -- flag rejected with required comment.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireParentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as { comment?: unknown }
  const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
  if (!comment) {
    return NextResponse.json({ error: 'A comment is required when rejecting choices.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: choice } = await (admin as any)
    .from('student_choices')
    .select('id, student_id, status')
    .eq('id', id)
    .maybeSingle()
  if (!choice || !ctx.linkedStudentIds.includes(choice.student_id)) {
    return NextResponse.json({ error: 'Choice not found.' }, { status: 404 })
  }
  if (choice.status === 'confirmed') {
    return NextResponse.json({ error: 'Already confirmed; cannot reject.' }, { status: 409 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('student_choices')
    .update({
      status: 'rejected',
      parent_rejected_at: new Date().toISOString(),
      parent_approved_at: null,
      parent_comment: comment,
      parent_id: ctx.parentId,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ choice: data })
}
