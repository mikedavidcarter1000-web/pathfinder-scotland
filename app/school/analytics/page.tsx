'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { CesRadar } from '@/components/school-analytics/ces-radar'
import type { DashboardMe } from '@/components/school-dashboard/types'

type TabKey = 'overview' | 'attainment' | 'equity' | 'ces' | 'attendance' | 'pef' | 'sip'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'attainment', label: 'Attainment' },
  { key: 'equity', label: 'Equity' },
  { key: 'ces', label: 'CES' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'pef', label: 'PEF' },
  { key: 'sip', label: 'SIP' },
]

export default function SchoolAnalyticsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [me, setMe] = useState<DashboardMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('overview')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/analytics')
      return
    }
    fetch('/api/school/me')
      .then((r) => (r.status === 403 ? null : r.json()))
      .then((d) => {
        if (d) setMe(d)
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  if (loading || authLoading) return <div className="pf-container pt-8 pb-12"><p>Loading analytics…</p></div>
  if (!me || !me.school) return null

  const role = me.staff.role
  const isLeadership = role === 'depute' || role === 'head_teacher' || me.staff.isAdmin
  if (!isLeadership) {
    return (
      <div className="pf-container pt-8 pb-12">
        <h1>Analytics</h1>
        <p>Analytics dashboards are available to depute heads, head teachers, and school administrators.</p>
        <p><Link href="/school/dashboard">Back to dashboard</Link></p>
      </div>
    )
  }

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem', margin: '0 0 4px 0' }}>
        Analytics
      </h1>
      <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: '0 0 16px 0' }}>
        {me.school.name} · Leadership view
      </p>

      <div style={tabStrip} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{ ...tabBtn, ...(tab === t.key ? tabActive : {}) }}
            aria-current={tab === t.key ? 'page' : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        {tab === 'overview' && <OverviewAnalyticsTab />}
        {tab === 'attainment' && <AttainmentTab />}
        {tab === 'equity' && <EquityTab />}
        {tab === 'ces' && <CesTab />}
        {tab === 'attendance' && <AttendanceTab />}
        {tab === 'pef' && <PefTab />}
        {tab === 'sip' && <SipTab />}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Tab 1: Overview
// ----------------------------------------------------------------------------

type OverviewResp = {
  attainment: { n5_5plus_ac_pct: number; higher_3plus_ac_pct: number; ah_1plus_pct: number; total_students: number; students_with_grades: number }
  attainment_previous: { n5_5plus_ac_pct: number; higher_3plus_ac_pct: number; ah_1plus_pct: number } | null
  alerts: { attendance_below_90: number; interventions_overdue: number; asn_reviews_due: number; outstanding_choice_submissions: number; unclaimed_bursaries: number }
}

function OverviewAnalyticsTab() {
  const [data, setData] = useState<OverviewResp | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/school/analytics/overview').then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading overview…</p>
  if (!data) return <p>Could not load overview.</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      <Metric label="5+ N5 at A-C" value={`${data.attainment.n5_5plus_ac_pct}%`} trend={trendOf(data.attainment.n5_5plus_ac_pct, data.attainment_previous?.n5_5plus_ac_pct)} />
      <Metric label="3+ Higher at A-C" value={`${data.attainment.higher_3plus_ac_pct}%`} trend={trendOf(data.attainment.higher_3plus_ac_pct, data.attainment_previous?.higher_3plus_ac_pct)} />
      <Metric label="1+ Advanced Higher" value={`${data.attainment.ah_1plus_pct}%`} trend={trendOf(data.attainment.ah_1plus_pct, data.attainment_previous?.ah_1plus_pct)} />
      <Metric label="Students in cohort" value={`${data.attainment.total_students}`} />

      <section style={{ ...card, gridColumn: '1 / -1' }}>
        <h3 style={h3}>Alerts</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AlertRow count={data.alerts.attendance_below_90} text="students below 90% attendance" link="/school/analytics?tab=attendance" />
          <AlertRow count={data.alerts.asn_reviews_due} text="ASN reviews overdue" link="/school/guidance" />
          <AlertRow count={data.alerts.interventions_overdue} text="intervention follow-ups overdue" link="/school/guidance" />
          <AlertRow count={data.alerts.outstanding_choice_submissions} text="subject-choice rounds still open" link="/school/choices" />
        </ul>
      </section>
    </div>
  )
}

function trendOf(current: number, previous?: number | null): number | undefined {
  if (previous == null) return undefined
  return Math.round((current - previous) * 10) / 10
}

function AlertRow({ count, text, link }: { count: number; text: string; link?: string }) {
  const flavour = count > 0 ? { color: '#b45309', fontWeight: 600 } : { color: '#475569' }
  const Body = (
    <span style={{ ...flavour, display: 'flex', alignItems: 'center', gap: 8 }}>
      <strong style={{ minWidth: 32, textAlign: 'right' }}>{count}</strong>
      <span>{text}</span>
    </span>
  )
  return (
    <li>
      {link ? <Link href={link} style={{ color: 'inherit', textDecoration: 'none' }}>{Body}</Link> : Body}
    </li>
  )
}

// ----------------------------------------------------------------------------
// Tab 2: Attainment
// ----------------------------------------------------------------------------

