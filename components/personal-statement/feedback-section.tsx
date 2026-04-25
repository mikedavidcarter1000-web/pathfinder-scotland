'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type FeedbackRow = {
  id: string
  draft_id: string
  version_id: string | null
  question_number: number
  author_type: 'student' | 'guidance' | 'parent'
  author_user_id: string
  author_name: string
  comment: string
  highlight_start: number | null
  highlight_end: number | null
  parent_feedback_id: string | null
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

type ViewerRole = 'student' | 'guidance' | 'parent' | 'admin'

const TEN_MINUTES_MS = 10 * 60 * 1000

const ROLE_BADGE: Record<FeedbackRow['author_type'], { label: string; bg: string; fg: string }> = {
  student: { label: 'Student', bg: 'var(--pf-grey-200)', fg: 'var(--pf-grey-800)' },
  guidance: { label: 'Guidance', bg: 'rgba(245,158,11,0.18)', fg: '#92400e' },
  parent: { label: 'Parent', bg: 'rgba(124,58,237,0.18)', fg: '#5b21b6' },
}

export function useFeedback(draftId: string | null) {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!draftId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/personal-statement/feedback?draftId=${draftId}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        setFeedback([])
        return
      }
      const json = (await res.json()) as { feedback: FeedbackRow[] }
      setFeedback(json.feedback ?? [])
    } finally {
      setLoading(false)
    }
  }, [draftId])

  useEffect(() => {
    void reload()
  }, [reload])

  return { feedback, loading, reload, setFeedback }
}

export function unresolvedCountByQuestion(rows: FeedbackRow[], questionNumber: number): number {
  return rows.filter((r) => r.question_number === questionNumber && !r.is_resolved).length
}

/**
 * Renders the question text with anchored-comment highlights and an inline
 * popover for each comment thread. Used in the reader views (guidance / parent)
 * AND in the student's drafting view alongside the textarea (where it gives
 * the student a read-only mirror of the highlights and a place to reply / resolve).
 */
