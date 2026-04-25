'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Dropdown to download the current Equity-tab view as CSV or Excel.
 *
 * Mirrors `subjects-export-button.tsx`: forwards every dashboard filter
 * querystring param (except `tab`) to `/api/authority/equity/export` so the
 * downloaded file matches what the user sees on screen.
 */
export function EquityExportButton() {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

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

  const buildHref = (format: 'csv' | 'xlsx') => {
    const sp = new URLSearchParams()
    for (const [k, v] of searchParams.entries()) {
      if (k === 'tab') continue
      sp.append(k, v)
    }
    sp.set('format', format)
    return `/api/authority/equity/export?${sp.toString()}`
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid #1d4ed8',
          backgroundColor: '#1d4ed8',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        Export this view
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            zIndex: 30,
            top: 'calc(100% + 4px)',
            right: 0,
            minWidth: '220px',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
            padding: '6px',
          }}
        >
          <ExportLink href={buildHref('csv')} label="CSV (SIMD gap + groups)" sublabel="Single flat file" />
          <ExportLink href={buildHref('xlsx')} label="Excel workbook" sublabel="Eight sheets covering every section" />
        </div>
      )}
    </div>
  )
}

function ExportLink({
  href,
  label,
  sublabel,
}: {
  href: string
  label: string
  sublabel: string
}) {
  return (
    <a
      href={href}
      role="menuitem"
      style={{
        display: 'block',
        padding: '8px 12px',
        borderRadius: '6px',
        textDecoration: 'none',
        color: '#1a1a2e',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#f0f9ff'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
      }}
    >
      <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600 }}>{label}</span>
      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{sublabel}</span>
    </a>
  )
}
