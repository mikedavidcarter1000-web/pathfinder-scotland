/**
 * Careers-tab data-fetching helpers for the LA portal dashboard.
 *
 * All queries:
 * - Filter by the caller's `authorityName` server-side; the `admin` client
 *   parameter is service-role and bypasses RLS, so the authority-scope
 *   predicate AND the QIO-scoped `school_id` IN-list are enforced explicitly.
 * - Apply statistical disclosure control consistently:
 *   - any cohort-derived count below the suppression threshold is reported
 *     as `null`; `safePercentage` masks both numerator and denominator so
 *     percentages cannot back-derive a suppressed count.
 *   - per-school rows are dropped (or masked) when the school cohort is
 *     below the threshold; the per-school table never exposes a count
 *     fewer than 5 students could resolve to.
 * - Read engagement rows from `platform_engagement_log` directly (NOT the
 *   weekly MV) because the careers tab needs *distinct* student counts
 *   across a multi-week window. The MV pre-groups by week so summing
 *   `unique_students` would double-count students who explored a sector in
 *   more than one week.
 * - Return `null` when an upstream feature/table has no data source yet
 *   (pathway_plans). Empty arrays mean "queried but nothing matched"; null
 *   means "feature not yet wired".
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_SUPPRESSION_THRESHOLD, suppressSmallCohorts } from './disclosure'
import type { AuthorityFilters, SimdQuintile } from './filters'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = SupabaseClient<any, any, any>

const ENGAGEMENT_WINDOW_DAYS = 90

/**
 * Returns a percentage rounded to one decimal place, but only when both the
 * numerator and the denominator pass disclosure control. Either side being
 * suppressed (< 5) or the denominator being zero yields `null`. Same rule
 * the equity and subjects tabs apply.
 */
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

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface CareerSectorExplorationRow {
  sector_id: string
  sector_name: string
  unique_students: number | null
  total_events: number | null
  percentage_of_cohort: number | null
  gender_breakdown: { male: number | null; female: number | null; other: number | null }
  simd_breakdown: Record<SimdQuintile, number | null>
}

export type ConcentrationFlag = 'broad' | 'moderate' | 'narrow'

export interface SectorConcentrationRow {
  school_id: string
  school_name: string
  student_count: number | null
  exploring_students: number | null
  sectors_explored: number | null
  avg_sectors_per_student: number | null
  concentration_flag: ConcentrationFlag | null
}

export type PathwayInterestKey = 'university' | 'college' | 'apprenticeship' | 'mixed' | 'no_exploration'

export interface PathwaySplitRow {
  key: PathwayInterestKey
  label: string
  unique_students: number | null
  percentage: number | null
}

export interface PathwaySplitData {
  total_students: number | null
  rows: PathwaySplitRow[]
  q1: { cohort_size: number | null; rows: PathwaySplitRow[] } | null
  q5: { cohort_size: number | null; rows: PathwaySplitRow[] } | null
}

export interface PathwayPlanMetrics {
  total_plans: number | null
  cohort_size: number | null
  percentage_with_plan: number | null
  per_school: Array<{
    school_id: string
    school_name: string
    plan_count: number | null
    student_count: number | null
    percentage: number | null
  }>
}

export interface SavedCoursesMetrics {
  /** Total saves; nullable so we can suppress when the saving-student count is below threshold (a single student firing many saves would otherwise leak). */
  total_saves: number | null
  unique_students_saving: number | null
  avg_saves_per_student: number | null
  per_school: Array<{
    school_id: string
    school_name: string
    saving_students: number | null
    avg_saves: number | null
  }>
  top_courses: Array<{
    course_id: string
    course_name: string
    university_name: string | null
    save_count: number | null
  }>
}

export interface PersonalStatementMetrics {
  started_count: number | null
  senior_phase_total: number | null
  started_percentage: number | null
  per_school: Array<{
    school_id: string
    school_name: string
    senior_phase_total: number | null
    started_count: number | null
    percentage: number | null
  }>
}

export interface DYWMetrics {
  total_employers: number
  total_placements: number | null
  unique_placement_students: number | null
  sectors_covered: Array<{ sector_id: string; sector_name: string; employer_count: number }>
  per_school: Array<{
    school_id: string
    school_name: string
    employer_count: number
    placement_count: number | null
    placement_students: number | null
  }>
}

export interface CollegeArticulationRow {
  detail_key: string
  display_label: string
  view_count: number | null
  unique_students: number | null
}

export interface CollegeArticulationMetrics {
  unique_students: number | null
  total_events: number | null
  top_routes: CollegeArticulationRow[]
}

export interface CareersTabData {
  sector_exploration: CareerSectorExplorationRow[]
  total_sectors_explored: number
  total_sectors_available: number
  concentration_analysis: SectorConcentrationRow[]
  pathway_split: PathwaySplitData
  pathway_plans: PathwayPlanMetrics | null
  saved_courses: SavedCoursesMetrics | null
  personal_statements: PersonalStatementMetrics | null
  dyw: DYWMetrics | null
  articulation: CollegeArticulationMetrics | null
  total_students_in_scope: number | null
  scope_school_count: number
  data_completeness_schools: number
}

