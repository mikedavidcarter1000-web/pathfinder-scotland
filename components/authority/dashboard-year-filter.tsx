'use client'

import { useState } from 'react'
import {
  AcademicYearFilter,
  defaultAcademicYearFilterValue,
  type AcademicYearFilterValue,
} from './academic-year-filter'

type Props = {
  /** Number of years to offer (default 5). */
  yearCount?: number
}

/**
 * Dashboard-level wrapper for the AcademicYearFilter. Owns the selected
 * year/term state and renders a short "Showing data for X" caption.
 *
 * Authority-4 ships the control only -- per-tab queries hook into the
 * selected value in Authority-5 onwards. If the eventual queries return
 * zero rows for the selected year, the consuming tab is responsible for
 * its own empty state (this wrapper just shows the selection caption).
 */
export function DashboardYearFilter({ yearCount = 5 }: Props) {
  const [value, setValue] = useState<AcademicYearFilterValue>(defaultAcademicYearFilterValue())

  const caption =
    value.academicYear === 'all'
      ? 'Showing data for all academic years'
      : value.term === 'full'
        ? `Showing data for ${value.academicYear}`
        : `Showing data for ${value.academicYear}, term ${value.term}`

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <AcademicYearFilter
        value={value}
        onChange={setValue}
        yearCount={yearCount}
        showTerm
      />
      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>{caption}</p>
    </div>
  )
}