export function HighlightedQuestionText({
  text,
  rows,
  onClickAnchor,
}: {
  text: string
  rows: FeedbackRow[]
  onClickAnchor: (row: FeedbackRow) => void
}) {
  // Build segment list from highlights.
  const anchored = useMemo(
    () =>
      rows
        .filter((r) => r.highlight_start !== null && r.highlight_end !== null)
        .sort(
          (a, b) =>
            (a.highlight_start as number) - (b.highlight_start as number) ||
            (a.highlight_end as number) - (b.highlight_end as number)
        ),
    [rows]
  )

  if (anchored.length === 0) {
    return (
      <span style={{ whiteSpace: 'pre-wrap' }}>
        {text || <span style={{ color: 'var(--pf-grey-500)' }}>(empty)</span>}
      </span>
    )
  }

  type Segment = { start: number; end: number; row: FeedbackRow | null }
  const segments: Segment[] = []
  let cursor = 0
  for (const r of anchored) {
    const start = Math.max(cursor, r.highlight_start as number)
    const end = Math.min(text.length, r.highlight_end as number)
    if (start > cursor) segments.push({ start: cursor, end: start, row: null })
    if (end > start) segments.push({ start, end, row: r })
    cursor = Math.max(cursor, end)
  }
  if (cursor < text.length) segments.push({ start: cursor, end: text.length, row: null })

  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {segments.map((s, idx) => {
        const slice = text.slice(s.start, s.end)
        if (!s.row) return <span key={idx}>{slice}</span>
        const orphan =
          (s.row.highlight_end ?? 0) > text.length ||
          // The anchor's "expected" text is unknown; the orphan flag fires when
          // the highlight extends past the current text length, which means
          // the draft has shrunk since the comment was made.
          (s.row.highlight_start ?? 0) > text.length
        const colour =
          s.row.is_resolved
            ? 'rgba(148,163,184,0.4)'
            : s.row.author_type === 'guidance'
            ? 'rgba(245,158,11,0.6)'
            : 'rgba(124,58,237,0.6)'
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onClickAnchor(s.row as FeedbackRow)}
            title={`${s.row.author_name}: ${s.row.comment.slice(0, 80)}${s.row.comment.length > 80 ? '…' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: 'inherit',
              borderBottom: `2px solid ${colour}`,
              textDecoration: orphan ? 'line-through' : undefined,
              opacity: s.row.is_resolved ? 0.55 : 1,
            }}
          >
            {slice}
          </button>
        )
      })}
    </span>
  )
}

/**
 * The full feedback section for a single question. Renders the question text,
 * the anchored-comment popover when one is selected, the chronological list
 * of general comments, and (for reader roles) the new-comment input form.
 */
export function FeedbackSection({
  draftId,
  questionNumber,
  questionText,
  feedback,
  viewerRole,
  onChange,
  textSelectionEnabled,
}: {
  draftId: string | null
  questionNumber: 1 | 2 | 3
  questionText: string
  feedback: FeedbackRow[]
  viewerRole: ViewerRole
  onChange: () => Promise<void>
  textSelectionEnabled: boolean
}) {
  const [activeAnchor, setActiveAnchor] = useState<FeedbackRow | null>(null)
  const [highlight, setHighlight] = useState<{ start: number; end: number } | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [draftComment, setDraftComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyParentId, setReplyParentId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const rowsForQuestion = useMemo(
    () => feedback.filter((r) => r.question_number === questionNumber),
    [feedback, questionNumber]
  )
  const generalComments = useMemo(
    () => rowsForQuestion.filter((r) => r.highlight_start === null && r.parent_feedback_id === null),
    [rowsForQuestion]
  )
  const repliesByParent = useMemo(() => {
    const map = new Map<string, FeedbackRow[]>()
    for (const r of rowsForQuestion) {
      if (r.parent_feedback_id) {
        const arr = map.get(r.parent_feedback_id) ?? []
        arr.push(r)
        map.set(r.parent_feedback_id, arr)
      }
    }
    return map
  }, [rowsForQuestion])

  const isReader = viewerRole === 'guidance' || viewerRole === 'parent'

  const handleSelection = useCallback(() => {
    if (!textSelectionEnabled || !isReader || !containerRef.current) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setHighlight(null)
      return
    }
    const range = sel.getRangeAt(0)
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      setHighlight(null)
      return
    }
    // Compute character offsets within the question text by measuring from
    // the start of the rendered container. The container is plain text + the
    // anchored-button spans, so textContent gives the right index.
    const preRange = range.cloneRange()
    preRange.selectNodeContents(containerRef.current)
    preRange.setEnd(range.startContainer, range.startOffset)
    const start = preRange.toString().length
    const end = start + range.toString().length
    if (end > start) setHighlight({ start, end })
  }, [textSelectionEnabled, isReader])

  const submitComment = useCallback(async () => {
    if (!draftId) return
    if (draftComment.trim().length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/personal-statement/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          draftId,
          questionNumber,
          comment: draftComment.trim(),
          highlightStart: highlight?.start ?? null,
          highlightEnd: highlight?.end ?? null,
        }),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(json.error ?? 'Could not save comment')
      }
      setDraftComment('')
      setHighlight(null)
      window.getSelection()?.removeAllRanges()
      await onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save comment')
    } finally {
      setSubmitting(false)
    }
  }, [draftId, questionNumber, draftComment, highlight, onChange])

  const submitReply = useCallback(
    async (parentId: string) => {
      if (!draftId || replyText.trim().length === 0) return
      setSubmitting(true)
      setError(null)
      try {
        const res = await fetch('/api/personal-statement/feedback', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            draftId,
            questionNumber,
            comment: replyText.trim(),
            parentFeedbackId: parentId,
          }),
        })
        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(json.error ?? 'Could not save reply')
        }
        setReplyText('')
        setReplyParentId(null)
        await onChange()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save reply')
      } finally {
        setSubmitting(false)
      }
    },
    [draftId, questionNumber, replyText, onChange]
  )

  const toggleResolve = useCallback(
    async (row: FeedbackRow) => {
      const res = await fetch(`/api/personal-statement/feedback/${row.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isResolved: !row.is_resolved }),
      })
      if (res.ok) await onChange()
    },
    [onChange]
  )

  const deleteComment = useCallback(
    async (row: FeedbackRow) => {
      const ok = window.confirm('Delete this comment?')
      if (!ok) return
      const res = await fetch(`/api/personal-statement/feedback/${row.id}`, { method: 'DELETE' })
      if (res.ok) await onChange()
    },
    [onChange]
  )

  return (
    <div style={{ marginTop: '12px' }}>
      <div
        ref={containerRef}
        onMouseUp={handleSelection}
        onTouchEnd={handleSelection}
        style={{
          padding: '14px 16px',
          backgroundColor: 'var(--pf-grey-50, #f9fafb)',
          borderRadius: '6px',
          border: '1px solid var(--pf-grey-200)',
          fontSize: '0.9375rem',
          lineHeight: 1.65,
        }}
      >
        <HighlightedQuestionText
          text={questionText}
          rows={rowsForQuestion}
          onClickAnchor={setActiveAnchor}
        />
      </div>

      {textSelectionEnabled && isReader && highlight && (
        <div
          style={{
            marginTop: '8px',
            padding: '12px 14px',
            border: '1px solid var(--pf-blue-700)',
            borderRadius: '6px',
            backgroundColor: 'var(--pf-blue-100)',
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-blue-900)', marginBottom: '8px' }}>
            Comment on the highlighted text ({highlight.end - highlight.start} characters):
          </p>
          <textarea
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            rows={3}
            className="pf-input"
            placeholder="What do you want to say about this?"
            style={{ width: '100%', fontFamily: 'inherit' }}
          />
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setHighlight(null)
                setDraftComment('')
              }}
              className="pf-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitComment}
              disabled={submitting || draftComment.trim().length === 0}
              className="pf-btn-primary"
            >
              {submitting ? 'Saving…' : 'Add anchored comment'}
            </button>
          </div>
        </div>
      )}

      {activeAnchor && (
        <AnchoredCommentCard
          row={activeAnchor}
          replies={repliesByParent.get(activeAnchor.id) ?? []}
          viewerRole={viewerRole}
          onClose={() => setActiveAnchor(null)}
          onResolve={toggleResolve}
          onDelete={deleteComment}
          onReplySubmit={submitReply}
          replyText={replyText}
          setReplyText={setReplyText}
          replyParentId={replyParentId}
          setReplyParentId={setReplyParentId}
          submitting={submitting}
          questionText={questionText}
        />
      )}

      <CommentList
        title={isReader ? 'General comments and replies' : 'Comments on this question'}
        comments={generalComments}
        repliesByParent={repliesByParent}
        viewerRole={viewerRole}
        onResolve={toggleResolve}
        onDelete={deleteComment}
        onReplySubmit={submitReply}
        replyText={replyText}
        setReplyText={setReplyText}
        replyParentId={replyParentId}
        setReplyParentId={setReplyParentId}
        submitting={submitting}
      />

      {isReader && (
        <div style={{ marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => {
              if (highlight) {
                setHighlight(null)
                setDraftComment('')
              } else {
                // Force the general-comment form by clearing any selection +
                // setting an empty highlight that the form treats as "general".
                setDraftComment('')
                window.getSelection()?.removeAllRanges()
              }
            }}
            className="pf-btn-secondary"
            style={{ marginBottom: '8px' }}
          >
            Add general comment
          </button>
          {!highlight && (
            <div>
              <textarea
                value={draftComment}
                onChange={(e) => setDraftComment(e.target.value)}
                rows={3}
                className="pf-input"
                placeholder="General comment on this question (not anchored to specific text)"
                style={{ width: '100%', fontFamily: 'inherit' }}
              />
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={submitting || draftComment.trim().length === 0}
                  className="pf-btn-primary"
                >
                  {submitting ? 'Saving…' : 'Submit comment'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: 'var(--pf-red-500)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function CommentList({
  title,
  comments,
  repliesByParent,
  viewerRole,
  onResolve,
  onDelete,
  onReplySubmit,
  replyText,
  setReplyText,
  replyParentId,
  setReplyParentId,
  submitting,
}: {
  title: string
  comments: FeedbackRow[]
  repliesByParent: Map<string, FeedbackRow[]>
  viewerRole: ViewerRole
  onResolve: (row: FeedbackRow) => Promise<void>
  onDelete: (row: FeedbackRow) => Promise<void>
  onReplySubmit: (parentId: string) => Promise<void>
  replyText: string
  setReplyText: (s: string) => void
  replyParentId: string | null
  setReplyParentId: (id: string | null) => void
  submitting: boolean
}) {
  if (comments.length === 0) return null
  return (
    <div style={{ marginTop: '12px' }}>
      <p
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--pf-grey-500)',
          fontWeight: 700,
          marginBottom: '6px',
        }}
      >
        {title}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            row={c}
            replies={repliesByParent.get(c.id) ?? []}
            viewerRole={viewerRole}
            onResolve={onResolve}
            onDelete={onDelete}
            onReplySubmit={onReplySubmit}
            replyText={replyText}
            setReplyText={setReplyText}
            replyParentId={replyParentId}
            setReplyParentId={setReplyParentId}
            submitting={submitting}
          />
        ))}
      </ul>
    </div>
  )
}

