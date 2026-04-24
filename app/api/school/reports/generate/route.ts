import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import {
  effortColour,
  gradeColour,
  onTrackColour,
  type ReportData,
} from '@/lib/school/render-report'

export const runtime = 'nodejs'

// POST /api/school/reports/generate
// Body: { cycle_id: string, year_group?: string, student_ids?: string[] }
// Compiles tracking data for each student into a parent_reports row with a
// JSONB data payload ready for rendering. Returns summary counts.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    cycle_id?: unknown
    year_group?: unknown
    student_ids?: unknown
    template_id?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const cycleId = typeof body.cycle_id === 'string' ? body.cycle_id : ''
  const yearGroup = typeof body.year_group === 'string' && body.year_group.trim() ? body.year_group.trim() : null
  const explicitIds = Array.isArray(body.student_ids) ? body.student_ids.filter((v): v is string => typeof v === 'string') : null
  const templateIdIn = typeof body.template_id === 'string' && body.template_id.trim() ? body.template_id.trim() : null
  if (!cycleId) return NextResponse.json({ error: 'cycle_id required' }, { status: 400 })

  // Load cycle, school, template in parallel. Template defaults to the
  // school's is_default=true template when not explicitly provided.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templateQuery = templateIdIn
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('report_templates').select('*').eq('id', templateIdIn).eq('school_id', ctx.schoolId).maybeSingle()
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('report_templates').select('*').eq('school_id', ctx.schoolId).eq('is_default', true).maybeSingle()

  const [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cycleR,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schoolR,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    templateR,
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('tracking_cycles').select('*').eq('id', cycleId).eq('school_id', ctx.schoolId).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('schools').select('id, name').eq('id', ctx.schoolId).maybeSingle(),
    templateQuery,
  ])
  const cycle = cycleR.data
  const school = schoolR.data
  const template = templateR.data
  if (!cycle || !school || !template) {
    return NextResponse.json({ error: 'Cycle / school / template not found.' }, { status: 404 })
  }

  // Resolve target students
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: linkRows } = await (admin as any)
    .from('school_student_links')
    .select('student_id, students:student_id (id, first_name, last_name, school_stage, registration_class, house_group)')
    .eq('school_id', ctx.schoolId)
  type StudentRow = {
    id: string
    first_name: string | null
    last_name: string | null
    school_stage: string | null
    registration_class: string | null
    house_group: string | null
  }
  let students: StudentRow[] = ((linkRows ?? []) as Array<{ student_id: string; students: StudentRow | null }>)
    .map((r) => r.students)
    .filter((s): s is StudentRow => !!s)
  if (explicitIds && explicitIds.length > 0) {
    const ids = new Set(explicitIds)
    students = students.filter((s) => ids.has(s.id))
  }
  if (yearGroup) students = students.filter((s) => s.school_stage === yearGroup)
  if (students.length === 0) {
    return NextResponse.json({ error: 'No students match the filter.' }, { status: 400 })
  }

  // Pull all tracking entries for this cycle + the class → subject join
  const studentIdList = students.map((s) => s.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: entries } = await (admin as any)
    .from('tracking_entries')
    .select(
      `student_id, working_grade, on_track, effort, custom_metrics, comment,
       class_assignments:class_assignment_id (id, subject_id, subjects:subject_id(name))`
    )
    .eq('cycle_id', cycleId)
    .in('student_id', studentIdList)

  type EntryRow = {
    student_id: string
    working_grade: string | null
    on_track: string | null
    effort: string | null
    custom_metrics: Record<string, string | null> | null
    comment: string | null
    class_assignments: { id: string; subject_id: string | null; subjects: { name: string } | null } | null
  }

  // Custom metric definitions (for report header)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: metrics } = await (admin as any)
    .from('school_tracking_metrics')
    .select('metric_name, metric_key')
    .eq('school_id', ctx.schoolId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const metricDefs = (metrics ?? []) as Array<{ metric_name: string; metric_key: string }>
  const generatedDate = new Date().toLocaleDateString('en-GB')

  // Group entries by student
  const byStudent = new Map<string, EntryRow[]>()
  for (const e of (entries ?? []) as EntryRow[]) {
    const list = byStudent.get(e.student_id) ?? []
    list.push(e)
    byStudent.set(e.student_id, list)
  }

  const reportsToInsert = students.map((s) => {
    const studentEntries = (byStudent.get(s.id) ?? []).filter((e) => e.class_assignments?.subjects?.name)
    const subjectsData = studentEntries.map((e) => ({
      subject_name: e.class_assignments?.subjects?.name ?? '—',
      working_grade: e.working_grade,
      grade_colour: gradeColour(e.working_grade),
      on_track: e.on_track ? e.on_track.replace('_', ' ') : null,
      on_track_colour: onTrackColour(e.on_track),
      effort: e.effort,
      effort_colour: effortColour(e.effort),
      comment: e.comment ?? '',
      custom_values: metricDefs.map((m) => (e.custom_metrics?.[m.metric_key] as string | undefined) ?? ''),
    }))
    const data: ReportData = {
      school_name: school.name,
      school_logo: (template.school_logo_url as string | null) ?? '',
      header_colour: (template.header_colour as string) ?? '#1B3A5C',
      cycle_name: cycle.name,
      student_name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || 'Student',
      year_group: s.school_stage ?? '',
      registration_class: s.registration_class ?? '',
      subjects: subjectsData,
      custom_metrics_present: metricDefs.length > 0,
      custom_metric_names: metricDefs.map((m) => m.metric_name),
      generated_date: generatedDate,
    }
    return {
      school_id: ctx.schoolId,
      student_id: s.id,
      cycle_id: cycleId,
      template_id: template.id,
      report_data: data,
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error } = await (admin as any)
    .from('parent_reports')
    .insert(reportsToInsert)
    .select('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fire an in-app notification for each affected parent so they see the
  // report surfaced in their bell. Emails still go out through the
  // send-all flow; this is the in-app companion.
  try {
    const { sendSchoolNotification } = await import('@/lib/school/notifications')
    const coveredStudentIds = students.map((s) => s.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parentLinks } = await (admin as any)
      .from('parent_student_links')
      .select('parent_id')
      .in('student_id', coveredStudentIds)
      .eq('status', 'active')
    const parentIds = Array.from(
      new Set(
        ((parentLinks ?? []) as Array<{ parent_id: string | null }>)
          .map((r) => r.parent_id)
          .filter((v): v is string => !!v)
      )
    )
    if (parentIds.length > 0) {
      await sendSchoolNotification({
        admin,
        schoolId: ctx.schoolId,
        type: 'report_ready',
        title: `${cycle.name} reports available`,
        body: `Tracking reports for ${cycle.name} have been generated and are ready to view on your Pathfinder dashboard.`,
        targetParentIds: parentIds,
        channel: 'in_app',
        createdBy: ctx.userId,
      })
    }
  } catch {
    // Notifications are a best-effort signal; do not fail the generate call.
  }

  return NextResponse.json({ ok: true, generated: inserted?.length ?? 0 })
}
