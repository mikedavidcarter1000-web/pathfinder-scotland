import { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: string | number
  caption?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  size?: 'sm' | 'md' | 'lg'
}

// All stats cards use the Pathfinder Saltire blue accent.
// The `color` prop is accepted for backwards-compat but ignored visually.
export function StatsCard({
  label,
  value,
  caption,
  icon,
  trend,
  size = 'md',
}: StatsCardProps) {
  const sizes = {
    sm: { padding: '14px', iconBox: 32, iconInner: 16, valueText: '1.25rem', labelText: '0.75rem' },
    md: { padding: '16px', iconBox: 36, iconInner: 18, valueText: '1.5rem', labelText: '0.8125rem' },
    lg: { padding: '24px', iconBox: 48, iconInner: 24, valueText: '2rem', labelText: '1rem' },
  }[size]

  return (
    <div className="pf-card-flat" style={{ padding: sizes.padding }}>
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontSize: sizes.labelText,
            color: 'var(--pf-grey-600)',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            className="rounded-lg flex items-center justify-center"
            style={{
              width: sizes.iconBox,
              height: sizes.iconBox,
              backgroundColor: 'var(--pf-blue-100)',
              color: 'var(--pf-blue-700)',
            }}
          >
            <span style={{ width: sizes.iconInner, height: sizes.iconInner, display: 'inline-block' }}>
              {icon}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span
          className="pf-data-number"
          style={{
            fontSize: sizes.valueText,
            color: 'var(--pf-grey-900)',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {trend && (
          <div
            className="flex items-center gap-1"
            style={{
              color: trend.positive ? 'var(--pf-green-500)' : 'var(--pf-red-500)',
            }}
          >
            <svg
              className={`w-4 h-4 ${trend.positive ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </span>
          </div>
        )}
      </div>
      {trend?.label && (
        <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
          {trend.label}
        </p>
      )}
      {caption && !trend?.label && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--pf-amber-500)',
            marginTop: '6px',
            fontWeight: 600,
          }}
        >
          {caption}
        </p>
      )}
    </div>
  )
}

interface StatsGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
}

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }

  return <div className={`grid ${columnClasses[columns]} gap-3 sm:gap-4`}>{children}</div>
}
