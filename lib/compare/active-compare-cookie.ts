// Helper to derive the href for a "Compare this career" button. Reads the
// pathfinder_active_compare cookie (if any), parses it as a compare URL state,
// and returns a /careers/compare?t=... URL that appends the current role to
// tab 1 when there is space, or starts a fresh comparison otherwise.

import {
  MAX_SLOTS_PER_TAB,
  cloneState,
  emptyCompareState,
  parseCompareParam,
  serializeCompareState,
} from './url-state'

export const ACTIVE_COMPARE_COOKIE = 'pathfinder_active_compare'

export function buildCompareHrefForRole(
  roleId: string,
  cookieValue: string | undefined,
): string {
  const safeRole = roleId.toLowerCase()

  const base = cookieValue ? parseCompareParam(cookieValue) : null
  const state = base && base.tabs.length > 0 ? cloneState(base) : emptyCompareState()

  const tab1 = state.tabs[0] ?? { roleIds: [] }

  // If the role is already in tab 1, just open the existing comparison.
  if (!tab1.roleIds.includes(safeRole)) {
    if (tab1.roleIds.length < MAX_SLOTS_PER_TAB) {
      state.tabs[0] = { roleIds: [...tab1.roleIds, safeRole] }
    } else {
      // Tab 1 is full — start a fresh comparison with this role only.
      return `/careers/compare?t=${encodeURIComponent(safeRole)}`
    }
  }

  const serialised = serializeCompareState(state) ?? safeRole
  return `/careers/compare?t=${encodeURIComponent(serialised)}`
}
