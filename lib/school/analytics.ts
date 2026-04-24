// Schools-5 analytics library -- server-side computation of attainment,
// equity, CES capacity, attendance correlation, and value-added metrics.
// All functions accept a service-role `admin` client + schoolId.
//
// Every function handles the "no data" case gracefully: empty tables
// return zeroed structures, never throw. The UI decides what to render
// when total_students = 0 or students_with_grades = 0.

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js'
import { getNetworksCapacity } from './dyw'

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type AttainmentMeasures = {
  n5_5plus_ac_pct: number
  n5_5plus_ad_pct: number
  higher_3plus_ac_pct: number
  higher_5plus_ac_pct: number
  ah_1plus_pct: number
  total_students: number
  students_with_grades: number
}

export type SimdGapRow = {
  simd_quintile: number
  student_count: number
  avg_tariff_points: number
  n5_5plus_ac_pct: number
  higher_3plus_ac_pct: number
  positive_destination_pct: number | null
  saved_courses_avg: number
  widening_access_eligible_count: number
}

export type AttendanceCorrelation = {
  attendance_band: string
  student_count: number
  avg_working_grade_numeric: number
  on_track_pct: number
  intervention_count_avg: number
}

export type CesIndicator = {
  label: string
  value: number
  note?: string
}

export type CesCapacity = {
  score: number
  max: number
  indicators: CesIndicator[]
}

export type CesCapacities = {
  self: CesCapacity
  strengths: CesCapacity
  horizons: CesCapacity
  networks: CesCapacity
}

export type ValueAdded = {
  subject_name: string
  students_assessed: number
  avg_predicted_grade_numeric: number
  avg_actual_grade_numeric: number
  value_added: number
  students_above: number
  students_met: number
  students_below: number
}

export type GradeDistribution = {
  grade: string
  count: number
  pct: number
}

export type DepartmentSummary = {
  department: string
  student_count: number
  avg_working_grade_numeric: number
  pct_a_c: number
  pct_on_track: number
  completion_pct: number
}

export type KeyMeasureTrend = {
  cycle_name: string
  cycle_number: number
  n5_5plus_ac_pct: number
  higher_3plus_ac_pct: number
}

// ----------------------------------------------------------------------------
// Helpers -- grade to numeric, AC/AD test via sort_order
// ----------------------------------------------------------------------------

// Simple SQA grade → numeric mapping for averaging. A = 4, B = 3, C = 2,
// D = 1, No Award / other = 0. Matches the numeric axis used on the
// attendance correlation scatter and the department comparison table.
function gradeToNumeric(grade: string | null | undefined): number {
  if (!grade) return 0
  const g = grade.trim().toUpperCase()
  if (g === 'A' || g.startsWith('A ')) return 4
  if (g === 'B' || g.startsWith('B ')) return 3
  if (g === 'C' || g.startsWith('C ')) return 2
  if (g === 'D' || g.startsWith('D ')) return 1
  return 0
}

// SIMD decile → quintile (Q1 = most deprived = deciles 1-2).
export function decileToQuintile(decile: number | null | undefined): number | null {
  if (!decile || decile < 1 || decile > 10) return null
  return Math.ceil(decile / 2)
}

// Attendance % → band label.
export function attendanceBand(pct: number | null | undefined): string {
  if (pct == null) return 'Unknown'
  if (pct >= 95) return '95-100%'
  if (pct >= 90) return '90-95%'
  if (pct >= 85) return '85-90%'
  return '<85%'
}

// UCAS-style tariff contribution used for Q-level summaries. Uses
// grade_scales.ucas_points when available; falls back to a simple
// A=30, B=24, C=18, D=12 pattern if the scale row is missing.
function tariffForGrade(grade: string | null, gradeScaleMap: Map<string, { ucas_points: number | null }> | null): number {
  if (!grade) return 0
  const key = grade.trim().toUpperCase()
  if (gradeScaleMap) {
    const row = gradeScaleMap.get(key)
    if (row?.ucas_points != null) return row.ucas_points
  }
  // Fallback (senior-phase, rough).
  if (key === 'A') return 30
  if (key === 'B') return 24
  if (key === 'C') return 18
  if (key === 'D') return 12
  return 0
}

// ----------------------------------------------------------------------------
// Shared fetcher: most recent cycle
// ----------------------------------------------------------------------------

