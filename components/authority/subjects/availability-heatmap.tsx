'use client'

import { useMemo } from 'react'
import type { SubjectAvailabilityHeatmap } from '@/lib/authority/subjects-queries'

const NOT_OFFERED_BG = '#ffffff'
const NOT_OFFERED_BORDER = '#f1f5f9'
const SUPPRESSED_BG = '#f1f5f9'
const HIGH_COLOUR = '#1B3A5C'
const LOW_COLOUR = '#E5EEF7'

export interface AvailabilityHeatmapProps {
  heatmap: SubjectAvailabilityHeatmap
}

export function AvailabilityHeatmap({ heatmap }: AvailabilityHeatmapProps) {
  const cellMap = useMemo(() => {
    const m = new Map<string, number | null>()
    for (const c of heatmap.cells) {
      m.set(`${c.school_id}|${c.subject_id}`, c.student_count)
    }
    return m
  }, [heatmap])

  const maxValue = useMemo(() => {
    let max = 0
    for (const c of heatmap.cells) {
      if (c.student_count != null && c.student_count > max) max = c.student_count
    }
    return max
  }, [heatmap])

  if (heatmap.subjects.length === 0 || heatmap.schools.length === 0) {
    return null
  }

  const truncated = heatmap.total_subjects_in_la > heatmap.subjects.length

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: '0.75rem',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  backgroundColor: '#f8fafc',
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontSize: '0.6875rem',
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  minWidth: '180px',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                School
              </th>
              {heatmap.subjects.map((sub) => (
                <th
                  key={sub.subject_id}
                  scope="col"
                  style={{
                    padding: '8px 4px',
                    minWidth: '40px',
                    maxWidth: '40px',
                    height: '120px',
                    verticalAlign: 'bottom',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      whiteSpace: 'nowrap',
                      fontSize: '0.6875rem',
                      color: '#1a1a2e',
                      fontWeight: 500,
                      maxHeight: '110px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={sub.subject_name}
                  >
                    {sub.subject_name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmap.schools.map((school) => (
              <tr key={school.school_id}>
                <th
                  scope="row"
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    backgroundColor: '#fff',
                    padding: '6px 12px',
                    textAlign: 'left',
                    color: '#1a1a2e',
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    borderBottom: '1px solid #f1f5f9',
                    whiteSpace: 'nowrap',
                    maxWidth: '220px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={school.school_name}
                >
                  {school.school_name}
                </th>
                {heatmap.subjects.map((sub) => {
                  const v = cellMap.get(`${school.school_id}|${sub.subject_id}`) ?? 0
                  const display = renderCellLabel(v)
                  const bg = pickCellColour(v, maxValue)
                  const fg = v != null && v > maxValue * 0.5 ? '#fff' : '#1a1a2e'
                  return (
                    <td
                      key={sub.subject_id}
                      style={{
                        padding: 0,
                        textAlign: 'center',
                        backgroundColor: bg,
                        color: fg,
                        height: '32px',
                        width: '40px',
                        minWidth: '40px',
                        maxWidth: '40px',
                        border: v === 0 ? `1px solid ${NOT_OFFERED_BORDER}` : '1px solid #fff',
                        fontSize: '0.6875rem',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                      title={`${school.school_name} · ${sub.subject_name}: ${cellTooltip(v)}`}
                    >
                      {display}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          marginTop: '14px',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <LegendKey colour={NOT_OFFERED_BG} border={NOT_OFFERED_BORDER} label="Not offered" />
        <LegendKey colour={SUPPRESSED_BG} label="< 5 (suppressed)" />
        <LegendGradient label="Low → high uptake" />
        {truncated && (
          <span style={{ fontStyle: 'italic' }}>
            Showing top {heatmap.subjects.length} of {heatmap.total_subjects_in_la} subjects by uptake
          </span>
        )}
      </div>
    </div>
  )
}

function renderCellLabel(value: number | null): string {
  if (value === 0) return ''
  if (value == null) return '·'
  return String(value)
}

function cellTooltip(value: number | null): string {
  if (value === 0) return 'not offered'
  if (value == null) return 'fewer than 5 students (suppressed)'
  return `${value} students`
}

function pickCellColour(value: number | null, maxValue: number): string {
  if (value === 0) return NOT_OFFERED_BG
  if (value == null) return SUPPRESSED_BG
  if (maxValue <= 0) return LOW_COLOUR
  const t = Math.min(1, value / maxValue)
  return interpolateColour(LOW_COLOUR, HIGH_COLOUR, t)
}

function interpolateColour(from: string, to: string, t: number): string {
  const a = parseHex(from)
  const b = parseHex(to)
  const r = Math.round(a.r + (b.r - a.r) * t)
  const g = Math.round(a.g + (b.g - a.g) * t)
  const bb = Math.round(a.b + (b.b - a.b) * t)
  return `rgb(${r}, ${g}, ${bb})`
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '')
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  }
}

function LegendKey({ colour, border, label }: { colour: string; border?: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '14px',
          height: '14px',
          backgroundColor: colour,
          border: `1px solid ${border ?? '#e2e8f0'}`,
          borderRadius: '2px',
        }}
      />
      {label}
    </span>
  )
}

function LegendGradient({ label }: { label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '60px',
          height: '14px',
          background: `linear-gradient(to right, ${LOW_COLOUR}, ${HIGH_COLOUR})`,
          border: '1px solid #e2e8f0',
          borderRadius: '2px',
        }}
      />
      {label}
    </span>
  )
}
