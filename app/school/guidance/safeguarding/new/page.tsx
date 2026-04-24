'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type Staff = { id: string; full_name: string; role: string }

const CONCERN_TYPES = [
  { value: 'disclosure', label: 'Disclosure from student' },
  { value: 'observed_behaviour', label: 'Observed behaviour' },
  { value: 'third_party_report', label: 'Third-party report' },
  { value: 'online_safety', label: 'Online safety' },
  { value: 'self_harm_risk', label: 'Self-harm risk' },
  { value: 'domestic', label: 'Domestic concern' },
  { value: 'neglect', label: 'Neglect' },
  { value: 'bullying', label: 'Bullying' },
  { value: 'substance_misuse', label: 'Substance misuse' },
  { value: 'other', label: 'Other' },
]

const ESCALATION_LEVELS = [
  { value: 'concern', label: 'Log as concern only' },
  { value: 'escalated_pt', label: 'Escalate to PT Guidance' },
  { value: 'escalated_dht', label: 'Escalate to Depute Head' },
  { value: 'escalated_named_person', label: 'Escalate to Named Person' },
  { value: 'referral_social_work', label: 'Refer to Social Work' },
  { value: 'referral_police', label: 'Refer to Police' },
]

export default function NewConcernPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const studentId = searchParams.get('student') ?? ''

  const [studentName, setStudentName] = useState('')
  const [concernType, setConcernType] = useState('disclosure')
  const [description, setDescription] = useState('')
  const [immediate, setImmediate] = useState('')
  const [escalation, setEscalation] = useState('concern')
  const [escalatedTo, setEscalatedTo] = useState('')
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/guidance/safeguarding/new?student=${studentId}`)
      return
    }
    if (studentId) {
      fetch(`/api/school/guidance/student/${studentId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.student) setStudentName(`${d.student.firstName ?? ''} ${d.student.lastName ?? ''}`.trim())
        })
    }
    fetch('/api/school/staff').then((r) => (r.ok ? r.json() : { staff: [] })).then((d) => setStaffList(d.staff ?? []))
  }, [authLoading, user, router, studentId])

  async function handleSubmit() {
    setError('')
    if (description.trim().length < 50) {
      setError('Description must be at least 50 characters.')
      return
    }
    if (escalation !== 'concern' && !escalatedTo) {
      setError('Select a staff member to escalate to.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/school/guidance/safeguarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          concern_type: concernType,
          description: description.trim(),
          immediate_actions_taken: immediate || null,
          escalation_level: escalation,
          escalated_to: escalation !== 'concern' ? escalatedTo : null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Submission failed' }))
        throw new Error(body.error ?? 'Submission failed')
      }
      const body = await res.json()
      setSavedId(body.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!studentId) {
    return (
      <div style={{ padding: 32 }}>
        <p>Missing student reference.</p>
        <Link href="/school/guidance">&larr; Back to Guidance Hub</Link>
      </div>
    )
  }

  if (savedId) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 22 }}>Concern logged</h1>
        <p style={{ fontSize: 15 }}>
          The concern has been recorded and {escalation === 'concern' ? 'is visible to safeguarding-permitted staff.' : 'an escalation notification has been sent.'}
        </p>
        <p style={{ fontSize: 13, color: '#666' }}>Reference: {savedId.slice(0, 8)}</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Link href={`/school/guidance/${studentId}`} style={{ color: '#0059b3' }}>
            Return to student profile
          </Link>
          <Link href="/school/guidance/safeguarding" style={{ color: '#0059b3' }}>
            Safeguarding log
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <Link href={`/school/guidance/${studentId}`} style={{ color: '#0059b3', fontSize: 14 }}>
        &larr; Back to student profile
      </Link>
      <h1 style={{ fontSize: 24, margin: '8px 0 4px 0' }}>Raise a safeguarding concern</h1>
      <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>For {studentName || 'selected student'}</div>

      {error && (
        <div style={{ padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 4, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <label style={label}>
        <div style={labelText}>Concern type</div>
        <select value={concernType} onChange={(e) => setConcernType(e.target.value)} style={input}>
          {CONCERN_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label style={label}>
        <div style={labelText}>Description (minimum 50 characters)</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          style={{ ...input, fontFamily: 'inherit' }}
          placeholder="Record exactly what was said, seen, or reported. Use the student's own words where possible."
        />
        <div style={{ fontSize: 12, color: description.length < 50 ? '#dc2626' : '#666', marginTop: 2 }}>
          {description.length} characters
        </div>
      </label>

      <label style={label}>
        <div style={labelText}>Immediate actions taken (optional)</div>
        <textarea
          value={immediate}
          onChange={(e) => setImmediate(e.target.value)}
          rows={3}
          style={{ ...input, fontFamily: 'inherit' }}
          placeholder="e.g. reassured the student, informed PT Guidance, pulled the young person from their next period"
        />
      </label>

      <fieldset style={{ border: '1px solid #e5e5e5', padding: 12, margin: '12px 0', borderRadius: 4 }}>
        <legend style={{ fontSize: 13, fontWeight: 600 }}>Escalation</legend>
        {ESCALATION_LEVELS.map((e) => (
          <label key={e.value} style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
            <input
              type="radio"
              name="escalation"
              value={e.value}
              checked={escalation === e.value}
              onChange={() => setEscalation(e.value)}
              style={{ marginRight: 6 }}
            />
            {e.label}
          </label>
        ))}
      </fieldset>

      {escalation !== 'concern' && (
        <label style={label}>
          <div style={labelText}>Escalate to</div>
          <select value={escalatedTo} onChange={(e) => setEscalatedTo(e.target.value)} style={input}>
            <option value="">Select staff member</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.role})
              </option>
            ))}
          </select>
        </label>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Link
          href={`/school/guidance/${studentId}`}
          style={{ ...secondaryButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Cancel
        </Link>
        <button onClick={handleSubmit} disabled={submitting} style={primaryButton}>
          {submitting ? 'Submitting...' : 'Submit concern'}
        </button>
      </div>
    </div>
  )
}

const label: React.CSSProperties = { display: 'flex', flexDirection: 'column' as const, marginBottom: 12 }
const labelText: React.CSSProperties = { fontSize: 13, fontWeight: 500, marginBottom: 4 }
const input: React.CSSProperties = { padding: '6px 10px', border: '1px solid #d0d0d0', borderRadius: 4, fontSize: 14 }
const primaryButton: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 14,
  background: '#0059b3',
  color: '#fff',
  border: '1px solid #0059b3',
  borderRadius: 4,
  cursor: 'pointer',
}
const secondaryButton: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 14,
  background: '#fff',
  border: '1px solid #d0d0d0',
  borderRadius: 4,
  color: '#333',
}
