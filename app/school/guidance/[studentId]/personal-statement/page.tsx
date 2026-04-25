'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { SharedStatementReader } from '@/components/personal-statement/shared-statement-reader'

export default function GuidancePersonalStatementPage() {
  const params = useParams<{ studentId: string }>()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/guidance/${params.studentId}/personal-statement`)
    }
  }, [user, isLoading, router, params.studentId])

  if (isLoading || !user) return <p style={{ padding: 24 }}>Loading…</p>

  return (
    <div className="pf-container" style={{ paddingTop: 16 }}>
      <Link
        href={`/school/guidance/${params.studentId}`}
        style={{ color: '#0059b3', fontSize: 14 }}
      >
        ← Back to student profile
      </Link>
      <SharedStatementReader studentId={params.studentId} />
    </div>
  )
}
