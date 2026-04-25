'use client'

// Authority-3: client wrapper that mounts the idle-timeout hook for any
// /authority/** route. Authority staff see real LA data so an 8-hour
// inactivity sign-out matches the security expectations called out in
// the architecture spec; the hook itself was built in Authority-2 but
// was not wired anywhere.

import { useIdleTimeout, IdleTimeoutWarning } from '@/hooks/use-idle-timeout'
import { useAuth } from '@/hooks/use-auth'

export function AuthorityShell({ children }: { children: React.ReactNode }) {
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
