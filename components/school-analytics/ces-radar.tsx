'use client'

import type { CesCapacities } from '@/lib/school/analytics'

const AXES: Array<{ key: keyof CesCapacities; label: string }> = [
  { key: 'self', label: 'Self' },
  { key: 'strengths', label: 'Strengths' },
  { key: 'horizons', label: 'Horizons' },
  { key: 'networks', label: 'Networks' },
]

// 4-axis radar (quadrilateral). Axes at 12, 3, 6, 9 o'clock.
function radarPoint(scoreOutOf100: number, axisIndex: number, cx: number, cy: number, radius: number): { x: number; y: number } {
  const step = (2 * Math.PI) / AXES.length
  const angle = -Math.PI / 2 + axisIndex * step
  const r = (scoreOutOf100 / 100) * radius
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function axisLabelPoint(axisIndex: number, cx: number, cy: number, radius: number): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const step = (2 * Math.PI) / AXES.length
  const angle = -Math.PI / 2 + axisIndex * step
  const r = radius + 22
  const x = cx + r * Math.cos(angle)
  const y = cy + r * Math.sin(angle)
  let anchor: 'start' | 'middle' | 'end' = 'middle'
  if (Math.cos(angle) > 0.3) anchor = 'start'
  else if (Math.cos(angle) < -0.3) anchor = 'end'
  return { x, y, anchor }
}

type Props = {
  ces: CesCapacities
  size?: number
}

export function CesRadar({ ces, size = 260 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 40

  const guideRings = [25, 50, 75, 100]
  const dataPoints = AXES.map((a, i) => radarPoint(ces[a.key].score, i, cx, cy, radius))
  const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={size} height={size} role="img" aria-label="CES capacities radar chart">
      {/* Guide rings */}
      {guideRings.map((g, idx) => {
        const pts = AXES.map((_, i) => radarPoint(g, i, cx, cy, radius))
        return (
          <polygon
            key={g}
            points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={idx === guideRings.length - 1 ? '#cbd5e1' : '#e5e7eb'}
            strokeWidth={idx === guideRings.length - 1 ? 1.5 : 1}
          />
        )
      })}
      {/* Axes */}
      {AXES.map((_, i) => {
        const outer = radarPoint(100, i, cx, cy, radius)
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e5e7eb" strokeWidth={1} />
      })}
      {/* Data polygon */}
      <polygon points={dataPoly} fill="#0059b3" fillOpacity={0.25} stroke="#0059b3" strokeWidth={2} />
      {/* Points + score labels */}
      {AXES.map((a, i) => {
        const p = dataPoints[i]
        return (
          <g key={a.key}>
            <circle cx={p.x} cy={p.y} r={4} fill="#0059b3" />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0059b3">
              {ces[a.key].score}
            </text>
          </g>
        )
      })}
      {/* Axis labels */}
      {AXES.map((a, i) => {
        const pos = axisLabelPoint(i, cx, cy, radius)
        return (
          <text
            key={a.key}
            x={pos.x}
            y={pos.y}
            textAnchor={pos.anchor}
            fontSize={13}
            fontWeight={600}
            fill="#1f2937"
            dy=".3em"
          >
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}
