// Server-side HTML renderer for the one-page guidance meeting brief.
// Same pattern as the parent-report renderer (lib/school/render-report.ts):
// stitch HTML that renders well both on-screen and via window.print().

function esc(s: unknown): string {
  if (s === null || s === undefined) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export type MeetingBriefData = {
  student: {
    firstName: string
    lastName: string
    schoolStage: string | null
    registrationClass: string | null
    houseGroup: string | null
    simdDecile: number | null
    scn: string | null
    attendancePct: number | null
  }
  generatedAt: string
  school: { name: string }
  subjects: Array<{ subject: string; grade: string | null; qualificationLevel: string | null; onTrack: boolean | null }>
  savedCourses: Array<{ title: string; university: string; eligibilityNote: string }>
  interventions: Array<{ date: string; type: string; title: string; outcome: string | null }>
  actionItems: Array<{ description: string; dueDate: string | null; isCompleted: boolean }>
  shanarri: Array<{ label: string; score: number | null }> | null
  asn: Array<{ type: string; description: string | null }>
  flags: { careExperienced: boolean; fsm: boolean; youngCarer: boolean; asn: boolean; attendanceConcern: boolean }
  simdNote: string
}

export function renderMeetingBriefHtml(data: MeetingBriefData): string {
  const s = data.student
  const fullName = `${s.firstName} ${s.lastName}`.trim() || 'Student'

  const flagBadges: string[] = []
  if (data.flags.careExperienced) flagBadges.push(`<span class="badge purple">Care experienced</span>`)
  if (data.flags.fsm) flagBadges.push(`<span class="badge blue">FSM</span>`)
  if (data.flags.youngCarer) flagBadges.push(`<span class="badge teal">Young carer</span>`)
  if (data.flags.asn) flagBadges.push(`<span class="badge amber">ASN</span>`)
  if (data.flags.attendanceConcern) flagBadges.push(`<span class="badge red">Attendance &lt; 90%</span>`)

  const subjectRows = data.subjects.length
    ? data.subjects
        .map(
          (x) =>
            `<tr><td>${esc(x.subject)}</td><td>${esc(x.qualificationLevel ?? '-')}</td><td>${esc(x.grade ?? '-')}</td><td>${
              x.onTrack === null ? '-' : x.onTrack ? 'On track' : 'Below target'
            }</td></tr>`
        )
        .join('')
    : '<tr><td colspan="4" class="muted">No tracking data available.</td></tr>'

  const savedCourseRows = data.savedCourses.length
    ? data.savedCourses
        .map((c) => `<li><strong>${esc(c.title)}</strong> &mdash; ${esc(c.university)} <span class="muted">(${esc(c.eligibilityNote)})</span></li>`)
        .join('')
    : '<li class="muted">No saved courses.</li>'

  const interventionRows = data.interventions.length
    ? data.interventions
        .map(
          (i) =>
            `<li><strong>${esc(i.date)}</strong> &mdash; ${esc(i.type)}: ${esc(i.title)}${i.outcome ? ` <span class="muted">(${esc(i.outcome)})</span>` : ''}</li>`
        )
        .join('')
    : '<li class="muted">No recent interventions.</li>'

  const actionRows = data.actionItems.length
    ? data.actionItems
        .map(
          (a) =>
            `<li>${a.isCompleted ? '[x]' : '[ ]'} ${esc(a.description)}${a.dueDate ? ` <span class="muted">(due ${esc(a.dueDate)})</span>` : ''}</li>`
        )
        .join('')
    : '<li class="muted">No outstanding action items.</li>'

  const shanarriRows = data.shanarri
    ? data.shanarri
        .map((x) => `<tr><td>${esc(x.label)}</td><td>${x.score === null ? '-' : esc(x.score.toString())}</td></tr>`)
        .join('')
    : ''

  const asnRows = data.asn.length
    ? data.asn.map((a) => `<li><strong>${esc(a.type)}</strong>${a.description ? `: ${esc(a.description)}` : ''}</li>`).join('')
    : '<li class="muted">No active ASN provisions.</li>'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Guidance meeting brief &mdash; ${esc(fullName)}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111; font-size: 11px; line-height: 1.35; margin: 0; padding: 16px; }
    h1 { font-size: 18px; margin: 0 0 4px 0; }
    h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; margin: 12px 0 4px 0; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
    h3 { font-size: 11px; margin: 8px 0 2px 0; }
    .meta { color: #666; font-size: 10px; margin-bottom: 6px; }
    .flags { margin: 4px 0 10px 0; display: flex; flex-wrap: wrap; gap: 4px; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
    .badge.purple { background: #f3e8ff; color: #6b21a8; }
    .badge.blue { background: #dbeafe; color: #1e40af; }
    .badge.teal { background: #ccfbf1; color: #0f766e; }
    .badge.amber { background: #fef3c7; color: #92400e; }
    .badge.red { background: #fee2e2; color: #991b1b; }
    .cols { display: flex; gap: 16px; }
    .col { flex: 1; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #ddd; padding: 3px 6px; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; font-weight: 600; }
    ul { margin: 4px 0 4px 16px; padding: 0; }
    li { margin: 2px 0; }
    .muted { color: #888; }
    .print-btn { padding: 6px 10px; margin: 0 0 8px 0; font-size: 11px; border: 1px solid #ccc; background: #fff; cursor: pointer; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>
  <h1>${esc(fullName)}</h1>
  <div class="meta">
    ${esc(data.school.name)} &middot; ${esc(s.schoolStage ?? '')} &middot; Reg ${esc(s.registrationClass ?? '-')} &middot; House ${esc(s.houseGroup ?? '-')} &middot; SCN ${esc(s.scn ?? '-')}
    &middot; SIMD ${s.simdDecile === null ? '-' : esc(s.simdDecile.toString())} &middot; Attendance ${s.attendancePct === null ? '-' : esc(s.attendancePct.toString()) + '%'}
  </div>
  <div class="flags">${flagBadges.join(' ')}</div>
  <div class="meta">Brief generated ${esc(data.generatedAt)}. ${esc(data.simdNote)}</div>

  <div class="cols">
    <div class="col">
      <h2>Tracking snapshot</h2>
      <table><thead><tr><th>Subject</th><th>Level</th><th>Current grade</th><th>Status</th></tr></thead><tbody>${subjectRows}</tbody></table>

      <h2>Saved courses</h2>
      <ul>${savedCourseRows}</ul>

      <h2>ASN provisions</h2>
      <ul>${asnRows}</ul>
    </div>

    <div class="col">
      <h2>Recent interventions</h2>
      <ul>${interventionRows}</ul>

      <h2>Outstanding actions</h2>
      <ul>${actionRows}</ul>

      ${
        shanarriRows
          ? `<h2>SHANARRI (latest)</h2><table><thead><tr><th>Indicator</th><th>Score / 5</th></tr></thead><tbody>${shanarriRows}</tbody></table>`
          : ''
      }
    </div>
  </div>
</body>
</html>`
}
