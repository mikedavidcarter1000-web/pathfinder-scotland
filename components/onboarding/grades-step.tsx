'use client'

import { useState, useMemo } from 'react'
import { SubjectGradeChecklist, type GradeEntry } from '@/components/ui/subject-grade-checklist'
import type { QualificationType } from '@/lib/grades'

interface Grade {
  subject: string
  subject_id?: string | null
  grade: string
  predicted: boolean
  qualificationType: QualificationType
}

interface GradesStepProps {
  grades: Grade[]
  onChange: (grades: Grade[]) => void
  onComplete: () => void
  onBack: () => void
  isSubmitting?: boolean
}

const qualificationTypes: { value: QualificationType; label: string }[] = [
  { value: 'higher', label: 'Highers' },
  { value: 'advanced_higher', label: 'Advanced Highers' },
  { value: 'national_5', label: 'National 5s' },
]

export function GradesStep({ grades, onChange, onComplete, onBack, isSubmitting }: GradesStepProps) {
  const [activeTab, setActiveTab] = useState<QualificationType>('higher')

  // Convert the parent Grade[] to GradeEntry[] for the active tab
  const activeEntries = useMemo<GradeEntry[]>(() => {
    return grades
      .filter((g) => g.qualificationType === activeTab)
      .map((g) => ({
        subject: g.subject,
        subject_id: g.subject_id ?? null,
        grade: g.grade,
        predicted: g.predicted,
      }))
  }, [grades, activeTab])

  const handleEntriesChange = (nextEntries: GradeEntry[]) => {
    // Keep grades for other qualification types, replace ones for activeTab
    const others = grades.filter((g) => g.qualificationType !== activeTab)
    const updated: Grade[] = nextEntries.map((e) => ({
      subject: e.subject,
      subject_id: e.subject_id,
      grade: e.grade,
      predicted: e.predicted,
      qualificationType: activeTab,
    }))
    onChange([...others, ...updated])
  }

  const gradesForType = (type: QualificationType) =>
    grades.filter((g) => g.qualificationType === type)

  const totalGradeCount = grades.filter((g) => g.grade).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Your grades</h2>
        <p className="text-gray-600">
          Tick the subjects you&apos;re taking and pick your grade. This helps us match you with suitable courses.
        </p>
      </div>

      {/* Qualification Type Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {qualificationTypes.map((type) => {
          const count = gradesForType(type.value).length
          return (
            <button
              key={type.value}
              type="button"
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

      {/* Summary */}
      {totalGradeCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Grade summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {qualificationTypes.map((type) => {
              const typeGrades = gradesForType(type.value).filter((g) => g.grade)
              const gradeString = typeGrades
                .map((g) => g.grade)
                .sort()
                .join('')
              return (
                <div key={type.value}>
                  <p className="text-blue-600">{type.label}</p>
                  <p className="font-mono font-bold text-blue-900">
                    {gradeString || '-'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        You can update your grades any time from your dashboard.
      </p>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating profile...
            </>
          ) : (
            'Complete setup'
          )}
        </button>
      </div>
    </div>
  )
}
