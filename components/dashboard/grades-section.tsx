'use client'

import { useMemo, useState } from 'react'
import {
  useStudentGrades,
  useAddGrade,
  useUpdateGrade,
  useDeleteGrade,
  useGradeSummary,
} from '@/hooks/use-student'
import { SubjectGradeChecklist, type GradeEntry } from '@/components/ui/subject-grade-checklist'
import type { QualificationType } from '@/lib/grades'
import type { Tables } from '@/types/database'

type StudentGrade = Tables<'student_grades'>

const qualificationTypes: { value: QualificationType; label: string }[] = [
  { value: 'higher', label: 'Highers' },
  { value: 'advanced_higher', label: 'Advanced Highers' },
  { value: 'national_5', label: 'National 5s' },
]

export function GradesSection() {
  const { data: grades, isLoading } = useStudentGrades() as {
    data: StudentGrade[] | undefined
    isLoading: boolean
  }
  const gradeSummary = useGradeSummary()
  const addGrade = useAddGrade()
  const updateGrade = useUpdateGrade()
  const deleteGrade = useDeleteGrade()

  const [activeTab, setActiveTab] = useState<QualificationType>('higher')

  const activeEntries = useMemo<GradeEntry[]>(() => {
    if (!grades) return []
    return grades
      .filter((g) => g.qualification_type === activeTab)
      .map((g) => ({
        subject: g.subject,
        subject_id: g.subject_id ?? null,
        grade: g.grade,
        predicted: g.predicted ?? false,
      }))
  }, [grades, activeTab])

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Reconcile entries against DB grades: add new, update changed, delete removed.
  const handleEntriesChange = async (nextEntries: GradeEntry[]) => {
    if (!grades) return

    const currentForTab = grades.filter((g) => g.qualification_type === activeTab)

    // Build lookup of existing grades by subject_id (or name fallback)
    const existingByKey = new Map<string, StudentGrade>()
    for (const g of currentForTab) {
      const key = g.subject_id ?? g.subject.toLowerCase()
      existingByKey.set(key, g)
    }

    const nextKeys = new Set<string>()
    for (const entry of nextEntries) {
      const key = entry.subject_id ?? entry.subject.toLowerCase()
      nextKeys.add(key)

      const existing = existingByKey.get(key)
      if (!existing) {
        // New entry — only persist if there's a grade picked
        if (entry.grade) {
          await addGrade.mutateAsync({
            subject: entry.subject,
            subject_id: entry.subject_id ?? null,
            grade: entry.grade,
            predicted: entry.predicted,
            qualification_type: activeTab,
          })
        }
      } else {
        // Existing entry — update if grade or predicted changed
        const changed =
          existing.grade !== entry.grade ||
          (existing.predicted ?? false) !== entry.predicted
        if (changed) {
          if (!entry.grade) {
            // Grade cleared: delete the row
            await deleteGrade.mutateAsync(existing.id)
          } else {
            await updateGrade.mutateAsync({
              gradeId: existing.id,
              data: {
                grade: entry.grade,
                predicted: entry.predicted,
                subject_id: entry.subject_id ?? existing.subject_id ?? null,
              },
            })
          }
        }
      }
    }

    // Delete any rows that are no longer present
    for (const [key, existing] of existingByKey) {
      if (!nextKeys.has(key)) {
        await deleteGrade.mutateAsync(existing.id)
      }
    }
  }

  const countForType = (type: QualificationType) =>
    grades?.filter((g) => g.qualification_type === type).length ?? 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Grades</h2>
      </div>

      {/* Grade Summary */}
      {grades && grades.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Highers</p>
            <p className="font-mono text-lg font-bold text-gray-900">
              {gradeSummary.highers || '-'}
            </p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Adv. Highers</p>
            <p className="font-mono text-lg font-bold text-gray-900">
              {gradeSummary.advancedHighers || '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">UCAS Points</p>
            <p className="font-mono text-lg font-bold text-blue-600">
              {gradeSummary.ucasPoints}
            </p>
          </div>
        </div>
      )}

      {/* Qualification Type Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4">
        {qualificationTypes.map((type) => {
          const count = countForType(type.value)
          return (
            <button
              key={type.value}
              onClick={() => setActiveTab(type.value)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === type.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type.label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === type.value ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Checklist */}
      <SubjectGradeChecklist
        qualificationType={activeTab}
        entries={activeEntries}
        onChange={handleEntriesChange}
      />
    </div>
  )
}
