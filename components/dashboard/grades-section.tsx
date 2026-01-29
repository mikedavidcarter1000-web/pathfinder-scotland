'use client'

import { useState } from 'react'
import { useStudentGrades, useAddGrade, useDeleteGrade, useGradeSummary } from '@/hooks/use-student'
import { GradeInput, GradeListItem } from '@/components/ui/grade-input'
import type { QualificationType } from '@/lib/grades'
import type { Tables } from '@/types/database'

type StudentGrade = Tables<'student_grades'>

const qualificationTypes: { value: QualificationType; label: string }[] = [
  { value: 'higher', label: 'Highers' },
  { value: 'advanced_higher', label: 'Advanced Highers' },
  { value: 'national_5', label: 'National 5s' },
]

export function GradesSection() {
  const { data: grades, isLoading } = useStudentGrades() as { data: StudentGrade[] | undefined; isLoading: boolean }
  const gradeSummary = useGradeSummary()
  const addGrade = useAddGrade()
  const deleteGrade = useDeleteGrade()

  const [activeTab, setActiveTab] = useState<QualificationType>('higher')
  const [isAdding, setIsAdding] = useState(false)

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

  const gradesForType = (type: QualificationType) =>
    grades?.filter((g) => g.qualification_type === type) || []

  const existingSubjects = gradesForType(activeTab).map((g) => g.subject)

  const handleAddGrade = async (gradeData: { subject: string; grade: string; predicted: boolean }) => {
    await addGrade.mutateAsync({
      subject: gradeData.subject,
      grade: gradeData.grade,
      predicted: gradeData.predicted,
      qualification_type: activeTab,
    })
  }

  const handleDeleteGrade = async (gradeId: string) => {
    await deleteGrade.mutateAsync(gradeId)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Grades</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            isAdding
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {isAdding ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add grade
            </>
          )}
        </button>
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
          const count = gradesForType(type.value).length
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

      {/* Add Grade Form */}
      {isAdding && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <GradeInput
            qualificationType={activeTab}
            onAdd={handleAddGrade}
            existingSubjects={existingSubjects}
          />
        </div>
      )}

      {/* Grade List */}
      {gradesForType(activeTab).length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-sm">
            No {qualificationTypes.find((t) => t.value === activeTab)?.label.toLowerCase()} added yet
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first grade
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {gradesForType(activeTab).map((grade) => (
            <GradeListItem
              key={grade.id}
              subject={grade.subject}
              grade={grade.grade}
              predicted={grade.predicted || false}
              onRemove={() => handleDeleteGrade(grade.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
