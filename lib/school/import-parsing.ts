// Schools-8: shared CSV / XLSX parsing + column-mapping helpers used
// by the /school/import page and every import API route.
//
// Parsing runs server-side so the browser never sees rows directly --
// the file is uploaded, parsed, stored in memory, and the preview is
// shipped back. On the final import call the same file is re-parsed
// and rows are processed in a single transaction-free pass with a
// structured errors / warnings log.

import * as XLSX from 'xlsx'

export type ParsedTable = {
  headers: string[]
  rows: Record<string, string>[]
}

// ------------------------------------------------------------------
// File parsing
// ------------------------------------------------------------------

export async function parseUploaded(file: File): Promise<ParsedTable> {
  const name = (file.name ?? '').toLowerCase()
  const isXlsx = name.endsWith('.xlsx') || name.endsWith('.xls')
  const buf = await file.arrayBuffer()
  if (isXlsx) return parseXlsx(buf)
  const text = new TextDecoder('utf-8').decode(buf)
  return parseCsv(text)
}

export function parseCsv(text: string): ParsedTable {
  const cleaned = text.replace(/^﻿/, '')
  const lines: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < cleaned.length; i++) {
    const c = cleaned[i]
    if (inQuotes) {
      if (c === '"') {
        if (cleaned[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); lines.push(row); row = []; field = '' }
      else if (c === '\r') { /* eat */ }
      else field += c
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); lines.push(row) }
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = lines[0].map((h) => h.trim())
  const rows: Record<string, string>[] = []
  for (let r = 1; r < lines.length; r++) {
    const vals = lines[r]
    if (vals.every((v) => (v ?? '').trim() === '')) continue
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = (vals[i] ?? '').trim() })
    rows.push(obj)
  }
  return { headers, rows }
}

export function parseXlsx(buffer: ArrayBuffer): ParsedTable {
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) return { headers: [], rows: [] }
  const sheet = wb.Sheets[sheetName]
  const json: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  if (json.length === 0) return { headers: [], rows: [] }
  const headers = (json[0] as unknown[]).map((h) => String(h ?? '').trim())
  const rows: Record<string, string>[] = []
  for (let r = 1; r < json.length; r++) {
    const vals = json[r] as unknown[]
    if (!vals || vals.every((v) => String(v ?? '').trim() === '')) continue
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = String(vals[i] ?? '').trim() })
    rows.push(obj)
  }
  return { headers, rows }
}

// ------------------------------------------------------------------
// Column mapping
// ------------------------------------------------------------------

// Heuristic match: returns the best column name from `headers` for a
// given field name + list of hints. Hints are compared case-insensitively
// against the normalised header (alpha chars only). The first header
// that matches exactly wins; otherwise the first partial match wins.
export function autoMatch(headers: string[], hints: string[]): string | null {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const normHeaders = headers.map((h) => ({ raw: h, n: norm(h) }))
  const normHints = hints.map(norm)
  for (const hint of normHints) {
    const exact = normHeaders.find((h) => h.n === hint)
    if (exact) return exact.raw
  }
  for (const hint of normHints) {
    const partial = normHeaders.find((h) => h.n.includes(hint) && hint.length >= 3)
    if (partial) return partial.raw
  }
  return null
}

export type ColumnMap = Record<string, string | null>

// ------------------------------------------------------------------
// Field hints per import type (used for auto-detect + UI dropdowns)
// ------------------------------------------------------------------

export const PUPIL_HINTS: Record<string, string[]> = {
  scn: ['scn', 'studentnumber', 'studentid', 'candidatenumber'],
  forename: ['forename', 'firstname', 'givenname'],
  surname: ['surname', 'lastname', 'familyname'],
  dob: ['dob', 'dateofbirth', 'birthdate'],
  year_group: ['yeargroup', 'stage', 'schoolstage', 'year'],
  registration_class: ['regclass', 'registrationclass', 'registration', 'regclassname'],
  house: ['house', 'housegroup'],
  postcode: ['postcode', 'zip', 'postalcode'],
  asn: ['asn', 'additionalsupport', 'supportneeds'],
  fsm: ['fsm', 'freeschoolmeals', 'freemeals'],
  eal: ['eal', 'englishasadditional'],
  lac: ['lac', 'lookedafter', 'careexperienced'],
}

export const ATTENDANCE_HINTS: Record<string, string[]> = {
  scn: ['scn', 'studentnumber', 'candidatenumber'],
  total_possible: ['totalpossible', 'possible', 'sessions', 'totalsessions'],
  total_present: ['totalpresent', 'present', 'attendance', 'totalattendance'],
  authorised: ['authorised', 'authorisedabsence', 'authabsence'],
  unauthorised: ['unauthorised', 'unauthorisedabsence', 'unauthabsence'],
}

export const CLASS_LIST_HINTS: Record<string, string[]> = {
  scn: ['scn', 'studentnumber'],
  subject: ['subject', 'subjectname', 'coursename'],
  class_code: ['classcode', 'class', 'group', 'teachinggroup'],
  teacher: ['teacher', 'teachername', 'staffname'],
}

export const SQA_HINTS: Record<string, string[]> = {
  scn: ['scn', 'candidatenumber', 'studentnumber'],
  name: ['candidatename', 'studentname', 'name'],
  subject: ['subject', 'coursename'],
  level: ['level', 'qualification', 'qualificationtype'],
  grade: ['grade', 'awardgrade', 'result'],
}

