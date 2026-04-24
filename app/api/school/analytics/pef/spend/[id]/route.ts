import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'PEF data is leadership-only' }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  // Ensure the spend belongs to this school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (admin as any)
    .from('pef_spend').select('id, allocation_id, pef_allocations!inner(school_id)')
    .eq('id', id).maybeSingle()
  // If inner-join shape fails, fall back to explicit join.
  if (!row) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: s } = await (admin as any).from('pef_spend').select('allocation_id').eq('id', id).maybeSingle()
    if (!s) return NextResponse.json({ error: 'not found' }, { status: 404 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: alloc } = await (admin as any).from('pef_allocations').select('school_id').eq('id', s.allocation_id).maybeSingle()
    if (!alloc || alloc.school_id !== ctx.schoolId) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
  }

  const update: Record<string, unknown> = {}
  if (body.measured_impact !== undefined) update.measured_impact = body.measured_impact
  if (body.description !== undefined) update.description = body.description
  if (body.amount !== undefined) update.amount = body.amount
  if (body.target_student_count !== undefined) update.target_student_count = body.target_student_count

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('pef_spend').update(update).eq('id', id).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ spend: data })
}
