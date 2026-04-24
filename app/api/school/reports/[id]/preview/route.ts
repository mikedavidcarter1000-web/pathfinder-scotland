import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { renderReportHtml } from '@/lib/school/render-report'

export const runtime = 'nodejs'

// GET /api/school/reports/[id]/preview
// Returns the rendered HTML, either as HTML (text/html) when ?as=html, or
// as JSON { html } by default.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: report } = await (admin as any)
    .from('parent_reports')
    .select('id, report_data, template_id')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: template } = await (admin as any)
    .from('report_templates')
    .select('template_html')
    .eq('id', report.template_id)
    .maybeSingle()
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  const html = renderReportHtml(template.template_html as string, report.report_data)
  const url = new URL(req.url)
  if (url.searchParams.get('as') === 'html') {
    return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
  }
  return NextResponse.json({ html })
}
