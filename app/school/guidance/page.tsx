'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type StudentRow = {
  id: string
  firstName: string
  lastName: string
  schoolStage: string | null
  houseGroup: string | null
  registrationClass: string | null
  lastActiveAt: string | null
  interventionCount: number
  flags: {
    careExperienced: boolean
    fsm: boolean
    youngCarer: boolean
    asn: boolean
    attendanceConcern: boolean
    hasActiveSafeguarding: boolean
  }
}

type OverdueItem = {
  id: string
  studentId: string
  studentName: string
  title: string
  dueDate: string
  daysOverdue: number
}

type CaseloadPayload = {
  stats: {
    totalStudents: number
    interventionsThisMonth: number
    overdueFollowUps: number
    asnReviewsDueThisMonth: number
    pendingSurveys: number
  }
  students: StudentRow[]
  overdueList: OverdueItem[]
  canViewSafeguarding: boolean
  canViewSensitiveFlags: boolean
}

type BursaryAlerts = {
  students: Array<{ studentId: string; name: string; schoolStage: string | null; eligibleCount: number }>
  summary: { totalFlagged: number }
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        background: color,
        color: '#fff',
        fontSize: 11,
        fontWeight: 600,
        marginRight: 4,
        marginBottom: 2,
      }}
    >
      {children}
    </span>
  )
}

