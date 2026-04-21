import { AI_ROLE_TIER_META, getAiRoleTier } from '@/lib/constants'

type BadgeSize = 'sm' | 'md' | 'lg'

const SIZE_STYLE: Record<
  BadgeSize,
  { padding: string; fontSize: string; numberSize: string }
> = {
  sm: { padding: '3px 10px', fontSize: '0.6875rem', numberSize: '0.75rem' },
  md: { padding: '4px 12px', fontSize: '0.75rem', numberSize: '0.8125rem' },
  lg: { padding: '6px 14px', fontSize: '0.8125rem', numberSize: '0.9375rem' },
}

export function AiRoleBadge({
  rating,
  size = 'md',
  showLabel = true,
  metric = 'AI',
}: {
  rating: number
  size?: BadgeSize
  showLabel?: boolean
  metric?: 'AI' | 'Robotics'
}) {
  const tier = getAiRoleTier(rating)
  const meta = AI_ROLE_TIER_META[tier]
  const sizing = SIZE_STYLE[size]
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: '6px',
        padding: sizing.padding,
        borderRadius: '9999px',
        fontSize: sizing.fontSize,
        fontWeight: 600,
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: meta.bg,
        color: meta.text,
      }}
      title={`${metric} rating ${rating}/10 — ${meta.label}: ${meta.description}`}
    >
      <span
        style={{
          fontSize: sizing.numberSize,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {rating}
        <span style={{ opacity: 0.6, fontSize: '0.75em' }}>/10</span>
      </span>
      {showLabel && <span>{meta.label}</span>}
    </span>
  )
}

export function AiRoleDot({
  rating,
  size = 10,
}: {
  rating: number
  size?: number
}) {
  const tier = getAiRoleTier(rating)
  const meta = AI_ROLE_TIER_META[tier]
  return (
    <span
      title={`AI rating ${rating}/10 — ${meta.label}`}
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '9999px',
        backgroundColor: meta.text,
        flexShrink: 0,
      }}
    />
  )
}
