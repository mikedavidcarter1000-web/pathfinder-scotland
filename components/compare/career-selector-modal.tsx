'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CareerSector, CareerRole } from '@/hooks/use-subjects'

type RoleWithSector = CareerRole & { sector_name: string }

export interface CareerSelectorModalProps {
  open: boolean
  onClose: () => void
  onSelect: (roleId: string) => void
  sectors: CareerSector[]
  rolesBySector: Map<string, CareerRole[]>
  allRoles: RoleWithSector[]
  disabledRoleIds: Set<string>
}

export function CareerSelectorModal({
  open,
  onClose,
  onSelect,
  sectors,
  rolesBySector,
  allRoles,
  disabledRoleIds,
}: CareerSelectorModalProps) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 40)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim().toLowerCase()), 120)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const searchResults = useMemo(() => {
    if (!debounced) return []
    return allRoles
      .filter((r) => r.title.toLowerCase().includes(debounced))
      .slice(0, 30)
  }, [allRoles, debounced])

  const sectorRoles = useMemo(() => {
    if (!activeSectorId) return []
    return (rolesBySector.get(activeSectorId) ?? []).slice().sort((a, b) =>
      a.title.localeCompare(b.title),
    )
  }, [activeSectorId, rolesBySector])

  if (!open) return null

  const activeSector = activeSectorId
    ? sectors.find((s) => s.id === activeSectorId)
    : null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose a career"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        backgroundColor: 'rgba(26, 26, 46, 0.55)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '4vh 16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          background: 'var(--pf-white)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--pf-grey-100)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--pf-grey-900)',
            }}
          >
            Choose a career
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: 'var(--pf-grey-600)',
              lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search 269 careers..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--pf-grey-300)',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              outline: 'none',
            }}
          />
        </div>

        <div
          style={{
            overflowY: 'auto',
            padding: '0 20px 20px',
            flex: 1,
          }}
        >
          {debounced ? (
            <SearchResultsList
              results={searchResults}
              disabledRoleIds={disabledRoleIds}
              onSelect={onSelect}
            />
          ) : activeSectorId ? (
            <SectorRoleList
              sectorName={activeSector?.name ?? ''}
              roles={sectorRoles}
              disabledRoleIds={disabledRoleIds}
              onSelect={onSelect}
              onBack={() => setActiveSectorId(null)}
            />
          ) : (
            <SectorGrid
              sectors={sectors}
              rolesBySector={rolesBySector}
              onPick={(id) => setActiveSectorId(id)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function SectorGrid({
  sectors,
  rolesBySector,
  onPick,
}: {
  sectors: CareerSector[]
  rolesBySector: Map<string, CareerRole[]>
  onPick: (id: string) => void
}) {
  return (
    <div>
      <p
        style={{
          margin: '4px 0 12px',
          fontSize: '0.8125rem',
          color: 'var(--pf-grey-600)',
        }}
      >
        Browse by sector
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '8px',
        }}
      >
        {sectors.map((s) => {
          const count = rolesBySector.get(s.id)?.length ?? 0
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick(s.id)}
              style={{
                padding: '12px 14px',
                border: '1px solid var(--pf-grey-300)',
                borderRadius: '10px',
                background: 'var(--pf-white)',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-900)',
                }}
              >
                {s.name}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--pf-grey-600)',
                }}
              >
                {count} role{count === 1 ? '' : 's'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SectorRoleList({
  sectorName,
  roles,
  disabledRoleIds,
  onSelect,
  onBack,
}: {
  sectorName: string
  roles: CareerRole[]
  disabledRoleIds: Set<string>
  onSelect: (id: string) => void
  onBack: () => void
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--pf-blue-700)',
          fontSize: '0.8125rem',
          padding: '4px 0 12px',
          cursor: 'pointer',
        }}
      >
        ← All sectors
      </button>
      <p
        style={{
          margin: '0 0 8px',
          fontWeight: 600,
          color: 'var(--pf-grey-900)',
          fontSize: '0.9375rem',
        }}
      >
        {sectorName}
      </p>
      <RoleList
        roles={roles}
        disabledRoleIds={disabledRoleIds}
        onSelect={onSelect}
      />
    </div>
  )
}

function SearchResultsList({
  results,
  disabledRoleIds,
  onSelect,
}: {
  results: RoleWithSector[]
  disabledRoleIds: Set<string>
  onSelect: (id: string) => void
}) {
  if (results.length === 0) {
    return (
      <p
        style={{
          padding: '24px 0',
          textAlign: 'center',
          color: 'var(--pf-grey-600)',
          fontSize: '0.875rem',
        }}
      >
        No matching careers.
      </p>
    )
  }
  return <RoleList roles={results} disabledRoleIds={disabledRoleIds} onSelect={onSelect} />
}

function RoleList({
  roles,
  disabledRoleIds,
  onSelect,
}: {
  roles: Array<CareerRole & { sector_name?: string }>
  disabledRoleIds: Set<string>
  onSelect: (id: string) => void
}) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {roles.map((r) => {
        const disabled = disabledRoleIds.has(r.id)
        return (
          <li key={r.id} style={{ marginBottom: '4px' }}>
            <button
              type="button"
              onClick={() => !disabled && onSelect(r.id)}
              disabled={disabled}
              title={disabled ? 'Already added to this tab' : undefined}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--pf-grey-100)',
                borderRadius: '8px',
                background: disabled ? 'var(--pf-grey-100)' : 'var(--pf-white)',
                color: disabled ? 'var(--pf-grey-600)' : 'var(--pf-grey-900)',
                textAlign: 'left',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.875rem',
              }}
            >
              <span style={{ fontWeight: 500 }}>{r.title}</span>
              {r.sector_name ? (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--pf-grey-600)',
                    flexShrink: 0,
                  }}
                >
                  {r.sector_name}
                </span>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
