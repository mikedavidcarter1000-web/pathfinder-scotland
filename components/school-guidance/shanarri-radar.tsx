'use client'

import { SHANARRI_INDICATORS, radarAxisLabel, radarPoints, type ShanarriScores } from '@/lib/school/shanarri'

type Props = {
  scores: ShanarriScores
  size?: number
  ariaLabel?: string
}

export function ShanarriRadar({ scores, size = 260, ariaLabel = 'SHANARRI wellbeing indicators' }: Props) {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 36

  // Concentric guide polygons at 1,2,3,4,5
  const guidePolygons: string[] = []
  for (let score = 1; score <= 5; score++) {
    const guide: ShanarriScores = {
      safe: score,
      healthy: score,
      achieving: score,
      nurtured: score,
      active: score,
      respected: score,
      responsible: score,
      included: score,
    }
    guidePolygons.push(radarPoints(guide, cx, cy, radius))
  }

  const dataPolygon = radarPoints(scores, cx, cy, radius)

  return (
    <svg width={size} height={size} role="img" aria-label={ariaLabel}>
      {/* Guide polygons */}
      {guidePolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke={i === guidePolygons.length - 1 ? '#cbd5e1' : '#e5e7eb'}
          strokeWidth={i === guidePolygons.length - 1 ? 1.5 : 1}
        />
      ))}
      {/* Axis labels */}
      {SHANARRI_INDICATORS.map((ind, i) => {
        const pos = radarAxisLabel(i, cx, cy, radius)
        return (
          <text
            key={ind.key}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            fontSize={11}
            fill="#475569"
            dy=".3em"
          >
            {ind.label}
          </text>
        )
      })}
      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="#0059b3"
        fillOpacity={0.25}
        stroke="#0059b3"
        strokeWidth={2}
      />
      {/* Data points */}
      {SHANARRI_INDICATORS.map((ind, i) => {
        const pts = dataPolygon.split(' ')
        const [x, y] = pts[i].split(',').map(Number)
        return <circle key={ind.key} cx={x} cy={y} r={3} fill="#0059b3" />
      })}
    </svg>
  )
}
