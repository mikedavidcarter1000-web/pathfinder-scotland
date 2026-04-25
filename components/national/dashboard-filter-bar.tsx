'use client'

import { useMemo } from 'react'
import {
  ALL_GENDERS,
  ALL_SIMD_QUINTILES,
  ALL_YEAR_GROUPS,
} from '@/lib/national/filters'
import { useNationalFilters } from '@/hooks/use-national-filters'
import { MultiSelect } from '@/components/authority/multi-select'
import { getAcademicYearOptions } from '@/lib/academic-year'

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

export interface NationalFilterOption {
  code: string
  name: string
  is_challenge_authority: boolean
}

export interface NationalDashboardFilterBarProps {
  authorityOptions: NationalFilterOption[]
  appliedAuthorityCount?: number
}

export function NationalDashboardFilterBar({
  authorityOptions,
  appliedAuthorityCount,
}: NationalDashboardFilterBarProps) {
  const {
    filters,
    isPending,
    setAuthorities,
    setChallengeOnly,
    setYearGroups,
    setSimd,
    setGenders,
    setAcademicYear,
    resetAll,
  } = useNationalFilters()

  const yearOptions = useMemo(() => getAcademicYearOptions(5), [])

  const visibleAuthorityOptions = useMemo(
    () => (filters.challengeOnly ? authorityOptions.filter((a) => a.is_challenge_authority) : authorityOptions),
    [authorityOptions, filters.challengeOnly],
  )

  const hasFilters =
    filters.authorityCodes.length > 0 ||
    filters.challengeOnly ||
    filters.yearGroups.length > 0 ||
    filters.simdQuintiles.length > 0 ||
    filters.genders.length > 0 ||
    filters.academicYear === 'all' ||
    filters.academicYear !== yearOptions[0]?.value

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
        <MultiSelect
          id="filter-las"
          label="Local authorities"
          options={visibleAuthorityOptions.map((a) => ({
            value: a.code,
            label: a.is_challenge_authority ? `${a.name} ★` : a.name,
          }))}
          value={filters.authorityCodes}
          onChange={setAuthorities}
          allLabel="All opted-in LAs"
          width="240px"
        />

        <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
          <label htmlFor="filter-challenge" style={labelStyle}>
            Challenge Authorities
          </label>
          <label
            htmlFor="filter-challenge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: filters.challengeOnly ? '#eff6ff' : '#fff',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <input
              id="filter-challenge"
              type="checkbox"
              checked={filters.challengeOnly}
              onChange={(e) => setChallengeOnly(e.target.checked)}
            />
            Challenge only (9)
          </label>
        </div>

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
          options={ALL_SIMD_QUINTILES.map((q) => ({ value: q, label: simdLabel(q) }))}
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

      {(appliedAuthorityCount != null || isPending) && (
        <p style={{ margin: '14px 0 0', fontSize: '0.8125rem', color: '#64748b', fontStyle: isPending ? 'italic' : 'normal' }}>
          {isPending
            ? 'Updating…'
            : `Showing ${appliedAuthorityCount ?? 0} authorit${appliedAuthorityCount === 1 ? 'y' : 'ies'} in current view.`}
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
