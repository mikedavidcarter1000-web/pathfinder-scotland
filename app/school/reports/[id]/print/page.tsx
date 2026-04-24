'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export default function PrintReportPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/reports/${params?.id}/print`)
      return
    }
    const id = params?.id
    if (!id) return
    fetch(`/api/school/reports/${id}/preview`)
      .then((r) => r.json())
      .then((d) => setHtml(d.html ?? ''))
      .finally(() => setLoading(false))
  }, [authLoading, user, router, params])

  if (loading) return <div style={{ padding: 40 }}>Loading report…</div>
  if (!html) return <div style={{ padding: 40 }}>Could not load this report.</div>

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      <div className="pf-no-print" style={{ padding: 12, background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Use your browser&apos;s print (Ctrl+P / &#8984;P) and select &quot;Save as PDF&quot;.
        </span>
        <button
          onClick={() => window.print()}
          style={{ padding: '8px 14px', background: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
        >
          Print / Save PDF
        </button>
      </div>
      <div style={{ padding: 20 }} dangerouslySetInnerHTML={{ __html: html }} />
      <style jsx global>{`
        @media print {
          .pf-no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}
