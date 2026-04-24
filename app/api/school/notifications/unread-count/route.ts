import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { getUnreadCount } from '@/lib/school/notifications'

export const runtime = 'nodejs'

export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const count = await getUnreadCount(admin, {
    schoolId: ctx.schoolId,
    userId: ctx.userId,
    audience: 'staff',
    staffId: ctx.staffId,
    staffRole: ctx.role,
  })
  return NextResponse.json({ count })
}
