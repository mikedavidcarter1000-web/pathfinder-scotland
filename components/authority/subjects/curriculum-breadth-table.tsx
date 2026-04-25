'use client'

import { useMemo, useState } from 'react'
import { formatCohortValue } from '@/lib/authority/disclosure'
import type { CurriculumBreadthRow } from '@/lib/authority/subjects-queries'

type SortKey = 'school' | 'students' | 'subjects' | 'avg' | 'categories' | 'index'
type SortDir = 'asc' | 'desc'

const NARROW_CURRICULUM_THRESHOLD = 15

export interface CurriculumBreadthTableProps {
  rows: CurriculumBreadthRow[]
}

export function CurriculumBreadthTable({ rows }: CurriculumBreadthTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('index')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'school':
          return a.school_name.localeCompare(b.school_name) * dir
        case 'students':
          return ((a.student_count ?? 0) - (b.student_count ?? 0)) * dir
        case 'subjects':
          return (a.subjects_offered - b.subjects_offered) * dir
        case 'avg':
          return ((a.avg_subjects_per_student ?? 0) - (b.avg_subjects_per_student ?? 0)) * dir
        case 'categories':
          return (a.subject_categories_covered - b.subject_categories_covered) * dir
        case 'index':
          return ((a.curriculum_breadth_index ?? 0) - (b.curriculum_breadth_index ?? 0)) * dir
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
      setSortDir(key === 'school' ? 'asc' : 'desc')
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
          minWidth: '720px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
            <SortableTh
              label="School"
              active={sortKey === 'school'}
              direction={sortDir}
              onClick={() => onHeaderClick('school')}
            />
            <SortableTh
              label="Students"
              align="right"
              active={sortKey === 'students'}
              direction={sortDir}
              onClick={() => onHeaderClick('students')}
            />
            <SortableTh
              label="Subjects offered"
              align="right"
              active={sortKey === 'subjects'}
              direction={sortDir}
              onClick={() => onHeaderClick('subjects')}
            />
            <SortableTh
              label="Avg per student"
              align="right"
              active={sortKey === 'avg'}
              direction={sortDir}
              onClick={() => onHeaderClick('avg')}
            />
            <SortableTh
              label="Categories"
              align="right"
              active={sortKey === 'categories'}
              direction={sortDir}
              onClick={() => onHeaderClick('categories')}
            />
            <SortableTh
              label="Breadth index"
              align="right"
              active={sortKey === 'index'}
              direction={sortDir}
              onClick={() => onHeaderClick('index')}
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const isNarrow = r.subjects_offered > 0 && r.subjects_offered < NARROW_CURRICULUM_THRESHOLD
            const isCriticallyNarrow = r.subjects_offered > 0 && r.subjects_offered < 8
            return (
              <tr key={r.school_id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <Td>{r.school_name}</Td>
                <Td align="right">{formatCohortValue(r.student_count)}</Td>
                <Td align="right">
                  <span
                    style={{
                      color: isCriticallyNarrow ? '#991b1b' : isNarrow ? '#92400e' : '#1a1a2e',
                      fontWeight: isNarrow ? 600 : 400,
                    }}
                  >
                    {r.subjects_offered}
                  </span>
                </Td>
                <Td align="right">
                  {r.avg_subjects_per_student == null ? '—' : r.avg_subjects_per_student.toFixed(1)}
                </Td>
                <Td align="right">{r.subject_categories_covered}/8</Td>
                <Td align="right">
                  {r.curriculum_breadth_index == null ? '—' : `${r.curriculum_breadth_index.toFixed(1)}/10`}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p style={{ margin: '12px 0 0', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
        Schools offering fewer than {NARROW_CURRICULUM_THRESHOLD} subjects are highlighted as a curriculum-narrowing signal.
        Breadth index is normalised against the highest-breadth school in the current scope.
      </p>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
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
      style={{ ...thStyle, textAlign: align, cursor: 'pointer', userSelect: 'none' }}
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
