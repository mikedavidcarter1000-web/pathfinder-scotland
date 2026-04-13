'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_STORAGE_KEY = 'pf_cookie_consent'

function hasConsent(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted'
  } catch {
    return true
  }
}

function storeConsent() {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
  } catch {
    /* localStorage unavailable (private mode, quota) — accept is session-only */
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (hasConsent()) return
    setVisible(true)
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!visible) return null

  const handleAccept = () => {
    storeConsent()
    setEntered(false)
    window.setTimeout(() => setVisible(false), 220)
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        backgroundColor: 'var(--pf-blue-900)',
        color: 'var(--pf-white)',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.12)',
        transform: entered ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 220ms ease-out',
      }}
    >
      <div
        className="pf-container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingTop: '14px',
          paddingBottom: '14px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.88)',
            maxWidth: '720px',
          }}
        >
          We use cookies to improve your experience. Essential cookies keep you logged in. We don&apos;t
          use advertising or tracking cookies.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/privacy"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--pf-white)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '40px',
            }}
          >
            Learn more
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--pf-blue-900)',
              backgroundColor: 'var(--pf-white)',
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              minHeight: '40px',
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
