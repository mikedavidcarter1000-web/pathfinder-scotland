import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { renderReportHtml } from '@/lib/school/render-report'

export const runtime = 'nodejs'

// POST /api/school/reports/send-all
// Body: { cycle_id?: string, year_group?: string, report_ids?: string[] }
// Sends every not-yet-emailed report in the selection, capped to 10
// requests per second to stay under Resend's free-tier rate limit.
// Returns { sent, skipped_no_email, failed, already_sent }.
export async function POST(req: Request) {
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

  const body = (await req.json().catch(() => ({}))) as {
    cycle_id?: unknown
    year_group?: unknown
    report_ids?: unknown
  }
  const cycleId = typeof body.cycle_id === 'string' ? body.cycle_id : null
  const yearGroup = typeof body.year_group === 'string' && body.year_group ? body.year_group : null
  const explicitIds = Array.isArray(body.report_ids)
    ? body.report_ids.filter((v): v is string => typeof v === 'string')
    : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (admin as any)
    .from('parent_reports')
    .select(
      `id, student_id, template_id, emailed_at, report_data,
       students:student_id(email, school_stage)`
    )
    .eq('school_id', ctx.schoolId)
    .is('emailed_at', null)
  if (cycleId) q = q.eq('cycle_id', cycleId)
  if (explicitIds && explicitIds.length) q = q.in('id', explicitIds)

  const { data: reports, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Row = {
    id: string
    student_id: string
    template_id: string | null
    emailed_at: string | null
    report_data: Record<string, unknown>
    students: { email: string | null; school_stage: string | null } | null
  }
  let rows = (reports ?? []) as Row[]
  if (yearGroup) rows = rows.filter((r) => r.students?.school_stage === yearGroup)

  if (rows.length === 0) {
    return NextResponse.json({ sent: 0, skipped_no_email: 0, failed: 0, already_sent: 0, total: 0 })
  }

  // Preload templates once.
  const templateIds = Array.from(new Set(rows.map((r) => r.template_id).filter((v): v is string => !!v)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: templates } = await (admin as any)
    .from('report_templates')
    .select('id, template_html')
    .in('id', templateIds.length > 0 ? templateIds : ['00000000-0000-0000-0000-000000000000'])
  const templateHtmlById = new Map<string, string>()
  for (const t of ((templates ?? []) as Array<{ id: string; template_html: string }>)) {
    templateHtmlById.set(t.id, t.template_html)
  }

  // Preload parent emails in one query.
  const studentIds = Array.from(new Set(rows.map((r) => r.student_id)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: parentLinks } = await (admin as any)
    .from('parent_student_links')
    .select('student_id, parents:parent_id(email)')
    .in('student_id', studentIds)
    .eq('status', 'active')
  const parentEmailByStudent = new Map<string, string>()
  type LinkRow = { student_id: string; parents: { email: string | null } | null }
  for (const lr of ((parentLinks ?? []) as LinkRow[])) {
    if (lr.parents?.email && !parentEmailByStudent.has(lr.student_id)) {
      parentEmailByStudent.set(lr.student_id, lr.parents.email)
    }
  }

  const fromAddress = process.env.RESEND_FROM_ADDRESS ?? 'noreply@pathfinderscot.co.uk'
  const fromName = process.env.RESEND_FROM_NAME ?? 'Pathfinder Scotland'

  // Rate-limit: at most 10 requests per second. Simple per-10-batch
  // window -- start a batch, send up to 10 in parallel, wait for the 1s
  // tick before the next batch.
  const BATCH = 10
  const WINDOW_MS = 1000
  let sent = 0
  let failed = 0
  let skippedNoEmail = 0
  let alreadySent = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH)
    const windowStart = Date.now()
    const results = await Promise.all(
      slice.map(async (r) => {
        if (r.emailed_at) {
          alreadySent += 1
          return { ok: true }
        }
        const recipient = parentEmailByStudent.get(r.student_id) ?? r.students?.email ?? ''
        if (!recipient) {
          skippedNoEmail += 1
          return { ok: false, reason: 'no_email' }
        }
        const tmpl = r.template_id ? templateHtmlById.get(r.template_id) : null
        if (!tmpl) {
          failed += 1
          return { ok: false, reason: 'no_template' }
        }
        const html = renderReportHtml(tmpl, r.report_data as never)
        const data = r.report_data as { school_name?: string; cycle_name?: string; student_name?: string }
        const subject = `${data.school_name ?? 'School'} · ${data.cycle_name ?? 'Report'} · ${data.student_name ?? 'Student'}`
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({ from: `${fromName} <${fromAddress}>`, to: [recipient], subject, html }),
        })
        if (!resp.ok) {
          failed += 1
          return { ok: false, reason: 'resend_error' }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from('parent_reports')
          .update({ emailed_at: new Date().toISOString(), emailed_to: recipient })
          .eq('id', r.id)
          .eq('school_id', ctx.schoolId)
        sent += 1
        return { ok: true }
      })
    )
    // Settle the results (ensure linter sees the use).
    void results
    const elapsed = Date.now() - windowStart
    if (i + BATCH < rows.length && elapsed < WINDOW_MS) {
      await new Promise((r) => setTimeout(r, WINDOW_MS - elapsed))
    }
  }

  return NextResponse.json({
    sent,
    skipped_no_email: skippedNoEmail,
    failed,
    already_sent: alreadySent,
    total: rows.length,
  })
}
