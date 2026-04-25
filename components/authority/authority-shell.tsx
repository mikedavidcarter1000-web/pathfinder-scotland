'use client'

// Authority-3: client wrapper that mounts the idle-timeout hook for any
// /authority/** route. Authority staff see real LA data so an 8-hour
// inactivity sign-out matches the security expectations called out in
// the architecture spec; the hook itself was built in Authority-2 but
// was not wired anywhere.
//
// Authority-13 also mounts the AuthorityAlertBell here as a fixed-position
// element so every /authority/** route gets the same alert badge.

import { useIdleTimeout, IdleTimeoutWarning } from '@/hooks/use-idle-timeout'
import { useAuth } from '@/hooks/use-auth'
import { AuthorityAlertBell } from '@/components/authority/alert-bell'

export function AuthorityShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const enabled = !!user && !isLoading
  const { showWarning, minutesRemaining, resetTimers, signOut } = useIdleTimeout(enabled)

  return (
    <>
      {enabled && <AuthorityAlertBell />}
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
