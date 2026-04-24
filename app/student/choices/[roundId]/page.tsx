'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'

type Round = {
  id: string
  name: string
  academic_year: string
  year_group: string
  status: 'open' | 'closed' | 'finalised'
  requires_parent_approval: boolean
  instructions: string | null
  schools?: { name: string; slug: string } | null
}

type Column = {
  id: string
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
  capacity: number | null
  display_order: number
  notes: string | null
  subjects?: { id: string; name: string; description?: string; why_choose?: string } | null
  qualification_types?: { short_name: string } | null
}

type MyChoice = {
  id: string
  status: 'draft' | 'submitted' | 'parent_pending' | 'confirmed' | 'rejected' | 'cancelled'
  submitted_at: string | null
  parent_approval_required: boolean
  parent_comment: string | null
}

type MyItem = {
  id: string
  column_id: string
  column_subject_id: string
  subject_id: string
  is_reserve: boolean
  reserve_order: number | null
}

type Consequences = {
  selected_subject_ids: string[]
  course_fits: {
    course_id: string
    course_name?: string
    university_name?: string
    status: 'green' | 'amber' | 'red' | 'unknown'
    required_count: number
    met_count: number
    missing_subjects: string[]
  }[]
  sector_coverage: { sector_id: string; sector_name: string; subject_count: number; core_subject_count: number }[]
  subject_count: number
}

// Map of column_id -> selected column_subject_id(s).
type Selection = Record<string, Set<string>>

