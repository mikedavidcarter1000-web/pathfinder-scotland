export type CompletenessSize = 'sm' | 'md'

export interface DataCompletenessIndicatorProps {
  /** 0-100. Above 95 = green, 50-94 = amber, below 50 = red. */
  completenessPercentage: number
  /** Short label for the metric (e.g. "Gender data"). Used in the tooltip. */
  label: string
  size?: CompletenessSize
  /** Override tooltip text; falls back to a generic "X% of students…" */
  tooltipText?: string
}

const SIZE_PX: Record<CompletenessSize, number> = { sm: 8, md: 10 }

function bandColour(pct: number): { bg: string; fg: string; band: 'high' | 'mid' | 'low' } {
  if (pct >= 95) return { bg: '#22c55e', fg: '#166534', band: 'high' }
  if (pct >= 50) return { bg: '#f59e0b', fg: '#92400e', band: 'mid' }
  return { bg: '#ef4444', fg: '#991b1b', band: 'low' }
}

/**
 * Inline coloured dot with an accessible tooltip.
 *
 * Uses the title attribute for the hover tooltip (universal browser support
 * and screen-reader friendly). Visible label is the dot itself; the
 * percentage is announced via aria-label so the indicator is not silent.
 */
export function DataCompletenessIndicator({
  completenessPercentage,
  label,
  size = 'sm',
  tooltipText,
}: DataCompletenessIndicatorProps) {
  const pct = Math.max(0, Math.min(100, Math.round(completenessPercentage)))
  const { bg, band } = bandColour(pct)
  const dim = SIZE_PX[size]

  const summary =
    tooltipText ?? `${pct}% of students have ${label.toLowerCase()} recorded`

  const aria = `${label}: data completeness ${pct} percent (${band === 'high' ? 'complete' : band === 'mid' ? 'partial' : 'low'})`

  return (
    <span
      role="img"
      aria-label={aria}
      title={summary}
      style={{
        display: 'inline-block',
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: '50%',
        backgroundColor: bg,
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
    />
  )
}
