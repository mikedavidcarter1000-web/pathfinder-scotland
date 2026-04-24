'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import type { DashboardMe } from '@/components/school-dashboard/types'

type RationaleData = {
  school_context: string
  subject_offer: string
  labour_market: string
  destinations: string
  widening_access: string
  rationale_statement: string
  ces_snapshot?: { self: number; strengths: number; horizons: number; networks: number }
}

type Rationale = {
  id?: string
  academic_year: string
  rationale_data: RationaleData
  vision_statement?: string | null
  local_context?: string | null
  published_at?: string | null
}

export default function CurriculumRationalePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [me, setMe] = useState<DashboardMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [rationale, setRationale] = useState<Rationale | null>(null)
  const [saving, setSaving] = useState(false)
  const [academicYear] = useState(() => new Date().getFullYear().toString())

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/auth/sign-in?redirect=/school/inspection/curriculum'); return }
    Promise.all([
      fetch('/api/school/me').then((r) => (r.status === 403 ? null : r.json())),
      fetch(`/api/school/inspection/curriculum?academic_year=${academicYear}`).then((r) => r.json()),
    ]).then(([meData, cr]) => {
      if (meData) setMe(meData)
      if (cr?.rationale) setRationale(cr.rationale)
      else if (cr?.draft) setRationale(cr.draft)
    }).finally(() => setLoading(false))
  }, [authLoading, user, router, academicYear])

  if (loading || authLoading) return <div className="pf-container pt-8 pb-12"><p>Loading curriculum rationale…</p></div>
  if (!me || !me.school) return null

  const isLeadership = me.staff.role === 'depute' || me.staff.role === 'head_teacher' || me.staff.isAdmin
  if (!isLeadership) {
    return (
      <div className="pf-container pt-8 pb-12">
        <h1>Curriculum rationale</h1>
        <p>This page is available to depute heads, head teachers, and school administrators.</p>
      </div>
    )
  }

  async function save(publish: boolean) {
    if (!rationale) return
    setSaving(true)
    const resp = await fetch('/api/school/inspection/curriculum', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        academic_year: rationale.academic_year,
        rationale_data: rationale.rationale_data,
        vision_statement: rationale.vision_statement ?? null,
        local_context: rationale.local_context ?? null,
        publish,
      }),
    })
    setSaving(false)
    if (resp.ok) {
      const d = await resp.json()
      setRationale(d.rationale)
      alert(publish ? 'Curriculum rationale published.' : 'Draft saved.')
    }
  }

  if (!rationale) return <div className="pf-container pt-8 pb-12"><p>No rationale data available.</p></div>

  const update = (key: keyof RationaleData, value: string) => {
    setRationale({ ...rationale, rationale_data: { ...rationale.rationale_data, [key]: value } })
  }

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 900 }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem', margin: '0 0 4px 0' }}>Curriculum rationale</h1>
      <p style={{ opacity: 0.7, fontSize: 14, margin: '0 0 8px 0' }}>{me.school.name} · Academic year {rationale.academic_year}</p>
      <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 20px 0' }}>
        Each section below is auto-populated from Pathfinder data. Edit to add local context before publishing.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link href="/school/inspection" style={ghostBtnLink}>← Back to portfolio</Link>
        {rationale.published_at && <span style={{ fontSize: 13, color: '#059669' }}>Published {new Date(rationale.published_at).toLocaleDateString('en-GB')}</span>}
      </div>

      <Section label="1. School context" value={rationale.rationale_data.school_context} onChange={(v) => update('school_context', v)} />
      <Section label="2. Subject offer" value={rationale.rationale_data.subject_offer} onChange={(v) => update('subject_offer', v)} />
      <Section label="3. Labour market alignment" value={rationale.rationale_data.labour_market} onChange={(v) => update('labour_market', v)} />
      <Section label="4. Destinations" value={rationale.rationale_data.destinations} onChange={(v) => update('destinations', v)} />
      <Section label="5. Widening access" value={rationale.rationale_data.widening_access} onChange={(v) => update('widening_access', v)} />
      <Section label="6. Rationale statement" value={rationale.rationale_data.rationale_statement} onChange={(v) => update('rationale_statement', v)} />
      <Section label="Vision statement (optional)" value={rationale.vision_statement ?? ''} onChange={(v) => setRationale({ ...rationale, vision_statement: v })} />
      <Section label="Local context (optional)" value={rationale.local_context ?? ''} onChange={(v) => setRationale({ ...rationale, local_context: v })} />

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button style={primaryBtn} disabled={saving} onClick={() => save(false)}>{saving ? 'Saving…' : 'Save draft'}</button>
        <button style={{ ...primaryBtn, background: '#059669' }} disabled={saving} onClick={() => save(true)}>Publish</button>
      </div>
    </div>
  )
}

function Section({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--pf-grey-200, #e5e7eb)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <strong>{label}</strong>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', marginTop: 8, padding: 10, border: '1px solid var(--pf-grey-300, #cbd5e1)', borderRadius: 4, fontSize: 14, minHeight: 80, fontFamily: 'inherit' }}
      />
    </div>
  )
}

const primaryBtn: React.CSSProperties = { padding: '8px 14px', background: 'var(--pf-blue-700, #1D4ED8)', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }
const ghostBtnLink: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: 'var(--pf-blue-700, #1D4ED8)', border: '1px solid var(--pf-blue-200, #bfdbfe)', borderRadius: 4, fontSize: 13, textDecoration: 'none' }
