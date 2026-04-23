'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type State = 'prompt' | 'comment' | 'done'

export function FeedbackWidget() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [state, setState] = useState<State>('prompt')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Dismiss if already submitted in this browser session for this page
  useEffect(() => {
    const key = `pf_fb_${pathname}`
    if (typeof window !== 'undefined' && sessionStorage.getItem(key)) {
      setState('done')
    }
  }, [pathname])

  // Focus the comment input when it appears
  useEffect(() => {
    if (state === 'comment' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [state])

  async function handleVote(isHelpful: boolean) {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_path: pathname, is_helpful: isHelpful }),
      })
      if (res.ok) {
        const data = await res.json() as { id: string }
        setPendingId(data.id)
      }
    } catch {
      // fire-and-forget — don't block UX on network failure
    }
    setSubmitting(false)
    setState('comment')
  }

  async function handleComment() {
    if (submitting) return
    if (comment.trim() && pendingId) {
      setSubmitting(true)
      try {
        await fetch('/api/feedback', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: pendingId, comment: comment.trim() }),
        })
      } catch {
        // fire-and-forget
      }
      setSubmitting(false)
    }
    markDone()
  }

  function markDone() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`pf_fb_${pathname}`, '1')
    }
    setState('done')
  }

  if (state === 'done') return null

  return (
    <div
      style={{
        backgroundColor: 'var(--pf-grey-50, #f9fafb)',
        borderTop: '1px solid var(--pf-grey-200, #e5e7eb)',
        padding: '20px 16px',
        textAlign: 'center',
      }}
    >
      {state === 'prompt' && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9375rem',
            color: 'var(--pf-grey-700, #374151)',
          }}
        >
          <span style={{ fontWeight: 500 }}>Was this page helpful?</span>
          <button
            type="button"
            onClick={() => handleVote(true)}
            disabled={submitting}
            aria-label="Yes, this page was helpful"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid var(--pf-grey-300, #d1d5db)',
              backgroundColor: 'var(--pf-white, #fff)',
              color: 'var(--pf-grey-700, #374151)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: submitting ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleVote(false)}
            disabled={submitting}
            aria-label="No, this page was not helpful"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid var(--pf-grey-300, #d1d5db)',
              backgroundColor: 'var(--pf-white, #fff)',
              color: 'var(--pf-grey-700, #374151)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: submitting ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            No
          </button>
        </div>
      )}

      {state === 'comment' && (
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-700, #374151)', marginBottom: '12px', fontWeight: 500 }}>
            Thanks! Any suggestions? <span style={{ fontWeight: 400 }}>(optional)</span>
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={inputRef}
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleComment() }}
              maxLength={500}
              placeholder="Your suggestion..."
              aria-label="Optional feedback comment"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--pf-grey-300, #d1d5db)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleComment}
              disabled={submitting}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--pf-blue-600, #2563eb)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: submitting ? 'default' : 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Send
            </button>
            <button
              type="button"
              onClick={markDone}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--pf-grey-300, #d1d5db)',
                backgroundColor: 'transparent',
                color: 'var(--pf-grey-600, #4b5563)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
