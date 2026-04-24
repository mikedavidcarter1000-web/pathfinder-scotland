import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/tracking/summary — whole-school tracking summary for the
// dashboard tracking tab. Fast enough to load on dashboard hit.
export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // Current cycle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentCycle } = await (admin as any)
    .from('tracking_cycles')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .eq('is_current', true)
    .maybeSingle()

  if (!currentCycle) {
    return NextResponse.json({
      cycle: null,
      overall: { completion_pct: 0, expected: 0, actual: 0 },
      grade_distribution: {},
      key_measures: { n5_ca_pct: 0, higher_ca_pct: 0, ah_ca_pct: 0 },
      departments: [],
    })
  }

  // Classes + expected headcounts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classes } = await (admin as any)
    .from('class_assignments')
    .select('id, staff_id, qualification_type_id, qualification_types:qualification_type_id(short_name)')
    .eq('school_id', ctx.schoolId)

  const classIds = ((classes ?? []) as Array<{ id: string }>).map((c) => c.id)

  const headcounts = new Map<string, number>()
  if (classIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: csLinks } = await (admin as any)
      .from('class_students')
      .select('class_assignment_id')
      .in('class_assignment_id', classIds)
    for (const r of (csLinks ?? []) as Array<{ class_assignment_id: string }>) {
      headcounts.set(r.class_assignment_id, (headcounts.get(r.class_assignment_id) ?? 0) + 1)
    }
  }

  type ClsRow = { id: string; staff_id: string; qualification_type_id: string | null; qualification_types: { short_name: string } | null }
  const qualByClass = new Map<string, string>()
  for (const c of (classes ?? []) as ClsRow[]) {
    qualByClass.set(c.id, c.qualification_types?.short_name ?? '')
  }

  // Entries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: entries } = await (admin as any)
    .from('tracking_entries')
    .select('class_assignment_id, working_grade, on_track, effort, staff_id')
    .eq('cycle_id', currentCycle.id)

  const entriesArr = ((entries ?? []) as Array<Record<string, unknown>>)

  const expected = Array.from(headcounts.values()).reduce((a, b) => a + b, 0)
  const actual = entriesArr.length
  const completion = expected === 0 ? 0 : Math.round((actual / expected) * 100)

  // Grade distribution
  const gradeCounts: Record<string, number> = {}
  for (const e of entriesArr) {
    const g = (e.working_grade as string | null) ?? null
    if (g) gradeCounts[g] = (gradeCounts[g] ?? 0) + 1
  }

  // Key measures — A-C rate per qualification tier
  const tierTotals: Record<string, { ca: number; total: number }> = {}
  for (const e of entriesArr) {
    const cls = e.class_assignment_id as string
    const q = (qualByClass.get(cls) ?? '').toLowerCase()
    let bucket = 'other'
    if (q.includes('n5') || q.includes('national 5')) bucket = 'n5'
    else if (q.includes('advanced') || q.startsWith('ah')) bucket = 'ah'
    else if (q.startsWith('h') || q.includes('higher')) bucket = 'higher'
    const g = (e.working_grade as string | null) ?? null
    const isCA = g && ['A', 'B', 'C'].includes(g.toUpperCase())
    const store = (tierTotals[bucket] ??= { ca: 0, total: 0 })
    store.total += 1
    if (isCA) store.ca += 1
  }

  const keyPct = (k: string) => {
    const s = tierTotals[k]
    if (!s || s.total === 0) return 0
    return Math.round((s.ca / s.total) * 100)
  }

  // Per-department completion to highlight laggards
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('school_staff')
    .select('id, department, full_name')
    .eq('school_id', ctx.schoolId)
  const deptByStaff = new Map<string, string>()
  for (const s of (staff ?? []) as Array<{ id: string; department: string | null }>) {
    deptByStaff.set(s.id, s.department ?? '(No department)')
  }
  const expectedByDept = new Map<string, number>()
  const actualByDept = new Map<string, number>()
  for (const c of (classes ?? []) as ClsRow[]) {
    const dept = deptByStaff.get(c.staff_id) ?? '(No department)'
    expectedByDept.set(dept, (expectedByDept.get(dept) ?? 0) + (headcounts.get(c.id) ?? 0))
  }
  for (const e of entriesArr) {
    const classId = e.class_assignment_id as string
    const classStaffId = ((classes ?? []) as ClsRow[]).find((c) => c.id === classId)?.staff_id ?? null
    const dept = classStaffId ? deptByStaff.get(classStaffId) ?? '(No department)' : '(No department)'
    actualByDept.set(dept, (actualByDept.get(dept) ?? 0) + 1)
  }
  const departments = Array.from(expectedByDept.entries())
    .map(([dept, exp]) => ({
      department: dept,
      expected: exp,
      actual: actualByDept.get(dept) ?? 0,
      completion_pct: exp === 0 ? 0 : Math.round(((actualByDept.get(dept) ?? 0) / exp) * 100),
    }))
    .sort((a, b) => a.completion_pct - b.completion_pct)

  return NextResponse.json({
    cycle: currentCycle,
    overall: { completion_pct: completion, expected, actual },
    grade_distribution: gradeCounts,
    key_measures: {
      n5_ca_pct: keyPct('n5'),
      higher_ca_pct: keyPct('higher'),
      ah_ca_pct: keyPct('ah'),
    },
    departments,
  })
}
