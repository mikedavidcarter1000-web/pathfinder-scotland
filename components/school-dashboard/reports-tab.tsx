'use client'

import { useState } from 'react'
import type { DashboardMe } from './types'

export function ReportsTab({ me }: { me: DashboardMe }) {
  const [busy, setBusy] = useState<string | null>(null)

  const handlePrintReport = async (kind: 'cohort' | 'subject' | 'wa') => {
    setBusy(kind)
    try {
      const [overview, subjects, benchmarks] = await Promise.all([
        fetch('/api/school/dashboard/overview').then((r) => r.json()),
        fetch('/api/school/dashboard/subjects').then((r) => r.json()),
        fetch('/api/school/dashboard/benchmarks').then((r) => r.json()),
      ])
      const html = renderReportHtml(kind, me, overview, subjects, benchmarks)
      const w = window.open('', '_blank', 'noopener')
      if (!w) return
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => w.print(), 250)
    } finally {
      setBusy(null)
    }
  }

  const handleCsv = () => {
    window.open('/api/school/export/csv', '_blank')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section style={card}>
        <h3 style={h3}>Reports</h3>
        <p style={{ fontSize: '0.9375rem', opacity: 0.8, marginTop: 0 }}>
          Pre-built report templates open in a new tab as print-friendly HTML. Use your browser&apos;s Print dialog to save as PDF.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <Report title="Cohort Overview" description="School profile, SIMD, engagement, CES capacities. 1 page." onClick={() => handlePrintReport('cohort')} disabled={busy === 'cohort'} />
          <Report title="Subject Choice Analysis" description="Popularity, drop-off, university consequences. Up to 2 pages." onClick={() => handlePrintReport('subject')} disabled={busy === 'subject'} />
          <Report title="Widening Access Report" description="SIMD breakdown, WA cohort indicators, LA comparison." onClick={() => handlePrintReport('wa')} disabled={busy === 'wa'} />
          <Report title="Individual Student Summary" description={me.staff.canViewIndividualStudents ? 'Open a student in the Students tab and use Prepare guidance summary.' : 'Requires individual-student view permission.'} disabled />
        </div>
      </section>

      <section style={card}>
        <h3 style={h3}>Export aggregate data (CSV)</h3>
        <p style={{ fontSize: '0.9375rem', opacity: 0.8, marginTop: 0 }}>
          Aggregate data only. No individual names or personally identifiable information.
        </p>
        <button onClick={handleCsv} style={btn}>Download CSV</button>
      </section>
    </div>
  )
}