export default function GuidanceCaseloadPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [payload, setPayload] = useState<CaseloadPayload | null>(null)
  const [bursary, setBursary] = useState<BursaryAlerts | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [yearFilter, setYearFilter] = useState<string>('')
  const [houseFilter, setHouseFilter] = useState<string>('')
  const [sortKey, setSortKey] = useState<'name' | 'year' | 'lastActive' | 'interventions'>('name')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/guidance')
      return
    }
    Promise.all([
      fetch('/api/school/guidance/caseload').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/school/guidance/bursary-alerts').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([c, b]) => {
        setPayload(c)
        setBursary(b)
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  const filteredStudents = useMemo(() => {
    if (!payload) return []
    let rows = payload.students
    const q = filter.trim().toLowerCase()
    if (q) rows = rows.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q))
    if (yearFilter) rows = rows.filter((s) => s.schoolStage === yearFilter)
    if (houseFilter) rows = rows.filter((s) => s.houseGroup === houseFilter)

    const sorted = [...rows]
    sorted.sort((a, b) => {
      if (sortKey === 'name') return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
      if (sortKey === 'year') return (a.schoolStage ?? '').localeCompare(b.schoolStage ?? '')
      if (sortKey === 'lastActive') return (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? '')
      return b.interventionCount - a.interventionCount
    })
    return sorted
  }, [payload, filter, yearFilter, houseFilter, sortKey])

  const yearOptions = useMemo(() => {
    if (!payload) return [] as string[]
    return Array.from(new Set(payload.students.map((s) => s.schoolStage).filter((x): x is string => !!x))).sort()
  }, [payload])

  const houseOptions = useMemo(() => {
    if (!payload) return [] as string[]
    return Array.from(new Set(payload.students.map((s) => s.houseGroup).filter((x): x is string => !!x))).sort()
  }, [payload])

  if (loading) return <div style={{ padding: 32 }}>Loading your caseload...</div>
  if (!payload) return <div style={{ padding: 32 }}>Could not load caseload.</div>

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Guidance Hub</h1>
        <Link href="/school/dashboard" style={{ color: '#0059b3', fontSize: 14 }}>
          Back to school dashboard
        </Link>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Students in caseload" value={payload.stats.totalStudents} />
        <StatCard label="Interventions this month" value={payload.stats.interventionsThisMonth} />
        <StatCard
          label="Overdue follow-ups"
          value={payload.stats.overdueFollowUps}
          warn={payload.stats.overdueFollowUps > 0}
        />
        <StatCard
          label="ASN reviews due this month"
          value={payload.stats.asnReviewsDueThisMonth}
          warn={payload.stats.asnReviewsDueThisMonth > 0}
        />
        <StatCard label="Open surveys" value={payload.stats.pendingSurveys} />
      </div>

      {/* Quick-access links */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <Link href="/school/guidance/wellbeing" style={linkButton}>
          Wellbeing surveys
        </Link>
        {payload.canViewSafeguarding && (
          <Link href="/school/guidance/safeguarding" style={linkButton}>
            Safeguarding & CP
          </Link>
        )}
      </div>

      {/* Overdue follow-ups panel */}
      {payload.overdueList.length > 0 && (
        <section style={{ marginBottom: 24, border: '1px solid #fca5a5', background: '#fef2f2', padding: 12, borderRadius: 6 }}>
          <h2 style={{ fontSize: 16, margin: '0 0 8px 0', color: '#991b1b' }}>
            Overdue follow-ups ({payload.overdueList.length})
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {payload.overdueList.slice(0, 6).map((o) => (
              <li key={o.id} style={{ marginBottom: 4 }}>
                <Link href={`/school/guidance/${o.studentId}?tab=interventions`} style={{ color: '#0059b3' }}>
                  {o.studentName}
                </Link>{' '}
                &mdash; {o.title} <span style={{ color: '#991b1b' }}>({o.daysOverdue} days overdue)</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bursary alerts */}
      {bursary && bursary.summary.totalFlagged > 0 && (
        <section style={{ marginBottom: 24, border: '1px solid #fcd34d', background: '#fffbeb', padding: 12, borderRadius: 6 }}>
          <h2 style={{ fontSize: 16, margin: '0 0 8px 0' }}>
            Bursary opportunities
          </h2>
          <p style={{ margin: '0 0 6px 0', fontSize: 14 }}>
            <strong>{bursary.summary.totalFlagged}</strong> students in your caseload may be eligible for bursaries or awards.
          </p>
          <details style={{ fontSize: 14 }}>
            <summary style={{ cursor: 'pointer' }}>See breakdown</summary>
            <ul style={{ marginTop: 6, paddingLeft: 18 }}>
              {bursary.students.slice(0, 12).map((s) => (
                <li key={s.studentId} style={{ marginBottom: 2 }}>
                  <Link href={`/school/guidance/${s.studentId}?tab=overview`} style={{ color: '#0059b3' }}>
                    {s.name}
                  </Link>{' '}
                  ({s.schoolStage ?? '-'}) &mdash; {s.eligibleCount} eligible
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      {/* Student list */}
      <h2 style={{ fontSize: 18, margin: '0 0 8px 0' }}>
        Your caseload ({payload.students.length})
      </h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name..."
          style={{ padding: '6px 10px', border: '1px solid #d0d0d0', borderRadius: 4, fontSize: 14, flex: '1 1 200px' }}
        />
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectStyle}>
          <option value="">All year groups</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y.toUpperCase()}</option>
          ))}
        </select>
        <select value={houseFilter} onChange={(e) => setHouseFilter(e.target.value)} style={selectStyle}>
          <option value="">All houses</option>
          {houseOptions.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} style={selectStyle}>
          <option value="name">Sort: name</option>
          <option value="year">Sort: year</option>
          <option value="lastActive">Sort: last active</option>
          <option value="interventions">Sort: intervention count</option>
        </select>
      </div>

      <div style={{ border: '1px solid #e5e5e5', borderRadius: 6, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Year</th>
              <th style={thStyle}>House</th>
              <th style={thStyle}>Reg</th>
              <th style={thStyle}>Last active</th>
              <th style={thStyle}>Interventions</th>
              <th style={thStyle}>Flags</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 24, color: '#666', textAlign: 'center' }}>
                  No students match your filters.
                </td>
              </tr>
            )}
            {filteredStudents.map((s) => (
              <tr key={s.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={tdStyle}>
                  <Link href={`/school/guidance/${s.id}`} style={{ color: '#0059b3' }}>
                    {s.firstName} {s.lastName}
                  </Link>
                </td>
                <td style={tdStyle}>{s.schoolStage?.toUpperCase() ?? '-'}</td>
                <td style={tdStyle}>{s.houseGroup ?? '-'}</td>
                <td style={tdStyle}>{s.registrationClass ?? '-'}</td>
                <td style={tdStyle}>{s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleDateString('en-GB') : '-'}</td>
                <td style={tdStyle}>{s.interventionCount}</td>
                <td style={tdStyle}>
                  {payload.canViewSensitiveFlags && s.flags.careExperienced && <Badge color="#7c3aed">Care exp.</Badge>}
                  {payload.canViewSensitiveFlags && s.flags.fsm && <Badge color="#2563eb">FSM</Badge>}
                  {payload.canViewSensitiveFlags && s.flags.youngCarer && <Badge color="#0d9488">Young carer</Badge>}
                  {s.flags.asn && <Badge color="#d97706">ASN</Badge>}
                  {s.flags.attendanceConcern && <Badge color="#dc2626">Attendance &lt; 90%</Badge>}
                  {payload.canViewSafeguarding && s.flags.hasActiveSafeguarding && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '2px solid #dc2626',
                        color: '#dc2626',
                        fontSize: 11,
                        fontWeight: 600,
                        marginRight: 4,
                      }}
                    >
                      Safeguarding
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div
      style={{
        padding: 12,
        border: '1px solid #e5e5e5',
        borderRadius: 6,
        background: warn ? '#fef2f2' : '#fff',
      }}
    >
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: warn ? '#991b1b' : '#111' }}>{value}</div>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontWeight: 600 }
const tdStyle: React.CSSProperties = { padding: '8px 10px', verticalAlign: 'top' }
const selectStyle: React.CSSProperties = { padding: '6px 10px', border: '1px solid #d0d0d0', borderRadius: 4, fontSize: 14 }
const linkButton: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 14,
  border: '1px solid #d0d0d0',
  borderRadius: 4,
  background: '#fff',
  color: '#0059b3',
  textDecoration: 'none',
}
