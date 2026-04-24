'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Indicator = { id: string; indicator_code: string; indicator_name: string }

type CpdRecord = {
  id: string
  staff_id: string
  title: string
  provider: string | null
  cpd_type: string
  date_completed: string
  hours: number | null
  reflection: string | null
  impact_on_practice: string | null
  hgios4_indicator_id: string | null
  gtcs_standard: string | null
  evidence_url: string | null
  indicator: Indicator | null
}

type StaffSummary = {
  staff_id: string
  full_name: string
  role: string
  department: string | null
  total_hours: number
  total_records: number
  last_cpd_date: string | null
  gtcs_standards_covered: string[]
  hgios4_indicators_covered: number
}

type Me = { staff: { staffId: string; role: string; isAdmin: boolean; fullName: string; department: string | null } }

type Tab = 'mine' | 'school' | 'by_indicator' | 'prd'

const CPD_TYPES = [
  ['course', 'Course'], ['conference', 'Conference'], ['workshop', 'Workshop'],
  ['self_study', 'Self-study'], ['peer_observation', 'Peer observation'],
  ['masters', 'Masters-level study'], ['teacher_led_research', 'Teacher-led research'],
  ['collaborative_enquiry', 'Collaborative enquiry'], ['other', 'Other'],
] as const

const GTCS_LABELS: Record<string, string> = {
  professional_values: 'Professional Values',
  professional_knowledge: 'Professional Knowledge',
  professional_skills: 'Professional Skills',
}

