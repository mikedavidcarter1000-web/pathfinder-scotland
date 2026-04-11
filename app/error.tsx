'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'
import { classifyError } from '@/lib/errors'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const classified = classifyError(error)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--pf-teal-50)' }}
    >
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <ErrorState
          title={classified.title}
          message={classified.message}
          retryAction={reset}
          backLink={{ href: '/', label: 'Back to home' }}
        />
      </div>
    </div>
  )
}
