// Schools-8: import orchestrators -- one per import type.
//
// Each function runs against a service-role admin client, processes a
// parsed table row-by-row, and returns a summary with counts + structured
// errors / warnings. Side effects (UPDATE students, UPSERT attendance,
// CREATE sqa_results, etc.) happen inline, with best-effort continuation
// on per-row failures rather than all-or-nothing transactional semantics
// -- if row 47 of 200 is malformed we still want rows 1-46 and 48-200.

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  autoMatch,
  cfeLevel,
  currentAcademicYear,
  emptySummary,
  gradeToNumeric,
  nameMatches,
  normaliseBool,
  normalisePostcode,
  normaliseYearGroup,
  PUPIL_HINTS,
  ATTENDANCE_HINTS,
  CLASS_LIST_HINTS,
  SQA_HINTS,
  TRANSITION_HINTS,
  DESTINATION_HINTS,
  DEMOGRAPHICS_HINTS,
  type ColumnMap,
  type ImportSummary,
} from './import-parsing'

// ------------------------------------------------------------------
// Column-map helpers (auto-build from hints)
// ------------------------------------------------------------------

export function autoMapPupils(headers: string[]): ColumnMap {
  const out: ColumnMap = {}
  for (const [field, hints] of Object.entries(PUPIL_HINTS)) out[field] = autoMatch(headers, hints)
  return out
}
export function autoMapAttendance(headers: string[]): ColumnMap {
  const out: ColumnMap = {}
  for (const [field, hints] of Object.entries(ATTENDANCE_HINTS)) out[field] = autoMatch(headers, hints)
  return out
}
export function autoMapClassList(headers: string[]): ColumnMap {
  const out: ColumnMap = {}
  for (const [field, hints] of Object.entries(CLASS_LIST_HINTS)) out[field] = autoMatch(headers, hints)
  return out
}
export function autoMapSqa(headers: string[]): ColumnMap {
  const out: ColumnMap = {}
  for (const [field, hints] of Object.entries(SQA_HINTS)) out[field] = autoMatch(headers, hints)
  return out
}
export function autoMapTransition(headers: string[]): ColumnMap {
  const out: ColumnMap = {}
  for (const [field, hints] of Object.entries(TRANSITION_HINTS)) out[field] = autoMatch(headers, hints)
  return out
}
export function autoMapDestinations(headers: string[]): ColumnMap {
  const out: ColumnMap = {}
  for (const [field, hints] of Object.entries(DESTINATION_HINTS)) out[field] = autoMatch(headers, hints)
  return out
}
export function autoMapDemographics(headers: string[]): ColumnMap {
  const out: ColumnMap = {}
  for (const [field, hints] of Object.entries(DEMOGRAPHICS_HINTS)) out[field] = autoMatch(headers, hints)
  return out
}

function normaliseGender(v: string | undefined | null): string | null {
  if (!v) return null
  const s = String(v).trim()
  if (!s) return null
  const l = s.toLowerCase()
  if (['m', 'male', 'boy', 'man'].includes(l)) return 'male'
  if (['f', 'female', 'girl', 'woman'].includes(l)) return 'female'
  if (['nb', 'non-binary', 'nonbinary', 'non binary', 'x'].includes(l)) return 'non_binary'
  if (['not stated', 'not known', 'unknown', 'prefer not to say', 'prefer_not_to_say'].includes(l)) return 'prefer_not_to_say'
  return s
}

export function cellAt(row: Record<string, string>, map: ColumnMap, field: string): string {
  const col = map[field]
  if (!col) return ''
  return (row[col] ?? '').toString().trim()
}

// ------------------------------------------------------------------
// SCN lookup -- returns map scn -> existing student row
// ------------------------------------------------------------------

type StudentRow = {
  id: string
  first_name: string | null
  last_name: string | null
  scn: string | null
  school_id: string | null
  school_stage: string | null
}

async function loadStudentsByScn(admin: SupabaseClient, scns: string[]): Promise<Map<string, StudentRow>> {
  if (scns.length === 0) return new Map()
  const { data } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, scn, school_id, school_stage')
    .in('scn', scns)
  const map = new Map<string, StudentRow>()
  for (const s of (data ?? []) as StudentRow[]) if (s.scn) map.set(s.scn, s)
  return map
}

async function loadStudentsByName(
  admin: SupabaseClient,
  schoolId: string,
): Promise<StudentRow[]> {
  const { data: links } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', schoolId)
  const ids = (links ?? []).map((l: any) => l.student_id)
  if (ids.length === 0) return []
  const { data } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, scn, school_id, school_stage')
    .in('id', ids)
  return (data ?? []) as StudentRow[]
}

// ------------------------------------------------------------------
// 1. Pupil import
// ------------------------------------------------------------------

export type PupilImportInput = {
  headers: string[]
  rows: Record<string, string>[]
  map: ColumnMap
  schoolId: string
  staffId: string
  fileName: string
}

