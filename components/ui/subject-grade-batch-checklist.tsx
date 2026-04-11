'use client'

import { useMemo, useState } from 'react'
import { useSubjects, type QualificationLevel, type SubjectWithArea } from '@/hooks/use-subjects'
import type { QualificationType } from '@/lib/grades'
import { COMMON_SUBJECTS_BY_LEVEL, getCurricularAreaColour } from '@/lib/constants'
import { SubjectSelect } from './subject-select'

export interface GradeEntry {
  subject: string
  subject_id: string | null
  grade: string
  predicted: boolean
}

interface SubjectGradeBatchChecklistProps {
  qualificationType: QualificationType
  entries: GradeEntry[]
  onChange: (entries: GradeEntry[]) => void
}

const QUAL_TO_LEVEL: Record<QualificationType, QualificationLevel | null> = {
  higher: 'higher',
  advanced_higher: 'adv_higher',
  national_5: 'n5',
  a_level: null,
  btec: null,
}

const GRADES_BY_TYPE: Record<QualificationType, string[]> = {
  higher: ['A', 'B', 'C', 'D'],
  advanced_higher: ['A', 'B', 'C', 'D'],
  national_5: ['A', 'B', 'C', 'D'],
  a_level: ['A*', 'A', 'B', 'C', 'D', 'E'],
  btec: ['D*', 'D', 'M', 'P'],
}

// Map a Common Subject string to a real subjects table row by case-insensitive
// name match, with a small alias table for the few names that drift between
// the SQA list and our seed data ("Maths" vs "Mathematics", "Art & Design" vs
// "Art and Design").
const SUBJECT_ALIASES: Record<string, string[]> = {
  Mathematics: ['maths'],
  'Art and Design': ['art & design', 'art', 'art design'],
  'Physical Education': ['pe'],
  'Computing Science': ['computing'],
  'Business Management': ['business'],
}

function findSubjectMatch(name: string, all: SubjectWithArea[]): SubjectWithArea | null {
  const needle = name.trim().toLowerCase()
  const exact = all.find((s) => s.name.toLowerCase() === needle)
  if (exact) return exact
  const aliases = SUBJECT_ALIASES[name] ?? []
  for (const alias of aliases) {
    const hit = all.find((s) => s.name.toLowerCase() === alias)
    if (hit) return hit
  }
  return all.find((s) => s.name.toLowerCase().includes(needle)) ?? null
}

// Lightweight row shape used for rendering. Real subject rows are mapped
// down to this; legacy free-text entries are wrapped to satisfy it without
// requiring a full SubjectWithArea cast.
type SubjectRow = {
  id: string
  name: string
  area: string | null
}

function toRow(s: SubjectWithArea): SubjectRow {
  return { id: s.id, name: s.name, area: s.curricular_area?.name ?? null }
}

