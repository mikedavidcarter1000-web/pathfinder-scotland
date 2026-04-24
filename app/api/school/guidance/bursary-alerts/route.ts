import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { fetchCaseload } from '@/lib/school/guidance-caseload'
import { matchesBursary } from '@/lib/school/bursary-eligibility'

export const runtime = 'nodejs'

// GET /api/school/guidance/bursary-alerts
// For each caseload student, counts bursaries they appear eligible for.
// Returns per-student counts + a top-level count of "students with at
// least one unmatched opportunity". Guidance-only.
export async function GET() {
  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const { students: caseload } = await fetchCaseload(admin, ctx.userId, ctx.schoolId)
  if (caseload.length === 0) return NextResponse.json({ students: [], summary: { totalFlagged: 0 } })

  const studentIds = caseload.map((s) => s.id)

  // Full student rows for flag matching.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: fullStudents } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, school_stage, simd_decile, care_experienced, receives_free_school_meals, is_young_carer, is_carer, has_disability, is_estranged, is_refugee_or_asylum_seeker, is_young_parent, is_single_parent_household')
    .in('id', studentIds)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: bursaries } = await (admin as any)
    .from('bursaries')
    .select('*')
    .eq('is_active', true)

  const out: Array<{ studentId: string; name: string; schoolStage: string | null; eligibleCount: number }> = []
  type StudentFlagsRow = Parameters<typeof matchesBursary>[1] & { id: string; first_name: string | null; last_name: string | null; school_stage: string | null }
  for (const s of (fullStudents ?? []) as StudentFlagsRow[]) {
    type BursaryRow = Parameters<typeof matchesBursary>[0]
    const matches = ((bursaries ?? []) as BursaryRow[]).filter((b) => matchesBursary(b, s))
    if (matches.length > 0) {
      out.push({
        studentId: s.id,
        name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || 'Unknown',
        schoolStage: s.school_stage,
        eligibleCount: matches.length,
      })
    }
  }

  out.sort((a, b) => b.eligibleCount - a.eligibleCount)

  return NextResponse.json({
    students: out.slice(0, 30),
    summary: { totalFlagged: out.length },
  })
}
