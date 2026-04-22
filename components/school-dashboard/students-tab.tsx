'use client'

import { useEffect, useMemo, useState } from 'react'
import type { StudentDetail, StudentRow } from './types'

type SortKey = 'name' | 'schoolStage' | 'simdDecile' | 'coursesSaved' | 'sectorsExplored' | 'lastActiveAt'

export function StudentsTab({ canView }: { canView: boolean }) {
  const [rows, setRows] = useState<StudentRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' })
  const [q, setQ] = useState('')
  const [yg, setYg] = useState('')
  const [simdBand, setSimdBand] = useState('')
  const [active, setActive] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!canView) {
      setLoading(false)
      return
    }
    fetch('/api/school/dashboard/students')
      .then((r) => r.json())
      .then((d) => setRows(d.students ?? []))
      .finally(() => setLoading(false))
  }, [canView])

  const filtered = useMemo(() => {
    if (!rows) return []
    const qLower = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (qLower) {
        const n = `${r.firstName} ${r.lastName}`.toLowerCase()
        if (!n.includes(qLower)) return false
      }
      if (yg && r.schoolStage !== yg) return false
      if (simdBand) {
        const d = r.simdDecile
        const range = simdBand.split('-').map(Number)
        if (typeof d !== 'number') return false
        if (d < range[0] || d > range[1]) return false
      }
      if (active) {
        const isRecent = r.lastActiveAt && Date.now() - new Date(r.lastActiveAt).getTime() < 30 * 24 * 3600 * 1000
        if (active === 'active' && !isRecent) return false
        if (active === 'inactive' && isRecent) return false
      }
      return true
    })
  }, [rows, q, yg, simdBand, active])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      if (sort.key === 'name') {
        return ((a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)) * dir
      }
      if (sort.key === 'lastActiveAt') {
        const av = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0
        const bv = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0
        return (av - bv) * dir
      }
      const av = (a[sort.key] ?? 0) as number
      const bv = (b[sort.key] ?? 0) as number
      return (av - bv) * dir
    })
    return list
  }, [filtered, sort])

  if (!canView) {
    return (
      <div style={noticeCard}>
        <h3 style={{ margin: 0 }}>Individual-student view is not enabled for your role</h3>
        <p style={{ margin: '8px 0 0', fontSize: '0.9375rem' }}>
          Depute head teachers and head teachers see aggregate data by default. Ask your school admin to enable
          individual-student view if you need access for guidance meetings.
        </p>
      </div>
    )
  }

  if (loading) return <p>Loading…</p>

  const yearGroups = Array.from(new Set((rows ?? []).map((r) => r.schoolStage).filter(Boolean))) as string[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={filters}>
        <input placeholder="Search name" value={q} onChange={(e) => setQ(e.target.value)} style={input} />
        <select value={yg} onChange={(e) => setYg(e.target.value)} style={input}>
          <option value="">All year groups</option>
          {yearGroups.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={simdBand} onChange={(e) => setSimdBand(e.target.value)} style={input}>
          <option value="">All SIMD</option>
          <option value="1-2">SIMD 1-2</option>
          <option value="3-4">SIMD 3-4</option>
          <option value="5-6">SIMD 5-6</option>
          <option value="7-8">SIMD 7-8</option>
          <option value="9-10">SIMD 9-10</option>
        </select>
        <select value={active} onChange={(e) => setActive(e.target.value)} style={input}>
          <option value="">Any activity</option>
          <option value="active">Active (last 30 days)</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: '#fff', border: '1px solid var(--pf-grey-200)', borderRadius: '8px' }}>
        <table style={tbl}>
          <thead>
            <tr>
              <Th onClick={() => toggleSort('name')} sort={sort} sortKey="name">Name</Th>
              <Th onClick={() => toggleSort('schoolStage')} sort={sort} sortKey="schoolStage">Year</Th>
              <Th onClick={() => toggleSort('simdDecile')} sort={sort} sortKey="simdDecile">SIMD</Th>
              <Th onClick={() => toggleSort('coursesSaved')} sort={sort} sortKey="coursesSaved">Courses</Th>
              <Th onClick={() => toggleSort('sectorsExplored')} sort={sort} sortKey="sectorsExplored">Sectors</Th>
              <th style={th}>Quiz</th>
              <Th onClick={() => toggleSort('lastActiveAt')} sort={sort} sortKey="lastActiveAt">Last active</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td style={td} colSpan={7}>No students match the filters.</td></tr>
            )}
            {sorted.map((r) => (
              <StudentRowEl key={r.id} r={r} expanded={expandedId === r.id} onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  function toggleSort(k: SortKey) {
    setSort((prev) => (prev.key === k ? { key: k, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'asc' }))
  }
}

function Th({ children, onClick, sort, sortKey }: { children: React.ReactNode; onClick: () => void; sort: { key: string; dir: string }; sortKey: string }) {
  const active = sort.key === sortKey
  return (
    <th style={{ ...th, cursor: 'pointer', backgroundColor: active ? 'var(--pf-grey-50)' : undefined }} onClick={onClick}>
      {children} {active ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
    </th>
  )
}

function StudentRowEl({ r, expanded, onToggle }: { r: StudentRow; expanded: boolean; onToggle: () => void }) {
  const [detail, setDetail] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!expanded || detail) return
    setLoading(true)
    fetch(`/api/school/dashboard/student/${r.id}`)
      .then((res) => res.json())
      .then(setDetail)
      .finally(() => setLoading(false))
  }, [expanded, detail, r.id])

  const fullName = `${r.firstName} ${r.lastName}`.trim() || 'Unnamed student'
  const lastActive = r.lastActiveAt ? new Date(r.lastActiveAt).toLocaleDateString('en-GB') : '—'

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={onToggle}>
        <td style={td}>{fullName}</td>
        <td style={td}>{r.schoolStage ?? '—'}</td>
        <td style={td}>{r.simdDecile ?? '—'}</td>
        <td style={td}>{r.coursesSaved}</td>
        <td style={td}>{r.sectorsExplored}</td>
        <td style={td}>{r.quizCompleted ? '✓' : '✗'}</td>
        <td style={td}>{lastActive}</td>
      </tr>
      {expanded && (
        <tr>
          <td style={{ ...td, backgroundColor: 'var(--pf-grey-50)' }} colSpan={7}>
            {loading ? 'Loading…' : detail ? <StudentDetailPanel detail={detail} /> : 'Could not load detail.'}
          </td>
        </tr>
      )}
    </>
  )
}

