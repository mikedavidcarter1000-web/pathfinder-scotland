/**
 * Server-side data-fetching helpers for the national tier dashboard.
 *
 * All queries:
 *   - Read aggregated rows from `mv_national_*` materialised views which
 *     already restrict to schools whose LA has `share_national = true` AND
 *     `visible_to_authority = true`. Reading from the MV is the contract --
 *     callers cannot bypass the opt-in check.
 *   - Apply statistical disclosure control per LA (a count below the
 *     threshold is suppressed even if the national total clears it).
 *   - Accept an `authorityCodes` scope which is the resolved opted-in set
 *     after challenge-only filtering; queries always restrict to this set.
 *   - For careers/equity questions that the MV cannot answer (distinct
 *     student counts across multiple weeks), fall back to base tables
 *     filtered by the schools belonging to opted-in LAs.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  applyDisclosureToArray,
  DEFAULT_SUPPRESSION_THRESHOLD,
  suppressSmallCohorts,
} from '@/lib/authority/disclosure'
import type { NationalFilters, SimdQuintile } from './filters'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = SupabaseClient<any, any, any>

const ENGAGEMENT_RECENT_WINDOW_DAYS = 30
const ENGAGEMENT_TREND_WEEKS = 12
const CAREERS_WINDOW_DAYS = 90

// Urban / rural / mixed bucketing of LAs (used by careers tab regional view).
// The classification follows the architecture spec's pragmatic split rather
// than the Scottish Government 6-fold urban-rural classification, because
// LA-level (rather than datazone-level) labels are the desired output.
const URBAN_LA_SLUGS = new Set(['glasgow', 'edinburgh', 'dundee', 'aberdeen-city'])
const RURAL_LA_SLUGS = new Set([
  'highland',
  'na-h-eileanan-siar',
  'orkney',
  'shetland',
  'argyll-and-bute',
  'dumfries-and-galloway',
  'scottish-borders',
])
export type UrbanRural = 'urban' | 'rural' | 'mixed'

function safePercentage(numerator: number, denominator: number | null): number | null {
  if (denominator == null) return null
  if (denominator < DEFAULT_SUPPRESSION_THRESHOLD) return null
  if (numerator < DEFAULT_SUPPRESSION_THRESHOLD) return null
  if (denominator <= 0) return null
  return Math.round((numerator / denominator) * 1000) / 10
}

function safeAverage(numerator: number, cohortSize: number | null): number | null {
  if (cohortSize == null) return null
  if (cohortSize < DEFAULT_SUPPRESSION_THRESHOLD) return null
  if (cohortSize <= 0) return null
  return Math.round((numerator / cohortSize) * 10) / 10
}

function simdDecileToQuintile(d: number | null | undefined): SimdQuintile | null {
  if (d == null || d < 1 || d > 10) return null
  if (d <= 2) return 'Q1'
  if (d <= 4) return 'Q2'
  if (d <= 6) return 'Q3'
  if (d <= 8) return 'Q4'
  return 'Q5'
}

function normaliseGender(g: string | null | undefined): 'Male' | 'Female' | 'Other' {
  if (!g) return 'Other'
  const lower = g.toLowerCase()
  if (lower === 'male' || lower === 'm') return 'Male'
  if (lower === 'female' || lower === 'f') return 'Female'
  return 'Other'
}

// ---------------------------------------------------------------------------
// Authority directory (opted-in only, with metadata)
// ---------------------------------------------------------------------------

export interface OptedInAuthority {
  id: string
  code: string
  slug: string
  name: string
  is_challenge_authority: boolean
  school_count: number
  urban_rural: UrbanRural
}

export async function loadOptedInAuthorities(admin: Admin): Promise<OptedInAuthority[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('local_authorities')
    .select('id, code, slug, name, is_challenge_authority, school_count, share_national')
    .eq('share_national', true)
    .order('name', { ascending: true })

  if (error || !data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    code: r.code,
    slug: r.slug,
    name: r.name,
    is_challenge_authority: !!r.is_challenge_authority,
    school_count: r.school_count ?? 0,
    urban_rural: classifyUrbanRural(r.slug),
  }))
}

function classifyUrbanRural(slug: string): UrbanRural {
  if (URBAN_LA_SLUGS.has(slug)) return 'urban'
  if (RURAL_LA_SLUGS.has(slug)) return 'rural'
  return 'mixed'
}

/** Returns the school IDs across the given opted-in authority codes. */
export async function getSchoolsForAuthorities(
  admin: Admin,
  authorityCodes: string[],
): Promise<Array<{ id: string; local_authority: string; local_authority_code: string }>> {
  if (authorityCodes.length === 0) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: las } = await (admin as any)
    .from('local_authorities')
    .select('name, code')
    .in('code', authorityCodes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const laRows = (las as any[] | null) ?? []
  const nameByCode = new Map<string, string>()
  for (const la of laRows) nameByCode.set(la.code, la.name)
  const names = Array.from(nameByCode.values())
  if (names.length === 0) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: schools } = await (admin as any)
    .from('schools')
    .select('id, local_authority')
    .in('local_authority', names)
    .eq('visible_to_authority', true)

  const codeByName = new Map<string, string>()
  for (const la of laRows) codeByName.set(la.name, la.code)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((schools as any[] | null) ?? []).map((s) => ({
    id: s.id,
    local_authority: s.local_authority,
    local_authority_code: codeByName.get(s.local_authority) ?? '',
  }))
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export interface NationalOverview {
  total_authorities_opted_in: number
  total_schools: number
  total_students: number | null
  active_students_30d: number | null
  simd_distribution: Array<{ quintile: SimdQuintile; student_count: number | null; percentage: number | null }>
  top_subjects_national: Array<{ subject_id: string; subject_name: string; student_count: number }>
  challenge_summary: {
    challenge: { authority_count: number; student_count: number | null; active_pct: number | null; simd_q1_pct: number | null }
    other: { authority_count: number; student_count: number | null; active_pct: number | null; simd_q1_pct: number | null }
  }
  refresh_timestamp: Date | null
}

