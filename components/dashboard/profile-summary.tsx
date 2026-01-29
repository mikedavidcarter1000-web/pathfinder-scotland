'use client'

import { useState } from 'react'
import { useCurrentStudent, useUpdateStudent, useWideningAccessEligibility } from '@/hooks/use-student'
import { SCHOOL_STAGES, SIMD_DESCRIPTIONS } from '@/lib/constants'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type SchoolStage = 's3' | 's4' | 's5' | 's6' | 'college' | 'mature'

export function ProfileSummary() {
  const { data: student, isLoading } = useCurrentStudent() as { data: Student | null | undefined; isLoading: boolean }
  const wideningAccess = useWideningAccessEligibility()
  const updateStudent = useUpdateStudent()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    schoolStage: '',
    schoolName: '',
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-48 bg-gray-100 rounded" />
            <div className="h-4 w-36 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!student) return null

  const schoolStageInfo = SCHOOL_STAGES[student.school_stage as keyof typeof SCHOOL_STAGES]
  const simdDescription = student.simd_decile
    ? SIMD_DESCRIPTIONS[student.simd_decile as keyof typeof SIMD_DESCRIPTIONS]
    : null

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
    await updateStudent.mutateAsync({
      first_name: editData.firstName,
      last_name: editData.lastName,
      school_stage: editData.schoolStage as SchoolStage,
      school_name: editData.schoolName || null,
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name
              </label>
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School stage
            </label>
            <select
              value={editData.schoolStage}
              onChange={(e) => setEditData({ ...editData, schoolStage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {Object.entries(SCHOOL_STAGES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School name (optional)
            </label>
            <input
              type="text"
              value={editData.schoolName}
              onChange={(e) => setEditData({ ...editData, schoolName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateStudent.isPending}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {updateStudent.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {student.first_name} {student.last_name}
          </h2>
          <p className="text-gray-500">
            {schoolStageInfo?.label || student.school_stage}
            {student.school_name && ` at ${student.school_name}`}
          </p>
        </div>
        <button
          onClick={startEditing}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {/* SIMD Badge */}
        {student.simd_decile && (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              student.simd_decile <= 2
                ? 'bg-green-100 text-green-700'
                : student.simd_decile <= 4
                ? 'bg-lime-100 text-lime-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            SIMD {student.simd_decile <= 2 ? '20' : student.simd_decile <= 4 ? '40' : student.simd_decile * 10}
          </span>
        )}

        {/* Widening Access Criteria */}
        {wideningAccess?.criteria.map((criterion) => (
          <span
            key={criterion}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
          >
            {criterion}
          </span>
        ))}
      </div>

      {/* Widening Access Notice */}
      {wideningAccess?.isEligible && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-medium">
              Widening Access Eligible
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            You may qualify for reduced entry requirements at many Scottish universities.
          </p>
        </div>
      )}
    </div>
  )
}
