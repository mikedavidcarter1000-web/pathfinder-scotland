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
          }}
        >
          {benefit.name}
        </h3>
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
