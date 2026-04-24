import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/reports?cycle_id=...&year_group=...
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const cycleId = url.searchParams.get('cycle_id')
  const yearGroup = url.searchParams.get('year_group')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (admin as any)
    .from('parent_reports')
    .select(
      `id, student_id, cycle_id, generated_at, emailed_at, emailed_to,
       students:student_id (id, first_name, last_name, school_stage, registration_class, email),
       tracking_cycles:cycle_id (name)`
    )
    .eq('school_id', ctx.schoolId)
    .order('generated_at', { ascending: false })
  if (cycleId) q = q.eq('cycle_id', cycleId)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Row = {
    id: string
    student_id: string
    cycle_id: string
    generated_at: string
    emailed_at: string | null
    emailed_to: string | null
    students: { first_name: string | null; last_name: string | null; school_stage: string | null; registration_class: string | null; email: string | null } | null
    tracking_cycles: { name: string } | null
  }
  let rows = (data ?? []) as Row[]
  if (yearGroup) rows = rows.filter((r) => r.students?.school_stage === yearGroup)
  return NextResponse.json({ reports: rows })
}
