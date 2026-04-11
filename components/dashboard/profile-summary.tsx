'use client'

import { useState } from 'react'
import { useCurrentStudent, useUpdateStudent, useWideningAccessEligibility } from '@/hooks/use-student'
import { SCHOOL_STAGES, SIMD_DESCRIPTIONS } from '@/lib/constants'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type SchoolStage = 's3' | 's4' | 's5' | 's6' | 'college' | 'mature'

export function ProfileSummary() {
  const { data: student, isLoading } = useCurrentStudent() as { data: Student | null | undefined; isLoading: boolean }
  const wideningAccess = useWideningAccessEligibility()
  const updateStudent = useUpdateStudent()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    schoolStage: '',
    schoolName: '',
  })

  if (isLoading) {
    return (
      <div className="pf-card">
        <Skeleton width="140px" height={22} rounded="md" />
        <div style={{ height: '16px' }} />
        <Skeleton width="200px" height={14} rounded="sm" />
        <div style={{ height: '8px' }} />
        <Skeleton width="150px" height={14} rounded="sm" />
      </div>
    )
  }

  if (!student) return null

  const schoolStageInfo = SCHOOL_STAGES[student.school_stage as keyof typeof SCHOOL_STAGES]

  const startEditing = () => {
    setEditData({
      firstName: student.first_name || '',
      lastName: student.last_name || '',
      schoolStage: student.school_stage || '',
      schoolName: student.school_name || '',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await updateStudent.mutateAsync({
        first_name: editData.firstName,
        last_name: editData.lastName,
        school_stage: editData.schoolStage as SchoolStage,
        school_name: editData.schoolName || null,
      })
      toast.success('Profile updated')
      setIsEditing(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.'
      toast.error("Couldn't save profile", message)
    }
  }

  if (isEditing) {
    return (
      <div className="pf-card">
        <h3 style={{ marginBottom: '16px' }}>Edit Profile</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="pf-label">First name</label>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                className="pf-input"
              />
            </div>
            <div>
              <label className="pf-label">Last name</label>
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                className="pf-input"
              />
            </div>
          </div>

          <div>
            <label className="pf-label">School stage</label>
            <select
              value={editData.schoolStage}
              onChange={(e) => setEditData({ ...editData, schoolStage: e.target.value })}
              className="pf-input"
            >
              {Object.entries(SCHOOL_STAGES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="pf-label">School name (optional)</label>
            <input
              type="text"
              value={editData.schoolName}
              onChange={(e) => setEditData({ ...editData, schoolName: e.target.value })}
              className="pf-input"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="pf-btn-secondary flex-1 justify-center"
              style={{ minHeight: '48px' }}
              disabled={updateStudent.isPending}
            >
              Cancel
            </button>
            <SubmitButton
              onClick={handleSave}
              isLoading={updateStudent.isPending}
              loadingText="Saving..."
              fullWidth
              className="flex-1"
            >
              Save
            </SubmitButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pf-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 style={{ fontSize: '1.125rem', margin: 0 }}>
            {student.first_name} {student.last_name}
          </h3>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem' }}>
            {schoolStageInfo?.label || student.school_stage}
            {student.school_name && ` at ${student.school_name}`}
          </p>
        </div>
        <button
          type="button"
          aria-label="Edit profile"
          onClick={startEditing}
          className="rounded-lg transition-colors inline-flex items-center justify-center flex-shrink-0"
          style={{ color: 'var(--pf-grey-600)', minWidth: '44px', minHeight: '44px' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)'
            e.currentTarget.style.color = 'var(--pf-blue-700)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--pf-grey-600)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {student.simd_decile && (
          <span
            className="pf-badge-amber"
            title={SIMD_DESCRIPTIONS[student.simd_decile as keyof typeof SIMD_DESCRIPTIONS]}
          >
            SIMD{' '}
            {student.simd_decile <= 2 ? '20' : student.simd_decile <= 4 ? '40' : student.simd_decile * 10}
          </span>
        )}

        {wideningAccess?.criteria.map((criterion) => (
          <span key={criterion} className="pf-badge-amber">
            {criterion}
          </span>
        ))}
      </div>

      {/* Widening Access Notice */}
      {wideningAccess?.isEligible && (
        <div
          className="mt-4 rounded-lg"
          style={{
            padding: '12px',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--pf-amber-500)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Widening Access Eligible
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-900)', marginTop: '4px' }}>
            You may qualify for reduced entry requirements at many Scottish universities.
          </p>
        </div>
      )}
    </div>
  )
}