// ---------------------------------------------------------------------------
// Top-level entry point
// ---------------------------------------------------------------------------

export async function getCareersTabData(
  admin: Admin,
  authorityName: string,
  filters: AuthorityFilters,
  scopedSchoolIds: string[],
  totalStudentsInScope: number | null,
): Promise<CareersTabData> {
  if (scopedSchoolIds.length === 0) {
    return emptyCareersTabData()
  }

  const [
    students,
    schools,
    sectors,
    engagementEvents,
    savedCoursesRows,
    personalStatements,
    employers,
    placements,
  ] = await Promise.all([
    fetchStudentsInScope(admin, scopedSchoolIds, filters),
    fetchSchools(admin, authorityName, scopedSchoolIds),
    fetchCareerSectors(admin),
    fetchEngagementEvents(admin, scopedSchoolIds),
    fetchSavedCourses(admin, scopedSchoolIds),
    fetchPersonalStatementDrafts(admin, scopedSchoolIds),
    fetchEmployerContacts(admin, scopedSchoolIds),
    fetchWorkPlacements(admin, scopedSchoolIds),
  ])

  const dataCompletenessSchools = new Set(
    engagementEvents
      .filter((e) => e.school_id)
      .map((e) => e.school_id as string),
  ).size

  const sectorExploration = buildSectorExploration(students, sectors, engagementEvents)
  const concentration = buildSectorConcentration(students, schools, engagementEvents)
  const pathwaySplit = buildPathwaySplit(students, engagementEvents, totalStudentsInScope)
  const savedCourses = buildSavedCoursesMetrics(students, schools, savedCoursesRows)
  const personalStatementsMetrics = buildPersonalStatementMetrics(
    students,
    schools,
    personalStatements,
    filters,
  )
  const dywMetrics = buildDYWMetrics(schools, sectors, employers, placements)
  const articulation = buildCollegeArticulation(students, engagementEvents)

  return {
    sector_exploration: sectorExploration,
    total_sectors_explored: sectorExploration.filter((s) => (s.unique_students ?? 0) > 0).length,
    total_sectors_available: sectors.length,
    concentration_analysis: concentration,
    pathway_split: pathwaySplit,
    pathway_plans: null, // pathway_plans table does not exist; spec says return null
    saved_courses: savedCourses,
    personal_statements: personalStatementsMetrics,
    dyw: dywMetrics,
    articulation,
    total_students_in_scope: totalStudentsInScope,
    scope_school_count: scopedSchoolIds.length,
    data_completeness_schools: dataCompletenessSchools,
  }
}

function emptyCareersTabData(): CareersTabData {
  return {
    sector_exploration: [],
    total_sectors_explored: 0,
    total_sectors_available: 0,
    concentration_analysis: [],
    pathway_split: {
      total_students: 0,
      rows: [],
      q1: null,
      q5: null,
    },
    pathway_plans: null,
    saved_courses: null,
    personal_statements: null,
    dyw: null,
    articulation: null,
    total_students_in_scope: 0,
    scope_school_count: 0,
    data_completeness_schools: 0,
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
  school_stage: string | null
  is_senior_phase: boolean
}

async function fetchStudentsInScope(
  admin: Admin,
  scopedSchoolIds: string[],
  filters: AuthorityFilters,
): Promise<StudentRow[]> {
  const { data, error } = await admin
    .from('students')
    .select('id, school_id, gender, simd_decile, school_stage')
    .in('school_id', scopedSchoolIds)
  if (error || !data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = (data as any[]).filter((r) => applyStudentFilters(r, filters))
  return filtered.map((r) => {
    const stage = (r.school_stage as string | null) ?? null
    const upper = stage ? stage.toUpperCase() : null
    return {
      id: r.id,
      school_id: r.school_id,
      gender: r.gender ?? null,
      simd_decile: r.simd_decile ?? null,
      simd_quintile: simdDecileToQuintile(r.simd_decile),
      school_stage: stage,
      is_senior_phase: upper === 'S5' || upper === 'S6',
    }
  })
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

interface CareerSectorRow {
  id: string
  name: string
}

async function fetchCareerSectors(admin: Admin): Promise<CareerSectorRow[]> {
  const { data } = await admin
    .from('career_sectors')
    .select('id, name')
    .order('name', { ascending: true })
  return (data as CareerSectorRow[] | null) ?? []
}

interface EngagementEventRow {
  student_id: string
  school_id: string | null
  event_type: string | null
  event_category: string | null
  event_detail: string | null
  created_at: string
}

async function fetchEngagementEvents(
  admin: Admin,
  scopedSchoolIds: string[],
): Promise<EngagementEventRow[]> {
  const cutoff = new Date(Date.now() - ENGAGEMENT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await admin
    .from('platform_engagement_log')
    .select('student_id, school_id, event_type, event_category, event_detail, created_at')
    .in('school_id', scopedSchoolIds)
    .gte('created_at', cutoff)
  if (error || !data) return []
  return data as EngagementEventRow[]
}

interface SavedCourseRow {
  student_id: string
  course_id: string
  course_name: string | null
  university_name: string | null
}

async function fetchSavedCourses(
  admin: Admin,
  scopedSchoolIds: string[],
): Promise<SavedCourseRow[]> {
  // Pull saved_courses joined to students (so we can scope by school_id) and
  // courses → universities (for the top-courses display). saved_courses is
  // keyed on student_id, so we filter via the related students.school_id.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('saved_courses')
    .select(
      'student_id, course_id, students!inner(school_id), courses(name, universities(name))',
    )
    .in('students.school_id', scopedSchoolIds)
  if (error || !data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    student_id: r.student_id,
    course_id: r.course_id,
    course_name: r.courses?.name ?? null,
    university_name: r.courses?.universities?.name ?? null,
  }))
}

interface PersonalStatementDraftRow {
  student_id: string
  school_id: string | null
  has_content: boolean
}

async function fetchPersonalStatementDrafts(
  admin: Admin,
  scopedSchoolIds: string[],
): Promise<PersonalStatementDraftRow[]> {
  const { data, error } = await admin
    .from('personal_statement_drafts')
    .select('student_id, school_id, q1_text, q2_text, q3_text')
    .in('school_id', scopedSchoolIds)
  if (error || !data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    student_id: r.student_id,
    school_id: r.school_id ?? null,
    has_content:
      (typeof r.q1_text === 'string' && r.q1_text.trim().length > 0)
      || (typeof r.q2_text === 'string' && r.q2_text.trim().length > 0)
      || (typeof r.q3_text === 'string' && r.q3_text.trim().length > 0),
  }))
}

