// URL state for /careers/compare: query param `?t=<tab1>|<tab2>|<tab3>`
// where each tab is a comma-separated list of role UUIDs.
// Example: ?t=uuid1,uuid2,uuid3|uuid4,uuid5

export const MAX_TABS = 3
export const MAX_SLOTS_PER_TAB = 3
export const MIN_SLOTS_PER_TAB = 2

export type CompareTab = {
  roleIds: string[]
}

export type CompareState = {
  tabs: CompareTab[]
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(s: string): boolean {
  return UUID_RE.test(s)
}

// Parse the `t` param into a CompareState. Never throws: any malformed input
// collapses to a single empty tab. Tabs beyond MAX_TABS are discarded; roles
// beyond MAX_SLOTS_PER_TAB per tab are discarded; duplicates within a tab are
// collapsed; non-UUID tokens are filtered out.
export function parseCompareParam(raw: string | null | undefined): CompareState {
  if (!raw) return { tabs: [{ roleIds: [] }] }

  const rawTabs = raw.split('|')
  const tabs: CompareTab[] = []

  for (const rawTab of rawTabs) {
    if (tabs.length >= MAX_TABS) break
    const tokens = rawTab
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && isUuid(t))

    const seen = new Set<string>()
    const roleIds: string[] = []
    for (const id of tokens) {
      const lower = id.toLowerCase()
      if (seen.has(lower)) continue
      seen.add(lower)
      roleIds.push(lower)
      if (roleIds.length >= MAX_SLOTS_PER_TAB) break
    }
    tabs.push({ roleIds })
  }

  if (tabs.length === 0) return { tabs: [{ roleIds: [] }] }
  return { tabs }
}

// Serialise CompareState to the `t` query value. Returns null when the state is
// a single empty tab (meaning the caller can strip the param entirely).
export function serializeCompareState(state: CompareState): string | null {
  if (state.tabs.length === 0) return null
  if (state.tabs.length === 1 && state.tabs[0].roleIds.length === 0) return null

  return state.tabs
    .slice(0, MAX_TABS)
    .map((tab) => tab.roleIds.slice(0, MAX_SLOTS_PER_TAB).join(','))
    .join('|')
}

export function emptyCompareState(): CompareState {
  return { tabs: [{ roleIds: [] }] }
}

export function cloneState(state: CompareState): CompareState {
  return { tabs: state.tabs.map((t) => ({ roleIds: [...t.roleIds] })) }
}