export async function getNationalOverview(
  admin: Admin,
  authorities: OptedInAuthority[],
  scopedCodes: string[],
  filters: NationalFilters,
  refreshTimestamp: Date | null,
): Promise<NationalOverview> {
  if (scopedCodes.length === 0) return emptyOverview(authorities.length, refreshTimestamp)

  const inScope = authorities.filter((a) => scopedCodes.includes(a.code))
  const totalSchools = inScope.reduce((sum, a) => sum + a.school_count, 0)

  const schools = await getSchoolsForAuthorities(admin, scopedCodes)
  const schoolIds = schools.map((s) => s.id)

  // Read students directly so we can get distinct counts and active-30d.
  // Headline national totals are recomputed below from per-LA buckets so
  // that suppression can be applied per LA before aggregation.
  const { studentsByLa } = await fetchStudentMetrics(admin, schoolIds, filters)

  // Subject choices: per-LA suppression then national aggregation.
  const topSubjects = await fetchNationalTopSubjects(admin, scopedCodes, filters)

  const challengeCodes = new Set(inScope.filter((a) => a.is_challenge_authority).map((a) => a.code))
  const otherCodes = new Set(inScope.filter((a) => !a.is_challenge_authority).map((a) => a.code))
  const challengeSummary = buildChallengeSummary(studentsByLa, challengeCodes, otherCodes, schools)

  // Headline national totals: sum per-LA buckets ONLY where the LA cohort
  // clears the suppression threshold. Without this gate, a national total
  // can be subtracted from visible LA scorecards to recover a < 5 cell.
  let nationalStudentSum = 0
  let nationalActiveSum = 0
  const nationalSimdSum: Record<SimdQuintile, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0 }
  for (const [, rowsForLa] of studentsByLa.entries()) {
    if (rowsForLa.length < DEFAULT_SUPPRESSION_THRESHOLD) continue
    nationalStudentSum += rowsForLa.length
    for (const r of rowsForLa) {
      if (r.last_active_at && r.last_active_at >= new Date(Date.now() - ENGAGEMENT_RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()) {
        nationalActiveSum += 1
      }
      const q = simdDecileToQuintile(r.simd_decile)
      if (q) nationalSimdSum[q] += 1
    }
  }

  const simdDistribution = buildSimdDistribution(nationalSimdSum, nationalStudentSum, studentsByLa)

  return {
    total_authorities_opted_in: authorities.length,
    total_schools: totalSchools,
    total_students: suppressSmallCohorts(nationalStudentSum),
    active_students_30d: suppressSmallCohorts(nationalActiveSum),
    simd_distribution: simdDistribution,
    top_subjects_national: topSubjects,
    challenge_summary: challengeSummary,
    refresh_timestamp: refreshTimestamp,
  }
}

function emptyOverview(authorityCount: number, refreshTimestamp: Date | null): NationalOverview {
  return {
    total_authorities_opted_in: authorityCount,
    total_schools: 0,
    total_students: 0,
    active_students_30d: 0,
    simd_distribution: [],
    top_subjects_national: [],
    challenge_summary: {
      challenge: { authority_count: 0, student_count: 0, active_pct: null, simd_q1_pct: null },
      other: { authority_count: 0, student_count: 0, active_pct: null, simd_q1_pct: null },
    },
    refresh_timestamp: refreshTimestamp,
  }
}

interface StudentRow {
  id: string
  school_id: string
  gender: string | null
  simd_decile: number | null
  last_active_at: string | null
  school_stage: string | null
  care_experienced: boolean | null
  receives_free_school_meals: boolean | null
  has_asn: boolean | null
}

async function fetchStudentMetrics(
  admin: Admin,
  schoolIds: string[],
  filters: NationalFilters,
): Promise<{
  studentsByLa: Map<string, StudentRow[]>
  totalStudents: number
  activeStudents: number
  simdCounts: Record<SimdQuintile, number>
  rows: StudentRow[]
}> {
  const empty = {
    studentsByLa: new Map<string, StudentRow[]>(),
    totalStudents: 0,
    activeStudents: 0,
    simdCounts: { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0 } as Record<SimdQuintile, number>,
    rows: [] as StudentRow[],
  }
  if (schoolIds.length === 0) return empty

  const cutoff = new Date(Date.now() - ENGAGEMENT_RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('students')
    .select(
      'id, school_id, gender, simd_decile, last_active_at, school_stage, care_experienced, receives_free_school_meals, has_asn',
    )
    .in('school_id', schoolIds)

  if (error || !data) return empty

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRows = (data as any[]) as StudentRow[]
  const filtered = allRows.filter((r) => applyStudentFilters(r, filters))

  // Group by school_id then we need LA later -- caller provides schools list.
  // We'll instead group directly by school_id and let caller resolve.
  const studentsBySchool = new Map<string, StudentRow[]>()
  for (const r of filtered) {
    const arr = studentsBySchool.get(r.school_id) ?? []
    arr.push(r)
    studentsBySchool.set(r.school_id, arr)
  }
  // Promote to studentsByLa using a lookup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: schoolToLa } = await (admin as any)
    .from('schools')
    .select('id, local_authority')
    .in('id', schoolIds)
  const laBySchool = new Map<string, string>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const s of (schoolToLa as any[] | null) ?? []) laBySchool.set(s.id, s.local_authority)

  const studentsByLa = new Map<string, StudentRow[]>()
  for (const r of filtered) {
    const la = laBySchool.get(r.school_id)
    if (!la) continue
    const arr = studentsByLa.get(la) ?? []
    arr.push(r)
    studentsByLa.set(la, arr)
  }

  const simdCounts: Record<SimdQuintile, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0 }
  let activeStudents = 0
  for (const r of filtered) {
    const q = simdDecileToQuintile(r.simd_decile)
    if (q) simdCounts[q] += 1
    if (r.last_active_at && r.last_active_at >= cutoff) activeStudents += 1
  }

  return {
    studentsByLa,
    totalStudents: filtered.length,
    activeStudents,
    simdCounts,
    rows: filtered,
  }
}

// NOTE on academic_year: the `students` table is a current snapshot, not a
// time-bound enrolment fact, so filters.academicYear is intentionally NOT
// applied to students-base reads. It is applied to mv_national_subject_choices
// and mv_national_engagement which have an academic_year column. Header /
// scorecard / equity headline counts therefore reflect today's roll, not
// historical enrolment for a chosen year. This is documented in
// docs/Pathfinder_Local_Authority_Portal_Architecture.md.
function applyStudentFilters(row: StudentRow, filters: NationalFilters): boolean {
  if (filters.genders.length > 0) {
    const g = normaliseGender(row.gender)
    if (!filters.genders.includes(g)) return false
  }
  if (filters.simdQuintiles.length > 0) {
    const q = simdDecileToQuintile(row.simd_decile)
    if (!q || !filters.simdQuintiles.includes(q)) return false
  }
  if (filters.yearGroups.length > 0) {
    const stage = row.school_stage ? row.school_stage.toUpperCase() : null
    const yg = stage && /^S[1-6]$/.test(stage) ? stage : null
    if (!yg || !filters.yearGroups.includes(yg as never)) return false
  }
  return true
}

interface SubjectMvRow {
  local_authority_code: string
  local_authority_name: string
  school_id: string
  subject_id: string
  subject_name: string
  subject_category: string | null
  year_group: string | null
  gender: string | null
  simd_quintile: string | null
  academic_year: string | null
  student_count: number
}

async function fetchNationalSubjectMv(
  admin: Admin,
  scopedCodes: string[],
  filters: NationalFilters,
): Promise<SubjectMvRow[]> {
  if (scopedCodes.length === 0) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (admin as any)
    .from('mv_national_subject_choices')
    .select(
      'local_authority_code, local_authority_name, school_id, subject_id, subject_name, subject_category, year_group, gender, simd_quintile, academic_year, student_count',
    )
    .in('local_authority_code', scopedCodes)
  if (filters.academicYear !== 'all') q = q.eq('academic_year', filters.academicYear)
  if (filters.yearGroups.length > 0) q = q.in('year_group', filters.yearGroups)
  if (filters.simdQuintiles.length > 0) q = q.in('simd_quintile', filters.simdQuintiles)
  if (filters.genders.length > 0) q = q.in('gender', filters.genders)

  const { data, error } = await q
  if (error || !data) return []
  return data as SubjectMvRow[]
}

