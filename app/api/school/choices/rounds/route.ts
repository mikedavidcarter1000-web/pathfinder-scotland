import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/choices/rounds -- list rounds for the current school.
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const academicYear = url.searchParams.get('academic_year')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (admin as any)
    .from('choice_rounds')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .order('academic_year', { ascending: false })
    .order('created_at', { ascending: false })
  if (academicYear) q = q.eq('academic_year', academicYear)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rounds: data ?? [] })
}

// POST /api/school/choices/rounds -- create a new round. Requires can_manage_tracking.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    name?: unknown
    academic_year?: unknown
    year_group?: unknown
    transition?: unknown
    opens_at?: unknown
    closes_at?: unknown
    requires_parent_approval?: unknown
    instructions?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const academicYear = typeof body.academic_year === 'string' ? body.academic_year.trim() : ''
  const yearGroup = typeof body.year_group === 'string' ? body.year_group.trim() : ''
  const transition = typeof body.transition === 'string' ? body.transition : null
  const opensAt = typeof body.opens_at === 'string' && body.opens_at ? body.opens_at : null
  const closesAt = typeof body.closes_at === 'string' && body.closes_at ? body.closes_at : null
  const requiresParent = !!body.requires_parent_approval
  const instructions = typeof body.instructions === 'string' ? body.instructions : null

  if (!name || !academicYear || !yearGroup) {
    return NextResponse.json({ error: 'Name, academic year and year group are required.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('choice_rounds')
    .insert({
      school_id: ctx.schoolId,
      name,
      academic_year: academicYear,
      year_group: yearGroup,
      transition,
      status: 'draft',
      opens_at: opensAt,
      closes_at: closesAt,
      requires_parent_approval: requiresParent,
      instructions,
      created_by: ctx.staffId,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ round: data })
}
