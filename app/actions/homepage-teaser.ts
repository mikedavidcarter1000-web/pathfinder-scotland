'use server'

import { getAnonSupabase } from '@/lib/supabase-public'

export type HomepageTeaserResult =
  | {
      ok: true
      postcode: string
      yearGroup: string
      simdDecile: number
      simdQuintile: number
      bursaryCount: number
      wideningAccessCourseCount: number
      sectorSamples: Array<{ id: string; name: string }>
    }
  | {
      ok: false
      error: 'invalid_postcode' | 'not_found' | 'server_error'
      message: string
    }

const VALID_YEAR_GROUPS = new Set(['S2', 'S3', 'S4', 'S5', 'S6'])

function normalisePostcode(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase()
}

function decileToQuintile(decile: number): number {
  return Math.ceil(decile / 2)
}

function pickRandom<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items.slice()
  const pool = items.slice()
  const out: T[] = []
  for (let i = 0; i < count; i += 1) {
    const idx = Math.floor(Math.random() * pool.length)
    out.push(pool.splice(idx, 1)[0]!)
  }
  return out
}

function countWaCoursesForDecile(
  waRows: Array<{ widening_access_requirements: unknown }>,
  decile: number,
): number {
  if (decile > 4) return 0
  let count = 0
  for (const row of waRows) {
    const wa = row.widening_access_requirements
    if (wa == null || typeof wa !== 'object' || Array.isArray(wa)) continue
    const obj = wa as Record<string, unknown>
    const hasSimd40 = typeof obj.simd40_offer === 'string' && obj.simd40_offer.length > 0
    const hasSimd20 = typeof obj.simd20_offer === 'string' && obj.simd20_offer.length > 0
    if (decile <= 2 && (hasSimd20 || hasSimd40)) count += 1
    else if (decile <= 4 && hasSimd40) count += 1
  }
  return count
}

export async function homepageTeaserAction(input: {
  postcode: string
  yearGroup: string
}): Promise<HomepageTeaserResult> {
  const postcode = normalisePostcode(input.postcode ?? '')
  const yearGroup = (input.yearGroup ?? '').trim().toUpperCase()

  if (postcode.length < 5 || postcode.length > 8 || !VALID_YEAR_GROUPS.has(yearGroup)) {
    return {
      ok: false,
      error: 'invalid_postcode',
      message: 'Please enter a valid UK postcode and year group.',
    }
  }

  const supabase = getAnonSupabase()
  if (!supabase) {
    return {
      ok: false,
      error: 'server_error',
      message: 'We could not reach our database. Please try again in a moment.',
    }
  }

  try {
    const { data: postcodeRow, error: postcodeError } = await supabase
      .from('simd_postcodes')
      .select('postcode, simd_decile')
      .eq('postcode', postcode)
      .maybeSingle()

    if (postcodeError) {
      return {
        ok: false,
        error: 'server_error',
        message: 'Something went wrong. Please try again.',
      }
    }

    if (!postcodeRow) {
      return {
        ok: false,
        error: 'not_found',
        message: "We couldn't find that postcode. Please double-check and try again.",
      }
    }

    const simdDecile = postcodeRow.simd_decile
    const simdQuintile = decileToQuintile(simdDecile)

    const [bursariesRes, coursesRes, sectorsRes] = await Promise.all([
      supabase
        .from('bursaries')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .or(`simd_quintile_max.is.null,simd_quintile_max.gte.${simdQuintile}`),
      supabase
        .from('courses')
        .select('widening_access_requirements')
        .not('widening_access_requirements', 'is', null),
      supabase
        .from('career_sectors')
        .select('id, name')
        .order('display_order', { ascending: true, nullsFirst: false })
        .limit(20),
    ])

    const wideningAccessCourseCount = countWaCoursesForDecile(
      coursesRes.data ?? [],
      simdDecile,
    )

    const sectorSamples = pickRandom(sectorsRes.data ?? [], 3)

    return {
      ok: true,
      postcode,
      yearGroup,
      simdDecile,
      simdQuintile,
      bursaryCount: bursariesRes.count ?? 0,
      wideningAccessCourseCount,
      sectorSamples,
    }
  } catch {
    return {
      ok: false,
      error: 'server_error',
      message: 'Something went wrong. Please try again.',
    }
  }
}
