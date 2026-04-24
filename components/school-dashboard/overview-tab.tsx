'use client'

import { useEffect, useState } from 'react'
import type { OverviewData } from './types'
import { LeadershipAnalyticsWidget } from './leadership-analytics-widget'

export function OverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/school/dashboard/overview')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading…</p>
  if (!data) return <p>Could not load overview.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <LeadershipAnalyticsWidget />
      <div style={metricsGrid}>
        <Metric label="Registered students" value={data.total} />
        <Metric label="Active this month" value={data.activeThisMonth} />
        <Metric label="Courses saved" value={data.coursesSaved} />
        <Metric label="Quiz completions" value={data.quizCompleted} />
      </div>

      <section style={card}>
        <h3 style={h3}>SIMD profile of your cohort</h3>
        {data.total === 0 ? (
          <p style={empty}>No students linked yet. Share your join code to get started.</p>
        ) : (
          <>
            <p style={{ fontSize: '0.875rem', margin: '4px 0 12px', opacity: 0.8 }}>
              <strong>{data.simd12Pct}%</strong> of your registered students are from SIMD 1-2 areas (national average: {data.simd12National}%).
            </p>
            <StackedBar distribution={data.simdDistribution} />
            <StackedBar distribution={data.nationalSimd} label="Scotland average" muted />
            <SensitiveAggregates data={data.sensitiveAggregates} />
          </>
        )}
      </section>

      <section style={card}>
        <h3 style={h3}>Career sector interest</h3>
        {data.sectorHeatmap.length === 0 ? (
          <p style={empty}>No saved courses yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.sectorHeatmap.map((s) => (
              <li key={s.sector} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ flex: '0 0 180px', fontSize: '0.875rem', textTransform: 'capitalize' }}>{s.sector}</span>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--pf-grey-100)',
                    height: '14px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, (s.count / Math.max(data.total, 1)) * 100 * 2)}%`,
                      backgroundColor: 'var(--pf-blue-500)',
                      height: '100%',
                    }}
                  />
                </div>
                <span style={{ width: '40px', textAlign: 'right', fontSize: '0.875rem' }}>{s.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={metricCard}>
      <span style={metricLabel}>{label}</span>
      <span style={metricValue}>{value.toLocaleString()}</span>
    </div>
  )
}

function StackedBar({ distribution, label, muted }: { distribution: number[]; label?: string; muted?: boolean }) {
  const colors = [
    '#7F1D1D', '#B91C1C', '#DC2626', '#F87171',
    '#FDE68A', '#FCD34D', '#86EFAC', '#4ADE80',
    '#16A34A', '#14532D',
  ]
  return (
    <div style={{ marginBottom: '12px' }}>
      {label && <div style={{ fontSize: '0.8125rem', opacity: 0.7, marginBottom: '4px' }}>{label}</div>}
      <div style={{ display: 'flex', height: '18px', borderRadius: '4px', overflow: 'hidden', opacity: muted ? 0.6 : 1 }}>
        {distribution.map((pct, i) => (
          <div
            key={i}
            style={{ width: `${pct}%`, backgroundColor: colors[i], minWidth: pct > 0 ? '2px' : 0 }}
            title={`SIMD decile ${i + 1}: ${pct}%`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', opacity: 0.7, marginTop: '2px' }}>
        <span>1 (most deprived)</span>
        <span>10 (least deprived)</span>
      </div>
    </div>
  )
}

function SensitiveAggregates({ data }: { data: { careExperiencedPct: number; firstGenerationPct: number; fsmEmaPct: number } }) {
  return (
    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--pf-grey-50)', borderRadius: '6px', fontSize: '0.875rem' }}>
      <strong>Cohort indicators (aggregate only):</strong>
      <ul style={{ margin: '6px 0 0', paddingLeft: '20px' }}>
        <li>{data.careExperiencedPct}% care-experienced</li>
        <li>{data.firstGenerationPct}% first-generation</li>
        <li>{data.fsmEmaPct}% receive Free School Meals / EMA</li>
      </ul>
      <p style={{ margin: '6px 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
        Individual names are never shown for these indicators.
      </p>
    </div>
  )
}

const metricsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
}
const metricCard: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
}
const metricLabel: React.CSSProperties = { fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }
const metricValue: React.CSSProperties = { fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginTop: '4px' }
const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: '8px',
  padding: '16px 20px',
}
const h3: React.CSSProperties = { margin: '0 0 12px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem' }
const empty: React.CSSProperties = { fontSize: '0.875rem', opacity: 0.7 }