interface EmployerRow {
  id: string
  school_id: string | null
  sector_id: string | null
  sector_name: string | null
}

async function fetchEmployerContacts(
  admin: Admin,
  scopedSchoolIds: string[],
): Promise<EmployerRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('employer_contacts')
    .select('id, school_id, sector_id, career_sectors(name)')
    .in('school_id', scopedSchoolIds)
  if (error || !data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    id: r.id,
    school_id: r.school_id ?? null,
    sector_id: r.sector_id ?? null,
    sector_name: r.career_sectors?.name ?? null,
  }))
}

interface PlacementRow {
  id: string
  school_id: string | null
  student_id: string | null
  is_group_event: boolean | null
  group_student_count: number | null
  status: string | null
}

async function fetchWorkPlacements(
  admin: Admin,
  scopedSchoolIds: string[],
): Promise<PlacementRow[]> {
  const { data, error } = await admin
    .from('work_placements')
    .select('id, school_id, student_id, is_group_event, group_student_count, status')
    .in('school_id', scopedSchoolIds)
  if (error || !data) return []
  return data as PlacementRow[]
}

// ---------------------------------------------------------------------------
// Filter helpers
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
// 1a. Career sector exploration
// ---------------------------------------------------------------------------

function buildSectorExploration(
  students: StudentRow[],
  sectors: CareerSectorRow[],
  events: EngagementEventRow[],
): CareerSectorExplorationRow[] {
  const studentById = new Map<string, StudentRow>()
  for (const s of students) studentById.set(s.id, s)

  // Map sector_id → set of student ids who explored it (in scope), plus
  // event count, gender count, simd count.
  type Bucket = {
    students: Set<string>
    events: number
    male: number
    female: number
    other: number
    simd: Record<SimdQuintile, Set<string>>
    /** Students with no SIMD decile (decile null or out of range). Tracked
     * separately so secondary suppression on the SIMD partition accounts for
     * the unknown bucket -- otherwise `unique_students - sum(Q1..Q5)` would
     * back-derive a 1-4 student missing-SIMD cell. */
    simdUnknown: Set<string>
  }
  const bySector = new Map<string, Bucket>()
  for (const sec of sectors) {
    bySector.set(sec.id, {
      students: new Set(),
      events: 0,
      male: 0,
      female: 0,
      other: 0,
      simd: { Q1: new Set(), Q2: new Set(), Q3: new Set(), Q4: new Set(), Q5: new Set() },
      simdUnknown: new Set(),
    })
  }

  for (const ev of events) {
    if (ev.event_category !== 'career_sector') continue
    if (!ev.event_detail) continue
    const bucket = bySector.get(ev.event_detail)
    if (!bucket) continue
    const student = studentById.get(ev.student_id)
    if (!student) continue
    const isNew = !bucket.students.has(student.id)
    bucket.students.add(student.id)
    bucket.events += 1
    if (isNew) {
      const g = normaliseGender(student.gender)
      if (g === 'Male') bucket.male += 1
      else if (g === 'Female') bucket.female += 1
      else bucket.other += 1
      if (student.simd_quintile) bucket.simd[student.simd_quintile].add(student.id)
      else bucket.simdUnknown.add(student.id)
    }
  }

  const cohort = students.length
  const out: CareerSectorExplorationRow[] = []
  for (const sec of sectors) {
    const b = bySector.get(sec.id)!
    const uniqueStudents = b.students.size
    // For percentage_of_cohort: numerator = uniqueStudents, denominator = total
    const pct = safePercentage(uniqueStudents, cohort)

    // Secondary suppression on partitioned breakdowns. Gender and SIMD are
    // disjoint partitions of the sector cohort: visible cells + suppressed
    // cells = total. If `unique_students` is disclosed and any single cell
    // is suppressed, `unique_students - sum(visible cells)` would back-derive
    // the suppressed cell. Mask the entire partition when ANY cell is below
    // the threshold (and also when only one cell is non-zero, since 0 cells
    // are not a privacy risk on their own but force the lone non-zero cell
    // to equal `unique_students`).
    const genderRaw = [b.male, b.female, b.other]
    const genderAnySuppressed = genderRaw.some(
      (v) => v > 0 && v < DEFAULT_SUPPRESSION_THRESHOLD,
    )
    const genderNonZero = genderRaw.filter((v) => v > 0).length
    // If only one gender bucket is populated, that cell equals the sector
    // total -- no information lost by suppressing it; the whole partition
    // collapses to the headline.
    const suppressGenderPartition = genderAnySuppressed || genderNonZero <= 1
    const male = suppressGenderPartition ? null : suppressSmallCohorts(b.male)
    const female = suppressGenderPartition ? null : suppressSmallCohorts(b.female)
    const otherCount = suppressGenderPartition ? null : suppressSmallCohorts(b.other)

    // SIMD breakdown -- same secondary-suppression rule as gender, but the
    // partition is six-way (Q1-Q5 plus unknown). The unknown bucket is not
    // emitted in the payload, so its count is invisible to the consumer; we
    // still factor it into suppression because `unique_students - sum(Q1..Q5)`
    // discloses it.
    const simdCounts: Record<SimdQuintile, number> = {
      Q1: b.simd.Q1.size,
      Q2: b.simd.Q2.size,
      Q3: b.simd.Q3.size,
      Q4: b.simd.Q4.size,
      Q5: b.simd.Q5.size,
    }
    const simdUnknownCount = b.simdUnknown.size
    const simdRaw = [simdCounts.Q1, simdCounts.Q2, simdCounts.Q3, simdCounts.Q4, simdCounts.Q5, simdUnknownCount]
    const simdAnySuppressed = simdRaw.some(
      (v) => v > 0 && v < DEFAULT_SUPPRESSION_THRESHOLD,
    )
    const simdNonZero = simdRaw.filter((v) => v > 0).length
    const suppressSimdPartition = simdAnySuppressed || simdNonZero <= 1
    const simd: Record<SimdQuintile, number | null> = suppressSimdPartition
      ? { Q1: null, Q2: null, Q3: null, Q4: null, Q5: null }
      : {
          Q1: suppressSmallCohorts(simdCounts.Q1),
          Q2: suppressSmallCohorts(simdCounts.Q2),
          Q3: suppressSmallCohorts(simdCounts.Q3),
          Q4: suppressSmallCohorts(simdCounts.Q4),
          Q5: suppressSmallCohorts(simdCounts.Q5),
        }

    out.push({
      sector_id: sec.id,
      sector_name: sec.name,
      unique_students: suppressSmallCohorts(uniqueStudents),
      total_events: uniqueStudents < DEFAULT_SUPPRESSION_THRESHOLD
        ? null
        : b.events, // when student count is suppressed, hide event count too (1 student firing 100 events would otherwise leak)
      percentage_of_cohort: pct,
      gender_breakdown: { male, female, other: otherCount },
      simd_breakdown: simd,
    })
  }

  // Sort by unique_students descending, with suppressed (null) trailing.
  out.sort((a, b) => {
    const av = a.unique_students ?? -1
    const bv = b.unique_students ?? -1
    return bv - av
  })
  return out
}

