'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthError } from '@/lib/errors'
import { useToast } from '@/components/ui/toast'

/**
 * Watches one or more React Query errors and, if any of them look like an
 * auth / session-expired failure, redirects the user to /auth/sign-in with
 * a friendly toast. Safe to call on every page that relies on authenticated
 * data — it only acts once per mount.
 */
export function useAuthErrorRedirect(errors: Array<unknown>) {
  const router = useRouter()
  const toast = useToast()
  const redirected = useRef(false)

  useEffect(() => {
    if (redirected.current) return
    const authBroken = errors.some((e) => e && isAuthError(e))
    if (authBroken) {
      redirected.current = true
      toast.error(
        'Session expired',
        'Your session has expired. Please sign in again.'
      )
      const currentPath =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/'
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(currentPath)}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors])
}
