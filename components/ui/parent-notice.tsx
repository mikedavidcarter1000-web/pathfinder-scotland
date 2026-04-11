'use client'

import { useAuth } from '@/hooks/use-auth'

/**
 * Renders a small parent-only info bar at the top of a page. The bar only
 * appears for accounts where `students.user_type === 'parent'` and is silent
 * (returns null) for everyone else, including unauthenticated visitors.
 */
export function ParentNotice({ children }: { children: React.ReactNode }) {
  const { student } = useAuth()
  if (student?.user_type !== 'parent') return null

  return (
    <div
      className="pf-container"
      style={{ paddingTop: '16px' }}
    >
      <div
        role="note"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'var(--pf-blue-100)',
          color: 'var(--pf-blue-700)',
          fontSize: '0.875rem',
          lineHeight: 1.5,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          style={{ flexShrink: 0, marginTop: '1px' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <strong style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Parents:</strong>{' '}
          {children}
        </div>
      </div>
    </div>
  )
}
