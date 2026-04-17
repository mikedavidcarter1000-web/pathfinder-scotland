import { RIASEC_ORDER, RIASEC_LABELS } from './constants'
import type { Scores } from './types'

type Props = {
  scores: Scores
  size?: number
}

const MAX_RADIUS = 140
const LABEL_RADIUS = 170
const GRID_RINGS = [0.2, 0.4, 0.6, 0.8, 1]

/**
 * Produce the (x, y) position for a vertex at a given radius.
 * Index 0 sits at the top (12 o'clock); the hexagon winds clockwise.
 */
function vertex(index: number, radius: number, cx = 200, cy = 200) {
  const angle = (index * 60 - 90) * (Math.PI / 180)
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

function hexPath(radius: number) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const { x, y } = vertex(i, radius)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  return points.join(' ')
}

export function RadarChart({ scores, size = 340 }: Props) {
  const dataPoints = RIASEC_ORDER.map((t, i) => {
    const pct = Math.max(0, Math.min(100, scores[t])) / 100
    return vertex(i, MAX_RADIUS * pct)
  })
  const dataPath = dataPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')

  return (
    <svg
      viewBox="-70 -10 540 420"
      width={size}
      height={size}
      role="img"
      aria-label="RIASEC profile radar chart"
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
    >
      {/* Grid rings */}
      {GRID_RINGS.map((r) => (
        <polygon
          key={r}
          points={hexPath(MAX_RADIUS * r)}
          fill="none"
          stroke="var(--pf-grey-300)"
          strokeWidth={1}
        />
      ))}

      {/* Spokes from centre to each vertex */}
      {RIASEC_ORDER.map((_, i) => {
        const v = vertex(i, MAX_RADIUS)
        return (
          <line
            key={i}
            x1={200}
            y1={200}
            x2={v.x}
            y2={v.y}
            stroke="var(--pf-grey-300)"
            strokeWidth={1}
          />
        )
      })}

      {/* Data polygon */}
      <polygon
        points={dataPath}
        fill="var(--pf-blue-500)"
        fillOpacity={0.28}
        stroke="var(--pf-blue-700)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data vertex markers */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="var(--pf-blue-700)"
        />
      ))}

      {/* Axis labels: name + score */}
      {RIASEC_ORDER.map((t, i) => {
        const label = vertex(i, LABEL_RADIUS)
        const score = vertex(i, LABEL_RADIUS + 18)
        // Slight vertical tweaks so top/bottom labels don't crowd the hexagon.
        const anchor =
          Math.abs(label.x - 200) < 2 ? 'middle' : label.x > 200 ? 'start' : 'end'
        return (
          <g key={t}>
            <text
              x={label.x}
              y={label.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontFamily="'Space Grotesk', sans-serif"
              fontSize={14}
              fontWeight={600}
              fill="var(--pf-grey-900)"
            >
              {RIASEC_LABELS[t]}
            </text>
            <text
              x={score.x}
              y={score.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontFamily="'Space Grotesk', sans-serif"
              fontSize={12}
              fontWeight={500}
              fill="var(--pf-grey-600)"
            >
              {scores[t]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