type AttainmentResp = {
  overall: { n5_5plus_ac_pct: number; n5_5plus_ad_pct: number; higher_3plus_ac_pct: number; higher_5plus_ac_pct: number; ah_1plus_pct: number; total_students: number }
  by_year: Record<string, { n5_5plus_ac_pct: number; higher_3plus_ac_pct: number; ah_1plus_pct: number; total_students: number }>
  grade_distribution: Array<{ grade: string; count: number; pct: number }>
  departments: Array<{ department: string; student_count: number; avg_working_grade_numeric: number; pct_a_c: number; pct_on_track: number; completion_pct: number }>
  trend: Array<{ cycle_name: string; cycle_number: number; n5_5plus_ac_pct: number; higher_3plus_ac_pct: number }>
  value_added: Array<{ subject_name: string; students_assessed: number; avg_predicted_grade_numeric: number; avg_actual_grade_numeric: number; value_added: number; students_above: number; students_met: number; students_below: number }>
}

function AttainmentTab() {
  const [data, setData] = useState<AttainmentResp | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/school/analytics/attainment').then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading attainment data…</p>
  if (!data) return <p>No attainment data available.</p>
  const hasData = data.overall.total_students > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={card}>
        <h3 style={h3}>Key measures (school-wide)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Metric label="5+ N5 A-C" value={`${data.overall.n5_5plus_ac_pct}%`} />
          <Metric label="5+ N5 A-D" value={`${data.overall.n5_5plus_ad_pct}%`} />
          <Metric label="3+ Higher A-C" value={`${data.overall.higher_3plus_ac_pct}%`} />
          <Metric label="5+ Higher A-C" value={`${data.overall.higher_5plus_ac_pct}%`} />
          <Metric label="1+ AH" value={`${data.overall.ah_1plus_pct}%`} />
        </div>
      </section>

      <section style={card}>
        <h3 style={h3}>Grade distribution (most recent cycle)</h3>
        {!hasData || data.grade_distribution.length === 0 ? (
          <p style={empty}>No tracking data available yet. Once a cycle has working grades, the distribution appears here.</p>
        ) : (
          <StackedGradeBar bars={data.grade_distribution} />
        )}
      </section>

      <section style={card}>
        <h3 style={h3}>Department comparison</h3>
        {data.departments.length === 0 ? (
          <p style={empty}>No department data yet. Assign staff to classes with a department set to populate this view.</p>
        ) : (
          <DepartmentTable rows={data.departments} />
        )}
      </section>

      <section style={card}>
        <h3 style={h3}>Key measure trend (all cycles)</h3>
        {data.trend.length === 0 ? (
          <p style={empty}>No tracking cycles yet.</p>
        ) : (
          <TrendTable rows={data.trend} />
        )}
      </section>

      <section style={card}>
        <h3 style={h3}>Value-added (predicted vs actual)</h3>
        {data.value_added.length === 0 ? (
          <p style={empty}>Import SQA results (actual grades) to see value-added analysis. <Link href="/school/tracking">Go to tracking</Link>.</p>
        ) : (
          <ValueAddedTable rows={data.value_added} />
        )}
      </section>

      <section style={card}>
        <h3 style={h3}>Year-group breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {['S4', 'S5', 'S6'].map((y) => {
            const m = data.by_year[y]
            if (!m) return null
            return (
              <div key={y} style={subCard}>
                <strong>{y}</strong>
                <div style={{ fontSize: 13, marginTop: 8, opacity: 0.85 }}>
                  <div>5+ N5 A-C: {m.n5_5plus_ac_pct}%</div>
                  <div>3+ Higher A-C: {m.higher_3plus_ac_pct}%</div>
                  <div>1+ AH: {m.ah_1plus_pct}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Tab 3: Equity
// ----------------------------------------------------------------------------

type EquityResp = {
  simd_gap: Array<{ simd_quintile: number; student_count: number; avg_tariff_points: number; n5_5plus_ac_pct: number; higher_3plus_ac_pct: number; saved_courses_avg: number; widening_access_eligible_count: number }>
  equity_groups: Array<{ group: string; student_count: number; avg_working_grade_numeric: number; pct_on_track: number }>
  can_view_sensitive_flags: boolean
  wa_pipeline: { q12_total: number; saved_any_pct: number; saved_wa_pct: number; made_choices_pct: number }
}

function EquityTab() {
  const [data, setData] = useState<EquityResp | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/school/analytics/equity').then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading equity data…</p>
  if (!data) return <p>No equity data available.</p>
  const q5 = data.simd_gap.find((r) => r.simd_quintile === 5)
  const q1 = data.simd_gap.find((r) => r.simd_quintile === 1)
  const gap = q5 && q1 ? Math.round((q5.n5_5plus_ac_pct - q1.n5_5plus_ac_pct) * 10) / 10 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={card}>
        <h3 style={h3}>SIMD attainment gap (5+ N5 A-C): Q5 – Q1 = {gap}pp</h3>
        <SimdGapChart rows={data.simd_gap} />
      </section>

      <section style={card}>
        <h3 style={h3}>SIMD quintile detail</h3>
        <SimdGapTable rows={data.simd_gap} />
      </section>

      {data.can_view_sensitive_flags ? (
        <section style={card}>
          <h3 style={h3}>Equity group breakdowns</h3>
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 0 }}>Aggregate counts only. Individual names never shown on this dashboard.</p>
          {data.equity_groups.length === 0 ? (
            <p style={empty}>No group data yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--pf-grey-200)' }}>
                  <th style={th}>Group</th>
                  <th style={th}>Students</th>
                  <th style={th}>Avg working grade</th>
                  <th style={th}>% on track</th>
                </tr>
              </thead>
              <tbody>
                {data.equity_groups.map((g) => (
                  <tr key={g.group} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                    <td style={td}>{g.group}</td>
                    <td style={td}>{g.student_count}</td>
                    <td style={td}>{g.avg_working_grade_numeric.toFixed(2)}</td>
                    <td style={td}>{g.pct_on_track}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : (
        <section style={card}>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Equity-group breakdowns (care-experienced, FSM, young carers, EAL, ASN) require the <strong>Can view sensitive flags</strong>
            {' '}permission. Ask your school admin to grant this to your account.
          </p>
        </section>
      )}

      <section style={card}>
        <h3 style={h3}>Widening-access pipeline (SIMD Q1-Q2 students)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Metric label="Q1-Q2 students" value={`${data.wa_pipeline.q12_total}`} />
          <Metric label="Saved ≥1 course" value={`${data.wa_pipeline.saved_any_pct}%`} />
          <Metric label="Saved a WA-eligible course" value={`${data.wa_pipeline.saved_wa_pct}%`} />
          <Metric label="Made subject choices" value={`${data.wa_pipeline.made_choices_pct}%`} />
        </div>
      </section>

      {/* ASN dashboard (Schools-5 Task 9) */}
      <AsnSummary />
    </div>
  )
}

function SimdGapChart({ rows }: { rows: EquityResp['simd_gap'] }) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.n5_5plus_ac_pct, r.higher_3plus_ac_pct)))
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 12 }}>
        {rows.map((r) => (
          <div key={r.simd_quintile} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Q{r.simd_quintile} · {r.student_count} pupils</div>
            <div style={{ height: 120, position: 'relative', marginTop: 4, background: '#f8fafc', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: '10%', width: '35%', background: '#3b82f6', height: `${(r.n5_5plus_ac_pct / max) * 100}%` }} title={`5+ N5 A-C: ${r.n5_5plus_ac_pct}%`} />
              <div style={{ position: 'absolute', bottom: 0, left: '55%', width: '35%', background: '#10b981', height: `${(r.higher_3plus_ac_pct / max) * 100}%` }} title={`3+ Higher A-C: ${r.higher_3plus_ac_pct}%`} />
            </div>
            <div style={{ fontSize: 11, marginTop: 2 }}>
              <span style={{ color: '#3b82f6' }}>{r.n5_5plus_ac_pct}%</span>
              <span style={{ margin: '0 4px', opacity: 0.4 }}>|</span>
              <span style={{ color: '#10b981' }}>{r.higher_3plus_ac_pct}%</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, marginTop: 8, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#3b82f6', marginRight: 4 }} />5+ N5 A-C</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#10b981', marginRight: 4 }} />3+ Higher A-C</span>
      </div>
    </div>
  )
}

function SimdGapTable({ rows }: { rows: EquityResp['simd_gap'] }) {
  const q5 = rows.find((r) => r.simd_quintile === 5)
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--pf-grey-200)' }}>
          <th style={th}>Quintile</th>
          <th style={th}>Students</th>
          <th style={th}>5+ N5 A-C</th>
          <th style={th}>3+ Higher A-C</th>
          <th style={th}>Avg tariff</th>
          <th style={th}>Gap vs Q5 (5+ N5)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const gap = q5 ? Math.round((q5.n5_5plus_ac_pct - r.n5_5plus_ac_pct) * 10) / 10 : 0
          const isQ12 = r.simd_quintile <= 2
          return (
            <tr key={r.simd_quintile} style={{ borderBottom: '1px solid var(--pf-grey-100)', background: isQ12 ? '#fef3c7' : undefined }}>
              <td style={td}>Q{r.simd_quintile}{r.simd_quintile === 1 ? ' (most deprived)' : ''}</td>
              <td style={td}>{r.student_count}</td>
              <td style={td}>{r.n5_5plus_ac_pct}%</td>
              <td style={td}>{r.higher_3plus_ac_pct}%</td>
              <td style={td}>{r.avg_tariff_points}</td>
              <td style={td}>{gap > 0 ? `+${gap}pp` : `${gap}pp`}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function AsnSummary() {
  const [data, setData] = useState<{ active_total: number; by_type: Array<{ type: string; count: number }>; overdue: number; exam_access_count: number } | null>(null)
  useEffect(() => {
    fetch('/api/school/analytics/asn').then((r) => r.json()).then(setData).catch(() => null)
  }, [])
  if (!data) return null

  return (
    <section style={card}>
      <h3 style={h3}>ASN provisions overview</h3>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 0 }}>
        Supports self-evaluation for QI 2.4 Personalised Support and QI 3.1 Ensuring Wellbeing, Equality and Inclusion.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
        <Metric label="Active provisions" value={`${data.active_total}`} />
        <Metric label="Overdue reviews" value={`${data.overdue}`} />
        <Metric label="Exam access arrangements" value={`${data.exam_access_count}`} />
      </div>
      {data.by_type.length > 0 && (
        <div>
          <strong style={{ fontSize: 13 }}>Provisions by type</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
            {data.by_type.map((r) => {
              const maxCount = Math.max(1, ...data.by_type.map((t) => t.count))
              return (
                <div key={r.type} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ width: 160 }}>{r.type.replace(/_/g, ' ')}</span>
                  <span style={{ flex: 1, background: '#e5e7eb', borderRadius: 3, height: 14, position: 'relative', overflow: 'hidden' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: '#0059b3', width: `${(r.count / maxCount) * 100}%` }} />
                  </span>
                  <strong style={{ width: 32, textAlign: 'right' }}>{r.count}</strong>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

// ----------------------------------------------------------------------------
// Tab 4: CES
// ----------------------------------------------------------------------------

type CesResp = {
  ces: {
    self: { score: number; max: number; indicators: Array<{ label: string; value: number; note?: string }> }
    strengths: { score: number; max: number; indicators: Array<{ label: string; value: number; note?: string }> }
    horizons: { score: number; max: number; indicators: Array<{ label: string; value: number; note?: string }> }
    networks: { score: number; max: number; indicators: Array<{ label: string; value: number; note?: string }> }
  }
  dyw_summary: { quizzed_pct: number; saved_course_pct: number; compared_careers_pct: number; total_students: number }
}

function CesTab() {
  const [data, setData] = useState<CesResp | null>(null)
  const [loading, setLoading] = useState(true)
  const [capturing, setCapturing] = useState<string | null>(null)
  useEffect(() => {
    fetch('/api/school/analytics/ces').then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }, [])
  if (loading) return <p>Loading CES data…</p>
  if (!data) return <p>No CES data available.</p>

  async function capture(capacityKey: 'self' | 'strengths' | 'horizons' | 'networks', indicatorCode: string) {
    if (!data) return
    setCapturing(capacityKey)
    const c = data.ces[capacityKey]
    const resp = await fetch('/api/school/inspection/evidence', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        indicator_code: indicatorCode,
        evidence_type: 'quantitative',
        title: `CES ${capacityKey[0].toUpperCase() + capacityKey.slice(1)} capacity snapshot`,
        description: `${capacityKey[0].toUpperCase() + capacityKey.slice(1)} capacity scored ${c.score}/100. Indicators: ${c.indicators.map((i) => `${i.label} (${i.value})`).join('; ')}.`,
        source: 'auto_generated',
        data_snapshot: c,
        academic_year: new Date().getFullYear().toString(),
      }),
    })
    setCapturing(null)
    if (resp.ok) alert('Evidence captured to inspection portfolio.')
    else alert('Failed to capture evidence.')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={card}>
        <h3 style={h3}>Career Education Standard -- 4 capacities</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <CesRadar ces={data.ces} />
          <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(['self', 'strengths', 'horizons', 'networks'] as const).map((key) => (
              <details key={key} style={subCard}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  {key[0].toUpperCase() + key.slice(1)} -- {data.ces[key].score}/100
                </summary>
                <ul style={{ padding: '8px 20px', margin: 0, fontSize: 14 }}>
                  {data.ces[key].indicators.map((i, idx) => (
                    <li key={idx}>{i.label}: <strong>{i.value}</strong>{i.note && <span style={{ fontSize: 12, opacity: 0.7 }}> -- {i.note}</span>}</li>
                  ))}
                </ul>
                <button
                  style={ghostBtn}
                  disabled={capturing === key}
                  onClick={() => capture(key, '3.3')}
                >
                  {capturing === key ? 'Capturing…' : 'Capture as QI 3.3 evidence'}
                </button>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={card}>
        <h3 style={h3}>DYW coordinator summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Metric label="Students who completed quiz" value={`${data.dyw_summary.quizzed_pct}%`} />
          <Metric label="Students saved ≥1 course" value={`${data.dyw_summary.saved_course_pct}%`} />
          <Metric label="Students compared careers" value={`${data.dyw_summary.compared_careers_pct}%`} />
          <Metric label="Total students" value={`${data.dyw_summary.total_students}`} />
        </div>
      </section>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Tab 5: Attendance
// ----------------------------------------------------------------------------

type AttendanceResp = {
  has_data: boolean
  distribution?: Record<string, number>
  correlation?: Array<{ attendance_band: string; student_count: number; avg_working_grade_numeric: number; on_track_pct: number; intervention_count_avg: number }>
  scatter?: Array<{ pct: number; grade: number }>
  risk_list_visible?: boolean
}

function AttendanceTab() {
  const [data, setData] = useState<AttendanceResp | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/school/analytics/attendance').then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }, [])
  if (loading) return <p>Loading attendance data…</p>
  if (!data) return <p>No attendance data available.</p>
  if (!data.has_data) {
    return (
      <section style={card}>
        <p>No attendance data imported yet. Import attendance from SEEMIS to see attendance analytics.</p>
        <p><Link href="/school/dashboard">Go to dashboard</Link></p>
      </section>
    )
  }

  const dist = data.distribution ?? {}
  const maxCount = Math.max(1, ...Object.values(dist))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={card}>
        <h3 style={h3}>Attendance distribution</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          {Object.entries(dist).map(([band, count]) => (
            <div key={band} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 80, fontSize: 13 }}>{band}</span>
              <span style={{ flex: 1, background: '#e5e7eb', borderRadius: 3, height: 18, position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: band === '<85%' ? '#dc2626' : band === '85-90%' ? '#b45309' : '#0059b3', width: `${((count as number) / maxCount) * 100}%` }} />
              </span>
              <strong style={{ width: 48, textAlign: 'right' }}>{count as number}</strong>
            </div>
          ))}
        </div>
      </section>

      {data.scatter && data.scatter.length > 0 && (
        <section style={card}>
          <h3 style={h3}>Attendance vs attainment (student-level, anonymised)</h3>
          <AttendanceScatter points={data.scatter} />
        </section>
      )}

      <section style={card}>
        <h3 style={h3}>Attendance-attainment correlation</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--pf-grey-200)' }}>
              <th style={th}>Band</th>
              <th style={th}>Students</th>
              <th style={th}>Avg grade</th>
              <th style={th}>% on track</th>
              <th style={th}>Avg interventions</th>
            </tr>
          </thead>
          <tbody>
            {(data.correlation ?? []).map((r) => (
              <tr key={r.attendance_band} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                <td style={td}>{r.attendance_band}</td>
                <td style={td}>{r.student_count}</td>
                <td style={td}>{r.avg_working_grade_numeric.toFixed(2)}</td>
                <td style={td}>{r.on_track_pct}%</td>
                <td style={td}>{r.intervention_count_avg.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

function AttendanceScatter({ points }: { points: Array<{ pct: number; grade: number }> }) {
  const w = 480; const h = 200; const pad = 40
  const minX = 70; const maxX = 100
  const minY = 0; const maxY = 4
  const xScale = (x: number) => pad + ((x - minX) / (maxX - minX)) * (w - pad * 2)
  const yScale = (y: number) => h - pad - ((y - minY) / (maxY - minY)) * (h - pad * 2)
  return (
    <svg width={w} height={h} role="img" aria-label="Scatter chart of attendance vs working grade">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#94a3b8" />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#94a3b8" />
      <text x={w / 2} y={h - 8} textAnchor="middle" fontSize={12}>Attendance %</text>
      <text x={10} y={h / 2} textAnchor="middle" fontSize={12} transform={`rotate(-90, 10, ${h / 2})`}>Avg working grade (4=A, 1=D)</text>
      {[1, 2, 3, 4].map((y) => (
        <g key={y}>
          <line x1={pad} y1={yScale(y)} x2={w - pad} y2={yScale(y)} stroke="#f1f5f9" />
          <text x={pad - 4} y={yScale(y) + 4} textAnchor="end" fontSize={10} fill="#64748b">{y}</text>
        </g>
      ))}
      {[75, 80, 85, 90, 95, 100].map((x) => (
        <text key={x} x={xScale(x)} y={h - pad + 14} textAnchor="middle" fontSize={10} fill="#64748b">{x}</text>
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={xScale(Math.max(minX, Math.min(maxX, p.pct)))} cy={yScale(Math.max(minY, Math.min(maxY, p.grade)))} r={3} fill="#0059b3" fillOpacity={0.5} />
      ))}
    </svg>
  )
}

// ----------------------------------------------------------------------------
// Tab 6: PEF
// ----------------------------------------------------------------------------

type PefResp = {
  allocations: Array<{ id: string; academic_year: string; total_allocation: number }>
  spend: Array<{ id: string; allocation_id: string; category: string; description: string; amount: number; target_student_count: number | null; target_description: string | null; measured_impact: string | null; linked_intervention_ids: string[] | null }>
}

function PefTab() {
  const [data, setData] = useState<PefResp | null>(null)
  const [year, setYear] = useState<string>(new Date().getFullYear() + '/' + (new Date().getFullYear() + 1).toString().slice(2))
  const [allocationInput, setAllocationInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSpend, setShowSpend] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch(`/api/school/analytics/pef?academic_year=${encodeURIComponent(year)}`).then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [year])

  async function saveAllocation() {
    const amount = parseFloat(allocationInput)
    if (isNaN(amount)) return
    await fetch('/api/school/analytics/pef', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ academic_year: year, total_allocation: amount }),
    })
    setAllocationInput('')
    load()
  }

  const activeAlloc = data?.allocations?.[0]
  const activeSpend = activeAlloc ? data?.spend.filter((s) => s.allocation_id === activeAlloc.id) : []
  const totalSpent = (activeSpend ?? []).reduce((a, b) => a + Number(b.amount), 0)
  const remaining = activeAlloc ? Number(activeAlloc.total_allocation) - totalSpent : 0

  if (loading) return <p>Loading PEF data…</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={card}>
        <h3 style={h3}>PEF allocation for academic year</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13 }}>
            Academic year
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025/26" style={input} />
          </label>
          <label style={{ fontSize: 13 }}>
            Total allocation (£)
            <input type="number" value={allocationInput} onChange={(e) => setAllocationInput(e.target.value)} placeholder={activeAlloc ? String(activeAlloc.total_allocation) : ''} style={input} />
          </label>
          <button style={primaryBtn} onClick={saveAllocation}>Save allocation</button>
        </div>

        {activeAlloc && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
              <span><strong>£{Number(activeAlloc.total_allocation).toLocaleString()}</strong> total</span>
              <span>£{totalSpent.toLocaleString()} spent</span>
              <span>£{remaining.toLocaleString()} remaining</span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 3, height: 12, overflow: 'hidden' }}>
              <div style={{ background: '#10b981', height: '100%', width: `${activeAlloc.total_allocation > 0 ? (totalSpent / Number(activeAlloc.total_allocation)) * 100 : 0}%` }} />
            </div>
          </div>
        )}
      </section>

      {activeAlloc && (
        <section style={card}>
          <h3 style={h3}>PEF spend log</h3>
          {(activeSpend ?? []).length === 0 ? (
            <p style={empty}>No spend entries yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--pf-grey-200)' }}>
                  <th style={th}>Category</th>
                  <th style={th}>Description</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Target</th>
                  <th style={th}>Measured impact</th>
                </tr>
              </thead>
              <tbody>
                {(activeSpend ?? []).map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                    <td style={td}>{s.category}</td>
                    <td style={td}>{s.description}</td>
                    <td style={td}>£{Number(s.amount).toLocaleString()}</td>
                    <td style={td}>{s.target_student_count ?? '—'} {s.target_description ? `(${s.target_description})` : ''}</td>
                    <td style={td}>{s.measured_impact ?? <em style={{ opacity: 0.5 }}>Not measured</em>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <PefSpendForm allocationId={activeAlloc.id} onSaved={load} show={showSpend === activeAlloc.id} onToggle={() => setShowSpend(showSpend === activeAlloc.id ? null : activeAlloc.id)} />
        </section>
      )}
    </div>
  )
}

function PefSpendForm({ allocationId, onSaved, show, onToggle }: { allocationId: string; onSaved: () => void; show: boolean; onToggle: () => void }) {
  const [category, setCategory] = useState('resources')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [target, setTarget] = useState('')
  const [targetDescription, setTargetDescription] = useState('')
  async function submit() {
    await fetch('/api/school/analytics/pef/spend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        allocation_id: allocationId,
        category,
        description,
        amount: parseFloat(amount) || 0,
        target_student_count: target ? parseInt(target) : null,
        target_description: targetDescription || null,
      }),
    })
    setDescription(''); setAmount(''); setTarget(''); setTargetDescription('')
    onSaved()
  }
  if (!show) return <button style={ghostBtn} onClick={onToggle}>+ Add spend entry</button>
  return (
    <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 6 }}>
      <h4 style={{ margin: '0 0 12px 0' }}>Add PEF spend</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
        <label style={labelStyle}>Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={input}>
            {['staffing', 'resources', 'trips', 'technology', 'training', 'other'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label style={labelStyle}>Amount (£)
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={input} />
        </label>
        <label style={labelStyle}>Target student count
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} style={input} />
        </label>
      </div>
      <label style={labelStyle}>Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...input, minHeight: 60 }} />
      </label>
      <label style={labelStyle}>Target group description
        <input value={targetDescription} onChange={(e) => setTargetDescription(e.target.value)} style={input} />
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button style={primaryBtn} onClick={submit}>Save spend</button>
        <button style={ghostBtn} onClick={onToggle}>Cancel</button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Tab 7: SIP
