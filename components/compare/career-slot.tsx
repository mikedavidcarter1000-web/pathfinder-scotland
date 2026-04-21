'use client'

import type { CareerRole, CareerSector } from '@/hooks/use-subjects'

export interface CareerSlotProps {
  role: CareerRole | null
  sector: CareerSector | null
  onAdd: () => void
  onChange: () => void
  onRemove: () => void
}

export function CareerSlot({ role, sector, onAdd, onChange, onRemove }: CareerSlotProps) {
  if (!role) {
    return (
      <button
        type="button"
        onClick={onAdd}
        style={{
          width: '100%',
          minHeight: '180px',
          border: '2px dashed var(--pf-grey-300)',
          borderRadius: '12px',
          background: 'var(--pf-grey-100)',
          color: 'var(--pf-blue-700)',
          fontWeight: 600,
          fontSize: '0.9375rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        + Add career
      </button>
    )
  }

  return (
    <div
      style={{
        border: '1px solid var(--pf-grey-300)',
        borderRadius: '12px',
        background: 'var(--pf-white)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minHeight: '180px',
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove this career"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'transparent',
          border: 'none',
          color: 'var(--pf-grey-600)',
          fontSize: '1.125rem',
          cursor: 'pointer',
          lineHeight: 1,
          padding: '4px 8px',
        }}
      >
        ×
      </button>
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: '64px',
          borderRadius: '8px',
          background:
            'linear-gradient(135deg, var(--pf-blue-100), var(--pf-blue-50))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
        }}
      >
        {role.title.slice(0, 1).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--pf-grey-900)',
            paddingRight: '20px',
          }}
        >
          {role.title}
        </p>
        {sector ? (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
            }}
          >
            {sector.name}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onChange}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid var(--pf-blue-500)',
          background: 'var(--pf-white)',
          color: 'var(--pf-blue-700)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Change
      </button>
    </div>
  )
}
