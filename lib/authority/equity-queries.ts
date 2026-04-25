/**
 * Equity-tab data-fetching helpers for the LA portal dashboard.
 *
 * All queries:
 * - Filter by the caller's `authorityName` server-side; the `admin` client
 *   parameter is service-role and bypasses RLS, so the authority-scope
 *   predicate AND the QIO-scoped `school_id` IN-list are enforced
 *   explicitly here.
 * - Apply statistical disclosure control: every per-cell or per-row count
 *   below the suppression threshold (default 5) is reported as `null`. Any
 *   percentage derived from a suppressed count or a suppressed denominator
 *   is itself null, so percentages cannot be back-solved into a suppressed
 *   numerator (`safePercentage` enforces both sides).
 * - Read aggregated rows from `mv_authority_subject_choices` where the MV
 *   already partitions the dimension we need (gender, SIMD quintile,
 *   demographic flags). Read individual student/event rows directly when
 *   the MV cannot answer the question -- per-student STEM/modern-language
 *   membership and engagement-by-demographic-group are not pre-aggregated
 *   in the MVs and must be computed against `students`,
 *   `class_students`, `class_assignments`, and `platform_engagement_log`.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_SUPPRESSION_THRESHOLD, suppressSmallCohorts } from './disclosure'
import type { AuthorityFilters, SimdQuintile } from './filters'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = SupabaseClient<any, any, any>

const ENGAGEMENT_RECENT_WINDOW_DAYS = 30

/**
 * Canonical Scottish "modern language" qualifications. Source: Education
 * Scotland's modern-languages framework. Excludes English (L1), ESOL
 * (English-support), and the Languages for Life and Work Award (not a
 * single-language qualification). Latin is excluded because the metric in
 * the architecture spec talks about *modern* languages specifically.
 *
 * Names must match `subjects.name` exactly.
 */
const MODERN_LANGUAGE_NAMES = [
  'French',
  'Spanish',
  'German',
  'Italian',
  'Mandarin',
  'Gaelic (Learners)',
  'Gàidhlig',
  'BSL (British Sign Language)',
] as const

/**
 * Canonical STEM subject list. Same set used by the Subjects tab to keep
 * the two views aligned. Names must match `subjects.name` exactly.
 */
const STEM_SUBJECT_NAMES = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computing Science',
  'Engineering Science',
  'Design and Manufacture',
  'Graphic Communication',
] as const

/**
 * Tools/page categories that are designed for widening-access cohorts.
 * `event_category` values are matched verbatim against
 * `platform_engagement_log.event_category`.
 */
const WA_TOOL_CATEGORIES = [
  { key: 'bursary', label: 'Bursary finder' },
  { key: 'entitlement', label: 'Entitlements checker' },
  { key: 'support', label: 'Support hub pages' },
  { key: 'widening_access', label: 'Widening access info pages' },
] as const

const STEM_SET = new Set<string>(STEM_SUBJECT_NAMES)
const MODERN_LANG_SET = new Set<string>(MODERN_LANGUAGE_NAMES)

/**
 * Returns a percentage rounded to one decimal place, but only when both the
 * numerator and the denominator pass disclosure control. Either side being
 * suppressed (< 5) or the denominator being zero yields `null`. Mirror of
 * the helper in `subjects-queries.ts` -- duplicated locally to avoid
 * coupling the two files.
 */
function safePercentage(numerator: number, denominator: number | null): number | null {
  if (denominator == null) return null
  if (denominator < DEFAULT_SUPPRESSION_THRESHOLD) return null
  if (numerator < DEFAULT_SUPPRESSION_THRESHOLD) return null
  if (denominator <= 0) return null
  return Math.round((numerator / denominator) * 1000) / 10
}

/**
 * Returns an average rounded to one decimal place, but only when the cohort
 * denominator is at or above the suppression threshold. The numerator
 * (sum of subject choices, sum of events) need not be suppressed in its
 * own right because it is a derived aggregate, not a discloseable count
 * itself; the cohort size is the sensitive denominator.
 */