export const TRANSITION_HINTS: Record<string, string[]> = {
  scn: ['scn', 'studentnumber'],
  name: ['name', 'studentname', 'candidatename'],
  primary: ['primary', 'primaryschool', 'schoolname'],
  reading: ['reading', 'readinglevel'],
  writing: ['writing', 'writinglevel'],
  listening_talking: ['listeningtalking', 'listening', 'talking', 'listeningandtalking'],
  numeracy: ['numeracy', 'numeracylevel', 'maths'],
  snsa_reading: ['snsareading', 'readingsnsa', 'snsareadingscore'],
  snsa_numeracy: ['snsanumeracy', 'numeracysnsa', 'snsanumeracyscore'],
  asn_notes: ['asn', 'asnnotes', 'supportneeds'],
  pastoral_notes: ['pastoral', 'pastoralnotes', 'wellbeing', 'wellbeingnotes'],
}

export const DESTINATION_HINTS: Record<string, string[]> = {
  scn: ['scn', 'studentnumber'],
  name: ['name', 'studentname', 'candidatename'],
  leaving_year: ['leavingyear', 'year', 'academicyear'],
  leaving_stage: ['leavingstage', 'stage', 'yeargroup'],
  destination: ['destination', 'destinationtype', 'outcome'],
  institution: ['institution', 'institutionname', 'university', 'college'],
  course: ['course', 'coursename', 'programme'],
  employer: ['employer', 'employername', 'company'],
}

// ------------------------------------------------------------------
// Value helpers
// ------------------------------------------------------------------

export function normaliseBool(v: string | undefined | null): boolean | null {
  if (v == null) return null
  const s = String(v).trim().toLowerCase()
  if (!s) return null
  if (['y', 'yes', 'true', '1', 'x', 'tick'].includes(s)) return true
  if (['n', 'no', 'false', '0', '-'].includes(s)) return false
  return null
}

export function normalisePostcode(v: string | undefined | null): string | null {
  if (!v) return null
  const t = String(v).toUpperCase().replace(/\s+/g, '')
  if (t.length < 5 || t.length > 8) return null
  return t
}

export function normaliseYearGroup(v: string | undefined | null): string | null {
  if (!v) return null
  const t = String(v).trim().toUpperCase()
  if (/^S[1-6]$/.test(t)) return t
  if (/^[1-6]$/.test(t)) return `S${t}`
  if (/^P[1-7]$/.test(t)) return t
  if (/^[1-7]$/.test(t)) return `P${t}`
  return t
}

// Scottish academic year: 2025-26 (Aug 2025 -> Jul 2026).
export function currentAcademicYear(d = new Date()): string {
  const y = d.getFullYear()
  const m = d.getMonth() // 0-indexed
  const startYear = m >= 7 ? y : y - 1
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0')
  return `${startYear}-${endYearShort}`
}

// ------------------------------------------------------------------
// Grade conversion (for value-added)
// ------------------------------------------------------------------

export function gradeToNumeric(g: string | null | undefined): number | null {
  if (!g) return null
  const t = String(g).trim().toUpperCase()
  if (t === 'A') return 4
  if (t === 'B') return 3
  if (t === 'C') return 2
  if (t === 'D') return 1
  if (t === 'E') return 0
  if (/NO\s*AWARD|FAIL|U/.test(t)) return 0
  return null
}

export function cfeLevel(v: string | undefined | null): 'early' | 'first' | 'second' | 'third' | 'fourth' | null {
  if (!v) return null
  const t = String(v).trim().toLowerCase()
  if (t.includes('early')) return 'early'
  if (t.includes('first') || t === '1st' || t === '1') return 'first'
  if (t.includes('second') || t === '2nd' || t === '2') return 'second'
  if (t.includes('third') || t === '3rd' || t === '3') return 'third'
  if (t.includes('fourth') || t === '4th' || t === '4') return 'fourth'
  return null
}

// ------------------------------------------------------------------
// Row name matcher: lightweight "did any name match?" for SCN-less
// records. Normalises both sides (lowercase, strip punctuation, collapse
// whitespace). Returns true if either surname+first-initial match OR
// full name matches.
// ------------------------------------------------------------------

export function nameMatches(a: { firstName?: string | null; lastName?: string | null }, b: string): boolean {
  if (!b) return false
  const clean = (s: string) => (s ?? '').toLowerCase().replace(/[^a-z\s-]/g, '').trim().replace(/\s+/g, ' ')
  const bClean = clean(b)
  if (!bClean) return false
  const first = clean(a.firstName ?? '')
  const last = clean(a.lastName ?? '')
  const full = `${first} ${last}`.trim()
  if (full && bClean === full) return true
  // Try "Surname, First" variant
  const reversed = `${last}, ${first}`.trim()
  if (bClean === reversed) return true
  // Try "Last F." surname + first initial
  if (last && first && bClean === `${last} ${first.charAt(0)}`) return true
  return false
}

// Shared small types returned from importers
export type RowError = { row: number; message: string; field?: string }
export type RowWarning = { row: number; message: string; field?: string }
export type ImportSummary = {
  rowCount: number
  created: number
  updated: number
  matched: number
  skipped: number
  errorCount: number
  errors: RowError[]
  warnings: RowWarning[]
}

export function emptySummary(): ImportSummary {
  return {
    rowCount: 0,
    created: 0,
    updated: 0,
    matched: 0,
    skipped: 0,
    errorCount: 0,
    errors: [],
    warnings: [],
  }
}
