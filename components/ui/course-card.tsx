'use client'

import Link from 'next/link'
import { useState } from 'react'
import { EligibilityBadge } from './eligibility-badge'
import type { Tables } from '@/types/database'

interface CourseCardProps {
  course: Tables<'courses'> & {
    university?: Tables<'universities'>
  }
  eligibility?: 'eligible' | 'possible' | 'below' | null
  showSaveButton?: boolean
  isSaved?: boolean
  onSave?: () => void
  onCompare?: () => void
  isComparing?: boolean
  compact?: boolean
}

export function CourseCard({
  course,
  eligibility,
  showSaveButton = true,
  isSaved = false,
  onSave,
  onCompare,
  isComparing = false,
  compact = false,
}: CourseCardProps) {
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onSave) {
      setSaving(true)
      await onSave()
      setSaving(false)
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onCompare?.()
  }

  const entryRequirements = course.entry_requirements as {
    highers?: string
    advanced_highers?: string
    ucas_points?: number
  } | null

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all">
        {/* University Color Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" />

        <div className={compact ? 'p-4' : 'p-5'}>
          {/* Header */}
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors ${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
                {course.name}
              </h3>
              {course.university && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {course.university.name}
                </p>
              )}
            </div>

            {showSaveButton && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                  isSaved
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={isSaved ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {eligibility && <EligibilityBadge status={eligibility} size="sm" />}
            {course.degree_type && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {course.degree_type}
              </span>
            )}
            {course.subject_area && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {course.subject_area}
              </span>
            )}
          </div>

          {/* Requirements */}
          {!compact && entryRequirements && (
            <div className="space-y-1.5 mb-4 text-sm">
              {entryRequirements.highers && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Highers</span>
                  <span className="font-medium text-gray-900">{entryRequirements.highers}</span>
                </div>
              )}
              {entryRequirements.ucas_points && (
                <div className="flex justify-between">
                  <span className="text-gray-500">UCAS Points</span>
                  <span className="font-medium text-gray-900">{entryRequirements.ucas_points}</span>
                </div>
              )}
              {course.duration_years && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium text-gray-900">{course.duration_years} years</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <span className="flex-1 text-center py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              View details
            </span>
            {onCompare && (
              <button
                onClick={handleCompare}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isComparing
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
