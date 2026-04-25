/**
 * Subjects-tab data-fetching helpers for the LA portal dashboard.
 *
 * All queries:
 * - Read aggregated rows from `mv_authority_subject_choices`, never from
 *   individual student tables.
 * - Filter by the caller's `authorityName` server-side; the `admin` client
 *   parameter is service-role and bypasses RLS, so the authority-scope
 *   predicate AND the QIO-scoped `school_id` IN-list are enforced
 *   explicitly here.
 * - Apply statistical disclosure control: any per-cell or per-row count
 *   below the suppression threshold (default 5) is reported as `null` so
 *   downstream renderers can show "< 5".
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  DEFAULT_SUPPRESSION_THRESHOLD,
  suppressSmallCohorts,
} from './disclosure'
import type { AuthorityFilters } from './filters'

/**
 * Returns a percentage rounded to one decimal place, but only when both the
 * numerator and the denominator pass disclosure control. Either side being
 * suppressed (< 5) or the denominator being zero yields `null`. This is the
 * single rule we apply across every "% of cohort" / "% female" / etc. value
 * exposed to the LA portal so percentages cannot be used to back-derive a
 * suppressed count.
 */
function safePercentage(numerator: number, denominator: number | null): number | null {
  if (denominator == null) return null
  if (denominator < DEFAULT_SUPPRESSION_THRESHOLD) return null
  if (numerator < DEFAULT_SUPPRESSION_THRESHOLD) return null
  if (denominator <= 0) return null
  return Math.round((numerator / denominator) * 1000) / 10
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = SupabaseClient<any, any, any>

/**
 * Canonical STEM subject list. Source: confirmed against
 * `subjects.name` in production; matches the architecture spec
 * (section 3a) and SFC's STEM definition for school senior phase.
 *
 * Names must match `mv_authority_subject_choices.subject_name` exactly,
 * which in turn comes from `subjects.name`.
 */
export const STEM_SUBJECT_NAMES = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computing Science',
  'Engineering Science',
  'Design and Manufacture',
  'Graphic Communication',
] as const

const STEM_SET = new Set<string>(STEM_SUBJECT_NAMES)

const HEATMAP_TOP_N = 30

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface SubjectUptakeRow {
  subject_id: string
  subject_name: string
  subject_category: string | null
  student_count: number | null
  percentage: number | null
  gender_breakdown: { male: number | null; female: number | null; other: number | null }
  /** Percentage of subject cohort by gender; null when suppressed in either direction. */
  gender_percentages: { male: number | null; female: number | null; other: number | null }
  simd_breakdown: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', number | null>
  /** Percentage of subject cohort by SIMD quintile; null when suppressed. */
  simd_percentages: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', number | null>
  per_school: Array<{ school_id: string; school_name: string; student_count: number | null }>
}

export type GenderBalanceFlag = 'balanced' | 'imbalanced' | 'severely_imbalanced'

export interface StemGenderRow {
  subject_id: string
  subject_name: string
  male_count: number | null
  male_percentage: number | null
  female_count: number | null
  female_percentage: number | null
  other_count: number | null
  total_count: number | null
  gender_balance_flag: GenderBalanceFlag | null
}

export interface CurriculumBreadthRow {
  school_id: string
  school_name: string
  student_count: number | null
  subjects_offered: number
  avg_subjects_per_student: number | null
  subject_categories_covered: number
  curriculum_breadth_index: number | null
}

export interface HeatmapCell {
  school_id: string
  subject_id: string
  /** raw count, or null if suppressed (< 5) */
  student_count: number | null
}

export interface SubjectAvailabilityHeatmap {
  schools: Array<{ school_id: string; school_name: string }>
  subjects: Array<{ subject_id: string; subject_name: string }>
  cells: HeatmapCell[]
  /** number of subjects with any uptake LA-wide, before truncation to top N */
  total_subjects_in_la: number
}