async function fetchNationalTopSubjects(
  admin: Admin,
  scopedCodes: string[],
  filters: NationalFilters,
): Promise<Array<{ subject_id: string; subject_name: string; student_count: number }>> {
  const rows = await fetchNationalSubjectMv(admin, scopedCodes, filters)
  // National aggregation: sum across LAs after applying per-LA suppression
  // at the (LA, subject) granularity so a single tiny LA cohort can't reveal
  // a back-derivable count when the national total is published.
  const perLaSubject = new Map<string, number>() // key = la|subject_id
  for (const r of rows) {
    const key = `${r.local_authority_code}|${r.subject_id}`
    perLaSubject.set(key, (perLaSubject.get(key) ?? 0) + Number(r.student_count || 0))
  }

  const subjectTotals = new Map<string, { name: string; total: number }>()
  for (const [key, count] of perLaSubject.entries()) {
    if (count < DEFAULT_SUPPRESSION_THRESHOLD) continue
    const [, subject_id] = key.split('|')
    const name = rows.find((r) => r.subject_id === subject_id)?.subject_name ?? subject_id
    const ex = subjectTotals.get(subject_id)
    if (ex) ex.total += count
    else subjectTotals.set(subject_id, { name, total: count })
  }
  return Array.from(subjectTotals.entries())
    .map(([subject_id, v]) => ({ subject_id, subject_name: v.name, student_count: v.total }))
    .sort((a, b) => b.student_count - a.student_count)
    .slice(0, 10)
}

function buildSimdDistribution(
  counts: Record<SimdQuintile, number>,
  total: number,
  studentsByLa: Map<string, StudentRow[]>,
): Array<{ quintile: SimdQuintile; student_count: number | null; percentage: number | null }> {
  // Build a per-LA per-quintile matrix so we can drop quintile cells that
  // any single LA could have contributed < 5 students to. Without this, a
  // national quintile total can be back-derived against the LA scorecards.
  const perLaQuintile = new Map<string, Record<SimdQuintile, number>>()
  for (const [la, rows] of studentsByLa.entries()) {
    if (rows.length < DEFAULT_SUPPRESSION_THRESHOLD) continue
    const acc: Record<SimdQuintile, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0 }
    for (const r of rows) {
      const q = simdDecileToQuintile(r.simd_decile)
      if (q) acc[q] += 1
    }
    perLaQuintile.set(la, acc)
  }
  const safeQuintileTotals: Record<SimdQuintile, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0 }
  for (const acc of perLaQuintile.values()) {
    for (const q of ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] as SimdQuintile[]) {
      if (acc[q] >= DEFAULT_SUPPRESSION_THRESHOLD) safeQuintileTotals[q] += acc[q]
    }
  }
  const quintiles: SimdQuintile[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']
  // Use the unsuppressed input counts only for the percentage denominator
  // when total is non-zero -- caller already gated `total` itself.
  void counts
  return quintiles.map((q) => {
    const c = safeQuintileTotals[q]
    const suppressed = suppressSmallCohorts(c)
    return {
      quintile: q,
      student_count: suppressed,
      percentage: total > 0 && suppressed != null ? Math.round((c / total) * 100) : null,
    }
  })
}

