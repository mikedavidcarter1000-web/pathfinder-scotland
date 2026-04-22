'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { RoleComparisonData } from './ComparisonGrid'
import { AI_ROLE_TIER_META, getAiRoleTier } from '@/lib/constants'

type Horizon = 'near' | 'long'

export interface FutureOutlookSectionProps {
  roles: RoleComparisonData[]
}

function tierWord(rating: number | null): string {
  if (rating == null) return 'Not rated'
  return AI_ROLE_TIER_META[getAiRoleTier(rating)].label
}

function tierExplanation(
  metric: 'AI' | 'Robotics',
  horizon: Horizon,
  rating: number | null,
): string {
  if (rating == null) {
    return `${metric} ${horizon === 'near' ? '2030-2035' : '2040-2045'} rating not yet assigned for this role.`
  }
  const tier = AI_ROLE_TIER_META[getAiRoleTier(rating)]
  const window = horizon === 'near' ? '2030-2035' : '2040-2045'
  return `${metric} ${window}: ${rating}/10 (${tier.label}). ${tier.description}`
}

export function FutureOutlookSection({ roles }: FutureOutlookSectionProps) {
  const [horizon, setHorizon] = useState<Horizon>('near')

  const aiEntries = roles.map((r) => {
    const rating = horizon === 'near' ? r.aiRating2030 : r.aiRating2040
    return {
      careerName: r.title,
      value: rating,
      displayLabel:
        rating == null
          ? 'Not rated'
          : `${rating}/10 (${tierWord(rating)})`,
      tooltip: tierExplanation('AI', horizon, rating),
    }
  })

  const roboticsEntries = roles.map((r) => {
    const rating = horizon === 'near' ? r.roboticsRating2030 : r.roboticsRating2040
    return {
      careerName: r.title,
      value: rating,
      displayLabel:
        rating == null
          ? 'Not rated'
          : `${rating}/10 (${tierWord(rating)})`,
      tooltip: tierExplanation('Robotics', horizon, rating),
    }
  })

  return (
    <div style={{ padding: '4px 0 8px' }}>
      <div
        role="radiogroup"
        aria-label="Future outlook horizon"
        style={{
          display: 'inline-flex',
          gap: '0',
          padding: '4px',
          background: 'var(--pf-grey-100)',
          borderRadius: '8px',
          marginBottom: '8px',
        }}
      >
        <HorizonButton
          label="Near-term (2030-2035)"
          active={horizon === 'near'}
          onClick={() => setHorizon('near')}
        />
        <HorizonButton
          label="Long-term (2040-2045)"
          active={horizon === 'long'}
          onClick={() => setHorizon('long')}
        />
      </div>

      <TieredBar
        fieldName="AI threat"
        entries={aiEntries}
      />
      <TieredBar
        fieldName="Robotics threat"
        entries={roboticsEntries}
      />

      <div
        style={{
          margin: '14px 0 0',
          padding: '10px 12px',
          background: 'var(--pf-grey-100)',
          borderRadius: '6px',
          color: 'var(--pf-grey-600)',
          fontSize: '0.75rem',
          lineHeight: 1.55,
        }}
      >
        <p style={{ margin: 0 }}>
          These ratings reflect plausible threat levels based on current AI and
          robotics capabilities and their likely trajectory. They are not
          predictions &mdash; technology moves fast and policy, regulation, and
          human preference will shape outcomes. See our AI and Robotics page
          for{' '}
          <Link
            href="/ai-careers"
            style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
          >
            methodology
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

function HorizonButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      style={{
        padding: '8px 14px',
        border: 'none',
        borderRadius: '6px',
        background: active ? 'var(--pf-white)' : 'transparent',
        color: active ? 'var(--pf-grey-900)' : 'var(--pf-grey-600)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: '0.8125rem',
        cursor: 'pointer',
        boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {label}
    </button>
  )
}

interface TierEntry {
  careerName: string
  value: number | null
  displayLabel: string
  tooltip: string
}

/**
 * Custom tiered bar for 1-10 threat ratings where fill colour derives from the
 * AI role tier (1-3 green / 4-6 amber / 7-9 orange / 10 red). Uses the existing
 * NumericBar with per-cell colouring not directly supported, so this is a
 * lightweight renderer instead.
 */
function TieredBar({
  fieldName,
  entries,
}: {
  fieldName: string
  entries: TierEntry[]
}) {
  // Pick fill colour per entry from the tier metadata.
  const ariaSummary = entries
    .map((e) => `${e.careerName} ${e.displayLabel}`)
    .join(', ')

  return (
    <div
      role="img"
      aria-label={`${fieldName}: ${ariaSummary}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: '16px',
        alignItems: 'center',
        padding: '12px 0',
        borderTop: '1px solid var(--pf-grey-100)',
      }}
    >
      <div
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--pf-grey-600)',
        }}
      >
        {fieldName}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {entries.map((e) => (
          <TieredRow key={e.careerName} entry={e} />
        ))}
      </div>
    </div>
  )
}

function TieredRow({ entry }: { entry: TierEntry }) {
  const { value, displayLabel, careerName, tooltip } = entry
  const tier = getAiRoleTier(value)
  const meta = AI_ROLE_TIER_META[tier]
  const fillPct = value == null ? 0 : (value / 10) * 100

  return (
    <div
      title={tooltip}
      style={{
        display: 'grid',
        gridTemplateColumns: '110px 1fr',
        gap: '12px',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: '#1A1A2E',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {careerName}
      </div>
      <div
        style={{
          position: 'relative',
          height: 22,
          background: 'var(--pf-grey-100)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {value != null && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${fillPct}%`,
              background: meta.text,
              opacity: 0.75,
              borderRadius: 4,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 12,
            fontWeight: 500,
            color: '#1A1A2E',
            whiteSpace: 'nowrap',
          }}
        >
          {displayLabel}
        </div>
      </div>
    </div>
  )
}
