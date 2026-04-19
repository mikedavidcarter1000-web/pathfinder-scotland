'use client'

import { useState } from 'react'

export interface HorizonRatingsProps {
  aiRating2030: number
  aiRating2040: number
  roboticsRating2030: number
  roboticsRating2040: number
  roboticsDescription: string
}

function tierColor(r: number): string {
  if (r <= 3) return 'var(--pf-green-500)'
  if (r <= 6) return 'var(--pf-amber-500)'
  return 'var(--pf-red-500)'
}

function markerPct(r: number): number {
  return ((r - 1) / 9) * 100
}

function BarRow({ near, far, rowLabel }: { near: number; far: number; rowLabel: string }) {
  const nearPct = markerPct(near)
  const farPct = markerPct(far)
  const isStable = near === far
  const minPct = Math.min(nearPct, farPct)
  const maxPct = Math.max(nearPct, farPct)

  return (
    <div style={{ marginBottom: '14px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '6px',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            color: 'var(--pf-grey-900)',
            whiteSpace: 'nowrap',
          }}
        >
          {rowLabel}
        </span>
        <span
          style={{
            fontSize: '0.5625rem',
            color: 'var(--pf-grey-400)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}
        >
          Low (1–3) · Moderate (4–6) · High (7–9)
        </span>
      </div>

      {/* Bar + markers */}
      <div style={{ position: 'relative', height: '28px' }}>
        {/* Three-segment coloured background */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: 0,
            right: 0,
            height: '8px',
            borderRadius: '4px',
            background:
              'linear-gradient(to right, rgba(16,185,129,0.35) 0%, rgba(16,185,129,0.35) 33.33%, rgba(245,158,11,0.35) 33.33%, rgba(245,158,11,0.35) 66.67%, rgba(239,68,68,0.35) 66.67%, rgba(239,68,68,0.35) 100%)',
          }}
        />

        {/* Connecting line */}
        {!isStable && (
          <div
            style={{
              position: 'absolute',
              top: '13px',
              left: `${minPct}%`,
              width: `${maxPct - minPct}%`,
              height: '2px',
              backgroundColor: 'var(--pf-grey-300)',
              zIndex: 1,
            }}
          />
        )}

        {/* Near marker -- hollow circle */}
        <div
          title={`Near-term (2030–35): ${near}/10`}
          style={{
            position: 'absolute',
            top: '6px',
            left: `${nearPct}%`,
            transform: 'translateX(-50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: 'var(--pf-white)',
            border: `2px solid ${tierColor(near)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.5625rem',
            fontWeight: 700,
            color: tierColor(near),
            zIndex: 2,
            fontFamily: "'Space Grotesk', sans-serif",
            flexShrink: 0,
          }}
        >
          {near}
        </div>

        {/* Far marker -- filled circle */}
        {!isStable && (
          <div
            title={`Long-term (2040–45): ${far}/10`}
            style={{
              position: 'absolute',
              top: '6px',
              left: `${farPct}%`,
              transform: 'translateX(-50%)',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: tierColor(far),
              border: `2px solid ${tierColor(far)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.5625rem',
              fontWeight: 700,
              color: 'var(--pf-white)',
              zIndex: 2,
              fontFamily: "'Space Grotesk', sans-serif",
              flexShrink: 0,
            }}
          >
            {far}
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '3px',
          flexWrap: 'wrap',
        }}
      >
        <LegendDot solid={false} color={tierColor(near)} />
        <span style={{ fontSize: '0.6875rem', color: 'var(--pf-grey-600)' }}>
          Near (2030–35): <strong style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{near}</strong>
        </span>

        {isStable ? (
          <span style={{ fontSize: '0.6875rem', color: 'var(--pf-grey-400)', fontStyle: 'italic' }}>
            stable
          </span>
        ) : (
          <>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--pf-grey-400)',
                lineHeight: 1,
              }}
              aria-hidden="true"
            >
              {far > near ? '→' : '←'}
            </span>
            <LegendDot solid color={tierColor(far)} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--pf-grey-600)' }}>
              Long (2040–45): <strong style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{far}</strong>
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function LegendDot({ solid, color }: { solid: boolean; color: string }) {
  return (
    <span
      style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: solid ? color : 'transparent',
        border: `2px solid ${color}`,
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: 'transform 200ms',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function HorizonRatings({
  aiRating2030,
  aiRating2040,
  roboticsRating2030,
  roboticsRating2040,
  roboticsDescription,
}: HorizonRatingsProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        marginTop: '10px',
        padding: '10px 12px',
        backgroundColor: 'var(--pf-blue-50)',
        borderRadius: '6px',
        border: '1px solid var(--pf-grey-100)',
      }}
    >
      <BarRow near={aiRating2030} far={aiRating2040} rowLabel="AI automation risk" />
      <BarRow near={roboticsRating2030} far={roboticsRating2040} rowLabel="Robotics displacement risk" />

      {roboticsDescription && (
        <div style={{ marginTop: '4px', borderTop: '1px solid var(--pf-grey-100)', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--pf-blue-700)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              padding: 0,
            }}
          >
            <ChevronIcon open={open} />
            Why robotics?
          </button>
          {open && (
            <p
              style={{
                marginTop: '6px',
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                margin: '6px 0 0',
              }}
            >
              {roboticsDescription}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