// ---------------------------------------------------------------------------
// 1b. Sector concentration analysis (per school)
// ---------------------------------------------------------------------------

function buildSectorConcentration(
  students: StudentRow[],
  schools: SchoolRow[],
  events: EngagementEventRow[],
): SectorConcentrationRow[] {
  const studentById = new Map<string, StudentRow>()
  for (const s of students) studentById.set(s.id, s)

  // Per school: distinct sectors explored across the school, distinct
  // sectors per student (set of sectors per student).
  const bySchool = new Map<string, {
    students: Set<string>
    sectorsExplored: Set<string>
    studentSectorMap: Map<string, Set<string>>
  }>()
  for (const sch of schools) {
    bySchool.set(sch.id, {
      students: new Set(),
      sectorsExplored: new Set(),
      studentSectorMap: new Map(),
    })
  }
  // Populate with all in-scope students (so cohort denom is correct)
  for (const s of students) {
    const b = bySchool.get(s.school_id)
    if (b) b.students.add(s.id)
  }

  for (const ev of events) {
    if (ev.event_category !== 'career_sector') continue
    if (!ev.event_detail || !ev.school_id) continue
    const student = studentById.get(ev.student_id)
    if (!student) continue
    const b = bySchool.get(ev.school_id)
    if (!b) continue
    b.sectorsExplored.add(ev.event_detail)
    const set = b.studentSectorMap.get(student.id) ?? new Set<string>()
    set.add(ev.event_detail)
    b.studentSectorMap.set(student.id, set)
  }

  const rows: SectorConcentrationRow[] = []
  for (const sch of schools) {
    const b = bySchool.get(sch.id)!
    const studentCount = b.students.size
    const exploringStudents = b.studentSectorMap.size
    // Suppress school cohort if below threshold -- everything else nulls out.
    if (studentCount < DEFAULT_SUPPRESSION_THRESHOLD) {
      rows.push({
        school_id: sch.id,
        school_name: sch.name,
        student_count: null,
        exploring_students: null,
        sectors_explored: null,
        avg_sectors_per_student: null,
        concentration_flag: null,
      })
      continue
    }
    let totalSectorsAcrossStudents = 0
    for (const set of b.studentSectorMap.values()) {
      totalSectorsAcrossStudents += set.size
    }

    // Complement suppression: `student_count - exploring_students` =
    // non-exploring students. If that complement falls between 1 and 4,
    // an observer can identify the not-yet-engaged students by subtraction
    // from the disclosed cohort. Suppress exploring/avg/flag when either
    // the exploring count OR its complement is below the threshold.
    const nonExploringCount = studentCount - exploringStudents
    const exploringSuppressed =
      exploringStudents < DEFAULT_SUPPRESSION_THRESHOLD
      || (nonExploringCount > 0 && nonExploringCount < DEFAULT_SUPPRESSION_THRESHOLD)

    const avg = exploringSuppressed
      ? null
      : Math.round((totalSectorsAcrossStudents / exploringStudents) * 10) / 10

    let flag: ConcentrationFlag | null = null
    if (avg != null) {
      flag = avg >= 4 ? 'broad' : avg >= 2 ? 'moderate' : 'narrow'
    }

    rows.push({
      school_id: sch.id,
      school_name: sch.name,
      student_count: suppressSmallCohorts(studentCount),
      exploring_students: exploringSuppressed ? null : suppressSmallCohorts(exploringStudents),
      // Distinct sectors is a category count (0-19), not a student count, so
      // it is not subject to disclosure control on its own. We still hide it
      // when exploring_students is suppressed because otherwise an observer
      // who sees `sectors_explored = 1` and a suppressed exploring count
      // could narrow the exploring cohort behaviour.
      sectors_explored: exploringSuppressed ? null : b.sectorsExplored.size,
      avg_sectors_per_student: avg,
      concentration_flag: flag,
    })
  }

  // Sort by avg desc with nulls trailing
  rows.sort((a, b) => {
    const av = a.avg_sectors_per_student ?? -1
    const bv = b.avg_sectors_per_student ?? -1
    return bv - av
  })
  return rows
}

