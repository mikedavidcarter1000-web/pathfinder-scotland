'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { SHANARRI_INDICATORS } from '@/lib/school/shanarri'

type Survey = {
  id: string
  name: string
  is_anonymous: boolean | null
}

const SCORE_OPTIONS = [
  { value: 1, label: 'Strongly disagree', emoji: '😞' },
  { value: 2, label: 'Disagree', emoji: '🙁' },
  { value: 3, label: 'Neither', emoji: '😐' },
  { value: 4, label: 'Agree', emoji: '🙂' },
  { value: 5, label: 'Strongly agree', emoji: '😃' },
]

export default function StudentWellbeingSurveyPage() {
  const params = useParams<{ surveyId: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [scores, setScores] = useState<Record<string, number | null>>({
    safe: null, healthy: null, achieving: null, nurtured: null,
    active: null, respected: null, responsible: null, included: null,
  })
  const [freeText, setFreeText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/wellbeing/${params.surveyId}`)
      return
    }
    // Use the student-list route to find this survey and confirm it's open.
    fetch('/api/student/wellbeing/surveys')
      .then((r) => (r.ok ? r.json() : { surveys: [] }))
      .then((d) => {
        const match = (d.surveys ?? []).find((s: Survey) => s.id === params.surveyId)
        if (match) setSurvey(match)
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router, params.surveyId])

  async function handleSubmit() {
    setError('')
    // All 8 indicators required
    for (const ind of SHANARRI_INDICATORS) {
      if (!scores[ind.key]) {
        setError('Please answer every question before submitting.')
        return
      }
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/student/wellbeing/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: params.surveyId,
          scores,
          free_text: freeText.trim() || null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Submission failed' }))
        throw new Error(body.error ?? 'Submission failed')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>
  if (!survey) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
        <h1>Survey not available</h1>
        <p>This survey isn&apos;t open for you at the moment, or it doesn&apos;t target your year group.</p>
        <Link href="/dashboard" style={{ color: '#0059b3' }}>&larr; Back to dashboard</Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 28 }}>Thank you!</h1>
        <p style={{ fontSize: 17 }}>Your responses have been submitted. Your school will use the combined results from all students to understand how to support you.</p>
        {!survey.is_anonymous && (
          <p style={{ fontSize: 14, color: '#555' }}>
            Your guidance teacher can see your responses. If you&apos;d like to talk to someone, please speak to your guidance teacher or a trusted adult.
          </p>
        )}
        <Link href="/dashboard" style={{ color: '#0059b3' }}>&larr; Back to dashboard</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, margin: '0 0 4px 0' }}>How are you feeling?</h1>
      <p style={{ fontSize: 16, color: '#444', marginBottom: 12 }}>
        This short check helps your school understand how students are doing. There are no right or wrong answers. It takes about 3 minutes.
      </p>
      <div
        style={{
          padding: 12,
          background: survey.is_anonymous ? '#e0f2fe' : '#fef3c7',
          borderRadius: 6,
          fontSize: 14,
          marginBottom: 20,
          color: '#1f2937',
        }}
      >
        {survey.is_anonymous
          ? 'Your responses are anonymous — no one will know which answers are yours.'
          : 'Your responses will be shared with your guidance teacher to help them support you. If you share something that suggests you or someone else might be at risk, your school will follow its safeguarding procedures.'}
      </div>

      {error && (
        <div style={{ padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 4, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {SHANARRI_INDICATORS.map((ind) => (
        <fieldset key={ind.key} style={{ border: '1px solid #e5e5e5', borderRadius: 6, padding: 16, marginBottom: 12 }}>
          <legend style={{ fontWeight: 600, padding: '0 6px' }}>{ind.label}</legend>
          <p style={{ margin: '4px 0 12px 0', fontSize: 15 }}>{ind.prompt}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SCORE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                style={{
                  flex: '1 1 110px',
                  padding: 10,
                  border: '1px solid ' + (scores[ind.key] === opt.value ? '#0059b3' : '#d0d0d0'),
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: scores[ind.key] === opt.value ? '#e0f2fe' : '#fff',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24 }}>{opt.emoji}</div>
                <div style={{ fontSize: 12, marginTop: 2 }}>{opt.label}</div>
                <input
                  type="radio"
                  name={ind.key}
                  value={opt.value}
                  checked={scores[ind.key] === opt.value}
                  onChange={() => setScores((prev) => ({ ...prev, [ind.key]: opt.value }))}
                  style={{ display: 'none' }}
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <label style={{ display: 'block', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          Is there anything else you&apos;d like to share? (optional)
        </div>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value.slice(0, 500))}
          rows={4}
          maxLength={500}
          style={{ width: '100%', padding: 8, border: '1px solid #d0d0d0', borderRadius: 4, fontSize: 14, fontFamily: 'inherit' }}
        />
        <div style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>{freeText.length} / 500</div>
      </label>

      {!survey.is_anonymous && (
        <p style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
          If you&apos;re struggling with something and need help, please speak to your guidance teacher or a trusted adult.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          padding: '12px 24px',
          fontSize: 16,
          background: '#0059b3',
          color: '#fff',
          border: '1px solid #0059b3',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit my responses'}
      </button>
    </div>
  )
}