async function getActiveCycle(admin: SupabaseClient, schoolId: string): Promise<string | null> {
  const { data: locked } = await (admin as any)
    .from('tracking_cycles')
    .select('id, is_current, is_locked, cycle_number, academic_year')
    .eq('school_id', schoolId)
    .eq('is_locked', true)
    .order('academic_year', { ascending: false })
    .order('cycle_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (locked?.id) return locked.id
  const { data: current } = await (admin as any)
    .from('tracking_cycles')
    .select('id')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .maybeSingle()
  return current?.id ?? null
}

async function getPreviousCycle(admin: SupabaseClient, schoolId: string, currentId: string): Promise<string | null> {
  const { data: current } = await (admin as any)
    .from('tracking_cycles')
    .select('academic_year, cycle_number')
    .eq('id', currentId)
    .maybeSingle()
  if (!current) return null
  const { data: prev } = await (admin as any)
    .from('tracking_cycles')
    .select('id, academic_year, cycle_number')
    .eq('school_id', schoolId)
    .or(`academic_year.lt.${current.academic_year},and(academic_year.eq.${current.academic_year},cycle_number.lt.${current.cycle_number})`)
    .order('academic_year', { ascending: false })
    .order('cycle_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  return prev?.id ?? null
}

// ----------------------------------------------------------------------------
// 3a. Key attainment measures
// ----------------------------------------------------------------------------

export async function getAttainmentMeasures(
  admin: SupabaseClient,
  schoolId: string,
  academicYear?: string,
  yearGroup?: string,
): Promise<AttainmentMeasures> {
  const empty: AttainmentMeasures = {
    n5_5plus_ac_pct: 0,
    n5_5plus_ad_pct: 0,
    higher_3plus_ac_pct: 0,
    higher_5plus_ac_pct: 0,
    ah_1plus_pct: 0,
    total_students: 0,
    students_with_grades: 0,
  }

  const cycleId = await getActiveCycle(admin, schoolId)
  if (!cycleId) return empty

  // Entries for the cycle, joined to class_assignments to get qualification level.
  const { data: entries } = await (admin as any)
    .from('tracking_entries')
    .select('student_id, working_grade, actual_grade, class_assignment_id')
    .eq('cycle_id', cycleId)
    .eq('school_id', schoolId)
  if (!entries || entries.length === 0) return empty

  const caIds = Array.from(new Set(entries.map((e: any) => e.class_assignment_id).filter(Boolean)))
  if (caIds.length === 0) return empty

  const { data: classAssignments } = await (admin as any)
    .from('class_assignments')
    .select('id, qualification_type_id, year_group')
    .in('id', caIds)
  const caMap = new Map<string, any>((classAssignments ?? []).map((r: any) => [r.id, r]))

  const qtIds = Array.from(new Set((classAssignments ?? []).map((r: any) => r.qualification_type_id).filter(Boolean)))
  const { data: qualTypes } = qtIds.length
    ? await (admin as any).from('qualification_types').select('id, short_name, scqf_level').in('id', qtIds)
    : { data: [] }
  const qtMap = new Map<string, any>((qualTypes ?? []).map((r: any) => [r.id, r]))

  // Linked students for this school (for the denominator).
  const { data: links } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', schoolId)
  const totalStudents = (links ?? []).length

  // Grade scales: work out which grades count as A-C / A-D per qual type.
  const { data: scales } = qtIds.length
    ? await (admin as any)
        .from('grade_scales')
        .select('qualification_type_id, grade_label, sort_order, is_pass')
        .in('qualification_type_id', qtIds)
    : { data: [] }
  const acSet = new Set<string>()
  const adSet = new Set<string>()
  for (const s of scales ?? []) {
    const key = `${s.qualification_type_id}|${(s.grade_label ?? '').toUpperCase()}`
    if (s.is_pass && s.sort_order != null && s.sort_order <= 3) acSet.add(key)
    if (s.is_pass && s.sort_order != null && s.sort_order <= 4) adSet.add(key)
  }

  // Per-student counts.
  const studentN5AC = new Map<string, number>()
  const studentN5AD = new Map<string, number>()
  const studentHigherAC = new Map<string, number>()
  const studentAH = new Map<string, number>()
  const studentsWithAny = new Set<string>()

  for (const e of entries) {
    if (yearGroup) {
      const ca = caMap.get(e.class_assignment_id)
      if (!ca || ca.year_group !== yearGroup) continue
    }
    const ca = caMap.get(e.class_assignment_id)
    if (!ca) continue
    const qt = qtMap.get(ca.qualification_type_id)
    if (!qt) continue
    const grade = (e.actual_grade ?? e.working_grade ?? '').toString().trim().toUpperCase()
    if (!grade) continue
    studentsWithAny.add(e.student_id)
    const isAC = acSet.has(`${qt.id}|${grade}`)
    const isAD = adSet.has(`${qt.id}|${grade}`)
    const short = (qt.short_name ?? '').toLowerCase()
    if (short.includes('n5') || short === 'national 5') {
      if (isAC) studentN5AC.set(e.student_id, (studentN5AC.get(e.student_id) ?? 0) + 1)
      if (isAD) studentN5AD.set(e.student_id, (studentN5AD.get(e.student_id) ?? 0) + 1)
    } else if (short === 'higher' || (qt.scqf_level === 6 && short.includes('higher') && !short.includes('adv'))) {
      if (isAC) studentHigherAC.set(e.student_id, (studentHigherAC.get(e.student_id) ?? 0) + 1)
    } else if (short.includes('adv') || qt.scqf_level === 7) {
      studentAH.set(e.student_id, (studentAH.get(e.student_id) ?? 0) + 1)
    }
  }

  const denominator = Math.max(totalStudents, studentsWithAny.size, 1)
  const countAtLeast = (map: Map<string, number>, n: number) =>
    Array.from(map.values()).filter((v) => v >= n).length

  return {
    total_students: totalStudents,
    students_with_grades: studentsWithAny.size,
    n5_5plus_ac_pct: Math.round((countAtLeast(studentN5AC, 5) / denominator) * 1000) / 10,
    n5_5plus_ad_pct: Math.round((countAtLeast(studentN5AD, 5) / denominator) * 1000) / 10,
    higher_3plus_ac_pct: Math.round((countAtLeast(studentHigherAC, 3) / denominator) * 1000) / 10,
    higher_5plus_ac_pct: Math.round((countAtLeast(studentHigherAC, 5) / denominator) * 1000) / 10,
    ah_1plus_pct: Math.round((countAtLeast(studentAH, 1) / denominator) * 1000) / 10,
  }
}

// Measures for previous cycle -- used for trend arrows.
export async function getAttainmentTrend(admin: SupabaseClient, schoolId: string): Promise<{ current: AttainmentMeasures; previous: AttainmentMeasures | null }> {
  const current = await getAttainmentMeasures(admin, schoolId)
  const cycleId = await getActiveCycle(admin, schoolId)
  if (!cycleId) return { current, previous: null }
  const prevId = await getPreviousCycle(admin, schoolId, cycleId)
  if (!prevId) return { current, previous: null }
  // Recompute with previous cycle id. A minimal dup of getAttainmentMeasures
  // keyed to an explicit cycle id.
  const prev = await computeAttainmentForCycle(admin, schoolId, prevId)
  return { current, previous: prev }
}

async function computeAttainmentForCycle(admin: SupabaseClient, schoolId: string, cycleId: string): Promise<AttainmentMeasures> {
  const empty: AttainmentMeasures = {
    n5_5plus_ac_pct: 0, n5_5plus_ad_pct: 0, higher_3plus_ac_pct: 0, higher_5plus_ac_pct: 0,
    ah_1plus_pct: 0, total_students: 0, students_with_grades: 0,
  }
  const { data: entries } = await (admin as any)
    .from('tracking_entries')
    .select('student_id, working_grade, actual_grade, class_assignment_id')
    .eq('cycle_id', cycleId)
    .eq('school_id', schoolId)
  if (!entries || entries.length === 0) return empty

  const caIds = Array.from(new Set(entries.map((e: any) => e.class_assignment_id).filter(Boolean)))
  const { data: classAssignments } = await (admin as any)
    .from('class_assignments').select('id, qualification_type_id').in('id', caIds)
  const caMap = new Map<string, any>((classAssignments ?? []).map((r: any) => [r.id, r]))

  const qtIds = Array.from(new Set((classAssignments ?? []).map((r: any) => r.qualification_type_id).filter(Boolean)))
  const { data: qualTypes } = qtIds.length
    ? await (admin as any).from('qualification_types').select('id, short_name, scqf_level').in('id', qtIds)
    : { data: [] }
  const qtMap = new Map<string, any>((qualTypes ?? []).map((r: any) => [r.id, r]))

  const { data: links } = await (admin as any)
    .from('school_student_links').select('student_id').eq('school_id', schoolId)
  const totalStudents = (links ?? []).length

  const { data: scales } = qtIds.length
    ? await (admin as any).from('grade_scales').select('qualification_type_id, grade_label, sort_order, is_pass').in('qualification_type_id', qtIds)
    : { data: [] }
  const acSet = new Set<string>()
  const adSet = new Set<string>()
  for (const s of scales ?? []) {
    const key = `${s.qualification_type_id}|${(s.grade_label ?? '').toUpperCase()}`
    if (s.is_pass && s.sort_order != null && s.sort_order <= 3) acSet.add(key)
    if (s.is_pass && s.sort_order != null && s.sort_order <= 4) adSet.add(key)
  }

  const studentN5AC = new Map<string, number>()
  const studentN5AD = new Map<string, number>()
  const studentHigherAC = new Map<string, number>()
  const studentAH = new Map<string, number>()
  const studentsWithAny = new Set<string>()

  for (const e of entries) {
    const ca = caMap.get(e.class_assignment_id); if (!ca) continue
    const qt = qtMap.get(ca.qualification_type_id); if (!qt) continue
    const grade = (e.actual_grade ?? e.working_grade ?? '').toString().trim().toUpperCase()
    if (!grade) continue
    studentsWithAny.add(e.student_id)
    const isAC = acSet.has(`${qt.id}|${grade}`)
    const isAD = adSet.has(`${qt.id}|${grade}`)
    const short = (qt.short_name ?? '').toLowerCase()
    if (short.includes('n5') || short === 'national 5') {
      if (isAC) studentN5AC.set(e.student_id, (studentN5AC.get(e.student_id) ?? 0) + 1)
      if (isAD) studentN5AD.set(e.student_id, (studentN5AD.get(e.student_id) ?? 0) + 1)
    } else if (short === 'higher' || (qt.scqf_level === 6 && !short.includes('adv'))) {
      if (isAC) studentHigherAC.set(e.student_id, (studentHigherAC.get(e.student_id) ?? 0) + 1)
    } else if (short.includes('adv') || qt.scqf_level === 7) {
      studentAH.set(e.student_id, (studentAH.get(e.student_id) ?? 0) + 1)
    }
  }

  const denom = Math.max(totalStudents, studentsWithAny.size, 1)
  const countAtLeast = (m: Map<string, number>, n: number) => Array.from(m.values()).filter((v) => v >= n).length
  return {
    total_students: totalStudents,
    students_with_grades: studentsWithAny.size,
    n5_5plus_ac_pct: Math.round((countAtLeast(studentN5AC, 5) / denom) * 1000) / 10,
    n5_5plus_ad_pct: Math.round((countAtLeast(studentN5AD, 5) / denom) * 1000) / 10,
    higher_3plus_ac_pct: Math.round((countAtLeast(studentHigherAC, 3) / denom) * 1000) / 10,
    higher_5plus_ac_pct: Math.round((countAtLeast(studentHigherAC, 5) / denom) * 1000) / 10,
    ah_1plus_pct: Math.round((countAtLeast(studentAH, 1) / denom) * 1000) / 10,
  }
}

// ----------------------------------------------------------------------------
// 3b. SIMD gap analysis
// ----------------------------------------------------------------------------

export async function getSimdGap(admin: SupabaseClient, schoolId: string): Promise<SimdGapRow[]> {
  const cycleId = await getActiveCycle(admin, schoolId)
  const { data: links } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', schoolId)
  const studentIds = (links ?? []).map((l: any) => l.student_id)
  if (studentIds.length === 0) return emptySimdQuintiles()

  const { data: students } = await (admin as any)
    .from('students')
    .select('id, simd_decile')
    .in('id', studentIds)
  const quintileOf = new Map<string, number>()
  for (const s of students ?? []) {
    const q = decileToQuintile(s.simd_decile)
    if (q) quintileOf.set(s.id, q)
  }

  // Saved courses avg per student.
  const { data: savedCourses } = await (admin as any)
    .from('saved_courses')
    .select('student_id')
    .in('student_id', studentIds)
  const savedPerStudent = new Map<string, number>()
  for (const sc of savedCourses ?? []) {
    savedPerStudent.set(sc.student_id, (savedPerStudent.get(sc.student_id) ?? 0) + 1)
  }

  // Entries for the active cycle -- needed for N5/Higher attainment per quintile.
  let entries: any[] = []
  let caMap = new Map<string, any>()
  let qtMap = new Map<string, any>()
  const acSet = new Set<string>()
  const gradeScaleMap: Map<string, { ucas_points: number | null }> = new Map()
  if (cycleId) {
    const { data: ents } = await (admin as any)
      .from('tracking_entries')
      .select('student_id, working_grade, actual_grade, class_assignment_id')
      .eq('cycle_id', cycleId)
      .eq('school_id', schoolId)
    entries = ents ?? []
    const caIds = Array.from(new Set(entries.map((e) => e.class_assignment_id).filter(Boolean)))
    const { data: cas } = caIds.length
      ? await (admin as any).from('class_assignments').select('id, qualification_type_id').in('id', caIds)
      : { data: [] }
    caMap = new Map((cas ?? []).map((r: any) => [r.id, r]))
    const qtIds = Array.from(new Set((cas ?? []).map((r: any) => r.qualification_type_id).filter(Boolean)))
    const { data: qts } = qtIds.length
      ? await (admin as any).from('qualification_types').select('id, short_name, scqf_level').in('id', qtIds)
      : { data: [] }
    qtMap = new Map((qts ?? []).map((r: any) => [r.id, r]))
    const { data: scales } = qtIds.length
      ? await (admin as any).from('grade_scales').select('qualification_type_id, grade_label, sort_order, is_pass, ucas_points').in('qualification_type_id', qtIds)
      : { data: [] }
    for (const s of scales ?? []) {
      const key = `${s.qualification_type_id}|${(s.grade_label ?? '').toUpperCase()}`
      if (s.is_pass && s.sort_order != null && s.sort_order <= 3) acSet.add(key)
      gradeScaleMap.set((s.grade_label ?? '').toUpperCase(), { ucas_points: s.ucas_points ?? null })
    }
  }

  // Build per-quintile aggregation.
  type QAgg = {
    quintile: number
    studentIds: Set<string>
    tariffSum: number
    tariffCount: number
    n5AC: Map<string, number>
    higherAC: Map<string, number>
    savedSum: number
    waEligibleCount: number
  }
  const agg: Record<number, QAgg> = {}
  for (let q = 1; q <= 5; q++) agg[q] = { quintile: q, studentIds: new Set(), tariffSum: 0, tariffCount: 0, n5AC: new Map(), higherAC: new Map(), savedSum: 0, waEligibleCount: 0 }

  for (const sid of studentIds) {
    const q = quintileOf.get(sid)
    if (!q) continue
    agg[q].studentIds.add(sid)
    agg[q].savedSum += savedPerStudent.get(sid) ?? 0
    if (q <= 2) agg[q].waEligibleCount += 1
  }

  for (const e of entries) {
    const q = quintileOf.get(e.student_id)
    if (!q) continue
    const ca = caMap.get(e.class_assignment_id); if (!ca) continue
    const qt = qtMap.get(ca.qualification_type_id); if (!qt) continue
    const grade = (e.actual_grade ?? e.working_grade ?? '').toString().trim().toUpperCase()
    if (!grade) continue
    agg[q].tariffSum += tariffForGrade(grade, gradeScaleMap)
    agg[q].tariffCount += 1
    const isAC = acSet.has(`${qt.id}|${grade}`)
    const short = (qt.short_name ?? '').toLowerCase()
    if ((short.includes('n5') || short === 'national 5') && isAC) {
      agg[q].n5AC.set(e.student_id, (agg[q].n5AC.get(e.student_id) ?? 0) + 1)
    } else if ((short === 'higher' || (qt.scqf_level === 6 && !short.includes('adv'))) && isAC) {
      agg[q].higherAC.set(e.student_id, (agg[q].higherAC.get(e.student_id) ?? 0) + 1)
    }
  }

  return Object.values(agg).map((a) => {
    const count = a.studentIds.size
    const n5_5plus = Array.from(a.n5AC.values()).filter((v) => v >= 5).length
    const higher_3plus = Array.from(a.higherAC.values()).filter((v) => v >= 3).length
    return {
      simd_quintile: a.quintile,
      student_count: count,
      avg_tariff_points: a.tariffCount > 0 ? Math.round((a.tariffSum / a.tariffCount) * 10) / 10 : 0,
      n5_5plus_ac_pct: count > 0 ? Math.round((n5_5plus / count) * 1000) / 10 : 0,
      higher_3plus_ac_pct: count > 0 ? Math.round((higher_3plus / count) * 1000) / 10 : 0,
      positive_destination_pct: null, // alumni data not yet modelled
      saved_courses_avg: count > 0 ? Math.round((a.savedSum / count) * 10) / 10 : 0,
      widening_access_eligible_count: a.waEligibleCount,
    }
  })
}

function emptySimdQuintiles(): SimdGapRow[] {
  return [1, 2, 3, 4, 5].map((q) => ({
    simd_quintile: q,
    student_count: 0,
    avg_tariff_points: 0,
    n5_5plus_ac_pct: 0,
    higher_3plus_ac_pct: 0,
    positive_destination_pct: null,
    saved_courses_avg: 0,
    widening_access_eligible_count: 0,
  }))
}

// ----------------------------------------------------------------------------
// 3c. Attendance correlation
// ----------------------------------------------------------------------------

export async function getAttendanceCorrelation(admin: SupabaseClient, schoolId: string): Promise<AttendanceCorrelation[]> {
  const bands = ['95-100%', '90-95%', '85-90%', '<85%']
  const empty: AttendanceCorrelation[] = bands.map((b) => ({
    attendance_band: b, student_count: 0, avg_working_grade_numeric: 0, on_track_pct: 0, intervention_count_avg: 0,
  }))

  const { data: att } = await (admin as any)
    .from('attendance_records').select('student_id, attendance_pct, academic_year')
    .eq('school_id', schoolId)
  if (!att || att.length === 0) return empty

  // Pick the most recent academic year as the reporting base.
  const years = Array.from(new Set(att.map((r: any) => r.academic_year as string)))
  years.sort().reverse()
  const targetYear = years[0]
  const attByStudent = new Map<string, number>()
  for (const r of att.filter((x: any) => x.academic_year === targetYear)) {
    const pct = Number(r.attendance_pct)
    if (!Number.isNaN(pct)) attByStudent.set(r.student_id, pct)
  }

  const cycleId = await getActiveCycle(admin, schoolId)
  const { data: entries } = cycleId
    ? await (admin as any).from('tracking_entries').select('student_id, working_grade, on_track').eq('cycle_id', cycleId).eq('school_id', schoolId)
    : { data: [] }
  const avgGradeByStudent = new Map<string, number>()
  const onTrackByStudent = new Map<string, boolean>()
  const gradeSumByStudent = new Map<string, { sum: number; count: number }>()
  const trackCountByStudent = new Map<string, { on: number; total: number }>()
  for (const e of entries ?? []) {
    const num = gradeToNumeric(e.working_grade)
    if (num > 0) {
      const g = gradeSumByStudent.get(e.student_id) ?? { sum: 0, count: 0 }
      g.sum += num; g.count += 1
      gradeSumByStudent.set(e.student_id, g)
    }
    const t = trackCountByStudent.get(e.student_id) ?? { on: 0, total: 0 }
    t.total += 1
    if (e.on_track === 'on_track' || e.on_track === 'above_track' || e.on_track === 'above') t.on += 1
    trackCountByStudent.set(e.student_id, t)
  }
  for (const [sid, g] of gradeSumByStudent.entries()) {
    if (g.count > 0) avgGradeByStudent.set(sid, g.sum / g.count)
  }
  for (const [sid, t] of trackCountByStudent.entries()) {
    if (t.total > 0) onTrackByStudent.set(sid, t.on / t.total >= 0.5)
  }

  const { data: interventions } = await (admin as any)
    .from('interventions').select('student_id').eq('school_id', schoolId)
  const intByStudent = new Map<string, number>()
  for (const i of interventions ?? []) intByStudent.set(i.student_id, (intByStudent.get(i.student_id) ?? 0) + 1)

  const bandMap: Record<string, { grades: number[]; on: number; total: number; ints: number }> = {}
  for (const b of bands) bandMap[b] = { grades: [], on: 0, total: 0, ints: 0 }
  for (const [sid, pct] of attByStudent.entries()) {
    const b = attendanceBand(pct)
    if (!bandMap[b]) continue
    bandMap[b].total += 1
    const g = avgGradeByStudent.get(sid)
    if (g != null) bandMap[b].grades.push(g)
    if (onTrackByStudent.get(sid)) bandMap[b].on += 1
    bandMap[b].ints += intByStudent.get(sid) ?? 0
  }
  return bands.map((b) => {
    const m = bandMap[b]
    const avg = m.grades.length > 0 ? m.grades.reduce((a, x) => a + x, 0) / m.grades.length : 0
    return {
      attendance_band: b,
      student_count: m.total,
      avg_working_grade_numeric: Math.round(avg * 100) / 100,
      on_track_pct: m.total > 0 ? Math.round((m.on / m.total) * 1000) / 10 : 0,
      intervention_count_avg: m.total > 0 ? Math.round((m.ints / m.total) * 100) / 100 : 0,
    }
  })
}

// ----------------------------------------------------------------------------
// 3d. CES capacities
// ----------------------------------------------------------------------------

export async function getCesCapacities(admin: SupabaseClient, schoolId: string): Promise<CesCapacities> {
  const { data: links } = await (admin as any)
    .from('school_student_links').select('student_id').eq('school_id', schoolId)
  const studentIds = (links ?? []).map((l: any) => l.student_id)
  const total = studentIds.length

  const zero: CesCapacities = {
    self: { score: 0, max: 100, indicators: [] },
    strengths: { score: 0, max: 100, indicators: [] },
    horizons: { score: 0, max: 100, indicators: [] },
    networks: { score: 0, max: 100, indicators: [{ label: 'Employer placements', value: 0, note: 'Connect DYW data to populate this capacity' }] },
  }
  if (total === 0) return zero

  // Self: quiz_results + wellbeing_responses
  const { data: quizzes } = await (admin as any).from('quiz_results').select('student_id').in('student_id', studentIds)
  const quizStudents = new Set<string>((quizzes ?? []).map((q: any) => q.student_id))
  const { data: wbResp } = await (admin as any)
    .from('wellbeing_responses').select('student_id, survey_id').not('student_id', 'is', null)
  const wbStudents = new Set<string>((wbResp ?? []).filter((r: any) => studentIds.includes(r.student_id)).map((r: any) => r.student_id))
  const selfUnion = new Set<string>([...quizStudents, ...wbStudents])
  const selfScore = total > 0 ? Math.round((selfUnion.size / total) * 100) : 0

  // Strengths: student_grades + student_subject_choices
  const { data: grades } = await (admin as any).from('student_grades').select('student_id').in('student_id', studentIds)
  const gradesStudents = new Set<string>((grades ?? []).map((g: any) => g.student_id))
  const { data: choices } = await (admin as any).from('student_subject_choices').select('student_id').in('student_id', studentIds)
  const choicesStudents = new Set<string>((choices ?? []).map((c: any) => c.student_id))
  const strengthsUnion = new Set<string>([...gradesStudents, ...choicesStudents])
  const strengthsScore = total > 0 ? Math.round((strengthsUnion.size / total) * 100) : 0

  // Horizons: saved_courses + saved_comparisons (careers explored)
  const { data: saved } = await (admin as any).from('saved_courses').select('student_id').in('student_id', studentIds)
  const savedStudents = new Set<string>((saved ?? []).map((s: any) => s.student_id))
  // saved_comparisons gives us career-sector exploration depth.
  const { data: comparisons } = await (admin as any).from('saved_comparisons').select('user_id').in('user_id', studentIds)
  const compStudents = new Set<string>((comparisons ?? []).map((c: any) => c.user_id))
  const horizonsUnion = new Set<string>([...savedStudents, ...compStudents])
  const horizonsScore = total > 0 ? Math.round((horizonsUnion.size / total) * 100) : 0

  return {
    self: {
      score: selfScore,
      max: 100,
      indicators: [
        { label: 'Students who completed the career quiz', value: quizStudents.size },
        { label: 'Students who completed a wellbeing survey', value: wbStudents.size },
        { label: 'Students with any self-reflection activity', value: selfUnion.size },
      ],
    },
    strengths: {
      score: strengthsScore,
      max: 100,
      indicators: [
        { label: 'Students tracking their grades', value: gradesStudents.size },
        { label: 'Students with subject choices recorded', value: choicesStudents.size },
      ],
    },
    horizons: {
      score: horizonsScore,
      max: 100,
      indicators: [
        { label: 'Students who saved at least one course', value: savedStudents.size },
        { label: 'Students who compared careers', value: compStudents.size },
      ],
    },
    networks: await buildNetworksCapacity(admin, schoolId),
  }
}

async function buildNetworksCapacity(admin: SupabaseClient, schoolId: string): Promise<CesCapacity> {
  const net = await getNetworksCapacity(admin, schoolId)
  const ov = net.overview
  return {
    score: net.score,
    max: 100,
    indicators: [
      { label: 'Active employer partners', value: ov.active_partners, note: `${ov.total_contacts} total contacts` },
      { label: 'Placements completed this year', value: ov.placements_completed_this_year },
      { label: 'Distinct students placed', value: ov.distinct_students_placed, note: `${ov.student_reach_pct}% of linked cohort` },
      { label: 'Sectors with active partners', value: ov.sectors_covered, note: `of ${ov.sectors_total} sectors` },
    ],
  }
}

// ----------------------------------------------------------------------------
// 3e. Value-added -- predicted vs actual by subject
// ----------------------------------------------------------------------------

export async function getValueAdded(admin: SupabaseClient, schoolId: string): Promise<ValueAdded[]> {
  const cycleId = await getActiveCycle(admin, schoolId)
  if (!cycleId) return []

  const { data: entries } = await (admin as any)
    .from('tracking_entries')
    .select('student_id, working_grade, actual_grade, class_assignment_id')
    .eq('cycle_id', cycleId)
    .eq('school_id', schoolId)
    .not('actual_grade', 'is', null)
  if (!entries || entries.length === 0) return []

  const caIds = Array.from(new Set(entries.map((e: any) => e.class_assignment_id).filter(Boolean)))
  const { data: classAssignments } = await (admin as any)
    .from('class_assignments').select('id, subject_id').in('id', caIds)
  const caToSubject = new Map<string, string>()
  for (const r of classAssignments ?? []) caToSubject.set(r.id, r.subject_id)

  const subjectIds = Array.from(new Set(Array.from(caToSubject.values()).filter(Boolean)))
  const { data: subjects } = subjectIds.length
    ? await (admin as any).from('subjects').select('id, name').in('id', subjectIds)
    : { data: [] }
  const subjectNameById = new Map<string, string>((subjects ?? []).map((s: any) => [s.id, s.name]))

  const bySubject = new Map<string, { preds: number[]; actuals: number[]; above: number; met: number; below: number }>()
  for (const e of entries) {
    const sid = caToSubject.get(e.class_assignment_id)
    if (!sid) continue
    const pred = gradeToNumeric(e.working_grade)
    const actual = gradeToNumeric(e.actual_grade)
    if (pred === 0 && actual === 0) continue
    const agg = bySubject.get(sid) ?? { preds: [], actuals: [], above: 0, met: 0, below: 0 }
    agg.preds.push(pred); agg.actuals.push(actual)
    if (actual > pred) agg.above += 1
    else if (actual === pred) agg.met += 1
    else agg.below += 1
    bySubject.set(sid, agg)
  }

  const out: ValueAdded[] = []
  for (const [sid, a] of bySubject.entries()) {
    const avgPred = a.preds.reduce((x, y) => x + y, 0) / Math.max(a.preds.length, 1)
    const avgActual = a.actuals.reduce((x, y) => x + y, 0) / Math.max(a.actuals.length, 1)
    out.push({
      subject_name: subjectNameById.get(sid) ?? 'Unknown subject',
      students_assessed: a.preds.length,
      avg_predicted_grade_numeric: Math.round(avgPred * 100) / 100,
      avg_actual_grade_numeric: Math.round(avgActual * 100) / 100,
      value_added: Math.round((avgActual - avgPred) * 100) / 100,
      students_above: a.above,
      students_met: a.met,
      students_below: a.below,
    })
  }
  out.sort((x, y) => x.value_added - y.value_added)
  return out
}

// ----------------------------------------------------------------------------
// Support: grade distribution, department summaries, cycle trend
// ----------------------------------------------------------------------------

export async function getGradeDistribution(admin: SupabaseClient, schoolId: string, opts?: { yearGroup?: string; qualificationShort?: string }): Promise<GradeDistribution[]> {
  const cycleId = await getActiveCycle(admin, schoolId)
  if (!cycleId) return []
  const { data: entries } = await (admin as any)
    .from('tracking_entries')
    .select('working_grade, actual_grade, class_assignment_id')
    .eq('cycle_id', cycleId)
    .eq('school_id', schoolId)
  if (!entries || entries.length === 0) return []
  const caIds = Array.from(new Set(entries.map((e: any) => e.class_assignment_id).filter(Boolean)))
  const { data: cas } = caIds.length
    ? await (admin as any).from('class_assignments').select('id, year_group, qualification_type_id').in('id', caIds)
    : { data: [] }
  const caMap = new Map<string, any>((cas ?? []).map((r: any) => [r.id, r]))
  const qtIds = Array.from(new Set((cas ?? []).map((r: any) => r.qualification_type_id).filter(Boolean)))
  const { data: qts } = qtIds.length
    ? await (admin as any).from('qualification_types').select('id, short_name').in('id', qtIds)
    : { data: [] }
  const qtMap = new Map<string, any>((qts ?? []).map((r: any) => [r.id, r]))

  const counts = new Map<string, number>()
  let total = 0
  for (const e of entries) {
    const ca = caMap.get(e.class_assignment_id); if (!ca) continue
    if (opts?.yearGroup && ca.year_group !== opts.yearGroup) continue
    if (opts?.qualificationShort) {
      const qt = qtMap.get(ca.qualification_type_id)
      if (!qt) continue
      if (!(qt.short_name ?? '').toLowerCase().includes(opts.qualificationShort.toLowerCase())) continue
    }
    const g = (e.actual_grade ?? e.working_grade ?? '').toString().trim().toUpperCase() || 'No grade'
    counts.set(g, (counts.get(g) ?? 0) + 1)
    total += 1
  }
  const out: GradeDistribution[] = Array.from(counts.entries()).map(([grade, count]) => ({
    grade,
    count,
    pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
  }))
  out.sort((a, b) => a.grade.localeCompare(b.grade))
  return out
}

export async function getDepartmentComparison(admin: SupabaseClient, schoolId: string): Promise<DepartmentSummary[]> {
  const cycleId = await getActiveCycle(admin, schoolId)
  if (!cycleId) return []

  const { data: staff } = await (admin as any)
    .from('school_staff').select('id, department').eq('school_id', schoolId).not('department', 'is', null)
  const staffDepartmentMap = new Map<string, string>((staff ?? []).map((s: any) => [s.id, s.department]))

  const { data: cas } = await (admin as any)
    .from('class_assignments').select('id, staff_id').eq('school_id', schoolId)
  const caDeptMap = new Map<string, string>()
  for (const ca of cas ?? []) {
    const dept = staffDepartmentMap.get(ca.staff_id)
    if (dept) caDeptMap.set(ca.id, dept)
  }

  const { data: entries } = await (admin as any)
    .from('tracking_entries')
    .select('student_id, working_grade, on_track, class_assignment_id')
    .eq('cycle_id', cycleId)
    .eq('school_id', schoolId)

  const bucket = new Map<string, { grades: number[]; on: number; total: number; ac: number; withGrade: number; students: Set<string> }>()
  for (const e of entries ?? []) {
    const dept = caDeptMap.get(e.class_assignment_id)
    if (!dept) continue
    const agg = bucket.get(dept) ?? { grades: [], on: 0, total: 0, ac: 0, withGrade: 0, students: new Set() }
    agg.total += 1
    agg.students.add(e.student_id)
    if (e.working_grade || e.actual_grade) agg.withGrade += 1
    const num = gradeToNumeric(e.working_grade)
    if (num > 0) agg.grades.push(num)
    if (num >= 2) agg.ac += 1
    if (e.on_track === 'on_track' || e.on_track === 'above_track' || e.on_track === 'above') agg.on += 1
    bucket.set(dept, agg)
  }
  const out: DepartmentSummary[] = []
  for (const [dept, a] of bucket.entries()) {
    const avg = a.grades.length > 0 ? a.grades.reduce((x, y) => x + y, 0) / a.grades.length : 0
    out.push({
      department: dept,
      student_count: a.students.size,
      avg_working_grade_numeric: Math.round(avg * 100) / 100,
      pct_a_c: a.total > 0 ? Math.round((a.ac / a.total) * 1000) / 10 : 0,
      pct_on_track: a.total > 0 ? Math.round((a.on / a.total) * 1000) / 10 : 0,
      completion_pct: a.total > 0 ? Math.round((a.withGrade / a.total) * 1000) / 10 : 0,
    })
  }
  out.sort((a, b) => a.department.localeCompare(b.department))
  return out
}

export async function getKeyMeasureTrend(admin: SupabaseClient, schoolId: string): Promise<KeyMeasureTrend[]> {
  const { data: cycles } = await (admin as any)
    .from('tracking_cycles')
    .select('id, name, cycle_number, academic_year')
    .eq('school_id', schoolId)
    .order('academic_year', { ascending: true })
    .order('cycle_number', { ascending: true })
  if (!cycles || cycles.length === 0) return []
  const out: KeyMeasureTrend[] = []
  for (const c of cycles) {
    const m = await computeAttainmentForCycle(admin, schoolId, c.id)
    out.push({
      cycle_name: c.name,
      cycle_number: c.cycle_number,
      n5_5plus_ac_pct: m.n5_5plus_ac_pct,
      higher_3plus_ac_pct: m.higher_3plus_ac_pct,
    })
  }
  return out
}

// ----------------------------------------------------------------------------
// Sensitive-flag equity breakdowns (only for can_view_sensitive_flags)
// ----------------------------------------------------------------------------

export type EquityGroupBreakdown = {
  group: string
  student_count: number
  avg_working_grade_numeric: number
  pct_on_track: number
}

export async function getEquityGroupBreakdowns(admin: SupabaseClient, schoolId: string): Promise<EquityGroupBreakdown[]> {
  const { data: links } = await (admin as any)
    .from('school_student_links').select('student_id').eq('school_id', schoolId)
  const studentIds = (links ?? []).map((l: any) => l.student_id)
  if (studentIds.length === 0) return []

  const { data: students } = await (admin as any)
    .from('students')
    .select('id, care_experienced, is_young_carer, receives_free_school_meals, eal, has_asn')
    .in('id', studentIds)

  const groups: Record<string, string[]> = {
    'Care-experienced': [],
    'Free school meals': [],
    'Young carers': [],
    'EAL (English as an additional language)': [],
    'ASN (additional support needs)': [],
  }
  for (const s of students ?? []) {
    if (s.care_experienced) groups['Care-experienced'].push(s.id)
    if (s.receives_free_school_meals) groups['Free school meals'].push(s.id)
    if (s.is_young_carer) groups['Young carers'].push(s.id)
    if (s.eal) groups['EAL (English as an additional language)'].push(s.id)
    if (s.has_asn) groups['ASN (additional support needs)'].push(s.id)
  }

  const cycleId = await getActiveCycle(admin, schoolId)
  const { data: entries } = cycleId
    ? await (admin as any).from('tracking_entries').select('student_id, working_grade, on_track').eq('cycle_id', cycleId).eq('school_id', schoolId)
    : { data: [] }
  const gradesByStudent = new Map<string, number[]>()
  const onByStudent = new Map<string, { on: number; total: number }>()
  for (const e of entries ?? []) {
    const num = gradeToNumeric(e.working_grade)
    if (num > 0) {
      const arr = gradesByStudent.get(e.student_id) ?? []
      arr.push(num)
      gradesByStudent.set(e.student_id, arr)
    }
    const t = onByStudent.get(e.student_id) ?? { on: 0, total: 0 }
    t.total += 1
    if (e.on_track === 'on_track' || e.on_track === 'above_track' || e.on_track === 'above') t.on += 1
    onByStudent.set(e.student_id, t)
  }

  const out: EquityGroupBreakdown[] = []
  for (const [label, ids] of Object.entries(groups)) {
    const gradeAverages: number[] = []
    let onTotal = 0
    let totalEntries = 0
    for (const sid of ids) {
      const gs = gradesByStudent.get(sid) ?? []
      if (gs.length > 0) gradeAverages.push(gs.reduce((x, y) => x + y, 0) / gs.length)
      const t = onByStudent.get(sid)
      if (t) { onTotal += t.on; totalEntries += t.total }
    }
    out.push({
      group: label,
      student_count: ids.length,
      avg_working_grade_numeric: gradeAverages.length > 0 ? Math.round((gradeAverages.reduce((x, y) => x + y, 0) / gradeAverages.length) * 100) / 100 : 0,
      pct_on_track: totalEntries > 0 ? Math.round((onTotal / totalEntries) * 1000) / 10 : 0,
    })
  }
  return out
}

// ----------------------------------------------------------------------------
// Alerts for overview dashboard
// ----------------------------------------------------------------------------

export type DashboardAlerts = {
  attendance_below_90: number
  interventions_overdue: number
  asn_reviews_due: number
  outstanding_choice_submissions: number
  unclaimed_bursaries: number
}

export async function getDashboardAlerts(admin: SupabaseClient, schoolId: string): Promise<DashboardAlerts> {
  const { data: links } = await (admin as any)
    .from('school_student_links').select('student_id').eq('school_id', schoolId)
  const studentIds = (links ?? []).map((l: any) => l.student_id)

  let attendanceBelow90 = 0
  if (studentIds.length > 0) {
    const { data: atts } = await (admin as any)
      .from('attendance_records')
      .select('student_id, is_below_90, academic_year')
      .eq('school_id', schoolId)
      .order('academic_year', { ascending: false })
    if (atts && atts.length > 0) {
      const targetYear = atts[0].academic_year
      const latestByStudent = new Map<string, boolean>()
      for (const a of atts) {
        if (a.academic_year !== targetYear) continue
        if (!latestByStudent.has(a.student_id)) latestByStudent.set(a.student_id, !!a.is_below_90)
      }
      attendanceBelow90 = Array.from(latestByStudent.values()).filter(Boolean).length
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const { count: overdueInt } = await (admin as any)
    .from('interventions')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .lte('follow_up_date', today)
    .is('completed_at', null)

  const { count: asnDue } = await (admin as any)
    .from('asn_provisions')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .lte('review_date', today)

  const { count: outstandingChoices } = await (admin as any)
    .from('choice_rounds')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('status', 'open')

  return {
    attendance_below_90: attendanceBelow90,
    interventions_overdue: overdueInt ?? 0,
    asn_reviews_due: asnDue ?? 0,
    outstanding_choice_submissions: outstandingChoices ?? 0,
    unclaimed_bursaries: 0, // cross-reference requires bursary-eligibility pass per-student, deferred to admin panel
  }
}
