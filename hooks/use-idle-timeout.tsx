'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000  // 8 hours
const WARNING_BEFORE_MS = 5 * 60 * 1000      // warn 5 min before timeout

export function useIdleTimeout(enabled: boolean = true) {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [minutesRemaining, setMinutesRemaining] = useState(5)
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiresAtRef = useRef<number>(0)

  const clearTimers = () => {
    if (idleRef.current) clearTimeout(idleRef.current)
    if (warnRef.current) clearTimeout(warnRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }

  const signOut = useCallback(async () => {
    clearTimers()
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/authority/register?expired=1')
  }, [router])

  const resetTimers = useCallback(() => {
    if (!enabled) return
    clearTimers()
    setShowWarning(false)
    setMinutesRemaining(5)

    expiresAtRef.current = Date.now() + IDLE_TIMEOUT_MS

    warnRef.current = setTimeout(() => {
      setShowWarning(true)
      setMinutesRemaining(5)
      countdownRef.current = setInterval(() => {
        const remaining = Math.ceil((expiresAtRef.current - Date.now()) / 60_000)
        setMinutesRemaining(Math.max(0, remaining))
      }, 30_000)
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS)

    idleRef.current = setTimeout(() => {
      signOut()
    }, IDLE_TIMEOUT_MS)
  }, [enabled, signOut])

  useEffect(() => {
    if (!enabled) return
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'] as const
    const onActivity = () => resetTimers()
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    resetTimers()
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
      clearTimers()
    }
  }, [enabled, resetTimers])

  return { showWarning, minutesRemaining, resetTimers, signOut }
}

export function IdleTimeoutWarning({
  minutesRemaining,
  onStaySignedIn,
  onSignOut,
}: {
  minutesRemaining: number
  onStaySignedIn: () => void
  onSignOut: () => void
}) {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  }
  const boxStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '440px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  }

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="idle-title">
      <div style={boxStyle}>
        <h2 id="idle-title" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
          Session expiring soon
        </h2>
        <p style={{ color: '#4a5568', marginBottom: '24px', lineHeight: 1.6 }}>
          You&apos;ve been inactive for a while. For security, your session will expire
          in <strong>{minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''}</strong>.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onStaySignedIn}
            style={{
              flex: 1,
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--pf-blue-700, #1d4ed8)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Stay signed in
          </button>
          <button
            onClick={onSignOut}
            style={{
              flex: 1,
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              color: '#4a5568',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
