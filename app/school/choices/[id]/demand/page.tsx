'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type HeatmapSubject = {
  column_subject_id: string
  subject_id: string
  subject_name: string
  capacity: number | null
  current_demand: number
  oversubscribed: boolean
  fill_pct: number | null
}
type HeatmapColumn = {
  column_id: string
  column_position: number
  label: string
  is_compulsory: boolean
  allow_multiple: boolean
  subjects: HeatmapSubject[]
}

type HeatmapResponse = {
  round: { id: string; name: string; year_group: string; academic_year: string; status: string }
  heatmap: HeatmapColumn[]
  stats: { total: number; committed: number; drafts: number }
}

export default function ChoiceDemandPage() {
  const params = useParams<{ id: string }>()
  const roundId = params?.id as string
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [data, setData] = useState<HeatmapResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/choices/${roundId}/demand`)
      return
    }
    if (!roundId) return
    fetch(`/api/school/choices/rounds/${roundId}/heatmap`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) router.replace('/school/choices')
        else setData(d)
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, roundId, router])

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading demand…</p></div>
  if (!data) return null

  const maxDemand = Math.max(1, ...data.heatmap.flatMap((c) => c.subjects.map((s) => s.current_demand)))

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link href={`/school/choices/${roundId}/setup`} style={{ fontSize: '0.875rem' }}>&larr; Setup</Link>
        {' · '}
        <Link href="/school/choices" style={{ fontSize: '0.875rem' }}>All rounds</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem' }}>
            {data.round.name}
          </h1>
          <p style={{ marginTop: 4, opacity: 0.7 }}>
            {data.round.year_group} · {data.round.academic_year} · Status: <strong>{data.round.status}</strong>
          </p>
        </div>
        <a href={`/api/school/choices/export?roundId=${roundId}`} style={btnPrimary}>Export SEEMIS CSV</a>
      </div>

      <div style={statsRow}>
        <Stat label="Total started" value={data.stats.total} />
        <Stat label="Committed" value={data.stats.committed} />
        <Stat label="Still in draft" value={data.stats.drafts} />
      </div>

      <section style={panel}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>Subject demand by column</h2>
        <p style={{ margin: '0 0 16px', fontSize: '0.875rem', opacity: 0.7 }}>
          Capacity is compared to committed (non-reserve) picks. Oversubscribed subjects are highlighted in red.
          Fill ratio: bar width is demand / column&apos;s busiest subject.
        </p>

        {data.heatmap.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No columns defined yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {data.heatmap.map((col) => (
              <div key={col.column_id}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1rem' }}>
                  Column {col.column_position}: {col.label}
                  {col.is_compulsory && <span style={pill('#fee2e2', '#991b1b')}>Compulsory</span>}
                  {col.allow_multiple && <span style={pill('#e0e7ff', '#3730a3')}>Multi</span>}
                </h3>
                {col.subjects.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.6 }}>No subjects defined.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {col.subjects.sort((a, b) => b.current_demand - a.current_demand).map((s) => {
                      const widthPct = Math.round((s.current_demand / maxDemand) * 100)
                      const barBg = s.oversubscribed ? '#fca5a5' : s.fill_pct !== null && s.fill_pct > 80 ? '#fde68a' : '#bae6fd'
                      return (
                        <div key={s.column_subject_id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 80px', alignItems: 'center', gap: 12 }}>
                          <div style={{ fontSize: '0.9rem' }}>{s.subject_name}</div>
                          <div style={{ position: 'relative', height: 22, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                width: `${widthPct}%`,
                                backgroundColor: barBg,
                                transition: 'width 200ms',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '0.875rem', textAlign: 'right' }}>
                            <strong style={{ color: s.oversubscribed ? '#dc2626' : '#374151' }}>{s.current_demand}</strong>
                            {s.capacity !== null && <span style={{ opacity: 0.6 }}> / {s.capacity}</span>}
                            {s.oversubscribed && <span style={{ marginLeft: 6, color: '#dc2626', fontWeight: 600 }}>over</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={statCard}>
      <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.7 }}>{label}</div>
    </div>
  )
}

const panel: React.CSSProperties = {
  border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', backgroundColor: 'white', marginTop: '16px',
}
const statsRow: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px',
}
const statCard: React.CSSProperties = {
  padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, backgroundColor: 'white',
}
function pill(bg: string, fg: string): React.CSSProperties {
  return { display: 'inline-block', padding: '1px 8px', borderRadius: 999, backgroundColor: bg, color: fg, fontSize: '0.7rem', fontWeight: 600, marginLeft: 6 }
}
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block',
}
