'use client'

import type { BursaryFilterState } from './types'

const STAGE_OPTIONS = [
  { value: '', label: 'All stages' },
  { value: 'S1', label: 'S1' },
  { value: 'S2', label: 'S2' },
  { value: 'S3', label: 'S3' },
  { value: 'S4', label: 'S4' },
  { value: 'S5', label: 'S5' },
  { value: 'S6', label: 'S6' },
  { value: 'FE', label: 'College / FE' },
  { value: 'undergraduate', label: 'University' },
]

interface BursaryFiltersProps {
  filters: BursaryFilterState
  onChange: (filters: BursaryFilterState) => void
  onReset: () => void
  isPersonalised: boolean
  resultCount: number
}

export function BursaryFilters({
  filters,
  onChange,
  onReset,
  isPersonalised,
  resultCount,
}: BursaryFiltersProps) {
  const update = (patch: Partial<BursaryFilterState>) => {
    onChange({ ...filters, ...patch })
  }

  const hasActiveFilters = filters.stage !== '' ||
    filters.age !== '' ||
    filters.careExperienced ||
    filters.disability ||
    filters.youngCarer ||
    filters.youngParent ||
    filters.meansTested !== 'all'

  return (
    <div
      style={{
        backgroundColor: 'var(--pf-white)',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        padding: '20px 24px',
      }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: '16px' }}>
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--pf-grey-900)',
            margin: 0,
          }}
        >
          {isPersonalised ? 'Refine your results' : 'Filter bursaries'}
        </h2>
        <div className="flex items-center gap-3">
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
            }}
          >
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-blue-700)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: '16px' }}>
        {/* Stage */}
        <div>
          <label
            htmlFor="filter-stage"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--pf-grey-700)',
              marginBottom: '4px',
            }}
          >
            Student stage
          </label>
          <select
            id="filter-stage"
            value={filters.stage}
            onChange={(e) => update({ stage: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--pf-grey-200)',
              fontSize: '0.875rem',
              color: 'var(--pf-grey-900)',
              backgroundColor: 'var(--pf-white)',
            }}
          >
            {STAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="filter-age"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--pf-grey-700)',
              marginBottom: '4px',
            }}
          >
            Your age
          </label>
          <input
            id="filter-age"
            type="number"
            min={5}
            max={99}
            placeholder="e.g. 17"
            value={filters.age}
            onChange={(e) => update({ age: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--pf-grey-200)',
              fontSize: '0.875rem',
              color: 'var(--pf-grey-900)',
              backgroundColor: 'var(--pf-white)',
            }}
          />
        </div>

        {/* Means-tested */}
        <div>
          <label
            htmlFor="filter-means"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--pf-grey-700)',
              marginBottom: '4px',
            }}
          >
            Income-assessed
          </label>
          <select
            id="filter-means"
            value={filters.meansTested}
            onChange={(e) => update({ meansTested: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--pf-grey-200)',
              fontSize: '0.875rem',
              color: 'var(--pf-grey-900)',
              backgroundColor: 'var(--pf-white)',
            }}
          >
            <option value="all">All</option>
            <option value="yes">Income-assessed only</option>
            <option value="no">Not income-assessed</option>
          </select>
        </div>
      </div>

      {/* Demographic checkboxes */}
      <div>
        <div
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--pf-grey-700)',
            marginBottom: '8px',
          }}
        >
          I am / I have...
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Checkbox
            id="filter-care"
            label="Care experienced"
            checked={filters.careExperienced}
            onChange={(v) => update({ careExperienced: v })}
          />
          <Checkbox
            id="filter-disability"
            label="A disability"
            checked={filters.disability}
            onChange={(v) => update({ disability: v })}
          />
          <Checkbox
            id="filter-carer"
            label="A young carer"
            checked={filters.youngCarer}
            onChange={(v) => update({ youngCarer: v })}
          />
          <Checkbox
            id="filter-parent"
            label="A young parent"
            checked={filters.youngParent}
            onChange={(v) => update({ youngParent: v })}
          />
        </div>
      </div>
    </div>
  )
}

function Checkbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2"
      style={{
        fontSize: '0.875rem',
        color: 'var(--pf-grey-900)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '16px',
          height: '16px',
          accentColor: 'var(--pf-blue-700)',
          cursor: 'pointer',
        }}
      />
      {label}
    </label>
  )
}
