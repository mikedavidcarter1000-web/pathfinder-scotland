'use client'

import { useMemo, useState } from 'react'
import { formatCohortValue } from '@/lib/authority/disclosure'
import type { SubjectUptakeRow } from '@/lib/authority/subjects-queries'

type SortKey = 'subject' | 'category' | 'count' | 'percentage' | 'female_pct' | 'simd_q1_pct'
type SortDir = 'asc' | 'desc'

export interface SubjectUptakeTableProps {
  rows: SubjectUptakeRow[]
}

export function SubjectUptakeTable({ rows }: SubjectUptakeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('count')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'subject':
          return a.subject_name.localeCompare(b.subject_name) * direction
        case 'category':
          return ((a.subject_category ?? '').localeCompare(b.subject_category ?? '')) * direction
        case 'count':
          return ((a.student_count ?? 0) - (b.student_count ?? 0)) * direction
        case 'percentage':
          return ((a.percentage ?? 0) - (b.percentage ?? 0)) * direction
        case 'female_pct':
          return (femalePct(a) - femalePct(b)) * direction
        case 'simd_q1_pct':
          return (simdQ1Pct(a) - simdQ1Pct(b)) * direction
        default:
          return 0
      }
    })
    return copy
  }, [rows, sortKey, sortDir])

  const onHeaderClick = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'subject' || key === 'category' ? 'asc' : 'desc')
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
          minWidth: '760px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
            <SortableTh
              label="Subject"
              active={sortKey === 'subject'}
              direction={sortDir}
              onClick={() => onHeaderClick('subject')}
            />
            <SortableTh
              label="Category"
              active={sortKey === 'category'}
              direction={sortDir}
              onClick={() => onHeaderClick('category')}
            />
            <SortableTh
              label="Students"
              align="right"
              active={sortKey === 'count'}
              direction={sortDir}
              onClick={() => onHeaderClick('count')}
            />
            <SortableTh
              label="% of cohort"
              align="right"
              active={sortKey === 'percentage'}
              direction={sortDir}
              onClick={() => onHeaderClick('percentage')}
            />
            <SortableTh
              label="Female %"
              align="right"
              active={sortKey === 'female_pct'}
              direction={sortDir}
              onClick={() => onHeaderClick('female_pct')}
            />
            <SortableTh
              label="SIMD Q1 %"
              align="right"
              active={sortKey === 'simd_q1_pct'}
              direction={sortDir}
              onClick={() => onHeaderClick('simd_q1_pct')}
            />
            <th style={thStyle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const isOpen = expandedId === r.subject_id
            return (
              <FragmentRow key={r.subject_id}>
                <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                  <Td>{r.subject_name}</Td>
                  <Td>{r.subject_category ?? '—'}</Td>
                  <Td align="right">{formatCohortValue(r.student_count)}</Td>
                  <Td align="right">{r.percentage == null ? '—' : `${r.percentage.toFixed(1)}%`}</Td>
                  <Td align="right">{formatPercentage(femalePctOrNull(r))}</Td>
                  <Td align="right">{formatPercentage(simdQ1PctOrNull(r))}</Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : r.subject_id)}
                      aria-expanded={isOpen}
                      aria-controls={`uptake-detail-${r.subject_id}`}
                      style={{
                        background: 'none',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        color: '#1d4ed8',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {isOpen ? 'Hide schools' : 'By school'}
                    </button>
                  </Td>
                </tr>
                {isOpen && (
                  <tr id={`uptake-detail-${r.subject_id}`} style={{ backgroundColor: '#f8fafc' }}>
                    <td colSpan={7} style={{ padding: '12px 16px' }}>
                      <PerSchoolBreakdown row={r} />
                    </td>
                  </tr>
                )}
              </FragmentRow>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PerSchoolBreakdown({ row }: { row: SubjectUptakeRow }) {
  if (row.per_school.length === 0) {
    return <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic' }}>No per-school breakdown.</p>
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '8px',
      }}
    >
      {row.per_school.map((s) => (
        <div
          key={s.school_id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 10px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '0.8125rem',
          }}
        >
          <span style={{ color: '#1a1a2e' }}>{s.school_name || '—'}</span>
          <span style={{ color: '#64748b', fontWeight: 600 }}>{formatCohortValue(s.student_count)}</span>
        </div>
      ))}
    </div>
  )
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Percentages come pre-computed from the data layer where they have already
// been suppressed against the disclosure threshold. Reading them here avoids
// any chance of leaking suppressed counts via client-side division.
function femalePct(row: SubjectUptakeRow): number {
  return femalePctOrNull(row) ?? 0
}
function femalePctOrNull(row: SubjectUptakeRow): number | null {
  return row.gender_percentages.female
}
function simdQ1Pct(row: SubjectUptakeRow): number {
  return simdQ1PctOrNull(row) ?? 0
}
function simdQ1PctOrNull(row: SubjectUptakeRow): number | null {
  return row.simd_percentages.Q1
}

function formatPercentage(p: number | null): string {
  if (p == null) return '—'
  return `${p.toFixed(1)}%`
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'left',
}

function SortableTh({
  label,
  active,
  direction,
  align = 'left',
  onClick,
}: {
  label: string
  active: boolean
  direction: SortDir
  align?: 'left' | 'right'
  onClick: () => void
}) {
  return (
    <th
      style={{
        ...thStyle,
        textAlign: align,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onClick}
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {active && (
          <span aria-hidden="true" style={{ color: '#1d4ed8' }}>
            {direction === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </span>
    </th>
  )
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td
      style={{
        padding: '10px 16px',
        verticalAlign: 'top',
        textAlign: align,
        color: '#1a1a2e',
      }}
    >
      {children}
    </td>
  )
}
