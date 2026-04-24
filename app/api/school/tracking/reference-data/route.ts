import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/tracking/reference-data — subjects + qualification_types
// used to populate the class creation / edit form. Scoped to the school's
// territory so English schools eventually see English qualifications.
export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // Resolve the school's territory id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('territory_id')
    .eq('id', ctx.schoolId)
    .maybeSingle()
  const territoryId = school?.territory_id as string | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subjects } = await (admin as any)
    .from('subjects')
    .select('id, name')
    .order('name', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (admin as any)
    .from('qualification_types')
    .select('id, name, short_name, scqf_level')
    .order('sort_order', { ascending: true })
  if (territoryId) q = q.eq('territory_id', territoryId)
  const { data: qualifications } = await q

  return NextResponse.json({
    subjects: subjects ?? [],
    qualification_types: qualifications ?? [],
  })
}
