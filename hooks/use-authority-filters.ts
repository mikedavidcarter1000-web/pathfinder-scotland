'use client'

import { useCallback, useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ALL_GENDERS,
  ALL_SIMD_QUINTILES,
  ALL_YEAR_GROUPS,
  type AuthorityFilters,
  type DashboardTab,
  parseAuthorityFilters,
  parseDashboardTab,
  serializeAuthorityFilters,
} from '@/lib/authority/filters'

export type UseAuthorityFiltersResult = {
  filters: AuthorityFilters
  tab: DashboardTab
  isPending: boolean
  setSchools: (next: string[]) => void
  setYearGroups: (next: string[]) => void
  setSimd: (next: string[]) => void
  setGenders: (next: string[]) => void
  setAcademicYear: (next: string | 'all') => void
  setTerm: (next: 1 | 2 | 3 | 4 | 'full') => void
  setTab: (next: DashboardTab) => void
  resetAll: () => void
}

/**
 * Reads / writes filter state via URL search params. Filter state and the
 * active tab live in the URL so views are bookmarkable and shareable.
 *
 * URL params:
 *   tab=overview|subjects|equity|careers|engagement|benchmarking
 *   schools=<comma-separated UUIDs>
 *   year_groups=S1,S2,...
 *   simd=Q1,Q2,...
 *   gender=Male,Female,Other
 *   ay=YYYY-YY|all
 *   term=1|2|3|4 (omitted = full year)
 */
export function useAuthorityFilters(): UseAuthorityFiltersResult {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const spObject = useMemo(() => {
    const obj: Record<string, string | string[]> = {}
    for (const [k, v] of searchParams.entries()) {
      const existing = obj[k]
      if (typeof existing === 'string') obj[k] = [existing, v]
      else if (Array.isArray(existing)) existing.push(v)
      else obj[k] = v
    }
    return obj
  }, [searchParams])

  const filters = useMemo(() => parseAuthorityFilters(spObject), [spObject])
  const tab = useMemo(() => parseDashboardTab(spObject), [spObject])

  const push = useCallback(
    (nextFilters: AuthorityFilters, nextTab: DashboardTab = tab) => {
      const sp = serializeAuthorityFilters(nextFilters, nextTab)
      const qs = sp.toString()
      const url = qs ? `${pathname}?${qs}` : pathname
      startTransition(() => {
        router.replace(url, { scroll: false })
      })
    },
    [pathname, router, tab],
  )

  const setSchools = useCallback(
    (next: string[]) => push({ ...filters, schoolIds: next }),
    [filters, push],
  )
  const setYearGroups = useCallback(
    (next: string[]) => {
      const allowed = new Set<string>(ALL_YEAR_GROUPS as readonly string[])
      const filtered = next.filter((v) => allowed.has(v)) as AuthorityFilters['yearGroups']
      push({ ...filters, yearGroups: filtered })
    },
    [filters, push],
  )
  const setSimd = useCallback(
    (next: string[]) => {
      const allowed = new Set<string>(ALL_SIMD_QUINTILES as readonly string[])
      const filtered = next.filter((v) => allowed.has(v)) as AuthorityFilters['simdQuintiles']
      push({ ...filters, simdQuintiles: filtered })
    },
    [filters, push],
  )
  const setGenders = useCallback(
    (next: string[]) => {
      const allowed = new Set<string>(ALL_GENDERS as readonly string[])
      const filtered = next.filter((v) => allowed.has(v)) as AuthorityFilters['genders']
      push({ ...filters, genders: filtered })
    },
    [filters, push],
  )
  const setAcademicYear = useCallback(
    (next: string | 'all') => push({ ...filters, academicYear: next }),
    [filters, push],
  )
  const setTerm = useCallback(
    (next: 1 | 2 | 3 | 4 | 'full') => push({ ...filters, term: next }),
    [filters, push],
  )
  const setTab = useCallback(
    (next: DashboardTab) => push(filters, next),
    [filters, push],
  )

  const resetAll = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [pathname, router])

  return {
    filters,
    tab,
    isPending,
    setSchools,
    setYearGroups,
    setSimd,
    setGenders,
    setAcademicYear,
    setTerm,
    setTab,
    resetAll,
  }
}
