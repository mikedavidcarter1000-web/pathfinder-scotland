'use client'

import { useState } from 'react'
import { GradeInput, GradeListItem } from '@/components/ui/grade-input'
import type { QualificationType } from '@/lib/grades'

interface Grade {
  subject: string
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

  const handleAddGrade = (gradeData: { subject: string; grade: string; predicted: boolean }) => {
    const newGrade: Grade = {
      ...gradeData,
      qualificationType: activeTab,
    }
    onChange([...grades, newGrade])
  }

  const handleRemoveGrade = (index: number) => {
    onChange(grades.filter((_, i) => i !== index))
  }

  const gradesForType = (type: QualificationType) =>
    grades.filter((g) => g.qualificationType === type)

  const existingSubjects = gradesForType(activeTab).map((g) => g.subject)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Your grades</h2>
        <p className="text-gray-600">
          Add your current or predicted grades. This helps us match you with suitable courses.
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

      {/* Grade Input */}
      <div className="bg-gray-50 rounded-lg p-4">
        <GradeInput
          qualificationType={activeTab}
          onAdd={handleAddGrade}
          existingSubjects={existingSubjects}
        />
      </div>

      {/* Grade List */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {qualificationTypes.find((t) => t.value === activeTab)?.label} ({gradesForType(activeTab).length})
        </h3>

        {gradesForType(activeTab).length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">
              No {qualificationTypes.find((t) => t.value === activeTab)?.label.toLowerCase()} added yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Use the form above to add your grades
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {gradesForType(activeTab).map((grade, index) => {
              const globalIndex = grades.findIndex(
                (g) =>
                  g.subject === grade.subject &&
                  g.qualificationType === grade.qualificationType
              )
              return (
                <GradeListItem
                  key={`${grade.qualificationType}-${grade.subject}`}
                  subject={grade.subject}
                  grade={grade.grade}
                  predicted={grade.predicted}
                  onRemove={() => handleRemoveGrade(globalIndex)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      {grades.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Grade Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {qualificationTypes.map((type) => {
              const typeGrades = gradesForType(type.value)
              const gradeString = typeGrades
                .map((g) => g.grade)
                .sort()
                .reverse()
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
        You can add more grades or update them later from your dashboard.
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
