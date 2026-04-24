'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Sector = { id: string; name: string; slug: string }
type Overview = {
  active_partners: number
  engaged_partners: number
  total_contacts: number
  placements_this_year: number
  placements_completed_this_year: number
  distinct_students_placed: number
  linked_student_total: number
  student_reach_pct: number
  sectors_covered: number
  sectors_total: number
  dormant_count: number
  average_student_rating: number | null
  average_employer_rating: number | null
}
type Pipeline = { status: string; label: string; count: number }[]
type SectorCov = { sector_id: string; name: string; slug: string; active_partners: number; engaged_partners: number; total_contacts: number; placements_this_year: number }[]
type Networks = {
  score: number
  components: {
    active_partners: { score: number; value: number; max_value: number }
    placements: { score: number; value: number; max_value: number }
    student_reach: { score: number; value: number; max_value: number }
    sector_coverage: { score: number; value: number; max_value: number }
  }
  evidence_statement: string
}

type Employer = {
  id: string
  company_name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_role: string | null
  sector_id: string | null
  sector: { id: string; name: string; slug: string } | null
  partnership_types: string[]
  relationship_status: string
  notes: string | null
  last_contacted_at: string | null
  first_contacted_at: string | null
  website: string | null
  address: string | null
}

type Placement = {
  id: string
  title: string
  placement_type: string
  status: string
  start_date: string | null
  end_date: string | null
  hours: number | null
  is_group_event: boolean
  group_year_groups: string[] | null
  group_student_count: number | null
  employer_id: string | null
  employer: { id: string; company_name: string } | null
  student_id: string | null
  student_name?: string | null
  student_rating: number | null
  employer_rating: number | null
  student_feedback: string | null
  employer_feedback: string | null
  health_safety_completed: boolean
  parental_consent_received: boolean
  supervisor_name: string | null
  supervisor_email: string | null
  description: string | null
  linked_sector_id: string | null
}

type Me = {
  staff: {
    role: string
    isAdmin: boolean
    canViewIndividualStudents: boolean
    fullName: string
  }
}

type Tab = 'overview' | 'employers' | 'placements' | 'pipeline' | 'sectors'

const STATUS_COLOURS: Record<string, string> = {
  identified: '#94a3b8',
  contacted: '#60a5fa',
  engaged: '#f59e0b',
  active_partner: '#10b981',
  dormant: '#6b7280',
}

