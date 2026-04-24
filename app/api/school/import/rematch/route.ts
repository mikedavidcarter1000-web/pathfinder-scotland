import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { rematchUnmatched } from '@/lib/school/import'

export const runtime = 'nodejs'

export async function POST() {
  const gate = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const counts = await rematchUnmatched(admin, ctx.schoolId)
  return NextResponse.json(counts)
}

export async function GET() {
  const gate = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  // List unmatched rows across three tables for the UI.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sqa = await (admin as any)
    .from('sqa_results')
    .select('id, scn, student_name, subject_name, grade, academic_year')
    .eq('school_id', ctx.schoolId).is('student_id', null).limit(50)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const destinations = await (admin as any)
    .from('alumni_destinations')
    .select('id, scn, student_name, leaving_year, destination_type')
    .eq('school_id', ctx.schoolId).is('student_id', null).limit(50)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transitions = await (admin as any)
    .from('transition_profiles')
    .select('id, scn, student_name, source_primary, transition_year')
    .eq('school_id', ctx.schoolId).is('student_id', null).limit(50)
  return NextResponse.json({
    sqa: sqa.data ?? [],
    destinations: destinations.data ?? [],
    transitions: transitions.data ?? [],
  })
}
