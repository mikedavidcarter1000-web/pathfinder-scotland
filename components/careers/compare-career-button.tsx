'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  ACTIVE_COMPARE_COOKIE,
  buildCompareHrefForRole,
} from '@/lib/compare/active-compare-cookie'

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const prefix = `${name}=`
  const parts = document.cookie ? document.cookie.split('; ') : []
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      try {
        return decodeURIComponent(part.slice(prefix.length))
      } catch {
        return part.slice(prefix.length)
      }
    }
  }
  return undefined
}

export interface CompareCareerButtonProps {
  roleId: string
}

export function CompareCareerButton({ roleId }: CompareCareerButtonProps) {
  // Derive the href lazily on the client. SSR falls back to a fresh-comparison
  // href (role only) because server components can't read document.cookie.
  const href = useMemo(() => {
    const cookie = readCookie(ACTIVE_COMPARE_COOKIE)
    return buildCompareHrefForRole(roleId, cookie)
  }, [roleId])

  return (
    <Link
      href={href}
      className="inline-flex items-center no-underline hover:no-underline"
      style={{
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: 600,
        backgroundColor: 'var(--pf-blue-700)',
        color: 'var(--pf-white)',
      }}
    >
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
        />
      </svg>
      Compare this career
    </Link>
  )
}
