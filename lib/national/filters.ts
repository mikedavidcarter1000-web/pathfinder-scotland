/**
 * Filter parser + serialiser for /national/** routes.
 *
 * Mirrors lib/authority/filters.ts but with two national-specific dimensions:
 *   - authorityCodes: multi-select across opted-in LAs
 *   - challengeOnly: when true, restrict to the 9 Challenge Authorities
 *
 * URL params:
 *   tab=overview|subjects|equity|careers|engagement
 *   las=<comma-separated authority codes>
 *   challenge=1
 *   year_groups=S1,S2,...
 *   simd=Q1,Q2,...
 *   gender=Male,Female,Other
 *   ay=YYYY-YY|all
 */

import { getCurrentAcademicYear } from '@/lib/academic-year'

export type SimdQuintile = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'
export type YearGroup = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6'
export type GenderFilter = 'Male' | 'Female' | 'Other'

export const ALL_YEAR_GROUPS: YearGroup[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
export const ALL_SIMD_QUINTILES: SimdQuintile[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']
export const ALL_GENDERS: GenderFilter[] = ['Male', 'Female', 'Other']

export type NationalFilters = {
  /** Authority codes selected; empty = all opted-in LAs */
  authorityCodes: string[]
  /** When true, restrict to is_challenge_authority = true */
  challengeOnly: boolean
  yearGroups: YearGroup[]
  simdQuintiles: SimdQuintile[]
  genders: GenderFilter[]
  /** Academic year string ("YYYY-YY") or 'all' */
  academicYear: string | 'all'
}

export type NationalDashboardTab =
  | 'overview'
  | 'subjects'
  | 'equity'
  | 'careers'
  | 'engagement'

export const NATIONAL_DASHBOARD_TABS: { id: NationalDashboardTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'equity', label: 'Equity' },
  { id: 'careers', label: 'Careers' },
  { id: 'engagement', label: 'Engagement' },
]

const TAB_IDS = new Set<NationalDashboardTab>(NATIONAL_DASHBOARD_TABS.map((t) => t.id))

function csv(value: string | string[] | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.flatMap((v) => csv(v))
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function intersect<T extends string>(values: string[], allowed: T[]): T[] {
  const set = new Set<string>(allowed as readonly string[])
  return values.filter((v) => set.has(v)) as T[]
}

function isAuthorityCode(s: string): boolean {
  // Scottish LA codes are short alphanumeric slugs; allow up to 16 chars.
  return /^[A-Za-z0-9_-]{1,16}$/.test(s)
}

function isValidAcademicYear(s: string): boolean {
  return /^\d{4}-\d{2}$/.test(s)
}

export function parseNationalFilters(
  searchParams: Record<string, string | string[] | undefined>,
): NationalFilters {
  const authorityCodes = csv(searchParams.las).filter(isAuthorityCode)
  const yearGroups = intersect(csv(searchParams.year_groups), ALL_YEAR_GROUPS)
  const simdQuintiles = intersect(csv(searchParams.simd), ALL_SIMD_QUINTILES)
  const genders = intersect(csv(searchParams.gender), ALL_GENDERS)

  let academicYear: string | 'all' = getCurrentAcademicYear()
  const ayRaw = typeof searchParams.ay === 'string' ? searchParams.ay : undefined
  if (ayRaw === 'all') academicYear = 'all'
  else if (ayRaw && isValidAcademicYear(ayRaw)) academicYear = ayRaw

  const challengeOnly =
    typeof searchParams.challenge === 'string' && searchParams.challenge === '1'

  return {
    authorityCodes,
    challengeOnly,
    yearGroups,
    simdQuintiles,
    genders,
    academicYear,
  }
}

export function parseNationalTab(
  searchParams: Record<string, string | string[] | undefined>,
): NationalDashboardTab {
  const raw = typeof searchParams.tab === 'string' ? searchParams.tab : undefined
  if (raw && TAB_IDS.has(raw as NationalDashboardTab)) return raw as NationalDashboardTab
  return 'overview'
}

export function serializeNationalFilters(
  filters: NationalFilters,
  tab: NationalDashboardTab = 'overview',
): URLSearchParams {
  const sp = new URLSearchParams()
  if (tab !== 'overview') sp.set('tab', tab)
  if (filters.authorityCodes.length > 0) sp.set('las', filters.authorityCodes.join(','))
  if (filters.challengeOnly) sp.set('challenge', '1')
  if (filters.yearGroups.length > 0) sp.set('year_groups', filters.yearGroups.join(','))
  if (filters.simdQuintiles.length > 0) sp.set('simd', filters.simdQuintiles.join(','))
  if (filters.genders.length > 0) sp.set('gender', filters.genders.join(','))
  if (filters.academicYear === 'all') sp.set('ay', 'all')
  else if (filters.academicYear !== getCurrentAcademicYear()) sp.set('ay', filters.academicYear)
  return sp
}

/**
 * Resolves the effective list of authority codes the data layer should query
 * against, given the filter selection AND the opted-in / challenge constraints.
 */
export function resolveAuthorityScope(
  filters: NationalFilters,
  optedIn: { code: string; is_challenge_authority: boolean }[],
): string[] {
  let pool = optedIn
  if (filters.challengeOnly) {
    pool = pool.filter((a) => a.is_challenge_authority)
  }
  const allowedCodes = new Set(pool.map((a) => a.code))
  if (filters.authorityCodes.length === 0) {
    return Array.from(allowedCodes)
  }
  return filters.authorityCodes.filter((c) => allowedCodes.has(c))
}
