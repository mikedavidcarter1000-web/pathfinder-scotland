import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import {
  getAttainmentMeasures,
  getAttainmentTrend,
  getSimdGap,
  getCesCapacities,
  getDashboardAlerts,
} from '@/lib/school/analytics'

export async function GET() {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth

  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Analytics is leadership-only' }, { status: 403 })
  }

  const [trend, simd, ces, alerts] = await Promise.all([
    getAttainmentTrend(admin, ctx.schoolId),
    getSimdGap(admin, ctx.schoolId),
    getCesCapacities(admin, ctx.schoolId),
    getDashboardAlerts(admin, ctx.schoolId),
  ])

  return NextResponse.json({
    attainment: trend.current,
    attainment_previous: trend.previous,
    simd_gap: simd,
    ces,
    alerts,
    can_view_sensitive_flags: ctx.canViewSensitiveFlags || ctx.isAdmin,
  })
}
