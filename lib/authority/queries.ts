/**
 * Server-side data-fetching helpers for the LA portal dashboard.
 *
 * All queries:
 * - Read aggregated rows from materialised views (`mv_authority_*`) when
 *   possible, never from individual student tables.
 * - Filter by the caller's `authorityName` server-side; the `admin` client
 *   parameter is service-role and would otherwise bypass RLS, so the
 *   authority-scope predicate is enforced explicitly here.
 * - Respect `schools.visible_to_authority = true`.
 * - Apply statistical disclosure control via the disclosure utility.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  applyDisclosureToArray,
  DEFAULT_SUPPRESSION_THRESHOLD,
  suppressSmallCohorts,
} from './disclosure'
import { calculateSchoolDataQuality, type StudentWithDemographics } from './data-quality'
import type {
  AuthorityFilters,
  FilterSchoolOption,
} from './filters'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = SupabaseClient<any, any, any>

const ENGAGEMENT_TREND_WEEKS = 12
const ENGAGEMENT_RECENT_WINDOW_DAYS = 30

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface AuthorityOverviewMetrics {
  total_schools: number
  total_students: number | null
  active_students_30d: number | null
  overall_data_quality: 1 | 2 | 3 | 4 | 5 | null
  data_quality_field_pct: Record<string, number>
  simd_distribution: SimdDistributionRow[]
  simd_data_completeness_pct: number
  top_subjects: TopSubjectRow[]
  subject_data_completeness_schools: number
  engagement_trend: EngagementTrendRow[]
  engagement_active_school_count: number
  refresh_timestamp: Date | null
}

export interface SimdDistributionRow {
  quintile: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'
  student_count: number | null
  percentage: number | null
}

export interface TopSubjectRow {
  subject_id: string
  subject_name: string
  student_count: number
}

export interface EngagementTrendRow {
  week_start: string // ISO yyyy-mm-dd
  unique_students: number
}

export interface SchoolScorecard {
  school_id: string
  school_name: string
  school_seed_code: string | null
  student_count: number | null
  activation_rate_pct: number | null
  data_quality_score: 1 | 2 | 3 | 4 | 5
  data_quality_field_pct: Record<string, number>
  top_3_subjects: { subject_name: string; student_count: number }[]
  simd_q1_percentage: number | null
  engagement_score: number | null
  last_activity_at: string | null
}

export interface AuthorityFilterContext {
  schoolOptions: FilterSchoolOption[]
  /** Total number of schools the LA has on Pathfinder (visible_to_authority) */
  totalSchools: number
}

// ---------------------------------------------------------------------------
// School scope (used by every query so it ends up consistent with QIO scope)
// ---------------------------------------------------------------------------

export async function loadSchoolFilterContext(
  admin: Admin,
  authorityName: string,
  qioAssignedIds: string[] | null,
): Promise<AuthorityFilterContext> {
  const { data: schools, error } = await admin
    .from('schools')
    .select('id, name, seed_code, visible_to_authority')
    .eq('local_authority', authorityName)
    .eq('visible_to_authority', true)
    .order('name', { ascending: true })

  if (error || !schools) {
    return { schoolOptions: [], totalSchools: 0 }
  }

  const allOptions: FilterSchoolOption[] = (schools as Array<{
    id: string
    name: string
    seed_code: string | null
  }>).map((s) => ({ id: s.id, name: s.name, seed_code: s.seed_code }))

  if (qioAssignedIds && qioAssignedIds.length > 0) {
    const allowed = new Set(qioAssignedIds)
    const restricted = allOptions.filter((s) => allowed.has(s.id))
    return { schoolOptions: restricted, totalSchools: restricted.length }
  }

  return { schoolOptions: allOptions, totalSchools: allOptions.length }
}

// ---------------------------------------------------------------------------
// Overview tab data
// ---------------------------------------------------------------------------

