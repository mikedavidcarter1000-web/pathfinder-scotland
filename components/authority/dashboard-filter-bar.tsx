'use client'

import { useMemo } from 'react'
import {
  ALL_GENDERS,
  ALL_SIMD_QUINTILES,
  ALL_YEAR_GROUPS,
  type FilterSchoolOption,
} from '@/lib/authority/filters'
import { useAuthorityFilters } from '@/hooks/use-authority-filters'
import { MultiSelect } from './multi-select'
import { getAcademicYearOptions, getTermLabel } from '@/lib/academic-year'

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '0.875rem',
  backgroundColor: '#fff',
  color: '#1a1a2e',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
}

export interface DashboardFilterBarProps {
  schoolOptions: FilterSchoolOption[]
  /** Caption shown below the filter bar (set by parent based on active count) */
  appliedCount?: number
}

export function DashboardFilterBar({ schoolOptions, appliedCount }: DashboardFilterBarProps) {
  const {
    filters,
    isPending,
    setSchools,
    setYearGroups,
    setSimd,
    setGenders,
    setAcademicYear,
    setTerm,
    resetAll,
  } = useAuthorityFilters()

  const yearOptions = useMemo(() => getAcademicYearOptions(5), [])

  const hasFilters = useMemo(
    () =>
      filters.schoolIds.length > 0 ||
      filters.yearGroups.length > 0 ||
      filters.simdQuintiles.length > 0 ||
      filters.genders.length > 0 ||
      filters.academicYear === 'all' ||
      (filters.academicYear !== yearOptions[0]?.value) ||
      filters.term !== 'full',
    [filters, yearOptions],
  )

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'flex-end',
        }}
      >
        <MultiSelect
          id="filter-schools"
          label="Schools"
          options={schoolOptions.map((s) => ({ value: s.id, label: s.name }))}
          value={filters.schoolIds}
          onChange={setSchools}
          allLabel="All schools"
          width="220px"
        />

        <MultiSelect
          id="filter-year-groups"
          label="Year groups"
          options={ALL_YEAR_GROUPS.map((y) => ({ value: y, label: y }))}
          value={filters.yearGroups}
          onChange={setYearGroups}
          allLabel="All years"
          width="160px"
        />

        <MultiSelect
          id="filter-simd"
          label="SIMD quintile"
          options={ALL_SIMD_QUINTILES.map((q) => ({
            value: q,
            label: simdLabel(q),
          }))}
          value={filters.simdQuintiles}
          onChange={setSimd}
          allLabel="All SIMD"
          width="200px"
        />

        <MultiSelect
          id="filter-gender"
          label="Gender"
          options={ALL_GENDERS.map((g) => ({ value: g, label: g === 'Other' ? 'Other / prefer not to say' : g }))}
          value={filters.genders}
          onChange={setGenders}
          allLabel="All genders"
          width="180px"
        />

        <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
          <label htmlFor="filter-ay" style={labelStyle}>
            Academic year
          </label>
          <select
            id="filter-ay"
            style={{ ...selectStyle, minWidth: '140px' }}
            value={filters.academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="all">All years</option>
            {yearOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {filters.academicYear !== 'all' && (
          <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
            <label htmlFor="filter-term" style={labelStyle}>
              Term
            </label>
            <select
              id="filter-term"
              style={{ ...selectStyle, minWidth: '160px' }}
              value={String(filters.term)}
              onChange={(e) => {
                const v = e.target.value
                if (v === 'full') setTerm('full')
                else if (v === '1' || v === '2' || v === '3' || v === '4') setTerm(Number(v) as 1 | 2 | 3 | 4)
              }}
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

        {hasFilters && (
          <button
            type="button"
            onClick={resetAll}
            style={{
              alignSelf: 'flex-end',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              borderRadius: '8px',
              color: '#64748b',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            Reset filters
          </button>
        )}
      </div>

      {(appliedCount != null || isPending) && (
        <p
          style={{
            margin: '14px 0 0',
            fontSize: '0.8125rem',
            color: '#64748b',
            fontStyle: isPending ? 'italic' : 'normal',
          }}
        >
          {isPending ? 'Updating…' : `Showing ${appliedCount ?? 0} school${appliedCount === 1 ? '' : 's'} in current view.`}
        </p>
      )}
    </div>
  )
}

function simdLabel(q: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'): string {
  if (q === 'Q1') return 'Q1 (most deprived)'
  if (q === 'Q5') return 'Q5 (least deprived)'
  return q
}
