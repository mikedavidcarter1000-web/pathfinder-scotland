/**
 * Scottish academic year utilities.
 *
 * Canonical format: "YYYY-YY" (e.g. "2025-26") -- matches the architecture
 * spec section 13a. The Scottish academic year runs 1 August to 31 July.
 *
 * Note: legacy school-portal modules (lib/school/cpd.ts, dyw.ts,
 * import-parsing.ts and three app/school/* page-level functions) ship
 * their own currentAcademicYear helpers using inconsistent formats
 * ("2025/26", "2025-26", "2025/2026"). Reconciliation to this module is
 * tracked in docs/phase-2-backlog.md.
 */

export type Term = 1 | 2 | 3 | 4

export type TermInfo = { term: Term; label: string }

export type TermWindow = { start: string; end: string } // ISO yyyy-mm-dd

export type TermDatesForYear = {
  term_1?: TermWindow
  term_2?: TermWindow
  term_3?: TermWindow
  term_4?: TermWindow
}

/**
 * Term-dates JSONB shape stored on local_authorities.term_dates.
 * Keys are academic-year strings ("2025-26"); values are 4-term windows.
 */
export type TermDates = Record<string, TermDatesForYear>

const TERM_LABELS: Record<Term, string> = {
  1: 'Autumn',
  2: 'Winter',
  3: 'Spring',
  4: 'Summer',
}

const ACADEMIC_YEAR_RE = /^(\d{4})-(\d{2})$/

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function startYearFrom(date: Date): number {
  // Scottish academic year starts 1 August. Months are 0-indexed (Aug = 7).
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth()
  return m >= 7 ? y : y - 1
}

function formatAcademicYear(startYear: number): string {
  return `${startYear}-${pad2((startYear + 1) % 100)}`
}

/**
 * Returns the current Scottish academic year in "YYYY-YY" format.
 * 1 August inclusive flips to the new year; 31 July is still the previous year.
 *
 * @param now - optional override for testing; defaults to new Date().
 */
export function getCurrentAcademicYear(now: Date = new Date()): string {
  return formatAcademicYear(startYearFrom(now))
}

/**
 * Returns the start (1 Aug) and end (31 Jul) Date objects for the supplied
 * academic year. Throws if the year string does not match "YYYY-YY".
 */
export function getAcademicYearDates(academicYear: string): { start: Date; end: Date } {
  const m = ACADEMIC_YEAR_RE.exec(academicYear)
  if (!m) throw new Error(`Invalid academic year format: "${academicYear}" (expected "YYYY-YY")`)
  const startYear = Number(m[1])
  const endYearShort = Number(m[2])
  const expectedShort = (startYear + 1) % 100
  if (endYearShort !== expectedShort) {
    throw new Error(`Invalid academic year: "${academicYear}" (end-year suffix should be ${pad2(expectedShort)})`)
  }
  return {
    start: new Date(Date.UTC(startYear, 7, 1)),       // 1 Aug startYear
    end: new Date(Date.UTC(startYear + 1, 6, 31)),    // 31 Jul startYear+1
  }
}

/**
 * Returns a list of academic-year options for dropdowns, current year first.
 *
 * @param count - number of years to return (default 5).
 * @param now - optional override for testing; defaults to new Date().
 */
export function getAcademicYearOptions(
  count: number = 5,
  now: Date = new Date(),
): { value: string; label: string }[] {
  if (!Number.isFinite(count) || count < 1) return []
  const startYear = startYearFrom(now)
  const out: { value: string; label: string }[] = []
  for (let i = 0; i < count; i += 1) {
    const ay = formatAcademicYear(startYear - i)
    out.push({ value: ay, label: ay })
  }
  return out
}

function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

function isInWindow(today: Date, w: TermWindow): boolean {
  const t = ymd(today)
  return t >= w.start && t <= w.end
}

function defaultTermFromMonth(monthIdx0: number): TermInfo | null {
  // Month index is 0-based: Jan = 0, Aug = 7.
  // Term 1: Aug-Oct (7,8,9). Term 2: Oct-Dec (10,11) -- Oct sits in T1 by default.
  // Term 3: Jan-Mar (0,1,2). Term 4: Apr-Jun (3,4,5). July (6) = holidays = null.
  if (monthIdx0 >= 7 && monthIdx0 <= 9) return { term: 1, label: TERM_LABELS[1] }
  if (monthIdx0 === 10 || monthIdx0 === 11) return { term: 2, label: TERM_LABELS[2] }
  if (monthIdx0 >= 0 && monthIdx0 <= 2) return { term: 3, label: TERM_LABELS[3] }
  if (monthIdx0 >= 3 && monthIdx0 <= 5) return { term: 4, label: TERM_LABELS[4] }
  return null
}

/**
 * Returns the current term given an optional LA term-dates configuration.
 * If termDates is supplied for the current academic year, exact dates win.
 * Otherwise falls back to month-based approximations. Returns null in July
 * (summer holidays) when no exact configuration matches.
 *
 * @param termDates - LA term-dates map keyed by academic year.
 * @param now - optional override for testing; defaults to new Date().
 */
export function getCurrentTerm(termDates?: TermDates, now: Date = new Date()): TermInfo | null {
  const ay = getCurrentAcademicYear(now)
  const cfg = termDates?.[ay]
  if (cfg) {
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    for (const t of [1, 2, 3, 4] as Term[]) {
      const key = `term_${t}` as const
      const w = cfg[key]
      if (w && isInWindow(today, w)) return { term: t, label: TERM_LABELS[t] }
    }
    return null // configured but today falls in a holiday gap
  }
  return defaultTermFromMonth(now.getUTCMonth())
}

/**
 * Returns the human-friendly label for a term number (1-4).
 * Throws if the number is out of range.
 */
export function getTermLabel(termNumber: number): string {
  if (termNumber === 1 || termNumber === 2 || termNumber === 3 || termNumber === 4) {
    return TERM_LABELS[termNumber]
  }
  throw new Error(`Invalid term number: ${termNumber} (expected 1-4)`)
}
