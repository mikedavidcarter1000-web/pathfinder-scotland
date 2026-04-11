'use client'

import Link from 'next/link'
import { useCurrentStudent, useStudentGrades } from '@/hooks/use-student'
import { useStudentSubjectChoices } from '@/hooks/use-subjects'
import { useSavedCourses } from '@/hooks/use-courses'

type Step = {
  id: string
  label: string
  done: boolean
  href: string
}

export function ProgressChecklist() {
  const { data: student } = useCurrentStudent()
  const { data: grades } = useStudentGrades()
  const { data: choices } = useStudentSubjectChoices()
  const { data: savedCourses } = useSavedCourses()

  const steps: Step[] = [
    {
      id: 'profile',
      label: 'Profile complete',
      done: !!student,
      href: '/dashboard/settings',
    },
    {
      id: 'grades',
      label: 'Grades entered',
      done: (grades?.length ?? 0) > 0,
      href: '/dashboard',
    },
    {
      id: 'choices',
      label: 'Subject choices planned',
      done: (choices?.length ?? 0) > 0,
      href: '/pathways',
    },
    {
      id: 'saved',
      label: 'Shortlist started',
      done: (savedCourses?.length ?? 0) > 0,
      href: '/courses',
    },
  ]

  const completed = steps.filter((s) => s.done).length
  const total = steps.length
  const percent = Math.round((completed / total) * 100)

  return (
    <div className="pf-card">
      <div className="flex items-baseline justify-between mb-4">
        <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Your progress</h2>
        <span
          className="pf-data-number"
          style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', fontWeight: 600 }}
        >
          {completed} of {total} complete
        </span>
      </div>

      <div
        className="rounded-full overflow-hidden mb-5"
        style={{ height: '8px', backgroundColor: 'var(--pf-grey-100)' }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor:
              completed === total ? 'var(--pf-green-500)' : 'var(--pf-blue-500)',
          }}
        />
      </div>

      <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className="flex items-center gap-3 rounded-lg transition-colors no-underline hover:no-underline"
              style={{
                padding: '8px 10px',
                margin: '0 -10px',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              <span
                className="flex items-center justify-center flex-shrink-0 rounded-full"
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: step.done ? 'var(--pf-green-500)' : 'var(--pf-grey-100)',
                  color: step.done ? '#fff' : 'var(--pf-grey-600)',
                  border: step.done ? 'none' : '1px solid var(--pf-grey-300)',
                }}
                aria-hidden="true"
              >
                {step.done ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </span>
              <span
                style={{
                  fontSize: '0.9375rem',
                  color: step.done ? 'var(--pf-grey-600)' : 'var(--pf-grey-900)',
                  textDecoration: step.done ? 'line-through' : 'none',
                  flex: 1,
                }}
              >
                {step.label}
              </span>
              {!step.done && (
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--pf-blue-500)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
