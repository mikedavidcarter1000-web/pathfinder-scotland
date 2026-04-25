'use client'

import { useCallback, useMemo, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ALL_GENDERS,
  ALL_SIMD_QUINTILES,
  ALL_YEAR_GROUPS,
  type NationalDashboardTab,
  type NationalFilters,
  parseNationalFilters,
  parseNationalTab,
  serializeNationalFilters,
} from '@/lib/national/filters'

export type UseNationalFiltersResult = {
  filters: NationalFilters
  tab: NationalDashboardTab
  isPending: boolean
  setAuthorities: (next: string[]) => void
  setChallengeOnly: (next: boolean) => void
  setYearGroups: (next: string[]) => void
  setSimd: (next: string[]) => void
  setGenders: (next: string[]) => void
  setAcademicYear: (next: string | 'all') => void
  setTab: (next: NationalDashboardTab) => void
  resetAll: () => void
}

export function useNationalFilters(): UseNationalFiltersResult {
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

  const filters = useMemo(() => parseNationalFilters(spObject), [spObject])
  const tab = useMemo(() => parseNationalTab(spObject), [spObject])

  const push = useCallback(
    (nextFilters: NationalFilters, nextTab: NationalDashboardTab = tab) => {
      const sp = serializeNationalFilters(nextFilters, nextTab)
      const qs = sp.toString()
      const url = qs ? `${pathname}?${qs}` : pathname
      startTransition(() => {
        router.replace(url, { scroll: false })
      })
    },
    [pathname, router, tab],
  )

  const setAuthorities = useCallback(
    (next: string[]) => push({ ...filters, authorityCodes: next }),
    [filters, push],
  )
  const setChallengeOnly = useCallback(
    (next: boolean) => push({ ...filters, challengeOnly: next }),
    [filters, push],
  )
  const setYearGroups = useCallback(
    (next: string[]) => {
      const allowed = new Set<string>(ALL_YEAR_GROUPS as readonly string[])
      const filtered = next.filter((v) => allowed.has(v)) as NationalFilters['yearGroups']
      push({ ...filters, yearGroups: filtered })
    },
    [filters, push],
  )
  const setSimd = useCallback(
    (next: string[]) => {
      const allowed = new Set<string>(ALL_SIMD_QUINTILES as readonly string[])
      const filtered = next.filter((v) => allowed.has(v)) as NationalFilters['simdQuintiles']
      push({ ...filters, simdQuintiles: filtered })
    },
    [filters, push],
  )
  const setGenders = useCallback(
    (next: string[]) => {
      const allowed = new Set<string>(ALL_GENDERS as readonly string[])
      const filtered = next.filter((v) => allowed.has(v)) as NationalFilters['genders']
      push({ ...filters, genders: filtered })
    },
    [filters, push],
  )
  const setAcademicYear = useCallback(
    (next: string | 'all') => push({ ...filters, academicYear: next }),
    [filters, push],
  )
  const setTab = useCallback(
    (next: NationalDashboardTab) => push(filters, next),
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
    setAuthorities,
    setChallengeOnly,
    setYearGroups,
    setSimd,
    setGenders,
    setAcademicYear,
    setTab,
    resetAll,
  }
}
