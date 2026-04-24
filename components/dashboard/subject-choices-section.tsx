'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  useStudentSubjectChoices,
  useStudentAcademyChoices,
  useSaveSubjectChoices,
  type ChoiceTransition,
  type StudentSubjectChoiceWithSubject,
  type StudentAcademyChoiceWithSubject,
} from '@/hooks/use-subjects'
import { useCurrentStudent } from '@/hooks/use-student'
import { getCurricularAreaColour } from '@/lib/constants'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast'

// The transitions, ordered the way a student progresses through school.
const TRANSITION_LABELS: Array<{ value: ChoiceTransition; label: string }> = [
  { value: 's2_to_s3', label: 'Going into S3' },
  { value: 's3_to_s4', label: 'Going into S4' },
  { value: 's4_to_s5', label: 'Going into S5' },
  { value: 's5_to_s6', label: 'Going into S6' },
]

// Map the student's current stage to the transition the card should highlight.
// If the student is in S6 or beyond (college / mature / null), we don't
// surface a "GOING INTO …" emphasis label — the full history is shown instead.
const STAGE_TO_ACTIVE_TRANSITION: Record<string, ChoiceTransition> = {
  s2: 's2_to_s3',
  s3: 's3_to_s4',
  s4: 's4_to_s5',
  s5: 's5_to_s6',
}

const STAGE_TO_NEXT_LABEL: Record<string, string> = {
  s2: 'Going into S3',
  s3: 'Going into S4',
  s4: 'Going into S5',
  s5: 'Going into S6',
  s6: 'Senior Phase',
}

export function SubjectChoicesSection() {
  const { data: choices, isLoading } = useStudentSubjectChoices()
  const { data: academyChoices } = useStudentAcademyChoices()
  const { data: student } = useCurrentStudent()
  const saveChoices = useSaveSubjectChoices()
  const toast = useToast()

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

  const handleRemove = async (transition: ChoiceTransition, subjectId: string) => {
    const rowsForTransition = grouped.get(transition) || []
    const nextIds = rowsForTransition
      .filter((r) => r.subject?.id && r.subject.id !== subjectId)
      .map((r) => r.subject!.id)
    try {
      await saveChoices.mutateAsync({ transition, subjectIds: nextIds })
      toast.success('Subject removed')
    } catch {
      toast.error("Couldn't remove subject", 'Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="pf-card">
        <Skeleton width="180px" height={20} rounded="md" />
        <div style={{ height: '16px' }} />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={36} rounded="md" />
          ))}
        </div>
      </div>
    )
  }

  const hasAny = (choices && choices.length > 0) || (academyChoices && academyChoices.length > 0)
  const stage = (student?.school_stage ?? '').toLowerCase()
  const activeTransition = STAGE_TO_ACTIVE_TRANSITION[stage] ?? null
  const dynamicStageLabel = STAGE_TO_NEXT_LABEL[stage] ?? null

  return (
    <div className="pf-card">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 style={{ margin: 0, fontSize: '1.125rem' }}>My Subject Choices</h2>
          {dynamicStageLabel && (
            <span
              style={{
                fontSize: '0.6875rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--pf-blue-700)',
                backgroundColor: 'var(--pf-blue-50)',
                padding: '3px 8px',
                borderRadius: '999px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              {dynamicStageLabel}
            </span>
          )}
        </div>
        <Link
          href="/pathways"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--pf-blue-700)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {hasAny ? 'Edit in planner →' : 'Open planner →'}
        </Link>
      </div>

      {!hasAny ? (
        <ChoicesEmpty />
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
                canEdit={activeTransition === t.value}
                onRemove={(subjectId) => handleRemove(t.value, subjectId)}
                isRemoving={saveChoices.isPending}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function ChoicesEmpty() {
  return (
    <EmptyState
      icon={EmptyStateIcons.compass}
      title="No subject choices planned yet"
      message="Use the pathway planner to explore your options and save your choices."
      actionLabel="Start planning"
      actionHref="/pathways"
      tone="subtle"
    />
  )
}

function TransitionGroup({
  label,
  rows,
  academies,
  canEdit = false,
  onRemove,
  isRemoving = false,
}: {
  label: string
  rows: StudentSubjectChoiceWithSubject[]
  academies: StudentAcademyChoiceWithSubject[]
  canEdit?: boolean
  onRemove?: (subjectId: string) => void
  isRemoving?: boolean
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
                backgroundColor: 'var(--pf-blue-50)',
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${areaColour.dot}`}
                aria-hidden="true"
              />
              <Link
                href={`/subjects/${subject.slug ?? subject.id}`}
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
              {canEdit && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(subject.id)}
                  disabled={isRemoving}
                  aria-label={`Remove ${subject.name}`}
                  className="rounded-md transition-colors inline-flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '28px',
                    height: '28px',
                    color: 'var(--pf-grey-600)',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                    e.currentTarget.style.color = 'var(--pf-red-500)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--pf-grey-600)'
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
                    backgroundColor: 'var(--pf-blue-700)',
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