export async function getAuthorityOverview(
  admin: Admin,
  authorityName: string,
  filters: AuthorityFilters,
  scopedSchoolIds: string[],
  refreshTimestamp: Date | null,
): Promise<AuthorityOverviewMetrics> {
  if (scopedSchoolIds.length === 0) {
    return emptyOverview(refreshTimestamp)
  }

  const [
    studentsResult,
    activeResult,
    subjectChoicesResult,
    engagementResult,
  ] = await Promise.all([
    fetchStudentsForScope(admin, scopedSchoolIds, filters),
    fetchActiveStudentCount(admin, scopedSchoolIds, filters),
    fetchSubjectChoiceAggregates(admin, authorityName, scopedSchoolIds, filters),
    fetchEngagementAggregates(admin, authorityName, scopedSchoolIds, filters),
  ])

  const totalStudents = studentsResult.count
  const dq = studentsResult.dataQuality

  const simdDistribution = buildSimdDistribution(
    studentsResult.simdCounts,
    studentsResult.simdValidCount,
  )
  const simdPct = totalStudents > 0
    ? Math.round((studentsResult.simdValidCount / totalStudents) * 100)
    : 0

  const topSubjects = buildTopSubjects(subjectChoicesResult.rows)
  const engagementTrend = buildEngagementTrend(engagementResult.rows)

  return {
    total_schools: scopedSchoolIds.length,
    total_students: suppressSmallCohorts(totalStudents),
    active_students_30d: suppressSmallCohorts(activeResult),
    overall_data_quality: totalStudents === 0 ? null : dq?.overall_score ?? null,
    data_quality_field_pct: dq?.fieldPctMap ?? {},
    simd_distribution: simdDistribution,
    simd_data_completeness_pct: simdPct,
    top_subjects: topSubjects,
    subject_data_completeness_schools: subjectChoicesResult.distinctSchoolCount,
    engagement_trend: engagementTrend,
    engagement_active_school_count: engagementResult.distinctSchoolCount,
    refresh_timestamp: refreshTimestamp,
  }
}

function emptyOverview(refreshTimestamp: Date | null): AuthorityOverviewMetrics {
  return {
    total_schools: 0,
    total_students: 0,
    active_students_30d: 0,
    overall_data_quality: null,
    data_quality_field_pct: {},
    simd_distribution: [],
    simd_data_completeness_pct: 0,
    top_subjects: [],
    subject_data_completeness_schools: 0,
    engagement_trend: [],
    engagement_active_school_count: 0,
    refresh_timestamp: refreshTimestamp,
  }
}

// ---------------------------------------------------------------------------
// Underlying fetches
// ---------------------------------------------------------------------------

type StudentRow = StudentWithDemographics & {
  school_id: string
  simd_decile: number | null
  last_active_at: string | null
}