// ---------------------------------------------------------------------------
// 1c. Pathway interest split (university / college / apprenticeship / mixed)
// ---------------------------------------------------------------------------

const APPRENTICESHIP_RE = /apprentice/i

type PathwayBuckets = {
  university: Set<string>
  college: Set<string>
  apprenticeship: Set<string>
}

function bucketStudentsByPathway(
  students: StudentRow[],
  events: EngagementEventRow[],
): PathwayBuckets {
  const studentIds = new Set(students.map((s) => s.id))
  const buckets: PathwayBuckets = {
    university: new Set(),
    college: new Set(),
    apprenticeship: new Set(),
  }
  for (const ev of events) {
    if (!studentIds.has(ev.student_id)) continue
    if (ev.event_category === 'university') {
      buckets.university.add(ev.student_id)
      continue
    }
    if (ev.event_category === 'college') {
      buckets.college.add(ev.student_id)
      continue
    }
    // Apprenticeship: detect via event_detail substring (no dedicated
    // event_category yet). Also matches FA/MA/GA tracking when an
    // event_detail contains "apprentice".
    if (ev.event_detail && APPRENTICESHIP_RE.test(ev.event_detail)) {
      buckets.apprenticeship.add(ev.student_id)
    }
  }
  return buckets
}

function buildPathwaySplitRows(cohort: StudentRow[], events: EngagementEventRow[]): PathwaySplitRow[] {
  // Bucket strictly within the cohort. Reusing a whole-population bucket
  // here would attribute non-cohort student behaviour to the cohort (e.g.
  // counting Q1 students towards the Q5 split).
  const buckets = bucketStudentsByPathway(cohort, events)
  const total = cohort.length
  const everExplored = new Set<string>()
  for (const id of buckets.university) everExplored.add(id)
  for (const id of buckets.college) everExplored.add(id)
  for (const id of buckets.apprenticeship) everExplored.add(id)

  // Mixed = students appearing in 2+ buckets
  const mixed = new Set<string>()
  for (const id of everExplored) {
    let c = 0
    if (buckets.university.has(id)) c += 1
    if (buckets.college.has(id)) c += 1
    if (buckets.apprenticeship.has(id)) c += 1
    if (c >= 2) mixed.add(id)
  }

  const noExploration = cohort.length - everExplored.size

  const rows: PathwaySplitRow[] = [
    {
      key: 'university',
      label: 'University',
      unique_students: suppressSmallCohorts(buckets.university.size),
      percentage: safePercentage(buckets.university.size, total),
    },
    {
      key: 'college',
      label: 'College',
      unique_students: suppressSmallCohorts(buckets.college.size),
      percentage: safePercentage(buckets.college.size, total),
    },
    {
      key: 'apprenticeship',
      label: 'Apprenticeship',
      unique_students: suppressSmallCohorts(buckets.apprenticeship.size),
      percentage: safePercentage(buckets.apprenticeship.size, total),
    },
    {
      key: 'mixed',
      label: 'Mixed (2+ pathways)',
      unique_students: suppressSmallCohorts(mixed.size),
      percentage: safePercentage(mixed.size, total),
    },
    {
      key: 'no_exploration',
      label: 'No exploration yet',
      unique_students: suppressSmallCohorts(noExploration),
      percentage: safePercentage(noExploration, total),
    },
  ]
  return rows
}

