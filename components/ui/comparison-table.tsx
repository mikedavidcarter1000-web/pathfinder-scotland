'use client'

import Link from 'next/link'
import { EligibilityBadge } from './eligibility-badge'
import type { Tables } from '@/types/database'

interface ComparisonTableProps {
  courses: (Tables<'courses'> & {
    university?: Tables<'universities'>
    eligibility?: 'eligible' | 'possible' | 'below' | null
  })[]
  onRemove?: (courseId: string) => void
}

export function ComparisonTable({ courses, onRemove }: ComparisonTableProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses to compare</h3>
        <p className="text-gray-600 mb-4">
          Add courses to your comparison to see them side by side.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse courses
        </Link>
      </div>
    )
  }

  const rows = [
    {
      label: 'University',
      getValue: (course: typeof courses[0]) => course.university?.name || '-',
    },
    {
      label: 'Eligibility',
      getValue: (course: typeof courses[0]) => (
        course.eligibility ? <EligibilityBadge status={course.eligibility} size="sm" /> : '-'
      ),
    },
    {
      label: 'Degree Type',
      getValue: (course: typeof courses[0]) => course.degree_type || '-',
    },
    {
      label: 'Duration',
      getValue: (course: typeof courses[0]) =>
        course.duration_years ? `${course.duration_years} years` : '-',
    },
    {
      label: 'Highers Required',
      getValue: (course: typeof courses[0]) => {
        const reqs = course.entry_requirements as { highers?: string } | null
        return reqs?.highers || '-'
      },
    },
    {
      label: 'UCAS Points',
      getValue: (course: typeof courses[0]) => {
        const reqs = course.entry_requirements as { ucas_points?: number } | null
        return reqs?.ucas_points || '-'
      },
    },
    {
      label: 'Subject Area',
      getValue: (course: typeof courses[0]) => course.subject_area || '-',
    },
    {
      label: 'UCAS Code',
      getValue: (course: typeof courses[0]) => course.ucas_code || '-',
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-4 bg-gray-50 font-medium text-gray-500 text-sm w-40">
              Compare
            </th>
            {courses.map((course) => (
              <th key={course.id} className="p-4 bg-gray-50 text-left min-w-[200px]">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/courses/${course.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                  >
                    {course.name}
                  </Link>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(course.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="p-4 text-sm font-medium text-gray-500">{row.label}</td>
              {courses.map((course) => (
                <td key={course.id} className="p-4 text-sm text-gray-900">
                  {row.getValue(course)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="p-4 text-sm font-medium text-gray-500">Actions</td>
            {courses.map((course) => (
              <td key={course.id} className="p-4">
                <Link
                  href={`/courses/${course.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

interface ComparisonBarProps {
  courses: { id: string; name: string }[]
  maxCourses?: number
  onRemove: (courseId: string) => void
  onClear: () => void
}

export function ComparisonBar({
  courses,
  maxCourses = 4,
  onRemove,
  onClear,
}: ComparisonBarProps) {
  if (courses.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm font-medium text-gray-600 flex-shrink-0">
              Comparing ({courses.length}/{maxCourses}):
            </span>
            {courses.map((course) => (
              <span
                key={course.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg flex-shrink-0"
              >
                <span className="max-w-[150px] truncate">{course.name}</span>
                <button
                  onClick={() => onRemove(course.id)}
                  className="hover:text-blue-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClear}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear all
            </button>
            <Link
              href="/compare"
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Compare
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
