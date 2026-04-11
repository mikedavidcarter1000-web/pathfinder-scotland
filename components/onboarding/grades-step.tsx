'use client'

import { useState, useMemo } from 'react'
import {
  SubjectGradeBatchChecklist,
  type GradeEntry,
} from '@/components/ui/subject-grade-batch-checklist'
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

  const handleSkip = () => {
    onChange([])
    onComplete()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ marginBottom: '6px' }}>Your grades</h2>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          Tick the subjects you&apos;re taking and pick your grade. This helps us match you with
          suitable courses. You can add or change grades any time from your dashboard.
        </p>
      </div>

      {/* Qualification type tabs */}
      <div
        className="flex gap-1 rounded-lg"
        style={{
          padding: '4px',
          backgroundColor: 'var(--pf-grey-100)',
        }}
      >
        {qualificationTypes.map((type) => {
          const count = gradesForType(type.value).length
          const active = activeTab === type.value
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setActiveTab(type.value)}
              className="flex-1 transition-colors"
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                backgroundColor: active ? 'var(--pf-white)' : 'transparent',
                color: active ? 'var(--pf-teal-700)' : 'var(--pf-grey-600)',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {type.label}
              {count > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center"
                  style={{
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 6px',
                    borderRadius: '9999px',
                    fontSize: '0.6875rem',
                    backgroundColor: active ? 'var(--pf-teal-100)' : 'var(--pf-grey-300)',
                    color: active ? 'var(--pf-teal-700)' : 'var(--pf-grey-900)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Batch checklist */}
      <SubjectGradeBatchChecklist
        qualificationType={activeTab}
        entries={activeEntries}
        onChange={handleEntriesChange}
      />

      {/* Summary */}
      {totalGradeCount > 0 && (
        <div
          className="rounded-lg"
          style={{
            padding: '16px',
            backgroundColor: 'var(--pf-teal-100)',
            border: '1px solid rgba(15, 107, 94, 0.15)',
          }}
        >
          <h4
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--pf-teal-900)',
              marginBottom: '8px',
            }}
          >
            Grade summary
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {qualificationTypes.map((type) => {
              const typeGrades = gradesForType(type.value).filter((g) => g.grade)
              const gradeString = typeGrades
                .map((g) => g.grade)
                .sort()
                .join('')
              return (
                <div key={type.value}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--pf-teal-700)' }}>{type.label}</p>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      color: 'var(--pf-teal-900)',
                      marginTop: '2px',
                    }}
                  >
                    {gradeString || '—'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="pf-btn pf-btn-secondary"
            style={{ flex: 1 }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={isSubmitting}
            className="pf-btn pf-btn-primary"
            style={{ flex: 1 }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving…
              </>
            ) : totalGradeCount > 0 ? (
              `Save ${totalGradeCount} grade${totalGradeCount === 1 ? '' : 's'} & finish`
            ) : (
              'Finish setup'
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSubmitting}
          className="pf-btn pf-btn-ghost w-full"
        >
          Skip for now — I&apos;ll add grades later
        </button>
      </div>
    </div>
  )
}
