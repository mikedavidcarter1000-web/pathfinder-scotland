import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/tracking/cycles — list cycles for the current school.
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const academicYear = url.searchParams.get('academic_year')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (admin as any)
    .from('tracking_cycles')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .order('academic_year', { ascending: false })
    .order('cycle_number', { ascending: true })
  if (academicYear) q = q.eq('academic_year', academicYear)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cycles: data ?? [] })
}

// POST /api/school/tracking/cycles — create a new cycle. Requires
// can_manage_tracking or is_school_admin.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    name?: unknown
    academic_year?: unknown
    cycle_number?: unknown
    starts_at?: unknown
    ends_at?: unknown
    set_current?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const academicYear = typeof body.academic_year === 'string' ? body.academic_year.trim() : ''
  const cycleNumber = typeof body.cycle_number === 'number' ? body.cycle_number : 1
  const startsAt = typeof body.starts_at === 'string' ? body.starts_at : ''
  const endsAt = typeof body.ends_at === 'string' ? body.ends_at : ''
  const setCurrent = body.set_current !== false

  if (!name || !academicYear || !startsAt || !endsAt) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('tracking_cycles')
    .insert({
      school_id: ctx.schoolId,
      name,
      academic_year: academicYear,
      cycle_number: cycleNumber,
      starts_at: startsAt,
      ends_at: endsAt,
      is_current: setCurrent,
      is_locked: false,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cycle: data })
}