function buildPathwaySplit(
  students: StudentRow[],
  events: EngagementEventRow[],
  totalStudentsInScope: number | null,
): PathwaySplitData {
  const rows = buildPathwaySplitRows(students, events)

  const q1Cohort = students.filter((s) => s.simd_quintile === 'Q1')
  const q5Cohort = students.filter((s) => s.simd_quintile === 'Q5')

  // Q1 / Q5 split: only if the quintile cohort itself meets the threshold.
  // Buckets are recomputed inside `buildPathwaySplitRows` against the
  // cohort-restricted student list so percentages reflect the right
  // numerator and denominator.
  const q1 = q1Cohort.length < DEFAULT_SUPPRESSION_THRESHOLD
    ? null
    : { cohort_size: q1Cohort.length, rows: buildPathwaySplitRows(q1Cohort, events) }
  const q5 = q5Cohort.length < DEFAULT_SUPPRESSION_THRESHOLD
    ? null
    : { cohort_size: q5Cohort.length, rows: buildPathwaySplitRows(q5Cohort, events) }

  return {
    total_students: totalStudentsInScope,
    rows,
    q1,
    q5,
  }
}

// ---------------------------------------------------------------------------
// 1e. Saved courses metrics
// ---------------------------------------------------------------------------

function buildSavedCoursesMetrics(
  students: StudentRow[],
  schools: SchoolRow[],
  saved: SavedCourseRow[],
): SavedCoursesMetrics | null {
  if (saved.length === 0 && students.length === 0) return null

  // Filter saved rows to only those whose student is in scope (schools join
  // already enforces this, but protect against orphaned rows).
  const studentById = new Map<string, StudentRow>()
  for (const s of students) studentById.set(s.id, s)

  const inScope = saved.filter((r) => studentById.has(r.student_id))

  const totalSaves = inScope.length
  const savingStudents = new Set(inScope.map((r) => r.student_id)).size

  // Per school
  const perSchoolMap = new Map<string, { savesTotal: number; savingStudents: Set<string>; cohort: number }>()
  for (const sch of schools) {
    perSchoolMap.set(sch.id, { savesTotal: 0, savingStudents: new Set(), cohort: 0 })
  }
  for (const s of students) {
    const b = perSchoolMap.get(s.school_id)
    if (b) b.cohort += 1
  }
  for (const r of inScope) {
    const student = studentById.get(r.student_id)
    if (!student) continue
    const b = perSchoolMap.get(student.school_id)
    if (!b) continue
    b.savesTotal += 1
    b.savingStudents.add(r.student_id)
  }
  const perSchool: SavedCoursesMetrics['per_school'] = schools.map((sch) => {
    const b = perSchoolMap.get(sch.id)!
    const savingCount = b.savingStudents.size
    return {
      school_id: sch.id,
      school_name: sch.name,
      saving_students: suppressSmallCohorts(savingCount),
      avg_saves: savingCount < DEFAULT_SUPPRESSION_THRESHOLD
        ? null
        : Math.round((b.savesTotal / savingCount) * 10) / 10,
    }
  })

  // Top courses
  type TopCourseAcc = { course_name: string; university_name: string | null; saves: number; students: Set<string> }
  const courseAcc = new Map<string, TopCourseAcc>()
  for (const r of inScope) {
    if (!r.course_id || !r.course_name) continue
    const acc = courseAcc.get(r.course_id) ?? {
      course_name: r.course_name,
      university_name: r.university_name,
      saves: 0,
      students: new Set<string>(),
    }
    acc.saves += 1
    acc.students.add(r.student_id)
    courseAcc.set(r.course_id, acc)
  }
  const topCourses: SavedCoursesMetrics['top_courses'] = Array.from(courseAcc.entries())
    .map(([course_id, v]) => ({
      course_id,
      course_name: v.course_name,
      university_name: v.university_name,
      // Suppress if fewer than 5 distinct students saved this course (a count
      // of e.g. 3 saves all from the same student would back-derive their
      // identity given the school cohort).
      save_count: v.students.size < DEFAULT_SUPPRESSION_THRESHOLD ? null : v.saves,
    }))
    .filter((r) => r.save_count != null)
    .sort((a, b) => (b.save_count ?? 0) - (a.save_count ?? 0))
    .slice(0, 10)

  // `total_saves` is the headline aggregate; suppress it when the
  // distinct-student count is below the disclosure threshold. Without this
  // a single student firing 12 saves would surface as `total_saves: 12`
  // alongside a suppressed `unique_students_saving`, leaking that 1-4
  // students did all the saving.
  const totalSavesDisclosed = savingStudents < DEFAULT_SUPPRESSION_THRESHOLD ? null : totalSaves

  return {
    total_saves: totalSavesDisclosed,
    unique_students_saving: suppressSmallCohorts(savingStudents),
    avg_saves_per_student: safeAverage(totalSaves, savingStudents),
    per_school: perSchool,
    top_courses: topCourses,
  }
}

