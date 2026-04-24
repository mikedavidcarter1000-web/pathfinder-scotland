'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'
import type { DashboardMe } from '@/components/school-dashboard/types'

type Round = {
  id: string
  name: string
  academic_year: string
  year_group: string
  transition: string | null
  status: 'draft' | 'open' | 'closed' | 'finalised'
}

type Column = {
  id: string
  round_id: string
  column_position: number
  label: string
  description: string | null
  is_compulsory: boolean
  allow_multiple: boolean
  max_selections: number
}

type ColumnSubject = {
  id: string
  column_id: string
  subject_id: string
  qualification_type_id: string | null
  capacity: number | null
  current_demand: number
  display_order: number
  notes: string | null
  subjects?: { id: string; name: string } | null
  qualification_types?: { id: string; short_name: string; name: string } | null
}

type Subject = { id: string; name: string }
type QualType = { id: string; name: string; short_name: string; scqf_level: number | null }

export default function ChoiceSetupPage() {
  const params = useParams<{ id: string }>()
  const roundId = params?.id as string
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [me, setMe] = useState<DashboardMe | null>(null)
  const [round, setRound] = useState<Round | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [columnSubjects, setColumnSubjects] = useState<ColumnSubject[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [qualTypes, setQualTypes] = useState<QualType[]>([])
  const [loading, setLoading] = useState(true)
  const [submissionCount, setSubmissionCount] = useState(0)

  async function loadRound() {
    const [rRes, sRes] = await Promise.all([
      fetch(`/api/school/choices/rounds/${roundId}`),
      fetch('/api/school/choices/subjects'),
    ])
    if (!rRes.ok) {
      router.replace('/school/choices')
      return
    }
    const rData = await rRes.json()
    const sData = await sRes.json()
    setRound(rData.round)
    setColumns(rData.columns ?? [])
    setColumnSubjects(rData.column_subjects ?? [])
    setSubjects(sData.subjects ?? [])
    setQualTypes(sData.qualification_types ?? [])
    setSubmissionCount(rData.submission_count ?? 0)
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/choices/${roundId}/setup`)
      return
    }
    if (!roundId) return
    Promise.all([
      fetch('/api/school/me').then((r) => (r.ok ? r.json() : null)),
      loadRound(),
    ])
      .then(([m]) => {
        if (!m) {
          router.replace('/school/register')
          return
        }
        setMe(m)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, roundId, router])

  const canManage = !!me?.staff.canManageTracking || !!me?.staff.isAdmin
  const locked = round?.status === 'finalised'

  async function addColumn() {
    const label = prompt('Column label (e.g. "Column 1: English" or "Mathematics"):')
    if (!label) return
    const res = await fetch(`/api/school/choices/rounds/${roundId}/columns`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ label: label.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Could not add column.')
      return
    }
    setColumns((prev) => [...prev, data.column])
    toast.success('Column added.')
  }

  async function updateColumn(id: string, patch: Partial<Column>) {
    const res = await fetch(`/api/school/choices/columns/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Could not update column.')
      return
    }
    setColumns((prev) => prev.map((c) => (c.id === id ? data.column : c)))
  }

  async function deleteColumn(id: string) {
    if (!confirm('Delete this column and all its subjects?')) return
    const res = await fetch(`/api/school/choices/columns/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? 'Could not delete column.')
      return
    }
    setColumns((prev) => prev.filter((c) => c.id !== id))
    setColumnSubjects((prev) => prev.filter((s) => s.column_id !== id))
    toast.success('Column deleted.')
  }

  async function addSubjectToColumn(columnId: string, subjectId: string, qualTypeId: string | null) {
    if (!subjectId) return
    const res = await fetch(`/api/school/choices/columns/${columnId}/subjects`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subject_id: subjectId, qualification_type_id: qualTypeId }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Could not add subject.')
      return
    }
    await loadRound()
    toast.success('Subject added.')
  }

  async function updateColumnSubject(id: string, patch: Partial<ColumnSubject>) {
    const res = await fetch(`/api/school/choices/column-subjects/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? 'Could not update.')
      return
    }
    const data = await res.json()
    setColumnSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...data.column_subject } : s)))
  }

  async function removeColumnSubject(id: string) {
    if (!confirm('Remove this subject from the column?')) return
    const res = await fetch(`/api/school/choices/column-subjects/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? 'Could not remove.')
      return
    }
    setColumnSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  async function changeStatus(status: Round['status']) {
    const res = await fetch(`/api/school/choices/rounds/${roundId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Could not update status.')
      return
    }
    setRound(data.round)
    toast.success(`Round marked as ${status}.`)
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  if (!me || !round) return null

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/school/choices" style={{ fontSize: '0.875rem' }}>&larr; All rounds</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem' }}>
            {round.name}
          </h1>
          <p style={{ marginTop: 4, opacity: 0.7 }}>
            {round.year_group} &middot; {round.academic_year} &middot; Status: <strong>{round.status}</strong> &middot; {submissionCount} submission{submissionCount === 1 ? '' : 's'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {canManage && round.status === 'draft' && columns.length > 0 && (
            <button style={btnPrimary} onClick={() => changeStatus('open')}>
              Open to students →
            </button>
          )}
          {canManage && round.status === 'open' && (
            <button style={btnGhost} onClick={() => changeStatus('closed')}>Close round</button>
          )}
          <Link href={`/school/choices/${roundId}/demand`} style={btnGhost}>View demand heatmap</Link>
        </div>
      </div>

      {locked && (
        <div style={bannerNote}>
          This round is <strong>finalised</strong> and can no longer be edited.
        </div>
      )}

      <section style={panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Columns</h2>
          {canManage && !locked && (
            <button style={btnGhost} onClick={addColumn}>+ Add column</button>
          )}
        </div>

        {columns.length === 0 ? (
          <p style={{ opacity: 0.7, margin: 0 }}>
            No columns yet. {canManage && !locked ? 'Add the first column to start building the structure (e.g. "Column 1: English").' : ''}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {columns
              .sort((a, b) => a.column_position - b.column_position)
              .map((col) => {
                const subs = columnSubjects.filter((s) => s.column_id === col.id)
                return (
                  <ColumnBlock
                    key={col.id}
                    col={col}
                    subs={subs}
                    subjects={subjects}
                    qualTypes={qualTypes}
                    canManage={canManage && !locked}
                    onUpdate={(patch) => updateColumn(col.id, patch)}
                    onDelete={() => deleteColumn(col.id)}
                    onAddSubject={(sid, qid) => addSubjectToColumn(col.id, sid, qid)}
                    onUpdateSubject={(id, patch) => updateColumnSubject(id, patch)}
                    onRemoveSubject={(id) => removeColumnSubject(id)}
                  />
                )
              })}
          </div>
        )}
      </section>
    </div>
  )
}

function ColumnBlock({
  col,
  subs,
  subjects,
  qualTypes,
  canManage,
  onUpdate,
  onDelete,
  onAddSubject,
  onUpdateSubject,
  onRemoveSubject,
}: {
  col: Column
  subs: ColumnSubject[]
  subjects: Subject[]
  qualTypes: QualType[]
  canManage: boolean
  onUpdate: (patch: Partial<Column>) => void
  onDelete: () => void
  onAddSubject: (subjectId: string, qualTypeId: string | null) => void
  onUpdateSubject: (id: string, patch: Partial<ColumnSubject>) => void
  onRemoveSubject: (id: string) => void
}) {
  const [pickerSubject, setPickerSubject] = useState('')
  const [pickerQual, setPickerQual] = useState('')

  const availableSubjects = useMemo(() => {
    const used = new Set(subs.map((s) => s.subject_id))
    return subjects.filter((s) => !used.has(s.id))
  }, [subs, subjects])

  return (
    <div style={columnCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <strong style={{ fontSize: '1rem' }}>Column {col.column_position}</strong>
            {col.is_compulsory && <span style={pill('#fee2e2', '#991b1b')}>Compulsory</span>}
            {col.allow_multiple && <span style={pill('#e0e7ff', '#3730a3')}>Multi-select ×{col.max_selections}</span>}
          </div>
          {canManage ? (
            <input
              defaultValue={col.label}
              onBlur={(e) => e.target.value.trim() !== col.label && onUpdate({ label: e.target.value.trim() })}
              style={{ ...inputStyle, marginTop: 4, width: '100%' }}
            />
          ) : (
            <div style={{ marginTop: 4, fontWeight: 600 }}>{col.label}</div>
          )}
        </div>
        {canManage && (
          <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end' }}>
            <label style={{ fontSize: '0.75rem', display: 'flex', gap: 4, alignItems: 'center' }}>
              <input type="checkbox" checked={col.is_compulsory} onChange={(e) => onUpdate({ is_compulsory: e.target.checked })} />
              Compulsory
            </label>
            <label style={{ fontSize: '0.75rem', display: 'flex', gap: 4, alignItems: 'center' }}>
              <input type="checkbox" checked={col.allow_multiple} onChange={(e) => onUpdate({ allow_multiple: e.target.checked })} />
              Multi-select
            </label>
            {col.allow_multiple && (
              <label style={{ fontSize: '0.75rem', display: 'flex', gap: 4, alignItems: 'center' }}>
                Max:
                <input
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={col.max_selections}
                  onBlur={(e) => onUpdate({ max_selections: parseInt(e.target.value, 10) || 1 })}
                  style={{ ...inputStyle, width: 60 }}
                />
              </label>
            )}
            <button style={btnDanger} onClick={onDelete}>Delete column</button>
          </div>
        )}
      </div>

      {/* Subjects in column */}
      <div style={{ marginTop: 8 }}>
        {subs.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.6 }}>
            No subjects in this column yet. Add one below.
          </p>
        ) : (
          <table style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b7280', fontSize: '0.75rem' }}>
                <th style={thSmall}>Subject</th>
                <th style={thSmall}>Level</th>
                <th style={thSmall}>Capacity</th>
                <th style={thSmall}>Demand</th>
                <th style={thSmall}></th>
              </tr>
            </thead>
            <tbody>
              {subs.sort((a, b) => a.display_order - b.display_order).map((s) => (
                <tr key={s.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={tdSmall}>{s.subjects?.name ?? '—'}</td>
                  <td style={tdSmall}>
                    {canManage ? (
                      <select
                        value={s.qualification_type_id ?? ''}
                        onChange={(e) => onUpdateSubject(s.id, { qualification_type_id: e.target.value || null })}
                        style={{ ...inputStyle, padding: '4px 6px', fontSize: '0.8rem' }}
                      >
                        <option value="">—</option>
                        {qualTypes.map((q) => (
                          <option key={q.id} value={q.id}>{q.short_name}</option>
                        ))}
                      </select>
                    ) : (
                      s.qualification_types?.short_name ?? '—'
                    )}
                  </td>
                  <td style={tdSmall}>
                    {canManage ? (
                      <input
                        type="number"
                        defaultValue={s.capacity ?? ''}
                        placeholder="∞"
                        onBlur={(e) => {
                          const v = e.target.value === '' ? null : parseInt(e.target.value, 10)
                          if (v !== s.capacity) onUpdateSubject(s.id, { capacity: v })
                        }}
                        style={{ ...inputStyle, padding: '4px 6px', width: 70, fontSize: '0.8rem' }}
                      />
                    ) : (
                      s.capacity ?? '∞'
                    )}
                  </td>
                  <td style={tdSmall}>
                    <span style={{ fontWeight: 600, color: s.capacity !== null && s.current_demand > s.capacity ? '#dc2626' : '#374151' }}>
                      {s.current_demand}
                    </span>
                  </td>
                  <td style={tdSmall}>
                    {canManage && (
                      <button style={btnDangerSmall} onClick={() => onRemoveSubject(s.id)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {canManage && availableSubjects.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={pickerSubject} onChange={(e) => setPickerSubject(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 200 }}>
              <option value="">Add a subject…</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select value={pickerQual} onChange={(e) => setPickerQual(e.target.value)} style={{ ...inputStyle, width: 140 }}>
              <option value="">No level</option>
              {qualTypes.map((q) => (
                <option key={q.id} value={q.id}>{q.short_name}</option>
              ))}
            </select>
            <button
              style={btnGhost}
              onClick={() => {
                if (pickerSubject) {
                  onAddSubject(pickerSubject, pickerQual || null)
                  setPickerSubject('')
                  setPickerQual('')
                }
              }}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const panel: React.CSSProperties = {
  border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', backgroundColor: 'white', marginTop: '16px',
}
const columnCard: React.CSSProperties = {
  border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 14px', backgroundColor: '#fafafa',
}
const bannerNote: React.CSSProperties = {
  marginTop: 12, padding: '10px 12px', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 6, fontSize: '0.875rem',
}
const thSmall: React.CSSProperties = { padding: '4px 6px', textTransform: 'uppercase', letterSpacing: '0.03em' }
const tdSmall: React.CSSProperties = { padding: '6px' }
function pill(bg: string, fg: string): React.CSSProperties {
  return { display: 'inline-block', padding: '1px 8px', borderRadius: 999, backgroundColor: bg, color: fg, fontSize: '0.7rem', fontWeight: 600, marginLeft: 4 }
}
const inputStyle: React.CSSProperties = { padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
}
const btnGhost: React.CSSProperties = {
  padding: '6px 10px', backgroundColor: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-block',
}
const btnDanger: React.CSSProperties = {
  padding: '6px 10px', backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem',
}
const btnDangerSmall: React.CSSProperties = { ...btnDanger, padding: '3px 8px' }
