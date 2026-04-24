import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { getSchoolCpdSummary, getCpdByHgiosIndicator } from '@/lib/school/cpd'

export async function GET(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  const isLeadership = ctx.isAdmin || ctx.role === 'depute' || ctx.role === 'head_teacher'
  if (!isLeadership) {
    return NextResponse.json({ error: 'Leadership only' }, { status: 403 })
  }

  const url = new URL(req.url)
  const ay = url.searchParams.get('academic_year') ?? undefined

  const [summary, byIndicator] = await Promise.all([
    getSchoolCpdSummary(admin, ctx.schoolId, ay),
    getCpdByHgiosIndicator(admin, ctx.schoolId, ay),
  ])

  return NextResponse.json({ summary, by_indicator: byIndicator })
}
