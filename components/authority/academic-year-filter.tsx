'use client'

import { useMemo } from 'react'
import {
  getAcademicYearOptions,
  getCurrentAcademicYear,
  getTermLabel,
} from '@/lib/academic-year'

export type AcademicYearFilterValue = {
  academicYear: string | 'all'
  term: 1 | 2 | 3 | 4 | 'full'
}

type Props = {
  value: AcademicYearFilterValue
  onChange: (next: AcademicYearFilterValue) => void
  /** Number of academic-year options to show (default 5). */
  yearCount?: number
  /** Show an "All years" option at the top of the list (default false). */
  includeAllYears?: boolean
  /** Render a secondary term selector next to the year selector (default false). */
  showTerm?: boolean
  /** Optional id prefix for label/control wiring. */
  idPrefix?: string
  className?: string
}

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '0.9375rem',
  backgroundColor: '#fff',
  color: '#1a1a2e',
  outline: 'none',
  fontFamily: 'inherit',
  minWidth: '140px',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginRight: '8px',
}

export function AcademicYearFilter(props: Props) {
  const {
    value,
    onChange,
    yearCount = 5,
    includeAllYears = false,
    showTerm = false,
    idPrefix = 'academic-year-filter',
    className,
  } = props

  const yearOptions = useMemo(() => getAcademicYearOptions(yearCount), [yearCount])
  const isAllYears = value.academicYear === 'all'

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    if (next === 'all') {
      onChange({ academicYear: 'all', term: 'full' })
      return
    }
    onChange({ academicYear: next, term: value.term })
  }

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    if (v === 'full') {
      onChange({ ...value, term: 'full' })
      return
    }
    const n = Number(v)
    if (n === 1 || n === 2 || n === 3 || n === 4) {
      onChange({ ...value, term: n })
    }
  }

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <label htmlFor={`${idPrefix}-year`} style={labelStyle}>
          Academic year
        </label>
        <select
          id={`${idPrefix}-year`}
          style={selectStyle}
          value={value.academicYear}
          onChange={handleYearChange}
        >
          {includeAllYears && <option value="all">All years</option>}
          {yearOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {showTerm && !isAllYears && (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <label htmlFor={`${idPrefix}-term`} style={labelStyle}>
            Term
          </label>
          <select
            id={`${idPrefix}-term`}
            style={selectStyle}
            value={String(value.term)}
            onChange={handleTermChange}
          >
            <option value="full">Full year</option>
            {([1, 2, 3, 4] as const).map((n) => (
              <option key={n} value={String(n)}>
                Term {n} ({getTermLabel(n)})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

/**
 * Convenience: returns the default filter value (current academic year, full year).
 */
export function defaultAcademicYearFilterValue(): AcademicYearFilterValue {
  return { academicYear: getCurrentAcademicYear(), term: 'full' }
}
