'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { AwardType, Bursary, MatchConfidence, MatchStatus } from './types'

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
}

function parseDeadline(text: string | null | undefined): Date | null {
  if (!text) return null
  const match = text.match(
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/i
  )
  if (!match) return null
  const day = parseInt(match[1], 10)
  const month = MONTHS[match[2].toLowerCase()]
  const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear()
  let d = new Date(year, month, day)
  if (!match[3] && d.getTime() < Date.now()) {
    d = new Date(year + 1, month, day)
  }
  return d
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const AWARD_LABELS: Record<AwardType, string> = {
  grant: 'Grant',
  bursary: 'Bursary',
  fee_waiver: 'Fee waiver',
  accommodation: 'Accommodation',
  loan: 'Loan',
  discount: 'Discount',
  entitlement: 'Entitlement',
}

const AWARD_STYLES: Record<AwardType, { bg: string; fg: string }> = {
  grant: { bg: 'rgba(16, 185, 129, 0.12)', fg: '#047857' },
  bursary: { bg: 'rgba(0, 94, 184, 0.12)', fg: 'var(--pf-blue-700)' },
  fee_waiver: { bg: 'rgba(139, 92, 246, 0.12)', fg: '#6D28D9' },
  accommodation: { bg: 'rgba(236, 72, 153, 0.12)', fg: '#BE185D' },
  loan: { bg: 'rgba(245, 158, 11, 0.12)', fg: '#B45309' },
  discount: { bg: 'rgba(99, 102, 241, 0.12)', fg: '#4338CA' },
  entitlement: { bg: 'var(--pf-grey-100)', fg: 'var(--pf-grey-900)' },
}

const CONFIDENCE_ACCENT: Record<MatchConfidence, string> = {
  definite: '#10B981',
  likely: '#F59E0B',
  check_eligibility: '#F59E0B',
}

interface BursaryCardProps {
  bursary: Bursary
  confidence?: MatchConfidence
  initialStatus?: MatchStatus
  showActions?: boolean
}

export function BursaryCard({
  bursary,
  confidence,
  initialStatus = 'eligible',
  showActions = false,
}: BursaryCardProps) {
  const [status, setStatus] = useState<MatchStatus>(initialStatus)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedApply, setExpandedApply] = useState(false)

  const deadlineDate = parseDeadline(bursary.application_deadline)
  const daysToDeadline = deadlineDate ? daysUntil(deadlineDate) : null
  const deadlineSoon = daysToDeadline !== null && daysToDeadline <= 30 && daysToDeadline >= 0

  const awardStyle = AWARD_STYLES[bursary.award_type]
  const accent = confidence ? CONFIDENCE_ACCENT[confidence] : 'transparent'

  const updateStatus = async (next: MatchStatus) => {
    if (isSaving) return
    const prev = status
    setStatus(next)
    setIsSaving(true)
    try {
      const res = await fetch('/api/bursaries/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bursary_id: bursary.id, status: next }),
      })
      if (!res.ok) {
        setStatus(prev)
      }
    } catch {
      setStatus(prev)
    } finally {
      setIsSaving(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--pf-white)',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    padding: '24px',
    borderLeft: confidence ? `4px solid ${accent}` : '4px solid var(--pf-grey-100)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  }

  return (
    <article style={cardStyle}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="pf-badge"
              style={{
                backgroundColor: awardStyle.bg,
                color: awardStyle.fg,
                fontSize: '0.6875rem',
                fontWeight: 600,
              }}
            >
              {AWARD_LABELS[bursary.award_type]}
            </span>
            {bursary.is_repayable ? (
              <span
                className="pf-badge"
                style={{
                  fontSize: '0.6875rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#B45309',
                }}
              >
                Repayable
              </span>
            ) : (
              <span
                className="pf-badge-green"
                style={{ fontSize: '0.6875rem' }}
              >
                Non-repayable
              </span>
            )}
            {bursary.is_means_tested && (
              <span
                className="pf-badge-grey"
                style={{ fontSize: '0.6875rem' }}
              >
                Income-assessed
              </span>
            )}
            {status === 'applied' && (
              <span
                className="pf-badge-blue"
                style={{ fontSize: '0.6875rem', fontWeight: 600 }}
              >
                Applied
              </span>
            )}
          </div>
          <h3
            style={{
              fontSize: '1.125rem',
              marginBottom: '2px',
              color: 'var(--pf-grey-900)',
              fontWeight: 700,
            }}
          >
            {bursary.name}
          </h3>
          <div
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
            }}
          >
            {bursary.administering_body}
          </div>
        </div>
      </div>

      {bursary.amount_description && (
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'var(--pf-blue-700)',
            lineHeight: 1.2,
          }}
        >
          {bursary.amount_description}
        </div>
      )}

      {bursary.description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--pf-grey-600)',
            lineHeight: 1.5,
          }}
        >
          {bursary.description}
        </p>
      )}

      {deadlineSoon && (
        <div
          className="pf-badge"
          style={{
            alignSelf: 'flex-start',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#B91C1C',
          }}
        >
          Deadline in {daysToDeadline} day{daysToDeadline === 1 ? '' : 's'}
        </div>
      )}

      {bursary.application_deadline && !deadlineSoon && (
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
          }}
        >
          <strong style={{ color: 'var(--pf-grey-900)', fontWeight: 600 }}>Deadline:</strong>{' '}
          {bursary.application_deadline}
        </div>
      )}

      {bursary.application_process && (
        <details
          open={expandedApply}
          onToggle={(e) => setExpandedApply((e.target as HTMLDetailsElement).open)}
          style={{ fontSize: '0.8125rem' }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              color: 'var(--pf-blue-700)',
            }}
          >
            How to apply
          </summary>
          <p
            style={{
              marginTop: '8px',
              color: 'var(--pf-grey-900)',
              lineHeight: 1.5,
            }}
          >
            {bursary.application_process}
          </p>
        </details>
      )}

      <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 'auto' }}>
        <Link
          href={`/bursaries/${bursary.slug}`}
          className="pf-btn-secondary pf-btn-sm no-underline hover:no-underline"
          style={{ fontSize: '0.8125rem' }}
        >
          Learn more
        </Link>
        {bursary.url && (
          <a
            href={bursary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pf-btn-primary pf-btn-sm no-underline hover:no-underline"
            style={{ flex: '1 1 auto', minWidth: '140px' }}
          >
            {bursary.award_type === 'entitlement' ? 'More info' : 'Apply'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        {showActions && (
          <>
            <button
              type="button"
              onClick={() => updateStatus(status === 'applied' ? 'eligible' : 'applied')}
              disabled={isSaving}
              className="pf-btn-secondary pf-btn-sm"
              style={{ fontSize: '0.8125rem' }}
            >
              {status === 'applied' ? 'Unmark applied' : 'Mark as applied'}
            </button>
            <button
              type="button"
              onClick={() => updateStatus('dismissed')}
              disabled={isSaving}
              className="pf-btn-ghost pf-btn-sm"
              style={{ fontSize: '0.8125rem' }}
              aria-label={`Dismiss ${bursary.name}`}
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </article>
  )
}
