import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/reports?cycle_id=...&year_group=...
// Lists parent_reports rows for a cycle, plus the best recipient email
// resolved in priority order: first active linked parent -> student.
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const cycleId = url.searchParams.get('cycle_id')
  const yearGroup = url.searchParams.get('year_group')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (admin as any)
    .from('parent_reports')
    .select(
      `id, student_id, cycle_id, template_id, generated_at, emailed_at, emailed_to,
       students:student_id (id, first_name, last_name, school_stage, registration_class, email),
       tracking_cycles:cycle_id (name),
       report_templates:template_id (id, name)`
    )
    .eq('school_id', ctx.schoolId)
    .order('generated_at', { ascending: false })
  if (cycleId) q = q.eq('cycle_id', cycleId)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Row = {
    id: string
    student_id: string
    cycle_id: string
    template_id: string | null
    generated_at: string
    emailed_at: string | null
    emailed_to: string | null
    students: { first_name: string | null; last_name: string | null; school_stage: string | null; registration_class: string | null; email: string | null } | null
    tracking_cycles: { name: string } | null
    report_templates: { id: string; name: string } | null
  }
  let rows = (data ?? []) as Row[]
  if (yearGroup) rows = rows.filter((r) => r.students?.school_stage === yearGroup)

  // Resolve best recipient email per report. Prefer any active linked
  // parent; fall back to student's email on file.
  const studentIds = Array.from(new Set(rows.map((r) => r.student_id)))
  const parentEmailsByStudent = new Map<string, string>()
  if (studentIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: linkRows } = await (admin as any)
      .from('parent_student_links')
      .select('student_id, parents:parent_id(email)')
      .in('student_id', studentIds)
      .eq('status', 'active')
    type LinkRow = { student_id: string; parents: { email: string | null } | null }
    for (const lr of ((linkRows ?? []) as LinkRow[])) {
      const email = lr.parents?.email ?? null
      if (email && !parentEmailsByStudent.has(lr.student_id)) parentEmailsByStudent.set(lr.student_id, email)
    }
  }

  const enriched = rows.map((r) => ({
    ...r,
    best_email: parentEmailsByStudent.get(r.student_id) ?? r.students?.email ?? null,
    best_email_source: parentEmailsByStudent.has(r.student_id) ? 'parent' : r.students?.email ? 'student' : null,
  }))

  return NextResponse.json({ reports: enriched })
}
