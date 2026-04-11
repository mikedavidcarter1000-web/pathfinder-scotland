'use client'

import { useState } from 'react'
import type { Tables } from '@/types/database'

type Benefit = Tables<'student_benefits'>
type Stage = 's1_s4' | 's5_s6' | 'college' | 'university'

const STAGE_SHORT: Record<Stage, string> = {
  s1_s4: 'S1–S4',
  s5_s6: 'S5–S6',
  college: 'College',
  university: 'Uni',
}

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
}

// Parse free-text deadlines like "31 March", "1 June", "1 June to 1 December".
// Returns the next occurrence — if the parsed date has already passed this year,
// roll forward to next year so countdowns make sense.
function parseDeadline(text: string | null | undefined): Date | null {
  if (!text) return null
  const match = text.match(/(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/i)
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

function formatDeadline(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function formatGbp(n: number): string {
  return `£${n.toLocaleString('en-GB')}`
}

// Render an income threshold object as a readable table. Keys follow a simple
// convention like "under_21000", "21000_23999", "34000_plus".
function renderIncomeThresholds(raw: unknown): React.ReactNode {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const entries = Object.entries(raw as Record<string, unknown>)
  if (entries.length === 0) return null

  const rows = entries
    .map(([key, value]) => {
      let label = key
      const under = key.match(/^under_(\d+)$/)
      const range = key.match(/^(\d+)_(\d+)$/)
      const plus = key.match(/^(\d+)_plus$/)
      const children = key.match(/^(\d+)_plus_children$/)
      const oneChild = key.match(/^(\d+)_child$/)
      if (under) {
        label = `Under ${formatGbp(parseInt(under[1], 10))}`
      } else if (range) {
        label = `${formatGbp(parseInt(range[1], 10))}–${formatGbp(parseInt(range[2], 10))}`
      } else if (plus) {
        label = `${formatGbp(parseInt(plus[1], 10))}+`
      } else if (children) {
        label = `${formatGbp(parseInt(children[1], 10))} (2+ children)`
      } else if (oneChild) {
        label = `${formatGbp(parseInt(oneChild[1], 10))} (1 child)`
      }
      return { key, label, value }
    })

  return (
    <div style={{ marginTop: '8px' }}>
      {rows.map(({ key, label, value }) => {
        const valueStr =
          typeof value === 'number'
            ? value === 0
              ? 'No award'
              : formatGbp(value)
            : String(value)
        return (
          <div
            key={key}
            className="flex justify-between"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-900)',
              padding: '4px 0',
              borderBottom: '1px solid var(--pf-grey-100)',
            }}
          >
            <span>{label}</span>
            <strong style={{ fontWeight: 600 }}>{valueStr}</strong>
          </div>
        )
      })}
    </div>
  )
}

interface BenefitCardProps {
  benefit: Benefit
  stage: Stage | null
  variant: 'government' | 'commercial'
  sourcePage: string
}

