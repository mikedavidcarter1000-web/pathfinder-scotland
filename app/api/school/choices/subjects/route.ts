import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/choices/subjects?level=n5|higher|adv_higher
// Returns the subject master list filtered by availability at the given level.
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { admin } = guard

  const url = new URL(req.url)
  const level = url.searchParams.get('level')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (admin as any)
    .from('subjects')
    .select('id, name, is_available_n5, is_available_higher, is_available_adv_higher, is_npa, is_academy')
    .order('name', { ascending: true })

  if (level === 'n5') q = q.eq('is_available_n5', true)
  else if (level === 'higher') q = q.eq('is_available_higher', true)
  else if (level === 'adv_higher') q = q.eq('is_available_adv_higher', true)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Qualification types for the dropdown.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: qualTypes } = await (admin as any)
    .from('qualification_types')
    .select('id, name, short_name, scqf_level')
    .order('scqf_level', { ascending: true })

  return NextResponse.json({ subjects: data ?? [], qualification_types: qualTypes ?? [] })
}
