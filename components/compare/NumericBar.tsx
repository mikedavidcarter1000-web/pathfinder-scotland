'use client'

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

export interface NumericBarEntry {
  careerName: string
  value: number | null
  displayLabel?: string
}

export interface NumericBarProps {
  fieldName: string
  entries: NumericBarEntry[]
  maxForScale: number
  referenceValue?: number
  referenceLabel?: string
  unitSuffix?: string
  direction?: 'positive' | 'negative' | 'neutral'
}

const CORAL = '#E8593C'
const NAVY = '#1B3A5C'
const MUTED_RED = '#B0463C'
const EMPTY = '#E5E7EB'
const ROW_HEIGHT = 36

function colourFor(direction: NumericBarProps['direction']): string {
  if (direction === 'positive') return CORAL
  if (direction === 'negative') return MUTED_RED
  return NAVY
}

export function NumericBar({
  fieldName,
  entries,
  maxForScale,
  referenceValue,
  referenceLabel,
  unitSuffix = '',
  direction = 'neutral',
}: NumericBarProps) {
  const fill = colourFor(direction)
  const ariaSummary = entries
    .map((e) =>
      e.value == null
        ? `${e.careerName} unknown`
        : `${e.careerName} ${e.displayLabel ?? `${e.value}${unitSuffix}`}`,
    )
    .join(', ')

  const data = entries.map((e) => ({
    careerName: e.careerName,
    value: e.value ?? 0,
    label:
      e.value == null
        ? '\u2014'
        : e.displayLabel ?? `${e.value}${unitSuffix}`,
    fill: e.value == null ? EMPTY : fill,
  }))

  const chartHeight = Math.max(ROW_HEIGHT * entries.length + 8, 48)

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
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 80, bottom: 0, left: 0 }}
            barCategoryGap={6}
          >
            <XAxis type="number" domain={[0, maxForScale]} hide />
            <YAxis
              type="category"
              dataKey="careerName"
              width={110}
              tick={{ fontSize: 12, fill: '#1A1A2E' }}
              axisLine={false}
              tickLine={false}
            />
            {referenceValue != null ? (
              <ReferenceLine
                x={referenceValue}
                stroke="#4A4A5A"
                strokeDasharray="4 4"
                label={
                  referenceLabel
                    ? {
                        value: referenceLabel,
                        position: 'top',
                        fontSize: 11,
                        fill: '#4A4A5A',
                      }
                    : undefined
                }
              />
            ) : null}
            <Bar dataKey="value" radius={[3, 3, 3, 3]} isAnimationActive={false}>
              {data.map((row, i) => (
                <Cell key={i} fill={row.fill} />
              ))}
              <LabelList
                dataKey="label"
                position="right"
                style={{ fontSize: 12, fill: '#1A1A2E', fontWeight: 500 }}
                offset={8}
                content={(props: {
                  x?: number | string
                  y?: number | string
                  width?: number | string
                  height?: number | string
                  value?: number | string
                }) => {
                  const x = Number(props.x ?? 0)
                  const y = Number(props.y ?? 0)
                  const width = Number(props.width ?? 0)
                  const height = Number(props.height ?? 0)
                  const text = String(props.value ?? '')
                  return (
                    <text
                      x={x + Math.max(width, 2) + 6}
                      y={y + height / 2}
                      dominantBaseline="middle"
                      style={{ fontSize: 12, fill: '#1A1A2E', fontWeight: 500 }}
                    >
                      {text}
                    </text>
                  )
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