function Report({ title, description, onClick, disabled }: { title: string; description: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...reportCard, opacity: disabled && !onClick ? 0.55 : 1 }}>
      <strong style={{ fontSize: '1rem' }}>{title}</strong>
      <p style={{ fontSize: '0.8125rem', opacity: 0.75, margin: '6px 0 8px' }}>{description}</p>
      {onClick && <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--pf-blue-700)' }}>Generate &rarr;</span>}
    </button>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderReportHtml(kind: string, me: DashboardMe, overview: any, subjects: any, benchmarks: any): string {
  const schoolName = me.school?.name ?? 'School'
  const date = new Date().toLocaleDateString('en-GB')
  const header = `
    <header>
      <h1>${escapeHtml(titleForKind(kind))}</h1>
      <p>${escapeHtml(schoolName)} - ${date}</p>
    </header>`
  const footer = `
    <footer>
      <p>Powered by Pathfinder Scotland</p>
      <p>Data reflects student activity on the Pathfinder Scotland platform and may not represent the school's full cohort.</p>
    </footer>`

  let body = ''
  if (kind === 'cohort') {
    body = `
      <section><h2>Registered students</h2><p>Total: ${overview.total}. Active this month: ${overview.activeThisMonth}.</p></section>
      <section><h2>SIMD profile</h2><p>${overview.simd12Pct}% from SIMD 1-2 areas (Scotland avg ${overview.simd12National}%).</p></section>
      <section><h2>Top career sectors</h2><ul>${overview.sectorHeatmap.slice(0, 5).map((s: { sector: string; count: number }) => `<li>${escapeHtml(s.sector)}: ${s.count}</li>`).join('')}</ul></section>
      <section><h2>Engagement</h2><p>Courses saved: ${overview.coursesSaved}. Quiz completions: ${overview.quizCompleted}.</p></section>
      <section><h2>Career Education Standard capacities</h2>
        <ul>${(benchmarks.capacities as { key: string; label: string }[]).map((c) => `<li><strong>${escapeHtml(c.label)}</strong>: ${benchmarks.ces[c.key]}%</li>`).join('')}</ul>
      </section>`
  } else if (kind === 'subject') {
    const popularity = subjects.popularityByTransition as Record<string, Record<string, number>>
    const dropOffs = subjects.dropOffFlags as { subject: string; from: string; to: string; before: number; after: number; pct: number }[]
    const consequences = subjects.consequenceFlags as { subject: string; note: string; count: number }[]
    body = `
      <section><h2>Subject popularity</h2>
      ${Object.entries(popularity).map(([t, m]) => `<h3>${escapeHtml(t)}</h3><ul>${Object.entries(m).map(([s, n]) => `<li>${escapeHtml(s)}: ${n}</li>`).join('')}</ul>`).join('')}
      </section>
      <section><h2>Drop-off patterns</h2>${dropOffs.length === 0 ? '<p>None detected.</p>' : `<ul>${dropOffs.map((f) => `<li>${escapeHtml(f.subject)}: ${f.before} to ${f.after} (${f.pct}% drop)</li>`).join('')}</ul>`}</section>
      <section><h2>University consequence flags</h2>${consequences.length === 0 ? '<p>None detected.</p>' : `<ul>${consequences.map((f) => `<li>${f.count} students: ${escapeHtml(f.note)}</li>`).join('')}</ul>`}</section>`
  } else if (kind === 'wa') {
    body = `
      <section><h2>SIMD decile breakdown</h2><ol>${(overview.simdDistribution as number[]).map((pct, i) => `<li>Decile ${i + 1}: ${pct}%</li>`).join('')}</ol></section>
      <section><h2>Cohort indicators (aggregate)</h2>
        <ul>
          <li>${overview.sensitiveAggregates.careExperiencedPct}% care-experienced</li>
          <li>${overview.sensitiveAggregates.firstGenerationPct}% first-generation</li>
          <li>${overview.sensitiveAggregates.fsmEmaPct}% Free School Meals / EMA</li>
        </ul>
      </section>
      <section><h2>Local authority comparison</h2>${
        benchmarks.councilData
          ? `<p>${escapeHtml(benchmarks.councilName)}: ${benchmarks.councilData.university_pct}% university, ${benchmarks.councilData.college_pct}% college. Scotland: ${benchmarks.scotlandAvg.university_pct}% / ${benchmarks.scotlandAvg.college_pct}%.</p>`
          : '<p>Local authority not set.</p>'
      }</section>
      <section><h2>DYW indicators</h2>
        <ul>
          <li>${benchmarks.dyw.exploredPct}% explored a career pathway (${benchmarks.dyw.exploredCount} of ${benchmarks.total})</li>
          <li>${benchmarks.dyw.savedPct}% saved a course (${benchmarks.dyw.savedCount} of ${benchmarks.total})</li>
          <li>${benchmarks.dyw.quizPct}% completed the quiz (${benchmarks.dyw.quizCount} of ${benchmarks.total})</li>
          <li>${benchmarks.dyw.simd12EngagedPct}% SIMD 1-2 engaged (${benchmarks.dyw.simd12EngagedCount} of ${benchmarks.dyw.simd12Total})</li>
        </ul>
      </section>`
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(titleForKind(kind))} - ${escapeHtml(schoolName)}</title>
    <style>
      body { font-family: Georgia, 'Times New Roman', serif; color: #1F2937; padding: 24px; max-width: 780px; margin: 0 auto; }
      header h1 { margin: 0 0 4px; font-size: 24px; }
      header p { margin: 0; color: #6B7280; }
      section { margin-top: 20px; page-break-inside: avoid; }
      h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.04em; color: #6B7280; margin-bottom: 6px; }
      h3 { font-size: 13px; margin: 10px 0 4px; }
      ul, ol { margin: 0; padding-left: 20px; }
      footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280; }
      @media print { body { padding: 12mm; } }
    </style></head><body>${header}${body}${footer}</body></html>`
}

function titleForKind(kind: string): string {
  if (kind === 'cohort') return 'Cohort Overview'
  if (kind === 'subject') return 'Subject Choice Analysis'
  if (kind === 'wa') return 'Widening Access Report'
  return 'Report'
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: '8px',
  padding: '16px 20px',
}
const h3: React.CSSProperties = { margin: '0 0 12px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem' }
const btn: React.CSSProperties = { padding: '10px 16px', border: '1px solid var(--pf-grey-300)', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 600 }
const reportCard: React.CSSProperties = {
  padding: '14px 16px',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: '8px',
  backgroundColor: '#fff',
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: "inherit",
}