function buildChallengeSummary(
  studentsByLa: Map<string, StudentRow[]>,
  challengeCodes: Set<string>,
  otherCodes: Set<string>,
  schools: Array<{ id: string; local_authority: string; local_authority_code: string }>,
) {
  // Resolve LA name -> code for student grouping.
  const codeByLaName = new Map<string, string>()
  for (const s of schools) codeByLaName.set(s.local_authority, s.local_authority_code)

  const cutoff = new Date(Date.now() - ENGAGEMENT_RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  function bucket(codes: Set<string>) {
    let students = 0
    let active = 0
    let q1 = 0
    const seenAuthorities = new Set<string>()
    for (const [laName, rows] of studentsByLa.entries()) {
      const code = codeByLaName.get(laName)
      if (!code || !codes.has(code)) continue
      seenAuthorities.add(code)
      // Per-LA suppression on the cohort total. Smaller LAs still count
      // toward authority_count (a non-disclosive integer) but their student
      // counts are excluded from the bucket headline.
      if (rows.length < DEFAULT_SUPPRESSION_THRESHOLD) continue
      for (const r of rows) {
        students += 1
        if (r.last_active_at && r.last_active_at >= cutoff) active += 1
        if (simdDecileToQuintile(r.simd_decile) === 'Q1') q1 += 1
      }
    }
    return {
      authority_count: seenAuthorities.size,
      student_count: suppressSmallCohorts(students),
      active_pct: safePercentage(active, students),
      simd_q1_pct: safePercentage(q1, students),
    }
  }

  return {
    challenge: bucket(challengeCodes),
    other: bucket(otherCodes),
  }
}

// ---------------------------------------------------------------------------
// Authority scorecards
// ---------------------------------------------------------------------------

export interface AuthorityScorecard {
  authority_id: string
  authority_code: string
  authority_name: string
  is_challenge_authority: boolean
  urban_rural: UrbanRural
  school_count: number
  student_count: number | null
  active_pct_30d: number | null
  simd_q1_pct: number | null
  top_3_subjects: Array<{ subject_name: string; student_count: number }>
}

export async function getAuthorityScorecards(
  admin: Admin,
  authorities: OptedInAuthority[],
  scopedCodes: string[],
  filters: NationalFilters,
): Promise<AuthorityScorecard[]> {
  if (scopedCodes.length === 0) return []
  const inScope = authorities.filter((a) => scopedCodes.includes(a.code))
  if (inScope.length === 0) return []

  const schools = await getSchoolsForAuthorities(admin, scopedCodes)
  const schoolIds = schools.map((s) => s.id)
  if (schoolIds.length === 0) return []

  const cutoff = new Date(Date.now() - ENGAGEMENT_RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (admin as any)
    .from('students')
    .select('id, school_id, gender, simd_decile, last_active_at, school_stage')
    .in('school_id', schoolIds)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studentRows = ((students as any[]) ?? []).filter((r: StudentRow) => applyStudentFilters(r, filters)) as StudentRow[]

  // school_id -> LA name -> code
  const laByCode = new Map<string, string>() // code -> name
  for (const a of inScope) laByCode.set(a.code, a.name)
  const codeByLaName = new Map<string, string>()
  for (const [code, name] of laByCode.entries()) codeByLaName.set(name, code)
  const codeBySchool = new Map<string, string>()
  for (const s of schools) codeBySchool.set(s.id, codeByLaName.get(s.local_authority) ?? '')

  const studentsByCode = new Map<string, StudentRow[]>()
  for (const r of studentRows) {
    const code = codeBySchool.get(r.school_id)
    if (!code) continue
    const arr = studentsByCode.get(code) ?? []
    arr.push(r)
    studentsByCode.set(code, arr)
  }

  // Top subjects per authority via the MV (with per-LA suppression already
  // implicit -- we suppress below).
  const subjectRows = await fetchNationalSubjectMv(admin, scopedCodes, filters)
  const subjectsByCode = new Map<string, Map<string, { name: string; total: number }>>()
  for (const r of subjectRows) {
    const map = subjectsByCode.get(r.local_authority_code) ?? new Map<string, { name: string; total: number }>()
    const ex = map.get(r.subject_id)
    if (ex) ex.total += Number(r.student_count) || 0
    else map.set(r.subject_id, { name: r.subject_name, total: Number(r.student_count) || 0 })
    subjectsByCode.set(r.local_authority_code, map)
  }

  return inScope.map<AuthorityScorecard>((a) => {
    const rows = studentsByCode.get(a.code) ?? []
    const total = rows.length
    const active = rows.filter((r) => r.last_active_at && r.last_active_at >= cutoff).length
    const q1 = rows.filter((r) => simdDecileToQuintile(r.simd_decile) === 'Q1').length

    const subjMap = subjectsByCode.get(a.code)
    const top3 = subjMap
      ? Array.from(subjMap.values())
          .map((v) => ({ subject_name: v.name, student_count: v.total }))
          .filter((v) => v.student_count >= DEFAULT_SUPPRESSION_THRESHOLD)
          .sort((x, y) => y.student_count - x.student_count)
          .slice(0, 3)
      : []

    return {
      authority_id: a.id,
      authority_code: a.code,
      authority_name: a.name,
      is_challenge_authority: a.is_challenge_authority,
      urban_rural: a.urban_rural,
      school_count: a.school_count,
      student_count: suppressSmallCohorts(total),
      active_pct_30d: safePercentage(active, total),
      simd_q1_pct: safePercentage(q1, total),
      top_3_subjects: top3,
    }
  })
}

// ---------------------------------------------------------------------------
// Subjects analysis (national)
// ---------------------------------------------------------------------------

export interface NationalSubjectsRow {
  subject_id: string
  subject_name: string
  subject_category: string | null
  total_students: number | null
  female_pct: number | null
  male_pct: number | null
  q1_pct: number | null
  authorities_offering: number
}

export interface NationalSubjectsData {
  subjects: NationalSubjectsRow[]
  stem_gender: Array<{
    subject_name: string
    female: number | null
    male: number | null
    other: number | null
    female_pct: number | null
    total: number | null
  }>
  la_subject_ranking: Array<{
    subject_id: string
    subject_name: string
    high_la: { code: string; name: string; pct: number | null } | null
    low_la: { code: string; name: string; pct: number | null } | null
  }>
  subject_coverage: Array<{
    subject_id: string
    subject_name: string
    authorities_offering: number
    total_authorities: number
  }>
}

const STEM_NAMES = new Set([
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computing Science',
  'Engineering Science',
])

export async function getNationalSubjectsData(
  admin: Admin,
  authorities: OptedInAuthority[],
  scopedCodes: string[],
  filters: NationalFilters,
): Promise<NationalSubjectsData> {
  const empty: NationalSubjectsData = {
    subjects: [],
    stem_gender: [],
    la_subject_ranking: [],
    subject_coverage: [],
  }
  if (scopedCodes.length === 0) return empty

  const rows = await fetchNationalSubjectMv(admin, scopedCodes, filters)
  if (rows.length === 0) return empty

  // Per-LA, per-subject totals (with gender + SIMD slices) for suppression.
  type LaSubjAgg = {
    name: string
    category: string | null
    total: number
    female: number
    male: number
    q1: number
    laCode: string
  }
  const perLaSubject = new Map<string, LaSubjAgg>() // key = la|sid
  for (const r of rows) {
    const key = `${r.local_authority_code}|${r.subject_id}`
    let a = perLaSubject.get(key)
    if (!a) {
      a = { name: r.subject_name, category: r.subject_category, total: 0, female: 0, male: 0, q1: 0, laCode: r.local_authority_code }
      perLaSubject.set(key, a)
    }
    const c = Number(r.student_count) || 0
    a.total += c
    const g = normaliseGender(r.gender)
    if (g === 'Female') a.female += c
    if (g === 'Male') a.male += c
    if (r.simd_quintile === 'Q1') a.q1 += c
  }

  // National per-subject aggregation (drop per-LA cells that are suppressed).
  const perSubject = new Map<
    string,
    { name: string; category: string | null; total: number; female: number; male: number; q1: number; las: Set<string> }
  >()
  for (const [, agg] of perLaSubject.entries()) {
    if (agg.total < DEFAULT_SUPPRESSION_THRESHOLD) continue
    const sid = agg.name
    const existing = perSubject.get(sid)
    if (existing) {
      existing.total += agg.total
      existing.female += agg.female
      existing.male += agg.male
      existing.q1 += agg.q1
      existing.las.add(agg.laCode)
    } else {
      perSubject.set(sid, {
        name: agg.name,
        category: agg.category,
        total: agg.total,
        female: agg.female,
        male: agg.male,
        q1: agg.q1,
        las: new Set([agg.laCode]),
      })
    }
  }

  const subjects: NationalSubjectsRow[] = Array.from(perSubject.entries())
    .map(([sid, v]) => ({
      subject_id: sid,
      subject_name: v.name,
      subject_category: v.category,
      total_students: suppressSmallCohorts(v.total),
      female_pct: safePercentage(v.female, v.total),
      male_pct: safePercentage(v.male, v.total),
      q1_pct: safePercentage(v.q1, v.total),
      authorities_offering: v.las.size,
    }))
    .sort((a, b) => (b.total_students ?? 0) - (a.total_students ?? 0))

  const stem_gender = subjects
    .filter((s) => STEM_NAMES.has(s.subject_name))
    .map((s) => {
      const v = perSubject.get(s.subject_id)
      const female = v ? suppressSmallCohorts(v.female) : null
      const male = v ? suppressSmallCohorts(v.male) : null
      const otherRaw = v ? Math.max(0, v.total - v.female - v.male) : 0
      const other = v ? suppressSmallCohorts(otherRaw) : null
      // Complementary disclosure guard: with total + 3 categories shown
      // together, a suppressed cell can be solved as total - sum(other two).
      // Mask total whenever any category cell is suppressed so the gap
      // cannot be back-derived.
      const allVisible = female != null && male != null && other != null
      const total = allVisible ? s.total_students : null
      return {
        subject_name: s.subject_name,
        female,
        male,
        other,
        female_pct: total != null ? s.female_pct : null,
        total,
      }
    })

  // Per-LA ranking for subject uptake (top vs bottom LA per subject)
  const laTotals = new Map<string, number>() // code -> student total in scope
  for (const [, agg] of perLaSubject.entries()) {
    laTotals.set(agg.laCode, (laTotals.get(agg.laCode) ?? 0) + agg.total)
  }
  const subjectsForRanking = subjects.slice(0, 12)
  const la_subject_ranking = subjectsForRanking.map((s) => {
    const candidates: Array<{ code: string; pct: number | null }> = []
    for (const [key, agg] of perLaSubject.entries()) {
      const [code, sid] = key.split('|')
      if (sid !== s.subject_id) continue
      if (agg.total < DEFAULT_SUPPRESSION_THRESHOLD) continue
      const denom = laTotals.get(code) ?? 0
      const pct = safePercentage(agg.total, denom)
      if (pct == null) continue
      candidates.push({ code, pct })
    }
    if (candidates.length === 0) {
      return { subject_id: s.subject_id, subject_name: s.subject_name, high_la: null, low_la: null }
    }
    candidates.sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
    const high = candidates[0]
    const low = candidates[candidates.length - 1]
    const nameOf = (code: string) => authorities.find((a) => a.code === code)?.name ?? code
    return {
      subject_id: s.subject_id,
      subject_name: s.subject_name,
      high_la: { code: high.code, name: nameOf(high.code), pct: high.pct },
      low_la: high.code === low.code ? null : { code: low.code, name: nameOf(low.code), pct: low.pct },
    }
  })

  const total_authorities = scopedCodes.length
  const subject_coverage = subjects
    .map((s) => ({
      subject_id: s.subject_id,
      subject_name: s.subject_name,
      authorities_offering: s.authorities_offering,
      total_authorities,
    }))
    .sort((a, b) => a.authorities_offering - b.authorities_offering)
    .slice(0, 20)

  return { subjects, stem_gender, la_subject_ranking, subject_coverage }
}

// ---------------------------------------------------------------------------
// Equity analysis (national)
// ---------------------------------------------------------------------------

export interface NationalEquityData {
  /** Headline national SIMD distribution and Q1 / Q5 splits */
  simd_summary: {
    q1_count: number | null
    q5_count: number | null
    q1_active_pct: number | null
    q5_active_pct: number | null
  }
  /** LA equity gap ranking: SIMD Q5 active% minus Q1 active% (positive = Q5 advantage) */
  la_equity_gap: Array<{
    authority_code: string
    authority_name: string
    is_challenge_authority: boolean
    q1_count: number | null
    q5_count: number | null
    q1_active_pct: number | null
    q5_active_pct: number | null
    gap_pct_points: number | null
  }>
  /** Challenge vs non-Challenge equity comparison */
  challenge_vs_other: {
    challenge: { q1_pct: number | null; q1_active_pct: number | null }
    other: { q1_pct: number | null; q1_active_pct: number | null }
  }
  /** Demographic group totals (heavily suppressed at national level) */
  demographic_groups: Array<{
    label: string
    student_count: number | null
    active_pct: number | null
  }>
}

export async function getNationalEquityData(
  admin: Admin,
  authorities: OptedInAuthority[],
  scopedCodes: string[],
  filters: NationalFilters,
): Promise<NationalEquityData> {
  const empty: NationalEquityData = {
    simd_summary: { q1_count: null, q5_count: null, q1_active_pct: null, q5_active_pct: null },
    la_equity_gap: [],
    challenge_vs_other: {
      challenge: { q1_pct: null, q1_active_pct: null },
      other: { q1_pct: null, q1_active_pct: null },
    },
    demographic_groups: [],
  }
  if (scopedCodes.length === 0) return empty

  const schools = await getSchoolsForAuthorities(admin, scopedCodes)
  const schoolIds = schools.map((s) => s.id)
  if (schoolIds.length === 0) return empty

  const cutoff = new Date(Date.now() - ENGAGEMENT_RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (admin as any)
    .from('students')
    .select(
      'id, school_id, gender, simd_decile, last_active_at, school_stage, care_experienced, receives_free_school_meals, has_asn',
    )
    .in('school_id', schoolIds)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all = ((students as any[]) ?? []).filter((r: StudentRow) => applyStudentFilters(r, filters)) as StudentRow[]

  // school -> code lookup
  const inScope = authorities.filter((a) => scopedCodes.includes(a.code))
  const codeByLaName = new Map<string, string>()
  for (const a of inScope) codeByLaName.set(a.name, a.code)
  const codeBySchool = new Map<string, string>()
  for (const s of schools) codeBySchool.set(s.id, codeByLaName.get(s.local_authority) ?? '')

  // Per-LA equity gap (build first so the national summary can suppress
  // per-LA cells before adding to the national total -- without this gate,
  // the national Q1/Q5 counts can be subtracted from per-LA scorecards to
  // recover a < 5 cell).
  type LaAcc = { q1: number; q5: number; q1_active: number; q5_active: number; total: number }
  const perLa = new Map<string, LaAcc>()
  for (const r of all) {
    const code = codeBySchool.get(r.school_id)
    if (!code) continue
    const acc = perLa.get(code) ?? { q1: 0, q5: 0, q1_active: 0, q5_active: 0, total: 0 }
    acc.total += 1
    const q = simdDecileToQuintile(r.simd_decile)
    const isActive = !!r.last_active_at && r.last_active_at >= cutoff
    if (q === 'Q1') {
      acc.q1 += 1
      if (isActive) acc.q1_active += 1
    } else if (q === 'Q5') {
      acc.q5 += 1
      if (isActive) acc.q5_active += 1
    }
    perLa.set(code, acc)
  }

  // National SIMD summary -- only sum LAs whose Q1/Q5 cells individually
  // clear the suppression threshold.
  let nat_q1 = 0
  let nat_q5 = 0
  let nat_q1_active = 0
  let nat_q5_active = 0
  for (const acc of perLa.values()) {
    if (acc.q1 >= DEFAULT_SUPPRESSION_THRESHOLD) {
      nat_q1 += acc.q1
      nat_q1_active += acc.q1_active
    }
    if (acc.q5 >= DEFAULT_SUPPRESSION_THRESHOLD) {
      nat_q5 += acc.q5
      nat_q5_active += acc.q5_active
    }
  }
  const simd_summary = {
    q1_count: suppressSmallCohorts(nat_q1),
    q5_count: suppressSmallCohorts(nat_q5),
    q1_active_pct: safePercentage(nat_q1_active, nat_q1),
    q5_active_pct: safePercentage(nat_q5_active, nat_q5),
  }

  const la_equity_gap = inScope.map((a) => {
    const acc = perLa.get(a.code) ?? { q1: 0, q5: 0, q1_active: 0, q5_active: 0 }
    const q1Pct = safePercentage(acc.q1_active, acc.q1)
    const q5Pct = safePercentage(acc.q5_active, acc.q5)
    const gap = q1Pct != null && q5Pct != null ? Math.round((q5Pct - q1Pct) * 10) / 10 : null
    return {
      authority_code: a.code,
      authority_name: a.name,
      is_challenge_authority: a.is_challenge_authority,
      q1_count: suppressSmallCohorts(acc.q1),
      q5_count: suppressSmallCohorts(acc.q5),
      q1_active_pct: q1Pct,
      q5_active_pct: q5Pct,
      gap_pct_points: gap,
    }
  })

  // Challenge vs other -- Q1 share is over the FULL bucket cohort, not over
  // (Q1 + Q5). Apply per-LA suppression on the cohort total before summing
  // so a tiny LA can't be back-derived from the headline percentage.
  const totalsByGroup = (codes: Set<string>) => {
    let q1 = 0
    let total = 0
    let q1_active = 0
    for (const [code, acc] of perLa.entries()) {
      if (!codes.has(code)) continue
      if (acc.total < DEFAULT_SUPPRESSION_THRESHOLD) continue
      total += acc.total
      if (acc.q1 >= DEFAULT_SUPPRESSION_THRESHOLD) {
        q1 += acc.q1
        q1_active += acc.q1_active
      }
    }
    return {
      q1_pct: safePercentage(q1, total),
      q1_active_pct: safePercentage(q1_active, q1),
    }
  }
  const challengeCodes = new Set(inScope.filter((a) => a.is_challenge_authority).map((a) => a.code))
  const otherCodes = new Set(inScope.filter((a) => !a.is_challenge_authority).map((a) => a.code))
  const challenge_vs_other = {
    challenge: totalsByGroup(challengeCodes),
    other: totalsByGroup(otherCodes),
  }

  // Demographic groups -- per-LA suppression then national aggregation.
  const demoGroups: Array<{ label: string; pred: (r: StudentRow) => boolean }> = [
    { label: 'Care-experienced', pred: (r) => !!r.care_experienced },
    { label: 'Free school meals', pred: (r) => !!r.receives_free_school_meals },
    { label: 'Additional support needs', pred: (r) => !!r.has_asn },
  ]
  const demographic_groups = demoGroups.map((g) => {
    let total = 0
    let active = 0
    const perLaCount = new Map<string, number>()
    const perLaActive = new Map<string, number>()
    for (const r of all) {
      if (!g.pred(r)) continue
      const code = codeBySchool.get(r.school_id) ?? '_'
      perLaCount.set(code, (perLaCount.get(code) ?? 0) + 1)
      const isActive = !!r.last_active_at && r.last_active_at >= cutoff
      if (isActive) perLaActive.set(code, (perLaActive.get(code) ?? 0) + 1)
    }
    for (const [code, c] of perLaCount.entries()) {
      if (c < DEFAULT_SUPPRESSION_THRESHOLD) continue
      total += c
      active += perLaActive.get(code) ?? 0
    }
    return {
      label: g.label,
      student_count: suppressSmallCohorts(total),
      active_pct: safePercentage(active, total),
    }
  })

  return { simd_summary, la_equity_gap, challenge_vs_other, demographic_groups }
}

// ---------------------------------------------------------------------------
// Careers analysis (national)
// ---------------------------------------------------------------------------

export interface NationalCareersData {
  sector_popularity: Array<{
    sector_label: string
    unique_students: number | null
    percentage: number | null
  }>
  regional_variation: Array<{
    bucket: UrbanRural
    label: string
    authority_count: number
    top_sector: string | null
    top_sector_pct: number | null
    avg_sectors_per_student: number | null
  }>
  pathway_split: {
    university_pct: number | null
    college_pct: number | null
    apprenticeship_pct: number | null
    challenge_university_pct: number | null
    other_university_pct: number | null
  }
  la_sector_diversity: Array<{
    authority_code: string
    authority_name: string
    avg_sectors_per_student: number | null
    exploring_pct: number | null
  }>
}

interface PelRow {
  student_id: string
  school_id: string
  event_type: string | null
  event_category: string | null
  event_detail: string | null
  created_at: string
}

export async function getNationalCareersData(
  admin: Admin,
  authorities: OptedInAuthority[],
  scopedCodes: string[],
  filters: NationalFilters,
): Promise<NationalCareersData> {
  const empty: NationalCareersData = {
    sector_popularity: [],
    regional_variation: [],
    pathway_split: {
      university_pct: null,
      college_pct: null,
      apprenticeship_pct: null,
      challenge_university_pct: null,
      other_university_pct: null,
    },
    la_sector_diversity: [],
  }
  if (scopedCodes.length === 0) return empty

  const schools = await getSchoolsForAuthorities(admin, scopedCodes)
  const schoolIds = schools.map((s) => s.id)
  if (schoolIds.length === 0) return empty

  const cutoff = new Date(Date.now() - CAREERS_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // Pull base table because the MV pre-groups by week, and we need distinct
  // students across the full 90-day window.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = await (admin as any)
    .from('platform_engagement_log')
    .select('student_id, school_id, event_type, event_category, event_detail, created_at')
    .in('school_id', schoolIds)
    .gte('created_at', cutoff)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evs = ((events as any[]) ?? []) as PelRow[]

  // Total students in scope (denominator)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentsData } = await (admin as any)
    .from('students')
    .select('id, school_id, gender, simd_decile, school_stage')
    .in('school_id', schoolIds)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studentsAll = ((studentsData as any[]) ?? []).filter((r: StudentRow) => applyStudentFilters(r, filters)) as StudentRow[]
  const studentIdsInScope = new Set(studentsAll.map((s) => s.id))
  const totalStudents = studentsAll.length

  // school -> LA code lookup
  const inScope = authorities.filter((a) => scopedCodes.includes(a.code))
  const codeByLaName = new Map<string, string>()
  for (const a of inScope) codeByLaName.set(a.name, a.code)
  const codeBySchool = new Map<string, string>()
  for (const s of schools) codeBySchool.set(s.id, codeByLaName.get(s.local_authority) ?? '')

  // Sector popularity -- distinct students per sector with per-LA suppression
  const sectorByLaStudents = new Map<string, Map<string, Set<string>>>() // sector -> la -> studentIds
  const sectorSlugToLabel = new Map<string, string>()
  for (const e of evs) {
    if (e.event_category !== 'career_sector') continue
    if (!e.event_detail || !e.student_id) continue
    if (!studentIdsInScope.has(e.student_id)) continue
    const code = codeBySchool.get(e.school_id) ?? '_'
    const sector = e.event_detail
    sectorSlugToLabel.set(sector, prettifySectorSlug(sector))
    let perLa = sectorByLaStudents.get(sector)
    if (!perLa) {
      perLa = new Map()
      sectorByLaStudents.set(sector, perLa)
    }
    const set = perLa.get(code) ?? new Set<string>()
    set.add(e.student_id)
    perLa.set(code, set)
  }

  const sector_popularity = Array.from(sectorByLaStudents.entries())
    .map(([sector, perLa]) => {
      let count = 0
      for (const set of perLa.values()) {
        if (set.size < DEFAULT_SUPPRESSION_THRESHOLD) continue
        count += set.size
      }
      return {
        sector_label: sectorSlugToLabel.get(sector) ?? sector,
        unique_students: suppressSmallCohorts(count),
        percentage: safePercentage(count, totalStudents),
      }
    })
    .filter((r) => r.unique_students != null)
    .sort((a, b) => (b.unique_students ?? 0) - (a.unique_students ?? 0))
    .slice(0, 15)

  // LA sector diversity (avg sectors per student that explored at least one)
  const sectorsByLaStudent = new Map<string, Map<string, Set<string>>>() // la -> student -> sectors
  for (const e of evs) {
    if (e.event_category !== 'career_sector') continue
    if (!e.event_detail || !e.student_id) continue
    if (!studentIdsInScope.has(e.student_id)) continue
    const code = codeBySchool.get(e.school_id) ?? '_'
    let byStudent = sectorsByLaStudent.get(code)
    if (!byStudent) {
      byStudent = new Map()
      sectorsByLaStudent.set(code, byStudent)
    }
    const set = byStudent.get(e.student_id) ?? new Set<string>()
    set.add(e.event_detail)
    byStudent.set(e.student_id, set)
  }
  const la_sector_diversity = inScope
    .map((a) => {
      const byStudent = sectorsByLaStudent.get(a.code)
      const exploring = byStudent ? byStudent.size : 0
      const totalSectors = byStudent ? Array.from(byStudent.values()).reduce((s, set) => s + set.size, 0) : 0
      const laTotal = studentsAll.filter((r) => codeBySchool.get(r.school_id) === a.code).length
      return {
        authority_code: a.code,
        authority_name: a.name,
        avg_sectors_per_student: safeAverage(totalSectors, exploring),
        exploring_pct: safePercentage(exploring, laTotal),
      }
    })
    .sort((a, b) => (b.avg_sectors_per_student ?? 0) - (a.avg_sectors_per_student ?? 0))

  // Regional variation by urban/rural/mixed
  const regional_variation: NationalCareersData['regional_variation'] = (['urban', 'rural', 'mixed'] as UrbanRural[]).map(
    (bucket) => {
      const bucketAuths = inScope.filter((a) => a.urban_rural === bucket)
      const codes = new Set(bucketAuths.map((a) => a.code))
      // Top sector across this bucket
      const sectorCounts = new Map<string, Set<string>>() // sector -> studentIds
      let totalSectors = 0
      let exploringStudents = 0
      const exploringSet = new Set<string>()
      for (const [sector, perLa] of sectorByLaStudents.entries()) {
        for (const [code, students] of perLa.entries()) {
          if (!codes.has(code)) continue
          if (students.size < DEFAULT_SUPPRESSION_THRESHOLD) continue
          const set = sectorCounts.get(sector) ?? new Set<string>()
          for (const s of students) {
            set.add(s)
            exploringSet.add(s)
          }
          sectorCounts.set(sector, set)
        }
      }
      // Avg sectors per student in bucket
      for (const code of codes) {
        const byStudent = sectorsByLaStudent.get(code)
        if (!byStudent) continue
        for (const set of byStudent.values()) totalSectors += set.size
      }
      exploringStudents = exploringSet.size
      const sortedSectors = Array.from(sectorCounts.entries())
        .map(([sector, set]) => ({ sector, count: set.size }))
        .sort((a, b) => b.count - a.count)
      const top = sortedSectors[0] ?? null
      const bucketStudents = studentsAll.filter((r) => codes.has(codeBySchool.get(r.school_id) ?? '')).length
      return {
        bucket,
        label: bucket === 'urban' ? 'Urban (Glasgow / Edinburgh / Dundee / Aberdeen)'
          : bucket === 'rural' ? 'Rural (Highlands, Islands, Borders, D&G)'
          : 'Mixed (other LAs)',
        authority_count: bucketAuths.length,
        top_sector: top ? prettifySectorSlug(top.sector) : null,
        top_sector_pct: top ? safePercentage(top.count, bucketStudents) : null,
        avg_sectors_per_student: safeAverage(totalSectors, exploringStudents),
      }
    },
  )

  // Pathway split (university / college / apprenticeship)
  const pathwayCounts = { university: new Set<string>(), college: new Set<string>(), apprenticeship: new Set<string>() }
  const pathwayChallenge = { university: new Set<string>(), other_university: new Set<string>() }
  const challengeCodes = new Set(inScope.filter((a) => a.is_challenge_authority).map((a) => a.code))
  for (const e of evs) {
    if (!e.student_id || !studentIdsInScope.has(e.student_id)) continue
    if (e.event_category === 'university') {
      pathwayCounts.university.add(e.student_id)
      const code = codeBySchool.get(e.school_id) ?? '_'
      if (challengeCodes.has(code)) pathwayChallenge.university.add(e.student_id)
      else pathwayChallenge.other_university.add(e.student_id)
    } else if (e.event_category === 'college') {
      pathwayCounts.college.add(e.student_id)
    } else if (
      e.event_category === 'apprenticeship' ||
      (e.event_category === 'career_sector' && (e.event_detail ?? '').toLowerCase().includes('apprentice'))
    ) {
      pathwayCounts.apprenticeship.add(e.student_id)
    }
  }
  const challengeStudentTotal = studentsAll.filter((r) => challengeCodes.has(codeBySchool.get(r.school_id) ?? '')).length
  const otherStudentTotal = studentsAll.filter((r) => !challengeCodes.has(codeBySchool.get(r.school_id) ?? '')).length

  const pathway_split = {
    university_pct: safePercentage(pathwayCounts.university.size, totalStudents),
    college_pct: safePercentage(pathwayCounts.college.size, totalStudents),
    apprenticeship_pct: safePercentage(pathwayCounts.apprenticeship.size, totalStudents),
    challenge_university_pct: safePercentage(pathwayChallenge.university.size, challengeStudentTotal),
    other_university_pct: safePercentage(pathwayChallenge.other_university.size, otherStudentTotal),
  }

  return { sector_popularity, regional_variation, pathway_split, la_sector_diversity }
}

function prettifySectorSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------------------------------------------------------------------------
// Engagement analysis (national)
// ---------------------------------------------------------------------------

export interface NationalEngagementData {
  national_active_pct_30d: number | null
  national_active_count: number | null
  la_activation_ranking: Array<{
    authority_code: string
    authority_name: string
    is_challenge_authority: boolean
    student_count: number | null
    active_pct: number | null
  }>
  feature_adoption: Array<{ feature: string; unique_students: number | null; percentage: number | null }>
  weekly_trend: Array<{ week_start: string; unique_students: number }>
}

export async function getNationalEngagementData(
  admin: Admin,
  authorities: OptedInAuthority[],
  scopedCodes: string[],
  filters: NationalFilters,
): Promise<NationalEngagementData> {
  const empty: NationalEngagementData = {
    national_active_pct_30d: null,
    national_active_count: null,
    la_activation_ranking: [],
    feature_adoption: [],
    weekly_trend: [],
  }
  if (scopedCodes.length === 0) return empty

  const schools = await getSchoolsForAuthorities(admin, scopedCodes)
  const schoolIds = schools.map((s) => s.id)
  if (schoolIds.length === 0) return empty

  const inScope = authorities.filter((a) => scopedCodes.includes(a.code))
  const codeByLaName = new Map<string, string>()
  for (const a of inScope) codeByLaName.set(a.name, a.code)
  const codeBySchool = new Map<string, string>()
  for (const s of schools) codeBySchool.set(s.id, codeByLaName.get(s.local_authority) ?? '')

  const cutoff = new Date(Date.now() - ENGAGEMENT_RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // Per-LA activation rate via students base table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (admin as any)
    .from('students')
    .select('id, school_id, gender, simd_decile, last_active_at, school_stage')
    .in('school_id', schoolIds)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all = ((students as any[]) ?? []).filter((r: StudentRow) => applyStudentFilters(r, filters)) as StudentRow[]

  type LaAcc = { total: number; active: number }
  const perLa = new Map<string, LaAcc>()
  for (const r of all) {
    const code = codeBySchool.get(r.school_id) ?? '_'
    const acc = perLa.get(code) ?? { total: 0, active: 0 }
    acc.total += 1
    if (r.last_active_at && r.last_active_at >= cutoff) acc.active += 1
    perLa.set(code, acc)
  }
  // National headline only sums LAs whose cohort clears the threshold so a
  // small LA can't be back-derived from the national active count vs the LA
  // scorecards.
  let nationalActive = 0
  let totalStudents = 0
  for (const acc of perLa.values()) {
    if (acc.total < DEFAULT_SUPPRESSION_THRESHOLD) continue
    totalStudents += acc.total
    nationalActive += acc.active
  }

  const la_activation_ranking = inScope
    .map((a) => {
      const acc = perLa.get(a.code) ?? { total: 0, active: 0 }
      return {
        authority_code: a.code,
        authority_name: a.name,
        is_challenge_authority: a.is_challenge_authority,
        student_count: suppressSmallCohorts(acc.total),
        active_pct: safePercentage(acc.active, acc.total),
      }
    })
    .sort((a, b) => (b.active_pct ?? -1) - (a.active_pct ?? -1))

  // Feature adoption + weekly trend from MV (acceptable double-count by week)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mvQ = (admin as any)
    .from('mv_national_engagement')
    .select(
      'local_authority_code, school_id, event_type, event_category, event_detail, gender, simd_quintile, academic_year, week, unique_students, event_count',
    )
    .in('local_authority_code', scopedCodes)
  if (filters.academicYear !== 'all') mvQ = mvQ.eq('academic_year', filters.academicYear)
  if (filters.simdQuintiles.length > 0) mvQ = mvQ.in('simd_quintile', filters.simdQuintiles)
  if (filters.genders.length > 0) mvQ = mvQ.in('gender', filters.genders)
  const { data: mvRows } = await mvQ

  // Feature adoption (event_category)
  const perCategoryByLa = new Map<string, Map<string, number>>() // category -> la -> sum unique
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (mvRows as any[] | null) ?? []) {
    if (!r.event_category) continue
    let m = perCategoryByLa.get(r.event_category)
    if (!m) {
      m = new Map()
      perCategoryByLa.set(r.event_category, m)
    }
    m.set(r.local_authority_code, (m.get(r.local_authority_code) ?? 0) + Number(r.unique_students || 0))
  }
  const feature_adoption = Array.from(perCategoryByLa.entries())
    .map(([cat, perLaMap]) => {
      let count = 0
      for (const v of perLaMap.values()) {
        if (v < DEFAULT_SUPPRESSION_THRESHOLD) continue
        count += v
      }
      return {
        feature: prettifyCategory(cat),
        unique_students: suppressSmallCohorts(count),
        percentage: safePercentage(count, totalStudents),
      }
    })
    .filter((f) => f.unique_students != null)
    .sort((a, b) => (b.unique_students ?? 0) - (a.unique_students ?? 0))
    .slice(0, 12)

  // Weekly trend -- bucket per (week, LA) first so we can drop LA cells
  // below the suppression threshold before summing the national weekly
  // headline. Without this, a quiet week could leak a small per-LA cohort.
  const trendCutoffMs = Date.now() - ENGAGEMENT_TREND_WEEKS * 7 * 24 * 60 * 60 * 1000
  const byWeekLa = new Map<string, Map<string, number>>() // week -> la -> sum
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (mvRows as any[] | null) ?? []) {
    if (!r.week) continue
    const t = new Date(r.week).getTime()
    if (t < trendCutoffMs) continue
    const week = new Date(r.week).toISOString().slice(0, 10)
    const code = r.local_authority_code ?? '_'
    let perLaWeek = byWeekLa.get(week)
    if (!perLaWeek) {
      perLaWeek = new Map<string, number>()
      byWeekLa.set(week, perLaWeek)
    }
    perLaWeek.set(code, (perLaWeek.get(code) ?? 0) + Number(r.unique_students || 0))
  }
  const weekly_trend = Array.from(byWeekLa.entries())
    .map(([week_start, perLaWeek]) => {
      let total = 0
      for (const v of perLaWeek.values()) {
        if (v < DEFAULT_SUPPRESSION_THRESHOLD) continue
        total += v
      }
      return { week_start, unique_students: total }
    })
    .filter((w) => w.unique_students > 0)
    .sort((a, b) => a.week_start.localeCompare(b.week_start))

  return {
    national_active_pct_30d: safePercentage(nationalActive, totalStudents),
    national_active_count: suppressSmallCohorts(nationalActive),
    la_activation_ranking,
    feature_adoption,
    weekly_trend,
  }
}

function prettifyCategory(slug: string): string {
  const map: Record<string, string> = {
    career_sector: 'Career sector exploration',
    university: 'University exploration',
    college: 'College exploration',
    apprenticeship: 'Apprenticeships',
    bursary: 'Bursary finder',
    entitlement: 'Entitlements checker',
    support: 'Support hub',
    widening_access: 'Widening access info',
    course: 'Course search',
    saved: 'Saves and favourites',
  }
  return map[slug] ?? slug.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------------------------------------------------------------------------
// Single-authority detail view (read at the national level)
// ---------------------------------------------------------------------------

export interface AuthorityDetail {
  authority: OptedInAuthority
  scorecard: AuthorityScorecard | null
  national_average: {
    active_pct_30d: number | null
    simd_q1_pct: number | null
  }
  top_subjects: Array<{ subject_name: string; student_count: number }>
}

export async function getAuthorityDetail(
  admin: Admin,
  authorityCode: string,
  authorities: OptedInAuthority[],
  filters: NationalFilters,
): Promise<AuthorityDetail | null> {
  const target = authorities.find((a) => a.code === authorityCode)
  if (!target) return null

  const scopedCodes = authorities.map((a) => a.code)
  const scorecards = await getAuthorityScorecards(admin, authorities, [authorityCode], filters)

  // National average over all opted-in LAs (unfiltered by Challenge)
  const allScorecards = await getAuthorityScorecards(admin, authorities, scopedCodes, filters)
  const validActive = allScorecards.map((s) => s.active_pct_30d).filter((p): p is number => p != null)
  const validQ1 = allScorecards.map((s) => s.simd_q1_pct).filter((p): p is number => p != null)
  const avg = (arr: number[]) =>
    arr.length === 0 ? null : Math.round((arr.reduce((s, x) => s + x, 0) / arr.length) * 10) / 10
  const national_average = {
    active_pct_30d: avg(validActive),
    simd_q1_pct: avg(validQ1),
  }

  return {
    authority: target,
    scorecard: scorecards[0] ?? null,
    national_average,
    top_subjects: applyDisclosureToArray(scorecards[0]?.top_3_subjects ?? [], 'student_count'),
  }
}
