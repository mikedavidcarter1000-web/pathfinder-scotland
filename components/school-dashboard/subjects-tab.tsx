'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { SubjectData } from './types'

const TRANSITIONS = ['s2_to_s3', 's3_to_s4', 's4_to_s5', 's5_to_s6'] as const
const TRANSITION_LABELS: Record<string, string> = {
  s2_to_s3: 'S2 → S3',
  s3_to_s4: 'S3 → S4',
  s4_to_s5: 'S4 → S5 (Higher)',
  s5_to_s6: 'S5 → S6 (Higher / Advanced Higher)',
}

export function SubjectsTab() {
  const [data, setData] = useState<SubjectData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/school/dashboard/subjects')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading…</p>
  if (!data) return <p>Could not load subject data.</p>

  const allSubjects = new Set<string>()
  for (const t of TRANSITIONS) {
    for (const s of Object.keys(data.popularityByTransition[t] || {})) allSubjects.add(s)
  }
  const subjectList = Array.from(allSubjects).sort()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <section style={{ ...card, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <h3 style={h3}>Choice rounds</h3>
        <p style={{ margin: '0 0 8px', fontSize: '0.875rem' }}>
          Run a full column-based subject choice round — build columns, collect student picks, see demand in real time, and export SEEMIS CSV when ready.
        </p>
        <Link href="/school/choices" style={{ fontWeight: 600, color: '#1D4ED8' }}>
          Manage choice rounds &rarr;
        </Link>
      </section>

      <section style={card}>
        <h3 style={h3}>Subject choice popularity</h3>
        {subjectList.length === 0 ? (
          <p style={empty}>No subject choices recorded by linked students yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={th}>Subject</th>
                  {TRANSITIONS.map((t) => (
                    <th key={t} style={th}>{TRANSITION_LABELS[t]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjectList.map((subj) => (
                  <tr key={subj}>
                    <td style={td}>{subj}</td>
                    {TRANSITIONS.map((t) => {
                      const n = data.popularityByTransition[t]?.[subj] ?? 0
                      return (
                        <td key={t} style={{ ...td, textAlign: 'center', fontWeight: n > 0 ? 600 : 400, opacity: n > 0 ? 1 : 0.4 }}>
                          {n || '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={card}>
        <h3 style={h3}>Drop-off analysis</h3>
        {data.dropOffFlags.length === 0 ? (
          <p style={empty}>No drops of more than 50% detected between transitions.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.dropOffFlags.map((f, i) => (
              <li key={i} style={alertCard('#FEF3C7', '#F59E0B')}>
                <strong>{f.subject}:</strong> {f.before} students at {TRANSITION_LABELS[f.from]} but only {f.after} continuing to {TRANSITION_LABELS[f.to]} ({f.pct}% drop).
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={card}>
        <h3 style={h3}>University consequence flags</h3>
        <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: 0 }}>
          Mismatches between saved courses and chosen subjects that could affect entry eligibility.
        </p>
        {data.consequenceFlags.length === 0 ? (
          <p style={empty}>No consequence mismatches detected.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.consequenceFlags.map((f, i) => {
              const severity = f.count >= 5 ? 'red' : 'amber'
              const colors = severity === 'red' ? ['#FEE2E2', '#DC2626'] : ['#FEF3C7', '#F59E0B']
              return (
                <li key={i} style={alertCard(colors[0], colors[1])}>
                  <strong>{f.count} students</strong> {f.note}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: '8px',
  padding: '16px 20px',
}
const h3: React.CSSProperties = { margin: '0 0 12px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem' }
const empty: React.CSSProperties = { fontSize: '0.875rem', opacity: 0.7 }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--pf-grey-200)', fontWeight: 700 }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--pf-grey-100)' }

function alertCard(bg: string, border: string): React.CSSProperties {
  return {
    padding: '10px 12px',
    backgroundColor: bg,
    border: `1px solid ${border}`,
    borderRadius: '6px',
    fontSize: '0.9375rem',
  }
}
