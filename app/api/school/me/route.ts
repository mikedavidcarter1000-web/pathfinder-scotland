import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select(
      'id, name, slug, local_authority, postcode, school_type, subscription_status, is_founding_school, trial_started_at, trial_expires_at'
    )
    .eq('id', ctx.schoolId)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: joinCode } = await (admin as any)
    .from('school_join_codes')
    .select('code, is_active, expires_at')
    .eq('school_id', ctx.schoolId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: linkedCount } = await (admin as any)
    .from('school_student_links')
    .select('student_id', { count: 'exact', head: true })
    .eq('school_id', ctx.schoolId)

  return NextResponse.json({
    staff: {
      userId: ctx.userId,
      fullName: ctx.fullName,
      email: ctx.email,
      role: ctx.role,
      isAdmin: ctx.isAdmin,
      canViewIndividualStudents: ctx.canViewIndividualStudents,
    },
    school,
    joinCode,
    linkedStudents: linkedCount ?? 0,
  })
}
