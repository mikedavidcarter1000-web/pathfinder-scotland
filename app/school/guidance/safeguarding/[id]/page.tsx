'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type ConcernDetail = {
  id: string
  student_id: string
  concern_type: string
  description: string
  immediate_actions_taken: string | null
  escalation_level: string
  escalated_at: string | null
  outcome: string | null
  resolved_at: string | null
  created_at: string
  supersedes_id: string | null
  students: { first_name: string | null; last_name: string | null; school_stage: string | null; registration_class: string | null } | null
  reporter: { full_name: string; role: string } | null
  escalated_to_staff: { full_name: string; role: string } | null
}

type AccessLogRow = {
  id: string
  action: 'viewed' | 'created' | 'escalated' | 'exported'
  accessed_at: string
  school_staff: { full_name: string; role: string } | null
}

const ESCALATION_FLOW = [
  { key: 'concern', label: 'Logged' },
  { key: 'escalated_pt', label: 'PT Guidance' },
  { key: 'escalated_dht', label: 'Depute' },
  { key: 'escalated_named_person', label: 'Named Person' },
  { key: 'referral_social_work', label: 'Social Work' },
  { key: 'referral_police', label: 'Police' },
]

export default function ConcernDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [concern, setConcern] = useState<ConcernDetail | null>(null)
  const [log, setLog] = useState<AccessLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/guidance/safeguarding/${params.id}`)
      return
    }
    fetch(`/api/school/guidance/safeguarding/${params.id}`)
      .then(async (r) => {
        if (r.status === 403) {
          setDenied(true)
          return null
        }
        return r.ok ? r.json() : null
      })
      .then((d) => {
        if (d) {
          setConcern(d.concern)
          setLog(d.access_log ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router, params.id])

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>
  if (denied) return <div style={{ padding: 32 }}>Access denied. Safeguarding records require the can_view_safeguarding permission.</div>
  if (!concern) return <div style={{ padding: 32 }}>Concern not found.</div>

  const studentName = `${concern.students?.first_name ?? ''} ${concern.students?.last_name ?? ''}`.trim()
  const reachedIndex = ESCALATION_FLOW.findIndex((e) => e.key === concern.escalation_level)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Link href="/school/guidance/safeguarding" style={{ color: '#0059b3', fontSize: 14 }}>
        &larr; Back to safeguarding log
      </Link>
      <h1 style={{ fontSize: 24, margin: '6px 0 4px 0' }}>
        {concern.concern_type} &mdash; {studentName}
      </h1>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        Logged {new Date(concern.created_at).toLocaleString('en-GB')} by {concern.reporter?.full_name ?? 'Unknown'} ({concern.reporter?.role ?? '-'})
      </div>

      {/* Escalation flow */}
      <section style={card}>
        <h2 style={cardHeader}>Escalation</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {ESCALATION_FLOW.map((step, i) => {
            const reached = i <= reachedIndex
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    background: reached ? '#dc2626' : '#f3f4f6',
                    color: reached ? '#fff' : '#666',
                    fontWeight: reached ? 600 : 400,
                  }}
                >
                  {step.label}
                </span>
                {i < ESCALATION_FLOW.length - 1 && (
                  <span style={{ margin: '0 4px', color: reached ? '#dc2626' : '#ccc' }}>&rarr;</span>
                )}
              </div>
            )
          })}
        </div>
        {concern.escalated_to_staff && (
          <div style={{ fontSize: 13, marginTop: 8 }}>
            Escalated to: <strong>{concern.escalated_to_staff.full_name}</strong> ({concern.escalated_to_staff.role})
          </div>
        )}
        {concern.escalated_at && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Escalated {new Date(concern.escalated_at).toLocaleString('en-GB')}
          </div>
        )}
      </section>

      <section style={card}>
        <h2 style={cardHeader}>Description</h2>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{concern.description}</div>
      </section>

      {concern.immediate_actions_taken && (
        <section style={card}>
          <h2 style={cardHeader}>Immediate actions taken</h2>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{concern.immediate_actions_taken}</div>
        </section>
      )}

      {concern.outcome && (
        <section style={card}>
          <h2 style={cardHeader}>Outcome</h2>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{concern.outcome}</div>
        </section>
      )}

      {concern.resolved_at && (
        <section style={card}>
          <h2 style={cardHeader}>Resolved</h2>
          <div style={{ fontSize: 14 }}>{new Date(concern.resolved_at).toLocaleString('en-GB')}</div>
        </section>
      )}

      <section style={{ ...card, background: '#f9fafb' }}>
        <h2 style={cardHeader}>Access log ({log.length})</h2>
        {log.length === 0 ? (
          <div style={{ color: '#666', fontSize: 13 }}>No access recorded yet.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
            {log.slice(0, 20).map((l) => (
              <li key={l.id}>
                {new Date(l.accessed_at).toLocaleString('en-GB')} &mdash; {l.action} by{' '}
                {l.school_staff?.full_name ?? 'Unknown'} ({l.school_staff?.role ?? '-'})
              </li>
            ))}
          </ul>
        )}
      </section>

      <div style={{ marginTop: 16 }}>
        <a
          href={`/api/school/guidance/safeguarding/export?student_id=${concern.student_id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#0059b3' }}
        >
          Export full CP file for this student &rarr;
        </a>
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  padding: 12,
  marginBottom: 12,
  background: '#fff',
}
const cardHeader: React.CSSProperties = { fontSize: 15, margin: '0 0 8px 0' }