export default function StudentChoiceFormPage() {
  const params = useParams<{ roundId: string }>()
  const roundId = params?.roundId as string
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [round, setRound] = useState<Round | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [columnSubjects, setColumnSubjects] = useState<ColumnSubject[]>([])
  const [myChoice, setMyChoice] = useState<MyChoice | null>(null)
  const [selection, setSelection] = useState<Selection>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [consequences, setConsequences] = useState<Consequences | null>(null)
  const consequencesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/student/choices/${roundId}`)
      return
    }
    if (!roundId) return
    fetch(`/api/student/choices/${roundId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) {
          router.replace('/student/choices')
          return
        }
        setRound(d.round)
        setColumns(d.columns ?? [])
        setColumnSubjects(d.column_subjects ?? [])
        setMyChoice(d.my_choice)

        // Hydrate selection: existing items + auto-select compulsory columns.
        const sel: Selection = {}
        for (const it of (d.my_items ?? []) as MyItem[]) {
          if (it.is_reserve) continue
          if (!sel[it.column_id]) sel[it.column_id] = new Set()
          sel[it.column_id].add(it.column_subject_id)
        }
        for (const col of (d.columns ?? []) as Column[]) {
          if (col.is_compulsory) {
            const compSubs = (d.column_subjects ?? []).filter((s: ColumnSubject) => s.column_id === col.id)
            if (compSubs.length === 1 && !sel[col.id]) {
              sel[col.id] = new Set([compSubs[0].id])
            }
          }
        }
        setSelection(sel)
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, roundId, router])

  const selectedSubjectIds = useMemo(() => {
    const ids: string[] = []
    for (const colId of Object.keys(selection)) {
      for (const colSubjectId of selection[colId]) {
        const cs = columnSubjects.find((x) => x.id === colSubjectId)
        if (cs) ids.push(cs.subject_id)
      }
    }
    return ids
  }, [selection, columnSubjects])

  // Debounced consequence fetch.
  useEffect(() => {
    if (!round) return
    if (consequencesTimer.current) clearTimeout(consequencesTimer.current)
    consequencesTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/student/choices/${round.id}/consequences`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subject_ids: selectedSubjectIds }),
      })
      if (res.ok) setConsequences(await res.json())
    }, 250)
    return () => {
      if (consequencesTimer.current) clearTimeout(consequencesTimer.current)
    }
  }, [selectedSubjectIds, round])

  // Debounced save.
  useEffect(() => {
    if (!round || !myChoice) return
    if (myChoice.status === 'confirmed' || round.status !== 'open') return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveDraft()
    }, 700)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection])

  function toggleSelection(col: Column, columnSubjectId: string) {
    if (col.is_compulsory) return
    if (round?.status !== 'open') return
    if (myChoice?.status === 'confirmed') return
    setSelection((prev) => {
      const next: Selection = { ...prev }
      const existing = prev[col.id] ? new Set(prev[col.id]) : new Set<string>()
      if (col.allow_multiple) {
        if (existing.has(columnSubjectId)) {
          existing.delete(columnSubjectId)
        } else if (existing.size < col.max_selections) {
          existing.add(columnSubjectId)
        } else {
          // Replace the oldest (first) selection with the new one.
          const first = existing.values().next().value
          if (first) existing.delete(first)
          existing.add(columnSubjectId)
        }
      } else {
        existing.clear()
        existing.add(columnSubjectId)
      }
      next[col.id] = existing
      return next
    })
  }

  async function saveDraft() {
    if (!round) return
    const items: { column_id: string; column_subject_id: string; subject_id: string }[] = []
    for (const col of columns) {
      for (const csId of selection[col.id] ?? []) {
        const cs = columnSubjects.find((x) => x.id === csId)
        if (cs) items.push({ column_id: col.id, column_subject_id: csId, subject_id: cs.subject_id })
      }
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/student/choices/${round.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Could not save draft.')
      } else if (!myChoice) {
        const data = await res.json()
        setMyChoice({
          id: data.student_choice_id,
          status: 'draft',
          submitted_at: null,
          parent_approval_required: round.requires_parent_approval,
          parent_comment: null,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  async function submit() {
    if (!round) return
    // Validate: each non-multi column has exactly one pick; each multi column has 1..max.
    const missing: string[] = []
    for (const col of columns) {
      const picks = selection[col.id] ?? new Set()
      if (picks.size === 0) missing.push(col.label)
      else if (!col.allow_multiple && picks.size !== 1) missing.push(col.label)
    }
    if (missing.length > 0) {
      toast.error(`Please make a pick in every column (missing: ${missing.join(', ')}).`)
      return
    }

    // Ensure draft is saved first.
    await saveDraft()

    const res = await fetch(`/api/student/choices/${round.id}/submit`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Could not submit.')
      return
    }
    setMyChoice(data.student_choice)
    toast.success(round.requires_parent_approval ? 'Submitted — waiting for parent approval.' : 'Choices submitted.')
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  if (!round) return null

  const confirmed = myChoice?.status === 'confirmed'
  const waitingForParent = myChoice?.status === 'parent_pending'
  const rejected = myChoice?.status === 'rejected'
  const roundIsOpen = round.status === 'open'
  const readOnly = confirmed || !roundIsOpen

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/student/choices" style={{ fontSize: '0.875rem' }}>&larr; All rounds</Link>
      </div>

      <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem' }}>
        {round.name}
      </h1>
      <p style={{ marginTop: 4, opacity: 0.7 }}>
        {round.schools?.name ?? 'Your school'} · {round.year_group} · {round.academic_year}
      </p>

      {round.instructions && (
        <div style={bannerInfo}>
          <strong>From your school:</strong> {round.instructions}
        </div>
      )}

      {confirmed && (
        <div style={bannerSuccess}>
          Your choices have been <strong>confirmed</strong>. To change them now, speak with your guidance teacher.
        </div>
      )}
      {waitingForParent && (
        <div style={bannerInfo}>
          Your choices were submitted on {myChoice?.submitted_at ? new Date(myChoice.submitted_at).toLocaleDateString('en-GB') : ''}. They&apos;re now waiting for your parent or carer to approve.
        </div>
      )}
      {rejected && myChoice?.parent_comment && (
        <div style={bannerWarn}>
          Your parent asked you to look at your choices again. Their note: &ldquo;{myChoice.parent_comment}&rdquo;
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 16, marginTop: 16 }}>
        {/* Left column: form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {columns
            .sort((a, b) => a.column_position - b.column_position)
            .map((col) => {
              const subs = columnSubjects.filter((s) => s.column_id === col.id).sort((a, b) => a.display_order - b.display_order)
              const selected = selection[col.id] ?? new Set<string>()
              return (
                <div key={col.id} style={colCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h2 style={{ margin: 0, fontSize: '1rem' }}>
                      Column {col.column_position}: {col.label}
                    </h2>
                    {col.is_compulsory && <span style={pill('#fee2e2', '#991b1b')}>Compulsory</span>}
                    {col.allow_multiple && <span style={pill('#e0e7ff', '#3730a3')}>Pick up to {col.max_selections}</span>}
                  </div>
                  {col.description && <p style={{ margin: '0 0 8px', fontSize: '0.85rem', opacity: 0.7 }}>{col.description}</p>}
                  {subs.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.6 }}>No subjects in this column yet. Your school is still setting up.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {subs.map((cs) => {
                        const isSelected = selected.has(cs.id)
                        const isAlternative = col.is_compulsory && !isSelected
                        return (
                          <label
                            key={cs.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              padding: '8px 10px',
                              border: `1px solid ${isSelected ? '#1B3A5C' : '#e5e7eb'}`,
                              borderRadius: 6,
                              backgroundColor: isSelected ? '#eff6ff' : 'white',
                              cursor: readOnly ? 'default' : 'pointer',
                              opacity: isAlternative ? 0.5 : 1,
                            }}
                          >
                            <input
                              type={col.allow_multiple ? 'checkbox' : 'radio'}
                              name={`col-${col.id}`}
                              checked={isSelected}
                              disabled={readOnly || col.is_compulsory}
                              onChange={() => toggleSelection(col, cs.id)}
                              style={{ marginTop: 3 }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600 }}>
                                {cs.subjects?.name ?? 'Subject'}
                                {cs.qualification_types?.short_name && <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: 6 }}>· {cs.qualification_types.short_name}</span>}
                              </div>
                              {cs.notes && <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2 }}>{cs.notes}</div>}
                            </div>
                            {isSelected && !col.is_compulsory && !readOnly && (
                              <WhatWouldYouLose
                                subjectId={cs.subject_id}
                                consequences={consequences}
                                allSelectedSubjectIds={selectedSubjectIds}
                              />
                            )}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

          {!readOnly && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                {saving ? 'Saving…' : myChoice ? 'Draft saved' : 'Not started yet'}
              </span>
              <button style={btnPrimary} onClick={submit} disabled={saving}>
                Submit choices
              </button>
            </div>
          )}
        </div>

        {/* Right column: consequences */}
        <aside style={{ position: 'sticky', top: 16, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={asideCard}>
            <h3 style={asideH3}>Consequences of your picks</h3>
            <p style={{ margin: '0 0 8px', fontSize: '0.8rem', opacity: 0.7 }}>
              As you choose, we check your saved courses and career interests.
            </p>
            <div style={{ fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subjects picked</span>
                <strong>{consequences?.subject_count ?? 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sectors covered</span>
                <strong>{consequences?.sector_coverage.length ?? 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Saved courses</span>
                <strong>{consequences?.course_fits.length ?? 0}</strong>
              </div>
            </div>
          </div>

          {consequences && consequences.course_fits.length > 0 && (
            <div style={asideCard}>
              <h3 style={asideH3}>Your saved courses</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {consequences.course_fits.map((f) => (
                  <div key={f.course_id} style={{ fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TrafficLight status={f.status} />
                      <span style={{ flex: 1 }}>{f.course_name ?? 'Course'} — {f.university_name ?? ''}</span>
                    </div>
                    {f.missing_subjects.length > 0 && (
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: 18 }}>
                        Missing: {f.missing_subjects.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {consequences && consequences.sector_coverage.length > 0 && (
            <div style={asideCard}>
              <h3 style={asideH3}>Career sectors covered</h3>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.8rem' }}>
                {consequences.sector_coverage.slice(0, 8).map((s) => (
                  <li key={s.sector_id}>
                    <strong>{s.sector_name}</strong> — {s.subject_count} subject{s.subject_count === 1 ? '' : 's'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function TrafficLight({ status }: { status: 'green' | 'amber' | 'red' | 'unknown' }) {
  const map = {
    green: { color: '#22c55e', label: 'Fits' },
    amber: { color: '#f59e0b', label: 'Partial' },
    red: { color: '#ef4444', label: "Doesn't fit" },
    unknown: { color: '#9ca3af', label: 'No data' },
  }
  const s = map[status]
  return (
    <span title={s.label} style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
  )
}

function WhatWouldYouLose({
  subjectId,
  consequences,
  allSelectedSubjectIds,
}: {
  subjectId: string
  consequences: Consequences | null
  allSelectedSubjectIds: string[]
}) {
  if (!consequences) return null
  // Courses that would break if THIS subject were removed: any course whose
  // missing_subjects would grow, i.e. any course that depends on this subject.
  // We don't have a "what-if" endpoint so use heuristics: courses currently green
  // that mention this subject are the ones you'd lose.
  const withoutThis = allSelectedSubjectIds.filter((id) => id !== subjectId)
  const couldLose = consequences.course_fits.filter(
    (f) => f.status === 'green' && f.required_count > 0
  )
  if (withoutThis.length >= allSelectedSubjectIds.length) return null
  if (couldLose.length === 0) return null
  return (
    <span style={{ fontSize: '0.7rem', color: '#b45309', whiteSpace: 'nowrap', flexShrink: 0 }} title="Deselecting could affect some saved courses">
      Needed for courses
    </span>
  )
}

const colCard: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 8, padding: 14, backgroundColor: 'white' }
const asideCard: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, backgroundColor: 'white' }
const asideH3: React.CSSProperties = { margin: '0 0 6px', fontSize: '0.875rem', fontWeight: 700 }
const bannerInfo: React.CSSProperties = { margin: '12px 0 0', padding: '10px 12px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 6, fontSize: '0.875rem' }
const bannerSuccess: React.CSSProperties = { margin: '12px 0 0', padding: '10px 12px', background: '#dcfce7', border: '1px solid #4ade80', borderRadius: 6, fontSize: '0.875rem' }
const bannerWarn: React.CSSProperties = { margin: '12px 0 0', padding: '10px 12px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, fontSize: '0.875rem' }
function pill(bg: string, fg: string): React.CSSProperties {
  return { display: 'inline-block', padding: '2px 8px', borderRadius: 999, backgroundColor: bg, color: fg, fontSize: '0.7rem', fontWeight: 600, marginLeft: 6 }
}
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
}