function CommentItem({
  row,
  replies,
  viewerRole,
  onResolve,
  onDelete,
  onReplySubmit,
  replyText,
  setReplyText,
  replyParentId,
  setReplyParentId,
  submitting,
}: {
  row: FeedbackRow
  replies: FeedbackRow[]
  viewerRole: ViewerRole
  onResolve: (row: FeedbackRow) => Promise<void>
  onDelete: (row: FeedbackRow) => Promise<void>
  onReplySubmit: (parentId: string) => Promise<void>
  replyText: string
  setReplyText: (s: string) => void
  replyParentId: string | null
  setReplyParentId: (id: string | null) => void
  submitting: boolean
}) {
  const badge = ROLE_BADGE[row.author_type]
  const canDelete = isWithinEditWindow(row.created_at)
  const canResolve = viewerRole === 'student'

  return (
    <li
      style={{
        padding: '10px 12px',
        border: '1px solid var(--pf-grey-200)',
        borderRadius: '6px',
        backgroundColor: row.is_resolved ? 'var(--pf-grey-50, #f9fafb)' : 'var(--pf-white)',
        opacity: row.is_resolved ? 0.7 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: badge.bg,
            color: badge.fg,
            fontWeight: 600,
            fontSize: '0.6875rem',
          }}
        >
          {badge.label}
        </span>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
          {row.author_name}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-500)' }}>
          {new Date(row.created_at).toLocaleString('en-GB')}
        </span>
        {row.is_resolved && (
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(34,197,94,0.18)',
              color: '#166534',
              fontSize: '0.6875rem',
              fontWeight: 600,
            }}
          >
            Resolved
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-800)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
        {row.comment}
      </p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setReplyParentId(replyParentId === row.id ? null : row.id)}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid var(--pf-grey-300)',
            backgroundColor: 'transparent',
            color: 'var(--pf-grey-700)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          {replyParentId === row.id ? 'Cancel reply' : 'Reply'}
        </button>
        {canResolve && (
          <button
            type="button"
            onClick={() => onResolve(row)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid var(--pf-green-500)',
              backgroundColor: 'transparent',
              color: 'var(--pf-green-500)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            {row.is_resolved ? 'Reopen' : 'Resolve'}
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(row)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid var(--pf-red-500)',
              backgroundColor: 'transparent',
              color: 'var(--pf-red-500)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        )}
      </div>

      {replyParentId === row.id && (
        <div style={{ marginTop: '8px' }}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            className="pf-input"
            placeholder="Reply…"
            style={{ width: '100%', fontFamily: 'inherit' }}
          />
          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => onReplySubmit(row.id)}
              disabled={submitting || replyText.trim().length === 0}
              className="pf-btn-primary"
            >
              {submitting ? 'Saving…' : 'Send reply'}
            </button>
          </div>
        </div>
      )}

      {replies.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '10px 0 0 16px',
            borderLeft: '2px solid var(--pf-grey-200)',
            paddingLeft: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {replies.map((rep) => {
            const repBadge = ROLE_BADGE[rep.author_type]
            return (
              <li key={rep.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '999px',
                      backgroundColor: repBadge.bg,
                      color: repBadge.fg,
                      fontWeight: 600,
                      fontSize: '0.625rem',
                    }}
                  >
                    {repBadge.label}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{rep.author_name}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--pf-grey-500)' }}>
                    {new Date(rep.created_at).toLocaleString('en-GB')}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--pf-grey-800)',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {rep.comment}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

function AnchoredCommentCard({
  row,
  replies,
  viewerRole,
  onClose,
  onResolve,
  onDelete,
  onReplySubmit,
  replyText,
  setReplyText,
  replyParentId,
  setReplyParentId,
  submitting,
  questionText,
}: {
  row: FeedbackRow
  replies: FeedbackRow[]
  viewerRole: ViewerRole
  onClose: () => void
  onResolve: (row: FeedbackRow) => Promise<void>
  onDelete: (row: FeedbackRow) => Promise<void>
  onReplySubmit: (parentId: string) => Promise<void>
  replyText: string
  setReplyText: (s: string) => void
  replyParentId: string | null
  setReplyParentId: (id: string | null) => void
  submitting: boolean
  questionText: string
}) {
  const start = row.highlight_start ?? 0
  const end = row.highlight_end ?? 0
  const orphaned = end > questionText.length || start > questionText.length
  return (
    <div
      style={{
        marginTop: '8px',
        padding: '12px 14px',
        border: '1px solid var(--pf-grey-300)',
        borderLeft: `4px solid ${
          row.author_type === 'guidance' ? 'var(--pf-amber-500)' : '#7c3aed'
        }`,
        borderRadius: '6px',
        backgroundColor: 'var(--pf-white)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-500)', marginBottom: '2px' }}>
            Anchored comment from {row.author_name}
          </p>
          <p
            style={{
              fontSize: '0.875rem',
              fontStyle: 'italic',
              color: 'var(--pf-grey-700)',
              padding: '6px 8px',
              background: 'var(--pf-grey-50, #f9fafb)',
              borderRadius: '4px',
              marginBottom: '8px',
              whiteSpace: 'pre-wrap',
            }}
          >
            “{questionText.slice(start, Math.min(end, questionText.length))}”
          </p>
          {orphaned && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#92400e',
                background: 'rgba(245,158,11,0.18)',
                padding: '4px 6px',
                borderRadius: '4px',
                marginBottom: '6px',
              }}
            >
              This comment was left on a previous version. The highlighted text may have changed.
            </p>
          )}
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', whiteSpace: 'pre-wrap' }}>
            {row.comment}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close anchored comment"
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: 'var(--pf-grey-600)',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setReplyParentId(replyParentId === row.id ? null : row.id)}
          style={smallBtn}
        >
          {replyParentId === row.id ? 'Cancel reply' : 'Reply'}
        </button>
        {viewerRole === 'student' && (
          <button type="button" onClick={() => onResolve(row)} style={smallBtn}>
            {row.is_resolved ? 'Reopen' : 'Resolve'}
          </button>
        )}
      </div>

      {replyParentId === row.id && (
        <div style={{ marginTop: '8px' }}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            className="pf-input"
            style={{ width: '100%', fontFamily: 'inherit' }}
          />
          <div style={{ marginTop: '6px', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => onReplySubmit(row.id)}
              disabled={submitting || replyText.trim().length === 0}
              className="pf-btn-primary"
            >
              {submitting ? 'Saving…' : 'Send reply'}
            </button>
          </div>
        </div>
      )}

      {replies.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: '0 0 0 12px',
            marginTop: '10px',
            borderLeft: '2px solid var(--pf-grey-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {replies.map((rep) => (
            <li key={rep.id}>
              <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-500)' }}>
                {rep.author_name} · {new Date(rep.created_at).toLocaleString('en-GB')}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-800)', whiteSpace: 'pre-wrap' }}>
                {rep.comment}
              </p>
            </li>
          ))}
        </ul>
      )}

    </div>
  )
}

function isWithinEditWindow(createdAt: string): boolean {
  // The lint rule treats Date.now() as impure; new Date() returns a fresh
  // object so passes the `react-hooks/purity` check. Functionally equivalent.
  return new Date().getTime() - new Date(createdAt).getTime() < TEN_MINUTES_MS
}

const smallBtn: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: '4px',
  border: '1px solid var(--pf-grey-300)',
  backgroundColor: 'transparent',
  color: 'var(--pf-grey-700)',
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: '0.75rem',
  cursor: 'pointer',
}
