'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'
import type { DashboardMe } from '@/components/school-dashboard/types'

type Cycle = {
  id: string
  name: string
  academic_year: string
  cycle_number: number
  starts_at: string
  ends_at: string
  is_current: boolean
  is_locked: boolean
}

type ClassRow = {
  id: string
  staff_id: string
  year_group: string
  class_code: string | null
  academic_year: string
  subjects: { id: string; name: string } | null
  qualification_types: { id: string; name: string; short_name: string } | null
  staff: { id: string; full_name: string; role: string; department: string | null } | null
  student_count: number
}

function currentAcademicYear(): string {
  // UK academic year runs Aug -> Jul. Month index 7+ means the upper bound.
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const start = m >= 7 ? y : y - 1
  return `${start}/${start + 1}`
}

function suggestCycleName(n: number): string {
  const names = ['Autumn', 'Winter', 'Spring', 'Summer']
  return names[n - 1] ?? `Cycle ${n}`
}

export default function TrackingCyclesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [me, setMe] = useState<DashboardMe | null>(null)
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/tracking')
      return
    }
    Promise.all([
      fetch('/api/school/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/school/tracking/cycles').then((r) => (r.ok ? r.json() : { cycles: [] })),
      fetch('/api/school/tracking/classes').then((r) => (r.ok ? r.json() : { classes: [] })),
    ])
      .then(([m, c, cls]) => {
        if (!m) {
          router.replace('/school/register')
          return
        }
        setMe(m)
        setCycles(c.cycles ?? [])
        setClasses(cls.classes ?? [])
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  const canManage = !!me?.staff.canManageTracking || !!me?.staff.isAdmin
  const currentCycle = useMemo(() => cycles.find((c) => c.is_current) ?? null, [cycles])
  const myClasses = useMemo(() => classes.filter((c) => c.staff_id === me?.staff.staffId), [classes, me])
  const otherClasses = useMemo(() => classes.filter((c) => c.staff_id !== me?.staff.staffId), [classes, me])

  async function handleCreate(form: {
    name: string
    academic_year: string
    cycle_number: number
    starts_at: string
    ends_at: string
    set_current: boolean
  }) {
    const res = await fetch('/api/school/tracking/cycles', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Could not create cycle.')
      return
    }
    setCycles((prev) => [...prev.map((c) => (form.set_current ? { ...c, is_current: false } : c)), data.cycle])
    setShowCreate(false)
    toast.success('Cycle created.')
  }

  async function patchCycle(cycleId: string, patch: Partial<Cycle> & { set_current?: boolean }) {
    const res = await fetch(`/api/school/tracking/cycles/${cycleId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Could not update cycle.')
      return
    }
    setCycles((prev) =>
      prev.map((c) => {
        if (c.id === cycleId) return data.cycle
        if (patch.is_current === true) return { ...c, is_current: false }
        return c
      })
    )
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading tracking…</p></div>
  if (!me) return null

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/school/dashboard" style={{ fontSize: '0.875rem' }}>&larr; Dashboard</Link>
      </div>
      <h1 style={{ margin: '0 0 4px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem' }}>
        Tracking &amp; Monitoring
      </h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>
        Manage reporting cycles, class assignments, and grade entry.
      </p>

      {/* Current cycle callout */}
      <section style={panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>Current cycle</h2>
            {currentCycle ? (
              <div>
                <strong>{currentCycle.name}</strong> &middot; {currentCycle.academic_year}
                <span style={{ marginLeft: 8, ...pill(currentCycle.is_locked ? '#fef3c7' : '#dcfce7', currentCycle.is_locked ? '#854d0e' : '#166534') }}>
                  {currentCycle.is_locked ? 'Locked' : 'Open'}
                </span>
                <div style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: 4 }}>
                  {new Date(currentCycle.starts_at).toLocaleDateString('en-GB')} &ndash; {new Date(currentCycle.ends_at).toLocaleDateString('en-GB')}
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, opacity: 0.7 }}>No current cycle. Create one to start tracking.</p>
            )}
          </div>
          {canManage && (
            <button onClick={() => setShowCreate(true)} style={btnPrimary}>
              New cycle
            </button>
          )}
        </div>
      </section>

      {/* All cycles */}
      <section style={panel}>
        <h2 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>All cycles</h2>
        {cycles.length === 0 ? (
          <p style={{ opacity: 0.7, margin: 0 }}>No cycles yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={th}>Name</th>
                  <th style={th}>Academic year</th>
                  <th style={th}>Dates</th>
                  <th style={th}>Status</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={td}>{c.name}</td>
                    <td style={td}>{c.academic_year}</td>
                    <td style={td}>
                      {new Date(c.starts_at).toLocaleDateString('en-GB')} &ndash; {new Date(c.ends_at).toLocaleDateString('en-GB')}
                    </td>
                    <td style={td}>
                      {c.is_current && <span style={pill('#dbeafe', '#1e40af')}>Current</span>}{' '}
                      {c.is_locked ? (
                        <span style={pill('#fef3c7', '#854d0e')}>Locked</span>
                      ) : (
                        <span style={pill('#dcfce7', '#166534')}>Open</span>
                      )}
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      {canManage && !c.is_current && (
                        <button onClick={() => patchCycle(c.id, { is_current: true })} style={btnGhost}>
                          Set current
                        </button>
                      )}
                      {canManage && !c.is_locked && (
                        <button
                          onClick={() => {
                            if (confirm(`Lock ${c.name}? No further grade entry will be possible.`)) {
                              patchCycle(c.id, { is_locked: true })
                            }
                          }}
                          style={btnGhost}
                        >
                          Lock
                        </button>
                      )}
                      {canManage && c.is_locked && (
                        <button onClick={() => patchCycle(c.id, { is_locked: false })} style={btnGhost}>
                          Unlock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Your classes */}
      <section style={panel}>
        <h2 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>Your classes</h2>
        {myClasses.length === 0 ? (
          <p style={{ opacity: 0.7, margin: 0 }}>
            You have no classes assigned. {canManage ? 'Use the "All classes" section below to add one.' : 'Ask your admin to assign you to a class.'}
          </p>
        ) : (
          <div style={gridCards}>
            {myClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        )}
      </section>

      {/* All classes for admins/managers */}
      {canManage && (
        <section style={panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>All classes at the school</h2>
            <Link href="/school/tracking/classes/new" style={btnGhost}>
              Add class
            </Link>
          </div>
          {otherClasses.length === 0 && myClasses.length === 0 ? (
            <p style={{ opacity: 0.7, margin: 0 }}>No classes assigned yet. Classes appear here once teachers are assigned to subjects.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={th}>Teacher</th>
                    <th style={th}>Subject</th>
                    <th style={th}>Year / Level</th>
                    <th style={th}>Class code</th>
                    <th style={th}>Students</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {[...myClasses, ...otherClasses].map((cls) => (
                    <tr key={cls.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={td}>{cls.staff?.full_name ?? 'Unassigned'}</td>
                      <td style={td}>{cls.subjects?.name ?? '—'}</td>
                      <td style={td}>
                        {cls.year_group}
                        {cls.qualification_types ? ` · ${cls.qualification_types.short_name}` : ''}
                      </td>
                      <td style={td}>{cls.class_code ?? '—'}</td>
                      <td style={td}>{cls.student_count}</td>
                      <td style={td}>
                        <Link href={`/school/tracking/${cls.id}`} style={btnGhost}>
                          Open grid
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {showCreate && (
        <CycleCreateModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          suggestedCycleNumber={cycles.filter((c) => c.academic_year === currentAcademicYear()).length + 1}
        />
      )}
    </div>
  )
}

function ClassCard({ cls }: { cls: ClassRow }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{cls.subjects?.name ?? 'Subject TBC'}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
            {cls.year_group}
            {cls.qualification_types ? ` · ${cls.qualification_types.short_name}` : ''}
            {cls.class_code ? ` · ${cls.class_code}` : ''}
          </div>
        </div>
        <span style={pill('#e0e7ff', '#3730a3')}>{cls.student_count} students</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <Link href={`/school/tracking/${cls.id}`} style={btnPrimary}>
          Enter grades &rarr;
        </Link>
      </div>
    </div>
  )
}

function CycleCreateModal({
  onClose,
  onSubmit,
  suggestedCycleNumber,
}: {
  onClose: () => void
  onSubmit: (form: {
    name: string
    academic_year: string
    cycle_number: number
    starts_at: string
    ends_at: string
    set_current: boolean
  }) => void
  suggestedCycleNumber: number
}) {
  const [name, setName] = useState(suggestCycleName(suggestedCycleNumber))
  const [academicYear, setAcademicYear] = useState(currentAcademicYear())
  const [cycleNumber, setCycleNumber] = useState(suggestedCycleNumber)
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [setCurrent, setSetCurrent] = useState(true)

  function handle(e: React.FormEvent) {
    e.preventDefault()
    if (!startsAt || !endsAt) return
    onSubmit({
      name,
      academic_year: academicYear,
      cycle_number: cycleNumber,
      starts_at: startsAt,
      ends_at: endsAt,
      set_current: setCurrent,
    })
  }

  return (
    <div style={overlay}>
      <form onSubmit={handle} style={modal}>
        <h2 style={{ margin: '0 0 12px' }}>New tracking cycle</h2>
        <label style={labelStyle}>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
        </label>
        <label style={labelStyle}>
          Academic year
          <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={inputStyle} required />
        </label>
        <label style={labelStyle}>
          Cycle number
          <input
            type="number"
            min={1}
            max={8}
            value={cycleNumber}
            onChange={(e) => setCycleNumber(parseInt(e.target.value || '1', 10))}
            style={inputStyle}
            required
          />
        </label>
        <label style={labelStyle}>
          Starts
          <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={inputStyle} required />
        </label>
        <label style={labelStyle}>
          Ends
          <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} style={inputStyle} required />
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0 16px' }}>
          <input type="checkbox" checked={setCurrent} onChange={(e) => setSetCurrent(e.target.checked)} />
          Set as current cycle
        </label>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
          <button type="submit" style={btnPrimary}>Create</button>
        </div>
      </form>
    </div>
  )
}

const panel: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '16px',
  backgroundColor: 'white',
  marginTop: '16px',
}
const th: React.CSSProperties = { padding: '8px 10px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280' }
const td: React.CSSProperties = { padding: '10px', verticalAlign: 'middle' }
const gridCards: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }
const cardStyle: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', backgroundColor: '#fafafa' }
function pill(bg: string, fg: string): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '999px',
    backgroundColor: bg,
    color: fg,
    fontSize: '0.75rem',
    fontWeight: 600,
  }
}
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px',
  backgroundColor: '#1B3A5C',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
  textDecoration: 'none',
  display: 'inline-block',
}
const btnGhost: React.CSSProperties = {
  padding: '6px 10px',
  backgroundColor: 'transparent',
  color: '#1B3A5C',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.8125rem',
  marginRight: 4,
  textDecoration: 'none',
  display: 'inline-block',
}
const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
}
const modal: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '10px',
  padding: '20px',
  width: 'min(90vw, 420px)',
  display: 'flex',
  flexDirection: 'column',
}
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', marginBottom: '8px' }
const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '0.9rem',
}