export async function runPupilImport(
  admin: SupabaseClient,
  input: PupilImportInput,
): Promise<ImportSummary & { importId: string | null; stubIds: string[] }> {
  const summary = emptySummary()
  summary.rowCount = input.rows.length
  const stubIds: string[] = []

  // Required: scn, forename, surname, year_group.
  const required = ['scn', 'forename', 'surname', 'year_group']
  for (const f of required) {
    if (!input.map[f]) {
      summary.errors.push({ row: 0, message: `Required field not mapped: ${f}`, field: f })
    }
  }
  if (summary.errors.length > 0) {
    summary.errorCount = summary.errors.length
    return { ...summary, importId: null, stubIds }
  }

  // Pre-collect SCNs for existing-lookup.
  const scns = input.rows
    .map((r) => cellAt(r, input.map, 'scn'))
    .filter((s) => s)
  const existing = await loadStudentsByScn(admin, scns)
  const fallbackNameList = await loadStudentsByName(admin, input.schoolId)

  // SCN duplicate check (within-file)
  const seen = new Set<string>()
  const dupes = new Set<string>()
  for (const s of scns) {
    if (seen.has(s)) dupes.add(s)
    seen.add(s)
  }

  for (let i = 0; i < input.rows.length; i++) {
    const rowNum = i + 2 // header + 1-index
    const row = input.rows[i]
    const scn = cellAt(row, input.map, 'scn')
    const forename = cellAt(row, input.map, 'forename')
    const surname = cellAt(row, input.map, 'surname')
    const yearGroupRaw = cellAt(row, input.map, 'year_group')
    const yearGroup = normaliseYearGroup(yearGroupRaw)

    if (!scn) { summary.errors.push({ row: rowNum, message: 'Missing SCN', field: 'scn' }); summary.errorCount++; summary.skipped++; continue }
    if (!forename || !surname) { summary.errors.push({ row: rowNum, message: 'Missing name', field: 'forename' }); summary.errorCount++; summary.skipped++; continue }
    if (!yearGroup) { summary.errors.push({ row: rowNum, message: `Invalid year group: ${yearGroupRaw}`, field: 'year_group' }); summary.errorCount++; summary.skipped++; continue }
    if (dupes.has(scn)) {
      summary.warnings.push({ row: rowNum, message: `Duplicate SCN in file: ${scn}` })
    }

    const regClass = cellAt(row, input.map, 'registration_class') || null
    const house = cellAt(row, input.map, 'house') || null
    const postcode = normalisePostcode(cellAt(row, input.map, 'postcode'))
    const asn = normaliseBool(cellAt(row, input.map, 'asn'))
    const fsm = normaliseBool(cellAt(row, input.map, 'fsm'))
    const eal = normaliseBool(cellAt(row, input.map, 'eal'))
    const lac = normaliseBool(cellAt(row, input.map, 'lac'))

    // Derive SIMD decile if postcode present
    let simdDecile: number | null = null
    if (postcode) {
      const { data: simd } = await (admin as any)
        .from('simd_postcodes')
        .select('simd_decile')
        .eq('postcode_normalised', postcode)
        .maybeSingle()
      if (simd?.simd_decile != null) simdDecile = simd.simd_decile
    }

    const updates: Record<string, any> = {
      scn,
      first_name: forename,
      last_name: surname,
      school_stage: yearGroup.toLowerCase(),
      registration_class: regClass,
      house_group: house,
      updated_at: new Date().toISOString(),
    }
    if (postcode) updates.postcode = postcode
    if (simdDecile != null) updates.simd_decile = simdDecile
    if (fsm != null) updates.receives_free_school_meals = fsm
    if (eal != null) updates.eal = eal
    if (asn != null) updates.has_asn = asn
    if (lac != null) updates.care_experienced = lac
    if (fsm != null || eal != null || asn != null || lac != null) {
      updates.demographic_source = 'seemis_import'
      updates.demographic_updated_at = new Date().toISOString()
    }

    const match = existing.get(scn)
    if (match) {
      if (match.school_id && match.school_id !== input.schoolId) {
        summary.warnings.push({ row: rowNum, message: `Student ${forename} ${surname} (${scn}) is linked to another school; skipping` })
        summary.skipped++
        continue
      }
      updates.school_id = input.schoolId
      const { error: updErr } = await (admin as any).from('students').update(updates).eq('id', match.id)
      if (updErr) {
        summary.errors.push({ row: rowNum, message: `Update failed: ${updErr.message}` })
        summary.errorCount++
        continue
      }
      // Ensure link row exists (idempotent)
      await (admin as any)
        .from('school_student_links')
        .upsert({ school_id: input.schoolId, student_id: match.id, linked_by: 'import' }, { onConflict: 'school_id,student_id' })
      summary.updated++
      summary.matched++
      continue
    }

    // Name fallback against existing linked students
    const nameHit = fallbackNameList.find((s) =>
      nameMatches({ firstName: s.first_name, lastName: s.last_name }, `${forename} ${surname}`),
    )
    if (nameHit && !nameHit.scn) {
      const { error: updErr } = await (admin as any)
        .from('students')
        .update({ ...updates, school_id: input.schoolId })
        .eq('id', nameHit.id)
      if (updErr) {
        summary.errors.push({ row: rowNum, message: `Update failed: ${updErr.message}` })
        summary.errorCount++
        continue
      }
      await (admin as any)
        .from('school_student_links')
        .upsert({ school_id: input.schoolId, student_id: nameHit.id, linked_by: 'import' }, { onConflict: 'school_id,student_id' })
      summary.updated++
      summary.matched++
      summary.warnings.push({ row: rowNum, message: `Matched by name (no SCN on account yet): ${forename} ${surname}` })
      continue
    }

    // Create stub student row (no auth user)
    const stubEmail = `stub+${scn.toLowerCase()}@import.pathfinderscot.co.uk`
    const { data: created, error: crErr } = await (admin as any)
      .from('students')
      .insert({
        id: (globalThis.crypto as any).randomUUID(),
        email: stubEmail,
        user_type: 'student',
        school_id: input.schoolId,
        ...updates,
      })
      .select('id')
      .single()
    if (crErr) {
      summary.errors.push({ row: rowNum, message: `Create stub failed: ${crErr.message}` })
      summary.errorCount++
      continue
    }
    stubIds.push(created.id)
    await (admin as any)
      .from('school_student_links')
      .upsert({ school_id: input.schoolId, student_id: created.id, linked_by: 'import' }, { onConflict: 'school_id,student_id' })
    summary.created++
  }

  // Audit row
  const { data: importRow } = await (admin as any)
    .from('seemis_imports')
    .insert({
      school_id: input.schoolId,
      import_type: 'pupil_data',
      imported_by: input.staffId,
      file_name: input.fileName,
      row_count: summary.rowCount,
      matched_count: summary.matched,
      created_count: summary.created,
      skipped_count: summary.skipped,
      error_count: summary.errorCount,
      errors: summary.errors,
      warnings: summary.warnings,
      notes: { updated: summary.updated, stub_ids: stubIds.slice(0, 50) },
    })
    .select('id')
    .single()

  return { ...summary, importId: importRow?.id ?? null, stubIds }
}

