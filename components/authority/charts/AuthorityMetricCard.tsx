import type { ReactNode } from 'react'

export type MetricTrend = 'up' | 'down' | 'neutral'
export type MetricColour = 'navy' | 'green' | 'amber' | 'red' | 'grey'

const COLOUR_FG: Record<MetricColour, string> = {
  navy: '#1a1a2e',
  green: '#166534',
  amber: '#92400e',
  red: '#991b1b',
  grey: '#475569',
}

const COLOUR_BG: Record<MetricColour, string> = {
  navy: '#fff',
  green: '#f0fdf4',
  amber: '#fffbeb',
  red: '#fef2f2',
  grey: '#f8fafc',
}

const TREND_ARROW: Record<MetricTrend, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
}

const TREND_FG: Record<MetricTrend, string> = {
  up: '#166534',
  down: '#991b1b',
  neutral: '#64748b',
}

export interface AuthorityMetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: MetricTrend
  trendLabel?: string
  colour?: MetricColour
  hint?: ReactNode
}

export function AuthorityMetricCard({
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  colour = 'navy',
  hint,
}: AuthorityMetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: COLOUR_BG[colour],
        borderRadius: '12px',
        padding: '20px 22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: colour === 'navy' ? '1px solid #e2e8f0' : '1px solid transparent',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>{label}</span>
        {hint}
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '2rem',
          lineHeight: 1.1,
          color: COLOUR_FG[colour],
          margin: '8px 0 4px',
        }}
      >
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {subtitle && (
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{subtitle}</span>
        )}
        {trend && trendLabel && (
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: TREND_FG[trend],
            }}
            aria-label={`Trend ${trend}: ${trendLabel}`}
          >
            {TREND_ARROW[trend]} {trendLabel}
          </span>
        )}
      </div>
    </div>
  )
}
