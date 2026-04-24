import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import {
  getAttainmentMeasures,
  getGradeDistribution,
  getDepartmentComparison,
  getKeyMeasureTrend,
  getValueAdded,
} from '@/lib/school/analytics'

export async function GET(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Analytics is leadership-only' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const yearGroup = searchParams.get('year_group') ?? undefined
  const qualShort = searchParams.get('qualification') ?? undefined

  const [overall, s4, s5, s6, grid, dist, departments, trend, valueAdded] = await Promise.all([
    getAttainmentMeasures(admin, ctx.schoolId),
    getAttainmentMeasures(admin, ctx.schoolId, undefined, 'S4'),
    getAttainmentMeasures(admin, ctx.schoolId, undefined, 'S5'),
    getAttainmentMeasures(admin, ctx.schoolId, undefined, 'S6'),
    getAttainmentMeasures(admin, ctx.schoolId, undefined, yearGroup),
    getGradeDistribution(admin, ctx.schoolId, { yearGroup, qualificationShort: qualShort }),
    getDepartmentComparison(admin, ctx.schoolId),
    getKeyMeasureTrend(admin, ctx.schoolId),
    getValueAdded(admin, ctx.schoolId),
  ])

  return NextResponse.json({
    overall,
    by_year: { S4: s4, S5: s5, S6: s6 },
    filtered: grid,
    grade_distribution: dist,
    departments,
    trend,
    value_added: valueAdded,
  })
}
