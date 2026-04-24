'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { composeStudentContext, renderTemplate } from '@/lib/school/comment-template'

type Student = {
  id: string
  first_name: string | null
  last_name: string | null
  registration_class: string | null
  house_group: string | null
}
type Cls = {
  id: string
  subject_id: string | null
  year_group: string
  class_code: string | null
  qualification_type_id: string | null
  academic_year: string
  subjects: { id: string; name: string } | null
  qualification_types: { id: string; name: string; short_name: string } | null
  staff: { id: string; full_name: string; department: string | null } | null
}
type Cycle = { id: string; name: string; starts_at: string; ends_at: string; is_locked: boolean; academic_year: string }
type Entry = {
  id?: string
  student_id: string
  working_grade: string | null
  on_track: string | null
  effort: string | null
  custom_metrics: Record<string, string | null> | null
  comment: string | null
  comment_bank_id: string | null
}
type GradeOption = { grade_label: string; sort_order: number; is_pass: boolean | null }
type Metric = {
  id: string
  metric_name: string
  metric_key: string
  scale_type: 'rating' | 'yes_no' | 'custom'
  scale_options: string[] | null
  colour_coding: Record<string, string> | null
  applies_to_departments: string[] | null
  is_active: boolean
  sort_order: number
}
type Comment = { id: string; category: string; comment_template: string; department: string | null }

const ON_TRACK_OPTIONS = [
  { value: 'above', label: 'Above', bg: '#dcfce7', fg: '#166534' },
  { value: 'on_track', label: 'On track', bg: '#dbeafe', fg: '#1e40af' },
  { value: 'below', label: 'Below', bg: '#fef3c7', fg: '#854d0e' },
  { value: 'significantly_below', label: 'Sig. below', bg: '#fee2e2', fg: '#991b1b' },
] as const

const EFFORT_OPTIONS = [
  { value: 'excellent', label: 'Excellent', bg: '#dcfce7', fg: '#166534' },
  { value: 'good', label: 'Good', bg: '#dbeafe', fg: '#1e40af' },
  { value: 'satisfactory', label: 'Satisfactory', bg: '#fef3c7', fg: '#854d0e' },
  { value: 'concern', label: 'Concern', bg: '#fee2e2', fg: '#991b1b' },
] as const

function gradeColour(grade: string | null): string {
  if (!grade) return ''
  const upper = grade.toUpperCase()
  if (upper === 'A') return '#dcfce7'
  if (upper === 'B') return '#dbeafe'
  if (upper === 'C') return '#fef3c7'
  if (upper === 'D') return '#fed7aa'
  if (upper.includes('NO')) return '#fee2e2'
  return ''
}

