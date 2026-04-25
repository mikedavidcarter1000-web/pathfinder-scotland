import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import {
  getAcademicYearDates,
  getCurrentAcademicYear,
  type TermDates,
  type TermDatesForYear,
  type TermWindow,
} from '@/lib/academic-year'

export const runtime = 'nodejs'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function isRealIsoDate(s: string): boolean {
  if (!ISO_DATE_RE.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  // Round-trip via Date.UTC: rejects 2026-02-31, 2026-13-01, 2026-00-10 etc.
  const dt = new Date(Date.UTC(y, m - 1, d))
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  )
}

function isWindow(v: unknown): v is TermWindow {
  if (!v || typeof v !== 'object') return false
  const w = v as { start?: unknown; end?: unknown }
  return (
    typeof w.start === 'string' &&
    isRealIsoDate(w.start) &&
    typeof w.end === 'string' &&
    isRealIsoDate(w.end) &&
    w.start <= w.end
  )
}

function validateTermsForYear(
  academicYear: string,
  cfg: TermDatesForYear,
): { ok: true } | { ok: false; error: string } {
  const order = ['term_1', 'term_2', 'term_3', 'term_4'] as const
  const present = order.filter((k) => cfg[k]).map((k) => ({ k, w: cfg[k]! }))

  for (const { k, w } of present) {
    if (!isWindow(w)) {
      return { ok: false, error: `${academicYear} ${k} must have real ISO start and end dates with start <= end` }
    }
  }

  // All term dates must fall within the academic year's 1 Aug -> 31 Jul span.
  // Catches stale config like 2025-26 term_1 with a 2026-08 start.
  const { start: yStart, end: yEnd } = getAcademicYearDates(academicYear)
  const yStartIso = yStart.toISOString().slice(0, 10)
  const yEndIso = yEnd.toISOString().slice(0, 10)
  for (const { k, w } of present) {
    if (w.start < yStartIso || w.end > yEndIso) {
      return {
        ok: false,
        error: `${academicYear} ${k} must fall within ${yStartIso}..${yEndIso}`,
      }
    }
  }

  // Pairwise non-overlap (only between configured terms; gaps are allowed).
  for (let i = 0; i < present.length; i += 1) {
    for (let j = i + 1; j < present.length; j += 1) {
      const a = present[i].w
      const b = present[j].w
      const overlap = a.start <= b.end && b.start <= a.end
      if (overlap) {
        return {
          ok: false,
          error: `${academicYear} terms must not overlap (${present[i].k} vs ${present[j].k})`,
        }
      }
    }
  }

  // Term 1 starts in August.
  if (cfg.term_1) {
    const month = Number(cfg.term_1.start.slice(5, 7))
    if (month !== 8) {
      return { ok: false, error: `${academicYear} term_1 start must be in August (got month ${month})` }
    }
  }

  // Term 4 ends in June or July.
  if (cfg.term_4) {
    const month = Number(cfg.term_4.end.slice(5, 7))
    if (month !== 6 && month !== 7) {
      return { ok: false, error: `${academicYear} term_4 end must be in June or July (got month ${month})` }
    }
  }

  return { ok: true }
}

function validateTermDates(payload: unknown): { ok: true; value: TermDates } | { ok: false; error: string } {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'term_dates must be an object keyed by academic year' }
  }
  const out: TermDates = {}
  for (const [year, raw] of Object.entries(payload as Record<string, unknown>)) {
    // Round-trip through getAcademicYearDates so the suffix-rollover is checked
    // (2025-27 etc. must reject) rather than a shape-only regex.
    try {
      getAcademicYearDates(year)
    } catch {
      return { ok: false, error: `Invalid academic-year key: "${year}" (expected "YYYY-YY" with valid suffix)` }
    }
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: `Value for ${year} must be an object` }
    }
    const cfg: TermDatesForYear = {}
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (k !== 'term_1' && k !== 'term_2' && k !== 'term_3' && k !== 'term_4') {
        return { ok: false, error: `Unknown term key "${k}" in ${year}` }
      }
      if (v == null) continue
      if (!isWindow(v)) {
        return { ok: false, error: `${year}.${k} must be { start: "YYYY-MM-DD", end: "YYYY-MM-DD" } with real dates and start <= end` }
      }
      cfg[k] = v
    }
    const check = validateTermsForYear(year, cfg)
    if (!check.ok) return { ok: false, error: check.error }
    out[year] = cfg
  }
  return { ok: true, value: out }
}

export async function GET() {
  const guard = await requireAuthorityStaffApi({ mustBeAdmin: true, mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('local_authorities')
    .select('term_dates')
    .eq('id', ctx.authorityId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const currentYear = getCurrentAcademicYear()
  const startYear = Number(currentYear.slice(0, 4))
  const nextYear = `${startYear + 1}-${String((startYear + 2) % 100).padStart(2, '0')}`

  return NextResponse.json({
    currentYear,
    nextYear,
    termDates: (data?.term_dates ?? {}) as TermDates,
  })
}

export async function PUT(req: Request) {
  const guard = await requireAuthorityStaffApi({ mustBeAdmin: true, mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = (body as { term_dates?: unknown })?.term_dates
  const v = validateTermDates(payload)
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('local_authorities')
    .update({ term_dates: v.value, updated_at: new Date().toISOString() })
    .eq('id', ctx.authorityId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, termDates: v.value })
}
