'use client'

import { usePathname } from 'next/navigation'

const EXCLUDED_PREFIXES = [
  '/about',
  '/pricing',
  '/for-schools',
  '/blog',
  '/auth',
  '/discover',
]

function shouldShow(pathname: string): boolean {
  if (pathname === '/') return false
  return !EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))
}

export function QuickExitButton() {
  const pathname = usePathname()

  if (!shouldShow(pathname)) return null

  function handleExit() {
    // replace() removes this page from history so back button skips Pathfinder
    window.location.replace('https://www.bbc.co.uk/news')
  }

  return (
    <button
      type="button"
      onClick={handleExit}
      title="Click to leave this site quickly"
      aria-label="Leave this site quickly"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        backgroundColor: '#e5e7eb',
        color: '#4b5563',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '0.8125rem',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        lineHeight: 1,
      }}
    >
      <svg
        width="12"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      Leave this site
    </button>
  )
}