export default function DywDashboardPage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')

  const [overview, setOverview] = useState<Overview | null>(null)
  const [pipeline, setPipeline] = useState<Pipeline>([])
  const [sectorCov, setSectorCov] = useState<SectorCov>([])
  const [networks, setNetworks] = useState<Networks | null>(null)
  const [employers, setEmployers] = useState<Employer[]>([])
  const [placements, setPlacements] = useState<Placement[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])

  const [employerFilter, setEmployerFilter] = useState({ status: '', sector_id: '', search: '' })
  const [placementFilter, setPlacementFilter] = useState({ status: '', type: '' })

  const [showEmployerForm, setShowEmployerForm] = useState(false)
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null)
  const [showPlacementForm, setShowPlacementForm] = useState(false)
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null)
  const [logContactOpen, setLogContactOpen] = useState<Employer | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState<Placement | null>(null)

  useEffect(() => {
    fetch('/api/school/me')
      .then((r) => (r.status === 403 ? null : r.json()))
      .then((d) => {
        if (!d) {
          router.replace('/school/register')
          return
        }
        setMe(d)
        const role = d.staff.role
        const canAccess = d.staff.isAdmin || role === 'dyw_coordinator' || role === 'depute' || role === 'head_teacher'
        if (!canAccess) {
          router.replace('/school/dashboard')
          return
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const loadOverview = useCallback(async () => {
    const r = await fetch('/api/school/dyw/overview')
    if (!r.ok) return
    const d = await r.json()
    setOverview(d.overview)
    setPipeline(d.pipeline)
    setSectorCov(d.sectors)
    setNetworks(d.networks)
  }, [])

  const loadEmployers = useCallback(async () => {
    const qs = new URLSearchParams()
    if (employerFilter.status) qs.set('status', employerFilter.status)
    if (employerFilter.sector_id) qs.set('sector_id', employerFilter.sector_id)
    if (employerFilter.search) qs.set('search', employerFilter.search)
    const r = await fetch(`/api/school/dyw/employers?${qs}`)
    if (!r.ok) return
    const d = await r.json()
    setEmployers(d.employers ?? [])
  }, [employerFilter])

  const loadPlacements = useCallback(async () => {
    const qs = new URLSearchParams()
    if (placementFilter.status) qs.set('status', placementFilter.status)
    if (placementFilter.type) qs.set('type', placementFilter.type)
    const r = await fetch(`/api/school/dyw/placements?${qs}`)
    if (!r.ok) return
    const d = await r.json()
    setPlacements(d.placements ?? [])
  }, [placementFilter])

  useEffect(() => {
    if (!me) return
    loadOverview()
    // Sectors list once.
    fetch('/api/school/dyw/employers?').catch(() => null)
    fetch('/api/school/dyw/overview')
      .then((r) => r.json())
      .then((d) => setSectors((d.sectors ?? []).map((s: SectorCov[number]) => ({ id: s.sector_id, name: s.name, slug: s.slug }))))
  }, [me, loadOverview])

  useEffect(() => {
    if (!me) return
    if (tab === 'employers') loadEmployers()
    if (tab === 'placements') loadPlacements()
  }, [me, tab, loadEmployers, loadPlacements])

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading DYW…</p></div>
  if (!me) return null

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem' }}>DYW Dashboard</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.7 }}>Employers, placements, and career events for Developing the Young Workforce.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/school/dashboard" style={linkBtn}>&larr; Dashboard</Link>
          <a href="/api/school/dyw/annual-report" target="_blank" rel="noreferrer" style={linkBtn}>Annual report</a>
          <a href="/api/school/dyw/export?kind=employers" style={linkBtn}>Export employers (CSV)</a>
          <a href="/api/school/dyw/export?kind=placements" style={linkBtn}>Export placements (CSV)</a>
        </div>
      </div>

      <div style={tabStrip} role="tablist">
        {(['overview','employers','placements','pipeline','sectors'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ ...tabBtn, ...(tab === t ? tabActive : {}) }}>{tabLabel(t)}</button>
        ))}
      </div>

      {tab === 'overview' && overview && networks && (
        <div style={{ marginTop: 16 }}>
          <div style={statsGrid}>
            <Stat label="Active partners" value={String(overview.active_partners)} note={overview.engaged_partners ? `${overview.engaged_partners} engaged` : undefined} />
            <Stat label="Placements this year" value={String(overview.placements_this_year)} note={`${overview.placements_completed_this_year} completed`} />
            <Stat label="Distinct students placed" value={String(overview.distinct_students_placed)} note={`${overview.student_reach_pct}% of cohort`} />
            <Stat label="Sector coverage" value={`${overview.sectors_covered} / 19`} note="active partners" />
            <Stat label="Total contacts" value={String(overview.total_contacts)} note={overview.dormant_count ? `${overview.dormant_count} dormant` : undefined} />
            <Stat label="CES Networks score" value={`${networks.score} / 100`} note="live from DYW data" />
          </div>

          <section style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>CES Networks capacity breakdown</h2>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }}>
              <p style={{ margin: '0 0 10px', fontStyle: 'italic', color: '#4b5563', fontSize: 13 }}>{networks.evidence_statement}</p>
              <table style={tbl}>
                <thead><tr><th style={th}>Component</th><th style={th}>Value</th><th style={th}>Score</th></tr></thead>
                <tbody>
                  <tr><td style={td}>Active partners (full score at 5)</td><td style={td}>{networks.components.active_partners.value}</td><td style={td}>{networks.components.active_partners.score} / 25</td></tr>
                  <tr><td style={td}>Placements completed (full score at 20)</td><td style={td}>{networks.components.placements.value}</td><td style={td}>{networks.components.placements.score} / 25</td></tr>
                  <tr><td style={td}>Student reach % (full score at 50%)</td><td style={td}>{networks.components.student_reach.value}%</td><td style={td}>{networks.components.student_reach.score} / 25</td></tr>
                  <tr><td style={td}>Sector coverage (full score at 10 of 19)</td><td style={td}>{networks.components.sector_coverage.value}</td><td style={td}>{networks.components.sector_coverage.score} / 25</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {(overview.average_student_rating != null || overview.average_employer_rating != null) && (
            <section style={{ marginTop: 20 }}>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>Feedback averages</h2>
              <p>Student rating: <b>{overview.average_student_rating ?? 'n/a'}</b> / 5 · Employer rating: <b>{overview.average_employer_rating ?? 'n/a'}</b> / 5</p>
            </section>
          )}
        </div>
      )}

      {tab === 'employers' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
            <select value={employerFilter.status} onChange={(e) => setEmployerFilter({ ...employerFilter, status: e.target.value })} style={input}>
              <option value="">All statuses</option>
              <option value="identified">Identified</option>
              <option value="contacted">Contacted</option>
              <option value="engaged">Engaged</option>
              <option value="active_partner">Active partner</option>
              <option value="dormant">Dormant</option>
            </select>
            <select value={employerFilter.sector_id} onChange={(e) => setEmployerFilter({ ...employerFilter, sector_id: e.target.value })} style={input}>
              <option value="">All sectors</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input placeholder="Search company / contact" value={employerFilter.search} onChange={(e) => setEmployerFilter({ ...employerFilter, search: e.target.value })} style={{ ...input, minWidth: 220 }} />
            <button onClick={() => { setEditingEmployer(null); setShowEmployerForm(true) }} style={primaryBtn}>+ Add employer</button>
          </div>

          <table style={tbl}>
            <thead><tr>
              <th style={th}>Company</th><th style={th}>Sector</th><th style={th}>Contact</th>
              <th style={th}>Status</th><th style={th}>Partnership types</th><th style={th}>Last contacted</th>
              <th style={th}>Actions</th>
            </tr></thead>
            <tbody>
              {employers.length === 0 && <tr><td style={td} colSpan={7}><em>No employers match the filters. Use "+ Add employer" to start.</em></td></tr>}
              {employers.map((e) => (
                <tr key={e.id}>
                  <td style={td}><b>{e.company_name}</b></td>
                  <td style={td}>{e.sector?.name ?? '—'}</td>
                  <td style={td}>{e.contact_name ?? '—'}{e.contact_email ? <><br /><a href={`mailto:${e.contact_email}`} style={{ fontSize: 12 }}>{e.contact_email}</a></> : null}</td>
                  <td style={td}><span style={{ ...statusBadge, background: STATUS_COLOURS[e.relationship_status] ?? '#94a3b8' }}>{labelStatus(e.relationship_status)}</span></td>
                  <td style={td}>{(e.partnership_types ?? []).join(', ') || '—'}</td>
                  <td style={td}>{e.last_contacted_at ? new Date(e.last_contacted_at).toLocaleDateString('en-GB') : '—'}</td>
                  <td style={td}>
                    <button onClick={() => { setEditingEmployer(e); setShowEmployerForm(true) }} style={smallBtn}>Edit</button>
                    <button onClick={() => setLogContactOpen(e)} style={smallBtn}>Log contact</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'placements' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
            <select value={placementFilter.status} onChange={(e) => setPlacementFilter({ ...placementFilter, status: e.target.value })} style={input}>
              <option value="">All statuses</option>
              <option value="planned">Planned</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={placementFilter.type} onChange={(e) => setPlacementFilter({ ...placementFilter, type: e.target.value })} style={input}>
              <option value="">All types</option>
              <option value="work_experience">Work experience</option>
              <option value="careers_talk">Careers talk</option>
              <option value="workplace_tour">Workplace tour</option>
              <option value="mock_interview">Mock interview</option>
              <option value="mentoring">Mentoring</option>
              <option value="industry_project">Industry project</option>
              <option value="other">Other</option>
            </select>
            <button onClick={() => { setEditingPlacement(null); setShowPlacementForm(true) }} style={primaryBtn}>+ Add placement</button>
          </div>

          <table style={tbl}>
            <thead><tr>
              <th style={th}>Title</th><th style={th}>Type</th><th style={th}>Employer</th><th style={th}>Student / Group</th>
              <th style={th}>Dates</th><th style={th}>Hours</th><th style={th}>Status</th><th style={th}>Actions</th>
            </tr></thead>
            <tbody>
              {placements.length === 0 && <tr><td style={td} colSpan={8}><em>No placements yet.</em></td></tr>}
              {placements.map((p) => (
                <tr key={p.id}>
                  <td style={td}><b>{p.title}</b></td>
                  <td style={td}>{labelPlacement(p.placement_type)}</td>
                  <td style={td}>{p.employer?.company_name ?? '—'}</td>
                  <td style={td}>{p.is_group_event ? <em>Group: {(p.group_year_groups ?? []).join('/') || 'all'} ({p.group_student_count ?? '?'})</em> : (p.student_name ?? '[restricted]')}</td>
                  <td style={td}>{p.start_date ?? '—'}{p.end_date && p.end_date !== p.start_date ? ` → ${p.end_date}` : ''}</td>
                  <td style={td}>{p.hours ?? '—'}</td>
                  <td style={td}><span style={{ ...statusBadge, background: placementStatusColour(p.status) }}>{labelPlacementStatus(p.status)}</span></td>
                  <td style={td}>
                    <button onClick={() => { setEditingPlacement(p); setShowPlacementForm(true) }} style={smallBtn}>Edit</button>
                    {p.status === 'completed' && (
                      <button onClick={() => setFeedbackOpen(p)} style={smallBtn}>Feedback</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pipeline' && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 10px' }}>Employer engagement pipeline</h2>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
            {pipeline.filter((p) => p.status !== 'dormant').map((col) => (
              <div key={col.status} style={{ minWidth: 180, flex: 1, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>
                <div style={{ padding: 10, background: STATUS_COLOURS[col.status], color: '#fff', fontWeight: 600, borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                  {col.label} ({col.count})
                </div>
                <div style={{ padding: 10, minHeight: 80 }}>
                  {employers.filter((e) => e.relationship_status === col.status).slice(0, 30).map((e) => (
                    <div key={e.id} style={{ padding: 6, borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                      <b>{e.company_name}</b>
                      {e.sector && <div style={{ fontSize: 11, color: '#6b7280' }}>{e.sector.name}</div>}
                    </div>
                  ))}
                  {employers.filter((e) => e.relationship_status === col.status).length === 0 && (
                    <em style={{ fontSize: 12, color: '#9ca3af' }}>(none)</em>
                  )}
                </div>
              </div>
            ))}
          </div>
          {pipeline.find((p) => p.status === 'dormant' && p.count > 0) && (
            <div style={{ marginTop: 20, border: '1px dashed #9ca3af', borderRadius: 6, padding: 12, background: '#f9fafb' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '1rem' }}>Dormant ({pipeline.find((p) => p.status === 'dormant')?.count ?? 0})</h3>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>Re-engage by changing their status back to engaged.</p>
              {employers.filter((e) => e.relationship_status === 'dormant').map((e) => (
                <div key={e.id} style={{ padding: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
                  <span>{e.company_name}</span>
                  <button onClick={() => changeStatus(e.id, 'engaged').then(loadEmployers).then(loadOverview)} style={smallBtn}>Re-engage</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'sectors' && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 10px' }}>Sector coverage</h2>
          <p style={{ margin: '0 0 10px', color: '#6b7280' }}>Employer partners across the 19 Scottish career sectors. Green = at least one active partner.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {sectorCov.map((s) => (
              <div key={s.sector_id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: 10,
                background: s.active_partners > 0 ? '#dcfce7' : s.total_contacts > 0 ? '#fef3c7' : '#f3f4f6',
              }}>
                <b>{s.name}</b>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {s.active_partners} active · {s.engaged_partners} engaged · {s.placements_this_year} placements
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showEmployerForm && (
        <EmployerForm
          sectors={sectors}
          existing={editingEmployer}
          onClose={() => setShowEmployerForm(false)}
          onSaved={() => {
            setShowEmployerForm(false)
            loadEmployers()
            loadOverview()
          }}
        />
      )}
      {showPlacementForm && (
        <PlacementForm
          sectors={sectors}
          existing={editingPlacement}
          onClose={() => setShowPlacementForm(false)}
          onSaved={() => {
            setShowPlacementForm(false)
            loadPlacements()
            loadOverview()
          }}
        />
      )}
      {logContactOpen && (
        <LogContactModal
          employer={logContactOpen}
          onClose={() => setLogContactOpen(null)}
          onSaved={() => {
            setLogContactOpen(null)
            loadEmployers()
          }}
        />
      )}
      {feedbackOpen && (
        <FeedbackModal
          placement={feedbackOpen}
          onClose={() => setFeedbackOpen(null)}
          onSaved={() => {
            setFeedbackOpen(null)
            loadPlacements()
            loadOverview()
          }}
        />
      )}
    </div>
  )
}

async function changeStatus(id: string, status: string): Promise<void> {
  await fetch(`/api/school/dyw/employers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ relationship_status: status }) })
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

function tabLabel(t: Tab): string {
  return ({ overview: 'Overview', employers: 'Employers', placements: 'Placements', pipeline: 'Pipeline', sectors: 'Sector coverage' } as Record<Tab, string>)[t]
}

function labelStatus(s: string): string {
  return ({ identified: 'Identified', contacted: 'Contacted', engaged: 'Engaged', active_partner: 'Active', dormant: 'Dormant' } as Record<string, string>)[s] ?? s
}

function labelPlacement(t: string): string {
  return ({ work_experience: 'Work experience', careers_talk: 'Careers talk', workplace_tour: 'Workplace tour', mock_interview: 'Mock interview', mentoring: 'Mentoring', industry_project: 'Industry project', other: 'Other' } as Record<string, string>)[t] ?? t
}

function labelPlacementStatus(s: string): string {
  return ({ planned: 'Planned', confirmed: 'Confirmed', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled' } as Record<string, string>)[s] ?? s
}

function placementStatusColour(s: string): string {
  return ({ planned: '#94a3b8', confirmed: '#60a5fa', in_progress: '#f59e0b', completed: '#10b981', cancelled: '#9ca3af' } as Record<string, string>)[s] ?? '#94a3b8'
}

// --- Forms & modals ---

function EmployerForm({ sectors, existing, onClose, onSaved }: { sectors: Sector[]; existing: Employer | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    company_name: existing?.company_name ?? '',
    sector_id: existing?.sector_id ?? '',
    contact_name: existing?.contact_name ?? '',
    contact_role: existing?.contact_role ?? '',
    contact_email: existing?.contact_email ?? '',
    contact_phone: existing?.contact_phone ?? '',
    address: existing?.address ?? '',
    website: existing?.website ?? '',
    relationship_status: existing?.relationship_status ?? 'identified',
    partnership_types: existing?.partnership_types ?? [],
    notes: existing?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const togglePt = (pt: string) => {
    setForm((f) => ({ ...f, partnership_types: f.partnership_types.includes(pt) ? f.partnership_types.filter((p) => p !== pt) : [...f.partnership_types, pt] }))
  }

  const save = async () => {
    if (!form.company_name.trim()) return
    setSaving(true)
    const url = existing ? `/api/school/dyw/employers/${existing.id}` : '/api/school/dyw/employers'
    const method = existing ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (r.ok) onSaved()
    else alert('Failed to save')
  }

  return (
    <Modal onClose={onClose} title={existing ? 'Edit employer' : 'Add employer'}>
      <label style={lbl}>Company name *<input style={input} value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></label>
      <label style={lbl}>Sector
        <select style={input} value={form.sector_id} onChange={(e) => setForm({ ...form, sector_id: e.target.value })}>
          <option value="">—</option>
          {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label style={lbl}>Contact name<input style={input} value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></label>
        <label style={lbl}>Contact role<input style={input} value={form.contact_role} onChange={(e) => setForm({ ...form, contact_role: e.target.value })} /></label>
        <label style={lbl}>Email<input style={input} type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></label>
        <label style={lbl}>Phone<input style={input} value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></label>
        <label style={lbl}>Address<input style={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
        <label style={lbl}>Website<input style={input} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label>
      </div>
      <label style={lbl}>Status
        <select style={input} value={form.relationship_status} onChange={(e) => setForm({ ...form, relationship_status: e.target.value })}>
          <option value="identified">Identified</option>
          <option value="contacted">Contacted</option>
          <option value="engaged">Engaged</option>
          <option value="active_partner">Active partner</option>
          <option value="dormant">Dormant</option>
        </select>
      </label>
      <div style={lbl}>
        Partnership types
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['work_placement','mock_interviews','careers_talk','workplace_tour','mentoring','employer_of_month','industry_project','curriculum_input'].map((pt) => (
            <button key={pt} type="button" onClick={() => togglePt(pt)} style={{ ...pillBtn, background: form.partnership_types.includes(pt) ? '#1D4ED8' : '#fff', color: form.partnership_types.includes(pt) ? '#fff' : '#1D4ED8' }}>
              {pt.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
      <label style={lbl}>Notes<textarea style={{ ...input, minHeight: 80 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
        <button onClick={onClose} style={smallBtn}>Cancel</button>
        <button onClick={save} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </Modal>
  )
}

function PlacementForm({ sectors, existing, onClose, onSaved }: { sectors: Sector[]; existing: Placement | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    placement_type: existing?.placement_type ?? 'work_experience',
    employer_id: existing?.employer_id ?? '',
    is_group_event: existing?.is_group_event ?? false,
    student_id: existing?.student_id ?? '',
    group_year_groups: existing?.group_year_groups ?? [],
    group_student_count: existing?.group_student_count ?? '',
    start_date: existing?.start_date ?? '',
    end_date: existing?.end_date ?? '',
    hours: existing?.hours ?? '',
    status: existing?.status ?? 'planned',
    description: existing?.description ?? '',
    supervisor_name: existing?.supervisor_name ?? '',
    supervisor_email: existing?.supervisor_email ?? '',
    health_safety_completed: existing?.health_safety_completed ?? false,
    parental_consent_received: existing?.parental_consent_received ?? false,
    linked_sector_id: existing?.linked_sector_id ?? '',
  })
  const [employers, setEmployers] = useState<Employer[]>([])
  const [students, setStudents] = useState<{ id: string; first_name: string; last_name: string }[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/school/dyw/employers').then((r) => r.json()).then((d) => setEmployers(d.employers ?? []))
  }, [])
  useEffect(() => {
    if (form.is_group_event) return
    const qs = studentSearch ? `?q=${encodeURIComponent(studentSearch)}` : ''
    fetch(`/api/school/dyw/students${qs}`).then((r) => r.json()).then((d) => setStudents(d.students ?? []))
  }, [studentSearch, form.is_group_event])

  const save = async () => {
    if (!form.title.trim()) return
    if (!form.is_group_event && !form.student_id) {
      alert('Please select a student or switch to a group event.')
      return
    }
    setSaving(true)
    const url = existing ? `/api/school/dyw/placements/${existing.id}` : '/api/school/dyw/placements'
    const method = existing ? 'PUT' : 'POST'
    const payload = {
      ...form,
      hours: form.hours === '' ? null : Number(form.hours),
      group_student_count: form.group_student_count === '' ? null : Number(form.group_student_count),
    }
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (r.ok) onSaved()
    else alert('Failed to save')
  }

  const toggleYr = (yr: string) => {
    setForm((f) => ({ ...f, group_year_groups: f.group_year_groups.includes(yr) ? f.group_year_groups.filter((y) => y !== yr) : [...f.group_year_groups, yr] }))
  }

  return (
    <Modal onClose={onClose} title={existing ? 'Edit placement' : 'Add placement / event'}>
      <label style={lbl}>
        <input type="checkbox" checked={form.is_group_event} onChange={(e) => setForm({ ...form, is_group_event: e.target.checked, student_id: '' })} />{' '}
        This is a group event (no named student — e.g. careers talk, workplace tour)
      </label>
      <label style={lbl}>Title *<input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label style={lbl}>Type
        <select style={input} value={form.placement_type} onChange={(e) => setForm({ ...form, placement_type: e.target.value })}>
          <option value="work_experience">Work experience</option>
          <option value="careers_talk">Careers talk</option>
          <option value="workplace_tour">Workplace tour</option>
          <option value="mock_interview">Mock interview</option>
          <option value="mentoring">Mentoring</option>
          <option value="industry_project">Industry project</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label style={lbl}>Employer
        <select style={input} value={form.employer_id} onChange={(e) => setForm({ ...form, employer_id: e.target.value })}>
          <option value="">—</option>
          {employers.map((e) => <option key={e.id} value={e.id}>{e.company_name}</option>)}
        </select>
      </label>
      {!form.is_group_event && (
        <>
          <label style={lbl}>Find student
            <input style={input} placeholder="Type name…" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
          </label>
          <label style={lbl}>Student *
            <select style={input} value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
              <option value="">—</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
            </select>
          </label>
        </>
      )}
      {form.is_group_event && (
        <>
          <div style={lbl}>Year groups
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['S1','S2','S3','S4','S5','S6'].map((yr) => (
                <button key={yr} type="button" onClick={() => toggleYr(yr)} style={{ ...pillBtn, background: form.group_year_groups.includes(yr) ? '#1D4ED8' : '#fff', color: form.group_year_groups.includes(yr) ? '#fff' : '#1D4ED8' }}>{yr}</button>
              ))}
            </div>
          </div>
          <label style={lbl}>Estimated student count
            <input style={input} type="number" value={form.group_student_count} onChange={(e) => setForm({ ...form, group_student_count: e.target.value })} />
          </label>
        </>
      )}
      <label style={lbl}>Linked career sector
        <select style={input} value={form.linked_sector_id} onChange={(e) => setForm({ ...form, linked_sector_id: e.target.value })}>
          <option value="">—</option>
          {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <label style={lbl}>Start date<input style={input} type="date" value={form.start_date ?? ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></label>
        <label style={lbl}>End date<input style={input} type="date" value={form.end_date ?? ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></label>
        <label style={lbl}>Hours<input style={input} type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></label>
      </div>
      <label style={lbl}>Status
        <select style={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="planned">Planned</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <label style={lbl}>Description<textarea style={{ ...input, minHeight: 60 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      {!form.is_group_event && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <label style={lbl}>Workplace supervisor<input style={input} value={form.supervisor_name} onChange={(e) => setForm({ ...form, supervisor_name: e.target.value })} /></label>
          <label style={lbl}>Supervisor email<input style={input} type="email" value={form.supervisor_email} onChange={(e) => setForm({ ...form, supervisor_email: e.target.value })} /></label>
          <label style={lbl}><input type="checkbox" checked={form.health_safety_completed} onChange={(e) => setForm({ ...form, health_safety_completed: e.target.checked })} /> Health & safety briefing completed</label>
          <label style={lbl}><input type="checkbox" checked={form.parental_consent_received} onChange={(e) => setForm({ ...form, parental_consent_received: e.target.checked })} /> Parental consent received</label>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
        <button onClick={onClose} style={smallBtn}>Cancel</button>
        <button onClick={save} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </Modal>
  )
}

function LogContactModal({ employer, onClose, onSaved }: { employer: Employer; onClose: () => void; onSaved: () => void }) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    const r = await fetch(`/api/school/dyw/employers/${employer.id}/log-contact`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    setSaving(false)
    if (r.ok) onSaved()
    else alert('Failed to log contact')
  }
  return (
    <Modal onClose={onClose} title={`Log contact with ${employer.company_name}`}>
      <label style={lbl}>Note (optional)
        <textarea style={{ ...input, minHeight: 80 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Followed up on placement dates — confirmed June slot" />
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
        <button onClick={onClose} style={smallBtn}>Cancel</button>
        <button onClick={save} disabled={saving} style={primaryBtn}>{saving ? 'Logging…' : 'Log contact'}</button>
      </div>
    </Modal>
  )
}

function FeedbackModal({ placement, onClose, onSaved }: { placement: Placement; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    student_feedback: placement.student_feedback ?? '',
    student_rating: placement.student_rating ?? '',
    employer_feedback: placement.employer_feedback ?? '',
    employer_rating: placement.employer_rating ?? '',
  })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    const r = await fetch(`/api/school/dyw/placements/${placement.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_feedback: form.student_feedback || null,
        student_rating: form.student_rating === '' ? null : Number(form.student_rating),
        employer_feedback: form.employer_feedback || null,
        employer_rating: form.employer_rating === '' ? null : Number(form.employer_rating),
      }),
    })
    setSaving(false)
    if (r.ok) onSaved()
    else alert('Failed to save feedback')
  }
  return (
    <Modal onClose={onClose} title={`Feedback: ${placement.title}`}>
      <label style={lbl}>Student feedback<textarea style={{ ...input, minHeight: 60 }} value={form.student_feedback} onChange={(e) => setForm({ ...form, student_feedback: e.target.value })} /></label>
      <label style={lbl}>Student rating (1-5)
        <select style={input} value={form.student_rating} onChange={(e) => setForm({ ...form, student_rating: e.target.value })}>
          <option value="">—</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label style={lbl}>Employer feedback<textarea style={{ ...input, minHeight: 60 }} value={form.employer_feedback} onChange={(e) => setForm({ ...form, employer_feedback: e.target.value })} /></label>
      <label style={lbl}>Employer rating (1-5)
        <select style={input} value={form.employer_rating} onChange={(e) => setForm({ ...form, employer_rating: e.target.value })}>
          <option value="">—</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
        <button onClick={onClose} style={smallBtn}>Cancel</button>
        <button onClick={save} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save feedback'}</button>
      </div>
    </Modal>
  )
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 'min(720px, 95vw)', padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{title}</h2>
          <button onClick={onClose} style={smallBtn}>Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// --- Styles ---
const tabStrip: React.CSSProperties = { display: 'flex', gap: 4, borderBottom: '2px solid #e5e7eb', overflowX: 'auto' }
const tabBtn: React.CSSProperties = { padding: '10px 14px', border: 'none', borderBottom: '2px solid transparent', marginBottom: -2, background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', color: '#374151', whiteSpace: 'nowrap' }
const tabActive: React.CSSProperties = { borderBottomColor: '#1D4ED8', color: '#1D4ED8' }
const linkBtn: React.CSSProperties = { padding: '6px 12px', background: '#EFF6FF', color: '#1D4ED8', textDecoration: 'none', borderRadius: 4, fontWeight: 500, border: '1px solid #BFDBFE', fontSize: 13 }
const primaryBtn: React.CSSProperties = { padding: '8px 14px', background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }
const smallBtn: React.CSSProperties = { padding: '4px 10px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 4, fontWeight: 500, cursor: 'pointer', fontSize: 13, marginRight: 4 }
const pillBtn: React.CSSProperties = { padding: '4px 10px', border: '1px solid #1D4ED8', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 500 }
const input: React.CSSProperties = { padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 14, width: '100%' }
const lbl: React.CSSProperties = { display: 'block', margin: '6px 0', fontSize: 13, fontWeight: 500 }
const statsGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 14, background: '#fff' }
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }
const statusBadge: React.CSSProperties = { padding: '2px 8px', borderRadius: 999, color: '#fff', fontSize: 11, fontWeight: 600 }