export function TrackingGrid({
  cls,
  students,
  cycle,
  initialEntries,
  gradeScale,
  metrics,
  comments,
  canEdit,
}: {
  cls: Cls
  students: Student[]
  cycle: Cycle | null
  initialEntries: Entry[]
  gradeScale: GradeOption[]
  metrics: Metric[]
  comments: Comment[]
  canEdit: boolean
}) {
  const toast = useToast()

  // Map of entries by student_id for O(1) lookup / merge
  const [entries, setEntries] = useState<Map<string, Entry>>(() => {
    const m = new Map<string, Entry>()
    for (const e of initialEntries) m.set(e.student_id, e)
    return m
  })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [savingCount, setSavingCount] = useState(0)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [commentPicker, setCommentPicker] = useState<{ studentId: string } | null>(null)

  // Debounced save queue: one timer per (studentId, field) key
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const debounceKey = (sid: string, field: string) => `${sid}:${field}`

  const effortMetric = metrics.find((m) => m.metric_key === 'effort_custom')
  const onTrackMetric = metrics.find((m) => m.metric_key === 'on_track_custom')
  // Custom metrics shown as extra columns (excluding the two that duplicate
  // native effort / on_track).
  const extraMetrics = metrics.filter(
    (m) => m.metric_key !== 'effort_custom' && m.metric_key !== 'on_track_custom' && m.is_active
  )

  const locked = cycle?.is_locked ?? false
  const readOnly = !canEdit || locked || !cycle

  const getEntry = useCallback(
    (studentId: string): Entry => {
      return (
        entries.get(studentId) ?? {
          student_id: studentId,
          working_grade: null,
          on_track: null,
          effort: null,
          custom_metrics: {},
          comment: null,
          comment_bank_id: null,
        }
      )
    },
    [entries]
  )

  const scheduleSave = useCallback(
    (studentId: string, fieldName: string, value: string | null, customKey?: string) => {
      if (!cycle) return
      const key = debounceKey(studentId, customKey ? `custom:${customKey}` : fieldName)
      const existingTimer = timersRef.current.get(key)
      if (existingTimer) clearTimeout(existingTimer)
      const t = setTimeout(async () => {
        setSavingCount((n) => n + 1)
        try {
          const res = await fetch('/api/school/tracking/entry', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              cycle_id: cycle.id,
              class_assignment_id: cls.id,
              student_id: studentId,
              field_name: customKey ? 'custom_metric' : fieldName,
              custom_metric_key: customKey,
              value,
            }),
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            toast.error(err.error ?? 'Save failed.')
            return
          }
          setLastSavedAt(Date.now())
        } finally {
          setSavingCount((n) => Math.max(0, n - 1))
        }
      }, 220)
      timersRef.current.set(key, t)
    },
    [cycle, cls.id, toast]
  )

  const updateLocal = useCallback((studentId: string, patch: Partial<Entry>) => {
    setEntries((prev) => {
      const next = new Map(prev)
      const existing = next.get(studentId) ?? {
        student_id: studentId,
        working_grade: null,
        on_track: null,
        effort: null,
        custom_metrics: {},
        comment: null,
        comment_bank_id: null,
      }
      const merged: Entry = {
        ...existing,
        ...patch,
        custom_metrics: { ...(existing.custom_metrics ?? {}), ...(patch.custom_metrics ?? {}) },
      }
      next.set(studentId, merged)
      return next
    })
  }, [])

  const patchField = useCallback(
    (studentId: string, field: keyof Entry, value: string | null, customKey?: string) => {
      if (readOnly) return
      if (customKey) {
        updateLocal(studentId, { custom_metrics: { [customKey]: value } })
        scheduleSave(studentId, 'custom_metric', value, customKey)
      } else {
        updateLocal(studentId, { [field]: value } as Partial<Entry>)
        scheduleSave(studentId, field as string, value)
      }
    },
    [readOnly, scheduleSave, updateLocal]
  )

  const bulkFill = useCallback(
    async (field: string, value: string | null, customKey?: string) => {
      if (readOnly || !cycle) return
      const studentIds = Array.from(selected)
      if (studentIds.length === 0) return
      // Optimistic local update
      for (const sid of studentIds) {
        if (customKey) updateLocal(sid, { custom_metrics: { [customKey]: value } })
        else updateLocal(sid, { [field]: value } as Partial<Entry>)
      }
      // Network
      setSavingCount((n) => n + 1)
      try {
        const res = await fetch('/api/school/tracking/bulk', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            cycle_id: cycle.id,
            class_assignment_id: cls.id,
            field_name: customKey ? 'custom_metric' : field,
            custom_metric_key: customKey,
            value,
            student_ids: studentIds,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast.error(err.error ?? 'Bulk fill failed.')
          return
        }
        toast.success(`Updated ${studentIds.length} students.`)
        setLastSavedAt(Date.now())
      } finally {
        setSavingCount((n) => Math.max(0, n - 1))
      }
    },
    [cls.id, cycle, readOnly, selected, toast, updateLocal]
  )

  const columnFill = useCallback(
    (field: string, value: string | null, customKey?: string) => {
      if (readOnly) return
      // Temporarily select all students, fire bulk fill, then clear.
      const all = new Set(students.map((s) => s.id))
      setSelected(all)
      // defer to ensure selected state update is picked up by bulkFill
      setTimeout(async () => {
        await bulkFill(field, value, customKey)
        setSelected(new Set())
      }, 0)
    },
    [bulkFill, readOnly, students]
  )

  function toggleSelected(sid: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(sid)) next.delete(sid)
      else next.add(sid)
      return next
    })
  }
  function toggleSelectAll() {
    setSelected((prev) => (prev.size === students.length ? new Set() : new Set(students.map((s) => s.id))))
  }

  // Completion indicator: a student counts as "graded" when working_grade, on_track, and effort are all set
  const completionCount = students.reduce((acc, s) => {
    const e = entries.get(s.id)
    return acc + (e?.working_grade && e?.on_track && e?.effort ? 1 : 0)
  }, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
            <Link href="/school/tracking">Tracking</Link> &rsaquo; {cls.subjects?.name ?? 'Class'} {cls.year_group} {cls.class_code ?? ''}
          </div>
          <div style={{ marginTop: 4, fontSize: '0.875rem' }}>
            {cycle ? (
              <>
                <strong>{cycle.name}</strong> &middot; {new Date(cycle.starts_at).toLocaleDateString('en-GB')} &ndash; {new Date(cycle.ends_at).toLocaleDateString('en-GB')}
                {locked && <span style={{ ...pill('#fef3c7', '#854d0e'), marginLeft: 8 }}>Locked</span>}
              </>
            ) : (
              <span style={{ color: '#991b1b' }}>No current cycle — create one on the Tracking page.</span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
          <div>{completionCount} of {students.length} students graded</div>
          <div style={{ opacity: 0.6 }}>
            {savingCount > 0 ? 'Saving…' : lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString('en-GB')}` : 'Auto-saves on change'}
          </div>
        </div>
      </div>

      {locked && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: '0.875rem' }}>
          This cycle is locked. Grades are read-only. Ask an admin to unlock if edits are needed.
        </div>
      )}

      {selected.size > 0 && !readOnly && (
        <BulkBar selected={selected} effortMetric={effortMetric} onTrackMetric={onTrackMetric} gradeScale={gradeScale} onBulkFill={bulkFill} onClear={() => setSelected(new Set())} />
      )}

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={thSticky}>
                <input type="checkbox" checked={selected.size > 0 && selected.size === students.length} onChange={toggleSelectAll} aria-label="Select all" />
              </th>
              <th style={thSticky}>Student</th>
              <th style={th}>
                Grade
                {!readOnly && <ColumnFillButton label="Grade" onClear={() => columnFill('working_grade', null)} />}
              </th>
              <th style={th}>
                On track
                {!readOnly && (
                  <ColumnFillMenu
                    label="Fill"
                    options={ON_TRACK_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    onPick={(v) => columnFill('on_track', v)}
                    onClear={() => columnFill('on_track', null)}
                  />
                )}
              </th>
              <th style={th}>
                Effort
                {!readOnly && (
                  <ColumnFillMenu
                    label="Fill"
                    options={EFFORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    onPick={(v) => columnFill('effort', v)}
                    onClear={() => columnFill('effort', null)}
                  />
                )}
              </th>
              {extraMetrics.map((m) => (
                <th key={m.id} style={th}>
                  {m.metric_name}
                  {!readOnly && m.scale_options && (
                    <ColumnFillMenu
                      label="Fill"
                      options={m.scale_options.map((o) => ({ value: o, label: o }))}
                      onPick={(v) => columnFill('custom_metric', v, m.metric_key)}
                      onClear={() => columnFill('custom_metric', null, m.metric_key)}
                    />
                  )}
                </th>
              ))}
              <th style={th}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const entry = getEntry(s.id)
              const isSelected = selected.has(s.id)
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', background: isSelected ? '#eff6ff' : 'transparent' }}>
                  <td style={tdSticky}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelected(s.id)} aria-label={`Select ${s.first_name ?? s.last_name ?? s.id}`} />
                  </td>
                  <td style={tdSticky}>
                    <div style={{ fontWeight: 600 }}>
                      {s.last_name ?? '—'}, {s.first_name ?? ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                      {s.registration_class ?? ''} {s.house_group ? `· ${s.house_group}` : ''}
                    </div>
                  </td>
                  <td style={{ ...td, background: gradeColour(entry.working_grade) }}>
                    <select
                      value={entry.working_grade ?? ''}
                      onChange={(e) => patchField(s.id, 'working_grade', e.target.value || null)}
                      disabled={readOnly}
                      style={selectCell}
                    >
                      <option value="">—</option>
                      {gradeScale.map((g) => (
                        <option key={g.grade_label} value={g.grade_label}>
                          {g.grade_label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={td}>
                    <SegmentedBtns
                      options={ON_TRACK_OPTIONS}
                      value={entry.on_track}
                      onChange={(v) => patchField(s.id, 'on_track', v)}
                      readOnly={readOnly}
                      compact
                    />
                  </td>
                  <td style={td}>
                    <SegmentedBtns
                      options={EFFORT_OPTIONS}
                      value={entry.effort}
                      onChange={(v) => patchField(s.id, 'effort', v)}
                      readOnly={readOnly}
                      compact
                    />
                  </td>
                  {extraMetrics.map((m) => (
                    <td key={m.id} style={td}>
                      <CustomMetricCell
                        metric={m}
                        value={(entry.custom_metrics?.[m.metric_key] as string) ?? null}
                        onChange={(v) => patchField(s.id, 'custom_metrics', v, m.metric_key)}
                        readOnly={readOnly}
                      />
                    </td>
                  ))}
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <textarea
                        value={entry.comment ?? ''}
                        onChange={(e) => patchField(s.id, 'comment', e.target.value || null)}
                        onBlur={(e) => patchField(s.id, 'comment', e.target.value || null)}
                        disabled={readOnly}
                        placeholder={readOnly ? '' : 'Comment…'}
                        style={textareaCell}
                        rows={2}
                      />
                      {!readOnly && comments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCommentPicker({ studentId: s.id })}
                          style={iconBtn}
                          title="Pick from comment bank"
                        >
                          Bank
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {commentPicker && (
        <CommentPickerModal
          comments={comments}
          subjectName={cls.subjects?.name ?? 'this subject'}
          student={students.find((s) => s.id === commentPicker.studentId) ?? null}
          onPick={(template, id) => {
            if (!commentPicker) return
            const s = students.find((x) => x.id === commentPicker.studentId)
            if (!s) return
            const rendered = renderTemplate(template, composeStudentContext(s, cls.subjects?.name ?? 'this subject'))
            patchField(commentPicker.studentId, 'comment', rendered)
            patchField(commentPicker.studentId, 'comment_bank_id', id)
            setCommentPicker(null)
          }}
          onClose={() => setCommentPicker(null)}
        />
      )}
    </div>
  )
}

function SegmentedBtns({
  options,
  value,
  onChange,
  readOnly,
  compact,
}: {
  options: ReadonlyArray<{ value: string; label: string; bg: string; fg: string }>
  value: string | null
  onChange: (v: string | null) => void
  readOnly: boolean
  compact?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            disabled={readOnly}
            onClick={() => onChange(active ? null : o.value)}
            style={{
              padding: compact ? '3px 6px' : '4px 8px',
              border: `1px solid ${active ? o.fg : '#e5e7eb'}`,
              borderRadius: 4,
              fontSize: '0.75rem',
              cursor: readOnly ? 'default' : 'pointer',
              backgroundColor: active ? o.bg : 'white',
              color: active ? o.fg : '#374151',
              fontWeight: active ? 700 : 500,
              whiteSpace: 'nowrap',
            }}
            aria-pressed={active}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function CustomMetricCell({
  metric,
  value,
  onChange,
  readOnly,
}: {
  metric: Metric
  value: string | null
  onChange: (v: string | null) => void
  readOnly: boolean
}) {
  const opts = metric.scale_options ?? []
  const colours = metric.colour_coding ?? {}
  if (metric.scale_type === 'yes_no') {
    return (
      <SegmentedBtns
        options={[
          { value: 'yes', label: 'Yes', bg: '#dcfce7', fg: '#166534' },
          { value: 'no', label: 'No', bg: '#fee2e2', fg: '#991b1b' },
        ]}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        compact
      />
    )
  }
  // rating or custom — render as compact segmented buttons
  return (
    <SegmentedBtns
      options={opts.map((o) => ({ value: o, label: o, bg: colours[o] ?? '#f3f4f6', fg: '#111827' }))}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      compact
    />
  )
}

function BulkBar({
  selected,
  gradeScale,
  effortMetric: _effortMetric,
  onTrackMetric: _onTrackMetric,
  onBulkFill,
  onClear,
}: {
  selected: Set<string>
  gradeScale: GradeOption[]
  effortMetric: Metric | undefined
  onTrackMetric: Metric | undefined
  onBulkFill: (field: string, value: string | null, customKey?: string) => void | Promise<void>
  onClear: () => void
}) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#1B3A5C',
        color: 'white',
        padding: '8px 12px',
        borderRadius: 6,
        marginBottom: 8,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontWeight: 700 }}>{selected.size} selected</span>
      <span style={{ opacity: 0.8 }}>&middot; Bulk fill:</span>
      <BulkMenu label="Grade" options={gradeScale.map((g) => ({ value: g.grade_label, label: g.grade_label }))} onPick={(v) => onBulkFill('working_grade', v)} onClear={() => onBulkFill('working_grade', null)} />
      <BulkMenu
        label="On track"
        options={ON_TRACK_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onPick={(v) => onBulkFill('on_track', v)}
        onClear={() => onBulkFill('on_track', null)}
      />
      <BulkMenu
        label="Effort"
        options={EFFORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onPick={(v) => onBulkFill('effort', v)}
        onClear={() => onBulkFill('effort', null)}
      />
      <button type="button" onClick={onClear} style={{ marginLeft: 'auto', padding: '4px 8px', borderRadius: 4, border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}>
        Clear selection
      </button>
    </div>
  )
}

function BulkMenu({ label, options, onPick, onClear }: { label: string; options: { value: string; label: string }[]; onPick: (v: string) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.75rem' }}
      >
        {label} ▾
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, minWidth: 140, marginTop: 4 }}>
          {options.map((o) => (
            <button key={o.value} type="button" onClick={() => { onPick(o.value); setOpen(false) }} style={menuItem}>
              {o.label}
            </button>
          ))}
          <button type="button" onClick={() => { onClear(); setOpen(false) }} style={{ ...menuItem, borderTop: '1px solid #e5e7eb', color: '#6b7280' }}>
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

function ColumnFillButton({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm(`Clear the ${label.toLowerCase()} column for all students?`)) onClear()
      }}
      style={{ marginLeft: 6, padding: '2px 6px', fontSize: '0.7rem', border: '1px solid #e5e7eb', borderRadius: 4, background: 'white', cursor: 'pointer' }}
      title={`Clear ${label} column`}
    >
      Clear
    </button>
  )
}

function ColumnFillMenu({
  label,
  options,
  onPick,
  onClear,
}: {
  label: string
  options: { value: string; label: string }[]
  onPick: (v: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-block', marginLeft: 6 }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ padding: '2px 6px', fontSize: '0.7rem', border: '1px solid #e5e7eb', borderRadius: 4, background: 'white', cursor: 'pointer' }}>
        {label} ▾
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, minWidth: 140, marginTop: 4 }}>
          {options.map((o) => (
            <button key={o.value} type="button" onClick={() => { onPick(o.value); setOpen(false) }} style={menuItem}>
              {o.label}
            </button>
          ))}
          <button type="button" onClick={() => { onClear(); setOpen(false) }} style={{ ...menuItem, borderTop: '1px solid #e5e7eb', color: '#6b7280' }}>
            Clear column
          </button>
        </div>
      )}
    </span>
  )
}

function CommentPickerModal({
  comments,
  subjectName,
  student,
  onPick,
  onClose,
}: {
  comments: Comment[]
  subjectName: string
  student: Student | null
  onPick: (template: string, id: string) => void
  onClose: () => void
}) {
  const [cat, setCat] = useState<string>('all')
  const filtered = useMemo(() => (cat === 'all' ? comments : comments.filter((c) => c.category === cat)), [cat, comments])
  const preview = useCallback(
    (template: string) => {
      if (!student) return template
      return renderTemplate(template, composeStudentContext(student, subjectName))
    },
    [student, subjectName]
  )
  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Comment bank</h3>
          <button onClick={onClose} style={iconBtn}>Close</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {['all', 'positive', 'improvement', 'concern', 'general'].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid #cbd5e1', background: cat === c ? '#1B3A5C' : 'white', color: cat === c ? 'white' : '#1B3A5C', cursor: 'pointer', fontSize: '0.8125rem' }}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No comments in this category. Add some in <Link href="/school/tracking/comments">the comment bank</Link>.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => onPick(c.comment_template, c.id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', marginBottom: 6, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280', marginBottom: 4 }}>{c.category}</div>
                <div>{preview(c.comment_template)}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const th: React.CSSProperties = { padding: '10px 10px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280', textAlign: 'left', whiteSpace: 'nowrap' }
const thSticky: React.CSSProperties = { ...th, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1 }
const td: React.CSSProperties = { padding: '8px 10px', verticalAlign: 'top' }
const tdSticky: React.CSSProperties = { ...td, position: 'sticky', left: 0, background: 'white', zIndex: 1 }
const selectCell: React.CSSProperties = { padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: '0.875rem', minWidth: 60 }
const textareaCell: React.CSSProperties = { flex: 1, padding: 6, border: '1px solid #e5e7eb', borderRadius: 4, fontSize: '0.875rem', fontFamily: 'inherit', minWidth: 160, resize: 'vertical' }
const iconBtn: React.CSSProperties = { padding: '4px 8px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 4, background: 'white', cursor: 'pointer' }
const menuItem: React.CSSProperties = { display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }
function pill(bg: string, fg: string): React.CSSProperties {
  return { display: 'inline-block', padding: '2px 8px', borderRadius: 999, backgroundColor: bg, color: fg, fontSize: '0.75rem', fontWeight: 600 }
}
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modal: React.CSSProperties = { background: 'white', borderRadius: 10, padding: 18, width: 'min(90vw, 560px)' }
