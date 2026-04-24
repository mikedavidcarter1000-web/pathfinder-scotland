import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  const { searchParams } = new URL(req.url)
  const academicYear = searchParams.get('academic_year') ?? new Date().getFullYear().toString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any).from('schools').select('name, local_authority').eq('id', ctx.schoolId).maybeSingle()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: priorities } = await (admin as any).from('sip_priorities').select('*').eq('school_id', ctx.schoolId).eq('academic_year', academicYear).order('priority_number', { ascending: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: indicators } = await (admin as any).from('inspection_indicators').select('id, indicator_code, indicator_name')
    .eq('framework_name', 'HGIOS4')
  const indMap = new Map<string, { indicator_code: string; indicator_name: string }>((indicators ?? []).map((i: { id: string; indicator_code: string; indicator_name: string }) => [i.id, i]))

  const today = new Date().toLocaleDateString('en-GB')
  let html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SIP progress report</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11pt; color: #1f2937; line-height: 1.4; }
      h1 { font-size: 22pt; margin: 0 0 4pt 0; }
      h2 { font-size: 14pt; margin-top: 16pt; page-break-after: avoid; }
      .priority { border: 1pt solid #e5e7eb; padding: 10pt; margin: 8pt 0; border-radius: 4pt; page-break-inside: avoid; }
      .progress { background: #e5e7eb; height: 10pt; border-radius: 2pt; overflow: hidden; margin: 6pt 0; }
      .progress > div { background: #1d4ed8; height: 100%; }
      .meta { opacity: 0.7; font-size: 10pt; }
      .badge { display: inline-block; font-size: 9pt; padding: 2pt 6pt; border-radius: 3pt; background: #dbeafe; color: #1d4ed8; }
      button.print { background: #1d4ed8; color: white; border: none; padding: 8pt 14pt; border-radius: 4pt; font-weight: 600; cursor: pointer; }
      @media print { button.print { display: none; } }
    </style></head><body>
    <h1>${escapeHtml(school?.name ?? 'School')} — School Improvement Plan progress</h1>
    <p class="meta">Academic year ${escapeHtml(academicYear)} · Prepared ${today}</p>
    <button class="print" onclick="window.print()">Print / Save as PDF</button>
  `

  if ((priorities ?? []).length === 0) {
    html += `<p>No SIP priorities for ${escapeHtml(academicYear)}.</p>`
  } else {
    for (const p of priorities ?? []) {
      const ind = p.inspection_indicator_id ? indMap.get(p.inspection_indicator_id) : null
      const bl = p.baseline_value ?? 0
      const cv = p.current_value ?? bl
      const tv = p.target_value ?? bl
      const pct = tv !== bl ? Math.max(0, Math.min(100, ((cv - bl) / (tv - bl)) * 100)) : 0
      const narrative = `Priority ${p.priority_number}: ${p.title}. Baseline ${p.baseline_value ?? 'not set'}, current ${p.current_value ?? 'not set'}, target ${p.target_value ?? 'not set'}. Status: ${(p.status ?? 'in_progress').replace(/_/g, ' ')}.${ind ? ` Links to HGIOS4 QI ${ind.indicator_code} ${ind.indicator_name}.` : ''}`
      html += `<div class="priority">
        <h2>Priority ${p.priority_number}: ${escapeHtml(p.title)}</h2>
        ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ''}
        <div class="meta">Baseline ${escapeHtml(String(p.baseline_value ?? '—'))} · Current <strong>${escapeHtml(String(p.current_value ?? '—'))}</strong> · Target ${escapeHtml(String(p.target_value ?? '—'))}</div>
        <div class="progress"><div style="width: ${pct}%"></div></div>
        <p class="meta">Status: <strong>${escapeHtml((p.status ?? 'in_progress').replace(/_/g, ' '))}</strong></p>
        ${ind ? `<div class="badge">HGIOS4 QI ${escapeHtml(ind.indicator_code)} ${escapeHtml(ind.indicator_name)}</div>` : ''}
        <p class="meta" style="margin-top: 8pt; font-style: italic;">${escapeHtml(narrative)}</p>
      </div>`
    }
  }

  html += `</body></html>`
  return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}
