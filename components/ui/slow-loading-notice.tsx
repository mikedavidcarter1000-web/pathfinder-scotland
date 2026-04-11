'use client'

import { useEffect, useState } from 'react'

interface SlowLoadingNoticeProps {
  isLoading: boolean
  /** Milliseconds before the notice appears. Defaults to 10 000 ms. */
  thresholdMs?: number
  message?: string
}

/**
 * Renders a muted notice when a query has been loading for longer than the
 * configured threshold. Used to let users on slow connections know they
 * haven't been forgotten — no auto-redirect or error, just reassurance.
 */
export function SlowLoadingNotice({
  isLoading,
  thresholdMs = 10000,
  message = 'This is taking longer than usual. Please check your connection.',
}: SlowLoadingNoticeProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShow(false)
      return
    }
    const timer = setTimeout(() => setShow(true), thresholdMs)
    return () => clearTimeout(timer)
  }, [isLoading, thresholdMs])

  if (!show || !isLoading) return null

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-lg"
      style={{
        padding: '12px 16px',
        backgroundColor: 'var(--pf-blue-100)',
        color: 'var(--pf-blue-900)',
        border: '1px solid rgba(20, 144, 126, 0.25)',
        marginTop: '16px',
      }}
    >
      <svg
        className="w-5 h-5 animate-spin flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <path
          d="M22 12a10 10 0 00-10-10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <p style={{ margin: 0, fontSize: '0.875rem' }}>{message}</p>
    </div>
  )
}
