'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  MAX_SLOTS_PER_TAB,
  MAX_TABS,
  MIN_SLOTS_PER_TAB,
  cloneState,
  emptyCompareState,
  parseCompareParam,
  serializeCompareState,
  type CompareState,
} from '@/lib/compare/url-state'
import { ACTIVE_COMPARE_COOKIE } from '@/lib/compare/active-compare-cookie'
import { useAuth } from '@/hooks/use-auth'
import { useAiCareersHubData } from '@/hooks/use-subjects'
import { CareerSelectorModal } from './career-selector-modal'
import { CareerSlot } from './career-slot'
import { ComparisonGrid } from './ComparisonGrid'
import { SaveComparisonControl } from './save-comparison-control'

export interface CompareShellProps {
  exampleRoleIds: string[]
}

type SelectorTarget = {
  tabIndex: number
  // When slotIndex is null, the modal is adding into the next empty slot.
  slotIndex: number | null
} | null

export function CompareShell({ exampleRoleIds }: CompareShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: hub, isLoading } = useAiCareersHubData()

  const rawT = searchParams?.get('t') ?? null
  const initialState = useMemo<CompareState>(() => {
    if (rawT) return parseCompareParam(rawT)
    if (exampleRoleIds.length >= MIN_SLOTS_PER_TAB) {
      return {
        tabs: [{ roleIds: exampleRoleIds.slice(0, MAX_SLOTS_PER_TAB) }],
      }
    }
    return emptyCompareState()
    // Only on first mount: URL + seed drive initial state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [state, setState] = useState<CompareState>(initialState)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [selectorTarget, setSelectorTarget] = useState<SelectorTarget>(null)
  const [tooltip, setTooltip] = useState<string | null>(null)
  // Banner shows only on first-time visit (no ?t= param and seed applied).
  const [bannerVisible, setBannerVisible] = useState(
    () => !rawT && exampleRoleIds.length >= MIN_SLOTS_PER_TAB,
  )
  const isExampleSession = useRef(bannerVisible)

  // Sync state -> URL (replace, no history push) whenever state changes.
  // Also mirror the current ?t= value into a 24h cookie so other pages
  // (e.g. the "Compare this career" button on role pages) can resume the
  // active comparison.
  useEffect(() => {
    const serialised = serializeCompareState(state)
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (serialised) params.set('t', serialised)
    else params.delete('t')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })

    if (typeof document !== 'undefined') {
      const cookieValue = serialised ?? ''
      // max-age 86400s = 24h. SameSite=Lax lets cross-page GETs read the cookie.
      if (cookieValue) {
        document.cookie = `${ACTIVE_COMPARE_COOKIE}=${encodeURIComponent(
          cookieValue,
        )}; path=/; max-age=86400; samesite=lax`
      } else {
        document.cookie = `${ACTIVE_COMPARE_COOKIE}=; path=/; max-age=0; samesite=lax`
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  useEffect(() => {
    if (!tooltip) return
    const id = setTimeout(() => setTooltip(null), 2400)
    return () => clearTimeout(id)
  }, [tooltip])

  const dismissExamples = useCallback(() => {
    if (!isExampleSession.current) return
    isExampleSession.current = false
    setBannerVisible(false)
  }, [])

  const updateTab = useCallback(
    (tabIndex: number, fn: (tab: { roleIds: string[] }) => { roleIds: string[] }) => {
      setState((prev) => {
        const next = cloneState(prev)
        next.tabs[tabIndex] = fn(next.tabs[tabIndex])
        return next
      })
    },
    [],
  )

  const openSelectorForAdd = (tabIndex: number) => {
    const tab = state.tabs[tabIndex]
    if (tab.roleIds.length >= MAX_SLOTS_PER_TAB) {
      setTooltip('Maximum 3 careers per comparison')
      return
    }
    setSelectorTarget({ tabIndex, slotIndex: null })
  }

  const openSelectorForChange = (tabIndex: number, slotIndex: number) => {
    setSelectorTarget({ tabIndex, slotIndex })
  }

  const handleRemove = (tabIndex: number, slotIndex: number) => {
    dismissExamples()
    updateTab(tabIndex, (tab) => ({
      roleIds: tab.roleIds.filter((_, i) => i !== slotIndex),
    }))
  }

  const handleSelect = (roleId: string) => {
    if (!selectorTarget) return
    const { tabIndex, slotIndex } = selectorTarget
    dismissExamples()
    updateTab(tabIndex, (tab) => {
      if (slotIndex == null) {
        if (tab.roleIds.includes(roleId)) return tab
        return { roleIds: [...tab.roleIds, roleId].slice(0, MAX_SLOTS_PER_TAB) }
      }
      const next = [...tab.roleIds]
      next[slotIndex] = roleId
      return { roleIds: next }
    })
    setSelectorTarget(null)
  }

  const addTab = () => {
    if (state.tabs.length >= MAX_TABS) return
    setState((prev) => {
      const next = cloneState(prev)
      next.tabs.push({ roleIds: [] })
      return next
    })
    setActiveTabIndex(state.tabs.length)
  }

  const closeTab = (tabIndex: number) => {
    if (state.tabs.length <= 1) return
    setState((prev) => {
      const next = cloneState(prev)
      next.tabs.splice(tabIndex, 1)
      return next
    })
    setActiveTabIndex((i) => {
      if (i > tabIndex) return i - 1
      if (i === tabIndex) return Math.max(0, i - 1)
      return i
    })
  }

  const { user, isLoading: authLoading } = useAuth()

  const activeTab = state.tabs[activeTabIndex] ?? { roleIds: [] }
  const populatedCount = activeTab.roleIds.length
  const slotsToRender = Math.min(
    MAX_SLOTS_PER_TAB,
    Math.max(populatedCount + 1, MIN_SLOTS_PER_TAB),
  )

  const disabledRoleIdsForTab = useMemo(() => {
    if (!selectorTarget) return new Set<string>()
    const tab = state.tabs[selectorTarget.tabIndex]
    if (!tab) return new Set<string>()
    const set = new Set(tab.roleIds.map((id) => id.toLowerCase()))
    // Allow re-picking the same role when we're changing (so the current slot
    // doesn't disable its own role). Remove the role at slotIndex.
    if (selectorTarget.slotIndex != null) {
      const current = tab.roleIds[selectorTarget.slotIndex]
      if (current) set.delete(current.toLowerCase())
    }
    return set
  }, [selectorTarget, state])

  const roleById = useMemo(() => {
    const map = new Map<string, NonNullable<typeof hub>['allRoles'][number]>()
    if (!hub) return map
    for (const r of hub.allRoles) map.set(r.id, r)
    return map
  }, [hub])

  const sectorById = useMemo(() => {
    const map = new Map<string, NonNullable<typeof hub>['sectors'][number]>()
    if (!hub) return map
    for (const s of hub.sectors) map.set(s.id, s)
    return map
  }, [hub])

  return (
    <div style={{ width: '100%' }}>
      {bannerVisible ? (
        <div
          role="note"
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            background: 'var(--pf-blue-50)',
            border: '1px solid var(--pf-blue-100)',
            borderRadius: '8px',
            color: 'var(--pf-blue-900)',
            fontSize: '0.875rem',
          }}
        >
          <strong>Example comparison.</strong> Pick your own careers to start.
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px',
          borderBottom: '1px solid var(--pf-grey-300)',
          marginBottom: '20px',
        }}
      >
      <div
        role="tablist"
        aria-label="Comparison tabs"
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '0',
          flex: 1,
          minWidth: 0,
        }}
      >
        {state.tabs.map((_, i) => {
          const active = i === activeTabIndex
          return (
            <div
              key={i}
              role="tab"
              aria-selected={active}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 4px 8px 12px',
                borderBottom: active
                  ? '2px solid var(--pf-blue-500)'
                  : '2px solid transparent',
                color: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
                fontWeight: active ? 600 : 500,
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTabIndex(i)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  font: 'inherit',
                  padding: '0',
                }}
              >
                Comparison {i + 1}
              </button>
              {state.tabs.length > 1 ? (
                <button
                  type="button"
                  onClick={() => closeTab(i)}
                  aria-label={`Close comparison ${i + 1}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--pf-grey-600)',
                    cursor: 'pointer',
                    padding: '0 6px',
                    fontSize: '1rem',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              ) : (
                <span style={{ width: '10px' }} />
              )}
            </div>
          )
        })}
        {state.tabs.length < MAX_TABS ? (
          <button
            type="button"
            onClick={addTab}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--pf-blue-700)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              padding: '8px 12px',
              flexShrink: 0,
            }}
          >
            + New comparison
          </button>
        ) : null}
      </div>
      <SaveComparisonControl
        isAuthenticated={!authLoading && !!user}
        canSave={populatedCount >= MIN_SLOTS_PER_TAB}
        roleIds={activeTab.roleIds}
      />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {Array.from({ length: slotsToRender }).map((_, slotIndex) => {
          const roleId = activeTab.roleIds[slotIndex] ?? null
          const role = roleId ? roleById.get(roleId) ?? null : null
          const sector = role ? sectorById.get(role.career_sector_id) ?? null : null
          return (
            <CareerSlot
              key={slotIndex}
              role={role}
              sector={sector}
              onAdd={() => openSelectorForAdd(activeTabIndex)}
              onChange={() => openSelectorForChange(activeTabIndex, slotIndex)}
              onRemove={() => handleRemove(activeTabIndex, slotIndex)}
            />
          )
        })}
      </div>

      {tooltip ? (
        <div
          role="status"
          style={{
            marginBottom: '16px',
            padding: '8px 12px',
            background: 'var(--pf-grey-100)',
            borderRadius: '6px',
            color: 'var(--pf-grey-900)',
            fontSize: '0.8125rem',
          }}
        >
          {tooltip}
        </div>
      ) : null}

      {populatedCount < MIN_SLOTS_PER_TAB ? (
        <div
          style={{
            padding: '16px',
            border: '1px dashed var(--pf-grey-300)',
            borderRadius: '8px',
            background: 'var(--pf-white)',
            color: 'var(--pf-grey-600)',
            fontSize: '0.875rem',
          }}
        >
          Add at least 2 careers to see a comparison.
        </div>
      ) : (
        <ComparisonGrid roleIds={activeTab.roleIds} />
      )}

      {hub && selectorTarget !== null ? (
        <CareerSelectorModal
          key={`${selectorTarget.tabIndex}:${selectorTarget.slotIndex ?? 'add'}`}
          open
          onClose={() => setSelectorTarget(null)}
          onSelect={handleSelect}
          sectors={hub.sectors}
          rolesBySector={hub.rolesBySector}
          allRoles={hub.allRoles}
          disabledRoleIds={disabledRoleIdsForTab}
        />
      ) : null}

      {isLoading && selectorTarget !== null ? (
        <p
          style={{
            marginTop: '12px',
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
          }}
        >
          Loading careers&hellip;
        </p>
      ) : null}
    </div>
  )
}
