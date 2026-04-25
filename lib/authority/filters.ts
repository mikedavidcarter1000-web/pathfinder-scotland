import { getCurrentAcademicYear } from '@/lib/academic-year'

export type SimdQuintile = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'
export type YearGroup = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6'
export type GenderFilter = 'Male' | 'Female' | 'Other'
export type Term = 1 | 2 | 3 | 4 | 'full'

export const ALL_YEAR_GROUPS: YearGroup[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
export const ALL_SIMD_QUINTILES: SimdQuintile[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']
export const ALL_GENDERS: GenderFilter[] = ['Male', 'Female', 'Other']

export type AuthorityFilters = {
  /** UUIDs of schools selected; empty array = all (subject to QIO restriction) */
  schoolIds: string[]
  yearGroups: YearGroup[]
  simdQuintiles: SimdQuintile[]
  genders: GenderFilter[]
  /** Academic year string ("YYYY-YY") or 'all' */
  academicYear: string | 'all'
  term: Term
}

export type DashboardTab =
  | 'overview'
  | 'subjects'
  | 'equity'
  | 'careers'
  | 'engagement'
  | 'benchmarking'

export const DASHBOARD_TABS: { id: DashboardTab; label: string; description: string }[] = [
  { id: 'overview', label: 'Overview', description: 'Headline metrics, school scorecards and engagement trends.' },
  { id: 'subjects', label: 'Subjects', description: 'Subject uptake, curriculum breadth, STEM gender balance and progression rates.' },
  { id: 'equity', label: 'Equity', description: 'SIMD gap analysis, care-experienced metrics, ASN engagement and widening access tool usage.' },
  { id: 'careers', label: 'Careers', description: 'Career sector exploration, university and apprenticeship interest, pathway planning.' },
  { id: 'engagement', label: 'Engagement', description: 'Activation rates, feature adoption, retention and teacher / parent activity.' },
  { id: 'benchmarking', label: 'Benchmarking', description: 'School-vs-school, school-vs-LA average and year-on-year comparisons.' },
]

const DASHBOARD_TAB_IDS = new Set<DashboardTab>(DASHBOARD_TABS.map((t) => t.id))

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

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

function isValidAcademicYear(s: string): boolean {
  return /^\d{4}-\d{2}$/.test(s)
}

export function parseAuthorityFilters(
  searchParams: Record<string, string | string[] | undefined>,
): AuthorityFilters {
  const schoolIds = csv(searchParams.schools).filter(isUuid)
  const yearGroups = intersect(csv(searchParams.year_groups), ALL_YEAR_GROUPS)
  const simdQuintiles = intersect(csv(searchParams.simd), ALL_SIMD_QUINTILES)
  const genders = intersect(csv(searchParams.gender), ALL_GENDERS)

  let academicYear: string | 'all' = getCurrentAcademicYear()
  const ayRaw = typeof searchParams.ay === 'string' ? searchParams.ay : undefined
  if (ayRaw === 'all') academicYear = 'all'
  else if (ayRaw && isValidAcademicYear(ayRaw)) academicYear = ayRaw

  let term: Term = 'full'
  const termRaw = typeof searchParams.term === 'string' ? searchParams.term : undefined
  if (termRaw === '1' || termRaw === '2' || termRaw === '3' || termRaw === '4') {
    term = Number(termRaw) as 1 | 2 | 3 | 4
  }

  return {
    schoolIds,
    yearGroups,
    simdQuintiles,
    genders,
    academicYear,
    term,
  }
}

export function parseDashboardTab(
  searchParams: Record<string, string | string[] | undefined>,
): DashboardTab {
  const raw = typeof searchParams.tab === 'string' ? searchParams.tab : undefined
  if (raw && DASHBOARD_TAB_IDS.has(raw as DashboardTab)) return raw as DashboardTab
  return 'overview'
}

/**
 * Serialises a filter object back to URLSearchParams.
 * Default values (current AY, full term, empty arrays) are omitted to keep URLs short.
 */
export function serializeAuthorityFilters(
  filters: AuthorityFilters,
  tab: DashboardTab = 'overview',
): URLSearchParams {
  const sp = new URLSearchParams()
  if (tab !== 'overview') sp.set('tab', tab)
  if (filters.schoolIds.length > 0) sp.set('schools', filters.schoolIds.join(','))
  if (filters.yearGroups.length > 0) sp.set('year_groups', filters.yearGroups.join(','))
  if (filters.simdQuintiles.length > 0) sp.set('simd', filters.simdQuintiles.join(','))
  if (filters.genders.length > 0) sp.set('gender', filters.genders.join(','))
  if (filters.academicYear === 'all') sp.set('ay', 'all')
  else if (filters.academicYear !== getCurrentAcademicYear()) sp.set('ay', filters.academicYear)
  if (filters.term !== 'full') sp.set('term', String(filters.term))
  return sp
}

export type FilterSchoolOption = {
  id: string
  name: string
  seed_code: string | null
}

/**
 * Resolves the effective list of school IDs the data layer should query
 * against, given the current filter selection AND the QIO scope.
 *
 * - QIO with assigned_school_ids: intersect the filter selection (or all
 *   QIO schools if no selection) with the assigned IDs.
 * - LA admin / data analyst: use the filter selection or all schools when
 *   no selection.
 */
export function resolveSchoolScope(
  selectedSchoolIds: string[],
  allSchoolsInScope: { id: string }[],
  qioAssignedIds: string[] | null,
): string[] {
  const allInScopeIds = new Set(allSchoolsInScope.map((s) => s.id))
  const qioSet = qioAssignedIds ? new Set(qioAssignedIds) : null

  let effective: string[]
  if (selectedSchoolIds.length === 0) {
    effective = Array.from(allInScopeIds)
  } else {
    effective = selectedSchoolIds.filter((id) => allInScopeIds.has(id))
  }

  if (qioSet) {
    effective = effective.filter((id) => qioSet.has(id))
  }

  return effective
}
