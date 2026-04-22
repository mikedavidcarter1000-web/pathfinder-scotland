import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('school_staff')
    .select('id, user_id, full_name, email, role, is_school_admin, can_view_individual_students, created_at')
    .eq('school_id', ctx.schoolId)
    .order('created_at')

  return NextResponse.json({ staff: data ?? [] })
}