// ----------------------------------------------------------------------------

type SipResp = {
  priorities: Array<{ id: string; priority_number: number; title: string; description: string | null; target_metric: string | null; baseline_value: number | null; target_value: number | null; current_value: number | null; status: string; inspection_indicator_id: string | null; academic_year: string }>
  indicators: Array<{ id: string; indicator_code: string; indicator_name: string }>
  supported_metrics: Array<{ key: string; label: string }>
}

function SipTab() {
  const [data, setData] = useState<SipResp | null>(null)
  const [year, setYear] = useState(() => new Date().getFullYear() + '/' + (new Date().getFullYear() + 1).toString().slice(2))
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch(`/api/school/analytics/sip?academic_year=${encodeURIComponent(year)}`).then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [year])

  if (loading) return <p>Loading SIP priorities…</p>
  if (!data) return <p>Could not load SIP data.</p>

  async function recompute(priorityId: string) {
    await fetch(`/api/school/analytics/sip/${priorityId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recompute_current: true }),
    })
    load()
  }

  async function updateStatus(priorityId: string, status: string) {
    await fetch(`/api/school/analytics/sip/${priorityId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const byIndId = new Map(data.indicators.map((i) => [i.id, i]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={card}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13 }}>
            Academic year
            <input value={year} onChange={(e) => setYear(e.target.value)} style={input} />
          </label>
          <button style={primaryBtn} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add priority'}</button>
          <Link href={`/api/school/analytics/sip/report?academic_year=${encodeURIComponent(year)}`} target="_blank" style={ghostBtnLink}>
            Generate SIP progress report
          </Link>
        </div>
      </section>

      {showForm && <SipForm year={year} indicators={data.indicators} metrics={data.supported_metrics} onSaved={() => { setShowForm(false); load() }} />}

      {data.priorities.length === 0 ? (
        <section style={card}>
          <p style={empty}>No SIP priorities yet for {year}. Click &quot;Add priority&quot; to create one.</p>
        </section>
      ) : (
        data.priorities.map((p) => {
          const ind = p.inspection_indicator_id ? byIndId.get(p.inspection_indicator_id) : null
          const pct = p.baseline_value != null && p.target_value != null && p.current_value != null && p.target_value !== p.baseline_value
            ? Math.max(0, Math.min(100, ((p.current_value - p.baseline_value) / (p.target_value - p.baseline_value)) * 100))
            : 0
          return (
            <section key={p.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ ...h3, margin: 0 }}>Priority {p.priority_number}: {p.title}</h3>
                  {p.description && <p style={{ fontSize: 14, margin: '4px 0 0 0', opacity: 0.8 }}>{p.description}</p>}
                </div>
                <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)} style={input}>
                  {['not_started', 'in_progress', 'on_track', 'at_risk', 'achieved'].map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>Baseline: {p.baseline_value ?? '—'}</span>
                  <span>Current: <strong>{p.current_value ?? '—'}</strong></span>
                  <span>Target: {p.target_value ?? '—'}</span>
                </div>
                <div style={{ background: '#e5e7eb', height: 10, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ background: '#0059b3', height: '100%', width: `${pct}%` }} />
                </div>
              </div>

              {p.target_metric && (
                <button style={ghostBtn} onClick={() => recompute(p.id)}>
                  Recompute current value from live data
                </button>
              )}

              {ind && (
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 4 }}>
                    HGIOS4 QI {ind.indicator_code} {ind.indicator_name}
                  </span>
                </div>
              )}
            </section>
          )
        })
      )}
    </div>
  )
}

