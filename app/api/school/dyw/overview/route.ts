import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { getDywOverview, getEmployerPipeline, getSectorCoverage, getNetworksCapacity } from '@/lib/school/dyw'

export async function GET() {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const [overview, pipeline, sectors, networks] = await Promise.all([
    getDywOverview(admin, ctx.schoolId),
    getEmployerPipeline(admin, ctx.schoolId),
    getSectorCoverage(admin, ctx.schoolId),
    getNetworksCapacity(admin, ctx.schoolId),
  ])

  return NextResponse.json({ overview, pipeline, sectors, networks })
}
