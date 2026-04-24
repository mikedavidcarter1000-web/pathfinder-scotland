'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type OpenEvening = {
  id: string
  name: string
  event_date: string
  booking_closes_at: string | null
  school: { name: string } | null
}

// Small card shown on the parent dashboard when an open parents' evening
// exists at the child's school. Silent when there isn't one.
export function ParentEveningCard({ studentId }: { studentId: string }) {
  const [evening, setEvening] = useState<OpenEvening | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/parent/parents-evening/open?student_id=${studentId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.evening) setEvening(d.evening)
        else setEvening(null)
      })
      .catch(() => setEvening(null))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading || !evening) return null

  return (
    <div
      className="pf-card"
      style={{ background: '#f0f9ff', borderLeft: '4px solid #0284c7' }}
    >
      <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>Parents&apos; evening</h3>
      <div style={{ fontSize: '0.9rem' }}>
        <strong>{evening.name}</strong> at {evening.school?.name ?? 'the school'} &mdash; {new Date(evening.event_date).toLocaleDateString('en-GB')}
      </div>
      {evening.booking_closes_at && (
        <div style={{ fontSize: '0.8125rem', color: '#374151', marginTop: 4 }}>
          Bookings close {new Date(evening.booking_closes_at).toLocaleString('en-GB')}.
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <Link
          href={`/parent/parents-evening/${evening.id}?student_id=${studentId}`}
          className="pf-btn-primary"
          style={{ display: 'inline-block' }}
        >
          Book appointments
        </Link>
      </div>
    </div>
  )
}
