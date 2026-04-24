import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import {
  getAttainmentMeasures,
  getAttainmentTrend,
  getSimdGap,
  getCesCapacities,
  getAttendanceCorrelation,
  getDashboardAlerts,
} from '@/lib/school/analytics'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Board report is leadership-only' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const academicYear = searchParams.get('academic_year') ?? new Date().getFullYear().toString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any).from('schools').select('name, local_authority').eq('id', ctx.schoolId).maybeSingle()
  const trend = await getAttainmentTrend(admin, ctx.schoolId)
  const simd = await getSimdGap(admin, ctx.schoolId)
  const ces = await getCesCapacities(admin, ctx.schoolId)
  const attendance = await getAttendanceCorrelation(admin, ctx.schoolId)
  const alerts = await getDashboardAlerts(admin, ctx.schoolId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: priorities } = await (admin as any).from('sip_priorities').select('id, priority_number, title, status, baseline_value, current_value, target_value').eq('school_id', ctx.schoolId).eq('academic_year', academicYear).order('priority_number', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pefAlloc } = await (admin as any).from('pef_allocations').select('id, total_allocation, academic_year').eq('school_id', ctx.schoolId).eq('academic_year', academicYear).maybeSingle()
  let pefSpendTotal = 0; let pefSpendCount = 0
  if (pefAlloc?.id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: spend } = await (admin as any).from('pef_spend').select('amount').eq('allocation_id', pefAlloc.id)
    pefSpendTotal = (spend ?? []).reduce((a: number, b: { amount: number | string }) => a + Number(b.amount), 0)
    pefSpendCount = (spend ?? []).length
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any).from('school_student_links').select('student_id').eq('school_id', ctx.schoolId)
  const ids = (links ?? []).map((l: { student_id: string }) => l.student_id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: activeUsers } = ids.length ? await (admin as any).from('saved_courses').select('student_id', { count: 'exact', head: true }).in('student_id', ids) : { count: 0 }

  const q1 = simd.find((r) => r.simd_quintile === 1)
  const q5 = simd.find((r) => r.simd_quintile === 5)
  const gap = (q5 && q1) ? Math.round((q5.n5_5plus_ac_pct - q1.n5_5plus_ac_pct) * 10) / 10 : 0

  const today = new Date().toLocaleDateString('en-GB')
  const previousAttainment = trend.previous
  const deltaN5 = previousAttainment ? Math.round((trend.current.n5_5plus_ac_pct - previousAttainment.n5_5plus_ac_pct) * 10) / 10 : null
  const deltaHigher = previousAttainment ? Math.round((trend.current.higher_3plus_ac_pct - previousAttainment.higher_3plus_ac_pct) * 10) / 10 : null

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Board report – ${escapeHtml(school?.name ?? 'School')}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11pt; color: #1f2937; line-height: 1.4; }
    h1 { font-size: 22pt; margin: 0 0 4pt 0; }
    h2 { font-size: 14pt; margin-top: 16pt; page-break-after: avoid; border-bottom: 1pt solid #cbd5e1; padding-bottom: 4pt; }
    h3 { font-size: 12pt; margin-top: 12pt; page-break-after: avoid; }
    .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8pt; margin: 8pt 0; }
    .metric { background: #f8fafc; padding: 10pt; border-radius: 4pt; }
    .metric .label { font-size: 9pt; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.04em; }
    .metric .value { font-size: 22pt; font-weight: 700; }
    .metric .delta { font-size: 10pt; margin-top: 2pt; }
    .metric .up { color: #059669; }
    .metric .down { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 6pt 0; }
    th { text-align: left; border-bottom: 1pt solid #cbd5e1; padding: 4pt; }
    td { padding: 4pt; border-bottom: 1pt solid #f1f5f9; }
    .meta { opacity: 0.7; font-size: 10pt; }
    button.print { background: #1d4ed8; color: white; border: none; padding: 8pt 14pt; border-radius: 4pt; font-weight: 600; cursor: pointer; }
    @media print { button.print { display: none; } }
  </style></head><body>
    <h1>${escapeHtml(school?.name ?? 'School')}</h1>
    <p class="meta">${escapeHtml(school?.local_authority ?? '')} · Board report · Academic year ${escapeHtml(academicYear)} · Prepared ${today}</p>
    <button class="print" onclick="window.print()">Print / Save as PDF</button>

    <h2>Key measures</h2>
    <div class="metric-grid">
      <div class="metric"><div class="label">5+ N5 A-C</div><div class="value">${trend.current.n5_5plus_ac_pct}%</div>${deltaN5 !== null ? `<div class="delta ${deltaN5 >= 0 ? 'up' : 'down'}">${deltaN5 >= 0 ? '+' : ''}${deltaN5}pp vs previous</div>` : ''}</div>
      <div class="metric"><div class="label">3+ Higher A-C</div><div class="value">${trend.current.higher_3plus_ac_pct}%</div>${deltaHigher !== null ? `<div class="delta ${deltaHigher >= 0 ? 'up' : 'down'}">${deltaHigher >= 0 ? '+' : ''}${deltaHigher}pp vs previous</div>` : ''}</div>
      <div class="metric"><div class="label">1+ Advanced Higher</div><div class="value">${trend.current.ah_1plus_pct}%</div></div>
      <div class="metric"><div class="label">Students in cohort</div><div class="value">${trend.current.total_students}</div></div>
      <div class="metric"><div class="label">Platform engagement</div><div class="value">${activeUsers ?? 0}</div><div class="meta">courses saved across cohort</div></div>
      <div class="metric"><div class="label">Interventions overdue</div><div class="value">${alerts.interventions_overdue}</div></div>
    </div>

    <h2>Equity snapshot</h2>
    <p>SIMD attainment gap (5+ N5 A-C, Q5 − Q1): <strong>${gap}pp</strong></p>
    <table>
      <thead><tr><th>Quintile</th><th>Students</th><th>5+ N5 A-C</th><th>3+ Higher A-C</th><th>Avg tariff</th></tr></thead>
      <tbody>
        ${simd.map((r) => `<tr><td>Q${r.simd_quintile}</td><td>${r.student_count}</td><td>${r.n5_5plus_ac_pct}%</td><td>${r.higher_3plus_ac_pct}%</td><td>${r.avg_tariff_points}</td></tr>`).join('')}
      </tbody>
    </table>

    <h2>Attendance</h2>
    <table>
      <thead><tr><th>Band</th><th>Students</th><th>Avg grade</th><th>% on track</th></tr></thead>
      <tbody>
        ${attendance.map((r) => `<tr><td>${r.attendance_band}</td><td>${r.student_count}</td><td>${r.avg_working_grade_numeric.toFixed(2)}</td><td>${r.on_track_pct}%</td></tr>`).join('')}
      </tbody>
    </table>

    <h2>Career Education Standard (CES)</h2>
    <div class="metric-grid">
      <div class="metric"><div class="label">Self</div><div class="value">${ces.self.score}/100</div></div>
      <div class="metric"><div class="label">Strengths</div><div class="value">${ces.strengths.score}/100</div></div>
      <div class="metric"><div class="label">Horizons</div><div class="value">${ces.horizons.score}/100</div></div>
      <div class="metric"><div class="label">Networks</div><div class="value">${ces.networks.score}/100</div></div>
    </div>

    <h2>School Improvement Plan progress</h2>
    ${(priorities ?? []).length === 0 ? '<p>No SIP priorities recorded for this academic year.</p>' : `
    <table>
      <thead><tr><th>#</th><th>Title</th><th>Baseline</th><th>Current</th><th>Target</th><th>Status</th></tr></thead>
      <tbody>
        ${(priorities ?? []).map((p: { priority_number: number; title: string; baseline_value: number | null; current_value: number | null; target_value: number | null; status: string }) => `<tr><td>${p.priority_number}</td><td>${escapeHtml(p.title)}</td><td>${p.baseline_value ?? '—'}</td><td><strong>${p.current_value ?? '—'}</strong></td><td>${p.target_value ?? '—'}</td><td>${escapeHtml((p.status ?? 'in_progress').replace(/_/g, ' '))}</td></tr>`).join('')}
      </tbody>
    </table>`}

    <h2>PEF summary</h2>
    ${pefAlloc ? `<p>PEF allocation ${escapeHtml(pefAlloc.academic_year)}: <strong>£${Number(pefAlloc.total_allocation).toLocaleString()}</strong>. Spent: £${pefSpendTotal.toLocaleString()} across ${pefSpendCount} interventions.</p>` : '<p>No PEF allocation recorded.</p>'}
  </body></html>`

  return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}
