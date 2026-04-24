'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ShanarriRadar } from '@/components/school-guidance/shanarri-radar'
import { SHANARRI_INDICATORS } from '@/lib/school/shanarri'

type Aggregate = {
  indicator: string
  label: string
  average: number
  distribution: Record<number, number>
}

type Payload = {
  survey: {
    id: string
    name: string
    target_year_groups: string[] | null
    opens_at: string | null
    closes_at: string | null
    is_anonymous: boolean | null
  }
  aggregates: Aggregate[]
  responseCount: number
  invitedCount: number
  responseRatePct: number | null
  freeTextFlags: Array<{ id: string; text: string | null; student: { name: string; stage: string | null } | null }>
  lowScoreAttention: { count: number; students: Array<{ id: string; name: string; lowIndicators: string[] }> | null }
  responses: Array<{
    id: string
    studentId: string | null
    studentName: string
    stage: string | null
    scores: Record<string, number | null>
    freeText: string | null
    submittedAt: string
  }> | null
}

export default function SurveyDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [payload, setPayload] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/guidance/wellbeing/${params.id}`)
      return
    }
    fetch(`/api/school/guidance/wellbeing/surveys/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => setPayload(p))
      .finally(() => setLoading(false))
  }, [authLoading, user, router, params.id])

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>
  if (!payload) return <div style={{ padding: 32 }}>Survey not found.</div>

  const radarScores: Record<string, number> = {}
  for (const a of payload.aggregates) {
    radarScores[a.indicator] = a.average
  }

  const lowestIndicator = [...payload.aggregates].sort((a, b) => a.average - b.average)[0]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <Link href="/school/guidance/wellbeing" style={{ color: '#0059b3', fontSize: 14 }}>
        &larr; Back to surveys
      </Link>
      <h1 style={{ fontSize: 24, margin: '6px 0 4px 0' }}>{payload.survey.name}</h1>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        {payload.survey.is_anonymous ? 'Anonymous' : 'Named'} &middot; {(payload.survey.target_year_groups ?? []).map((y) => y.toUpperCase()).join(', ')} &middot;{' '}
        {payload.responseCount} of {payload.invitedCount} responded{' '}
        {payload.responseRatePct !== null && <>({payload.responseRatePct}%)</>}
      </div>

      {payload.responseCount === 0 ? (
        <div style={{ color: '#666' }}>No responses yet.</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <section style={{ ...card, flex: '0 0 auto' }}>
              <h2 style={cardHeader}>Average SHANARRI profile</h2>
              <ShanarriRadar
                scores={radarScores as unknown as import('@/lib/school/shanarri').ShanarriScores}
                size={300}
              />
            </section>
            <section style={{ ...card, flex: '1 1 280px' }}>
              <h2 style={cardHeader}>Indicator averages</h2>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7f7f7' }}>
                    <th style={thSm}>Indicator</th>
                    <th style={thSm}>Avg / 5</th>
                    <th style={thSm}>1</th>
                    <th style={thSm}>2</th>
                    <th style={thSm}>3</th>
                    <th style={thSm}>4</th>
                    <th style={thSm}>5</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.aggregates.map((a) => (
                    <tr key={a.indicator} style={{ borderTop: '1px solid #eee' }}>
                      <td style={tdSm}>{a.label}</td>
                      <td style={tdSm}>{a.average}</td>
                      <td style={tdSm}>{a.distribution[1] ?? 0}</td>
                      <td style={tdSm}>{a.distribution[2] ?? 0}</td>
                      <td style={tdSm}>{a.distribution[3] ?? 0}</td>
                      <td style={tdSm}>{a.distribution[4] ?? 0}</td>
                      <td style={tdSm}>{a.distribution[5] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lowestIndicator && (
                <div style={{ marginTop: 10, padding: 8, background: '#fef3c7', fontSize: 13, borderRadius: 4 }}>
                  <strong>{lowestIndicator.label}</strong> scored lowest (avg {lowestIndicator.average}). Consider reviewing practice in this area.
                </div>
              )}
            </section>
          </div>

          {payload.freeTextFlags.length > 0 && (
            <section style={{ ...card, background: '#fef2f2', borderColor: '#fca5a5' }}>
              <h2 style={{ ...cardHeader, color: '#991b1b' }}>
                Free-text responses flagged for follow-up ({payload.freeTextFlags.length})
              </h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {payload.freeTextFlags.map((f) => (
                  <li key={f.id} style={{ fontSize: 13, marginBottom: 6 }}>
                    {f.student && (
                      <strong>{f.student.name}{f.student.stage ? ` (${f.student.stage})` : ''}: </strong>
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!payload.survey.is_anonymous && payload.lowScoreAttention.students && payload.lowScoreAttention.students.length > 0 && (
            <section style={{ ...card, borderColor: '#f59e0b' }}>
              <h2 style={cardHeader}>Students scoring 1 or 2 on any indicator ({payload.lowScoreAttention.students.length})</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {payload.lowScoreAttention.students.map((s) => (
                  <li key={s.id} style={{ fontSize: 13, marginBottom: 4 }}>
                    <Link href={`/school/guidance/${s.id}?tab=wellbeing`} style={{ color: '#0059b3' }}>
                      {s.name}
                    </Link>
                    <span style={{ color: '#666' }}> &mdash; low on {s.lowIndicators.join(', ')}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {payload.survey.is_anonymous && payload.lowScoreAttention.count > 0 && (
            <section style={{ ...card, borderColor: '#f59e0b' }}>
              <h2 style={cardHeader}>Low-score responses detected</h2>
              <p style={{ fontSize: 13, margin: 0 }}>
                {payload.lowScoreAttention.count} response{payload.lowScoreAttention.count === 1 ? '' : 's'} contained at least one score of 1 or 2.
                Because this survey is anonymous, individual students cannot be identified. Consider a whole-cohort conversation.
              </p>
            </section>
          )}

          {!payload.survey.is_anonymous && payload.responses && (
            <section style={card}>
              <h2 style={cardHeader}>Individual responses ({payload.responses.length})</h2>
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f7f7f7' }}>
                      <th style={thSm}>Student</th>
                      {SHANARRI_INDICATORS.map((ind) => (
                        <th key={ind.key} style={thSm}>{ind.label.slice(0, 4)}</th>
                      ))}
                      <th style={thSm}>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payload.responses.map((r) => (
                      <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
                        <td style={tdSm}>
                          <Link href={`/school/guidance/${r.studentId}?tab=wellbeing`} style={{ color: '#0059b3' }}>
                            {r.studentName}
                          </Link>
                        </td>
                        {SHANARRI_INDICATORS.map((ind) => (
                          <td
                            key={ind.key}
                            style={{
                              ...tdSm,
                              color: (r.scores[ind.key] ?? 5) <= 2 ? '#dc2626' : '#111',
                              fontWeight: (r.scores[ind.key] ?? 5) <= 2 ? 600 : 400,
                            }}
                          >
                            {r.scores[ind.key] ?? '-'}
                          </td>
                        ))}
                        <td style={tdSm}>{new Date(r.submittedAt).toLocaleDateString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

const card: React.CSSProperties = { border: '1px solid #e5e5e5', borderRadius: 6, padding: 12, marginBottom: 12, background: '#fff' }
const cardHeader: React.CSSProperties = { fontSize: 15, margin: '0 0 8px 0' }
const thSm: React.CSSProperties = { padding: '4px 8px', textAlign: 'left', fontWeight: 600, fontSize: 12 }
const tdSm: React.CSSProperties = { padding: '4px 8px', verticalAlign: 'top' }
