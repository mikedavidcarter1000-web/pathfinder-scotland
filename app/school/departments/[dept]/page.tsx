'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type ClassRow = {
  id: string
  subject_name: string
  year_group: string
  class_code: string | null
  qualification: string | null
  teacher: string
  teacher_role: string | null
  student_count: number
  graded_count: number
  completion_pct: number
  grade_counts: Record<string, number>
  on_track_counts: Record<string, number>
  effort_counts: Record<string, number>
  c_and_above_count: number
  on_track_pct: number
  effort_good_pct: number
}

export default function DepartmentDrillPage() {
  const params = useParams<{ dept: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [deptName, setDeptName] = useState<string>('')
  const [cycle, setCycle] = useState<{ id: string; name: string } | null>(null)
  const [classes, setClasses] = useState<ClassRow[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/departments/${params?.dept ?? ''}`)
      return
    }
    const dept = params?.dept
    if (!dept) return
    fetch(`/api/school/tracking/departments/${dept}`)
      .then((r) => r.json())
      .then((d) => {
        setDeptName(d.department ?? decodeURIComponent(dept))
        setCycle(d.cycle)
        setClasses(d.classes ?? [])
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router, params])

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>

  const totalStudents = classes.reduce((n, c) => n + c.student_count, 0)
  const totalGraded = classes.reduce((n, c) => n + c.graded_count, 0)
  const totalCA = classes.reduce((n, c) => n + c.c_and_above_count, 0)

  const n5Classes = classes.filter((c) => c.qualification && /n5|national 5/i.test(c.qualification))
  const higherClasses = classes.filter((c) => c.qualification && /^h\b|higher/i.test(c.qualification) && !/advanced/i.test(c.qualification ?? ''))
  const advHigherClasses = classes.filter((c) => c.qualification && /advanced/i.test(c.qualification))

  const n5CountCAAbove = n5Classes.reduce((n, c) => n + c.c_and_above_count, 0)
  const n5Total = n5Classes.reduce((n, c) => n + c.student_count, 0)
  const higherCountCAAbove = higherClasses.reduce((n, c) => n + c.c_and_above_count, 0)
  const higherTotal = higherClasses.reduce((n, c) => n + c.student_count, 0)
  const ahCountCAAbove = advHigherClasses.reduce((n, c) => n + c.c_and_above_count, 0)
  const ahTotal = advHigherClasses.reduce((n, c) => n + c.student_count, 0)

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/school/departments" style={{ fontSize: '0.875rem' }}>&larr; Departments</Link>
      </div>
      <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem' }}>{deptName}</h1>
      <p style={{ opacity: 0.7 }}>
        {cycle ? <>Current cycle: <strong>{cycle.name}</strong></> : 'No current cycle.'}
      </p>

      <section style={cardBox}>
        <h2 style={h2}>Key measures</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <KeyStat label="Predicted A-C at N5" pct={n5Total ? Math.round((n5CountCAAbove / n5Total) * 100) : 0} sub={`${n5CountCAAbove}/${n5Total}`} />
          <KeyStat label="Predicted A-C at Higher" pct={higherTotal ? Math.round((higherCountCAAbove / higherTotal) * 100) : 0} sub={`${higherCountCAAbove}/${higherTotal}`} />
          <KeyStat label="Predicted A-C at AH" pct={ahTotal ? Math.round((ahCountCAAbove / ahTotal) * 100) : 0} sub={`${ahCountCAAbove}/${ahTotal}`} />
          <KeyStat label="Tracking completion" pct={totalStudents ? Math.round((totalGraded / totalStudents) * 100) : 0} sub={`${totalGraded}/${totalStudents}`} />
          <KeyStat label="A-C rate (all qualifications)" pct={totalGraded ? Math.round((totalCA / totalGraded) * 100) : 0} sub={`${totalCA}/${totalGraded}`} />
        </div>
      </section>

      <section style={cardBox}>
        <h2 style={h2}>Classes in this department</h2>
        {classes.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No classes in this department.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={th}>Class</th>
                  <th style={th}>Teacher</th>
                  <th style={th}>Year / Qual</th>
                  <th style={th}>Students</th>
                  <th style={th}>Completion</th>
                  <th style={th}>On track %</th>
                  <th style={th}>Effort good+ %</th>
                  <th style={th}>A-C count</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => {
                  const belowAvg = c.on_track_pct < 70
                  return (
                    <tr key={c.id} style={{ background: belowAvg ? '#fef2f2' : '#f0fdf4' }}>
                      <td style={td}>{c.subject_name} {c.class_code ?? ''}</td>
                      <td style={td}>{c.teacher}</td>
                      <td style={td}>{c.year_group}{c.qualification ? ` · ${c.qualification}` : ''}</td>
                      <td style={td}>{c.student_count}</td>
                      <td style={td}>{c.completion_pct}%</td>
                      <td style={td}>{c.on_track_pct}%</td>
                      <td style={td}>{c.effort_good_pct}%</td>
                      <td style={td}>{c.c_and_above_count}</td>
                      <td style={td}>
                        <Link href={`/school/tracking/${c.id}`} style={linkBtn}>Open</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function KeyStat({ label, pct, sub }: { label: string; pct: number; sub: string }) {
  return (
    <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }}>
      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: pct >= 60 ? '#166534' : pct >= 40 ? '#854d0e' : '#991b1b' }}>{pct}%</div>
      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{sub}</div>
    </div>
  )
}

const cardBox: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, background: 'white', marginTop: 14 }
const h2: React.CSSProperties = { margin: '0 0 10px', fontSize: '1.05rem' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }
const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '8px 10px', borderTop: '1px solid #f3f4f6' }
const linkBtn: React.CSSProperties = { padding: '4px 10px', background: '#1B3A5C', color: 'white', borderRadius: 6, textDecoration: 'none', fontSize: '0.75rem' }