async function fetchStudentsForScope(
  admin: Admin,
  scopedSchoolIds: string[],
  filters: AuthorityFilters,
): Promise<{
  count: number
  rows: StudentRow[]
  simdCounts: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', number>
  simdValidCount: number
  dataQuality: { overall_score: 1 | 2 | 3 | 4 | 5; fieldPctMap: Record<string, number> } | null
}> {
  const { data, error } = await admin
    .from('students')
    .select('id, school_id, gender, simd_decile, last_active_at, care_experienced, has_asn, receives_free_school_meals, eal, is_young_carer, ethnicity, student_type, demographic_source, school_stage')
    .in('school_id', scopedSchoolIds)

  if (error || !data) {
    return {
      count: 0,
      rows: [],
      simdCounts: emptySimdCounts(),
      simdValidCount: 0,
      dataQuality: null,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data as any[]).filter((r) => applyStudentFilters(r, filters)) as StudentRow[]

  const simdCounts = emptySimdCounts()
  let simdValidCount = 0
  for (const r of rows) {
    const q = simdDecileToQuintile(r.simd_decile)
    if (q) {
      simdCounts[q] += 1
      simdValidCount += 1
    }
  }

  const dq = rows.length > 0 ? calculateSchoolDataQuality(rows) : null
  const fieldPctMap: Record<string, number> = {}
  if (dq) {
    for (const [k, v] of Object.entries(dq.fields)) {
      fieldPctMap[k] = v.pct
    }
  }

  return {
    count: rows.length,
    rows,
    simdCounts,
    simdValidCount,
    dataQuality: dq
      ? { overall_score: dq.overall_score, fieldPctMap }
      : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyStudentFilters(row: any, filters: AuthorityFilters): boolean {
  if (filters.genders.length > 0) {
    const g = normaliseGender(row.gender)
    if (!filters.genders.includes(g)) return false
  }
  if (filters.simdQuintiles.length > 0) {
    const q = simdDecileToQuintile(row.simd_decile)
    if (!q || !filters.simdQuintiles.includes(q)) return false
  }
  if (filters.yearGroups.length > 0) {
    const stage = row.school_stage as string | null
    const yearGroup = stage && /^S[1-6]$/.test(stage) ? stage : null
    if (!yearGroup || !filters.yearGroups.includes(yearGroup as never)) return false
  }
  return true
}

function emptySimdCounts(): Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', number> {
  return { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0 }
}

function simdDecileToQuintile(
  decile: number | null | undefined,
): 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | null {
  if (decile == null) return null
  if (decile < 1 || decile > 10) return null
  if (decile <= 2) return 'Q1'
  if (decile <= 4) return 'Q2'
  if (decile <= 6) return 'Q3'
  if (decile <= 8) return 'Q4'
  return 'Q5'
}

function normaliseGender(g: string | null | undefined): 'Male' | 'Female' | 'Other' {
  if (!g) return 'Other'
  const lower = g.toLowerCase()
  if (lower === 'male' || lower === 'm') return 'Male'
  if (lower === 'female' || lower === 'f') return 'Female'
  return 'Other'
}

async function fetchActiveStudentCount(
  admin: Admin,
  scopedSchoolIds: string[],
  filters: AuthorityFilters,
): Promise<number> {
  const cutoff = new Date(Date.now() - ENGAGEMENT_RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()

  const { data, error } = await admin
    .from('students')
    .select('id, gender, simd_decile, school_stage')
    .in('school_id', scopedSchoolIds)
    .gte('last_active_at', cutoff)

  if (error || !data) return 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).filter((r) => applyStudentFilters(r, filters)).length
}

async function fetchSubjectChoiceAggregates(
  admin: Admin,
  authorityName: string,
  scopedSchoolIds: string[],
  filters: AuthorityFilters,
): Promise<{
  rows: SubjectChoiceMvRow[]
  distinctSchoolCount: number
}> {
  let query = admin
    .from('mv_authority_subject_choices')
    .select('school_id, subject_id, subject_name, year_group, gender, simd_quintile, academic_year, student_count')
    .eq('local_authority', authorityName)
    .in('school_id', scopedSchoolIds)

  if (filters.academicYear !== 'all') {
    query = query.eq('academic_year', filters.academicYear)
  }
  if (filters.yearGroups.length > 0) {
    query = query.in('year_group', filters.yearGroups)
  }
  if (filters.simdQuintiles.length > 0) {
    query = query.in('simd_quintile', filters.simdQuintiles)
  }
  if (filters.genders.length > 0) {
    query = query.in('gender', filters.genders)
  }

  const { data, error } = await query
  if (error || !data) return { rows: [], distinctSchoolCount: 0 }

  const rows = data as SubjectChoiceMvRow[]
  const distinctSchools = new Set(rows.map((r) => r.school_id))
  return { rows, distinctSchoolCount: distinctSchools.size }
}

interface SubjectChoiceMvRow {
  school_id: string
  subject_id: string
  subject_name: string
  year_group: string | null
  gender: string | null
  simd_quintile: string | null
  academic_year: string | null
  student_count: number
}

function buildTopSubjects(rows: SubjectChoiceMvRow[]): TopSubjectRow[] {
  const totals = new Map<string, { name: string; total: number }>()
  for (const r of rows) {
    if (!r.subject_id || !r.subject_name) continue
    const existing = totals.get(r.subject_id)
    if (existing) {
      existing.total += Number(r.student_count) || 0
    } else {
      totals.set(r.subject_id, { name: r.subject_name, total: Number(r.student_count) || 0 })
    }
  }
  const arr: TopSubjectRow[] = Array.from(totals.entries())
    .map(([subject_id, v]) => ({ subject_id, subject_name: v.name, student_count: v.total }))
    .sort((a, b) => b.student_count - a.student_count)
    .slice(0, 10)
  return applyDisclosureToArray(arr, 'student_count')
}

async function fetchEngagementAggregates(
  admin: Admin,
  authorityName: string,
  scopedSchoolIds: string[],
  filters: AuthorityFilters,
): Promise<{
  rows: EngagementMvRow[]
  distinctSchoolCount: number
}> {
  const cutoffMs = Date.now() - ENGAGEMENT_TREND_WEEKS * 7 * 24 * 60 * 60 * 1000
  const cutoff = new Date(cutoffMs).toISOString()

  let query = admin
    .from('mv_authority_engagement')
    .select('school_id, week, simd_quintile, gender, academic_year, unique_students, event_count')
    .eq('local_authority', authorityName)
    .in('school_id', scopedSchoolIds)
    .gte('week', cutoff)

  if (filters.academicYear !== 'all') {
    query = query.eq('academic_year', filters.academicYear)
  }
  if (filters.simdQuintiles.length > 0) {
    query = query.in('simd_quintile', filters.simdQuintiles)
  }
  if (filters.genders.length > 0) {
    query = query.in('gender', filters.genders)
  }

  const { data, error } = await query
  if (error || !data) return { rows: [], distinctSchoolCount: 0 }

  const rows = data as EngagementMvRow[]
  const distinctSchools = new Set(rows.map((r) => r.school_id))
  return { rows, distinctSchoolCount: distinctSchools.size }
}

interface EngagementMvRow {
  school_id: string
  week: string
  simd_quintile: string | null
  gender: string | null
  academic_year: string | null
  unique_students: number
  event_count: number
}

function buildEngagementTrend(rows: EngagementMvRow[]): EngagementTrendRow[] {
  const byWeek = new Map<string, number>()
  for (const r of rows) {
    if (!r.week) continue
    // The MV uses date_trunc('week', ...) which yields a Monday; ISO week_start
    const weekStart = new Date(r.week).toISOString().slice(0, 10)
    byWeek.set(weekStart, (byWeek.get(weekStart) ?? 0) + (Number(r.unique_students) || 0))
  }
  return Array.from(byWeek.entries())
    .map(([week_start, unique_students]) => ({ week_start, unique_students }))
    .sort((a, b) => a.week_start.localeCompare(b.week_start))
}

function buildSimdDistribution(
  counts: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', number>,
  validTotal: number,
): SimdDistributionRow[] {
  const quintiles: Array<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'> = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']
  return quintiles.map((q) => {
    const count = counts[q]
    const suppressed = suppressSmallCohorts(count)
    return {
      quintile: q,
      student_count: suppressed,
      percentage: validTotal > 0 && suppressed != null
        ? Math.round((count / validTotal) * 100)
        : null,
    }
  })
}

// ---------------------------------------------------------------------------
// School scorecards
// ---------------------------------------------------------------------------

export async function getSchoolScorecards(
  admin: Admin,
  authorityName: string,
  filters: AuthorityFilters,
  scopedSchoolIds: string[],
): Promise<SchoolScorecard[]> {
  if (scopedSchoolIds.length === 0) return []

  const { data: schools, error: schoolsErr } = await admin
    .from('schools')
    .select('id, name, seed_code')
    .in('id', scopedSchoolIds)
    .eq('local_authority', authorityName)
    .eq('visible_to_authority', true)
    .order('name', { ascending: true })

  if (schoolsErr || !schools) return []

  type SchoolRow = { id: string; name: string; seed_code: string | null }
  const schoolList = schools as SchoolRow[]

  // Pull all students for scoped schools in one query, then bucket per school.
  const { data: studentRows } = await admin
    .from('students')
    .select('id, school_id, gender, simd_decile, last_active_at, care_experienced, has_asn, receives_free_school_meals, eal, is_young_carer, ethnicity, student_type, demographic_source, school_stage')
    .in('school_id', scopedSchoolIds)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studentsByScope = (studentRows as any[] | null ?? []).filter((r) => applyStudentFilters(r, filters))

  const studentsBySchool = new Map<string, StudentRow[]>()
  for (const r of studentsByScope as StudentRow[]) {
    const arr = studentsBySchool.get(r.school_id) ?? []
    arr.push(r)
    studentsBySchool.set(r.school_id, arr)
  }

  // Subject MV aggregates for top-3 per school
  let subjectQuery = admin
    .from('mv_authority_subject_choices')
    .select('school_id, subject_id, subject_name, year_group, gender, simd_quintile, academic_year, student_count')
    .eq('local_authority', authorityName)
    .in('school_id', scopedSchoolIds)
  if (filters.academicYear !== 'all') {
    subjectQuery = subjectQuery.eq('academic_year', filters.academicYear)
  }
  if (filters.yearGroups.length > 0) {
    subjectQuery = subjectQuery.in('year_group', filters.yearGroups)
  }
  if (filters.simdQuintiles.length > 0) {
    subjectQuery = subjectQuery.in('simd_quintile', filters.simdQuintiles)
  }
  if (filters.genders.length > 0) {
    subjectQuery = subjectQuery.in('gender', filters.genders)
  }
  const { data: subjectRows } = await subjectQuery

  const subjectsBySchool = new Map<string, Map<string, { name: string; total: number }>>()
  for (const r of (subjectRows as SubjectChoiceMvRow[] | null) ?? []) {
    if (!r.school_id || !r.subject_id) continue
    const map = subjectsBySchool.get(r.school_id) ?? new Map<string, { name: string; total: number }>()
    const existing = map.get(r.subject_id)
    if (existing) {
      existing.total += Number(r.student_count) || 0
    } else {
      map.set(r.subject_id, { name: r.subject_name, total: Number(r.student_count) || 0 })
    }
    subjectsBySchool.set(r.school_id, map)
  }

  // Engagement aggregates for engagement_score (events per student in last 30d)
  const cutoff30 = new Date(Date.now() - ENGAGEMENT_RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
  let engQuery = admin
    .from('mv_authority_engagement')
    .select('school_id, week, simd_quintile, gender, academic_year, unique_students, event_count')
    .eq('local_authority', authorityName)
    .in('school_id', scopedSchoolIds)
    .gte('week', cutoff30)
  if (filters.academicYear !== 'all') {
    engQuery = engQuery.eq('academic_year', filters.academicYear)
  }
  if (filters.simdQuintiles.length > 0) {
    engQuery = engQuery.in('simd_quintile', filters.simdQuintiles)
  }
  if (filters.genders.length > 0) {
    engQuery = engQuery.in('gender', filters.genders)
  }
  const { data: engRows } = await engQuery

  const engagementBySchool = new Map<string, { totalEvents: number; latestWeek: string | null }>()
  for (const r of (engRows as EngagementMvRow[] | null) ?? []) {
    if (!r.school_id) continue
    const existing = engagementBySchool.get(r.school_id) ?? { totalEvents: 0, latestWeek: null }
    existing.totalEvents += Number(r.event_count) || 0
    if (r.week && (!existing.latestWeek || r.week > existing.latestWeek)) {
      existing.latestWeek = r.week
    }
    engagementBySchool.set(r.school_id, existing)
  }

  return schoolList.map<SchoolScorecard>((school) => {
    const students = studentsBySchool.get(school.id) ?? []
    const studentCount = students.length

    const dq = students.length > 0 ? calculateSchoolDataQuality(students) : null
    const dataQualityScore: 1 | 2 | 3 | 4 | 5 = dq?.overall_score ?? 1
    const fieldPctMap: Record<string, number> = {}
    if (dq) {
      for (const [k, v] of Object.entries(dq.fields)) fieldPctMap[k] = v.pct
    }

    const activeIn30 = students.filter((s) => {
      if (!s.last_active_at) return false
      return s.last_active_at >= cutoff30
    }).length
    const activationRate = studentCount > 0
      ? Math.round((activeIn30 / studentCount) * 100)
      : null

    const simdQ1 = students.filter((s) => simdDecileToQuintile(s.simd_decile) === 'Q1').length
    const simdQ1Pct = studentCount > 0
      ? Math.round((simdQ1 / studentCount) * 100)
      : null

    const subjectsMap = subjectsBySchool.get(school.id)
    const top3 = subjectsMap
      ? Array.from(subjectsMap.values())
          .map((v) => ({ subject_name: v.name, student_count: v.total }))
          .filter((v) => v.student_count >= DEFAULT_SUPPRESSION_THRESHOLD)
          .sort((a, b) => b.student_count - a.student_count)
          .slice(0, 3)
      : []

    const eng = engagementBySchool.get(school.id)
    const engagementScore = eng && studentCount > 0
      ? Math.round((eng.totalEvents / studentCount) * 10) / 10
      : null

    return {
      school_id: school.id,
      school_name: school.name,
      school_seed_code: school.seed_code,
      student_count: suppressSmallCohorts(studentCount),
      activation_rate_pct: activationRate,
      data_quality_score: dataQualityScore,
      data_quality_field_pct: fieldPctMap,
      top_3_subjects: top3,
      simd_q1_percentage: simdQ1Pct,
      engagement_score: engagementScore,
      last_activity_at: eng?.latestWeek ?? null,
    }
  })
}
