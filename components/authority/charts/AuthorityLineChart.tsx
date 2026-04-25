'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface AuthorityLineChartDatum {
  label: string
  value: number
}

export interface AuthorityLineChartProps {
  data: AuthorityLineChartDatum[]
  height?: number
  colour?: string
  emptyMessage?: string
  ariaLabel?: string
  /** Show axes (default minimal sparkline mode = false) */
  showAxes?: boolean
}

const CORAL = '#E8593C'

export function AuthorityLineChart({
  data,
  height = 80,
  colour = CORAL,
  emptyMessage = 'No engagement data yet.',
  ariaLabel,
  showAxes = false,
}: AuthorityLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '0.875rem',
          fontStyle: 'italic',
        }}
      >
        {emptyMessage}
      </div>
    )
  }

  const summary = data.map((d) => `${d.label}: ${d.value}`).join(', ')

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? summary}
      style={{ width: '100%', height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 8, bottom: showAxes ? 18 : 4, left: showAxes ? 24 : 4 }}>
          {showAxes && (
            <>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              fontSize: '0.8125rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colour}
            strokeWidth={2}
            dot={{ r: 2, fill: colour }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
