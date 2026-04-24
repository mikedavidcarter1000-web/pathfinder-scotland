import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

const VALID_CATS = new Set(['staffing', 'resources', 'trips', 'technology', 'training', 'other'])

export async function POST(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'PEF data is leadership-only' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !body.allocation_id || !body.category || !body.description || body.amount == null) {
    return NextResponse.json({ error: 'allocation_id, category, description, amount required' }, { status: 400 })
  }
  if (!VALID_CATS.has(body.category)) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }

  // Verify allocation belongs to this school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: alloc } = await (admin as any)
    .from('pef_allocations').select('school_id').eq('id', body.allocation_id).maybeSingle()
  if (!alloc || alloc.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'allocation not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('pef_spend').insert({
      allocation_id: body.allocation_id,
      category: body.category,
      description: body.description,
      amount: body.amount,
      target_student_count: body.target_student_count ?? null,
      target_description: body.target_description ?? null,
      measured_impact: body.measured_impact ?? null,
      linked_intervention_ids: body.linked_intervention_ids ?? null,
    }).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ spend: data })
}
