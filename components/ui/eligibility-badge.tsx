import type { EligibilityStatus } from '@/hooks/use-course-matching'

interface EligibilityBadgeProps {
  status: EligibilityStatus | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  missingSubjects?: string[]
}

type Config = {
  label: string
  description: string
  className: string
  icon: React.ReactNode
}

const CONFIGS: Record<EligibilityStatus, Config> = {
  eligible: {
    label: 'Eligible',
    description: 'You meet the entry requirements',
    className: 'pf-badge-green',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  eligible_via_wa: {
    label: 'Eligible via widening access',
    description: 'You meet the adjusted entry requirements for this course',
    className: 'pf-badge-amber',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  possible: {
    label: 'Possible match',
    description: 'Your grades are close to the entry requirements',
    className: 'pf-badge-amber',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  missing_subjects: {
    label: 'Missing subjects',
    description: 'You don\u2019t have all the required subjects',
    className: 'pf-badge-amber',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  ineligible: {
    label: 'Not eligible',
    description: 'Your current grades don\u2019t meet requirements',
    className: 'pf-badge-red',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', { outer: string; icon: string }> = {
  sm: { outer: 'text-xs gap-1', icon: 'w-3 h-3' },
  md: { outer: 'text-sm gap-1.5', icon: 'w-4 h-4' },
  lg: { outer: 'text-base gap-2', icon: 'w-5 h-5' },
}

export function EligibilityBadge({
  status,
  size = 'md',
  showLabel = true,
  missingSubjects,
}: EligibilityBadgeProps) {
  if (!status) return null

  const config = CONFIGS[status]
  const sizes = SIZE_CLASSES[size]

  // When a course is flagged "missing_subjects" and we know which subjects
  // are missing, surface the first one inline (e.g. "Missing: Chemistry").
  let label = config.label
  if (status === 'missing_subjects' && missingSubjects && missingSubjects.length > 0) {
    label =
      missingSubjects.length === 1
        ? `Missing: ${missingSubjects[0]}`
        : `Missing: ${missingSubjects[0]} +${missingSubjects.length - 1}`
  }

  return (
    <span className={`${config.className} inline-flex items-center ${sizes.outer}`}>
      <span className={sizes.icon}>{config.icon}</span>
      {showLabel && label}
    </span>
  )
}

export function EligibilityIndicator({
  status,
  showDescription = false,
  missingSubjects,
}: {
  status: EligibilityStatus | null
  showDescription?: boolean
  missingSubjects?: string[]
}) {
  if (!status) return null
  const config = CONFIGS[status]

  if (!showDescription) {
    return <EligibilityBadge status={status} missingSubjects={missingSubjects} />
  }

  return (
    <div
      className="rounded-lg"
      style={{
        padding: '16px',
        backgroundColor: 'var(--pf-grey-100)',
      }}
    >
      <div className="flex items-start gap-3">
        <EligibilityBadge status={status} missingSubjects={missingSubjects} />
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>{config.description}</p>
      </div>
    </div>
  )
}
