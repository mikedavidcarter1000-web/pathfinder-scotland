'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

interface ErrorStateProps {
  title?: string
  message?: string
  retryAction?: () => void
  retryLabel?: string
  backLink?: { href: string; label: string }
  icon?: ReactNode
  variant?: 'card' | 'inline' | 'full'
}

const WarningIcon = (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
)

export function ErrorState({
  title = 'Something went wrong',
  message = 'We hit an unexpected error. Please try again in a moment.',
  retryAction,
  retryLabel = 'Try again',
  backLink,
  icon,
  variant = 'card',
}: ErrorStateProps) {
  const body = (
    <>
      <div
        className="flex items-center justify-center mx-auto"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--pf-red-500)',
        }}
      >
        {icon ?? WarningIcon}
      </div>
      <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>{title}</h3>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          marginBottom: retryAction || backLink ? '20px' : 0,
          maxWidth: '420px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {message}
      </p>
      {(retryAction || backLink) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {retryAction && (
            <button
              type="button"
              onClick={retryAction}
              className="pf-btn-primary"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {retryLabel}
            </button>
          )}
          {backLink && (
            <Link href={backLink.href} className="pf-btn-secondary">
              {backLink.label}
            </Link>
          )}
        </div>
      )}
    </>
  )

  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className="rounded-lg flex items-start gap-3"
        style={{
          padding: '16px',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: 'var(--pf-red-500)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <div style={{ color: 'var(--pf-red-500)', flexShrink: 0 }}>{WarningIcon}</div>
        <div className="flex-1">
          <p style={{ fontWeight: 600, color: 'var(--pf-grey-900)', marginBottom: '4px' }}>
            {title}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>{message}</p>
          {(retryAction || backLink) && (
            <div className="flex items-center gap-3 mt-3">
              {retryAction && (
                <button
                  type="button"
                  onClick={retryAction}
                  className="pf-btn-secondary pf-btn-sm"
                >
                  {retryLabel}
                </button>
              )}
              {backLink && (
                <Link
                  href={backLink.href}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--pf-teal-700)',
                  }}
                >
                  {backLink.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <div
        role="alert"
        className="min-h-[60vh] flex items-center justify-center"
        style={{ padding: '48px 16px' }}
      >
        <div className="pf-card text-center" style={{ maxWidth: '480px' }}>
          {body}
        </div>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className="pf-card text-center"
      style={{ padding: '40px 24px' }}
    >
      {body}
    </div>
  )
}