function safeAverage(numerator: number, cohortSize: number | null): number | null {
  if (cohortSize == null) return null
  if (cohortSize < DEFAULT_SUPPRESSION_THRESHOLD) return null
  if (cohortSize <= 0) return null
  return Math.round((numerator / cohortSize) * 10) / 10
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type GapTrend = 'widening' | 'narrowing' | 'stable' | null

export type GapDirection = 'q1_lower' | 'q5_lower' | 'equal' | null

export type GapBand = 'low' | 'mid' | 'high'

export interface SimdGapMetricRow {
  metric_key: string
  metric_name: string
  metric_unit: 'count' | 'percent' | 'avg'
  /** Q1 cohort value; null when cohort < 5 or metric not computable */
  q1_value: number | null
  /** Q5 cohort value; null when cohort < 5 or metric not computable */
  q5_value: number | null
  /** Absolute gap (Q5 - Q1 for percentages/averages, signed). */
  gap: number | null
  /** For percentage metrics, gap in pp. For averages/counts, raw difference. */
  gap_percentage_points: number | null
  gap_direction: GapDirection
  trend: GapTrend
  /** Per-school breakdown; suppressed schools (Q1 or Q5 < 5) are dropped. */
  per_school: SimdSchoolBreakdownRow[]
  /** Source notes for the methods (used in the UI tooltip). */
  notes: string | null
}

export interface SimdSchoolBreakdownRow {
  school_id: string
  school_name: string
  q1_value: number | null
  q5_value: number | null
  gap: number | null
}

export interface SimdGapAnalysis {
  metrics: SimdGapMetricRow[]
  q1_cohort_size: number | null
  q5_cohort_size: number | null
  /**
   * Of `measurable` metrics, how many show Q1 trailing Q5 (i.e. an
   * aspiration gap). All current SIMD-gap metrics are oriented so that
   * "more is better" -- choosing more subjects, exploring more careers,
   * higher engagement. So "q1 lagging" is the meaningful summary direction.
   */
  q1_lagging: number
  /** Q5 below Q1 (rare on these metrics). */
  q5_lagging: number
  /** Within the equality threshold for the unit. */
  equal: number
  /** Trend-aware counts; null until historical refresh comparison is wired. */
  narrowing: number | null
  widening: number | null
  stable: number | null
  /** Number of metrics where both Q1 and Q5 cohorts met the suppression threshold. */
  measurable: number
}

export interface SchoolSimdDistribution {
  school_id: string
  school_name: string
  total: number | null
  Q1: number | null
  Q2: number | null
  Q3: number | null
  Q4: number | null
  Q5: number | null
  q1_percentage: number | null
}

export interface DemographicGroupMetrics {
  /** Group key, e.g. 'care_experienced' */
  group_key: string
  /** Friendly label for the UI heading */
  group_label: string
  /** Cohort size; null when < 5 (also implies all derived metrics are null) */
  cohort_size: number | null
  /** Comparison cohort size (everyone else in scope) */
  comparison_cohort_size: number | null
  /** % of total cohort */
  percentage_of_cohort: number | null
  /** Average subjects per student (group); null when cohort suppressed */
  subject_count_avg: number | null
  /** Average subjects per student (comparison) */
  comparison_subject_count_avg: number | null
  /** % active in last 30 days (group) */
  engagement_rate_pct: number | null
  /** % active in last 30 days (comparison) */
  comparison_engagement_rate_pct: number | null
  /** Average distinct career sectors explored per student (group) */
  career_sectors_explored_avg: number | null
  /** Average distinct career sectors explored per student (comparison) */
  comparison_career_sectors_explored_avg: number | null
  /** % of students who created a pathway plan (placeholder; null until source) */
  pathway_plans_created_pct: number | null
  comparison_pathway_plans_created_pct: number | null
  /** Suppression flag: true when cohort < 5 (display "fewer than 5" message) */
  suppressed: boolean
}

export interface GenderGapRow {
  subject_id: string
  subject_name: string
  subject_category: string | null
  male_count: number | null
  male_percentage: number | null
  female_count: number | null
  female_percentage: number | null
  total_count: number | null
  /** Absolute pp gap between male % and female % */
  gap_percentage_points: number | null
  direction: 'male_higher' | 'female_higher' | 'balanced' | null
}

export interface WaToolUsageRow {
  tool_key: string
  tool_label: string
  q1_unique_users: number | null
  q5_unique_users: number | null
  q1_percentage: number | null
  q5_percentage: number | null
  gap_percentage_points: number | null
}

export interface EquityDataCompleteness {
  overall_demographic_pct: number
  field_pct: {
    gender: number
    simd: number
    care_experienced: number
    has_asn: number
    receives_free_school_meals: number
    eal: number
    is_young_carer: number
  }
  total_students: number
}

export interface EquityTabData {
  simd_gap: SimdGapAnalysis
  simd_distribution_per_school: SchoolSimdDistribution[]
  demographic_groups: {
    care_experienced: DemographicGroupMetrics
    fsm: DemographicGroupMetrics
    asn: DemographicGroupMetrics
    eal: DemographicGroupMetrics
    young_carer: DemographicGroupMetrics
  }
  gender_gap: GenderGapRow[]
  wa_tool_usage: WaToolUsageRow[]
  data_completeness: EquityDataCompleteness
  scope_school_count: number
  /** Schools (in scope) with at least one MV row. */
  data_completeness_schools: number
  /** Total students in scope after filters. */
  total_students_in_scope: number | null
}

// ---------------------------------------------------------------------------
// Top-level entry point
// ---------------------------------------------------------------------------

export async function getEquityTabData(
  admin: Admin,
  authorityName: string,
  filters: AuthorityFilters,
  scopedSchoolIds: string[],
  totalStudentsInScope: number | null,
): Promise<EquityTabData> {
  if (scopedSchoolIds.length === 0) {
    return emptyEquityTabData()
  }

  // Single batched fetch per data source. Each subsequent aggregation is
  // pure in-memory work over the same row sets, so disclosure rules are
  // applied consistently from one source of truth.
  const [students, schools, mvRows, perStudentSubjects, engagementEvents] =
    await Promise.all([
      fetchStudentsInScope(admin, scopedSchoolIds, filters),
      fetchSchools(admin, authorityName, scopedSchoolIds),
      fetchSubjectChoiceMv(admin, authorityName, scopedSchoolIds, filters),
      fetchPerStudentSubjects(admin, scopedSchoolIds, filters),
      fetchEngagementEvents(admin, scopedSchoolIds),
    ])

  const dataCompletenessSchools = new Set(mvRows.map((r) => r.school_id)).size

  const simdGap = buildSimdGapAnalysis(
    students,
    schools,
    perStudentSubjects,
    engagementEvents,
  )
  const simdDistribution = buildSimdDistributionPerSchool(students, schools)
  const demographicGroups = buildDemographicGroups(
    students,
    perStudentSubjects,
    engagementEvents,
  )
  const genderGap = buildGenderGap(mvRows)
  const waToolUsage = buildWaToolUsage(students, engagementEvents)
  const dataCompleteness = buildDataCompleteness(students)

  return {
    simd_gap: simdGap,
    simd_distribution_per_school: simdDistribution,
    demographic_groups: demographicGroups,
    gender_gap: genderGap,
    wa_tool_usage: waToolUsage,
    data_completeness: dataCompleteness,
    scope_school_count: scopedSchoolIds.length,
    data_completeness_schools: dataCompletenessSchools,
    total_students_in_scope: totalStudentsInScope,
  }
}

function emptyEquityTabData(): EquityTabData {
  return {
    simd_gap: {
      metrics: [],
      q1_cohort_size: 0,
      q5_cohort_size: 0,
      q1_lagging: 0,
      q5_lagging: 0,
      equal: 0,
      narrowing: null,
      widening: null,
      stable: null,
      measurable: 0,
    },
    simd_distribution_per_school: [],
    demographic_groups: {
      care_experienced: emptyGroup('care_experienced', 'Care-experienced'),
      fsm: emptyGroup('fsm', 'FSM-registered'),
      asn: emptyGroup('asn', 'Additional Support Needs'),
      eal: emptyGroup('eal', 'EAL / ESOL'),
      young_carer: emptyGroup('young_carer', 'Young carers'),
    },
    gender_gap: [],
    wa_tool_usage: [],
    data_completeness: {
      overall_demographic_pct: 0,
      field_pct: {
        gender: 0,
        simd: 0,
        care_experienced: 0,
        has_asn: 0,
        receives_free_school_meals: 0,
        eal: 0,
        is_young_carer: 0,
      },
      total_students: 0,
    },
    scope_school_count: 0,
    data_completeness_schools: 0,
    total_students_in_scope: 0,
  }
}

function emptyGroup(group_key: string, group_label: string): DemographicGroupMetrics {
  return {
    group_key,
    group_label,
    cohort_size: null,
    comparison_cohort_size: null,
    percentage_of_cohort: null,
    subject_count_avg: null,
    comparison_subject_count_avg: null,
    engagement_rate_pct: null,
    comparison_engagement_rate_pct: null,
    career_sectors_explored_avg: null,
    comparison_career_sectors_explored_avg: null,
    pathway_plans_created_pct: null,
    comparison_pathway_plans_created_pct: null,
    suppressed: true,
  }
}

// ---------------------------------------------------------------------------
// Underlying fetches
// ---------------------------------------------------------------------------

interface StudentRow {
  id: string
  school_id: string
  gender: string | null
  simd_decile: number | null
  simd_quintile: SimdQuintile | null
  last_active_at: string | null
  care_experienced: boolean | null
  has_asn: boolean | null
  receives_free_school_meals: boolean | null
  eal: boolean | null
  is_young_carer: boolean | null
  is_home_educated: boolean | null
  school_stage: string | null
}

async function fetchStudentsInScope(
  admin: Admin,
  scopedSchoolIds: string[],
  filters: AuthorityFilters,
): Promise<StudentRow[]> {
  const { data, error } = await admin
    .from('students')
    .select(
      'id, school_id, gender, simd_decile, last_active_at, care_experienced, has_asn, receives_free_school_meals, eal, is_young_carer, is_home_educated, school_stage',
    )
    .in('school_id', scopedSchoolIds)
  if (error || !data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = (data as any[]).filter((r) => applyStudentFilters(r, filters))
  return filtered.map((r) => ({
    id: r.id,
    school_id: r.school_id,
    gender: r.gender ?? null,
    simd_decile: r.simd_decile ?? null,
    simd_quintile: simdDecileToQuintile(r.simd_decile),
    last_active_at: r.last_active_at ?? null,
    care_experienced: r.care_experienced ?? null,
    has_asn: r.has_asn ?? null,
    receives_free_school_meals: r.receives_free_school_meals ?? null,
    eal: r.eal ?? null,
    is_young_carer: r.is_young_carer ?? null,
    is_home_educated: r.is_home_educated ?? null,
    school_stage: r.school_stage ?? null,
  }))
}

interface SchoolRow {
  id: string
  name: string
  seed_code: string | null
}

async function fetchSchools(
  admin: Admin,
  authorityName: string,
  scopedSchoolIds: string[],
): Promise<SchoolRow[]> {
  const { data } = await admin
    .from('schools')
    .select('id, name, seed_code')
    .in('id', scopedSchoolIds)
    .eq('local_authority', authorityName)
    .eq('visible_to_authority', true)
    .order('name', { ascending: true })
  return (data as SchoolRow[] | null) ?? []
}

interface SubjectChoiceMvRow {
  school_id: string
  school_name: string | null
  subject_id: string
  subject_name: string | null
  subject_category: string | null
  gender: string | null
  simd_quintile: string | null
  is_care_experienced: boolean | null
  has_asn: boolean | null
  is_fsm_registered: boolean | null
  is_eal: boolean | null
  is_young_carer: boolean | null
  is_home_educated: boolean | null
  student_count: number
}

async function fetchSubjectChoiceMv(
  admin: Admin,
  authorityName: string,
  scopedSchoolIds: string[],
  filters: AuthorityFilters,
): Promise<SubjectChoiceMvRow[]> {
  let query = admin
    .from('mv_authority_subject_choices')
    .select(
      'school_id, school_name, subject_id, subject_name, subject_category, gender, simd_quintile, is_care_experienced, has_asn, is_fsm_registered, is_eal, is_young_carer, is_home_educated, student_count',
    )
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
  if (error || !data) return []
  return data as SubjectChoiceMvRow[]
}

interface PerStudentSubjectRow {
  student_id: string
  school_id: string
  subject_name: string | null
  subject_category: string | null
}

async function fetchPerStudentSubjects(
  admin: Admin,
  scopedSchoolIds: string[],
  filters: AuthorityFilters,
): Promise<PerStudentSubjectRow[]> {
  let query = admin
    .from('class_assignments')
    .select(
      'school_id, academic_year, year_group, subject_id, subject:subjects(name, curricular_area:curricular_areas(name)), class_students(student_id)',
    )
    .in('school_id', scopedSchoolIds)
  if (filters.academicYear !== 'all') {
    query = query.eq('academic_year', filters.academicYear)
  }
  if (filters.yearGroups.length > 0) {
    query = query.in('year_group', filters.yearGroups)
  }
  const { data, error } = await query
  if (error || !data) return []

  const out: PerStudentSubjectRow[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const ca of data as any[]) {
    const subjectName = ca.subject?.name ?? null
    const subjectCategory = ca.subject?.curricular_area?.name ?? null
    const cs = Array.isArray(ca.class_students) ? ca.class_students : []
    for (const c of cs) {
      out.push({
        student_id: c.student_id,
        school_id: ca.school_id,
        subject_name: subjectName,
        subject_category: subjectCategory,
      })
    }
  }
  return out
}

interface EngagementEventRow {
  student_id: string
  school_id: string
  event_type: string | null
  event_category: string | null
  event_detail: string | null
  created_at: string
}

async function fetchEngagementEvents(
  admin: Admin,
  scopedSchoolIds: string[],
): Promise<EngagementEventRow[]> {
  // Time horizon: last 90 days for Equity tab metrics. Career-sectors-
  // explored and tool-usage are about *recent* engagement, not lifetime.
  // Year-groups, gender, SIMD and AY filters live on `students`, not on
  // `platform_engagement_log` -- the row-level filter is applied later in
  // memory via the (already filtered) student set.
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const query = admin
    .from('platform_engagement_log')
    .select('student_id, school_id, event_type, event_category, event_detail, created_at')
    .in('school_id', scopedSchoolIds)
    .gte('created_at', cutoff)
  const { data, error } = await query
  if (error || !data) return []
  return data as EngagementEventRow[]
}

// ---------------------------------------------------------------------------
// Filter / normalisation helpers
// ---------------------------------------------------------------------------

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
    const upper = stage ? stage.toUpperCase() : null
    const yearGroup = upper && /^S[1-6]$/.test(upper) ? upper : null
    if (!yearGroup || !filters.yearGroups.includes(yearGroup as never)) return false
  }
  return true
}

