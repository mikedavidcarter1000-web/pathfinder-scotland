'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type SharedDraft = {
  viewerRole: 'student' | 'guidance' | 'parent' | 'admin'
  draft: {
    id: string
    q1: string
    q2: string
    q3: string
    lastSavedAt: string
    sharedWithParent: boolean
  }
}

type FeedbackRow = { is_resolved: boolean }

const MIN_PER_QUESTION = 350

export function ParentPersonalStatementCard({
  studentId,
  childFirstName,
}: {
  studentId: string
  childFirstName: string | null
}) {
  const [loading, setLoading] = useState(true)
  const [shared, setShared] = useState<SharedDraft | null>(null)
  const [unresolved, setUnresolved] = useState(0)
  const [unshared, setUnshared] = useState(false)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch(`/api/personal-statement/shared/${studentId}`, { cache: 'no-store' })
        if (res.status === 404) {
          if (!cancelled) {
            setUnshared(true)
            setShared(null)
          }
          return
        }
        if (!res.ok) return
        const json = (await res.json()) as SharedDraft
        if (cancelled) return
        setShared(json)
        if (json.draft.id) {
          const fbRes = await fetch(`/api/personal-statement/feedback?draftId=${json.draft.id}`, {
            cache: 'no-store',
          })
          if (fbRes.ok) {
            const fbJson = (await fbRes.json()) as { feedback: FeedbackRow[] }
            if (!cancelled) {
              setUnresolved(fbJson.feedback.filter((f) => !f.is_resolved).length)
            }
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
  }, [studentId])

  if (loading) return null

  const name = childFirstName || 'your child'

  if (unshared || !shared) {
    return (
      <section
        className="pf-card"
        style={{
          padding: '16px 18px',
          marginTop: '10px',
          borderLeft: '4px solid var(--pf-grey-300)',
        }}
      >
        <h3 style={{ fontSize: '0.9375rem', margin: '0 0 4px 0' }}>Personal statement</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', margin: 0 }}>
          {name} hasn’t shared their personal statement with you yet. They can share it from the
          Pathfinder personal statement builder.
        </p>
      </section>
    )
  }

  const q1 = shared.draft.q1.length
  const q2 = shared.draft.q2.length
  const q3 = shared.draft.q3.length
  const total = q1 + q2 + q3

  return (
    <section
      className="pf-card"
      style={{
        padding: '16px 18px',
        marginTop: '10px',
        borderLeft: '4px solid var(--pf-blue-700)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '0.9375rem', margin: 0 }}>Personal statement</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-500)' }}>
          Last saved {new Date(shared.draft.lastSavedAt).toLocaleDateString('en-GB')}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', fontSize: '0.8125rem' }}>
        <Row label="Q1" len={q1} />
        <Row label="Q2" len={q2} />
        <Row label="Q3" len={q3} />
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
        Total {total.toLocaleString()} / 4,000
        {unresolved > 0 ? ` · ${unresolved} unresolved comment${unresolved === 1 ? '' : 's'}` : ''}
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', fontStyle: 'italic', marginBottom: '8px' }}>
        Remember, this is your child’s statement. Offer encouragement and suggestions, but the
        words must be theirs.
      </p>
      <Link
        href={`/parent/personal-statement/${studentId}`}
        className="pf-btn-primary pf-btn-sm"
        style={{ display: 'inline-block' }}
      >
        Read and comment
      </Link>
    </section>
  )
}

function Row({ label, len }: { label: string; len: number }) {
  const pct = Math.min(100, Math.round((len / MIN_PER_QUESTION) * 100))
  const colour = len === 0 ? 'var(--pf-grey-300)' : len < MIN_PER_QUESTION ? 'var(--pf-amber-500)' : 'var(--pf-green-500)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontWeight: 600, width: '24px' }}>{label}</span>
      <div
        aria-hidden="true"
        style={{
          flex: 1,
          height: '5px',
          borderRadius: '999px',
          backgroundColor: 'var(--pf-grey-100)',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colour }} />
      </div>
      <span style={{ width: '52px', textAlign: 'right', color: 'var(--pf-grey-600)' }}>
        {len.toLocaleString()}
      </span>
    </div>
  )
}
