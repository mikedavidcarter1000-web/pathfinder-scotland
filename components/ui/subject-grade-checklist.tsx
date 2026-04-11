'use client'

import { useMemo } from 'react'
import { useSubjects, type QualificationLevel } from '@/hooks/use-subjects'
import type { QualificationType } from '@/lib/grades'
import { getCurricularAreaColour } from '@/lib/constants'
import { SubjectSelect } from './subject-select'

export interface GradeEntry {
  subject: string
  subject_id: string | null
  grade: string
  predicted: boolean
}

interface SubjectGradeChecklistProps {
  qualificationType: QualificationType
  entries: GradeEntry[]
  onChange: (entries: GradeEntry[]) => void
}

// Map student_grades.qualification_type → subjects table level filter
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

export function SubjectGradeChecklist({
  qualificationType,
  entries,
  onChange,
}: SubjectGradeChecklistProps) {
  const level = QUAL_TO_LEVEL[qualificationType]

  // Used to resolve curricular_area for entries that were loaded from the DB
  // and only carry subject_id + subject (no joined area). Keeps badges in sync
  // with whatever the picker shows.
  const { data: allSubjects } = useSubjects({
    level: level ?? undefined,
  })

  const areaBySubjectId = useMemo(() => {
    const map = new Map<string, string | null>()
    for (const s of allSubjects ?? []) {
      map.set(s.id, s.curricular_area?.name ?? null)
    }
    return map
  }, [allSubjects])

  const excludeIds = useMemo(
    () => entries.map((e) => e.subject_id).filter((id): id is string => !!id),
    [entries]
  )

  const grades = GRADES_BY_TYPE[qualificationType]

  const updateEntry = (index: number, update: Partial<GradeEntry>) => {
    const next = [...entries]
    next[index] = { ...next[index], ...update }
    onChange(next)
  }

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index))
  }

  const addSubject = (subject: { id: string; name: string }) => {
    // Guard against duplicates even if the picker misses it (e.g. entry came
    // from legacy free-text with no subject_id).
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

  return (
    <div className="space-y-4">
      {/* Selected subjects */}
      {entries.length === 0 ? (
        <div
          className="text-center rounded-lg"
          style={{
            padding: '24px',
            backgroundColor: 'var(--pf-grey-100)',
            color: 'var(--pf-grey-600)',
            fontSize: '0.875rem',
          }}
        >
          No subjects added yet. Use the search below to add your first subject.
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--pf-white)',
            border: '1px solid var(--pf-grey-300)',
          }}
        >
          {entries.map((entry, idx) => {
            const areaName = entry.subject_id ? areaBySubjectId.get(entry.subject_id) ?? null : null
            const palette = getCurricularAreaColour(areaName)
            return (
              <div
                key={entry.subject_id ?? `${entry.subject}-${idx}`}
                className="flex items-center gap-3 flex-wrap"
                style={{
                  padding: '14px 16px',
                  minHeight: '56px',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--pf-grey-100)',
                }}
              >
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <span
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: 'var(--pf-grey-900)',
                    }}
                  >
                    {entry.subject}
                  </span>
                  {areaName && (
                    <span className={`pf-area-badge ${palette.bg} ${palette.text}`}>
                      {areaName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="sr-only" htmlFor={`grade-${idx}`}>
                    Grade for {entry.subject}
                  </label>
                  <select
                    id={`grade-${idx}`}
                    value={entry.grade}
                    onChange={(e) => updateEntry(idx, { grade: e.target.value })}
                    className="pf-input"
                    style={{
                      padding: '8px 10px',
                      minHeight: '44px',
                      width: 'auto',
                      minWidth: '84px',
                    }}
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
                      onChange={(e) => updateEntry(idx, { predicted: e.target.checked })}
                      className="w-3.5 h-3.5 rounded"
                      style={{ accentColor: 'var(--pf-blue-700)' }}
                    />
                    Predicted
                  </label>

                  <button
                    type="button"
                    onClick={() => removeEntry(idx)}
                    className="rounded-lg transition-colors inline-flex items-center justify-center"
                    style={{ color: 'var(--pf-grey-600)', minWidth: '44px', minHeight: '44px' }}
                    aria-label={`Remove ${entry.subject}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--pf-red-500)'
                      e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--pf-grey-600)'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add another subject */}
      {level && (
        <SubjectSelect
          level={level}
          excludeIds={excludeIds}
          onSelect={addSubject}
          placeholder={entries.length === 0 ? 'Add your first subject…' : 'Add another subject…'}
        />
      )}

      {!level && (
        <p
          className="text-center"
          style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}
        >
          {qualificationType} subjects aren&apos;t mapped to the Scottish subjects list yet.
        </p>
      )}
    </div>
  )
}