function simdDecileToQuintile(
  decile: number | null | undefined,
): SimdQuintile | null {
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

// ---------------------------------------------------------------------------
// 1a. SIMD gap analysis
// ---------------------------------------------------------------------------

interface MetricBuilder {
  key: string
  name: string
  unit: 'count' | 'percent' | 'avg'
  notes: string | null
  /**
   * Compute the value for a given quintile cohort. Returns null when
   * disclosure control suppresses the value (cohort or numerator below
   * threshold). The row builder treats null as "metric unavailable".
   */
  computeForQuintile: (quintile: SimdQuintile, scope: GapScope) => number | null
  /** Per-school value for a given quintile cohort at one school. */
  computeForSchoolQuintile: (
    quintile: SimdQuintile,
    schoolId: string,
    scope: GapScope,
  ) => number | null
}

interface GapScope {
  studentsByQuintile: Record<SimdQuintile, StudentRow[]>
  studentsBySchoolQuintile: Map<string, Record<SimdQuintile, StudentRow[]>>
  perStudentSubjectByStudent: Map<string, PerStudentSubjectRow[]>
  engagementByStudent: Map<string, EngagementEventRow[]>
  schoolNames: Map<string, string>
}

function buildSimdGapAnalysis(
  students: StudentRow[],
  schools: SchoolRow[],
  perStudentSubjects: PerStudentSubjectRow[],
  engagementEvents: EngagementEventRow[],
): SimdGapAnalysis {
  // Bucket students by quintile and by (school, quintile)
  const byQuintile: Record<SimdQuintile, StudentRow[]> = {
    Q1: [], Q2: [], Q3: [], Q4: [], Q5: [],
  }
  const bySchoolQuintile = new Map<string, Record<SimdQuintile, StudentRow[]>>()
  const schoolNames = new Map<string, string>()
  for (const sch of schools) schoolNames.set(sch.id, sch.name)
  for (const s of students) {
    if (s.simd_quintile) byQuintile[s.simd_quintile].push(s)
    let sub = bySchoolQuintile.get(s.school_id)
    if (!sub) {
      sub = { Q1: [], Q2: [], Q3: [], Q4: [], Q5: [] }
      bySchoolQuintile.set(s.school_id, sub)
    }
    if (s.simd_quintile) sub[s.simd_quintile].push(s)
  }

  // Per-student subject lookup
  const perStudent = new Map<string, PerStudentSubjectRow[]>()
  for (const r of perStudentSubjects) {
    const arr = perStudent.get(r.student_id) ?? []
    arr.push(r)
    perStudent.set(r.student_id, arr)
  }

  const engPerStudent = new Map<string, EngagementEventRow[]>()
  for (const e of engagementEvents) {
    const arr = engPerStudent.get(e.student_id) ?? []
    arr.push(e)
    engPerStudent.set(e.student_id, arr)
  }

  const scope: GapScope = {
    studentsByQuintile: byQuintile,
    studentsBySchoolQuintile: bySchoolQuintile,
    perStudentSubjectByStudent: perStudent,
    engagementByStudent: engPerStudent,
    schoolNames,
  }

  const builders: MetricBuilder[] = [
    {
      key: 'avg_subjects',
      name: 'Average subjects chosen per student',
      unit: 'avg',
      notes: 'Mean number of subject classes per student.',
      computeForQuintile: (q, sc) => {
        const cohort = sc.studentsByQuintile[q]
        if (cohort.length < DEFAULT_SUPPRESSION_THRESHOLD) return null
        let total = 0
        for (const s of cohort) {
          total += sc.perStudentSubjectByStudent.get(s.id)?.length ?? 0
        }
        return total / cohort.length
      },
      computeForSchoolQuintile: (q, schoolId, sc) => {
        const cohort = sc.studentsBySchoolQuintile.get(schoolId)?.[q] ?? []
        if (cohort.length < DEFAULT_SUPPRESSION_THRESHOLD) return null
        let total = 0
        for (const s of cohort) {
          total += sc.perStudentSubjectByStudent.get(s.id)?.length ?? 0
        }
        return total / cohort.length
      },
    },
    {
      key: 'pct_at_least_one_stem',
      name: 'Choosing at least one STEM subject',
      unit: 'percent',
      notes:
        'STEM = Mathematics, Physics, Chemistry, Biology, Computing Science, Engineering Science, Design and Manufacture, Graphic Communication.',
      computeForQuintile: (q, sc) =>
        pctOfCohortWithSubject(sc.studentsByQuintile[q], sc, STEM_SET),
      computeForSchoolQuintile: (q, schoolId, sc) =>
        pctOfCohortWithSubject(
          sc.studentsBySchoolQuintile.get(schoolId)?.[q] ?? [],
          sc,
          STEM_SET,
        ),
    },
    {
      key: 'pct_modern_language',
      name: 'Choosing a modern language',
      unit: 'percent',
      notes:
        'Modern languages: French, Spanish, German, Italian, Mandarin, Gaelic (Learners), Gàidhlig, BSL.',
      computeForQuintile: (q, sc) =>
        pctOfCohortWithSubject(sc.studentsByQuintile[q], sc, MODERN_LANG_SET),
      computeForSchoolQuintile: (q, schoolId, sc) =>
        pctOfCohortWithSubject(
          sc.studentsBySchoolQuintile.get(schoolId)?.[q] ?? [],
          sc,
          MODERN_LANG_SET,
        ),
    },
    {
      key: 'avg_career_sectors_explored',
      name: 'Average career sectors explored',
      unit: 'avg',
      notes:
        'Mean distinct sectors viewed (event_category = "career_sector") in the last 90 days.',
      computeForQuintile: (q, sc) =>
        avgDistinctEventDetail(
          sc.studentsByQuintile[q],
          sc,
          'career_sector',
        ),
      computeForSchoolQuintile: (q, schoolId, sc) =>
        avgDistinctEventDetail(
          sc.studentsBySchoolQuintile.get(schoolId)?.[q] ?? [],
          sc,
          'career_sector',
        ),
    },
    {
      key: 'pct_university_view',
      name: 'Viewed a university page',
      unit: 'percent',
      notes:
        'Students with at least one event_category = "university" event in the last 90 days.',
      computeForQuintile: (q, sc) =>
        pctOfCohortWithEventCategory(
          sc.studentsByQuintile[q],
          sc,
          ['university'],
        ),
      computeForSchoolQuintile: (q, schoolId, sc) =>
        pctOfCohortWithEventCategory(
          sc.studentsBySchoolQuintile.get(schoolId)?.[q] ?? [],
          sc,
          ['university'],
        ),
    },
    {
      key: 'pct_bursary_entitlement_used',
      name: 'Used bursary or entitlements finder',
      unit: 'percent',
      notes:
        'Students with at least one event_category in {"bursary","entitlement"} in the last 90 days.',
      computeForQuintile: (q, sc) =>
        pctOfCohortWithEventCategory(
          sc.studentsByQuintile[q],
          sc,
          ['bursary', 'entitlement'],
        ),
      computeForSchoolQuintile: (q, schoolId, sc) =>
        pctOfCohortWithEventCategory(
          sc.studentsBySchoolQuintile.get(schoolId)?.[q] ?? [],
          sc,
          ['bursary', 'entitlement'],
        ),
    },
  ]

  const q1Cohort = byQuintile.Q1.length
  const q5Cohort = byQuintile.Q5.length

  const metricRows = builders.map<SimdGapMetricRow>((b) => {
    // The MetricBuilder helpers internally enforce cohort + numerator
    // suppression and return null when either falls below the disclosure
    // threshold. We therefore do not pre-check cohort size here; the
    // helper is the single point of truth.
    const q1Raw = b.computeForQuintile('Q1', scope)
    const q5Raw = b.computeForQuintile('Q5', scope)
    const q1 = q1Raw == null ? null : roundForUnit(q1Raw, b.unit)
    const q5 = q5Raw == null ? null : roundForUnit(q5Raw, b.unit)

    const gap = q1 == null || q5 == null ? null : roundForUnit(q5 - q1, b.unit)
    const direction: GapDirection =
      q1 == null || q5 == null
        ? null
        : Math.abs((q5 - q1)) < epsilonForUnit(b.unit)
          ? 'equal'
          : q1 < q5
            ? 'q1_lower'
            : 'q5_lower'

    // Per-school breakdown: include only schools where BOTH Q1 and Q5
    // cohorts at that school meet the threshold AND both values come back
    // non-null from the helper (which itself enforces numerator
    // suppression for percent metrics). Either suppression channel triggers
    // exclusion of the school row -- no partial pairs.
    const perSchool: SimdSchoolBreakdownRow[] = []
    for (const [schoolId, perQuintile] of scope.studentsBySchoolQuintile.entries()) {
      const sQ1 = perQuintile.Q1.length
      const sQ5 = perQuintile.Q5.length
      if (sQ1 < DEFAULT_SUPPRESSION_THRESHOLD || sQ5 < DEFAULT_SUPPRESSION_THRESHOLD) {
        continue
      }
      const sQ1Raw = b.computeForSchoolQuintile('Q1', schoolId, scope)
      const sQ5Raw = b.computeForSchoolQuintile('Q5', schoolId, scope)
      if (sQ1Raw == null || sQ5Raw == null) continue
      const sQ1Val = roundForUnit(sQ1Raw, b.unit)
      const sQ5Val = roundForUnit(sQ5Raw, b.unit)
      const sGap = roundForUnit(sQ5Val - sQ1Val, b.unit)
      perSchool.push({
        school_id: schoolId,
        school_name: scope.schoolNames.get(schoolId) ?? schoolId,
        q1_value: sQ1Val,
        q5_value: sQ5Val,
        gap: sGap,
      })
    }

    return {
      metric_key: b.key,
      metric_name: b.name,
      metric_unit: b.unit,
      q1_value: q1,
      q5_value: q5,
      gap,
      gap_percentage_points: gap, // for percent metrics this is pp; for avg/count it's raw
      gap_direction: direction,
      trend: null, // historical comparison not yet wired up
      per_school: perSchool,
      notes: b.notes,
    }
  })

  let q1Lagging = 0, q5Lagging = 0, equal = 0, measurable = 0
  for (const m of metricRows) {
    if (m.gap == null || m.gap_direction == null) continue
    measurable += 1
    if (m.gap_direction === 'q1_lower') q1Lagging += 1
    else if (m.gap_direction === 'q5_lower') q5Lagging += 1
    else equal += 1
  }

  return {
    metrics: metricRows,
    q1_cohort_size: suppressSmallCohorts(q1Cohort),
    q5_cohort_size: suppressSmallCohorts(q5Cohort),
    q1_lagging: q1Lagging,
    q5_lagging: q5Lagging,
    equal,
    narrowing: null,
    widening: null,
    stable: null,
    measurable,
  }
}

/**
 * Returns the percentage of `cohort` who took at least one subject from
 * `subjectSet`, or null when either the cohort or the matched-student
 * count would breach the disclosure threshold. The numerator suppression
 * is essential here -- without it, a 4/50 = 8% reading would let an
 * observer back-derive that exactly 4 students chose the subject set.
 */
function pctOfCohortWithSubject(
  cohort: StudentRow[],
  scope: GapScope,
  subjectSet: Set<string>,
): number | null {
  if (cohort.length === 0) return null
  let count = 0
  for (const s of cohort) {
    const subs = scope.perStudentSubjectByStudent.get(s.id) ?? []
    if (subs.some((r) => r.subject_name && subjectSet.has(r.subject_name))) count += 1
  }
  return safePercentage(count, cohort.length)
}

function pctOfCohortWithEventCategory(
  cohort: StudentRow[],
  scope: GapScope,
  categories: string[],
): number | null {
  if (cohort.length === 0) return null
  const set = new Set(categories)
  let count = 0
  for (const s of cohort) {
    const events = scope.engagementByStudent.get(s.id) ?? []
    if (events.some((e) => e.event_category && set.has(e.event_category))) count += 1
  }
  return safePercentage(count, cohort.length)
}

/**
 * Average distinct event details (e.g. distinct sectors viewed) per
 * student in the cohort. Cohort size below threshold returns null.
 * Numerator (sum of distinct events) does not itself disclose individual
 * activity since it is summed-then-divided -- the cohort-size check is
 * sufficient.
 */
function avgDistinctEventDetail(
  cohort: StudentRow[],
  scope: GapScope,
  eventCategory: string,
): number | null {
  if (cohort.length < DEFAULT_SUPPRESSION_THRESHOLD) return null
  let total = 0
  for (const s of cohort) {
    const events = scope.engagementByStudent.get(s.id) ?? []
    const distinct = new Set<string>()
    for (const e of events) {
      if (e.event_category === eventCategory && e.event_detail) {
        distinct.add(e.event_detail)
      }
    }
    total += distinct.size
  }
  return total / cohort.length
}

function roundForUnit(v: number, unit: 'count' | 'percent' | 'avg'): number {
  if (unit === 'count') return Math.round(v)
  return Math.round(v * 10) / 10
}

function epsilonForUnit(unit: 'count' | 'percent' | 'avg'): number {
  if (unit === 'count') return 0.5
  return 0.1
}

// ---------------------------------------------------------------------------
// 2. SIMD distribution per school
// ---------------------------------------------------------------------------

function buildSimdDistributionPerSchool(
  students: StudentRow[],
  schools: SchoolRow[],
): SchoolSimdDistribution[] {
  const bySchool = new Map<string, Record<SimdQuintile | 'unknown', number>>()
  for (const s of students) {
    const r = bySchool.get(s.school_id) ?? { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, unknown: 0 }
    if (s.simd_quintile) r[s.simd_quintile] += 1
    else r.unknown += 1
    bySchool.set(s.school_id, r)
  }
  return schools.map<SchoolSimdDistribution>((sch) => {
    const r = bySchool.get(sch.id)
    if (!r) {
      return {
        school_id: sch.id,
        school_name: sch.name,
        total: 0,
        Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0,
        q1_percentage: null,
      }
    }
    const total = r.Q1 + r.Q2 + r.Q3 + r.Q4 + r.Q5
    // Secondary suppression: if any single quintile is below the threshold,
    // suppress every quintile and the total. Without this, an observer
    // could derive a suppressed quintile by subtraction from the total.
    const anySuppressed = (
      r.Q1 < DEFAULT_SUPPRESSION_THRESHOLD
      || r.Q2 < DEFAULT_SUPPRESSION_THRESHOLD
      || r.Q3 < DEFAULT_SUPPRESSION_THRESHOLD
      || r.Q4 < DEFAULT_SUPPRESSION_THRESHOLD
      || r.Q5 < DEFAULT_SUPPRESSION_THRESHOLD
    )
    if (anySuppressed) {
      return {
        school_id: sch.id,
        school_name: sch.name,
        total: null,
        Q1: null, Q2: null, Q3: null, Q4: null, Q5: null,
        q1_percentage: null,
      }
    }
    return {
      school_id: sch.id,
      school_name: sch.name,
      total: suppressSmallCohorts(total),
      Q1: suppressSmallCohorts(r.Q1),
      Q2: suppressSmallCohorts(r.Q2),
      Q3: suppressSmallCohorts(r.Q3),
      Q4: suppressSmallCohorts(r.Q4),
      Q5: suppressSmallCohorts(r.Q5),
      q1_percentage: safePercentage(r.Q1, total),
    }
  })
}

// ---------------------------------------------------------------------------
// 3. Demographic group metrics
// ---------------------------------------------------------------------------

type GroupKey = 'care_experienced' | 'fsm' | 'asn' | 'eal' | 'young_carer'

interface GroupDef {
  key: GroupKey
  label: string
  predicate: (s: StudentRow) => boolean
}

const GROUP_DEFS: GroupDef[] = [
  { key: 'care_experienced', label: 'Care-experienced', predicate: (s) => s.care_experienced === true },
  { key: 'fsm', label: 'FSM-registered', predicate: (s) => s.receives_free_school_meals === true },
  { key: 'asn', label: 'Additional Support Needs', predicate: (s) => s.has_asn === true },
  { key: 'eal', label: 'EAL / ESOL', predicate: (s) => s.eal === true },
  { key: 'young_carer', label: 'Young carers', predicate: (s) => s.is_young_carer === true },
]

function buildDemographicGroups(
  students: StudentRow[],
  perStudentSubjects: PerStudentSubjectRow[],
  engagementEvents: EngagementEventRow[],
): EquityTabData['demographic_groups'] {
  const cutoff = new Date(Date.now() - ENGAGEMENT_RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const subjectsByStudent = new Map<string, PerStudentSubjectRow[]>()
  for (const r of perStudentSubjects) {
    const arr = subjectsByStudent.get(r.student_id) ?? []
    arr.push(r)
    subjectsByStudent.set(r.student_id, arr)
  }

  const engByStudent = new Map<string, EngagementEventRow[]>()
  for (const e of engagementEvents) {
    const arr = engByStudent.get(e.student_id) ?? []
    arr.push(e)
    engByStudent.set(e.student_id, arr)
  }

  const totalCohort = students.length

  const result: Record<GroupKey, DemographicGroupMetrics> = {
    care_experienced: emptyGroup('care_experienced', 'Care-experienced'),
    fsm: emptyGroup('fsm', 'FSM-registered'),
    asn: emptyGroup('asn', 'Additional Support Needs'),
    eal: emptyGroup('eal', 'EAL / ESOL'),
    young_carer: emptyGroup('young_carer', 'Young carers'),
  }

  for (const def of GROUP_DEFS) {
    const inGroup = students.filter(def.predicate)
    const comparison = students.filter((s) => !def.predicate(s))
    const groupSize = inGroup.length
    const compSize = comparison.length

    const groupSuppressed = groupSize < DEFAULT_SUPPRESSION_THRESHOLD
    const compSuppressed = compSize < DEFAULT_SUPPRESSION_THRESHOLD

    // CRITICAL: when the group itself is suppressed (cohort < 5), every
    // field for that group AND its comparison must be null so that no
    // back-derivation is possible. The comparison cohort size combined
    // with any total-cohort figure would otherwise let an observer
    // compute the suppressed group size as `total - comparison`.
    if (groupSuppressed) {
      result[def.key] = emptyGroup(def.key, def.label)
      continue
    }

    const subjectAvgInGroup = safeAverage(
      inGroup.reduce((acc, s) => acc + (subjectsByStudent.get(s.id)?.length ?? 0), 0),
      groupSize,
    )
    const subjectAvgComparison = compSuppressed
      ? null
      : safeAverage(
          comparison.reduce((acc, s) => acc + (subjectsByStudent.get(s.id)?.length ?? 0), 0),
          compSize,
        )

    const activeCount = (cohort: StudentRow[]) =>
      cohort.filter((s) => s.last_active_at && s.last_active_at >= cutoff).length

    const engagementRate = safePercentage(activeCount(inGroup), groupSize)
    const comparisonEngagementRate = compSuppressed
      ? null
      : safePercentage(activeCount(comparison), compSize)

    const careerSectorsAvg = (cohort: StudentRow[]) => {
      if (cohort.length < DEFAULT_SUPPRESSION_THRESHOLD) return null
      let total = 0
      for (const s of cohort) {
        const events = engByStudent.get(s.id) ?? []
        const distinct = new Set<string>()
        for (const e of events) {
          if (e.event_category === 'career_sector' && e.event_detail) distinct.add(e.event_detail)
        }
        total += distinct.size
      }
      return Math.round((total / cohort.length) * 10) / 10
    }

    result[def.key] = {
      group_key: def.key,
      group_label: def.label,
      cohort_size: groupSize,
      // Comparison size is suppressed when its own cohort is < 5.
      // (When the group is < 5, the early-return above has already
      // returned a fully-suppressed payload.)
      comparison_cohort_size: compSuppressed ? null : compSize,
      percentage_of_cohort: safePercentage(groupSize, totalCohort),
      subject_count_avg: subjectAvgInGroup,
      comparison_subject_count_avg: subjectAvgComparison,
      engagement_rate_pct: engagementRate,
      comparison_engagement_rate_pct: comparisonEngagementRate,
      career_sectors_explored_avg: careerSectorsAvg(inGroup),
      comparison_career_sectors_explored_avg: compSuppressed ? null : careerSectorsAvg(comparison),
      // Pathway plans table doesn't exist yet -- document with null
      pathway_plans_created_pct: null,
      comparison_pathway_plans_created_pct: null,
      suppressed: false,
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// 4. Gender gap analysis (all subjects)
// ---------------------------------------------------------------------------

interface GenderAccumulator {
  subject_id: string
  subject_name: string
  subject_category: string | null
  male: number
  female: number
  other: number
}

function buildGenderGap(rows: SubjectChoiceMvRow[]): GenderGapRow[] {
  const acc = new Map<string, GenderAccumulator>()
  for (const r of rows) {
    if (!r.subject_id || !r.subject_name) continue
    const a = acc.get(r.subject_id) ?? {
      subject_id: r.subject_id,
      subject_name: r.subject_name,
      subject_category: r.subject_category,
      male: 0,
      female: 0,
      other: 0,
    }
    const n = Number(r.student_count) || 0
    const g = normaliseGender(r.gender).toLowerCase()
    if (g === 'male') a.male += n
    else if (g === 'female') a.female += n
    else a.other += n
    acc.set(r.subject_id, a)
  }

  const out: GenderGapRow[] = []
  for (const a of acc.values()) {
    const total = a.male + a.female + a.other
    const malePct = safePercentage(a.male, total)
    const femalePct = safePercentage(a.female, total)
    const gap =
      malePct == null || femalePct == null
        ? null
        : Math.round(Math.abs(malePct - femalePct) * 10) / 10
    let direction: GenderGapRow['direction'] = null
    if (malePct != null && femalePct != null) {
      if (Math.abs(malePct - femalePct) < 5) direction = 'balanced'
      else if (malePct > femalePct) direction = 'male_higher'
      else direction = 'female_higher'
    }
    // Secondary suppression on the total: if either male or female count
    // is suppressed, suppress the total too. Otherwise an observer could
    // back-derive the suppressed gender count via total minus the visible
    // genders. The "other" bucket is too small in practice to fully
    // disclose, but we suppress it the same way for consistency.
    const maleSuppressed = a.male < DEFAULT_SUPPRESSION_THRESHOLD
    const femaleSuppressed = a.female < DEFAULT_SUPPRESSION_THRESHOLD
    const otherSuppressed = a.other < DEFAULT_SUPPRESSION_THRESHOLD
    const anySuppressed = maleSuppressed || femaleSuppressed || otherSuppressed
    out.push({
      subject_id: a.subject_id,
      subject_name: a.subject_name,
      subject_category: a.subject_category,
      male_count: suppressSmallCohorts(a.male),
      male_percentage: malePct,
      female_count: suppressSmallCohorts(a.female),
      female_percentage: femalePct,
      total_count: anySuppressed ? null : suppressSmallCohorts(total),
      gap_percentage_points: gap,
      direction,
    })
  }

  // Sort by largest gap first; rows with null gaps trail.
  out.sort((a, b) => {
    const ag = a.gap_percentage_points ?? -1
    const bg = b.gap_percentage_points ?? -1
    return bg - ag
  })
  return out
}

// ---------------------------------------------------------------------------
// 5. Widening access tool usage
// ---------------------------------------------------------------------------

function buildWaToolUsage(
  students: StudentRow[],
  events: EngagementEventRow[],
): WaToolUsageRow[] {
  // Map student_id -> quintile so we can attribute events. Engagement
  // events have only student_id; the simd quintile lives on `students`.
  const quintileByStudent = new Map<string, SimdQuintile>()
  for (const s of students) {
    if (s.simd_quintile) quintileByStudent.set(s.id, s.simd_quintile)
  }

  // Quintile cohort sizes (denominators) -- these are the eligible
  // populations for the "% used X" rate, so they must reflect the full
  // filtered scope, not just students who fired engagement events.
  const q1Cohort = students.filter((s) => s.simd_quintile === 'Q1').length
  const q5Cohort = students.filter((s) => s.simd_quintile === 'Q5').length

  // Per (tool_key, quintile) → unique student IDs that fired that category.
  const usersByToolQuintile = new Map<string, Set<string>>()
  const key = (toolKey: string, q: SimdQuintile) => `${toolKey}|${q}`

  for (const tool of WA_TOOL_CATEGORIES) {
    usersByToolQuintile.set(key(tool.key, 'Q1'), new Set())
    usersByToolQuintile.set(key(tool.key, 'Q5'), new Set())
  }

  for (const e of events) {
    if (!e.event_category || !e.student_id) continue
    const q = quintileByStudent.get(e.student_id)
    if (q !== 'Q1' && q !== 'Q5') continue
    const tool = mapEventCategoryToTool(e.event_category, e.event_detail)
    if (!tool) continue
    usersByToolQuintile.get(key(tool, q))?.add(e.student_id)
  }

  return WA_TOOL_CATEGORIES.map<WaToolUsageRow>((tool) => {
    const q1Users = usersByToolQuintile.get(key(tool.key, 'Q1'))?.size ?? 0
    const q5Users = usersByToolQuintile.get(key(tool.key, 'Q5'))?.size ?? 0
    const q1Pct = safePercentage(q1Users, q1Cohort)
    const q5Pct = safePercentage(q5Users, q5Cohort)
    const gap =
      q1Pct == null || q5Pct == null
        ? null
        : Math.round(Math.abs(q5Pct - q1Pct) * 10) / 10
    return {
      tool_key: tool.key,
      tool_label: tool.label,
      q1_unique_users: suppressSmallCohorts(q1Users),
      q5_unique_users: suppressSmallCohorts(q5Users),
      q1_percentage: q1Pct,
      q5_percentage: q5Pct,
      gap_percentage_points: gap,
    }
  })
}

/**
 * Maps an engagement event to one of the WA tool categories. Recognises
 * direct event_category matches ("bursary", "entitlement", "support") plus
 * widening-access pages identified by event_detail substring (no dedicated
 * event_category exists yet for WA pages so we sniff the detail string).
 */
function mapEventCategoryToTool(
  category: string,
  detail: string | null,
): typeof WA_TOOL_CATEGORIES[number]['key'] | null {
  if (category === 'bursary') return 'bursary'
  if (category === 'entitlement') return 'entitlement'
  if (category === 'support') return 'support'
  if (
    category === 'widening_access'
    || (detail && /widening[-_ ]access|sw[a]p|reach|sumitup/i.test(detail))
  ) return 'widening_access'
  return null
}

// ---------------------------------------------------------------------------
// 6. Data completeness
// ---------------------------------------------------------------------------

function buildDataCompleteness(students: StudentRow[]): EquityDataCompleteness {
  const total = students.length
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100))

  const fieldCounts = {
    gender: 0,
    simd: 0,
    care_experienced: 0,
    has_asn: 0,
    receives_free_school_meals: 0,
    eal: 0,
    is_young_carer: 0,
  }

  for (const s of students) {
    if (s.gender && s.gender.trim().length > 0) fieldCounts.gender += 1
    if (s.simd_decile != null) fieldCounts.simd += 1
    if (s.care_experienced !== null) fieldCounts.care_experienced += 1
    if (s.has_asn !== null) fieldCounts.has_asn += 1
    if (s.receives_free_school_meals !== null) fieldCounts.receives_free_school_meals += 1
    if (s.eal !== null) fieldCounts.eal += 1
    if (s.is_young_carer !== null) fieldCounts.is_young_carer += 1
  }

  const fieldPct = {
    gender: pct(fieldCounts.gender),
    simd: pct(fieldCounts.simd),
    care_experienced: pct(fieldCounts.care_experienced),
    has_asn: pct(fieldCounts.has_asn),
    receives_free_school_meals: pct(fieldCounts.receives_free_school_meals),
    eal: pct(fieldCounts.eal),
    is_young_carer: pct(fieldCounts.is_young_carer),
  }
  const overall = total === 0
    ? 0
    : Math.round(
        (fieldPct.gender + fieldPct.simd + fieldPct.care_experienced
          + fieldPct.has_asn + fieldPct.receives_free_school_meals
          + fieldPct.eal + fieldPct.is_young_carer) / 7,
      )

  return {
    overall_demographic_pct: overall,
    field_pct: fieldPct,
    total_students: total,
  }
}
