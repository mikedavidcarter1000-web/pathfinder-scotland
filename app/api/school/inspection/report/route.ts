import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET() {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Inspection report is leadership-only' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any).from('schools').select('name, local_authority').eq('id', ctx.schoolId).maybeSingle()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: indicators } = await (admin as any).from('inspection_indicators').select('id, indicator_code, indicator_name, category')
    .eq('framework_name', 'HGIOS4').order('indicator_code', { ascending: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evidence } = await (admin as any).from('inspection_evidence').select('*').eq('school_id', ctx.schoolId)

  const byIndicator = new Map<string, typeof evidence>()
  for (const e of evidence ?? []) {
    const arr = byIndicator.get(e.indicator_id) ?? []
    arr.push(e); byIndicator.set(e.indicator_id, arr)
  }

  const byCategory = new Map<string, typeof indicators>()
  for (const i of indicators ?? []) {
    const arr = byCategory.get(i.category) ?? []
    arr.push(i); byCategory.set(i.category, arr)
  }

  const today = new Date().toLocaleDateString('en-GB')
  let html = `<!doctype html><html lang="en"><head>
    <meta charset="utf-8">
    <title>Inspection evidence portfolio – ${escapeHtml(school?.name ?? 'School')}</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11pt; color: #1f2937; line-height: 1.4; margin: 0; }
      h1 { font-size: 22pt; margin: 0 0 4pt 0; }
      h2 { font-size: 14pt; margin-top: 20pt; border-bottom: 1pt solid #cbd5e1; padding-bottom: 4pt; page-break-after: avoid; }
      h3 { font-size: 12pt; margin-top: 12pt; page-break-after: avoid; }
      p.meta { opacity: 0.7; font-size: 10pt; margin: 0 0 12pt 0; }
      .cover { padding: 20mm 10mm; text-align: center; page-break-after: always; }
      .cover h1 { font-size: 28pt; }
      .evidence { border: 1pt solid #e5e7eb; padding: 8pt; margin: 6pt 0; border-radius: 4pt; page-break-inside: avoid; }
      .badge { display: inline-block; font-size: 9pt; padding: 2pt 6pt; border-radius: 3pt; margin-left: 6pt; background: #dbeafe; color: #1d4ed8; }
      .no-evidence { font-style: italic; color: #64748b; font-size: 10pt; }
      button.print { background: #1d4ed8; color: white; border: none; padding: 8pt 14pt; border-radius: 4pt; font-weight: 600; cursor: pointer; }
      @media print { button.print { display: none; } }
    </style></head><body>
    <div class="cover">
      <h1>${escapeHtml(school?.name ?? 'School')}</h1>
      <p class="meta">${escapeHtml(school?.local_authority ?? '')}</p>
      <h2>HGIOS4 inspection evidence portfolio</h2>
      <p class="meta">Prepared ${today}</p>
      <p class="meta">Self-evaluation evidence prepared using Pathfinder Schools</p>
    </div>
    <button class="print" onclick="window.print()">Print / Save as PDF</button>
  `

  for (const [cat, inds] of byCategory.entries()) {
    html += `<h2>${escapeHtml(cat)}</h2>`
    for (const ind of inds ?? []) {
      html += `<h3>QI ${escapeHtml(ind.indicator_code)} ${escapeHtml(ind.indicator_name)}</h3>`
      const items = byIndicator.get(ind.id) ?? []
      if (items.length === 0) {
        html += `<p class="no-evidence">No evidence captured for this indicator yet.</p>`
      } else {
        for (const e of items) {
          html += `<div class="evidence"><strong>${escapeHtml(e.title)}</strong><span class="badge">${escapeHtml(e.evidence_type)}</span>
            <p>${escapeHtml(e.description)}</p>
            <p class="meta">${escapeHtml(e.source ?? '')} · ${new Date(e.created_at).toLocaleDateString('en-GB')}</p>
          </div>`
        }
      }
    }
  }
  html += `</body></html>`

  return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}
