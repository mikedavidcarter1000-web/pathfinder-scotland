'use server'

import { getAnonSupabase } from '@/lib/supabase-public'
import {
  checkPostcodeExists,
  isValidUkPostcodeFormat,
  normalisePostcode,
  stripPostcode,
} from '@/lib/postcode-validation'

export type HomepageTeaserResult =
  | {
      status: 'ok'
      postcode: string
      yearGroup: string
      simdDecile: number
      simdQuintile: number
      bursaryCount: number
      simd20CourseCount: number
      simd40CourseCount: number
      sectorSamples: Array<{ id: string; name: string }>
    }
  | { status: 'invalid_format' }
  | { status: 'missing_simd'; postcode: string; yearGroup: string }
  | { status: 'not_scottish' }
  | { status: 'not_found' }
  | { status: 'server_error'; message: string }

const VALID_YEAR_GROUPS = new Set(['S2', 'S3', 'S4', 'S5', 'S6'])

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

function countWaCourses(
  waRows: Array<{ widening_access_requirements: unknown }>,
): { simd20CourseCount: number; simd40CourseCount: number } {
  let simd20CourseCount = 0
  let simd40CourseCount = 0
  for (const row of waRows) {
    const wa = row.widening_access_requirements
    if (wa == null || typeof wa !== 'object' || Array.isArray(wa)) continue
    const obj = wa as Record<string, unknown>
    if (obj.simd20_offer != null && obj.simd20_offer !== '') simd20CourseCount += 1
    if (obj.simd40_offer != null && obj.simd40_offer !== '') simd40CourseCount += 1
  }
  return { simd20CourseCount, simd40CourseCount }
}

export async function homepageTeaserAction(input: {
  postcode: string
  yearGroup: string
}): Promise<HomepageTeaserResult> {
  const yearGroup = (input.yearGroup ?? '').trim().toUpperCase()
  const rawPostcode = input.postcode ?? ''

  if (!VALID_YEAR_GROUPS.has(yearGroup)) {
    return { status: 'invalid_format' }
  }

  if (!isValidUkPostcodeFormat(rawPostcode)) {
    return { status: 'invalid_format' }
  }

  const spaced = normalisePostcode(rawPostcode)
  const stripped = stripPostcode(rawPostcode)

  const supabase = getAnonSupabase()
  if (!supabase) {
    return {
      status: 'server_error',
      message: 'We could not reach our database. Please try again in a moment.',
    }
  }

  try {
    const { data: postcodeRow, error: postcodeError } = await supabase
      .from('simd_postcodes')
      .select('postcode, simd_decile')
      .eq('postcode_normalised', stripped)
      .maybeSingle()

    if (postcodeError) {
      return {
        status: 'server_error',
        message: 'Something went wrong. Please try again.',
      }
    }

    if (!postcodeRow) {
      const existsRes = await checkPostcodeExists(spaced)
      if (existsRes.exists && existsRes.scottish) {
        // Valid Scottish postcode, just missing from our SIMD seed.
        // Fire-and-forget log; ignore errors so the UX flow never blocks.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        void (supabase as any).rpc('log_missing_postcode', {
          p_postcode: stripped,
          p_source: 'homepage_teaser',
        })
        return { status: 'missing_simd', postcode: spaced, yearGroup }
      }
      if (existsRes.exists && !existsRes.scottish) {
        return { status: 'not_scottish' }
      }
      return { status: 'not_found' }
    }

    const simdDecile = postcodeRow.simd_decile
    const simdQuintile = decileToQuintile(simdDecile)

    const youngerStage = yearGroup === 'S2' || yearGroup === 'S3'

    // For S2/S3 we also pull role tiers so we can filter out sectors where
    // every role is 'specialised'. NULL maturity_tier is treated as "not
    // specialised" -- 220/269 roles are currently unrated, so a strict
    // filter would collapse the pool. Curating those rows is a phase-2
    // task; see docs/phase-2-backlog.md.
    const [bursariesRes, coursesRes, sectorsRes, rolesRes] = await Promise.all([
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
      youngerStage
        ? supabase.from('career_roles').select('career_sector_id, maturity_tier')
        : Promise.resolve({ data: null, error: null }),
    ])

    let sectorsForPool = sectorsRes.data ?? []
    if (youngerStage && rolesRes.data) {
      const accessible = new Set<string>()
      for (const role of rolesRes.data) {
        if (role.maturity_tier !== 'specialised') {
          accessible.add(role.career_sector_id)
        }
      }
      sectorsForPool = sectorsForPool.filter((s) => accessible.has(s.id))
    }

    const { simd20CourseCount, simd40CourseCount } = countWaCourses(
      coursesRes.data ?? [],
    )

    const sectorSamples = pickRandom(sectorsForPool, 3)

    return {
      status: 'ok',
      postcode: spaced,
      yearGroup,
      simdDecile,
      simdQuintile,
      bursaryCount: bursariesRes.count ?? 0,
      simd20CourseCount,
      simd40CourseCount,
      sectorSamples,
    }
  } catch {
    return {
      status: 'server_error',
      message: 'Something went wrong. Please try again.',
    }
  }
}