// ---------------------------------------------------------------------------
// 1f. Personal statement progress
// ---------------------------------------------------------------------------

function buildPersonalStatementMetrics(
  students: StudentRow[],
  schools: SchoolRow[],
  drafts: PersonalStatementDraftRow[],
  filters: AuthorityFilters,
): PersonalStatementMetrics | null {
  if (drafts.length === 0 && students.length === 0) return null

  // Personal statements are a senior-phase activity (S5/S6). We default to
  // that scope unless the filter explicitly includes only S1-S4. When the
  // user's year-group filter is set and excludes both S5 and S6 entirely,
  // the metric is not meaningful for that selection -- return per_school
  // empty rows but keep the section visible.
  const includesSenior = filters.yearGroups.length === 0
    || filters.yearGroups.includes('S5') || filters.yearGroups.includes('S6')

  // Restrict the cohort to senior-phase students in scope. If the filter
  // excludes S5 and S6 entirely, the cohort is empty.
  const seniorCohort = includesSenior ? students.filter((s) => s.is_senior_phase) : []
  const studentById = new Map<string, StudentRow>()
  for (const s of seniorCohort) studentById.set(s.id, s)

  const startedSet = new Set<string>()
  for (const d of drafts) {
    if (!d.has_content) continue
    if (!studentById.has(d.student_id)) continue
    startedSet.add(d.student_id)
  }

  const seniorTotal = seniorCohort.length
  const startedCount = startedSet.size

  // Per school
  const perSchoolMap = new Map<string, { senior: number; started: number }>()
  for (const sch of schools) perSchoolMap.set(sch.id, { senior: 0, started: 0 })
  for (const s of seniorCohort) {
    const b = perSchoolMap.get(s.school_id)
    if (b) b.senior += 1
  }
  for (const id of startedSet) {
    const s = studentById.get(id)
    if (!s) continue
    const b = perSchoolMap.get(s.school_id)
    if (b) b.started += 1
  }
  // Complement suppression for binary participation metrics. Started vs
  // not-started is a 2-way partition of the senior-phase cohort: visible
  // started count + visible "not started" complement = total. If either
  // side is between 1 and 4, the other can be back-derived. Suppress the
  // started count and percentage when either started OR (senior - started)
  // is below the threshold (and the cohort is itself disclosed).
  const binarySuppress = (started: number, total: number): boolean => {
    if (total < DEFAULT_SUPPRESSION_THRESHOLD) return true
    if (started > 0 && started < DEFAULT_SUPPRESSION_THRESHOLD) return true
    const notStarted = total - started
    if (notStarted > 0 && notStarted < DEFAULT_SUPPRESSION_THRESHOLD) return true
    return false
  }

  const perSchool: PersonalStatementMetrics['per_school'] = schools.map((sch) => {
    const b = perSchoolMap.get(sch.id)!
    const suppress = binarySuppress(b.started, b.senior)
    return {
      school_id: sch.id,
      school_name: sch.name,
      senior_phase_total: suppressSmallCohorts(b.senior),
      started_count: suppress ? null : suppressSmallCohorts(b.started),
      percentage: suppress ? null : safePercentage(b.started, b.senior),
    }
  })

  const overallSuppress = binarySuppress(startedCount, seniorTotal)

  return {
    started_count: overallSuppress ? null : suppressSmallCohorts(startedCount),
    senior_phase_total: suppressSmallCohorts(seniorTotal),
    started_percentage: overallSuppress ? null : safePercentage(startedCount, seniorTotal),
    per_school: perSchool,
  }
}

// ---------------------------------------------------------------------------
// 1g. DYW engagement
// ---------------------------------------------------------------------------

