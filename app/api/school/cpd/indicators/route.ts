import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export async function GET() {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin } = gate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('inspection_indicators')
    .select('id, indicator_code, indicator_name, category')
    .eq('framework_name', 'HGIOS4')
    .order('indicator_code', { ascending: true })
  return NextResponse.json({ indicators: data ?? [] })
}
