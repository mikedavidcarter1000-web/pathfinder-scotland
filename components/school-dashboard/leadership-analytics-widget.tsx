'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CesRadar } from '@/components/school-analytics/ces-radar'

type OverviewResp = {
  attainment: { n5_5plus_ac_pct: number; higher_3plus_ac_pct: number; ah_1plus_pct: number; total_students: number; students_with_grades: number }
  attainment_previous: { n5_5plus_ac_pct: number; higher_3plus_ac_pct: number; ah_1plus_pct: number } | null
  simd_gap: Array<{ simd_quintile: number; n5_5plus_ac_pct: number }>
  ces: {
    self: { score: number; max: number; indicators: Array<{ label: string; value: number; note?: string }> }
    strengths: { score: number; max: number; indicators: Array<{ label: string; value: number; note?: string }> }
    horizons: { score: number; max: number; indicators: Array<{ label: string; value: number; note?: string }> }
    networks: { score: number; max: number; indicators: Array<{ label: string; value: number; note?: string }> }
  }
  alerts: {
    attendance_below_90: number
    interventions_overdue: number
    asn_reviews_due: number
    outstanding_choice_submissions: number
    unclaimed_bursaries: number
  }
}

export function LeadershipAnalyticsWidget() {
  const [data, setData] = useState<OverviewResp | null>(null)
  const [loading, setLoading] = useState(true)
  const [permitted, setPermitted] = useState(true)

  useEffect(() => {
    fetch('/api/school/analytics/overview')
      .then((r) => {
        if (r.status === 403) { setPermitted(false); return null }
        return r.json()
      })
      .then((d) => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  if (!permitted) return null
  if (loading) return <p style={{ fontSize: 13, opacity: 0.7 }}>Loading leadership view…</p>
  if (!data) return null

  const q1 = data.simd_gap.find((r) => r.simd_quintile === 1)
  const q5 = data.simd_gap.find((r) => r.simd_quintile === 5)
  const gap = q5 && q1 ? Math.round((q5.n5_5plus_ac_pct - q1.n5_5plus_ac_pct) * 10) / 10 : null

  const delta = (cur: number, prev?: number) => prev != null ? Math.round((cur - prev) * 10) / 10 : null

  const alertRows: Array<{ count: number; label: string; link?: string }> = [
    { count: data.alerts.attendance_below_90, label: 'students below 90% attendance', link: '/school/analytics?tab=attendance' },
    { count: data.alerts.asn_reviews_due, label: 'ASN reviews overdue', link: '/school/guidance' },
    { count: data.alerts.interventions_overdue, label: 'intervention follow-ups overdue', link: '/school/guidance' },
    { count: data.alerts.outstanding_choice_submissions, label: 'subject-choice rounds open', link: '/school/choices' },
  ]

  return (
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h3 style={h3}>Leadership view</h3>
        <Link href="/school/analytics" style={{ fontSize: 13, textDecoration: 'none', color: 'var(--pf-blue-700, #1D4ED8)' }}>Full analytics →</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 12 }}>
        <MiniMetric label="5+ N5 A-C" value={`${data.attainment.n5_5plus_ac_pct}%`} delta={delta(data.attainment.n5_5plus_ac_pct, data.attainment_previous?.n5_5plus_ac_pct)} />
        <MiniMetric label="3+ Higher A-C" value={`${data.attainment.higher_3plus_ac_pct}%`} delta={delta(data.attainment.higher_3plus_ac_pct, data.attainment_previous?.higher_3plus_ac_pct)} />
        <MiniMetric label="1+ AH" value={`${data.attainment.ah_1plus_pct}%`} />
        <MiniMetric label="SIMD gap (Q5 − Q1)" value={gap != null ? `${gap}pp` : '—'} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 14, alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>CES capacities</p>
          <CesRadar ces={data.ces} size={180} />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alerts</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {alertRows.map((r) => {
              const body = (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: r.count > 0 ? '#b45309' : '#64748b' }}>
                  <strong style={{ minWidth: 32, textAlign: 'right', fontSize: 15 }}>{r.count}</strong>
                  <span>{r.label}</span>
                </span>
              )
              return (
                <li key={r.label}>
                  {r.link ? <Link href={r.link} style={{ textDecoration: 'none', color: 'inherit' }}>{body}</Link> : body}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

function MiniMetric({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  const arrow = delta == null ? null : delta > 0 ? '▲' : delta < 0 ? '▼' : '—'
  const colour = delta == null ? undefined : delta > 0 ? '#059669' : delta < 0 ? '#dc2626' : '#64748b'
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 6, padding: 10 }}>
      <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{value}</div>
      {arrow && delta != null && (
        <div style={{ fontSize: 11, color: colour, marginTop: 1 }}>{arrow} {delta > 0 ? '+' : ''}{delta}pp</div>
      )}
    </div>
  )
}

const card: React.CSSProperties = { background: 'white', border: '1px solid var(--pf-grey-200, #e5e7eb)', borderRadius: 8, padding: 16 }
const h3: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, margin: 0 }