export default function CpdPage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('mine')

  const [myCpd, setMyCpd] = useState<CpdRecord[]>([])
  const [allCpd, setAllCpd] = useState<CpdRecord[]>([])
  const [schoolSummary, setSchoolSummary] = useState<{ staff: StaffSummary[]; total_hours: number; average_hours: number; staff_zero_cpd: number } | null>(null)
  const [byIndicator, setByIndicator] = useState<{ indicator_id: string; indicator_code: string; indicator_name: string; record_count: number; hours: number; unique_staff: number }[]>([])
  const [indicators, setIndicators] = useState<Indicator[]>([])

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CpdRecord | null>(null)

  useEffect(() => {
    fetch('/api/school/me')
      .then((r) => (r.status === 403 ? null : r.json()))
      .then((d) => {
        if (!d) { router.replace('/school/register'); return }
        setMe(d)
      })
      .finally(() => setLoading(false))
    fetch('/api/school/cpd/indicators').then((r) => r.json()).then((d) => setIndicators(d.indicators ?? []))
  }, [router])

  const loadMine = useCallback(async () => {
    const r = await fetch('/api/school/cpd?scope=mine')
    if (!r.ok) return
    const d = await r.json()
    setMyCpd(d.records ?? [])
  }, [])
  const loadSchool = useCallback(async () => {
    const [a, b] = await Promise.all([
      fetch('/api/school/cpd?scope=all').then((r) => r.ok ? r.json() : { records: [] }),
      fetch('/api/school/cpd/summary').then((r) => r.ok ? r.json() : null),
    ])
    setAllCpd(a.records ?? [])
    if (b) {
      setSchoolSummary(b.summary)
      setByIndicator(b.by_indicator ?? [])
    }
  }, [])

  useEffect(() => {
    if (!me) return
    if (tab === 'mine') loadMine()
    else if (tab === 'school' || tab === 'by_indicator') loadSchool()
  }, [me, tab, loadMine, loadSchool])

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading CPD…</p></div>
  if (!me) return null

  const isLeadership = me.staff.isAdmin || me.staff.role === 'depute' || me.staff.role === 'head_teacher'

  const totalMyHours = myCpd.reduce((a, r) => a + Number(r.hours ?? 0), 0)

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem' }}>CPD</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.7 }}>Continuing Professional Development log for GTCS Professional Update and PRD evidence.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/school/dashboard" style={linkBtn}>&larr; Dashboard</Link>
          <a href={`/api/school/cpd/prd?staff_id=${me.staff.staffId}`} target="_blank" rel="noreferrer" style={linkBtn}>My PRD summary</a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          {isLeadership && <a href="/api/school/cpd/export" style={linkBtn}>Export school CPD (CSV)</a>}
        </div>
      </div>

      <div style={tabStrip}>
        <button onClick={() => setTab('mine')} style={{ ...tabBtn, ...(tab === 'mine' ? tabActive : {}) }}>My CPD</button>
        {isLeadership && <button onClick={() => setTab('school')} style={{ ...tabBtn, ...(tab === 'school' ? tabActive : {}) }}>School CPD</button>}
        {isLeadership && <button onClick={() => setTab('by_indicator')} style={{ ...tabBtn, ...(tab === 'by_indicator' ? tabActive : {}) }}>By HGIOS4 QI</button>}
      </div>

      {tab === 'mine' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '6px 14px', borderRadius: 4, fontWeight: 600 }}>
              Total CPD this year: {Math.round(totalMyHours * 10) / 10} hours
            </div>
            <button onClick={() => { setEditing(null); setShowForm(true) }} style={primaryBtn}>+ Log CPD</button>
          </div>

          {myCpd.length === 0 && <p><em>No CPD logged yet this academic year. Click "+ Log CPD" to add your first activity.</em></p>}
          {myCpd.map((r) => (
            <div key={r.id} style={recordCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <b style={{ fontSize: 16 }}>{r.title}</b>
                  {r.provider && <span style={{ color: '#6b7280' }}> — {r.provider}</span>}
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                    {new Date(r.date_completed).toLocaleDateString('en-GB')} · {cpdLabel(r.cpd_type)} · {r.hours ?? 0} hrs
                    {r.gtcs_standard ? ` · ${GTCS_LABELS[r.gtcs_standard]}` : ''}
                    {r.indicator ? ` · QI ${r.indicator.indicator_code} ${r.indicator.indicator_name}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setEditing(r); setShowForm(true) }} style={smallBtn}>Edit</button>
                  <button onClick={() => deleteRecord(r.id).then(loadMine)} style={{ ...smallBtn, color: '#b91c1c' }}>Delete</button>
                </div>
              </div>
              {r.reflection && <div style={reflect}><b>Reflection:</b> {r.reflection}</div>}
              {r.impact_on_practice && <div style={reflect}><b>Impact on practice:</b> {r.impact_on_practice}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'school' && schoolSummary && isLeadership && (
        <div style={{ marginTop: 16 }}>
          <div style={statsGrid}>
            <Stat label="Total staff CPD hours" value={String(schoolSummary.total_hours)} />
            <Stat label="Average hours per staff" value={String(schoolSummary.average_hours)} />
            <Stat label="Staff with 0 hours logged" value={String(schoolSummary.staff_zero_cpd)} note={schoolSummary.staff_zero_cpd > 0 ? 'follow up before PRD' : 'all staff engaged'} />
          </div>

          <h2 style={{ fontSize: '1.1rem', margin: '20px 0 8px' }}>Staff CPD summary</h2>
          <table style={tbl}>
            <thead><tr><th style={th}>Staff</th><th style={th}>Role</th><th style={th}>Department</th><th style={th}>Hours</th><th style={th}>Activities</th><th style={th}>Last date</th><th style={th}>GTCS standards</th><th style={th}>PRD</th></tr></thead>
            <tbody>
              {schoolSummary.staff.map((s) => (
                <tr key={s.staff_id} style={{ background: s.total_records === 0 ? '#fef2f2' : 'transparent' }}>
                  <td style={td}><b>{s.full_name}</b></td>
                  <td style={td}>{labelRole(s.role)}</td>
                  <td style={td}>{s.department ?? '—'}</td>
                  <td style={td}>{s.total_hours}</td>
                  <td style={td}>{s.total_records}</td>
                  <td style={td}>{s.last_cpd_date ? new Date(s.last_cpd_date).toLocaleDateString('en-GB') : '—'}</td>
                  <td style={td}>{s.gtcs_standards_covered.length} / 3</td>
                  <td style={td}><a href={`/api/school/cpd/prd?staff_id=${s.staff_id}`} target="_blank" rel="noreferrer" style={smallLinkBtn}>Print PRD</a></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ fontSize: '1.1rem', margin: '20px 0 8px' }}>All CPD activities this year</h2>
          {allCpd.slice(0, 50).map((r) => (
            <div key={r.id} style={{ ...recordCard, background: '#f9fafb' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(r.date_completed).toLocaleDateString('en-GB')} · {r.hours ?? 0} hrs</div>
              <b>{r.title}</b>
              {r.provider && <span style={{ color: '#6b7280' }}> — {r.provider}</span>}
              {r.indicator && <div style={{ fontSize: 12, color: '#6b7280' }}>QI {r.indicator.indicator_code} {r.indicator.indicator_name}</div>}
            </div>
          ))}
          {allCpd.length > 50 && <p style={{ fontSize: 12, color: '#6b7280' }}>Showing first 50 of {allCpd.length}. Export CSV for the full list.</p>}
        </div>
      )}

      {tab === 'by_indicator' && isLeadership && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>CPD linked to HGIOS4 indicators</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 10px' }}>This is inspection-relevant evidence. Indicators with zero CPD records are candidates for the next improvement plan.</p>
          <table style={tbl}>
            <thead><tr><th style={th}>QI</th><th style={th}>Indicator</th><th style={th}>CPD records</th><th style={th}>Hours</th><th style={th}>Staff</th></tr></thead>
            <tbody>
              {byIndicator.map((i) => (
                <tr key={i.indicator_id} style={{ background: i.record_count === 0 ? '#fef2f2' : 'transparent' }}>
                  <td style={td}>{i.indicator_code}</td>
                  <td style={td}>{i.indicator_name}</td>
                  <td style={td}>{i.record_count}</td>
                  <td style={td}>{i.hours}</td>
                  <td style={td}>{i.unique_staff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <CpdForm
          existing={editing}
          indicators={indicators}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadMine() }}
        />
      )}
    </div>
  )
}

async function deleteRecord(id: string): Promise<void> {
  if (!confirm('Delete this CPD record?')) return
  await fetch(`/api/school/cpd/${id}`, { method: 'DELETE' })
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, background: '#fff' }}>
      <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>{value}</div>
      {note && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{note}</div>}
    </div>
  )
}

function CpdForm({ existing, indicators, onClose, onSaved }: { existing: CpdRecord | null; indicators: Indicator[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    provider: existing?.provider ?? '',
    cpd_type: existing?.cpd_type ?? 'course',
    date_completed: existing?.date_completed ?? new Date().toISOString().slice(0, 10),
    hours: existing?.hours ?? '',
    reflection: existing?.reflection ?? '',
    impact_on_practice: existing?.impact_on_practice ?? '',
    hgios4_indicator_id: existing?.hgios4_indicator_id ?? '',
    gtcs_standard: existing?.gtcs_standard ?? '',
    evidence_url: existing?.evidence_url ?? '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.title.trim()) return
    if ((form.reflection ?? '').length < 50) {
      if (!confirm('Your reflection is under 50 characters — GTCS Professional Update guidance suggests a fuller reflection. Save anyway?')) return
    }
    setSaving(true)
    const url = existing ? `/api/school/cpd/${existing.id}` : '/api/school/cpd'
    const method = existing ? 'PUT' : 'POST'
    const payload = { ...form, hours: form.hours === '' ? null : Number(form.hours) }
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (r.ok) onSaved()
    else alert('Failed to save')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 'min(720px, 95vw)', padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{existing ? 'Edit CPD record' : 'Log CPD activity'}</h2>
          <button onClick={onClose} style={smallBtn}>Close</button>
        </div>

        <label style={lbl}>Title *<input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Nurture principles for secondary classrooms" /></label>
        <label style={lbl}>Provider<input style={input} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="e.g. Education Scotland, GTCS, West Lothian Council" /></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <label style={lbl}>Type
            <select style={input} value={form.cpd_type} onChange={(e) => setForm({ ...form, cpd_type: e.target.value })}>
              {CPD_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label style={lbl}>Date completed<input style={input} type="date" value={form.date_completed} onChange={(e) => setForm({ ...form, date_completed: e.target.value })} /></label>
          <label style={lbl}>Hours<input style={input} type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></label>
        </div>
        <label style={lbl}>Reflection (min 50 chars recommended for GTCS PU)
          <textarea style={{ ...input, minHeight: 80 }} value={form.reflection} onChange={(e) => setForm({ ...form, reflection: e.target.value })} />
          <div style={{ fontSize: 11, color: '#6b7280' }}>{(form.reflection ?? '').length} chars</div>
        </label>
        <label style={lbl}>Impact on practice
          <textarea style={{ ...input, minHeight: 60 }} value={form.impact_on_practice} onChange={(e) => setForm({ ...form, impact_on_practice: e.target.value })} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <label style={lbl}>HGIOS4 indicator
            <select style={input} value={form.hgios4_indicator_id ?? ''} onChange={(e) => setForm({ ...form, hgios4_indicator_id: e.target.value })}>
              <option value="">—</option>
              {indicators.map((i) => <option key={i.id} value={i.id}>{i.indicator_code} {i.indicator_name}</option>)}
            </select>
          </label>
          <label style={lbl}>GTCS standard
            <select style={input} value={form.gtcs_standard ?? ''} onChange={(e) => setForm({ ...form, gtcs_standard: e.target.value })}>
              <option value="">—</option>
              <option value="professional_values">Professional Values and Personal Commitment</option>
              <option value="professional_knowledge">Professional Knowledge and Understanding</option>
              <option value="professional_skills">Professional Skills and Abilities</option>
            </select>
          </label>
        </div>
        <label style={lbl}>Evidence URL (optional)<input style={input} value={form.evidence_url ?? ''} onChange={(e) => setForm({ ...form, evidence_url: e.target.value })} placeholder="e.g. link to certificate or blog post" /></label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
          <button onClick={onClose} style={smallBtn}>Cancel</button>
          <button onClick={save} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

function cpdLabel(t: string): string {
  const found = CPD_TYPES.find(([v]) => v === t)
  return found ? found[1] : t
}
function labelRole(r: string): string {
  return ({ class_teacher: 'Class teacher', faculty_head: 'Faculty head', guidance_teacher: 'Guidance', pt_guidance: 'PT Guidance', dyw_coordinator: 'DYW', depute: 'Depute', head_teacher: 'Head teacher', admin: 'Admin' } as Record<string, string>)[r] ?? r
}

const tabStrip: React.CSSProperties = { display: 'flex', gap: 4, borderBottom: '2px solid #e5e7eb', overflowX: 'auto' }
const tabBtn: React.CSSProperties = { padding: '10px 14px', border: 'none', borderBottom: '2px solid transparent', marginBottom: -2, background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', color: '#374151', whiteSpace: 'nowrap' }
const tabActive: React.CSSProperties = { borderBottomColor: '#1D4ED8', color: '#1D4ED8' }
const linkBtn: React.CSSProperties = { padding: '6px 12px', background: '#EFF6FF', color: '#1D4ED8', textDecoration: 'none', borderRadius: 4, fontWeight: 500, border: '1px solid #BFDBFE', fontSize: 13 }
const smallLinkBtn: React.CSSProperties = { padding: '3px 8px', background: '#EFF6FF', color: '#1D4ED8', textDecoration: 'none', borderRadius: 3, fontWeight: 500, border: '1px solid #BFDBFE', fontSize: 11 }
const primaryBtn: React.CSSProperties = { padding: '8px 14px', background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }
const smallBtn: React.CSSProperties = { padding: '4px 10px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 4, fontWeight: 500, cursor: 'pointer', fontSize: 13, marginRight: 4 }
const input: React.CSSProperties = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, width: '100%' }
const lbl: React.CSSProperties = { display: 'block', margin: '6px 0', fontSize: 13, fontWeight: 500 }
const statsGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14, background: '#fff' }
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }
const recordCard: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, margin: '10px 0', background: '#fff' }
const reflect: React.CSSProperties = { fontSize: 13, marginTop: 6, color: '#374151', lineHeight: 1.4 }
