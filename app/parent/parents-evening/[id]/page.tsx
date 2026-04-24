'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useLinkedChildren } from '@/hooks/use-parent-link'
import { useToast } from '@/components/ui/toast'
import { ParentEveningBookingUI } from '@/components/parent-evening/booking-ui'

export default function ParentEveningBookingPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = params?.id ?? ''
  const router = useRouter()
  const { user, parent, isLoading: authLoading } = useAuth()
  const { data: children } = useLinkedChildren()
  const toast = useToast()

  const initialChildId = searchParams?.get('student_id') ?? null
  const [selectedChildId, setSelectedChildId] = useState<string | null>(initialChildId)

  useEffect(() => {
    if (authLoading) return
    if (!user || !parent) {
      router.replace(`/auth/sign-in?redirect=/parent/parents-evening/${id}`)
      return
    }
    if (!selectedChildId && children && children.length > 0) setSelectedChildId(children[0].student_id)
  }, [authLoading, user, parent, router, id, children, selectedChildId])

  const child = useMemo(() => (children ?? []).find((c) => c.student_id === selectedChildId) ?? null, [children, selectedChildId])

  const fetchData = useCallback(
    async (studentId: string) => {
      const res = await fetch(`/api/parent/parents-evening/${id}?student_id=${studentId}`)
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Failed to load')
      return d
    },
    [id]
  )

  const book = useCallback(
    async (studentId: string, staffId: string, slotTime: string) => {
      const res = await fetch(`/api/parent/parents-evening/${id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, staff_id: staffId, slot_time: slotTime }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Booking failed')
      toast.success('Booking confirmed.')
    },
    [id, toast]
  )

  const cancel = useCallback(
    async (bookingId: string) => {
      const res = await fetch(`/api/parent/parents-evening/${id}/bookings/${bookingId}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Cancel failed')
      toast.success('Booking cancelled.')
    },
    [id, toast]
  )

  if (authLoading || !user || !parent) {
    return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  }

  if (!children || children.length === 0) {
    return (
      <div className="pf-container pt-8 pb-12" style={{ maxWidth: 700 }}>
        <h1>Parent evening booking</h1>
        <p>You&apos;re not linked to any children yet. <Link href="/parent/join">Enter an invite code</Link> to get started.</p>
      </div>
    )
  }

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/parent/dashboard" style={{ fontSize: '0.875rem' }}>&larr; Dashboard</Link>
      </div>

      {children.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {children.map((c) => (
            <button
              key={c.student_id}
              onClick={() => setSelectedChildId(c.student_id)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: `1px solid ${selectedChildId === c.student_id ? '#1B3A5C' : '#cbd5e1'}`,
                background: selectedChildId === c.student_id ? '#1B3A5C' : 'white',
                color: selectedChildId === c.student_id ? 'white' : '#1B3A5C',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.8125rem',
              }}
            >
              {c.first_name || c.email}
            </button>
          ))}
        </div>
      )}

      {child && (
        <ParentEveningBookingUI
          key={child.student_id}
          studentId={child.student_id}
          studentName={`${child.first_name ?? ''} ${child.last_name ?? ''}`.trim() || child.email}
          fetchData={fetchData}
          book={book}
          cancel={cancel}
        />
      )}
    </div>
  )
}
