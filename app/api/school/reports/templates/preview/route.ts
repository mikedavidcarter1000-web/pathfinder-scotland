import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { effortColour, gradeColour, onTrackColour, renderReportHtml, type ReportData } from '@/lib/school/render-report'

export const runtime = 'nodejs'

// POST /api/school/reports/templates/preview
// Body: { template_html: string, header_colour?: string, school_logo_url?: string | null }
// Renders the template against a stock sample student so template editors can
// see the live output without generating a real report.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    template_html?: unknown
    header_colour?: unknown
    school_logo_url?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const templateHtml = typeof body.template_html === 'string' ? body.template_html : ''
  const headerColour = typeof body.header_colour === 'string' ? body.header_colour : '#1B3A5C'
  const logo = typeof body.school_logo_url === 'string' && body.school_logo_url.trim() ? body.school_logo_url.trim() : ''
  if (!templateHtml) return NextResponse.json({ error: 'template_html required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('name')
    .eq('id', ctx.schoolId)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: metricDefs } = await (admin as any)
    .from('school_tracking_metrics')
    .select('metric_name, metric_key')
    .eq('school_id', ctx.schoolId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const metrics = (metricDefs ?? []) as Array<{ metric_name: string; metric_key: string }>

  const sample: ReportData & { attendance_pct?: string; ucas_tariff?: string; guidance_teacher_name?: string } = {
    school_name: school?.name ?? 'Sample High School',
    school_logo: logo,
    header_colour: headerColour,
    cycle_name: 'Sample Cycle',
    student_name: 'Alex Example',
    year_group: 'S5',
    registration_class: '5A1',
    subjects: [
      { subject_name: 'Mathematics', working_grade: 'A', grade_colour: gradeColour('A'), on_track: 'above', on_track_colour: onTrackColour('above'), effort: 'excellent', effort_colour: effortColour('excellent'), comment: 'Consistent, careful work. Well on track for an A pass.', custom_values: metrics.map(() => 'Good') },
      { subject_name: 'English', working_grade: 'B', grade_colour: gradeColour('B'), on_track: 'on_track', on_track_colour: onTrackColour('on_track'), effort: 'good', effort_colour: effortColour('good'), comment: 'Strong essays; should keep focus on timed responses.', custom_values: metrics.map(() => 'Good') },
      { subject_name: 'Physics', working_grade: 'B', grade_colour: gradeColour('B'), on_track: 'on_track', on_track_colour: onTrackColour('on_track'), effort: 'good', effort_colour: effortColour('good'), comment: 'Practical work very strong; revise equations before the prelim.', custom_values: metrics.map(() => 'Good') },
      { subject_name: 'History', working_grade: 'C', grade_colour: gradeColour('C'), on_track: 'below', on_track_colour: onTrackColour('below'), effort: 'satisfactory', effort_colour: effortColour('satisfactory'), comment: 'Engagement has dipped; attend supported study.', custom_values: metrics.map(() => 'Satisfactory') },
      { subject_name: 'Graphic Communication', working_grade: 'A', grade_colour: gradeColour('A'), on_track: 'above', on_track_colour: onTrackColour('above'), effort: 'excellent', effort_colour: effortColour('excellent'), comment: 'Portfolio outstanding.', custom_values: metrics.map(() => 'Excellent') },
    ],
    custom_metrics_present: metrics.length > 0,
    custom_metric_names: metrics.map((m) => m.metric_name),
    generated_date: new Date().toLocaleDateString('en-GB'),
    attendance_pct: '94.2',
    ucas_tariff: '120',
    guidance_teacher_name: 'Ms. Campbell',
  }

  const html = renderReportHtml(templateHtml, sample)
  return NextResponse.json({ html })
}
