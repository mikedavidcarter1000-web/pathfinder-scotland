import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { renderReportHtml } from '@/lib/school/render-report'

export const runtime = 'nodejs'

// POST /api/school/reports/[id]/send
// Body: { to?: string }  — override the auto-resolved recipient address.
// Uses Resend HTTP API via fetch (no SDK install). Requires RESEND_API_KEY.
// Sends the rendered HTML as the email body.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json(
      { error: 'Email is not configured. Ask an admin to set RESEND_API_KEY.' },
      { status: 500 }
    )
  }

  const body = (await req.json().catch(() => ({}))) as { to?: unknown }
  const overrideTo = typeof body.to === 'string' ? body.to.trim() : ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: report } = await (admin as any)
    .from('parent_reports')
    .select('id, report_data, student_id, template_id')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  // Resolve recipient. Priority: explicit override -> any active linked
  // parent email -> student's email on file. Parent emails are preferred
  // because parent reports are fundamentally addressed to parents /
  // guardians; we fall back to the student only when no active parent is
  // linked yet.
  let recipient = overrideTo
  if (!recipient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parentLinks } = await (admin as any)
      .from('parent_student_links')
      .select('parents:parent_id(email)')
      .eq('student_id', report.student_id)
      .eq('status', 'active')
      .limit(1)
    const parentEmail = (parentLinks ?? [])
      .map((r: { parents: { email: string | null } | null }) => r.parents?.email ?? null)
      .find((v: string | null) => !!v)
    if (parentEmail) recipient = parentEmail as string
  }
  if (!recipient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: student } = await (admin as any)
      .from('students')
      .select('email, first_name, last_name')
      .eq('id', report.student_id)
      .maybeSingle()
    recipient = (student?.email as string | null) ?? ''
  }
  if (!recipient) {
    return NextResponse.json({ error: 'No recipient email found. Provide one in the to field.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: template } = await (admin as any)
    .from('report_templates')
    .select('template_html')
    .eq('id', report.template_id)
    .maybeSingle()
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  const html = renderReportHtml(template.template_html as string, report.report_data)
  const reportData = report.report_data as { school_name?: string; cycle_name?: string; student_name?: string }
  const subject = `${reportData.school_name ?? 'School'} · ${reportData.cycle_name ?? 'Report'} · ${reportData.student_name ?? 'Student'}`
  const fromAddress = process.env.RESEND_FROM_ADDRESS ?? 'noreply@pathfinderscot.co.uk'
  const fromName = process.env.RESEND_FROM_NAME ?? 'Pathfinder Scotland'

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: `${fromName} <${fromAddress}>`,
      to: [recipient],
      subject,
      html,
    }),
  })

  if (!resp.ok) {
    const errJson = await resp.json().catch(() => ({}))
    return NextResponse.json({ error: errJson?.message ?? 'Resend error.' }, { status: 502 })
  }

  // Mark as sent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from('parent_reports')
    .update({ emailed_at: new Date().toISOString(), emailed_to: recipient })
    .eq('id', id)
    .eq('school_id', ctx.schoolId)

  return NextResponse.json({ ok: true, sent_to: recipient })
}
