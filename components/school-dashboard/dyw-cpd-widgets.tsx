'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type DywWidgetData = {
  active_partners: number
  placements_this_year: number
  sectors_covered: number
  sectors_total: number
}

type CpdWidgetData = {
  my_hours: number
  last_cpd: string | null
  records: number
}

export function DywSummaryWidget({ canSee }: { canSee: boolean }) {
  const [data, setData] = useState<DywWidgetData | null>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!canSee) { setLoaded(true); return }
    fetch('/api/school/dyw/overview')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setData({
        active_partners: d.overview.active_partners,
        placements_this_year: d.overview.placements_this_year,
        sectors_covered: d.overview.sectors_covered,
        sectors_total: d.overview.sectors_total,
      }))
      .finally(() => setLoaded(true))
  }, [canSee])

  if (!canSee || !loaded || !data) return null
  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={h3}>DYW this year</h3>
        <Link href="/school/dyw" style={link}>Open &rarr;</Link>
      </div>
      <div style={grid}>
        <Cell label="Active partners" value={String(data.active_partners)} />
        <Cell label="Placements" value={String(data.placements_this_year)} />
        <Cell label="Sector coverage" value={`${data.sectors_covered} / ${data.sectors_total}`} />
      </div>
    </div>
  )
}

export function CpdSummaryWidget() {
  const [data, setData] = useState<CpdWidgetData | null>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    fetch('/api/school/cpd?scope=mine')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return
        const rows = (d.records ?? []) as { hours: number | null; date_completed: string }[]
        const hours = rows.reduce((a, r) => a + Number(r.hours ?? 0), 0)
        const last = rows.length > 0 ? rows[0].date_completed : null
        setData({ my_hours: Math.round(hours * 10) / 10, last_cpd: last, records: rows.length })
      })
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded || !data) return null
  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={h3}>Your CPD this year</h3>
        <Link href="/school/cpd" style={link}>Open &rarr;</Link>
      </div>
      <div style={grid}>
        <Cell label="Hours logged" value={String(data.my_hours)} />
        <Cell label="Activities" value={String(data.records)} />
        <Cell label="Most recent" value={data.last_cpd ? new Date(data.last_cpd).toLocaleDateString('en-GB') : 'none yet'} />
      </div>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  )
}

const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, background: '#fff' }
const h3: React.CSSProperties = { margin: 0, fontSize: '0.95rem', fontFamily: "'Space Grotesk', sans-serif" }
const link: React.CSSProperties = { fontSize: 12, color: '#1D4ED8', textDecoration: 'none', fontWeight: 600 }
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }
