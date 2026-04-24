'use client'

import { Suspense } from 'react'
import { SubjectChoiceWorksheetClient } from './subject-choice-worksheet-client'

export default function SubjectChoiceWorksheetPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SubjectChoiceWorksheetClient />
    </Suspense>
  )
}

function PageLoading() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh', padding: '64px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="pf-skeleton" style={{ width: '60%', height: '40px', borderRadius: '8px', marginBottom: '16px' }} />
        <div className="pf-skeleton" style={{ width: '80%', height: '20px', borderRadius: '8px', marginBottom: '32px' }} />
        <div className="pf-skeleton" style={{ width: '100%', height: '320px', borderRadius: '8px' }} />
      </div>
    </div>
  )
}
