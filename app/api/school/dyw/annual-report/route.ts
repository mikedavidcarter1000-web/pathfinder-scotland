import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import {
  getDywOverview,
  getSectorCoverage,
  getNetworksCapacity,
  currentAcademicYear,
  academicYearRange,
  PLACEMENT_TYPE_LABELS,
  STATUS_LABELS,
  type PlacementType,
  type EmployerStatus,
} from '@/lib/school/dyw'

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET() {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const [overview, sectors, networks] = await Promise.all([
    getDywOverview(admin, ctx.schoolId),
    getSectorCoverage(admin, ctx.schoolId),
    getNetworksCapacity(admin, ctx.schoolId),
  ])

  const { data: school } = await (admin as unknown as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: { name: string | null } | null }> } } } })
    .from('schools')
    .select('name')
    .eq('id', ctx.schoolId)
    .maybeSingle()
  const schoolName = school?.name ?? 'School'

  const ay = currentAcademicYear()
  const { start, end } = academicYearRange(ay)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: placements } = await (admin as any)
    .from('work_placements')
    .select('status, placement_type, is_group_event, student_id, group_student_count')
    .eq('school_id', ctx.schoolId)
    .gte('start_date', start)
    .lte('start_date', end)
  const rows = placements ?? []

  const byType = new Map<string, number>()
  for (const r of rows) {
    byType.set(r.placement_type, (byType.get(r.placement_type) ?? 0) + 1)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: employers } = await (admin as any)
    .from('employer_contacts')
    .select('relationship_status')
    .eq('school_id', ctx.schoolId)
  const byStatus = new Map<string, number>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const e of (employers ?? [])) {
    byStatus.set(e.relationship_status, (byStatus.get(e.relationship_status) ?? 0) + 1)
  }

  const generatedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<title>DYW Annual Report — ${escapeHtml(schoolName)} — ${escapeHtml(ay)}</title>
<style>
  @page { size: A4; margin: 15mm; }
  @media print { .no-print { display: none !important; } }
  body { font-family: system-ui, sans-serif; color: #111; max-width: 720px; margin: 0 auto; padding: 20px; line-height: 1.45; font-size: 12pt; }
  h1 { font-size: 22pt; margin: 0 0 4px 0; }
  h2 { font-size: 14pt; margin: 18px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
  h3 { font-size: 12pt; margin: 12px 0 6px; }
  .meta { color: #555; font-size: 10pt; }
  .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 10px 0; }
  .stat { border: 1px solid #ddd; padding: 8px 10px; border-radius: 4px; }
  .stat b { font-size: 14pt; display: block; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5pt; margin: 6px 0; }
  th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; }
  .score { font-size: 24pt; font-weight: 700; color: #1D4ED8; }
  .button { display: inline-block; padding: 8px 14px; background: #1D4ED8; color: #fff; border: none; cursor: pointer; font-weight: 600; border-radius: 4px; }
</style>
</head>
<body>
<div class="no-print" style="text-align:right; margin-bottom:10px;">
  <button class="button" onclick="window.print()">Print / Save as PDF</button>
</div>
<h1>DYW Annual Report</h1>
<p class="meta">${escapeHtml(schoolName)} · Academic year ${escapeHtml(ay)} · Generated ${escapeHtml(generatedAt)}</p>

<h2>Headline</h2>
<div class="stats">
  <div class="stat"><b>${overview.active_partners}</b>Active employer partners</div>
  <div class="stat"><b>${overview.placements_completed_this_year}</b>Placements completed this year</div>
  <div class="stat"><b>${overview.distinct_students_placed}</b>Distinct students placed (${overview.student_reach_pct}% of cohort)</div>
  <div class="stat"><b>${overview.sectors_covered} / 19</b>Career sectors with active partners</div>
  <div class="stat"><b>${overview.average_student_rating ?? 'n/a'}</b>Average student feedback rating (out of 5)</div>
  <div class="stat"><b>${overview.average_employer_rating ?? 'n/a'}</b>Average employer feedback rating (out of 5)</div>
</div>

<h2>CES Networks capacity</h2>
<p><span class="score">${networks.score}</span> / 100</p>
<p>${escapeHtml(networks.evidence_statement)}</p>

<h2>Employer contacts by status</h2>
<table>
  <thead><tr><th>Status</th><th>Count</th></tr></thead>
  <tbody>
    ${(['identified','contacted','engaged','active_partner','dormant'] as EmployerStatus[]).map((s) =>
      `<tr><td>${escapeHtml(STATUS_LABELS[s])}</td><td>${byStatus.get(s) ?? 0}</td></tr>`,
    ).join('')}
  </tbody>
</table>

<h2>Placements by type (${escapeHtml(ay)})</h2>
<table>
  <thead><tr><th>Type</th><th>Count</th></tr></thead>
  <tbody>
    ${(Object.keys(PLACEMENT_TYPE_LABELS) as PlacementType[]).map((t) =>
      `<tr><td>${escapeHtml(PLACEMENT_TYPE_LABELS[t])}</td><td>${byType.get(t) ?? 0}</td></tr>`,
    ).join('')}
  </tbody>
</table>

<h2>Sector coverage</h2>
<table>
  <thead><tr><th>Sector</th><th>Active</th><th>Engaged</th><th>Total contacts</th><th>Placements (year)</th></tr></thead>
  <tbody>
    ${sectors.map((s) =>
      `<tr><td>${escapeHtml(s.name)}</td><td>${s.active_partners}</td><td>${s.engaged_partners}</td><td>${s.total_contacts}</td><td>${s.placements_this_year}</td></tr>`,
    ).join('')}
  </tbody>
</table>

<h2>Evidence for inspection (QI 3.3: Increasing creativity and employability)</h2>
<p>${escapeHtml(networks.evidence_statement)}</p>
<p>Student feedback ratings averaged ${overview.average_student_rating ?? 'not yet available'}; employer feedback ratings averaged ${overview.average_employer_rating ?? 'not yet available'}. DYW tracking is continuous across the academic year.</p>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
