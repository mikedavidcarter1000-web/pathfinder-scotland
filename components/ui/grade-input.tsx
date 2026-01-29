'use client'

import { useState } from 'react'
import { SUBJECTS, GRADE_VALUES } from '@/lib/constants'
import type { QualificationType } from '@/lib/grades'

interface GradeInputProps {
  qualificationType: QualificationType
  onAdd: (grade: { subject: string; grade: string; predicted: boolean }) => void
  existingSubjects?: string[]
}

export function GradeInput({
  qualificationType,
  onAdd,
  existingSubjects = [],
}: GradeInputProps) {
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [predicted, setPredicted] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const subjects = SUBJECTS[qualificationType as keyof typeof SUBJECTS] || SUBJECTS.higher
  const grades = Object.keys(GRADE_VALUES[qualificationType] || GRADE_VALUES.higher)

  const filteredSubjects = subjects.filter(
    (s) =>
      s.toLowerCase().includes(subject.toLowerCase()) &&
      !existingSubjects.includes(s)
  )

  const handleAddGrade = () => {
    if (subject && grade) {
      onAdd({ subject, grade, predicted })
      setSubject('')
      setGrade('')
      setPredicted(false)
    }
  }

  const handleSubjectSelect = (selectedSubject: string) => {
    setSubject(selectedSubject)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && subject && grade) {
      e.preventDefault()
      handleAddGrade()
    }
  }

  return (
    <div className="space-y-3" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Subject Input */}
        <div className="relative sm:col-span-2">
          <label htmlFor="subject" className="sr-only">Subject</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Subject name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && subject && filteredSubjects.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSubjects.slice(0, 8).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSubjectSelect(s)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grade Select */}
        <div>
          <label htmlFor="grade" className="sr-only">Grade</label>
          <select
            id="grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Grade</option>
            {grades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Predicted Checkbox & Submit */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={predicted}
            onChange={(e) => setPredicted(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Predicted grade
        </label>

        <button
          type="button"
          onClick={handleAddGrade}
          disabled={!subject || !grade}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Add grade
        </button>
      </div>
    </div>
  )
}

interface GradeListItemProps {
  subject: string
  grade: string
  predicted?: boolean
  onRemove?: () => void
  onEdit?: () => void
}

export function GradeListItem({
  subject,
  grade,
  predicted = false,
  onRemove,
  onEdit,
}: GradeListItemProps) {
  const gradeColors: Record<string, string> = {
    'A*': 'bg-green-100 text-green-700',
    A: 'bg-green-100 text-green-700',
    B: 'bg-blue-100 text-blue-700',
    C: 'bg-yellow-100 text-yellow-700',
    D: 'bg-orange-100 text-orange-700',
    E: 'bg-red-100 text-red-700',
    'D*': 'bg-green-100 text-green-700',
    M: 'bg-blue-100 text-blue-700',
    P: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${gradeColors[grade] || 'bg-gray-100 text-gray-700'}`}>
          {grade}
        </span>
        <div>
          <p className="font-medium text-gray-900">{subject}</p>
          {predicted && (
            <span className="text-xs text-gray-500">Predicted</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