export interface SubjectsTabData {
  uptake: SubjectUptakeRow[]
  total_students_in_scope: number | null
  stem_gender: StemGenderRow[]
  stem_balanced_count: number
  stem_total_count: number
  curriculum_breadth: CurriculumBreadthRow[]
  heatmap: SubjectAvailabilityHeatmap
  /** `null` until SQA progression import is wired up */
  progression: SubjectProgressionRow[] | null
  /** `null` until Foundation Apprenticeship choices are tagged in source */
  foundation_apprenticeships: FaUptakeRow[] | null
  /** Schools (in scope) with at least one row in the MV. Used for completeness display. */
  data_completeness_schools: number
  /** Total schools in scope, for completeness fraction. */
  scope_school_count: number
}

export interface SubjectProgressionRow {
  subject_name: string
  n5_count: number | null
  higher_count: number | null
  ah_count: number | null
  n5_to_higher_rate: number | null
  higher_to_ah_rate: number | null
}

export interface FaUptakeRow {
  fa_name: string
  student_count: number | null
  schools_offering: number
}

// ---------------------------------------------------------------------------
// Underlying MV row type
// ---------------------------------------------------------------------------

interface SubjectChoiceMvRow {
  local_authority: string
  school_id: string
  school_name: string | null
  academic_year: string | null
  year_group: string | null
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

// ---------------------------------------------------------------------------
// Top-level entry point: load everything for the subjects tab in one trip
// ---------------------------------------------------------------------------

export async function getSubjectsTabData(
  admin: Admin,
  authorityName: string,
  filters: AuthorityFilters,
  scopedSchoolIds: string[],
  totalStudentsInScope: number | null,
): Promise<SubjectsTabData> {
  if (scopedSchoolIds.length === 0) {
    return emptySubjectsTabData(scopedSchoolIds.length)
  }

  const rows = await fetchSubjectChoiceRows(admin, authorityName, scopedSchoolIds, filters)

  const dataCompletenessSchools = new Set(rows.map((r) => r.school_id)).size

  const uptake = buildSubjectUptake(rows, totalStudentsInScope)
  const stem = buildStemGenderAnalysis(rows)
  const breadth = await buildCurriculumBreadth(
    admin,
    authorityName,
    scopedSchoolIds,
    rows,
    filters,
  )
  const heatmap = buildAvailabilityHeatmap(rows)

  return {
    uptake,
    total_students_in_scope: totalStudentsInScope,
    stem_gender: stem.rows,
    stem_balanced_count: stem.balancedCount,
    stem_total_count: stem.totalCount,
    curriculum_breadth: breadth,
    heatmap,
    progression: null,
    foundation_apprenticeships: null,
    data_completeness_schools: dataCompletenessSchools,
    scope_school_count: scopedSchoolIds.length,
  }
}

function emptySubjectsTabData(scopeSize: number): SubjectsTabData {
  return {
    uptake: [],
    total_students_in_scope: 0,
    stem_gender: [],
    stem_balanced_count: 0,
    stem_total_count: 0,
    curriculum_breadth: [],
    heatmap: { schools: [], subjects: [], cells: [], total_subjects_in_la: 0 },
    progression: null,
    foundation_apprenticeships: null,
    data_completeness_schools: 0,
    scope_school_count: scopeSize,
  }
}

// ---------------------------------------------------------------------------
// MV fetch -- shared by every query in this file
// ---------------------------------------------------------------------------

async function fetchSubjectChoiceRows(
  admin: Admin,
  authorityName: string,
  scopedSchoolIds: string[],
  filters: AuthorityFilters,
): Promise<SubjectChoiceMvRow[]> {
  let query = admin
    .from('mv_authority_subject_choices')
    .select(
      'local_authority, school_id, school_name, academic_year, year_group, subject_id, subject_name, subject_category, gender, simd_quintile, is_care_experienced, has_asn, is_fsm_registered, is_eal, is_young_carer, is_home_educated, student_count',
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

// ---------------------------------------------------------------------------
// 1a. Subject uptake
// ---------------------------------------------------------------------------

interface SubjectAccumulator {
  subject_id: string
  subject_name: string
  subject_category: string | null
  total: number
  gender: { male: number; female: number; other: number }
  simd: Record<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5', number>
  perSchool: Map<string, { school_name: string; total: number }>
}

function buildSubjectUptake(
  rows: SubjectChoiceMvRow[],
  totalStudentsInScope: number | null,
): SubjectUptakeRow[] {
  const acc = new Map<string, SubjectAccumulator>()

  for (const r of rows) {
    if (!r.subject_id || !r.subject_name) continue
    const a = acc.get(r.subject_id) ?? {
      subject_id: r.subject_id,
      subject_name: r.subject_name,
      subject_category: r.subject_category,
      total: 0,
      gender: { male: 0, female: 0, other: 0 },
      simd: { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0 },
      perSchool: new Map(),
    }
    const n = Number(r.student_count) || 0
    a.total += n

    const g = normaliseGender(r.gender)
    a.gender[g] += n

    if (r.simd_quintile && (r.simd_quintile === 'Q1' || r.simd_quintile === 'Q2'
      || r.simd_quintile === 'Q3' || r.simd_quintile === 'Q4' || r.simd_quintile === 'Q5')) {
      a.simd[r.simd_quintile as 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'] += n
    }

    const ps = a.perSchool.get(r.school_id) ?? { school_name: r.school_name ?? '', total: 0 }
    ps.total += n
    if (!ps.school_name && r.school_name) ps.school_name = r.school_name
    a.perSchool.set(r.school_id, ps)

    acc.set(r.subject_id, a)
  }

  return Array.from(acc.values())
    .sort((a, b) => b.total - a.total)
    .map<SubjectUptakeRow>((a) => {
      const subjectTotal = suppressSmallCohorts(a.total)
      // % of cohort: only emit when both the subject cohort and the
      // overall scope are >= 5; otherwise the displayed % could be
      // back-solved into a suppressed count.
      const cohortDenominator = totalStudentsInScope ?? null
      return {
        subject_id: a.subject_id,
        subject_name: a.subject_name,
        subject_category: a.subject_category,
        student_count: subjectTotal,
        percentage: safePercentage(a.total, cohortDenominator),
        gender_breakdown: {
          male: suppressSmallCohorts(a.gender.male),
          female: suppressSmallCohorts(a.gender.female),
          other: suppressSmallCohorts(a.gender.other),
        },
        gender_percentages: {
          male: safePercentage(a.gender.male, a.total),
          female: safePercentage(a.gender.female, a.total),
          other: safePercentage(a.gender.other, a.total),
        },
        simd_breakdown: {
          Q1: suppressSmallCohorts(a.simd.Q1),
          Q2: suppressSmallCohorts(a.simd.Q2),
          Q3: suppressSmallCohorts(a.simd.Q3),
          Q4: suppressSmallCohorts(a.simd.Q4),
          Q5: suppressSmallCohorts(a.simd.Q5),
        },
        simd_percentages: {
          Q1: safePercentage(a.simd.Q1, a.total),
          Q2: safePercentage(a.simd.Q2, a.total),
          Q3: safePercentage(a.simd.Q3, a.total),
          Q4: safePercentage(a.simd.Q4, a.total),
          Q5: safePercentage(a.simd.Q5, a.total),
        },
        per_school: Array.from(a.perSchool.entries())
          .map(([school_id, v]) => ({
            school_id,
            school_name: v.school_name,
            student_count: suppressSmallCohorts(v.total),
          }))
          .sort((x, y) => (y.student_count ?? 0) - (x.student_count ?? 0)),
      }
    })
}

// ---------------------------------------------------------------------------
// 1b. STEM gender analysis
// ---------------------------------------------------------------------------

function buildStemGenderAnalysis(
  rows: SubjectChoiceMvRow[],
): { rows: StemGenderRow[]; balancedCount: number; totalCount: number } {
  const acc = new Map<string, {
    subject_id: string
    subject_name: string
    male: number
    female: number
    other: number
  }>()

  for (const r of rows) {
    if (!r.subject_id || !r.subject_name) continue
    if (!STEM_SET.has(r.subject_name)) continue
    const a = acc.get(r.subject_id) ?? {
      subject_id: r.subject_id,
      subject_name: r.subject_name,
      male: 0,
      female: 0,
      other: 0,
    }
    const n = Number(r.student_count) || 0
    const g = normaliseGender(r.gender)
    a[g] += n
    acc.set(r.subject_id, a)
  }

  // We always emit a row for every STEM subject in the canonical list (even
  // when uptake is zero) so the chart shows the full slate. The summary
  // counts (`stem_total_count`, `stem_balanced_count`), however, reflect
  // ONLY subjects with actual uptake -- otherwise an empty MV would render
  // a misleading "0 of 8 balanced" headline when the truth is "no data".
  for (const subjectName of STEM_SUBJECT_NAMES) {
    const found = Array.from(acc.values()).find((v) => v.subject_name === subjectName)
    if (found) continue
    acc.set(`__stem-empty__${subjectName}`, {
      subject_id: `__stem-empty__${subjectName}`,
      subject_name: subjectName,
      male: 0,
      female: 0,
      other: 0,
    })
  }

  const stemRows: StemGenderRow[] = []
  let balancedCount = 0
  let subjectsWithUptake = 0

  for (const a of acc.values()) {
    const total = a.male + a.female + a.other
    const malePct = safePercentage(a.male, total)
    const femalePct = safePercentage(a.female, total)
    const flag = total >= DEFAULT_SUPPRESSION_THRESHOLD
      && a.male >= DEFAULT_SUPPRESSION_THRESHOLD
      && a.female >= DEFAULT_SUPPRESSION_THRESHOLD
      ? classifyGenderBalanceFromCounts(a.male, a.female, total)
      : null

    if (total > 0) subjectsWithUptake += 1
    if (flag === 'balanced') balancedCount += 1

    stemRows.push({
      subject_id: a.subject_id,
      subject_name: a.subject_name,
      male_count: suppressSmallCohorts(a.male),
      male_percentage: malePct,
      female_count: suppressSmallCohorts(a.female),
      female_percentage: femalePct,
      other_count: suppressSmallCohorts(a.other),
      total_count: suppressSmallCohorts(total),
      gender_balance_flag: flag,
    })
  }

  // Stable sort: the canonical STEM ordering, with new subjects appended.
  stemRows.sort((a, b) => {
    const ai = (STEM_SUBJECT_NAMES as readonly string[]).indexOf(a.subject_name)
    const bi = (STEM_SUBJECT_NAMES as readonly string[]).indexOf(b.subject_name)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.subject_name.localeCompare(b.subject_name)
  })

  return { rows: stemRows, balancedCount, totalCount: subjectsWithUptake }
}

function classifyGenderBalanceFromCounts(
  male: number,
  female: number,
  total: number,
): GenderBalanceFlag {
  if (total <= 0) return 'imbalanced'
  const malePct = (male / total) * 100
  const femalePct = (female / total) * 100
  if (malePct < 15 || femalePct < 15) return 'severely_imbalanced'
  if (malePct < 30 || femalePct < 30) return 'imbalanced'
  return 'balanced'
}

// ---------------------------------------------------------------------------
// 1c. Curriculum breadth
// ---------------------------------------------------------------------------

async function buildCurriculumBreadth(
  admin: Admin,
  authorityName: string,
  scopedSchoolIds: string[],
  rows: SubjectChoiceMvRow[],
  filters: AuthorityFilters,
): Promise<CurriculumBreadthRow[]> {
  // Pull schools so even schools with zero MV rows appear in the breadth list.
  // This lets QIOs see "no subjects offered" rather than the school disappearing.
  const { data: schools } = await admin
    .from('schools')
    .select('id, name')
    .in('id', scopedSchoolIds)
    .eq('local_authority', authorityName)
    .eq('visible_to_authority', true)
    .order('name', { ascending: true })

  // Pull demographic columns so the same filters that constrain the MV
  // (gender, SIMD quintile, year group) also constrain the per-school
  // student denominator. Without this, avg-subjects-per-student would be
  // diluted by students outside the active filter scope.
  const { data: studentRows } = await admin
    .from('students')
    .select('school_id, gender, simd_decile, school_stage')
    .in('school_id', scopedSchoolIds)

  const studentsBySchool = new Map<string, number>()
  for (const r of (studentRows as Array<{ school_id: string }> | null) ?? []) {
    if (!applyStudentFiltersForBreadth(r as Record<string, unknown>, filters)) continue
    studentsBySchool.set(r.school_id, (studentsBySchool.get(r.school_id) ?? 0) + 1)
  }

  // Per-school: distinct subjects, total enrolments (sum of student_count
  // across all subject rows = number of subject-choices), distinct
  // categories, then derive averages.
  type AggPerSchool = {
    subjectIds: Set<string>
    categories: Set<string>
    totalEnrolments: number
  }
  const aggs = new Map<string, AggPerSchool>()
  for (const r of rows) {
    if (!r.subject_id) continue
    const a = aggs.get(r.school_id) ?? { subjectIds: new Set(), categories: new Set(), totalEnrolments: 0 }
    a.subjectIds.add(r.subject_id)
    if (r.subject_category) a.categories.add(r.subject_category)
    a.totalEnrolments += Number(r.student_count) || 0
    aggs.set(r.school_id, a)
  }

  // LA-wide max subjects offered, used to normalise the breadth index 0-10.
  const maxSubjectsOffered = Math.max(
    1,
    ...Array.from(aggs.values()).map((a) => a.subjectIds.size),
  )

  type SchoolRow = { id: string; name: string }
  const schoolList = (schools as SchoolRow[] | null) ?? []

  return schoolList.map<CurriculumBreadthRow>((s) => {
    const a = aggs.get(s.id)
    const subjectsOffered = a?.subjectIds.size ?? 0
    const categoriesCovered = a?.categories.size ?? 0
    const studentCount = studentsBySchool.get(s.id) ?? 0
    const suppressedCount = suppressSmallCohorts(studentCount)
    // Suppress per-student derivations whenever the underlying student
    // cohort is suppressed, so a small school's data does not become
    // re-identifying via the average.
    const avg = suppressedCount != null && a
      ? Math.round((a.totalEnrolments / studentCount) * 10) / 10
      : null
    const breadthIndex =
      subjectsOffered > 0
        ? Math.round(((subjectsOffered / maxSubjectsOffered) * 10) * 10) / 10
        : null

    return {
      school_id: s.id,
      school_name: s.name,
      student_count: suppressedCount,
      subjects_offered: subjectsOffered,
      avg_subjects_per_student: avg,
      subject_categories_covered: categoriesCovered,
      curriculum_breadth_index: breadthIndex,
    }
  })
}

// Mirror of `applyStudentFilters` from queries.ts -- duplicated locally so
// we can apply the same demographic narrowing to the breadth denominator
// without creating a circular import. Year group is normalised lowercase ->
// uppercase to match the canonical S1-S6 filter values.
function applyStudentFiltersForBreadth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: Record<string, any>,
  filters: AuthorityFilters,
): boolean {
  if (filters.genders.length > 0) {
    const raw = (row.gender as string | null)?.toLowerCase()
    let g: 'Male' | 'Female' | 'Other' = 'Other'
    if (raw === 'male' || raw === 'm') g = 'Male'
    else if (raw === 'female' || raw === 'f') g = 'Female'
    if (!filters.genders.includes(g)) return false
  }
  if (filters.simdQuintiles.length > 0) {
    const decile = row.simd_decile as number | null | undefined
    let q: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | null = null
    if (decile != null && decile >= 1 && decile <= 10) {
      if (decile <= 2) q = 'Q1'
      else if (decile <= 4) q = 'Q2'
      else if (decile <= 6) q = 'Q3'
      else if (decile <= 8) q = 'Q4'
      else q = 'Q5'
    }
    if (!q || !filters.simdQuintiles.includes(q)) return false
  }
  if (filters.yearGroups.length > 0) {
    const stage = (row.school_stage as string | null)?.toUpperCase() ?? null
    const yearGroup = stage && /^S[1-6]$/.test(stage) ? stage : null
    if (!yearGroup || !filters.yearGroups.includes(yearGroup as never)) return false
  }
  return true
}

// ---------------------------------------------------------------------------
// 1d. Subject availability heatmap
// ---------------------------------------------------------------------------

function buildAvailabilityHeatmap(
  rows: SubjectChoiceMvRow[],
): SubjectAvailabilityHeatmap {
  if (rows.length === 0) {
    return { schools: [], subjects: [], cells: [], total_subjects_in_la: 0 }
  }

  // Total per subject (all schools)
  const subjectTotals = new Map<string, { name: string; total: number }>()
  for (const r of rows) {
    if (!r.subject_id || !r.subject_name) continue
    const ex = subjectTotals.get(r.subject_id)
    if (ex) ex.total += Number(r.student_count) || 0
    else subjectTotals.set(r.subject_id, { name: r.subject_name, total: Number(r.student_count) || 0 })
  }

  const totalSubjectsInLa = subjectTotals.size
  const topSubjects = Array.from(subjectTotals.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, HEATMAP_TOP_N)
    .map(([subject_id, v]) => ({ subject_id, subject_name: v.name }))
  const topSubjectIds = new Set(topSubjects.map((s) => s.subject_id))

  // Schools (limited to those that have rows)
  const schoolMap = new Map<string, string>()
  for (const r of rows) {
    if (!schoolMap.has(r.school_id)) schoolMap.set(r.school_id, r.school_name ?? '')
  }
  const schools = Array.from(schoolMap.entries())
    .map(([school_id, school_name]) => ({ school_id, school_name }))
    .sort((a, b) => a.school_name.localeCompare(b.school_name))

  // Cell aggregates
  const cellTotals = new Map<string, number>() // key = `${school_id}|${subject_id}`
  for (const r of rows) {
    if (!topSubjectIds.has(r.subject_id)) continue
    const key = `${r.school_id}|${r.subject_id}`
    cellTotals.set(key, (cellTotals.get(key) ?? 0) + (Number(r.student_count) || 0))
  }

  const cells: HeatmapCell[] = []
  for (const s of schools) {
    for (const sub of topSubjects) {
      const total = cellTotals.get(`${s.school_id}|${sub.subject_id}`) ?? 0
      // Distinguish "not offered" (0) from "offered but suppressed" (< 5 but > 0)
      // by leaving the value null only for in-range-but-suppressed, and 0 for not offered.
      let value: number | null
      if (total === 0) value = 0
      else if (total < DEFAULT_SUPPRESSION_THRESHOLD) value = null
      else value = total
      cells.push({ school_id: s.school_id, subject_id: sub.subject_id, student_count: value })
    }
  }

  return { schools, subjects: topSubjects, cells, total_subjects_in_la: totalSubjectsInLa }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normaliseGender(g: string | null | undefined): 'male' | 'female' | 'other' {
  if (!g) return 'other'
  const lower = g.toLowerCase()
  if (lower === 'male' || lower === 'm') return 'male'
  if (lower === 'female' || lower === 'f') return 'female'
  return 'other'
}
