'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type Survey = {
  id: string
  name: string
  target_year_groups: string[] | null
  opens_at: string | null
  closes_at: string | null
  is_anonymous: boolean | null
  created_at: string
  status: 'draft' | 'scheduled' | 'open' | 'closed'
  responseCount: number
}

const YEAR_GROUPS = ['s1', 's2', 's3', 's4', 's5', 's6']

export default function WellbeingSurveysPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [targetYears, setTargetYears] = useState<string[]>([])
  const [opensAt, setOpensAt] = useState('')
  const [closesAt, setClosesAt] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/guidance/wellbeing')
      return
    }
    fetch('/api/school/guidance/wellbeing/surveys')
      .then((r) => (r.ok ? r.json() : { surveys: [] }))
      .then((d) => setSurveys(d.surveys ?? []))
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  async function createSurvey() {
    if (!name.trim() || targetYears.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/school/guidance/wellbeing/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          target_year_groups: targetYears,
          opens_at: opensAt || null,
          closes_at: closesAt || null,
          is_anonymous: anonymous,
        }),
      })
      if (res.ok) {
        setShowCreate(false)
        setName('')
        setTargetYears([])
        setOpensAt('')
        setClosesAt('')
        setAnonymous(false)
        // reload
        const r = await fetch('/api/school/guidance/wellbeing/surveys')
        if (r.ok) setSurveys((await r.json()).surveys ?? [])
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <Link href="/school/guidance" style={{ color: '#0059b3', fontSize: 14 }}>
        &larr; Back to Guidance Hub
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, margin: '6px 0' }}>Wellbeing surveys</h1>
        <button onClick={() => setShowCreate((v) => !v)} style={primaryButton}>
          {showCreate ? 'Cancel' : '+ Create survey'}
        </button>
      </div>

      {showCreate && (
        <section style={card}>
          <h2 style={cardHeader}>New SHANARRI survey</h2>
          <label style={label}>
            <div style={labelText}>Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={input} placeholder="e.g. Start of term wellbeing check" />
          </label>
          <label style={label}>
            <div style={labelText}>Target year groups</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {YEAR_GROUPS.map((yr) => {
                const selected = targetYears.includes(yr)
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() =>
                      setTargetYears((prev) => (selected ? prev.filter((x) => x !== yr) : [...prev, yr]))
                    }
                    style={{
                      padding: '4px 10px',
                      fontSize: 13,
                      border: '1px solid ' + (selected ? '#0059b3' : '#d0d0d0'),
                      background: selected ? '#0059b3' : '#fff',
                      color: selected ? '#fff' : '#333',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    {yr.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </label>
          <label style={label}>
            <div style={labelText}>Opens at</div>
            <input type="datetime-local" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} style={input} />
          </label>
          <label style={label}>
            <div style={labelText}>Closes at</div>
            <input type="datetime-local" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} style={input} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            <span style={{ fontSize: 14 }}>Anonymous survey</span>
          </label>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            Anonymous surveys cannot be linked to individual students. Use named surveys if you need to follow up on concerning responses.
          </div>
          <button onClick={createSurvey} disabled={submitting} style={primaryButton}>
            {submitting ? 'Creating...' : 'Create survey'}
          </button>
        </section>
      )}

      <div style={{ border: '1px solid #e5e5e5', borderRadius: 6, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={th}>Name</th>
              <th style={th}>Target</th>
              <th style={th}>Opens</th>
              <th style={th}>Closes</th>
              <th style={th}>Responses</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {surveys.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                  No surveys yet.
                </td>
              </tr>
            )}
            {surveys.map((s) => (
              <tr key={s.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={td}>
                  <Link href={`/school/guidance/wellbeing/${s.id}`} style={{ color: '#0059b3' }}>
                    {s.name}
                  </Link>
                  {s.is_anonymous && <span style={{ marginLeft: 6, fontSize: 11, color: '#666' }}>(anonymous)</span>}
                </td>
                <td style={td}>{(s.target_year_groups ?? []).map((y) => y.toUpperCase()).join(', ') || 'All'}</td>
                <td style={td}>{s.opens_at ? new Date(s.opens_at).toLocaleDateString('en-GB') : '-'}</td>
                <td style={td}>{s.closes_at ? new Date(s.closes_at).toLocaleDateString('en-GB') : '-'}</td>
                <td style={td}>{s.responseCount}</td>
                <td style={td}>
                  <span
                    style={{
                      padding: '2px 8px',
                      fontSize: 11,
                      borderRadius: 4,
                      background: s.status === 'open' ? '#d1fae5' : s.status === 'closed' ? '#f3f4f6' : '#fef3c7',
                      color: s.status === 'open' ? '#065f46' : s.status === 'closed' ? '#6b7280' : '#92400e',
                    }}
                  >
                    {s.status}
                  </span>
                </td>
                <td style={td}>
                  <Link href={`/school/guidance/wellbeing/${s.id}`} style={{ color: '#0059b3', fontSize: 13 }}>
                    View &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontWeight: 600 }
const td: React.CSSProperties = { padding: '8px 10px', verticalAlign: 'top' }
const card: React.CSSProperties = { border: '1px solid #e5e5e5', borderRadius: 6, padding: 12, marginBottom: 12, background: '#fff' }
const cardHeader: React.CSSProperties = { fontSize: 15, margin: '0 0 8px 0' }
const label: React.CSSProperties = { display: 'flex', flexDirection: 'column' as const, marginBottom: 10 }
const labelText: React.CSSProperties = { fontSize: 13, fontWeight: 500, marginBottom: 4 }
const input: React.CSSProperties = { padding: '6px 10px', border: '1px solid #d0d0d0', borderRadius: 4, fontSize: 14 }
const primaryButton: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: 14,
  background: '#0059b3',
  color: '#fff',
  border: '1px solid #0059b3',
  borderRadius: 4,
  cursor: 'pointer',
}
