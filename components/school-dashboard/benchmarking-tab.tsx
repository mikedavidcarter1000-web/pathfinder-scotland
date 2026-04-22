'use client'

import { useEffect, useState } from 'react'
import type { BenchmarksData } from './types'

export function BenchmarkingTab() {
  const [data, setData] = useState<BenchmarksData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/school/dashboard/benchmarks')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading…</p>
  if (!data) return <p>Could not load benchmarking data.</p>

  const councilLine = data.councilData
    ? `In ${data.councilName} last year, ${data.councilData.university_pct}% of school leavers went to university and ${data.councilData.college_pct}% to college (Scotland average: ${data.scotlandAvg.university_pct}% university, ${data.scotlandAvg.college_pct}% college).`
    : `Your school's local authority is not yet set. Update it in Settings to see the leaver-destinations comparison.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <section style={card}>
        <h3 style={h3}>Leaver destinations: school vs local authority</h3>
        <p style={{ margin: '4px 0 12px', fontSize: '0.9375rem' }}>{councilLine}</p>
        {data.councilData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <BarRow label={`${data.councilName} - University`} value={data.councilData.university_pct} max={70} color="#2563EB" />
            <BarRow label="Scotland - University" value={data.scotlandAvg.university_pct} max={70} color="#93C5FD" />
            <BarRow label={`${data.councilName} - College`} value={data.councilData.college_pct} max={70} color="#16A34A" />
            <BarRow label="Scotland - College" value={data.scotlandAvg.college_pct} max={70} color="#86EFAC" />
            {data.councilData.needs_verification && (
              <p style={{ fontSize: '0.75rem', opacity: 0.65, margin: 0 }}>
                Indicative figures - verify against the latest SFC publication ({data.academicYear ?? ''}).
              </p>
            )}
          </div>
        )}
      </section>

      <section style={card}>
        <h3 style={h3}>Career Education Standard - capacity alignment</h3>
        <CesRadar ces={data.ces} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '12px' }}>
          {data.capacities.map((cap) => (
            <div key={cap.key} style={capCard}>
              <strong style={{ textTransform: 'capitalize' }}>{cap.label}</strong>
              <p style={{ fontSize: '0.8125rem', opacity: 0.75, margin: '4px 0 6px' }}>{cap.description}</p>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{data.ces[cap.key as keyof BenchmarksData['ces']]}%</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8125rem', opacity: 0.75, marginTop: '12px' }}>
          These indicators align with Education Scotland&apos;s Career Education Standard (3-18). They can be referenced
          in school improvement plans, DYW evidence, and HMIE inspection preparation.
        </p>
        <p style={{ fontSize: '0.75rem', opacity: 0.65, margin: '6px 0 0' }}>
          Networks capacity will show 0% - employer connections and virtual work experience features are planned for 2027.
        </p>
      </section>

      <section style={card}>
        <h3 style={h3}>DYW indicator summary</h3>
        <table style={tbl}>
          <tbody>
            <Row label="Explored at least one career pathway" pct={data.dyw.exploredPct} count={data.dyw.exploredCount} total={data.total} />
            <Row label="Saved at least one course" pct={data.dyw.savedPct} count={data.dyw.savedCount} total={data.total} />
            <Row label="Completed the interest quiz" pct={data.dyw.quizPct} count={data.dyw.quizCount} total={data.total} />
            <Row label="SIMD 1-2 engaged with widening access content" pct={data.dyw.simd12EngagedPct} count={data.dyw.simd12EngagedCount} total={data.dyw.simd12Total} />
          </tbody>
        </table>
      </section>
    </div>
  )
}

function Row({ label, pct, count, total }: { label: string; pct: number; count: number; total: number }) {
  return (
    <tr>
      <td style={td}>{label}</td>
      <td style={{ ...td, textAlign: 'right', width: '200px' }}>
        <strong>{pct}%</strong> <span style={{ opacity: 0.7 }}>({count} of {total})</span>
      </td>
    </tr>
  )
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '2px' }}>
        <span>{label}</span><span style={{ fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ backgroundColor: 'var(--pf-grey-100)', borderRadius: '4px', overflow: 'hidden', height: '14px' }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color, height: '100%' }} />
      </div>
    </div>
  )
}

function CesRadar({ ces }: { ces: { self: number; strengths: number; horizons: number; networks: number } }) {
  // Minimal SVG radar (4 axes)
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 20
  const axes = [
    { key: 'self', label: 'Self', angle: -90 },
    { key: 'strengths', label: 'Strengths', angle: 0 },
    { key: 'horizons', label: 'Horizons', angle: 90 },
    { key: 'networks', label: 'Networks', angle: 180 },
  ] as const
  const point = (angleDeg: number, value: number) => {
    const rad = (angleDeg * Math.PI) / 180
    const r = (value / 100) * maxR
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const
  }
  const dataPath = axes
    .map((a) => {
      const [x, y] = point(a.angle, ces[a.key])
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const ring = [0.25, 0.5, 0.75, 1].map((f, i) => {
    const pts = axes
      .map((a) => {
        const [x, y] = point(a.angle, f * 100)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
    return <polygon key={i} points={pts} fill="none" stroke="#E5E7EB" />
  })
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }} role="img" aria-label="CES capacity radar chart">
      {ring}
      <polygon points={dataPath} fill="rgba(37, 99, 235, 0.2)" stroke="#2563EB" strokeWidth="2" />
      {axes.map((a) => {
        const [x, y] = point(a.angle, 110)
        return <text key={a.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11 }}>{a.label}</text>
      })}
    </svg>
  )
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: '8px',
  padding: '16px 20px',
}
const h3: React.CSSProperties = { margin: '0 0 12px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem' }
const capCard: React.CSSProperties = { padding: '12px', border: '1px solid var(--pf-grey-200)', borderRadius: '6px', backgroundColor: 'var(--pf-grey-50)' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const td: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid var(--pf-grey-100)' }
