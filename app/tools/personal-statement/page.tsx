'use client'

import { Suspense, useEffect } from 'react'
import { FeedbackWidget } from '@/components/ui/feedback-widget'
import { PersonalStatementClient } from './personal-statement-client'
import { trackEngagement } from '@/lib/engagement/track'

export default function PersonalStatementPage() {
  useEffect(() => {
    trackEngagement('tool_use', 'personal_statement', 'started')
  }, [])
  return (
    <>
      <Suspense fallback={<PageLoading />}>
        <PersonalStatementClient />
      </Suspense>
      <div className="no-print">
        <FeedbackWidget />
      </div>
    </>
  )
}

function PageLoading() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh', padding: '64px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div
          style={{
            height: '40px',
            backgroundColor: 'var(--pf-grey-200)',
            borderRadius: '6px',
            marginBottom: '16px',
            width: '55%',
          }}
        />
        <div
          style={{
            height: '20px',
            backgroundColor: 'var(--pf-grey-100)',
            borderRadius: '6px',
            marginBottom: '32px',
            width: '75%',
          }}
        />
        <div style={{ height: '400px', backgroundColor: 'var(--pf-grey-100)', borderRadius: '8px' }} />
      </div>
    </div>
  )
}
