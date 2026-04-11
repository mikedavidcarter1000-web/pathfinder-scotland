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
import { Skeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/components/ui/toast'
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
  const toast = useToast()

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
      <div className="pf-card">
        <Skeleton width="140px" height={20} rounded="md" />
        <div style={{ height: '16px' }} />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={52} rounded="md" />
          ))}
        </div>
      </div>
    )
  }

  // Reconcile entries against DB grades: add new, update changed, delete removed.
  // Ticking a subject persists it immediately with an empty grade so the counter
  // updates — the student can fill in the grade later from the dropdown.
  const handleEntriesChange = async (nextEntries: GradeEntry[]) => {
    if (!grades) return

    const currentForTab = grades.filter((g) => g.qualification_type === activeTab)

    const existingByKey = new Map<string, StudentGrade>()
    for (const g of currentForTab) {
      const key = g.subject_id ?? g.subject.toLowerCase()
      existingByKey.set(key, g)
    }

    try {
      const nextKeys = new Set<string>()
      for (const entry of nextEntries) {
        const key = entry.subject_id ?? entry.subject.toLowerCase()
        nextKeys.add(key)

        const existing = existingByKey.get(key)
        if (!existing) {
          await addGrade.mutateAsync({
            subject: entry.subject,
            subject_id: entry.subject_id ?? null,
            grade: entry.grade ?? '',
            predicted: entry.predicted,
            qualification_type: activeTab,
          })
        } else {
          const changed =
            existing.grade !== entry.grade ||
            (existing.predicted ?? false) !== entry.predicted
          if (changed) {
            await updateGrade.mutateAsync({
              gradeId: existing.id,
              data: {
                grade: entry.grade ?? '',
                predicted: entry.predicted,
                subject_id: entry.subject_id ?? existing.subject_id ?? null,
              },
            })
          }
        }
      }

      // Delete rows that are no longer present (subject was unchecked).
      for (const [key, existing] of existingByKey) {
        if (!nextKeys.has(key)) {
          await deleteGrade.mutateAsync(existing.id)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.'
      toast.error("Couldn't save grades", message)
    }
  }

  const countForType = (type: QualificationType) =>
    grades?.filter((g) => g.qualification_type === type).length ?? 0

  return (
    <div className="pf-card">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Your Grades</h2>
      </div>

      {/* Grade Summary */}
      {grades && grades.length > 0 && (
        <div
          className="grid grid-cols-3 gap-4 mb-6 rounded-lg"
          style={{ padding: '16px', backgroundColor: 'var(--pf-teal-50)' }}
        >
          <div className="text-center">
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--pf-grey-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Highers
            </p>
            <p
              className="pf-data-number"
              style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--pf-grey-900)' }}
            >
              {gradeSummary.highers || '-'}
            </p>
          </div>
          <div
            className="text-center"
            style={{ borderLeft: '1px solid var(--pf-teal-100)', borderRight: '1px solid var(--pf-teal-100)' }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--pf-grey-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Adv. Highers
            </p>
            <p
              className="pf-data-number"
              style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--pf-grey-900)' }}
            >
              {gradeSummary.advancedHighers || '-'}
            </p>
          </div>
          <div className="text-center">
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--pf-grey-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              UCAS Points
            </p>
            <p
              className="pf-data-number"
              style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--pf-teal-700)' }}
            >
              {gradeSummary.ucasPoints}
            </p>
          </div>
        </div>
      )}

      {/* Qualification Type Tabs */}
      <div
        className="flex gap-1 mb-4 rounded-lg"
        style={{ padding: '4px', backgroundColor: 'var(--pf-grey-100)' }}
      >
        {qualificationTypes.map((type) => {
          const count = countForType(type.value)
          const active = activeTab === type.value
          return (
            <button
              key={type.value}
              onClick={() => setActiveTab(type.value)}
              className="flex-1 transition-colors"
              style={{
                padding: '8px 12px',
                fontSize: '0.875rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: active ? 'var(--pf-white)' : 'transparent',
                color: active ? 'var(--pf-grey-900)' : 'var(--pf-grey-600)',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {type.label}
              {count > 0 && (
                <span
                  className="ml-1.5 rounded-full"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    backgroundColor: active ? 'var(--pf-teal-100)' : 'var(--pf-grey-300)',
                    color: active ? 'var(--pf-teal-700)' : 'var(--pf-grey-600)',
                  }}
                >
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