// ------------------------------------------------------------------
// 2. Attendance import
// ------------------------------------------------------------------

export type AttendanceImportInput = {
  headers: string[]
  rows: Record<string, string>[]
  map: ColumnMap
  schoolId: string
  staffId: string
  fileName: string
  academicYear: string
  term: string
}

export async function runAttendanceImport(
  admin: SupabaseClient,
  input: AttendanceImportInput,
): Promise<ImportSummary & { importId: string | null; below90: number }> {
  const summary = emptySummary()
  summary.rowCount = input.rows.length
  let below90 = 0

  if (!input.map['scn'] || !input.map['total_possible'] || !input.map['total_present']) {
    summary.errors.push({ row: 0, message: 'Required fields not mapped: scn, total_possible, total_present' })
    summary.errorCount++
    return { ...summary, importId: null, below90 }
  }

  const scns = input.rows.map((r) => cellAt(r, input.map, 'scn')).filter(Boolean)
  const existing = await loadStudentsByScn(admin, scns)

  // Create audit row first to obtain importId for FK on records
  const { data: importRow } = await (admin as any)
    .from('seemis_imports')
    .insert({
      school_id: input.schoolId,
      import_type: 'attendance',
      imported_by: input.staffId,
      file_name: input.fileName,
      row_count: summary.rowCount,
      matched_count: 0,
      created_count: 0,
      skipped_count: 0,
      error_count: 0,
      errors: [],
      warnings: [],
      notes: { academic_year: input.academicYear, term: input.term },
    })
    .select('id')
    .single()
  const importId = importRow?.id ?? null

  for (let i = 0; i < input.rows.length; i++) {
    const rowNum = i + 2
    const row = input.rows[i]
    const scn = cellAt(row, input.map, 'scn')
    if (!scn) { summary.errors.push({ row: rowNum, message: 'Missing SCN' }); summary.errorCount++; summary.skipped++; continue }
    const student = existing.get(scn)
    if (!student) { summary.warnings.push({ row: rowNum, message: `No student for SCN ${scn}; skipping` }); summary.skipped++; continue }

    const totalPossible = parseInt(cellAt(row, input.map, 'total_possible'), 10)
    const totalPresent = parseInt(cellAt(row, input.map, 'total_present'), 10)
    const auth = parseInt(cellAt(row, input.map, 'authorised'), 10) || 0
    const unauth = parseInt(cellAt(row, input.map, 'unauthorised'), 10) || 0
    if (!Number.isFinite(totalPossible) || !Number.isFinite(totalPresent) || totalPossible <= 0) {
      summary.errors.push({ row: rowNum, message: 'Invalid total_possible or total_present' })
      summary.errorCount++
      summary.skipped++
      continue
    }
    const pct = Math.round((totalPresent / totalPossible) * 1000) / 10
    const isBelow90 = pct < 90
    if (isBelow90) below90++

    // Upsert attendance_records (unique-ish on school_id, student_id, academic_year, term)
    const { data: existingAtt } = await (admin as any)
      .from('attendance_records')
      .select('id')
      .eq('school_id', input.schoolId)
      .eq('student_id', student.id)
      .eq('academic_year', input.academicYear)
      .eq('term', input.term)
      .maybeSingle()
    if (existingAtt?.id) {
      await (admin as any).from('attendance_records').update({
        import_id: importId,
        total_possible: totalPossible,
        total_present: totalPresent,
        authorised_absence: auth,
        unauthorised_absence: unauth,
        attendance_pct: pct,
        is_below_90: isBelow90,
      }).eq('id', existingAtt.id)
      summary.updated++
    } else {
      await (admin as any).from('attendance_records').insert({
        school_id: input.schoolId,
        student_id: student.id,
        import_id: importId,
        academic_year: input.academicYear,
        term: input.term,
        total_possible: totalPossible,
        total_present: totalPresent,
        authorised_absence: auth,
        unauthorised_absence: unauth,
        attendance_pct: pct,
        is_below_90: isBelow90,
      })
      summary.created++
    }
    summary.matched++

    // Update students.attendance_pct with the latest reading
    await (admin as any).from('students').update({ attendance_pct: pct }).eq('id', student.id)
  }

  if (importId) {
    await (admin as any).from('seemis_imports').update({
      matched_count: summary.matched,
      created_count: summary.created,
      skipped_count: summary.skipped,
      error_count: summary.errorCount,
      errors: summary.errors,
      warnings: summary.warnings,
      notes: { academic_year: input.academicYear, term: input.term, updated: summary.updated, below_90: below90 },
    }).eq('id', importId)
  }
  return { ...summary, importId, below90 }
}

// ------------------------------------------------------------------
// 3. Class list import
// ------------------------------------------------------------------

export type ClassListImportInput = {
  headers: string[]
  rows: Record<string, string>[]
  map: ColumnMap
  schoolId: string
  staffId: string
  fileName: string
  academicYear: string
}

