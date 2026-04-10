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
    <Link href={`/courses/${course.id}`} className="block group no-underline hover:no-underline">
      <div
        className="pf-card-hover"
        style={{ padding: 0, overflow: 'hidden', height: '100%' }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, var(--pf-teal-500), var(--pf-teal-700))',
          }}
        />

        <div style={{ padding: compact ? '16px' : '20px' }}>
          {/* Header */}
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3
                className="line-clamp-2"
                style={{
                  fontSize: compact ? '0.9375rem' : '1.0625rem',
                  color: 'var(--pf-grey-900)',
                  margin: 0,
                  marginBottom: '4px',
                }}
              >
                {course.name}
              </h3>
              {course.university && (
                <p
                  className="truncate"
                  style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}
                >
                  {course.university.name}
                </p>
              )}
            </div>

            {showSaveButton && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
                style={{
                  color: isSaved ? 'var(--pf-red-500)' : 'var(--pf-grey-600)',
                  backgroundColor: isSaved ? 'rgba(239,68,68,0.08)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--pf-red-500)'
                  e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isSaved ? 'var(--pf-red-500)' : 'var(--pf-grey-600)'
                  e.currentTarget.style.backgroundColor = isSaved ? 'rgba(239,68,68,0.08)' : 'transparent'
                }}
                aria-label={isSaved ? 'Remove from saved' : 'Save course'}
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
            {course.degree_type && <span className="pf-badge-grey">{course.degree_type}</span>}
            {course.subject_area && <span className="pf-badge-teal">{course.subject_area}</span>}
          </div>

          {/* Requirements */}
          {!compact && entryRequirements && (
            <div
              className="mb-4 space-y-1.5"
              style={{ fontSize: '0.875rem' }}
            >
              {entryRequirements.highers && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--pf-grey-600)' }}>Highers</span>
                  <span
                    className="pf-data-number"
                    style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}
                  >
                    {entryRequirements.highers}
                  </span>
                </div>
              )}
              {entryRequirements.ucas_points && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--pf-grey-600)' }}>UCAS Points</span>
                  <span
                    className="pf-data-number"
                    style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}
                  >
                    {entryRequirements.ucas_points}
                  </span>
                </div>
              )}
              {course.duration_years && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--pf-grey-600)' }}>Duration</span>
                  <span
                    className="pf-data-number"
                    style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}
                  >
                    {course.duration_years} years
                  </span>
                </div>
              )}
            </div>
          )}

          {compact && (entryRequirements?.highers || entryRequirements?.ucas_points || course.duration_years) && (
            <div
              className="flex flex-wrap gap-x-4 gap-y-1 mb-3"
              style={{ fontSize: '0.75rem' }}
            >
              {entryRequirements?.highers && (
                <span style={{ color: 'var(--pf-grey-600)' }}>
                  Highers{' '}
                  <span
                    className="pf-data-number"
                    style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}
                  >
                    {entryRequirements.highers}
                  </span>
                </span>
              )}
              {entryRequirements?.ucas_points && (
                <span style={{ color: 'var(--pf-grey-600)' }}>
                  UCAS{' '}
                  <span
                    className="pf-data-number"
                    style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}
                  >
                    {entryRequirements.ucas_points}
                  </span>
                </span>
              )}
              {course.duration_years && (
                <span style={{ color: 'var(--pf-grey-600)' }}>
                  Duration{' '}
                  <span
                    className="pf-data-number"
                    style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}
                  >
                    {course.duration_years} yrs
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <span
              className="flex-1 text-center"
              style={{
                padding: '10px',
                fontSize: '0.875rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: 'var(--pf-teal-700)',
                backgroundColor: 'var(--pf-teal-100)',
                borderRadius: '6px',
              }}
            >
              View details
            </span>
            {onCompare && (
              <button
                onClick={handleCompare}
                className="transition-colors"
                style={{
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  borderRadius: '6px',
                  backgroundColor: isComparing ? 'var(--pf-teal-100)' : 'var(--pf-grey-100)',
                  color: isComparing ? 'var(--pf-teal-700)' : 'var(--pf-grey-900)',
                }}
                aria-label="Toggle compare"
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
