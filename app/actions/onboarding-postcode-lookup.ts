'use server'

import { getAnonSupabase } from '@/lib/supabase-public'
import {
  checkPostcodeExists,
  isValidUkPostcodeFormat,
  normalisePostcode,
  stripPostcode,
} from '@/lib/postcode-validation'

export type OnboardingPostcodeResult =
  | {
      status: 'ok'
      postcode: string
      simdDecile: number
      councilArea: string | null
    }
  | { status: 'invalid_format' }
  | { status: 'missing_simd'; postcode: string }
  | { status: 'not_scottish' }
  | { status: 'not_found' }
  | { status: 'server_error'; message: string }

export async function onboardingPostcodeLookupAction(
  rawPostcode: string,
): Promise<OnboardingPostcodeResult> {
  if (!isValidUkPostcodeFormat(rawPostcode ?? '')) {
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
    const { data: row, error } = await supabase
      .from('simd_postcodes')
      .select('postcode, simd_decile, council_area')
      .eq('postcode_normalised', stripped)
      .maybeSingle()

    if (error) {
      return {
        status: 'server_error',
        message: 'Something went wrong. Please try again.',
      }
    }

    if (row) {
      // simd_postcodes.council_area is currently NULL for all rows in the
      // live DB (data refresh gap -- see Phase 2 backlog). Fall back to
      // postcodes.io admin_district when the stored value is missing. Names
      // match the FSM-pilot council list verbatim, so no normalisation needed.
      let councilArea = row.council_area ?? null
      if (!councilArea) {
        const existsRes = await checkPostcodeExists(spaced)
        if (existsRes.exists && existsRes.scottish) {
          councilArea = existsRes.adminDistrict
        }
      }
      return {
        status: 'ok',
        postcode: spaced,
        simdDecile: row.simd_decile,
        councilArea,
      }
    }

    const existsRes = await checkPostcodeExists(spaced)
    if (existsRes.exists && existsRes.scottish) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      void (supabase as any).rpc('log_missing_postcode', {
        p_postcode: stripped,
        p_source: 'onboarding',
      })
      return { status: 'missing_simd', postcode: spaced }
    }
    if (existsRes.exists && !existsRes.scottish) {
      return { status: 'not_scottish' }
    }
    return { status: 'not_found' }
  } catch {
    return {
      status: 'server_error',
      message: 'Something went wrong. Please try again.',
    }
  }
}
