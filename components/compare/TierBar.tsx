'use client'

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'

export type TierBarDirection = 'positive' | 'negative' | 'neutral'

export interface TierBarEntry {
  careerName: string
  tierLabel: string | null
}

export interface TierBarProps {
  fieldName: string
  scale: readonly string[]
  direction: TierBarDirection
  entries: TierBarEntry[]
}

const CORAL = '#E8593C'
const NAVY = '#1B3A5C'
const MUTED_RED = '#B0463C'
const EMPTY = '#E5E7EB'
const ROW_HEIGHT = 36

function colourFor(direction: TierBarDirection): string {
  if (direction === 'positive') return CORAL
  if (direction === 'negative') return MUTED_RED
  return NAVY
}

function directionLabel(direction: TierBarDirection): string {
  if (direction === 'positive') return 'Higher is better.'
  if (direction === 'negative') return 'Higher is worse.'
  return 'Neutral scale; interpret in context.'
}

export function TierBar({ fieldName, scale, direction, entries }: TierBarProps) {
  const fill = colourFor(direction)
  const ariaSummary = entries
    .map((e) => `${e.careerName} ${e.tierLabel ?? 'unknown'}`)
    .join(', ')

  const data = entries.map((entry) => {
    const idx = entry.tierLabel ? scale.indexOf(entry.tierLabel) : -1
    const value = idx >= 0 ? idx + 1 : 0
    return {
      careerName: entry.careerName,
      value,
      label: entry.tierLabel ?? '\u2014',
      fill: idx >= 0 ? fill : EMPTY,
    }
  })

  const chartHeight = Math.max(ROW_HEIGHT * entries.length + 8, 48)

  return (
    <div
      role="img"
      aria-label={`${fieldName}: ${ariaSummary}`}
      title={directionLabel(direction)}
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
            margin={{ top: 0, right: 96, bottom: 0, left: 0 }}
            barCategoryGap={6}
          >
            <XAxis type="number" domain={[0, scale.length]} hide />
            <YAxis
              type="category"
              dataKey="careerName"
              width={110}
              tick={{ fontSize: 12, fill: '#1A1A2E' }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="value" radius={[3, 3, 3, 3]} isAnimationActive={false}>
              {data.map((row, i) => (
                <Cell key={i} fill={row.fill} />
              ))}
              <LabelList
                dataKey="label"
                position="right"
                style={{ fontSize: 12, fill: '#1A1A2E', fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
