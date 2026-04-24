import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { gradeToNumeric } from '@/lib/school/import-parsing'

export const runtime = 'nodejs'

// GET /api/school/import/sqa/analysis?academic_year=YYYY-YY
// Returns:
//  - valueAddedBySubject: [{ subject, students, avgPredicted, avgActual, valueAdded, above, met, below }]
//  - gradeDistribution: { predicted: Record<grade,count>, actual: Record<grade,count> }
//  - discrepancies (hidden for non-individual-student viewers): list of severe under-performers
export async function GET(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const url = new URL(req.url)
  const year = url.searchParams.get('academic_year')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin as any)
    .from('sqa_results')
    .select('student_id, scn, student_name, subject_name, grade, predicted_grade, value_added, academic_year')
    .eq('school_id', ctx.schoolId)
  if (year) query = query.eq('academic_year', year)
  const { data } = await query
  const rows = data ?? []

  const bySubject = new Map<string, { students: Set<string>; predSum: number; predCount: number; actSum: number; actCount: number; above: number; met: number; below: number }>()
  const predDist: Record<string, number> = {}
  const actDist: Record<string, number> = {}
  const severe: Array<{ student_id: string | null; student_name: string | null; subject: string; predicted: string | null; actual: string; value_added: number | null }> = []

  for (const r of rows) {
    const subject = r.subject_name
    const slot = bySubject.get(subject) ?? { students: new Set(), predSum: 0, predCount: 0, actSum: 0, actCount: 0, above: 0, met: 0, below: 0 }
    if (r.student_id) slot.students.add(r.student_id)
    const a = gradeToNumeric(r.grade)
    const p = gradeToNumeric(r.predicted_grade)
    if (a != null) { slot.actSum += a; slot.actCount++ }
    if (p != null) { slot.predSum += p; slot.predCount++ }
    if (r.value_added != null) {
      if (r.value_added > 0) slot.above++
      else if (r.value_added === 0) slot.met++
      else slot.below++
    }
    bySubject.set(subject, slot)

    predDist[r.predicted_grade ?? '-'] = (predDist[r.predicted_grade ?? '-'] ?? 0) + 1
    actDist[r.grade] = (actDist[r.grade] ?? 0) + 1

    if (r.value_added != null && r.value_added <= -2) {
      severe.push({
        student_id: r.student_id,
        student_name: r.student_name,
        subject,
        predicted: r.predicted_grade,
        actual: r.grade,
        value_added: r.value_added,
      })
    }
  }

  const valueAddedBySubject = Array.from(bySubject.entries()).map(([subject, s]) => ({
    subject,
    students: s.students.size,
    avgPredicted: s.predCount ? Math.round((s.predSum / s.predCount) * 100) / 100 : null,
    avgActual: s.actCount ? Math.round((s.actSum / s.actCount) * 100) / 100 : null,
    valueAdded: (s.predCount && s.actCount) ? Math.round(((s.actSum / s.actCount) - (s.predSum / s.predCount)) * 100) / 100 : null,
    above: s.above, met: s.met, below: s.below,
  })).sort((a, b) => (a.valueAdded ?? 0) - (b.valueAdded ?? 0))

  return NextResponse.json({
    valueAddedBySubject,
    gradeDistribution: { predicted: predDist, actual: actDist },
    discrepancies: ctx.canViewIndividualStudents ? severe : [],
    canViewDiscrepancies: ctx.canViewIndividualStudents,
  })
}
