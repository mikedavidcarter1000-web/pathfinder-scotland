'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import type { DashboardMe } from '@/components/school-dashboard/types'

type Indicator = { id: string; indicator_code: string; indicator_name: string; category: string }
type Evidence = {
  id: string
  indicator_id: string | null
  evidence_type: string
  title: string
  description: string
  source: string | null
  academic_year: string
  created_at: string
}

const AUTO_GEN_CODES = new Set(['1.5', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3'])

export default function InspectionPortfolioPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [me, setMe] = useState<DashboardMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1']))

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/auth/sign-in?redirect=/school/inspection'); return }
    Promise.all([
      fetch('/api/school/me').then((r) => r.status === 403 ? null : r.json()),
      fetch('/api/school/inspection/evidence').then((r) => r.json()),
    ]).then(([meData, evData]) => {
      if (meData) setMe(meData)
      if (evData) {
        setIndicators(evData.indicators ?? [])
        setEvidence(evData.evidence ?? [])
      }
    }).finally(() => setLoading(false))
  }, [authLoading, user, router])

  if (loading || authLoading) return <div className="pf-container pt-8 pb-12"><p>Loading inspection portfolio…</p></div>
  if (!me || !me.school) return null
  const isLeadership = me.staff.role === 'depute' || me.staff.role === 'head_teacher' || me.staff.isAdmin

  const byCategory = new Map<string, Indicator[]>()
  for (const i of indicators) {
    const arr = byCategory.get(i.category) ?? []
    arr.push(i); byCategory.set(i.category, arr)
  }
  const categories = Array.from(byCategory.keys()).sort()

  async function generateFor(code: string, indicatorId: string) {
    setGenerating(code)
    const resp = await fetch('/api/school/inspection/auto-generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ indicator_code: code }),
    })
    setGenerating(null)
    if (resp.ok) {
      const refresh = await fetch('/api/school/inspection/evidence').then((r) => r.json())
      setEvidence(refresh.evidence ?? [])
      alert('Evidence statements generated and added to portfolio.')
    } else {
      alert('Failed to generate evidence.')
    }
  }

  async function addManualEvidence(indicatorId: string, title: string, description: string, type: string, source: string) {
    const resp = await fetch('/api/school/inspection/evidence', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        indicator_id: indicatorId,
        title, description, evidence_type: type, source,
        academic_year: new Date().getFullYear().toString(),
      }),
    })
    if (resp.ok) {
      const refresh = await fetch('/api/school/inspection/evidence').then((r) => r.json())
      setEvidence(refresh.evidence ?? [])
      setAddingFor(null)
    }
  }

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 1100 }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem', margin: '0 0 4px 0' }}>HGIOS4 inspection evidence portfolio</h1>
      <p style={{ opacity: 0.7, fontSize: 14, margin: '0 0 8px 0' }}>{me.school.name}</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link href="/school/inspection/curriculum" style={primaryBtnLink}>Curriculum rationale</Link>
        <Link href="/api/school/inspection/report" target="_blank" style={ghostBtnLink}>Generate inspection report</Link>
      </div>

      {categories.map((cat) => {
        const categoryNumber = (byCategory.get(cat) ?? [])[0]?.indicator_code.split('.')[0] ?? cat
        const isExpanded = expanded.has(categoryNumber)
        return (
          <section key={cat} style={{ ...card, marginBottom: 12 }}>
            <button
              onClick={() => setExpanded((prev) => {
                const next = new Set(prev)
                if (next.has(categoryNumber)) next.delete(categoryNumber); else next.add(categoryNumber)
                return next
              })}
              style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontSize: '1.05rem', fontWeight: 700 }}
            >
              {isExpanded ? '▼' : '▶'} {cat}
            </button>
            {isExpanded && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(byCategory.get(cat) ?? []).map((ind) => {
                  const items = evidence.filter((e) => e.indicator_id === ind.id)
                  return (
                    <div key={ind.id} style={subCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
                        <div>
                          <strong>QI {ind.indicator_code}</strong> {ind.indicator_name}
                          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                            {items.length} evidence item{items.length === 1 ? '' : 's'} captured
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {AUTO_GEN_CODES.has(ind.indicator_code) && isLeadership && (
                            <button style={ghostBtn} disabled={generating === ind.indicator_code} onClick={() => generateFor(ind.indicator_code, ind.id)}>
                              {generating === ind.indicator_code ? 'Generating…' : 'Auto-generate'}
                            </button>
                          )}
                          <button style={ghostBtn} onClick={() => setAddingFor(addingFor === ind.id ? null : ind.id)}>
                            {addingFor === ind.id ? 'Cancel' : '+ Add evidence'}
                          </button>
                        </div>
                      </div>

                      {addingFor === ind.id && <ManualEvidenceForm indicatorId={ind.id} onSubmit={addManualEvidence} onCancel={() => setAddingFor(null)} />}

                      {items.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {items.map((e) => (
                            <li key={e.id} style={{ padding: 10, background: 'white', border: '1px solid #e5e7eb', borderRadius: 4 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                                <strong>{e.title}</strong>
                                <span style={{ fontSize: 11, padding: '2px 6px', background: evidenceTypeBg(e.evidence_type), color: evidenceTypeColor(e.evidence_type), borderRadius: 3 }}>
                                  {e.evidence_type}
                                </span>
                              </div>
                              <p style={{ fontSize: 13, margin: '6px 0 0 0' }}>{e.description}</p>
                              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                                {new Date(e.created_at).toLocaleDateString('en-GB')} · {e.source ?? 'manual'}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ManualEvidenceForm({ indicatorId, onSubmit, onCancel }: { indicatorId: string; onSubmit: (id: string, title: string, description: string, type: string, source: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [evidenceType, setEvidenceType] = useState('qualitative')
  const [source, setSource] = useState('')
  return (
    <div style={{ marginTop: 12, padding: 12, background: 'white', borderRadius: 4, border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
        <label style={labelStyle}>Title<input value={title} onChange={(e) => setTitle(e.target.value)} style={input} /></label>
        <label style={labelStyle}>Type
          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)} style={input}>
            {['qualitative', 'quantitative', 'observation', 'stakeholder_voice', 'document'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label style={labelStyle}>Source<input value={source} onChange={(e) => setSource(e.target.value)} style={input} /></label>
      </div>
      <label style={labelStyle}>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...input, minHeight: 60 }} /></label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button style={primaryBtn} onClick={() => onSubmit(indicatorId, title, description, evidenceType, source)} disabled={!title || !description}>Save evidence</button>
        <button style={ghostBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function evidenceTypeBg(t: string): string {
  switch (t) {
    case 'quantitative': return '#dbeafe'
    case 'qualitative': return '#f3e8ff'
    case 'observation': return '#d1fae5'
    case 'stakeholder_voice': return '#fef3c7'
    default: return '#f1f5f9'
  }
}
function evidenceTypeColor(t: string): string {
  switch (t) {
    case 'quantitative': return '#1d4ed8'
    case 'qualitative': return '#7c3aed'
    case 'observation': return '#047857'
    case 'stakeholder_voice': return '#b45309'
    default: return '#334155'
  }
}

const card: React.CSSProperties = { background: 'white', border: '1px solid var(--pf-grey-200, #e5e7eb)', borderRadius: 8, padding: 16 }
const subCard: React.CSSProperties = { background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }
const input: React.CSSProperties = { display: 'block', padding: '6px 10px', border: '1px solid var(--pf-grey-300, #cbd5e1)', borderRadius: 4, fontSize: 14, width: '100%' }
const labelStyle: React.CSSProperties = { fontSize: 13, display: 'block', marginTop: 6 }
const primaryBtn: React.CSSProperties = { padding: '6px 12px', background: 'var(--pf-blue-700, #1D4ED8)', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }
const primaryBtnLink: React.CSSProperties = { padding: '8px 14px', background: 'var(--pf-blue-700, #1D4ED8)', color: 'white', textDecoration: 'none', borderRadius: 4, fontWeight: 600, fontSize: 14 }
const ghostBtn: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: 'var(--pf-blue-700, #1D4ED8)', border: '1px solid var(--pf-blue-200, #bfdbfe)', borderRadius: 4, fontSize: 13, cursor: 'pointer' }
const ghostBtnLink: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: 'var(--pf-blue-700, #1D4ED8)', border: '1px solid var(--pf-blue-200, #bfdbfe)', borderRadius: 4, fontSize: 13, textDecoration: 'none' }
