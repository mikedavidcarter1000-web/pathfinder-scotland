'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  label: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  /** Text shown on the trigger when no items are selected */
  allLabel?: string
  /** Optional id for label/control wiring */
  id?: string
  /** Width of the dropdown trigger button */
  width?: string
}

/**
 * Compact multi-select with checkbox dropdown. URL-state lives outside this
 * component; pass `value` and `onChange` from a parent that owns the URL.
 *
 * Empty `value` array means "all" (no filter applied) — the trigger reflects
 * this by showing `allLabel`.
 */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  allLabel = 'All',
  id,
  width = '180px',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selectedSet = useMemo(() => new Set(value), [value])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const triggerLabel = useMemo(() => {
    if (selectedSet.size === 0) return allLabel
    if (selectedSet.size === 1) {
      const found = options.find((o) => o.value === [...selectedSet][0])
      return found?.label ?? allLabel
    }
    return `${selectedSet.size} selected`
  }, [selectedSet, options, allLabel])

  const toggleValue = (v: string) => {
    if (selectedSet.has(v)) {
      onChange(value.filter((x) => x !== v))
    } else {
      onChange([...value, v])
    }
  }

  const clear = () => onChange([])

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '4px',
        }}
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          backgroundColor: '#fff',
          fontSize: '0.875rem',
          color: '#1a1a2e',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          fontFamily: 'inherit',
        }}
      >
        <span>{triggerLabel}</span>
        <span aria-hidden="true" style={{ color: '#94a3b8' }}>▾</span>
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          style={{
            position: 'absolute',
            zIndex: 20,
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: '100%',
            maxHeight: '320px',
            overflowY: 'auto',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
            padding: '8px',
          }}
        >
          {options.length === 0 ? (
            <p style={{ margin: 0, padding: '8px 12px', fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' }}>
              No options
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={clear}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  fontSize: '0.8125rem',
                  color: 'var(--pf-blue-700, #1d4ed8)',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: '4px',
                  fontFamily: 'inherit',
                }}
              >
                Clear ({allLabel})
              </button>
              {options.map((o) => {
                const checked = selectedSet.has(o.value)
                return (
                  <label
                    key={o.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#1a1a2e',
                      backgroundColor: checked ? '#f0f9ff' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(o.value)}
                      style={{ margin: 0 }}
                    />
                    <span>{o.label}</span>
                  </label>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
