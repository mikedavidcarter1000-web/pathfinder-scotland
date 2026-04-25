'use client'

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface AuthorityBarChartDatum {
  label: string
  value: number
  /** Optional override for bar colour (e.g. SIMD quintile gradient) */
  colour?: string
  /** Optional secondary value displayed in the right-hand label (e.g. percentage) */
  secondary?: string
}

export interface AuthorityBarChartProps {
  data: AuthorityBarChartDatum[]
  /** Default bar colour when `colour` not set on a datum */
  defaultColour?: string
  /** Pixel height; falls back to a per-row computed height when omitted */
  height?: number
  /** Show value as a label on the right of each bar */
  showValueLabels?: boolean
  /** Empty-state message when data array is empty */
  emptyMessage?: string
  /** aria-label override for the whole chart */
  ariaLabel?: string
}

const NAVY = '#1B3A5C'
const ROW_HEIGHT = 32

export function AuthorityBarChart({
  data,
  defaultColour = NAVY,
  height,
  showValueLabels = true,
  emptyMessage = 'No data to display.',
  ariaLabel,
}: AuthorityBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.875rem',
          fontStyle: 'italic',
        }}
      >
        {emptyMessage}
      </div>
    )
  }

  const computedHeight = height ?? Math.max(ROW_HEIGHT * data.length + 24, 80)
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const summary = data
    .map((d) => `${d.label} ${d.secondary ?? d.value}`)
    .join(', ')

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? summary}
      style={{ width: '100%', height: computedHeight }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 70, bottom: 4, left: 0 }}
          barCategoryGap={6}
        >
          <XAxis type="number" domain={[0, maxValue * 1.05]} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            tick={{ fontSize: 12, fill: '#1A1A2E' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            contentStyle={{
              fontSize: '0.8125rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name: any, entry: any) => {
              const datum = (entry?.payload ?? {}) as AuthorityBarChartDatum
              return [datum.secondary ?? value, datum.label]
            }}
            labelFormatter={() => ''}
          />
          <Bar dataKey="value" radius={[3, 3, 3, 3]} isAnimationActive={false}>
            {data.map((row, i) => (
              <Cell key={i} fill={row.colour ?? defaultColour} />
            ))}
            {showValueLabels && (
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={(props: any) => {
                  const x = Number(props?.x ?? 0)
                  const y = Number(props?.y ?? 0)
                  const width = Number(props?.width ?? 0)
                  const heightVal = Number(props?.height ?? 0)
                  const idx = props?.index as number | undefined
                  const datum = idx != null ? data[idx] : undefined
                  const text = datum?.secondary ?? String(props?.value ?? '')
                  return (
                    <text
                      x={x + Math.max(width, 2) + 6}
                      y={y + heightVal / 2}
                      dominantBaseline="middle"
                      style={{ fontSize: 12, fill: '#1A1A2E', fontWeight: 500 }}
                    >
                      {text}
                    </text>
                  )
                }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
