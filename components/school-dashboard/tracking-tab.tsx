'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Summary = {
  cycle: { id: string; name: string; is_locked: boolean } | null
  overall: { completion_pct: number; expected: number; actual: number }
  grade_distribution: Record<string, number>
  key_measures: { n5_ca_pct: number; higher_ca_pct: number; ah_ca_pct: number }
  departments: { department: string; expected: number; actual: number; completion_pct: number }[]
}

export function TrackingTab() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/school/tracking/summary')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading tracking summary…</p>
  if (!data || !data.cycle) {
    return (
      <div style={card}>
        <h2 style={{ margin: '0 0 8px' }}>No current tracking cycle</h2>
        <p style={{ opacity: 0.7 }}>
          Create a cycle to start tracking. <Link href="/school/tracking">Go to tracking &rarr;</Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>Current cycle: {data.cycle.name}</h2>
            <p style={{ margin: 0, opacity: 0.7 }}>{data.overall.actual} of {data.overall.expected} entries ({data.overall.completion_pct}% complete)</p>
          </div>
          <Link href="/school/tracking" style={btnPrimary}>Open tracking</Link>
        </div>
        <ProgressBar pct={data.overall.completion_pct} />
      </section>

      <section style={card}>
        <h2 style={h2}>Key measures (predicted A-C)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <Gauge label="5+ N5 A-C" pct={data.key_measures.n5_ca_pct} />
          <Gauge label="3+ Higher A-C" pct={data.key_measures.higher_ca_pct} />
          <Gauge label="1+ Advanced Higher A-C" pct={data.key_measures.ah_ca_pct} />
        </div>
      </section>

      <section style={card}>
        <h2 style={h2}>Grade distribution</h2>
        <GradeDoughnut counts={data.grade_distribution} />
      </section>

      <section style={card}>
        <h2 style={h2}>Department completion</h2>
        {data.departments.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No departments have classes yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.departments.map((d) => (
              <div key={d.department} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: '0 0 180px', fontSize: '0.875rem' }}>
                  <Link href={`/school/departments/${encodeURIComponent(d.department)}`} style={{ color: '#1B3A5C' }}>
                    {d.department}
                  </Link>
                </div>
                <div style={{ flex: 1 }}>
                  <ProgressBar pct={d.completion_pct} compact />
                </div>
                <div style={{ flex: '0 0 80px', textAlign: 'right', fontSize: '0.875rem' }}>
                  {d.actual}/{d.expected} ({d.completion_pct}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ProgressBar({ pct, compact }: { pct: number; compact?: boolean }) {
  return (
    <div style={{ marginTop: 8, height: compact ? 8 : 12, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
      <div
        style={{
          width: `${Math.min(100, pct)}%`,
          height: '100%',
          background: pct >= 80 ? '#22c55e' : pct >= 50 ? '#3b82f6' : pct >= 25 ? '#f59e0b' : '#ef4444',
          transition: 'width 160ms',
        }}
      />
    </div>
  )
}

function Gauge({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: '2.25rem', fontWeight: 700, color: pct >= 60 ? '#166534' : pct >= 40 ? '#854d0e' : '#991b1b' }}>{pct}%</div>
    </div>
  )
}

function GradeDoughnut({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (total === 0) return <p style={{ opacity: 0.6 }}>No grades entered yet.</p>
  const order = ['A', 'B', 'C', 'D', 'No Award']
  const colours: Record<string, string> = { A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#fb923c', 'No Award': '#ef4444' }
  const parts: { g: string; n: number; c: string }[] = []
  for (const g of order) {
    const n = counts[g] ?? 0
    if (n > 0) parts.push({ g, n, c: colours[g] })
  }
  const known = new Set(order)
  let otherN = 0
  for (const [g, n] of Object.entries(counts)) if (!known.has(g)) otherN += n
  if (otherN > 0) parts.push({ g: 'Other', n: otherN, c: '#9ca3af' })

  // Simple horizontal bar version (doughnut without canvas)
  return (
    <div>
      <div style={{ display: 'flex', height: 30, borderRadius: 4, overflow: 'hidden', background: '#f3f4f6' }}>
        {parts.map((p) => (
          <div key={p.g} style={{ flex: p.n, background: p.c }} title={`${p.g}: ${p.n} (${Math.round((p.n / total) * 100)}%)`} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10, fontSize: '0.875rem' }}>
        {parts.map((p) => (
          <span key={p.g}>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: p.c, borderRadius: 2, marginRight: 4 }} />
            {p.g}: {p.n} ({Math.round((p.n / total) * 100)}%)
          </span>
        ))}
      </div>
    </div>
  )
}

const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, background: 'white', marginBottom: 16 }
const h2: React.CSSProperties = { margin: '0 0 10px', fontSize: '1.05rem' }
const btnPrimary: React.CSSProperties = { padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block' }
