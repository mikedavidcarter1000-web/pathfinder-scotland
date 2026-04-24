import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export async function GET(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'PEF data is leadership-only' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const academicYear = searchParams.get('academic_year') ?? undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (admin as any).from('pef_allocations').select('*').eq('school_id', ctx.schoolId)
  if (academicYear) q = q.eq('academic_year', academicYear)
  const { data: allocations } = await q.order('academic_year', { ascending: false })
  const allocationIds = (allocations ?? []).map((a: { id: string }) => a.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: spend } = allocationIds.length
    ? await (admin as any).from('pef_spend').select('*').in('allocation_id', allocationIds)
    : { data: [] }

  return NextResponse.json({
    allocations: allocations ?? [],
    spend: spend ?? [],
  })
}

export async function POST(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'PEF data is leadership-only' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !body.academic_year || body.total_allocation == null) {
    return NextResponse.json({ error: 'academic_year and total_allocation required' }, { status: 400 })
  }

  // Upsert allocation for the (school, year) pair.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('pef_allocations')
    .upsert({
      school_id: ctx.schoolId,
      academic_year: body.academic_year,
      total_allocation: body.total_allocation,
    }, { onConflict: 'school_id,academic_year' })
    .select()
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ allocation: data })
}
