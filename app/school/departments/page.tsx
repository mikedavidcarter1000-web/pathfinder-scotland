'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type Department = {
  department: string
  teacher_count: number
  class_count: number
  student_count: number
  expected_entries: number
  actual_entries: number
  completion_pct: number
  grade_counts: Record<string, number>
  on_track_counts: Record<string, number>
  effort_counts: Record<string, number>
}

export default function DepartmentsOverviewPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [cycle, setCycle] = useState<{ id: string; name: string } | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/departments')
      return
    }
    fetch('/api/school/tracking/departments')
      .then((r) => r.json())
      .then((d) => {
        setCycle(d.cycle)
        setDepartments(d.departments ?? [])
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  const totals = useMemo(() => {
    const acc = { students: 0, classes: 0, teachers: 0, expected: 0, actual: 0 }
    for (const d of departments) {
      acc.students += d.student_count
      acc.classes += d.class_count
      acc.teachers += d.teacher_count
      acc.expected += d.expected_entries
      acc.actual += d.actual_entries
    }
    return { ...acc, completion: acc.expected === 0 ? 0 : Math.round((acc.actual / acc.expected) * 100) }
  }, [departments])

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading departments…</p></div>

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/school/dashboard" style={{ fontSize: '0.875rem' }}>&larr; Dashboard</Link>
      </div>
      <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem' }}>Departments</h1>
      <p style={{ opacity: 0.7 }}>
        {cycle ? <>Current cycle: <strong>{cycle.name}</strong></> : 'No current cycle.'}
      </p>

      <section style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <Stat label="Departments" value={departments.length} />
          <Stat label="Teachers" value={totals.teachers} />
          <Stat label="Classes" value={totals.classes} />
          <Stat label="Students" value={totals.students} />
          <Stat label="Completion" value={`${totals.completion}%`} />
        </div>
      </section>

      <div style={gridCards}>
        {departments.map((d) => (
          <Link key={d.department} href={`/school/departments/${encodeURIComponent(d.department)}`} style={cardLink}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <h3 style={{ margin: 0 }}>{d.department}</h3>
              <span style={pill('#dbeafe', '#1e40af')}>{d.completion_pct}%</span>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: '0.875rem', flexWrap: 'wrap' }}>
              <span>{d.teacher_count} teachers</span>
              <span>{d.class_count} classes</span>
              <span>{d.student_count} students</span>
            </div>
            <GradeBar counts={d.grade_counts} total={d.actual_entries} />
          </Link>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{value}</div>
    </div>
  )
}

function GradeBar({ counts, total }: { counts: Record<string, number>; total: number }) {
  if (total === 0) return <div style={{ marginTop: 10, fontSize: '0.75rem', color: '#9ca3af' }}>No grades entered yet.</div>
  const order = ['A', 'B', 'C', 'D', 'No Award']
  const colours: Record<string, string> = { A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#fb923c', 'No Award': '#ef4444' }
  const parts: { g: string; n: number }[] = order.map((g) => ({ g, n: counts[g] ?? counts[g.toLowerCase()] ?? 0 })).filter((p) => p.n > 0)
  // Unknown grades (anything not in `order`) lumped into "Other"
  const known = new Set(order.concat(order.map((g) => g.toLowerCase())))
  const otherN = Object.entries(counts).filter(([g]) => !known.has(g)).reduce((acc, [, n]) => acc + n, 0)
  if (otherN > 0) parts.push({ g: 'Other', n: otherN })
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: '#f3f4f6' }}>
        {parts.map((p) => (
          <div key={p.g} style={{ flex: p.n, background: colours[p.g] ?? '#9ca3af' }} title={`${p.g}: ${p.n}`} />
        ))}
      </div>
      <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 4 }}>
        {parts.map((p) => <span key={p.g} style={{ marginRight: 10 }}>{p.g}: {p.n}</span>)}
      </div>
    </div>
  )
}

const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, background: 'white', marginTop: 14 }
const gridCards: React.CSSProperties = { marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }
const cardLink: React.CSSProperties = { display: 'block', padding: 14, border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', textDecoration: 'none', color: '#111827' }
function pill(bg: string, fg: string): React.CSSProperties {
  return { display: 'inline-block', padding: '2px 8px', borderRadius: 999, backgroundColor: bg, color: fg, fontSize: '0.75rem', fontWeight: 600 }
}