export async function runClassListImport(
  admin: SupabaseClient,
  input: ClassListImportInput,
): Promise<ImportSummary & { importId: string | null; unmatchedSubjects: string[]; unmatchedTeachers: string[]; classesCreated: number }> {
  const summary = emptySummary()
  summary.rowCount = input.rows.length
  const unmatchedSubjects = new Set<string>()
  const unmatchedTeachers = new Set<string>()

  if (!input.map['scn'] || !input.map['subject']) {
    summary.errors.push({ row: 0, message: 'Required fields not mapped: scn, subject' })
    summary.errorCount++
    return { ...summary, importId: null, unmatchedSubjects: [], unmatchedTeachers: [], classesCreated: 0 }
  }

  // Pre-load subjects + staff + students
  const { data: subjectsData } = await (admin as any).from('subjects').select('id, name')
  const subjectByName = new Map<string, string>()
  for (const s of subjectsData ?? []) subjectByName.set(String(s.name).toLowerCase(), s.id)

  const { data: staffData } = await (admin as any)
    .from('school_staff').select('id, full_name').eq('school_id', input.schoolId)
  const staffByName = new Map<string, string>()
  for (const s of staffData ?? []) staffByName.set(String(s.full_name).toLowerCase(), s.id)

  const scns = input.rows.map((r) => cellAt(r, input.map, 'scn')).filter(Boolean)
  const students = await loadStudentsByScn(admin, scns)

  // Audit row first
  const { data: importRow } = await (admin as any)
    .from('seemis_imports')
    .insert({
      school_id: input.schoolId,
      import_type: 'class_lists',
      imported_by: input.staffId,
      file_name: input.fileName,
      row_count: summary.rowCount,
      matched_count: 0, created_count: 0, skipped_count: 0, error_count: 0,
      errors: [], warnings: [],
      notes: { academic_year: input.academicYear },
    })
    .select('id').single()
  const importId = importRow?.id ?? null

  // key = subject_id|class_code|staff_id -> class_assignment id
  const classCache = new Map<string, string>()
  let classesCreated = 0

  async function ensureClassAssignment(
    subjectId: string,
    classCode: string | null,
    staffId: string | null,
    yearGroupGuess: string | null,
  ): Promise<string> {
    const key = `${subjectId}|${classCode ?? ''}|${staffId ?? ''}`
    if (classCache.has(key)) return classCache.get(key)!
    // Look for existing
    let query = (admin as any)
      .from('class_assignments').select('id')
      .eq('school_id', input.schoolId).eq('subject_id', subjectId).eq('academic_year', input.academicYear)
    if (classCode) query = query.eq('class_code', classCode)
    if (staffId) query = query.eq('staff_id', staffId)
    const { data: existing } = await query.maybeSingle()
    if (existing?.id) { classCache.set(key, existing.id); return existing.id }
    // Create
    const { data: created } = await (admin as any)
      .from('class_assignments')
      .insert({
        school_id: input.schoolId,
        subject_id: subjectId,
        class_code: classCode,
        staff_id: staffId,
        year_group: yearGroupGuess ?? 'S4',
        academic_year: input.academicYear,
      })
      .select('id').single()
    if (created?.id) { classCache.set(key, created.id); classesCreated++; return created.id }
    throw new Error('class_assignment insert failed')
  }

  for (let i = 0; i < input.rows.length; i++) {
    const rowNum = i + 2
    const row = input.rows[i]
    const scn = cellAt(row, input.map, 'scn')
    const subjectName = cellAt(row, input.map, 'subject')
    const classCode = cellAt(row, input.map, 'class_code') || null
    const teacherName = cellAt(row, input.map, 'teacher') || null

    if (!scn || !subjectName) { summary.skipped++; continue }

    const student = students.get(scn)
    if (!student) { summary.warnings.push({ row: rowNum, message: `No student for SCN ${scn}` }); summary.skipped++; continue }

    const subjectId = subjectByName.get(subjectName.toLowerCase())
      ?? [...subjectByName.entries()].find(([n]) => n.includes(subjectName.toLowerCase()) || subjectName.toLowerCase().includes(n))?.[1]
    if (!subjectId) {
      unmatchedSubjects.add(subjectName)
      summary.warnings.push({ row: rowNum, message: `Subject not matched: ${subjectName}` })
      summary.skipped++
      continue
    }

    let staffId: string | null = null
    if (teacherName) {
      staffId = staffByName.get(teacherName.toLowerCase()) ?? null
      if (!staffId) {
        unmatchedTeachers.add(teacherName)
        summary.warnings.push({ row: rowNum, message: `Teacher not matched: ${teacherName}` })
        // proceed without staff_id
      }
    }

    try {
      const caId = await ensureClassAssignment(subjectId, classCode, staffId, student.school_stage?.toUpperCase() ?? null)
      // Insert class_students (idempotent on class_assignment_id + student_id)
      const { data: existingLink } = await (admin as any)
        .from('class_students').select('id')
        .eq('class_assignment_id', caId).eq('student_id', student.id).maybeSingle()
      if (!existingLink?.id) {
        await (admin as any).from('class_students').insert({
          class_assignment_id: caId,
          student_id: student.id,
          import_id: importId,
        })
        summary.created++
      } else {
        summary.updated++
      }
      summary.matched++
    } catch (e: any) {
      summary.errors.push({ row: rowNum, message: `Assignment failed: ${e.message ?? e}` })
      summary.errorCount++
    }
  }

  if (importId) {
    await (admin as any).from('seemis_imports').update({
      matched_count: summary.matched,
      created_count: summary.created,
      skipped_count: summary.skipped,
      error_count: summary.errorCount,
      errors: summary.errors,
      warnings: summary.warnings,
      notes: {
        academic_year: input.academicYear,
        classes_created: classesCreated,
        unmatched_subjects: Array.from(unmatchedSubjects),
        unmatched_teachers: Array.from(unmatchedTeachers),
      },
    }).eq('id', importId)
  }

  return {
    ...summary,
    importId,
    unmatchedSubjects: Array.from(unmatchedSubjects),
    unmatchedTeachers: Array.from(unmatchedTeachers),
    classesCreated,
  }
}

// ------------------------------------------------------------------
// 4. SQA results import (with value-added)
// ------------------------------------------------------------------

export type SqaImportInput = {
  headers: string[]
  rows: Record<string, string>[]
  map: ColumnMap
  schoolId: string
  staffId: string
  fileName: string
  academicYear: string
}

