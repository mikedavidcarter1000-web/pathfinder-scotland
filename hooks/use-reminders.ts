import { useCallback, useRef } from 'react'

const DEBOUNCE_KEY = 'pf_reminders_last_generated'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * Returns a function that triggers reminder generation for the current user.
 * Debounced to at most once per calendar day (stored in localStorage).
 */
export function useGenerateReminders() {
  const inflight = useRef(false)

  const generate = useCallback(async () => {
    if (inflight.current) return
    if (typeof window === 'undefined') return

    // Debounce: skip if already generated today
    const lastRun = localStorage.getItem(DEBOUNCE_KEY)
    if (lastRun) {
      const elapsed = Date.now() - parseInt(lastRun, 10)
      if (elapsed < ONE_DAY_MS) return
    }

    inflight.current = true
    try {
      const res = await fetch('/api/reminders/generate', { method: 'POST' })
      if (res.ok) {
        localStorage.setItem(DEBOUNCE_KEY, String(Date.now()))
      }
    } catch {
      // Non-critical — silently ignore network errors
    } finally {
      inflight.current = false
    }
  }, [])

  // Force variant that bypasses the daily debounce (for onboarding / settings save)
  const generateNow = useCallback(async () => {
    if (inflight.current) return
    inflight.current = true
    try {
      const res = await fetch('/api/reminders/generate', { method: 'POST' })
      if (res.ok) {
        localStorage.setItem(DEBOUNCE_KEY, String(Date.now()))
      }
    } catch {
      // Non-critical
    } finally {
      inflight.current = false
    }
  }, [])

  return { generate, generateNow }
}