export function SubjectGradeBatchChecklist({
  qualificationType,
  entries,
  onChange,
}: SubjectGradeBatchChecklistProps) {
  const [showAll, setShowAll] = useState(false)
  const level = QUAL_TO_LEVEL[qualificationType]

  const { data: allSubjects, isLoading } = useSubjects({
    level: level ?? undefined,
  })

  const commonRows = useMemo<SubjectRow[]>(() => {
    if (!allSubjects) return []
    const names = COMMON_SUBJECTS_BY_LEVEL[qualificationType as keyof typeof COMMON_SUBJECTS_BY_LEVEL]
    if (!names) return []
    const seen = new Set<string>()
    const rows: SubjectRow[] = []
    for (const name of names) {
      const match = findSubjectMatch(name, allSubjects)
      if (match && !seen.has(match.id)) {
        rows.push(toRow(match))
        seen.add(match.id)
      }
    }
    return rows
  }, [allSubjects, qualificationType])

  // Custom rows: any added entry that isn't in the common list. These
  // include free-text rows (no subject_id), search-box picks of "uncommon"
  // subjects, and legacy entries loaded from the dashboard. They render at
  // the top so the student doesn't have to expand "Show all" to see what
  // they've already chosen.
  const customRows = useMemo<SubjectRow[]>(() => {
    const commonIds = new Set(commonRows.map((s) => s.id))
    const subjectMap = new Map<string, SubjectWithArea>()
    for (const s of allSubjects ?? []) subjectMap.set(s.id, s)
    return entries
      .filter((e) => {
        if (!e.subject_id) return true
        if (commonIds.has(e.subject_id)) return false
        return true
      })
      .map<SubjectRow>((e) => {
        const sub = e.subject_id ? subjectMap.get(e.subject_id) : undefined
        return {
          id: e.subject_id ?? `custom-${e.subject}`,
          name: sub?.name ?? e.subject,
          area: sub?.curricular_area?.name ?? null,
        }
      })
  }, [entries, commonRows, allSubjects])

  // Other rows: every subject not in the common list AND not currently
  // selected. The "Show all" expander reveals these so the student can
  // browse the full catalogue without re-seeing their picks.
  const otherRows = useMemo<SubjectRow[]>(() => {
    if (!allSubjects) return []
    const commonIds = new Set(commonRows.map((s) => s.id))
    const entryIds = new Set(
      entries.map((e) => e.subject_id).filter((id): id is string => !!id)
    )
    return allSubjects
      .filter((s) => !s.is_academy && !commonIds.has(s.id) && !entryIds.has(s.id))
      .map(toRow)
  }, [allSubjects, commonRows, entries])

  const grades = GRADES_BY_TYPE[qualificationType]

  const findEntryIndex = (row: SubjectRow): number => {
    return entries.findIndex(
      (e) =>
        (e.subject_id && e.subject_id === row.id) ||
        e.subject.toLowerCase() === row.name.toLowerCase()
    )
  }

  const isChecked = (row: SubjectRow) => findEntryIndex(row) !== -1

  const toggleSubject = (row: SubjectRow, checked: boolean) => {
    const idx = findEntryIndex(row)
    if (checked && idx === -1) {
      onChange([
        ...entries,
        {
          subject: row.name,
          subject_id: row.id.startsWith('custom-') ? null : row.id,
          grade: '',
          predicted: true,
        },
      ])
    } else if (!checked && idx !== -1) {
      onChange(entries.filter((_, i) => i !== idx))
    }
  }

  const updateEntry = (row: SubjectRow, update: Partial<GradeEntry>) => {
    const idx = findEntryIndex(row)
    if (idx === -1) return
    const next = [...entries]
    next[idx] = { ...next[idx], ...update }
    onChange(next)
  }

  const addCustomSubject = (subject: { id: string; name: string }) => {
    const already = entries.some(
      (e) => e.subject_id === subject.id || e.subject.toLowerCase() === subject.name.toLowerCase()
    )
    if (already) return
    onChange([
      ...entries,
      {
        subject: subject.name,
        subject_id: subject.id,
        grade: '',
        predicted: true,
      },
    ])
  }

  const excludeIds = useMemo(
    () => entries.map((e) => e.subject_id).filter((id): id is string => !!id),
    [entries]
  )

  if (!level) {
    return (
      <p className="text-center" style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
        {qualificationType} subjects aren&apos;t mapped to the Scottish subjects list yet.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div
        className="rounded-lg text-center"
        style={{
          padding: '24px',
          backgroundColor: 'var(--pf-grey-100)',
          color: 'var(--pf-grey-600)',
          fontSize: '0.875rem',
        }}
      >
        Loading subjects…
      </div>
    )
  }

  const renderRow = (row: SubjectRow, idx: number) => {
    const checked = isChecked(row)
    const entryIdx = findEntryIndex(row)
    const entry = entryIdx !== -1 ? entries[entryIdx] : null
    const palette = getCurricularAreaColour(row.area)

    return (
      <div
        key={row.id}
        className="flex items-center gap-3 flex-wrap"
        style={{
          padding: '12px 16px',
          minHeight: '56px',
          borderTop: idx === 0 ? 'none' : '1px solid var(--pf-grey-100)',
          backgroundColor: checked ? 'var(--pf-blue-50)' : 'transparent',
          transition: 'background-color 0.15s ease',
        }}
      >
        <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => toggleSubject(row, e.target.checked)}
            className="h-5 w-5 rounded flex-shrink-0"
            style={{ accentColor: 'var(--pf-blue-700)' }}
            aria-label={`Add ${row.name}`}
          />
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: 'var(--pf-grey-900)',
              }}
            >
              {row.name}
            </span>
            {row.area && (
              <span className={`pf-area-badge ${palette.bg} ${palette.text}`}>{row.area}</span>
            )}
          </div>
        </label>

        {checked && entry && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <select
              value={entry.grade}
              onChange={(e) => updateEntry(row, { grade: e.target.value })}
              className="pf-input"
              style={{
                padding: '8px 10px',
                minHeight: '44px',
                width: 'auto',
                minWidth: '84px',
              }}
              aria-label={`Grade for ${row.name}`}
            >
              <option value="">Grade…</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <label
              className="flex items-center gap-1.5 cursor-pointer"
              style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}
              title="Tick if this grade is predicted, not yet awarded"
            >
              <input
                type="checkbox"
                checked={entry.predicted}
                onChange={(e) => updateEntry(row, { predicted: e.target.checked })}
                className="w-3.5 h-3.5 rounded"
                style={{ accentColor: 'var(--pf-blue-700)' }}
              />
              Predicted
            </label>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {customRows.length > 0 && (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--pf-white)',
            border: '1px solid var(--pf-grey-300)',
          }}
        >
          {customRows.map((row, idx) => renderRow(row, idx))}
        </div>
      )}

      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--pf-white)',
          border: '1px solid var(--pf-grey-300)',
        }}
      >
        {commonRows.length === 0 ? (
          <div
            className="text-center"
            style={{
              padding: '24px',
              color: 'var(--pf-grey-600)',
              fontSize: '0.875rem',
            }}
          >
            No common subjects available for this level yet.
          </div>
        ) : (
          commonRows.map((row, idx) => renderRow(row, idx))
        )}
      </div>

      {otherRows.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="pf-btn pf-btn-ghost"
          style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}
        >
          <span>
            {showAll ? 'Hide other subjects' : `Show all subjects (${otherRows.length} more)`}
          </span>
          <svg
            className="w-4 h-4 transition-transform"
            style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {showAll && otherRows.length > 0 && (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--pf-white)',
            border: '1px solid var(--pf-grey-300)',
            maxHeight: '420px',
            overflowY: 'auto',
          }}
        >
          {otherRows.map((row, idx) => renderRow(row, idx))}
        </div>
      )}

      <div>
        <p className="pf-label" style={{ marginBottom: '8px' }}>
          Can&apos;t see your subject? Search for it
        </p>
        <SubjectSelect
          level={level}
          excludeIds={excludeIds}
          onSelect={addCustomSubject}
          placeholder="Search subjects…"
        />
      </div>
    </div>
  )
}
