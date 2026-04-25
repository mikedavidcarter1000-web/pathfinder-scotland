'use client'

// Authority-15: client wrapper for /national/** routes. Mounts the same
// 8-hour idle timeout used by the LA portal -- national staff handle the
// most sensitive cross-LA aggregates so the same auto-signout posture
// applies.

import { useIdleTimeout, IdleTimeoutWarning } from '@/hooks/use-idle-timeout'
import { useAuth } from '@/hooks/use-auth'

export function NationalShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const enabled = !!user && !isLoading
  const { showWarning, minutesRemaining, resetTimers, signOut } = useIdleTimeout(enabled)

  return (
    <>
      {children}
      {showWarning && (
        <IdleTimeoutWarning
          minutesRemaining={minutesRemaining}
          onStaySignedIn={resetTimers}
          onSignOut={signOut}
        />
      )}
    </>
  )
}
