import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

function esc(s: unknown): string {
  if (s === null || s === undefined) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// GET /api/school/guidance/safeguarding/export?student_id=<id>
// Returns an HTML page formatted for the child-protection file (print to
// PDF in the browser). Each record viewed is logged as action='exported'
// in safeguarding_access_log.
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi({ mustViewSafeguarding: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const studentId = url.searchParams.get('student_id')
  if (!studentId) return NextResponse.json({ error: 'student_id required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, school_stage, registration_class, scn')
    .eq('id', studentId)
    .maybeSingle()
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: concerns } = await (admin as any)
    .from('safeguarding_concerns')
    .select('id, concern_type, description, immediate_actions_taken, escalation_level, escalated_at, outcome, resolved_at, created_at, reporter:reported_by(full_name, role), escalated_to_staff:escalated_to(full_name, role)')
    .eq('student_id', studentId)
    .eq('school_id', ctx.schoolId)
    .order('created_at', { ascending: true })

  const concernList = (concerns ?? []) as Array<{
    id: string
    concern_type: string
    description: string
    immediate_actions_taken: string | null
    escalation_level: string
    escalated_at: string | null
    outcome: string | null
    resolved_at: string | null
    created_at: string
    reporter: { full_name: string; role: string } | null
    escalated_to_staff: { full_name: string; role: string } | null
  }>

  // Log the export (one row per concern exported).
  if (concernList.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('safeguarding_access_log').insert(
      concernList.map((c) => ({ concern_id: c.id, accessed_by: ctx.staffId, action: 'exported' }))
    )
  }

  const fullName = `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim()

  const rows = concernList
    .map((c) => {
      const reporter = c.reporter ? `${esc(c.reporter.full_name)} (${esc(c.reporter.role)})` : 'unknown'
      const escalatedTo = c.escalated_to_staff ? `${esc(c.escalated_to_staff.full_name)} (${esc(c.escalated_to_staff.role)})` : '-'
      return `<section>
        <h3>${esc(c.created_at)} &mdash; ${esc(c.concern_type)}</h3>
        <p><strong>Reported by:</strong> ${reporter}</p>
        <p><strong>Escalation:</strong> ${esc(c.escalation_level)}${c.escalated_at ? ` on ${esc(c.escalated_at)}` : ''} &mdash; to ${escalatedTo}</p>
        <p><strong>Description:</strong><br>${esc(c.description)}</p>
        ${c.immediate_actions_taken ? `<p><strong>Immediate actions:</strong><br>${esc(c.immediate_actions_taken)}</p>` : ''}
        ${c.outcome ? `<p><strong>Outcome:</strong><br>${esc(c.outcome)}</p>` : ''}
        ${c.resolved_at ? `<p><strong>Resolved:</strong> ${esc(c.resolved_at)}</p>` : ''}
      </section>`
    })
    .join('<hr>')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Child Protection file &mdash; ${esc(fullName)}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #111; font-size: 12px; margin: 18mm; line-height: 1.45; }
    h1 { font-size: 18px; margin: 0 0 4px 0; }
    h2 { font-size: 14px; margin: 18px 0 6px 0; }
    h3 { font-size: 13px; margin: 10px 0 4px 0; }
    hr { border: 0; border-top: 1px dashed #aaa; margin: 12px 0; }
    .meta { color: #444; font-size: 11px; margin-bottom: 12px; }
    .print-btn { padding: 6px 10px; font-size: 12px; margin-bottom: 8px; }
    @media print { .no-print { display: none !important; } @page { size: A4; margin: 18mm; } }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>
  <h1>Child Protection file &mdash; ${esc(fullName)}</h1>
  <div class="meta">
    Stage ${esc(student.school_stage ?? '-')} &middot; Reg ${esc(student.registration_class ?? '-')} &middot; SCN ${esc(student.scn ?? '-')}<br>
    Exported ${esc(new Date().toISOString())} by ${esc(ctx.fullName)} (${esc(ctx.role)})
  </div>
  <h2>Safeguarding concerns (${concernList.length})</h2>
  ${concernList.length === 0 ? '<p>No concerns on record for this student.</p>' : rows}
</body>
</html>`

  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
