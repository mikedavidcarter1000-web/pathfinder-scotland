'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  useStudentSubjectChoices,
  useStudentAcademyChoices,
  type ChoiceTransition,
  type StudentSubjectChoiceWithSubject,
  type StudentAcademyChoiceWithSubject,
} from '@/hooks/use-subjects'
import { getCurricularAreaColour } from '@/lib/constants'

// The transitions, ordered the way a student progresses through school.
const TRANSITION_LABELS: Array<{ value: ChoiceTransition; label: string }> = [
  { value: 's2_to_s3', label: 'Going into S3' },
  { value: 's3_to_s4', label: 'Going into S4' },
  { value: 's4_to_s5', label: 'Going into S5' },
  { value: 's5_to_s6', label: 'Going into S6' },
]

export function SubjectChoicesSection() {
  const { data: choices, isLoading } = useStudentSubjectChoices()
  const { data: academyChoices } = useStudentAcademyChoices()

  const grouped = useMemo(() => {
    const map = new Map<ChoiceTransition, StudentSubjectChoiceWithSubject[]>()
    for (const row of choices || []) {
      const key = row.transition as ChoiceTransition
      const list = map.get(key) || []
      list.push(row)
      map.set(key, list)
    }
    return map
  }, [choices])

  if (isLoading) {
    return (
      <div className="pf-card">
        <div className="animate-pulse">
          <div
            className="h-6 w-40 rounded mb-4"
            style={{ backgroundColor: 'var(--pf-grey-100)' }}
          />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-10 rounded"
                style={{ backgroundColor: 'var(--pf-grey-100)' }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasAny = (choices && choices.length > 0) || (academyChoices && academyChoices.length > 0)

  return (
    <div className="pf-card">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>My Subject Choices</h2>
        <Link
          href="/pathways"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--pf-teal-700)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {hasAny ? 'Edit in planner →' : 'Open planner →'}
        </Link>
      </div>

      {!hasAny ? (
        <EmptyState />
      ) : (
        <div className="space-y-5">
          {TRANSITION_LABELS.map((t) => {
            const rows = grouped.get(t.value) || []
            if (rows.length === 0) return null
            return (
              <TransitionGroup
                key={t.value}
                label={t.label}
                rows={rows}
                academies={t.value === 's2_to_s3' ? academyChoices || [] : []}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="text-center"
      style={{
        padding: '24px',
        borderRadius: '8px',
        backgroundColor: 'var(--pf-teal-50)',
        border: '1px dashed var(--pf-teal-500)',
      }}
    >
      <svg
        className="w-10 h-10 mx-auto mb-3"
        style={{ color: 'var(--pf-teal-500)' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
      <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>No subject choices yet</h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          marginBottom: '16px',
        }}
      >
        Use the pathway planner to map out your senior phase subjects.
      </p>
      <Link href="/pathways" className="pf-btn-primary pf-btn-sm">
        Plan my subjects
      </Link>
    </div>
  )
}

function TransitionGroup({
  label,
  rows,
  academies,
}: {
  label: string
  rows: StudentSubjectChoiceWithSubject[]
  academies: StudentAcademyChoiceWithSubject[]
}) {
  return (
    <section>
      <h3
        style={{
          margin: 0,
          marginBottom: '10px',
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--pf-grey-600)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
        }}
      >
        {label}
      </h3>
      <ul
        className="space-y-1.5"
        style={{ listStyle: 'none', padding: 0, margin: 0 }}
      >
        {rows.map((row) => {
          const subject = row.subject
          if (!subject) return null
          const areaName = subject.curricular_area?.name ?? null
          const areaColour = getCurricularAreaColour(areaName)
          return (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-lg"
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--pf-teal-50)',
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${areaColour.dot}`}
                aria-hidden="true"
              />
              <Link
                href={`/subjects/${subject.id}`}
                className="flex-1 min-w-0 no-underline hover:no-underline"
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'var(--pf-grey-900)',
                }}
              >
                {subject.name}
              </Link>
              {areaName && (
                <span className={`pf-area-badge ${areaColour.bg} ${areaColour.text}`}>
                  {areaName}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {academies.length > 0 && (
        <div className="mt-3">
          <p
            style={{
              margin: 0,
              marginBottom: '8px',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--pf-grey-600)',
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Academy ranking
          </p>
          <ol
            className="space-y-1"
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {academies.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3"
                style={{ fontSize: '0.875rem' }}
              >
                <span
                  className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: '22px',
                    height: '22px',
                    backgroundColor: 'var(--pf-teal-700)',
                    color: '#fff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {a.rank_order}
                </span>
                <span style={{ color: 'var(--pf-grey-900)' }}>
                  {a.subject?.name ?? 'Unknown academy'}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
