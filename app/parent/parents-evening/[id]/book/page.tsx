'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { ParentEveningBookingUI, type ParentEveningData } from '@/components/parent-evening/booking-ui'

type Data = ParentEveningData & {
  student: (NonNullable<ParentEveningData['student']> & { id: string }) | null
}

export default function TokenBookingPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const id = params?.id ?? ''
  const token = searchParams?.get('token') ?? ''
  const toast = useToast()
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)

  const studentId = useMemo(() => data?.student?.id ?? null, [data])
  const studentName = useMemo(
    () => (data?.student ? `${data.student.first_name ?? ''} ${data.student.last_name ?? ''}`.trim() : ''),
    [data]
  )

  const load = useCallback(async () => {
    if (!token) {
      setError('No booking token supplied.')
      return
    }
    const res = await fetch(`/api/parents-evening/token/${id}?token=${encodeURIComponent(token)}`)
    const d = await res.json()
    if (!res.ok) {
      setError(d.error ?? 'Could not load.')
      return
    }
    setData(d)
  }, [id, token])

  useEffect(() => {
    load()
  }, [load])

  const fetchData = useCallback(async (_studentId: string) => {
    const res = await fetch(`/api/parents-evening/token/${id}?token=${encodeURIComponent(token)}`)
    const d = await res.json()
    if (!res.ok) throw new Error(d.error ?? 'Failed to load')
    return d as Data
  }, [id, token])

  const book = useCallback(
    async (_studentId: string, staffId: string, slotTime: string) => {
      const res = await fetch(`/api/parents-evening/token/${id}?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId, slot_time: slotTime }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Booking failed')
      toast.success('Booked.')
    },
    [id, token, toast]
  )

  if (error) {
    return (
      <div className="pf-container pt-8 pb-12" style={{ maxWidth: 680 }}>
        <h1>Booking link issue</h1>
        <p>{error}</p>
        <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>If you have received a school-issued booking link, try opening it directly. If you have a Pathfinder account, you can also <Link href="/auth/sign-in">sign in</Link> and book from the parent dashboard.</p>
      </div>
    )
  }

  if (!data || !studentId) {
    return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  }

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 1100 }}>
      <ParentEveningBookingUI
        studentId={studentId}
        studentName={studentName}
        fetchData={fetchData}
        book={book}
        tokenBased={true}
      />
    </div>
  )
}