function buildDYWMetrics(
  schools: SchoolRow[],
  sectors: CareerSectorRow[],
  employers: EmployerRow[],
  placements: PlacementRow[],
): DYWMetrics | null {
  if (employers.length === 0 && placements.length === 0) return null

  // Sectors covered: count distinct employers per sector.
  const sectorMap = new Map<string, { name: string; employers: Set<string> }>()
  for (const sec of sectors) {
    sectorMap.set(sec.id, { name: sec.name, employers: new Set() })
  }
  for (const emp of employers) {
    if (!emp.sector_id) continue
    const b = sectorMap.get(emp.sector_id)
    if (!b) continue
    b.employers.add(emp.id)
  }
  const sectorsCovered: DYWMetrics['sectors_covered'] = Array.from(sectorMap.entries())
    .map(([sector_id, v]) => ({ sector_id, sector_name: v.name, employer_count: v.employers.size }))
    .filter((r) => r.employer_count > 0)
    .sort((a, b) => b.employer_count - a.employer_count)

  // Per school
  const perSchoolMap = new Map<string, { employers: Set<string>; placements: number; placementStudents: Set<string> }>()
  for (const sch of schools) {
    perSchoolMap.set(sch.id, { employers: new Set(), placements: 0, placementStudents: new Set() })
  }
  for (const e of employers) {
    if (!e.school_id) continue
    const b = perSchoolMap.get(e.school_id)
    if (b) b.employers.add(e.id)
  }
  for (const p of placements) {
    if (!p.school_id) continue
    const b = perSchoolMap.get(p.school_id)
    if (!b) continue
    if (p.is_group_event) {
      // A group event represents N students in one entry; count by
      // group_student_count for the placement total but cannot attribute
      // to specific student ids.
      b.placements += p.group_student_count ?? 1
    } else {
      b.placements += 1
      if (p.student_id) b.placementStudents.add(p.student_id)
    }
  }

  const totalEmployers = new Set(employers.map((e) => e.id)).size
  let totalPlacements = 0
  const allPlacementStudents = new Set<string>()
  for (const p of placements) {
    if (p.is_group_event) totalPlacements += p.group_student_count ?? 1
    else {
      totalPlacements += 1
      if (p.student_id) allPlacementStudents.add(p.student_id)
    }
  }

  const perSchool: DYWMetrics['per_school'] = schools.map((sch) => {
    const b = perSchoolMap.get(sch.id)!
    // Employer count is institutional metadata (not student-level), so
    // not suppressed. Placement counts include student-attributable rows
    // and so are suppressed below threshold to prevent re-identification
    // of the placement student.
    return {
      school_id: sch.id,
      school_name: sch.name,
      employer_count: b.employers.size,
      placement_count: suppressSmallCohorts(b.placements),
      placement_students: suppressSmallCohorts(b.placementStudents.size),
    }
  })

  // Authority-wide totals can leak when shown alongside per-school rows.
  // If even one school's `placement_count` was suppressed, the visible
  // schools' counts plus the authority total reveal the suppressed school's
  // count by subtraction. Apply the same secondary-suppression rule used in
  // the equity tab: when ANY per-school cell is suppressed, suppress the
  // total too. The unique_placement_students count obeys the same rule.
  const anyPlacementSchoolSuppressed = perSchool.some(
    (r) => r.placement_count == null && perSchoolMap.get(r.school_id)!.placements > 0,
  )
  const anyPlacementStudentsSuppressed = perSchool.some(
    (r) => r.placement_students == null && perSchoolMap.get(r.school_id)!.placementStudents.size > 0,
  )

  return {
    total_employers: totalEmployers,
    total_placements: anyPlacementSchoolSuppressed
      ? null
      : suppressSmallCohorts(totalPlacements),
    unique_placement_students: anyPlacementStudentsSuppressed
      ? null
      : suppressSmallCohorts(allPlacementStudents.size),
    sectors_covered: sectorsCovered,
    per_school: perSchool,
  }
}

// ---------------------------------------------------------------------------
// 1h. College articulation interest
// ---------------------------------------------------------------------------

function buildCollegeArticulation(
  students: StudentRow[],
  events: EngagementEventRow[],
): CollegeArticulationMetrics | null {
  const studentIds = new Set(students.map((s) => s.id))

  // We treat any event_category='college' event with an event_detail
  // containing "articulat" (covers "articulation", "articulating", etc.) as
  // articulation-route interest. This is a stop-gap until a dedicated
  // articulation event_category is introduced; document for the equity tab
  // session learnings (same pattern as WA tools).
  const ARTICULATION_RE = /articulat/i
  const collegeEvents = events.filter(
    (e) => e.event_category === 'college'
      && studentIds.has(e.student_id)
      && e.event_detail
      && ARTICULATION_RE.test(e.event_detail),
  )

  if (collegeEvents.length === 0) return null

  const uniqueStudents = new Set(collegeEvents.map((e) => e.student_id)).size
  // Per-detail aggregation (which articulation route)
  type RouteAcc = { count: number; students: Set<string> }
  const byDetail = new Map<string, RouteAcc>()
  for (const e of collegeEvents) {
    const d = (e.event_detail ?? '').slice(0, 200)
    const acc = byDetail.get(d) ?? { count: 0, students: new Set<string>() }
    acc.count += 1
    acc.students.add(e.student_id)
    byDetail.set(d, acc)
  }
  const topRoutes: CollegeArticulationRow[] = Array.from(byDetail.entries())
    .map(([detail_key, v]) => ({
      detail_key,
      display_label: detail_key,
      // Suppress unique-student counts and view counts when fewer than 5
      // distinct students viewed this route.
      unique_students: suppressSmallCohorts(v.students.size),
      view_count: v.students.size < DEFAULT_SUPPRESSION_THRESHOLD ? null : v.count,
    }))
    .filter((r) => r.unique_students != null)
    .sort((a, b) => (b.unique_students ?? 0) - (a.unique_students ?? 0))
    .slice(0, 10)

  return {
    unique_students: suppressSmallCohorts(uniqueStudents),
    total_events: uniqueStudents < DEFAULT_SUPPRESSION_THRESHOLD ? null : collegeEvents.length,
    top_routes: topRoutes,
  }
}