function SipForm({ year, indicators, metrics, onSaved }: { year: string; indicators: SipResp['indicators']; metrics: SipResp['supported_metrics']; onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priorityNum, setPriorityNum] = useState('1')
  const [metric, setMetric] = useState('')
  const [baseline, setBaseline] = useState('')
  const [target, setTarget] = useState('')
  const [indicatorId, setIndicatorId] = useState('')

  async function submit() {
    await fetch('/api/school/analytics/sip', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        academic_year: year,
        priority_number: parseInt(priorityNum) || 1,
        title,
        description: description || null,
        target_metric: metric || null,
        baseline_value: baseline ? parseFloat(baseline) : null,
        target_value: target ? parseFloat(target) : null,
        inspection_indicator_id: indicatorId || null,
      }),
    })
    onSaved()
  }

  return (
    <section style={card}>
      <h3 style={h3}>Add SIP priority</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <label style={labelStyle}>Priority number
          <input type="number" value={priorityNum} onChange={(e) => setPriorityNum(e.target.value)} style={input} />
        </label>
        <label style={labelStyle}>Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} />
        </label>
        <label style={labelStyle}>HGIOS4 indicator
          <select value={indicatorId} onChange={(e) => setIndicatorId(e.target.value)} style={input}>
            <option value="">(none)</option>
            {indicators.map((i) => <option key={i.id} value={i.id}>{i.indicator_code} {i.indicator_name}</option>)}
          </select>
        </label>
        <label style={labelStyle}>Target metric
          <select value={metric} onChange={(e) => setMetric(e.target.value)} style={input}>
            <option value="">(free-text only)</option>
            {metrics.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </label>
        <label style={labelStyle}>Baseline value
          <input type="number" value={baseline} onChange={(e) => setBaseline(e.target.value)} style={input} />
        </label>
        <label style={labelStyle}>Target value
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} style={input} />
        </label>
      </div>
      <label style={labelStyle}>Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...input, minHeight: 60 }} />
      </label>
      <button style={primaryBtn} onClick={submit}>Save priority</button>
    </section>
  )
}

