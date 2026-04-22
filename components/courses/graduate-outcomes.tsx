'use client'

import {
  employmentRateTone,
  formatApproxSalary,
  hasAnyCourseOutcomes,
  pickCourseOutcomes,
} from '@/lib/outcomes'

interface GraduateOutcomesProps {
  course: unknown
}

const TONE_COLOURS: Record<'green' | 'amber' | 'red', { fg: string; bg: string; border: string }> = {
  green: {
    fg: 'var(--pf-green-500, #10b981)',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  amber: {
    fg: '#B45309',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  red: {
    fg: 'var(--pf-red-500, #ef4444)',
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.25)',
  },
}

export function GraduateOutcomes({ course }: GraduateOutcomesProps) {
  const outcomes = pickCourseOutcomes(course)
  const hasAny = hasAnyCourseOutcomes(outcomes)

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        What happens after this degree?
      </h2>

      {!hasAny ? (
        <div
          className="rounded-lg"
          style={{
            padding: '16px',
            backgroundColor: 'var(--pf-grey-100)',
            border: '1px solid var(--pf-grey-300)',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', margin: 0 }}>
            Graduate outcome data is not yet available for this course. Check back later or visit{' '}
            <a
              href="https://discoveruni.gov.uk"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
            >
              discoveruni.gov.uk
            </a>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {outcomes.employment_rate_15m !== null && (
              <MetricCard
                label="Employment"
                value={`${outcomes.employment_rate_15m}%`}
                sub="in work or further study within 15 months"
                tone={employmentRateTone(outcomes.employment_rate_15m)}
              />
            )}

            {outcomes.highly_skilled_employment_pct !== null && (
              <MetricCard
                label="Skilled work"
                value={`${outcomes.highly_skilled_employment_pct}%`}
                sub="in professional or managerial roles"
              />
            )}

            {outcomes.salary_median_1yr !== null && (
              <MetricCard
                label="Typical salary"
                value={formatApproxSalary(outcomes.salary_median_1yr)}
                sub="median 15 months after graduation"
                footer={
                  <>
                    {outcomes.salary_median_3yr !== null && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', margin: '6px 0 0' }}>
                        Rising to around {formatApproxSalary(outcomes.salary_median_3yr)} after 3 years
                      </p>
                    )}
                    {outcomes.salary_median_5yr !== null && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', margin: '2px 0 0' }}>
                        and {formatApproxSalary(outcomes.salary_median_5yr)} after 5 years
                      </p>
                    )}
                  </>
                }
              />
            )}

            {outcomes.student_satisfaction_pct !== null && (
              <MetricCard
                label="Student satisfaction"
                value={`${outcomes.student_satisfaction_pct}%`}
                sub="overall satisfaction (National Student Survey)"
              />
            )}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '12px' }}>
            Data source: Discover Uni / HESA Graduate Outcomes survey
            {outcomes.outcomes_data_year ? ` (${outcomes.outcomes_data_year} graduates)` : ''}. Salary
            figures are median values and will vary based on location, sector and individual
            circumstances.
          </p>
        </>
      )}
    </section>
  )
}

function MetricCard({
  label,
  value,
  sub,
  tone,
  footer,
}: {
  label: string
  value: string
  sub: string
  tone?: 'green' | 'amber' | 'red'
  footer?: React.ReactNode
}) {
  const colours = tone ? TONE_COLOURS[tone] : null
  return (
    <div
      className="rounded-lg"
      style={{
        padding: '14px 16px',
        backgroundColor: colours?.bg ?? 'var(--pf-white)',
        border: `1px solid ${colours?.border ?? 'var(--pf-grey-300)'}`,
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--pf-grey-600)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          margin: 0,
          marginBottom: '4px',
        }}
      >
        {label}
      </p>
      <p
        className="pf-data-number"
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: colours?.fg ?? 'var(--pf-grey-900)',
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', margin: '6px 0 0' }}>{sub}</p>
      {footer}
    </div>
  )
}
