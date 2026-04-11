import { AI_IMPACT_META, type AiImpactRating } from '@/lib/constants'

type BadgeSize = 'sm' | 'md' | 'lg'

const SIZE_STYLE: Record<BadgeSize, { padding: string; fontSize: string; icon: number }> = {
  sm: { padding: '3px 10px', fontSize: '0.6875rem', icon: 12 },
  md: { padding: '4px 12px', fontSize: '0.75rem', icon: 14 },
  lg: { padding: '6px 14px', fontSize: '0.8125rem', icon: 16 },
}

function Icon({ rating, size }: { rating: AiImpactRating; size: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (rating === 'human-centric') {
    // shield
    return (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  }
  if (rating === 'ai-augmented') {
    // refresh / change
    return (
      <svg {...common}>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </svg>
    )
  }
  // ai-exposed — alert triangle
  return (
    <svg {...common}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export function AiImpactBadge({
  rating,
  size = 'md',
  showIcon = true,
  labelOverride,
}: {
  rating: AiImpactRating
  size?: BadgeSize
  showIcon?: boolean
  labelOverride?: string
}) {
  const meta = AI_IMPACT_META[rating]
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
    >
      {showIcon && <Icon rating={rating} size={sizing.icon} />}
      <span>{labelOverride ?? meta.summary}</span>
    </span>
  )
}

export function AiImpactDot({
  rating,
  size = 10,
  title,
}: {
  rating: AiImpactRating
  size?: number
  title?: string
}) {
  const meta = AI_IMPACT_META[rating]
  return (
    <span
      aria-hidden={title ? undefined : true}
      title={title ?? `${meta.label} — ${meta.summary}`}
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '9999px',
        backgroundColor: meta.dot,
        flexShrink: 0,
      }}
    />
  )
}