function StudentDetailPanel({ detail }: { detail: StudentDetail }) {
  const handlePrint = () => {
    const w = window.open('', '_blank', 'noopener')
    if (!w) return
    w.document.write(buildGuidanceSummaryHtml(detail))
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{detail.student.firstName} {detail.student.lastName}</strong>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePrint} style={btn}>Prepare guidance summary (print)</button>
        </div>
      </div>

      <section>
        <h4 style={h4}>Saved courses</h4>
        {detail.savedCourses.length === 0 ? (
          <p style={empty}>No saved courses.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {detail.savedCourses.map((sc) => {
              const status = trafficForCourse(sc.courses?.entry_requirements ?? null, detail.grades)
              return (
                <li key={sc.course_id} style={{ marginBottom: '4px' }}>
                  <span style={{ ...dot, backgroundColor: status.color }} aria-hidden />
                  {sc.courses?.title ?? sc.course_id}
                  {detail.student.simdAdjustedEligible && <span style={adjusted}> · Adjusted offer based on postcode</span>}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h4 style={h4}>Subject choices by transition</h4>
        {detail.subjectChoices.length === 0 ? (
          <p style={empty}>No subject choices recorded.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {detail.subjectChoices.map((c, i) => (
              <li key={i}>{c.transition}: {c.subject_name}{c.is_reserve ? ' (reserve)' : ''}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 style={h4}>Checklist progress</h4>
        <p style={{ margin: 0 }}>{detail.checklistCount} item{detail.checklistCount === 1 ? '' : 's'} completed.</p>
      </section>
    </div>
  )
}

function trafficForCourse(entry: string | null, grades: { subject_name: string; grade: string }[]): { color: string } {
  if (!entry || grades.length === 0) return { color: '#9CA3AF' }
  // Heuristic: if any grade looks like A, bright green; if mix B, amber; else default
  const hasA = grades.some((g) => /^A/i.test(g.grade))
  const hasB = grades.some((g) => /^B/i.test(g.grade))
  if (hasA) return { color: '#16A34A' }
  if (hasB) return { color: '#F59E0B' }
  return { color: '#DC2626' }
}

function buildGuidanceSummaryHtml(detail: StudentDetail): string {
  const name = `${detail.student.firstName ?? ''} ${detail.student.lastName ?? ''}`.trim()
  const date = new Date().toLocaleDateString('en-GB')
  const courses = detail.savedCourses.map((c) => `<li>${escapeHtml(c.courses?.title ?? c.course_id)}</li>`).join('')
  const choices = detail.subjectChoices.map((c) => `<li>${escapeHtml(c.transition)}: ${escapeHtml(c.subject_name)}${c.is_reserve ? ' (reserve)' : ''}</li>`).join('')
  const grades = detail.grades.map((g) => `<li>${escapeHtml(g.subject_name)} (${escapeHtml(g.qualification_level)}): ${escapeHtml(g.grade)}</li>`).join('')
  return `<!DOCTYPE html><html><head><title>Guidance summary - ${escapeHtml(name)}</title>
    <style>
      body { font-family: Georgia, serif; padding: 24px; color: #1F2937; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; margin: 16px 0 4px; color: #6B7280; }
      ul { margin: 0; padding-left: 20px; }
      footer { margin-top: 32px; font-size: 11px; color: #6B7280; }
      @media print { body { padding: 12mm; } }
    </style></head><body>
    <h1>Guidance Meeting Summary</h1>
    <div>${escapeHtml(name)} - ${escapeHtml(detail.student.schoolStage ?? '')} - ${date} - Pathfinder Scotland</div>
    <h2>Saved courses</h2><ul>${courses || '<li>None</li>'}</ul>
    <h2>Predicted / current grades</h2><ul>${grades || '<li>None</li>'}</ul>
    <h2>Subject choices</h2><ul>${choices || '<li>None</li>'}</ul>
    <h2>Checklist progress</h2><p>${detail.checklistCount} items completed.</p>
    <footer>This summary reflects the student's activity on Pathfinder Scotland. It does not represent a complete record.</footer>
    </body></html>`
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const noticeCard: React.CSSProperties = {
  padding: '20px',
  backgroundColor: '#FEF3C7',
  border: '1px solid #F59E0B',
  borderRadius: '8px',
}
const filters: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '8px' }
const input: React.CSSProperties = { padding: '8px 10px', border: '1px solid var(--pf-grey-300)', borderRadius: '6px', fontSize: '0.875rem' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid var(--pf-grey-200)', fontWeight: 700 }
const td: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid var(--pf-grey-100)' }
const btn: React.CSSProperties = { padding: '8px 12px', border: '1px solid var(--pf-grey-300)', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }
const h4: React.CSSProperties = { margin: '0 0 6px', fontWeight: 700, fontSize: '0.9375rem' }
const empty: React.CSSProperties = { fontSize: '0.875rem', opacity: 0.7, margin: 0 }
const dot: React.CSSProperties = { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '6px', verticalAlign: 'middle' }
const adjusted: React.CSSProperties = { fontSize: '0.8125rem', opacity: 0.7, marginLeft: '6px' }