export async function runSqaImport(
  admin: SupabaseClient,
  input: SqaImportInput,
): Promise<ImportSummary & { importId: string | null; exceededCount: number; metCount: number; belowCount: number; avgValueAdded: number }> {
  const summary = emptySummary()
  summary.rowCount = input.rows.length
  let exceededCount = 0, metCount = 0, belowCount = 0
  let vaSum = 0, vaCount = 0

  if (!input.map['subject'] || !input.map['grade']) {
    summary.errors.push({ row: 0, message: 'Required fields not mapped: subject, grade' })
    summary.errorCount++
    return { ...summary, importId: null, exceededCount, metCount, belowCount, avgValueAdded: 0 }
  }

  const scns = input.rows.map((r) => cellAt(r, input.map, 'scn')).filter(Boolean)
  const students = await loadStudentsByScn(admin, scns)

  // Current cycle + tracking entries for predicted-grade lookup
  const { data: cycle } = await (admin as any)
    .from('tracking_cycles')
    .select('id')
    .eq('school_id', input.schoolId)
    .order('ends_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const cycleId = cycle?.id ?? null

  // Insert import audit first
  const { data: importRow } = await (admin as any)
    .from('sqa_results_imports')
    .insert({
      school_id: input.schoolId,
      academic_year: input.academicYear,
      imported_by: input.staffId,
      file_name: input.fileName,
      row_count: summary.rowCount,
      matched_count: 0, unmatched_count: 0,
      unmatched_details: [],
    })
    .select('id').single()
  const importId = importRow?.id ?? null

  const unmatchedDetails: Array<{ scn: string; name: string; subject: string; grade: string }> = []

  for (let i = 0; i < input.rows.length; i++) {
    const rowNum = i + 2
    const row = input.rows[i]
    const scn = cellAt(row, input.map, 'scn')
    const name = cellAt(row, input.map, 'name')
    const subject = cellAt(row, input.map, 'subject')
    const level = cellAt(row, input.map, 'level') || 'Unknown'
    const grade = cellAt(row, input.map, 'grade')
    if (!subject || !grade) { summary.errors.push({ row: rowNum, message: 'Missing subject or grade' }); summary.errorCount++; summary.skipped++; continue }

    const student = scn ? students.get(scn) : undefined

    // Predicted grade lookup -- best effort through class_assignments by subject name
    let predictedGrade: string | null = null
    let valueAdded: number | null = null
    if (student && cycleId) {
      const { data: ent } = await (admin as any)
        .from('tracking_entries')
        .select('id, working_grade, predicted_grade, class_assignment_id, class_assignments:class_assignment_id(subject_id, subjects:subject_id(name))')
        .eq('school_id', input.schoolId)
        .eq('student_id', student.id)
        .eq('cycle_id', cycleId)
      const matches = (ent ?? []).find((e: any) => {
        const sname = e?.class_assignments?.subjects?.name ?? ''
        return String(sname).toLowerCase().trim() === subject.toLowerCase().trim()
      })
      if (matches) {
        predictedGrade = matches.predicted_grade ?? matches.working_grade ?? null
        const pNum = gradeToNumeric(predictedGrade)
        const aNum = gradeToNumeric(grade)
        if (pNum != null && aNum != null) {
          valueAdded = aNum - pNum
          vaSum += valueAdded; vaCount++
          if (valueAdded > 0) exceededCount++
          else if (valueAdded === 0) metCount++
          else belowCount++
        }
        // Update tracking_entry with actual grade
        await (admin as any).from('tracking_entries').update({
          actual_grade: grade,
          is_predicted_grade: false,
        }).eq('id', matches.id)
      }
    }

    const { error: insErr } = await (admin as any).from('sqa_results').insert({
      import_id: importId,
      school_id: input.schoolId,
      student_id: student?.id ?? null,
      scn: scn || null,
      student_name: name || (student ? `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() : null),
      subject_name: subject,
      qualification_type: level,
      grade,
      predicted_grade: predictedGrade,
      value_added: valueAdded,
      academic_year: input.academicYear,
    })
    if (insErr) {
      summary.errors.push({ row: rowNum, message: `Insert failed: ${insErr.message}` })
      summary.errorCount++
      continue
    }
    summary.created++
    if (student) summary.matched++
    else {
      summary.skipped++
      unmatchedDetails.push({ scn, name, subject, grade })
    }
  }

  if (importId) {
    await (admin as any).from('sqa_results_imports').update({
      matched_count: summary.matched,
      unmatched_count: unmatchedDetails.length,
      unmatched_details: unmatchedDetails,
    }).eq('id', importId)
  }

  const avgVa = vaCount > 0 ? Math.round((vaSum / vaCount) * 100) / 100 : 0
  return { ...summary, importId, exceededCount, metCount, belowCount, avgValueAdded: avgVa }
}

// ------------------------------------------------------------------
// 5. Transition import
// ------------------------------------------------------------------

export type TransitionImportInput = {
  headers: string[]
  rows: Record<string, string>[]
  map: ColumnMap
  schoolId: string
  staffId: string
  fileName: string
  transitionYear: string
}

export async function runTransitionImport(
  admin: SupabaseClient,
  input: TransitionImportInput,
): Promise<ImportSummary & { importId: string | null }> {
  const summary = emptySummary()
  summary.rowCount = input.rows.length

  if (!input.map['name'] || !input.map['primary']) {
    summary.errors.push({ row: 0, message: 'Required fields not mapped: name, primary' })
    summary.errorCount++
    return { ...summary, importId: null }
  }

  const scns = input.rows.map((r) => cellAt(r, input.map, 'scn')).filter(Boolean)
  const students = await loadStudentsByScn(admin, scns)

  const { data: importRow } = await (admin as any)
    .from('seemis_imports')
    .insert({
      school_id: input.schoolId,
      import_type: 'transition',
      imported_by: input.staffId,
      file_name: input.fileName,
      row_count: summary.rowCount,
      matched_count: 0, created_count: 0, skipped_count: 0, error_count: 0,
      errors: [], warnings: [],
      notes: { transition_year: input.transitionYear },
    })
    .select('id').single()
  const importId = importRow?.id ?? null

  for (let i = 0; i < input.rows.length; i++) {
    const rowNum = i + 2
    const row = input.rows[i]
    const scn = cellAt(row, input.map, 'scn')
    const name = cellAt(row, input.map, 'name')
    const primary = cellAt(row, input.map, 'primary')
    if (!name || !primary) { summary.errors.push({ row: rowNum, message: 'Missing name or primary' }); summary.errorCount++; summary.skipped++; continue }

    const reading = cfeLevel(cellAt(row, input.map, 'reading'))
    const writing = cfeLevel(cellAt(row, input.map, 'writing'))
    const listening = cfeLevel(cellAt(row, input.map, 'listening_talking'))
    const numeracy = cfeLevel(cellAt(row, input.map, 'numeracy'))

    const rawReading = cellAt(row, input.map, 'reading')
    if (rawReading && !reading) {
      summary.errors.push({ row: rowNum, message: `Invalid CfE reading level: ${rawReading}`, field: 'reading' })
      summary.errorCount++
      continue
    }
    const rawWriting = cellAt(row, input.map, 'writing')
    if (rawWriting && !writing) {
      summary.errors.push({ row: rowNum, message: `Invalid CfE writing level: ${rawWriting}`, field: 'writing' })
      summary.errorCount++
      continue
    }
    const rawListening = cellAt(row, input.map, 'listening_talking')
    if (rawListening && !listening) {
      summary.errors.push({ row: rowNum, message: `Invalid CfE listening/talking level: ${rawListening}`, field: 'listening_talking' })
      summary.errorCount++
      continue
    }
    const rawNumeracy = cellAt(row, input.map, 'numeracy')
    if (rawNumeracy && !numeracy) {
      summary.errors.push({ row: rowNum, message: `Invalid CfE numeracy level: ${rawNumeracy}`, field: 'numeracy' })
      summary.errorCount++
      continue
    }

    const snsaR = parseInt(cellAt(row, input.map, 'snsa_reading'), 10)
    const snsaN = parseInt(cellAt(row, input.map, 'snsa_numeracy'), 10)
    const asnNotes = cellAt(row, input.map, 'asn_notes') || null
    const pastoralNotes = cellAt(row, input.map, 'pastoral_notes') || null

    const student = scn ? students.get(scn) : undefined
    const { error: insErr } = await (admin as any).from('transition_profiles').insert({
      school_id: input.schoolId,
      student_id: student?.id ?? null,
      scn: scn || null,
      student_name: name,
      source_primary: primary,
      transition_year: input.transitionYear,
      reading_level: reading,
      writing_level: writing,
      listening_talking_level: listening,
      numeracy_level: numeracy,
      snsa_reading_score: Number.isFinite(snsaR) ? snsaR : null,
      snsa_numeracy_score: Number.isFinite(snsaN) ? snsaN : null,
      asn_notes: asnNotes,
      pastoral_notes: pastoralNotes,
      import_id: importId,
    })
    if (insErr) {
      summary.errors.push({ row: rowNum, message: `Insert failed: ${insErr.message}` })
      summary.errorCount++
      continue
    }
    summary.created++
    if (student) summary.matched++
    else summary.skipped++

    // If ASN notes present and student flag is false, update
    if (student && asnNotes) {
      await (admin as any).from('students').update({ has_asn: true }).eq('id', student.id).eq('has_asn', false)
    }
  }

  if (importId) {
    await (admin as any).from('seemis_imports').update({
      matched_count: summary.matched,
      created_count: summary.created,
      skipped_count: summary.skipped,
      error_count: summary.errorCount,
      errors: summary.errors,
      warnings: summary.warnings,
    }).eq('id', importId)
  }
  return { ...summary, importId }
}

// ------------------------------------------------------------------
// 6. Destinations import
// ------------------------------------------------------------------

export type DestinationImportInput = {
  headers: string[]
  rows: Record<string, string>[]
  map: ColumnMap
  schoolId: string
  staffId: string
  fileName: string
}

export async function runDestinationsImport(
  admin: SupabaseClient,
  input: DestinationImportInput,
): Promise<ImportSummary> {
  const summary = emptySummary()
  summary.rowCount = input.rows.length

  if (!input.map['leaving_year'] || !input.map['leaving_stage'] || !input.map['destination']) {
    summary.errors.push({ row: 0, message: 'Required fields not mapped: leaving_year, leaving_stage, destination' })
    summary.errorCount++
    return summary
  }

  const scns = input.rows.map((r) => cellAt(r, input.map, 'scn')).filter(Boolean)
  const students = await loadStudentsByScn(admin, scns)

  // Preload student flags for snapshotting
  const ids = Array.from(students.values()).map((s) => s.id)
  const { data: flagRows } = ids.length
    ? await (admin as any)
        .from('students')
        .select('id, simd_decile, care_experienced, receives_free_school_meals')
        .in('id', ids)
    : { data: [] }
  const flagsMap = new Map((flagRows ?? []).map((r: any) => [r.id, r]))

  // Preload subject choices snapshot: subject name + transition label.
  const { data: choices } = ids.length
    ? await (admin as any)
        .from('student_subject_choices')
        .select('student_id, transition, rank_order, subjects:subject_id(name)')
        .in('student_id', ids)
        .order('rank_order', { ascending: true })
    : { data: [] }
  const choicesByStudent = new Map<string, Array<{ subject: string; transition: string }>>()
  for (const c of choices ?? []) {
    if (!c.student_id) continue
    const arr = choicesByStudent.get(c.student_id) ?? []
    arr.push({ subject: c.subjects?.name ?? '', transition: c.transition ?? '' })
    choicesByStudent.set(c.student_id, arr)
  }

  for (let i = 0; i < input.rows.length; i++) {
    const rowNum = i + 2
    const row = input.rows[i]
    const scn = cellAt(row, input.map, 'scn')
    const name = cellAt(row, input.map, 'name')
    const leavingYear = cellAt(row, input.map, 'leaving_year')
    const leavingStage = cellAt(row, input.map, 'leaving_stage')
    const destRaw = cellAt(row, input.map, 'destination').toLowerCase()
    const institution = cellAt(row, input.map, 'institution') || null
    const course = cellAt(row, input.map, 'course') || null
    const employer = cellAt(row, input.map, 'employer') || null

    if (!leavingYear || !leavingStage || !destRaw) { summary.errors.push({ row: rowNum, message: 'Missing leaving_year/stage/destination' }); summary.errorCount++; summary.skipped++; continue }

    // Map destination string -> canonical type
    const destination = mapDestinationType(destRaw)
    if (!destination) {
      summary.errors.push({ row: rowNum, message: `Unknown destination type: ${destRaw}`, field: 'destination' })
      summary.errorCount++
      continue
    }

    const student = scn ? students.get(scn) : undefined
    const flags = student ? flagsMap.get(student.id) : null
    const simdDecile = (flags as any)?.simd_decile ?? null
    const snapshot = student ? choicesByStudent.get(student.id) ?? null : null

    const { error: insErr } = await (admin as any).from('alumni_destinations').insert({
      school_id: input.schoolId,
      student_id: student?.id ?? null,
      scn: scn || null,
      student_name: name || (student ? `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() : null),
      leaving_year: leavingYear,
      leaving_stage: leavingStage,
      destination_type: destination,
      institution_name: institution,
      course_name: course,
      employer_name: employer,
      data_source: 'import',
      subject_choices_snapshot: snapshot,
      simd_decile: simdDecile,
      was_widening_access: simdDecile != null && simdDecile <= 4,
      was_care_experienced: !!(flags as any)?.care_experienced,
      was_fsm: !!(flags as any)?.receives_free_school_meals,
    })
    if (insErr) {
      summary.errors.push({ row: rowNum, message: `Insert failed: ${insErr.message}` })
      summary.errorCount++
      continue
    }
    summary.created++
    if (student) summary.matched++
    else summary.skipped++
  }
  return summary
}

export function mapDestinationType(raw: string):
  | 'higher_education' | 'further_education' | 'modern_apprenticeship'
  | 'graduate_apprenticeship' | 'employment' | 'training'
  | 'voluntary' | 'gap_year' | 'unemployed_seeking'
  | 'unemployed_not_seeking' | 'unknown' | null {
  const t = raw.toLowerCase().trim()
  if (['higher_education', 'he', 'university', 'uni'].some((x) => t.includes(x))) return 'higher_education'
  if (['further_education', 'fe', 'college'].some((x) => t.includes(x))) return 'further_education'
  if (['modern_apprenticeship', 'modern app', 'ma'].some((x) => t.includes(x))) return 'modern_apprenticeship'
  if (['graduate_apprenticeship', 'graduate app', 'ga'].some((x) => t.includes(x))) return 'graduate_apprenticeship'
  if (['employment', 'employed', 'work'].some((x) => t.includes(x))) return 'employment'
  if (['training', 'trainee'].some((x) => t.includes(x))) return 'training'
  if (['voluntary', 'volunteer'].some((x) => t.includes(x))) return 'voluntary'
  if (['gap', 'gap_year'].some((x) => t.includes(x))) return 'gap_year'
  if (['seeking', 'unemployed_seeking', 'jobseek'].some((x) => t.includes(x))) return 'unemployed_seeking'
  if (['not_seeking', 'not seeking'].some((x) => t.includes(x))) return 'unemployed_not_seeking'
  if (['unemploy'].some((x) => t.includes(x))) return 'unemployed_seeking'
  if (['unknown', 'not known', '-'].some((x) => t.includes(x))) return 'unknown'
  return null
}

// ------------------------------------------------------------------
// 7. Demographics-only import (SEEMIS supplemental extract)
// ------------------------------------------------------------------

export type DemographicImportInput = {
  headers: string[]
  rows: Record<string, string>[]
  map: ColumnMap
  schoolId: string
  staffId: string
  fileName: string
}

export async function runDemographicImport(
  admin: SupabaseClient,
  input: DemographicImportInput,
): Promise<ImportSummary & { importId: string | null }> {
  const summary = emptySummary()
  summary.rowCount = input.rows.length

  // SCN is strongly preferred; name fallback is supported.
  const scns = input.rows
    .map((r) => cellAt(r, input.map, 'scn'))
    .filter((s) => s)
  const existing = await loadStudentsByScn(admin, scns)
  const fallbackNameList = await loadStudentsByName(admin, input.schoolId)

  const now = new Date().toISOString()

  for (let i = 0; i < input.rows.length; i++) {
    const rowNum = i + 2
    const row = input.rows[i]
    const scn = cellAt(row, input.map, 'scn')
    const forename = cellAt(row, input.map, 'forename')
    const surname = cellAt(row, input.map, 'surname')

    // Resolve student
    let studentId: string | null = null
    if (scn) {
      const s = existing.get(scn)
      if (s) studentId = s.id
    }
    if (!studentId && forename && surname) {
      const hit = fallbackNameList.find((s) =>
        nameMatches({ firstName: s.first_name, lastName: s.last_name }, `${forename} ${surname}`),
      )
      if (hit) {
        studentId = hit.id
        summary.warnings.push({ row: rowNum, message: `Matched by name (no SCN): ${forename} ${surname}` })
      }
    }
    if (!studentId) {
      summary.warnings.push({ row: rowNum, message: scn ? `No student for SCN ${scn}` : 'No SCN and name did not match; skipping' })
      summary.skipped++
      continue
    }

    const gender = normaliseGender(cellAt(row, input.map, 'gender'))
    const fsm = normaliseBool(cellAt(row, input.map, 'fsm'))
    const asn = normaliseBool(cellAt(row, input.map, 'asn'))
    const lac = normaliseBool(cellAt(row, input.map, 'care_experienced'))
    const eal = normaliseBool(cellAt(row, input.map, 'eal'))
    const youngCarer = normaliseBool(cellAt(row, input.map, 'young_carer'))
    const ethnicity = cellAt(row, input.map, 'ethnicity') || null

    const updates: Record<string, any> = {
      demographic_source: 'seemis_import',
      demographic_updated_at: now,
    }
    if (gender != null) updates.gender = gender
    if (fsm != null) updates.receives_free_school_meals = fsm
    if (asn != null) updates.has_asn = asn
    if (lac != null) updates.care_experienced = lac
    if (eal != null) updates.eal = eal
    if (youngCarer != null) updates.is_young_carer = youngCarer
    if (ethnicity) updates.ethnicity = ethnicity

    if (Object.keys(updates).length === 2) {
      // Only the source/timestamp fields — nothing meaningful to update
      summary.warnings.push({ row: rowNum, message: 'No demographic fields mapped for this row; skipping' })
      summary.skipped++
      continue
    }

    const { error } = await (admin as any).from('students').update(updates).eq('id', studentId)
    if (error) {
      summary.errors.push({ row: rowNum, message: `Update failed: ${error.message}` })
      summary.errorCount++
      continue
    }
    summary.updated++
    summary.matched++
  }

  const { data: importRow } = await (admin as any)
    .from('seemis_imports')
    .insert({
      school_id: input.schoolId,
      import_type: 'demographics',
      imported_by: input.staffId,
      file_name: input.fileName,
      row_count: summary.rowCount,
      matched_count: summary.matched,
      created_count: 0,
      skipped_count: summary.skipped,
      error_count: summary.errorCount,
      errors: summary.errors,
      warnings: summary.warnings,
      notes: { updated: summary.updated },
    })
    .select('id')
    .single()

  return { ...summary, importId: importRow?.id ?? null }
}

// ------------------------------------------------------------------
// 8. Re-match unmatched records (by SCN)
// ------------------------------------------------------------------

export async function rematchUnmatched(admin: SupabaseClient, schoolId: string): Promise<{ sqa: number; destinations: number; transitions: number }> {
  const tables = [
    { table: 'sqa_results', key: 'sqa' as const },
    { table: 'alumni_destinations', key: 'destinations' as const },
    { table: 'transition_profiles', key: 'transitions' as const },
  ]
  const out: { sqa: number; destinations: number; transitions: number } = { sqa: 0, destinations: 0, transitions: 0 }
  for (const { table, key } of tables) {
    const { data: rows } = await (admin as any)
      .from(table)
      .select('id, scn')
      .eq('school_id', schoolId)
      .is('student_id', null)
      .not('scn', 'is', null)
    const scns = Array.from(new Set((rows ?? []).map((r: any) => r.scn).filter(Boolean)))
    if (scns.length === 0) continue
    const students = await loadStudentsByScn(admin, scns as string[])
    for (const r of rows ?? []) {
      const s = students.get(r.scn)
      if (!s) continue
      await (admin as any).from(table).update({ student_id: s.id }).eq('id', r.id)
      out[key]++
    }
  }
  return out
}

// ------------------------------------------------------------------
// Destinations dashboard aggregator
// ------------------------------------------------------------------

export type DestinationsDashboard = {
  total: number
  positiveCount: number
  positivePct: number
  byType: Record<string, number>
  byQuintile: Array<{ quintile: number; count: number; hePct: number; fePct: number; employmentPct: number; positivePct: number }>
  yearTrend: Array<{ leaving_year: string; positive_pct: number; count: number }>
}

const POSITIVE_TYPES = new Set([
  'higher_education', 'further_education', 'modern_apprenticeship',
  'graduate_apprenticeship', 'employment', 'training', 'voluntary',
])

export async function getDestinationsDashboard(admin: SupabaseClient, schoolId: string): Promise<DestinationsDashboard> {
  const { data } = await (admin as any)
    .from('alumni_destinations')
    .select('leaving_year, destination_type, simd_decile')
    .eq('school_id', schoolId)
  const rows = (data ?? []) as Array<{ leaving_year: string; destination_type: string; simd_decile: number | null }>

  const total = rows.length
  const byType: Record<string, number> = {}
  let positiveCount = 0
  const byYear = new Map<string, { total: number; positive: number }>()
  const byQ = new Map<number, { total: number; he: number; fe: number; emp: number; positive: number }>()

  for (const r of rows) {
    byType[r.destination_type] = (byType[r.destination_type] ?? 0) + 1
    const isPositive = POSITIVE_TYPES.has(r.destination_type)
    if (isPositive) positiveCount++

    const y = byYear.get(r.leaving_year) ?? { total: 0, positive: 0 }
    y.total++
    if (isPositive) y.positive++
    byYear.set(r.leaving_year, y)

    if (r.simd_decile != null) {
      const q = Math.ceil(r.simd_decile / 2) // 1-2 = 1, 3-4 = 2, 5-6 = 3, 7-8 = 4, 9-10 = 5
      const slot = byQ.get(q) ?? { total: 0, he: 0, fe: 0, emp: 0, positive: 0 }
      slot.total++
      if (r.destination_type === 'higher_education') slot.he++
      if (r.destination_type === 'further_education') slot.fe++
      if (r.destination_type === 'employment') slot.emp++
      if (isPositive) slot.positive++
      byQ.set(q, slot)
    }
  }

  const byQuintile: DestinationsDashboard['byQuintile'] = []
  for (let q = 1; q <= 5; q++) {
    const slot = byQ.get(q) ?? { total: 0, he: 0, fe: 0, emp: 0, positive: 0 }
    byQuintile.push({
      quintile: q,
      count: slot.total,
      hePct: slot.total ? Math.round((slot.he / slot.total) * 1000) / 10 : 0,
      fePct: slot.total ? Math.round((slot.fe / slot.total) * 1000) / 10 : 0,
      employmentPct: slot.total ? Math.round((slot.emp / slot.total) * 1000) / 10 : 0,
      positivePct: slot.total ? Math.round((slot.positive / slot.total) * 1000) / 10 : 0,
    })
  }

  const yearTrend = Array.from(byYear.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([leaving_year, s]) => ({
      leaving_year,
      positive_pct: s.total ? Math.round((s.positive / s.total) * 1000) / 10 : 0,
      count: s.total,
    }))

  return {
    total,
    positiveCount,
    positivePct: total ? Math.round((positiveCount / total) * 1000) / 10 : 0,
    byType,
    byQuintile,
    yearTrend,
  }
}

export { currentAcademicYear }
