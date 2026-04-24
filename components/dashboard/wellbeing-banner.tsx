'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type OpenSurvey = {
  id: string
  name: string
  is_anonymous: boolean | null
  alreadySubmitted: boolean
}

export function WellbeingBanner() {
  const [surveys, setSurveys] = useState<OpenSurvey[]>([])

  useEffect(() => {
    fetch('/api/student/wellbeing/surveys')
      .then((r) => (r.ok ? r.json() : { surveys: [] }))
      .then((d) => setSurveys(d.surveys ?? []))
      .catch(() => setSurveys([]))
  }, [])

  const pending = surveys.filter((s) => !s.alreadySubmitted)
  if (pending.length === 0) return null

  const first = pending[0]

  return (
    <div
      style={{
        padding: '14px 18px',
        background: '#e0f2fe',
        border: '1px solid #bae6fd',
        borderRadius: 8,
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <strong style={{ fontSize: 15 }}>
          Your school has asked you to complete a wellbeing check.
        </strong>
        <div style={{ fontSize: 13, color: '#075985', marginTop: 2 }}>
          It takes about 3 minutes. {pending.length > 1 ? `There are ${pending.length} waiting for you.` : ''}
        </div>
      </div>
      <Link
        href={`/wellbeing/${first.id}`}
        style={{
          padding: '8px 16px',
          background: '#0369a1',
          color: '#fff',
          borderRadius: 4,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Complete now &rarr;
      </Link>
    </div>
  )
}
