import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  getCurrentAcademicYear,
  getAcademicYearDates,
  getAcademicYearOptions,
  getCurrentTerm,
  getTermLabel,
  type TermDates,
} from '../academic-year'

// All Date constructors below use Date.UTC to keep tests timezone-independent.

describe('getCurrentAcademicYear', () => {
  it('returns "2025-26" for 25 April 2026 (mid-spring of 2025-26)', () => {
    assert.equal(getCurrentAcademicYear(new Date(Date.UTC(2026, 3, 25))), '2025-26')
  })

  it('returns "2026-27" for 1 August 2026 (first day of new year)', () => {
    assert.equal(getCurrentAcademicYear(new Date(Date.UTC(2026, 7, 1))), '2026-27')
  })

  it('returns "2025-26" for 31 July 2026 (last day of old year)', () => {
    assert.equal(getCurrentAcademicYear(new Date(Date.UTC(2026, 6, 31))), '2025-26')
  })

  it('returns "2025-26" for 1 July 2026 (mid-summer holidays)', () => {
    assert.equal(getCurrentAcademicYear(new Date(Date.UTC(2026, 6, 1))), '2025-26')
  })

  it('zero-pads single-digit end years (1999-00)', () => {
    assert.equal(getCurrentAcademicYear(new Date(Date.UTC(1999, 8, 15))), '1999-00')
  })

  it('handles century roll-over (2000-01)', () => {
    assert.equal(getCurrentAcademicYear(new Date(Date.UTC(2000, 8, 15))), '2000-01')
  })

  it('handles a leap-year February without changing the academic year', () => {
    assert.equal(getCurrentAcademicYear(new Date(Date.UTC(2024, 1, 29))), '2023-24')
  })
})

describe('getAcademicYearDates', () => {
  it('returns 2025-08-01 to 2026-07-31 for "2025-26"', () => {
    const { start, end } = getAcademicYearDates('2025-26')
    assert.equal(start.toISOString().slice(0, 10), '2025-08-01')
    assert.equal(end.toISOString().slice(0, 10), '2026-07-31')
  })

  it('returns 1999-08-01 to 2000-07-31 for "1999-00" (century roll)', () => {
    const { start, end } = getAcademicYearDates('1999-00')
    assert.equal(start.toISOString().slice(0, 10), '1999-08-01')
    assert.equal(end.toISOString().slice(0, 10), '2000-07-31')
  })

  it('throws on malformed input', () => {
    assert.throws(() => getAcademicYearDates('2025/26'), /Invalid academic year format/)
    assert.throws(() => getAcademicYearDates('25-26'), /Invalid academic year format/)
    assert.throws(() => getAcademicYearDates(''), /Invalid academic year format/)
  })

  it('throws when end-year suffix does not follow start year', () => {
    assert.throws(() => getAcademicYearDates('2025-27'), /end-year suffix should be 26/)
  })
})

describe('getAcademicYearOptions', () => {
  it('returns 5 years by default with current year first', () => {
    const opts = getAcademicYearOptions(undefined, new Date(Date.UTC(2026, 3, 25)))
    assert.equal(opts.length, 5)
    assert.deepEqual(
      opts.map((o) => o.value),
      ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'],
    )
    assert.equal(opts[0].label, '2025-26')
  })

  it('honours an explicit count', () => {
    const opts = getAcademicYearOptions(3, new Date(Date.UTC(2026, 7, 1)))
    assert.deepEqual(
      opts.map((o) => o.value),
      ['2026-27', '2025-26', '2024-25'],
    )
  })

  it('returns [] for non-positive count', () => {
    assert.deepEqual(getAcademicYearOptions(0), [])
    assert.deepEqual(getAcademicYearOptions(-3), [])
  })
})

describe('getCurrentTerm (default month-based)', () => {
  const cases: Array<[number, number, number, string | null]> = [
    [2026, 7, 1, 'Autumn'],   // 1 Aug = T1
    [2026, 8, 1, 'Autumn'],   // mid-Sep = T1
    [2026, 9, 1, 'Autumn'],   // Oct = T1 by default
    [2026, 10, 15, 'Winter'], // Nov = T2
    [2026, 11, 19, 'Winter'], // Dec = T2
    [2026, 0, 6, 'Spring'],   // Jan = T3
    [2026, 2, 27, 'Spring'],  // Mar = T3
    [2026, 3, 14, 'Summer'],  // Apr = T4
    [2026, 5, 26, 'Summer'],  // Jun = T4
    [2026, 6, 15, null],      // Jul = holidays
  ]
  for (const [y, m, d, expected] of cases) {
    it(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')} => ${expected ?? 'null'}`, () => {
      const result = getCurrentTerm(undefined, new Date(Date.UTC(y, m, d)))
      assert.equal(result?.label ?? null, expected)
    })
  }
})

describe('getCurrentTerm (LA-configured)', () => {
  const cfg: TermDates = {
    '2025-26': {
      term_1: { start: '2025-08-19', end: '2025-10-10' },
      term_2: { start: '2025-10-27', end: '2025-12-19' },
      term_3: { start: '2026-01-06', end: '2026-03-27' },
      term_4: { start: '2026-04-14', end: '2026-06-26' },
    },
  }

  it('returns Spring on 6 January 2026 (term_3 start)', () => {
    assert.equal(getCurrentTerm(cfg, new Date(Date.UTC(2026, 0, 6)))?.label, 'Spring')
  })

  it('returns Spring on 27 March 2026 (term_3 last day)', () => {
    assert.equal(getCurrentTerm(cfg, new Date(Date.UTC(2026, 2, 27)))?.label, 'Spring')
  })

  it('returns null in the Easter holiday gap (28 Mar to 13 Apr 2026)', () => {
    assert.equal(getCurrentTerm(cfg, new Date(Date.UTC(2026, 2, 30))), null)
    assert.equal(getCurrentTerm(cfg, new Date(Date.UTC(2026, 3, 13))), null)
  })

  it('returns null in the August pre-term window (1 Aug to 18 Aug 2025)', () => {
    assert.equal(getCurrentTerm(cfg, new Date(Date.UTC(2025, 7, 1))), null)
    assert.equal(getCurrentTerm(cfg, new Date(Date.UTC(2025, 7, 18))), null)
  })

  it('falls back to month-based approximation when no config exists for the current year', () => {
    assert.equal(getCurrentTerm(cfg, new Date(Date.UTC(2030, 1, 15)))?.label, 'Spring')
  })
})

describe('getTermLabel', () => {
  it('maps 1-4 to Autumn/Winter/Spring/Summer', () => {
    assert.equal(getTermLabel(1), 'Autumn')
    assert.equal(getTermLabel(2), 'Winter')
    assert.equal(getTermLabel(3), 'Spring')
    assert.equal(getTermLabel(4), 'Summer')
  })

  it('throws for out-of-range values', () => {
    assert.throws(() => getTermLabel(0), /Invalid term number/)
    assert.throws(() => getTermLabel(5), /Invalid term number/)
    assert.throws(() => getTermLabel(1.5), /Invalid term number/)
  })
})
