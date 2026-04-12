'use client'

import Link from 'next/link'
import { useHasAcceptedOffer } from '@/hooks/use-offers'
import { usePrepProgress } from '@/hooks/use-prep'

const TOTAL_CHECKLIST_ITEMS = 15

export function PrepHubCard() {
  const { hasAccepted, acceptedOffer } = useHasAcceptedOffer()
  const { completed, total, percentage } = usePrepProgress(TOTAL_CHECKLIST_ITEMS)

  if (!hasAccepted || !acceptedOffer) return null

  const universityName = acceptedOffer.course?.university?.name ?? 'university'

  return (
    <Link
      href="/prep"
      className="pf-card-hover no-underline hover:no-underline block"
      style={{ padding: '20px 24px' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-lg"
          style={{
            width: '44px',
            height: '44px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--pf-green-500)',
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--pf-grey-900)',
              marginBottom: '2px',
            }}
          >
            Prep Hub
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
            Getting ready for {universityName}
          </p>
        </div>
        <svg
          className="w-5 h-5 flex-shrink-0"
          style={{ color: 'var(--pf-blue-700)' }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
            {completed} of {total} tasks done
          </span>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'var(--pf-blue-700)',
            }}
          >
            {percentage}%
          </span>
        </div>
        <div
          className="rounded-full overflow-hidden"
          style={{ height: '6px', backgroundColor: 'var(--pf-grey-100)' }}
        >
          <div
            className="rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: 'var(--pf-blue-700)',
            }}
          />
        </div>
      </div>
    </Link>
  )
}
