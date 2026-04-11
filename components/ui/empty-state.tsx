'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  secondaryLabel?: string
  secondaryHref?: string
  onSecondary?: () => void
  tone?: 'default' | 'subtle'
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  onSecondary,
  tone = 'default',
}: EmptyStateProps) {
  const hasPrimary = actionLabel && (actionHref || onAction)
  const hasSecondary = secondaryLabel && (secondaryHref || onSecondary)

  return (
    <div
      className="text-center"
      style={{
        padding: tone === 'subtle' ? '32px 20px' : '56px 24px',
      }}
    >
      {icon && (
        <div
          className="mx-auto flex items-center justify-center"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '9999px',
            backgroundColor: 'var(--pf-teal-100)',
            color: 'var(--pf-teal-700)',
            marginBottom: '20px',
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={{ marginBottom: '8px' }}>{title}</h3>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          marginBottom: hasPrimary || hasSecondary ? '20px' : 0,
          maxWidth: '460px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {message}
      </p>

      {(hasPrimary || hasSecondary) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {hasPrimary &&
            (actionHref ? (
              <Link href={actionHref} className="pf-btn-primary">
                {actionLabel}
              </Link>
            ) : (
              <button type="button" onClick={onAction} className="pf-btn-primary">
                {actionLabel}
              </button>
            ))}
          {hasSecondary &&
            (secondaryHref ? (
              <Link href={secondaryHref} className="pf-btn-secondary">
                {secondaryLabel}
              </Link>
            ) : (
              <button type="button" onClick={onSecondary} className="pf-btn-secondary">
                {secondaryLabel}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

// Icon helpers so pages can stay declarative at call sites.
export const EmptyStateIcons = {
  search: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  book: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  graduationCap: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6.055" />
    </svg>
  ),
  bookmark: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  columns: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  compass: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L16 16m0 0l-3-3m3 3l-3 3" />
    </svg>
  ),
  building: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
}
