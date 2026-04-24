import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import {
  listStaffCpd, currentAcademicYear, CPD_TYPE_LABELS, GTCS_LABELS,
  type CpdType, type GtcsStandard,
} from '@/lib/school/cpd'

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const url = new URL(req.url)
  const requestedStaffId = url.searchParams.get('staff_id') ?? ctx.staffId
  const ay = url.searchParams.get('academic_year') ?? currentAcademicYear()

  const isLeadership = ctx.isAdmin || ctx.role === 'depute' || ctx.role === 'head_teacher'
  if (requestedStaffId !== ctx.staffId && !isLeadership) {
    return NextResponse.json({ error: 'Cannot view another staff PRD without leadership role' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('school_staff')
    .select('id, full_name, role, department')
    .eq('id', requestedStaffId)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!staff) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const records = await listStaffCpd(admin, ctx.schoolId, { staffId: requestedStaffId, academicYear: ay })
  const totalHours = records.reduce((a, r: { hours: number | null }) => a + Number(r.hours ?? 0), 0)
  const byType = new Map<string, number>()
  for (const r of records as { cpd_type: string }[]) {
    byType.set(r.cpd_type, (byType.get(r.cpd_type) ?? 0) + 1)
  }
  const gtcsSet = new Set((records as { gtcs_standard: string | null }[]).map((r) => r.gtcs_standard).filter(Boolean) as GtcsStandard[])

  const html = `<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8" />
<title>PRD Summary — ${escapeHtml(staff.full_name)} — ${escapeHtml(ay)}</title>
<style>
  @page { size: A4; margin: 15mm; }
  @media print { .no-print { display: none !important; } }
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 20px; line-height: 1.45; font-size: 12pt; color: #111; }
  h1 { margin: 0 0 4px 0; font-size: 22pt; }
  h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-top: 20px; }
  h3 { font-size: 11pt; margin: 10px 0 4px; }
  .meta { color: #555; font-size: 10pt; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 10px 0; }
  .stat { border: 1px solid #ddd; padding: 8px; border-radius: 4px; }
  .stat b { display: block; font-size: 16pt; }
  .record { border: 1px solid #ddd; padding: 10px; border-radius: 4px; margin: 8px 0; page-break-inside: avoid; }
  .record h4 { margin: 0 0 4px; font-size: 11pt; }
  .record .badges { font-size: 9pt; color: #555; margin-bottom: 4px; }
  .record .reflection { font-size: 10pt; white-space: pre-wrap; }
  .button { display: inline-block; padding: 8px 14px; background: #1D4ED8; color: #fff; border: none; cursor: pointer; font-weight: 600; border-radius: 4px; }
</style></head><body>
<div class="no-print" style="text-align:right; margin-bottom:10px;">
  <button class="button" onclick="window.print()">Print / Save as PDF</button>
</div>
<h1>PRD Summary</h1>
<p class="meta">${escapeHtml(staff.full_name)} · ${escapeHtml(staff.role)}${staff.department ? ` · ${escapeHtml(staff.department)}` : ''} · Academic year ${escapeHtml(ay)}</p>

<h2>Professional learning this year</h2>
<div class="stats">
  <div class="stat"><b>${Math.round(totalHours * 10) / 10}</b>Total hours</div>
  <div class="stat"><b>${records.length}</b>CPD activities</div>
  <div class="stat"><b>${gtcsSet.size} / 3</b>GTCS standards addressed</div>
</div>

<h3>Types of CPD undertaken</h3>
<ul>
  ${Array.from(byType.entries())
    .map(([t, n]) => `<li>${escapeHtml(CPD_TYPE_LABELS[t as CpdType] ?? t)}: ${n}</li>`)
    .join('')}
</ul>

<h3>GTCS standards addressed</h3>
<ul>
  ${(['professional_values', 'professional_knowledge', 'professional_skills'] as GtcsStandard[])
    .map((s) => `<li>${escapeHtml(GTCS_LABELS[s])}: ${gtcsSet.has(s) ? 'yes' : '<em style="color:#b91c1c">no evidence yet</em>'}</li>`)
    .join('')}
</ul>

<h2>CPD activities</h2>
${records.length === 0
  ? '<p><em>No CPD recorded for this academic year.</em></p>'
  : (records as { id: string; title: string; provider: string | null; date_completed: string; hours: number | null; cpd_type: string; gtcs_standard: string | null; indicator: { indicator_code: string; indicator_name: string } | null; reflection: string | null; impact_on_practice: string | null }[])
    .map(
      (r) => `<div class="record">
        <h4>${escapeHtml(r.title)}${r.provider ? ` — ${escapeHtml(r.provider)}` : ''}</h4>
        <div class="badges">
          ${escapeHtml(r.date_completed)} · ${escapeHtml(CPD_TYPE_LABELS[r.cpd_type as CpdType] ?? r.cpd_type)} · ${r.hours ?? 0} hours
          ${r.gtcs_standard ? ` · ${escapeHtml(GTCS_LABELS[r.gtcs_standard as GtcsStandard])}` : ''}
          ${r.indicator ? ` · HGIOS4 QI ${escapeHtml(r.indicator.indicator_code)} ${escapeHtml(r.indicator.indicator_name)}` : ''}
        </div>
        ${r.reflection ? `<div class="reflection"><strong>Reflection:</strong> ${escapeHtml(r.reflection)}</div>` : ''}
        ${r.impact_on_practice ? `<div class="reflection"><strong>Impact on practice:</strong> ${escapeHtml(r.impact_on_practice)}</div>` : ''}
      </div>`,
    )
    .join('')}

</body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
