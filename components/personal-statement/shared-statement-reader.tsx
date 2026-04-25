'use client'

import { useEffect, useState } from 'react'
import { FeedbackSection, useFeedback, unresolvedCountByQuestion } from './feedback-section'

type SharedDraftPayload = {
  viewerRole: 'student' | 'guidance' | 'parent' | 'admin'
  student: {
    id: string
    firstName: string | null
    lastName: string | null
    schoolStage: string | null
  }
  draft: {
    id: string
    q1: string
    q2: string
    q3: string
    lastSavedAt: string
    createdAt: string
    sharedWithSchool: boolean
    sharedWithParent: boolean
  }
}

const QUESTIONS: { num: 1 | 2 | 3; label: string }[] = [
  { num: 1, label: 'Q1: Why are you applying for this course?' },
  { num: 2, label: 'Q2: How have your qualifications and studies prepared you?' },
  { num: 3, label: 'Q3: What else have you done to prepare outside school?' },
]

export function SharedStatementReader({ studentId }: { studentId: string }) {
  const [payload, setPayload] = useState<SharedDraftPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/personal-statement/shared/${studentId}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(json.error ?? 'Could not load draft')
        }
        return (await res.json()) as SharedDraftPayload
      })
      .then((p) => {
        if (!cancelled) setPayload(p)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [studentId])

  const draftId = payload?.draft.id ?? null
  const { feedback, reload } = useFeedback(draftId)

  if (loading) return <p style={{ padding: '20px' }}>Loading…</p>
  if (error) {
    return (
      <div className="pf-card" style={{ padding: '16px' }}>
        <p style={{ color: 'var(--pf-red-500)' }}>{error}</p>
      </div>
    )
  }
  if (!payload) {
    return (
      <div className="pf-card" style={{ padding: '16px' }}>
        <p style={{ color: 'var(--pf-grey-700)' }}>No statement to display.</p>
      </div>
    )
  }

  const { viewerRole, student, draft } = payload
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Student'

  return (
    <div className="pf-container" style={{ paddingTop: '20px', paddingBottom: '40px', maxWidth: '900px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ marginBottom: '4px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          {fullName} — personal statement
        </h1>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
          Last saved {new Date(draft.lastSavedAt).toLocaleString('en-GB')}.{' '}
          {viewerRole === 'guidance'
            ? 'You can leave anchored or general comments. The student will be notified.'
            : viewerRole === 'parent'
            ? 'You can leave anchored or general comments. Remember, this is your child’s statement — offer encouragement and suggestions, but the words must be theirs.'
            : 'Read-only view.'}
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {QUESTIONS.map((q) => {
          const text = q.num === 1 ? draft.q1 : q.num === 2 ? draft.q2 : draft.q3
          const unresolved = unresolvedCountByQuestion(feedback, q.num)
          return (
            <section
              key={q.num}
              className="pf-card"
              style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                <h2 style={{ fontSize: '1.0625rem', margin: 0 }}>{q.label}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                  {text.length.toLocaleString()} characters
                  {unresolved > 0 ? ` · ${unresolved} unresolved` : ''}
                </span>
              </div>
              <FeedbackSection
                draftId={draftId}
                questionNumber={q.num}
                questionText={text}
                feedback={feedback}
                viewerRole={viewerRole}
                onChange={reload}
                textSelectionEnabled={true}
              />
            </section>
          )
        })}
      </div>
    </div>
  )
}