// ----------------------------------------------------------------------------
// Helpers / primitives
// ----------------------------------------------------------------------------

function Metric({ label, value, trend }: { label: string; value: string; trend?: number }) {
  const arrow = trend === undefined ? null : trend > 0 ? '▲' : trend < 0 ? '▼' : '—'
  const arrowColor = trend === undefined ? undefined : trend > 0 ? '#10b981' : trend < 0 ? '#dc2626' : '#64748b'
  return (
    <div style={subCard}>
      <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 2 }}>{value}</div>
      {arrow && trend !== undefined && (
        <div style={{ fontSize: 13, color: arrowColor, marginTop: 2 }}>
          {arrow} {trend > 0 ? '+' : ''}{trend}pp vs previous
        </div>
      )}
    </div>
  )
}

function StackedGradeBar({ bars }: { bars: Array<{ grade: string; count: number; pct: number }> }) {
  const total = bars.reduce((a, b) => a + b.count, 0)
  if (total === 0) return <p style={empty}>No grade data.</p>
  return (
    <div>
      <div style={{ display: 'flex', height: 32, borderRadius: 4, overflow: 'hidden' }}>
        {bars.map((b) => (
          <div key={b.grade} style={{ flex: b.count, background: gradeColor(b.grade), color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }} title={`${b.grade}: ${b.count} (${b.pct}%)`}>
            {b.pct >= 5 ? `${b.grade} ${b.pct}%` : ''}
          </div>
        ))}
      </div>
      <table style={{ width: '100%', marginTop: 12, fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr><th style={th}>Grade</th><th style={th}>Count</th><th style={th}>%</th></tr>
        </thead>
        <tbody>
          {bars.map((b) => (
            <tr key={b.grade}><td style={td}>{b.grade}</td><td style={td}>{b.count}</td><td style={td}>{b.pct}%</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function gradeColor(g: string): string {
  const x = g.trim().toUpperCase()
  if (x === 'A') return '#059669'
  if (x === 'B') return '#0284c7'
  if (x === 'C') return '#0059b3'
  if (x === 'D') return '#b45309'
  return '#64748b'
}

function DepartmentTable({ rows }: { rows: Array<{ department: string; student_count: number; avg_working_grade_numeric: number; pct_a_c: number; pct_on_track: number; completion_pct: number }> }) {
  const schoolAvgAc = rows.reduce((a, b) => a + b.pct_a_c, 0) / Math.max(1, rows.length)
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--pf-grey-200)' }}>
          <th style={th}>Department</th>
          <th style={th}>Students</th>
          <th style={th}>Avg grade</th>
          <th style={th}>% A-C</th>
          <th style={th}>% on track</th>
          <th style={th}>Completion</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const cmpColor = r.pct_a_c > schoolAvgAc + 5 ? '#059669' : r.pct_a_c < schoolAvgAc - 5 ? '#dc2626' : '#b45309'
          return (
            <tr key={r.department} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
              <td style={td}><Link href={`/school/departments/${encodeURIComponent(r.department)}`}>{r.department}</Link></td>
              <td style={td}>{r.student_count}</td>
              <td style={td}>{r.avg_working_grade_numeric.toFixed(2)}</td>
              <td style={{ ...td, color: cmpColor, fontWeight: 600 }}>{r.pct_a_c}%</td>
              <td style={td}>{r.pct_on_track}%</td>
              <td style={td}>{r.completion_pct}%</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function TrendTable({ rows }: { rows: Array<{ cycle_name: string; cycle_number: number; n5_5plus_ac_pct: number; higher_3plus_ac_pct: number }> }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid var(--pf-grey-200)' }}><th style={th}>Cycle</th><th style={th}>5+ N5 A-C</th><th style={th}>3+ Higher A-C</th></tr></thead>
      <tbody>
        {rows.map((r, i) => (<tr key={i} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}><td style={td}>{r.cycle_name}</td><td style={td}>{r.n5_5plus_ac_pct}%</td><td style={td}>{r.higher_3plus_ac_pct}%</td></tr>))}
      </tbody>
    </table>
  )
}

function ValueAddedTable({ rows }: { rows: Array<{ subject_name: string; students_assessed: number; avg_predicted_grade_numeric: number; avg_actual_grade_numeric: number; value_added: number; students_above: number; students_met: number; students_below: number }> }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--pf-grey-200)' }}>
          <th style={th}>Subject</th><th style={th}>Students</th><th style={th}>Predicted</th><th style={th}>Actual</th><th style={th}>Value-added</th><th style={th}>Above/Met/Below</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const vaColor = r.value_added > 0.2 ? '#059669' : r.value_added < -0.2 ? '#dc2626' : '#64748b'
          return (
            <tr key={r.subject_name} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
              <td style={td}>{r.subject_name}</td>
              <td style={td}>{r.students_assessed}</td>
              <td style={td}>{r.avg_predicted_grade_numeric.toFixed(2)}</td>
              <td style={td}>{r.avg_actual_grade_numeric.toFixed(2)}</td>
              <td style={{ ...td, color: vaColor, fontWeight: 600 }}>{r.value_added >= 0 ? `+${r.value_added.toFixed(2)}` : r.value_added.toFixed(2)}</td>
              <td style={td}>{r.students_above} / {r.students_met} / {r.students_below}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ----------------------------------------------------------------------------
// Shared styles
// ----------------------------------------------------------------------------

const card: React.CSSProperties = { background: 'white', border: '1px solid var(--pf-grey-200, #e5e7eb)', borderRadius: 8, padding: 20 }
const subCard: React.CSSProperties = { background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }
const h3: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, margin: '0 0 12px 0' }
const empty: React.CSSProperties = { fontSize: 14, opacity: 0.65, fontStyle: 'italic', margin: 0 }
const th: React.CSSProperties = { padding: '8px 4px', fontWeight: 600, fontSize: 13 }
const td: React.CSSProperties = { padding: '8px 4px' }
const tabStrip: React.CSSProperties = { display: 'flex', gap: 4, borderBottom: '2px solid var(--pf-grey-200)', overflowX: 'auto' }
const tabBtn: React.CSSProperties = { padding: '10px 14px', border: 'none', borderBottom: '2px solid transparent', marginBottom: '-2px', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--pf-grey-700)', whiteSpace: 'nowrap' }
const tabActive: React.CSSProperties = { borderBottomColor: 'var(--pf-blue-700, #1D4ED8)', color: 'var(--pf-blue-700, #1D4ED8)' }
const input: React.CSSProperties = { display: 'block', padding: '6px 10px', border: '1px solid var(--pf-grey-300, #cbd5e1)', borderRadius: 4, fontSize: 14, minWidth: 140 }
const labelStyle: React.CSSProperties = { fontSize: 13, display: 'block', marginTop: 8 }
const primaryBtn: React.CSSProperties = { padding: '8px 14px', background: 'var(--pf-blue-700, #1D4ED8)', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }
const ghostBtn: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: 'var(--pf-blue-700, #1D4ED8)', border: '1px solid var(--pf-blue-200, #bfdbfe)', borderRadius: 4, fontSize: 13, cursor: 'pointer', marginTop: 8 }
const ghostBtnLink: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: 'var(--pf-blue-700, #1D4ED8)', border: '1px solid var(--pf-blue-200, #bfdbfe)', borderRadius: 4, fontSize: 13, textDecoration: 'none' }