export function BenefitCard({ benefit, stage, variant, sourcePage }: BenefitCardProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const eligibilityBadges: Array<{ label: string; eligible: boolean }> = [
    { label: STAGE_SHORT.s1_s4, eligible: !!benefit.eligibility_s1_s4 },
    { label: STAGE_SHORT.s5_s6, eligible: !!benefit.eligibility_s5_s6 },
    { label: STAGE_SHORT.college, eligible: !!benefit.eligibility_college },
    { label: STAGE_SHORT.university, eligible: !!benefit.eligibility_university },
  ]

  const deadlineDate = parseDeadline(benefit.application_deadline)
  const daysToDeadline = deadlineDate ? daysUntil(deadlineDate) : null
  const deadlineTone: 'red' | 'amber' | 'grey' | null =
    daysToDeadline === null
      ? benefit.application_deadline
        ? 'grey'
        : null
      : daysToDeadline <= 30
        ? 'red'
        : daysToDeadline <= 90
          ? 'amber'
          : 'grey'

  const hasThresholds =
    benefit.income_thresholds &&
    typeof benefit.income_thresholds === 'object' &&
    !Array.isArray(benefit.income_thresholds) &&
    Object.keys(benefit.income_thresholds as Record<string, unknown>).length > 0

  const isGovernment = variant === 'government'
  const cardStyle: React.CSSProperties = isGovernment
    ? {
        backgroundColor: 'var(--pf-white)',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        padding: '28px',
        borderLeft: '4px solid var(--pf-blue-700)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }
    : {
        backgroundColor: 'var(--pf-white)',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: '100%',
      }

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (isRedirecting) return
    setIsRedirecting(true)
    try {
      const res = await fetch('/api/benefits/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          benefit_id: benefit.id,
          source_page: sourcePage,
        }),
      })
      const json = (await res.json().catch(() => null)) as {
        redirect_url?: string
      } | null
      const target = json?.redirect_url || benefit.affiliate_url || benefit.url
      window.open(target, '_blank', 'noopener,noreferrer')
    } catch {
      window.open(benefit.affiliate_url || benefit.url, '_blank', 'noopener,noreferrer')
    } finally {
      setIsRedirecting(false)
    }
  }

  return (
    <article style={cardStyle}>
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'var(--pf-grey-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {benefit.provider}
          </span>
          {benefit.is_scotland_only && (
            <span
              className="pf-badge"
              style={{
                backgroundColor: 'rgba(0, 94, 184, 0.1)',
                color: 'var(--pf-blue-700)',
                fontSize: '0.6875rem',
              }}
            >
              Scotland only
            </span>
          )}
          {benefit.is_care_experienced_only && (
            <span
              className="pf-badge"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#B45309',
                fontSize: '0.6875rem',
              }}
            >
              Care-experienced
            </span>
          )}
          {benefit.is_means_tested && (
            <span
              className="pf-badge-grey"
              style={{ fontSize: '0.6875rem' }}
            >
              Means-tested
            </span>
          )}
        </div>
        <h3
          style={{
            fontSize: isGovernment ? '1.25rem' : '1.0625rem',
            marginBottom: '4px',
            color: 'var(--pf-grey-900)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          <span>{benefit.name}</span>
          {benefit.verification_notes && (
            <span
              role="img"
              aria-label="Verification notes"
              title={`Last verified ${benefit.last_verified ?? 'April 2026'}. ${benefit.verification_notes}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--pf-grey-100)',
                color: 'var(--pf-grey-600)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                cursor: 'help',
              }}
            >
              i
            </span>
          )}
        </h3>
        {deadlineTone && (
          <div className="mt-1">
            <span
              className="pf-badge"
              style={{
                fontSize: '0.6875rem',
                backgroundColor:
                  deadlineTone === 'red'
                    ? 'rgba(220, 38, 38, 0.12)'
                    : deadlineTone === 'amber'
                      ? 'rgba(245, 158, 11, 0.14)'
                      : 'var(--pf-grey-100)',
                color:
                  deadlineTone === 'red'
                    ? '#B91C1C'
                    : deadlineTone === 'amber'
                      ? '#B45309'
                      : 'var(--pf-grey-600)',
              }}
            >
              {deadlineTone === 'red' && 'Deadline soon'}
              {deadlineTone === 'amber' &&
                `Apply by ${deadlineDate ? formatDeadline(deadlineDate) : benefit.application_deadline}`}
              {deadlineTone === 'grey' &&
                `Deadline: ${deadlineDate ? formatDeadline(deadlineDate) : benefit.application_deadline}`}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isGovernment ? '1.5rem' : '1.375rem',
          color: 'var(--pf-blue-700)',
          lineHeight: 1.2,
        }}
      >
        {benefit.discount_value}
      </div>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {benefit.short_description || benefit.description}
      </p>

      {hasThresholds && (
        <details style={{ marginTop: '-4px' }}>
          <summary
            style={{
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'var(--pf-blue-700)',
            }}
          >
            What could I get?
          </summary>
          {renderIncomeThresholds(benefit.income_thresholds)}
        </details>
      )}

      <div className="flex items-center gap-1.5 flex-wrap" aria-label="Eligibility">
        {eligibilityBadges.map((b) => {
          const dim = !b.eligible
          const isCurrent =
            stage && STAGE_SHORT[stage] === b.label && b.eligible
          return (
            <span
              key={b.label}
              className="pf-badge"
              style={{
                fontSize: '0.6875rem',
                backgroundColor: dim
                  ? 'var(--pf-grey-100)'
                  : isCurrent
                    ? 'var(--pf-blue-700)'
                    : 'var(--pf-blue-100)',
                color: dim
                  ? 'var(--pf-grey-600)'
                  : isCurrent
                    ? '#fff'
                    : 'var(--pf-blue-700)',
                opacity: dim ? 0.6 : 1,
              }}
            >
              {b.label}
            </span>
          )
        })}
      </div>

      {benefit.access_method && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--pf-grey-600)',
            paddingTop: '10px',
            borderTop: '1px solid var(--pf-grey-100)',
          }}
        >
          <strong style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>How:</strong>{' '}
          {benefit.access_method}
        </div>
      )}

      <a
        href={benefit.affiliate_url || benefit.url}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="pf-btn-primary no-underline hover:no-underline"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: 'auto',
          width: '100%',
        }}
      >
        {isRedirecting ? 'Opening…' : 'Get this benefit'}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </article>
  )
}
