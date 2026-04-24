'use client'

import { useEffect, useState } from 'react'

type Result = {
  subject_name: string
  qualification_type: string
  grade: string
  predicted_grade: string | null
  value_added: number | null
  academic_year: string
}

// Silent-when-empty card that shows SQA results imported by the
// student's school. Appears only if the user is signed in, matches an
// students row, and at least one sqa_results row exists. Mirrors the
// pattern used by <WorkExperienceCard> and <ParentEveningCard>.
export function SchoolImportedResults() {
  const [results, setResults] = useState<Result[] | null>(null)
  useEffect(() => {
    fetch('/api/student/sqa-results').then((r) => r.json()).then((d) => setResults(d.results ?? []))
  }, [])

  if (!results || results.length === 0) return null

  // Group by academic year (most recent first).
  const byYear = new Map<string, Result[]>()
  for (const r of results) {
    const arr = byYear.get(r.academic_year) ?? []
    arr.push(r)
    byYear.set(r.academic_year, arr)
  }

  return (
    <section className="pf-section pf-section-white">
      <div className="pf-container">
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '24px',
            background: 'var(--pf-blue-50, #EFF6FF)',
            border: '1px solid var(--pf-blue-200, #BFDBFE)',
            borderRadius: 10,
          }}
        >
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, margin: '0 0 6px' }}>Your school-released results</h2>
          <p style={{ fontSize: 14, color: 'var(--pf-grey-600)', margin: '0 0 14px' }}>
            These results were released by your school&apos;s data team. If anything looks wrong, speak to your guidance teacher.
          </p>
          {Array.from(byYear.entries()).map(([year, rows]) => (
            <div key={year} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{year}</div>
              <div style={{ overflow: 'auto', background: '#fff', borderRadius: 6 }}>
                <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={th}>Subject</th>
                      <th style={th}>Level</th>
                      <th style={th}>Predicted</th>
                      <th style={th}>Actual</th>
                      <th style={th}>vs predicted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                        <td style={td}>{r.subject_name}</td>
                        <td style={td}>{r.qualification_type}</td>
                        <td style={td}>{r.predicted_grade ?? '-'}</td>
                        <td style={{ ...td, fontWeight: 700 }}>{r.grade}</td>
                        <td style={{ ...td, color: r.value_added != null ? (r.value_added > 0 ? '#16a34a' : r.value_added < 0 ? '#dc2626' : '#555') : '#999' }}>
                          {r.value_added == null ? '-' : r.value_added > 0 ? `+${r.value_added}` : r.value_added}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontSize: 13, fontWeight: 600 }
const td: React.CSSProperties = { padding: '8px 10px', fontSize: 13 }
