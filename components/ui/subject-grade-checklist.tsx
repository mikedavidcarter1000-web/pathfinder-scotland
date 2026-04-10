'use client'

import { useMemo, useState } from 'react'
import { useSubjects, type QualificationLevel } from '@/hooks/use-subjects'
import { SUBJECTS } from '@/lib/constants'
import type { QualificationType } from '@/lib/grades'

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
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')

  const level = QUAL_TO_LEVEL[qualificationType]
  const { data: allSubjects, isLoading } = useSubjects({
    level: level ?? undefined,
  })

  // The "common" set comes from the static SUBJECTS list in constants.ts,
  // matched against DB subjects by name. This keeps onboarding focused on
  // mainstream picks without burying students in 100+ options.
  const commonNames = useMemo(() => {
    const list = SUBJECTS[qualificationType as keyof typeof SUBJECTS] || []
    return new Set(list.map((n) => n.toLowerCase()))
  }, [qualificationType])

  const filteredSubjects = useMemo(() => {
    if (!allSubjects) return []
    let list = allSubjects
    // Exclude academy subjects — they don't have grades
    list = list.filter((s) => !s.is_academy)

    if (!showAll) {
      list = list.filter((s) => commonNames.has(s.name.toLowerCase()))
    }
    if (search.trim()) {
      const needle = search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(needle))
    }
    return list
  }, [allSubjects, showAll, search, commonNames])

  const totalCount = allSubjects?.filter((s) => !s.is_academy).length ?? 0
  const commonVisible = filteredSubjects.length

  const entryBySubjectId = useMemo(() => {
    const map = new Map<string, GradeEntry>()
    for (const e of entries) {
      if (e.subject_id) map.set(e.subject_id, e)
    }
    return map
  }, [entries])

  const entryBySubjectName = useMemo(() => {
    const map = new Map<string, GradeEntry>()
    for (const e of entries) {
      map.set(e.subject.toLowerCase(), e)
    }
    return map
  }, [entries])

  const findEntry = (subjectId: string, subjectName: string) =>
    entryBySubjectId.get(subjectId) ?? entryBySubjectName.get(subjectName.toLowerCase())

  const setEntry = (
    subjectId: string,
    subjectName: string,
    update: Partial<Omit<GradeEntry, 'subject' | 'subject_id'>>
  ) => {
    const existingIdx = entries.findIndex(
      (e) =>
        (e.subject_id && e.subject_id === subjectId) ||
        e.subject.toLowerCase() === subjectName.toLowerCase()
    )
    if (existingIdx >= 0) {
      const next = [...entries]
      next[existingIdx] = { ...next[existingIdx], ...update, subject: subjectName, subject_id: subjectId }
      onChange(next)
    } else {
      onChange([
        ...entries,
        {
          subject: subjectName,
          subject_id: subjectId,
          grade: update.grade ?? '',
          predicted: update.predicted ?? false,
        },
      ])
    }
  }

  const removeEntry = (subjectId: string, subjectName: string) => {
    onChange(
      entries.filter(
        (e) =>
          e.subject_id !== subjectId &&
          e.subject.toLowerCase() !== subjectName.toLowerCase()
      )
    )
  }

  const grades = GRADES_BY_TYPE[qualificationType]

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Subject list */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
        {filteredSubjects.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            No subjects match your search.
          </div>
        )}
        {filteredSubjects.map((subject) => {
          const entry = findEntry(subject.id, subject.name)
          const checked = !!entry
          return (
            <div
              key={subject.id}
              className={`px-3 py-2.5 flex items-center gap-3 transition-colors ${
                checked ? 'bg-blue-50/60' : 'hover:bg-gray-50'
              }`}
            >
              <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEntry(subject.id, subject.name, { grade: entry?.grade ?? '', predicted: entry?.predicted ?? false })
                    } else {
                      removeEntry(subject.id, subject.name)
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {subject.name}
                </span>
              </label>

              {checked && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={entry?.grade ?? ''}
                    onChange={(e) =>
                      setEntry(subject.id, subject.name, { grade: e.target.value })
                    }
                    className="px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Grade</option>
                    {grades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer" title="Predicted grade">
                    <input
                      type="checkbox"
                      checked={entry?.predicted ?? false}
                      onChange={(e) =>
                        setEntry(subject.id, subject.name, { predicted: e.target.checked })
                      }
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Pred.
                  </label>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Show all toggle */}
      {!search && totalCount > commonNames.size && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showAll
            ? `Show fewer subjects`
            : `Show all ${totalCount} subjects`}
        </button>
      )}

      <p className="text-xs text-gray-500">
        {commonVisible} of {totalCount} subjects shown. Grades can be updated any time.
      </p>
    </div>
  )
}
