'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type DraftPayload = {
  id: string
  q1: string
  q2: string
  q3: string
  lastSavedAt: string
  sharedWithSchool: boolean
  sharedWithParent: boolean
}

type FeedbackRow = { is_resolved: boolean }

const MIN_PER_QUESTION = 350

export function PersonalStatementCard() {
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<DraftPayload | null>(null)
  const [unresolvedCount, setUnresolvedCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch('/api/personal-statement/drafts', { cache: 'no-store' })
        if (!res.ok) {
          if (!cancelled) setDraft(null)
          return
        }
        const json = (await res.json()) as { authenticated: boolean; draft: DraftPayload | null }
        if (cancelled) return
        if (!json.draft) {
          setDraft(null)
          return
        }
        setDraft(json.draft)
        const fbRes = await fetch(`/api/personal-statement/feedback?draftId=${json.draft.id}`, {
          cache: 'no-store',
        })
        if (fbRes.ok) {
          const fbJson = (await fbRes.json()) as { feedback: FeedbackRow[] }
          if (!cancelled) {
            setUnresolvedCount(fbJson.feedback.filter((f) => !f.is_resolved).length)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return null

  if (!draft) {
    return (
      <Link
        href="/tools/personal-statement"
        className="pf-card-hover no-underline hover:no-underline flex items-center gap-4"
        style={{ padding: '20px 24px', textDecoration: 'none' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: 'var(--pf-blue-100)',
            color: 'var(--pf-blue-700)',
          }}
          aria-hidden="true"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--pf-grey-900)',
              marginBottom: '2px',
            }}
          >
            Start your personal statement
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
            UCAS 2026 entry — three short answers, 4,000 characters total.
          </p>
        </div>
      </Link>
    )
  }

  const q1 = draft.q1.length
  const q2 = draft.q2.length
  const q3 = draft.q3.length
  const total = q1 + q2 + q3
  const isReady = q1 >= MIN_PER_QUESTION && q2 >= MIN_PER_QUESTION && q3 >= MIN_PER_QUESTION
  const status = isReady ? 'Ready to review' : total === 0 ? 'Draft' : 'In progress'
  const statusColour = isReady ? 'var(--pf-green-500)' : total === 0 ? 'var(--pf-grey-600)' : 'var(--pf-amber-500)'

  return (
    <div className="pf-card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Personal statement</h2>
        <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: statusColour }}>{status}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        <PsBar label="Q1" len={q1} />
        <PsBar label="Q2" len={q2} />
        <PsBar label="Q3" len={q3} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--pf-grey-700)', marginBottom: '8px' }}>
        <span>
          Total: <strong>{total.toLocaleString()}</strong> / 4,000 characters
        </span>
        <span>Last edited {new Date(draft.lastSavedAt).toLocaleDateString('en-GB')}</span>
      </div>

      {unresolvedCount > 0 && (
        <p
          style={{
            padding: '8px 10px',
            backgroundColor: 'rgba(245,158,11,0.12)',
            borderLeft: '3px solid var(--pf-amber-500)',
            borderRadius: '4px',
            fontSize: '0.8125rem',
            color: '#92400e',
            marginBottom: '8px',
          }}
        >
          {unresolvedCount} comment{unresolvedCount === 1 ? '' : 's'} to address
        </p>
      )}

      {(draft.sharedWithSchool || draft.sharedWithParent) && (
        <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
          Shared with: {draft.sharedWithSchool ? 'guidance teacher' : ''}
          {draft.sharedWithSchool && draft.sharedWithParent ? ' · ' : ''}
          {draft.sharedWithParent ? 'parent / carer' : ''}
        </p>
      )}

      <Link href="/tools/personal-statement" className="pf-btn-primary pf-btn-sm" style={{ display: 'inline-block' }}>
        Open builder
      </Link>
    </div>
  )
}

function PsBar({ label, len }: { label: string; len: number }) {
  const pct = Math.min(100, Math.round((len / MIN_PER_QUESTION) * 100))
  const colour = len === 0 ? 'var(--pf-grey-300)' : len < MIN_PER_QUESTION ? 'var(--pf-amber-500)' : 'var(--pf-green-500)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
      <span style={{ fontWeight: 600, width: '24px', color: 'var(--pf-grey-700)' }}>{label}</span>
      <div
        aria-hidden="true"
        style={{
          flex: 1,
          height: '6px',
          borderRadius: '999px',
          backgroundColor: 'var(--pf-grey-100)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: colour,
            transition: 'width 200ms ease',
          }}
        />
      </div>
      <span style={{ width: '52px', textAlign: 'right', color: 'var(--pf-grey-600)' }}>
        {len.toLocaleString()}
      </span>
    </div>
  )
}
