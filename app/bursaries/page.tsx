import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { BursariesClient } from './bursaries-client'
import type { Bursary, BursaryMatch, StudentMatchRow } from './types'

export const metadata: Metadata = {
  title: 'Find funding you\'re eligible for',
  description:
    'We check your profile against every bursary, grant, and entitlement available to Scottish students so you don\'t miss out.',
  openGraph: {
    title: 'Bursaries & funding for Scottish students | Pathfinder Scotland',
    description:
      'Discover bursaries, grants, and entitlements you\'re eligible for — from EMA to SAAS bursaries and charitable trust scholarships.',
  },
  alternates: {
    canonical: '/bursaries',
  },
}

interface ProfileSummary {
  postcode: string | null
  household_income_band: string | null
  school_stage: string | null
  demographic_completed: boolean | null
}

function deriveMissingProfile(p: ProfileSummary | null): string[] {
  if (!p) return []
  const missing: string[] = []
  if (!p.postcode) missing.push('Add your postcode to check SIMD-based support')
  if (!p.school_stage) missing.push('Tell us your school/study stage')
  if (!p.household_income_band) missing.push('Add your household income band to unlock means-tested matches')
  if (!p.demographic_completed) missing.push('Answer the circumstances questions to unlock more results')
  return missing
}

export default async function BursariesPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: bursariesData } = await sb
    .from('bursaries')
    .select(
      'id, name, administering_body, description, student_stages, award_type, amount_description, amount_min, amount_max, is_means_tested, is_repayable, application_process, application_deadline, url, notes, is_active'
    )
    .eq('is_active', true)
    .order('amount_max', { ascending: false, nullsFirst: false })

  const bursaries: Bursary[] = (bursariesData ?? []) as Bursary[]

  if (!user) {
    return <BursariesClient loggedIn={false} bursaries={bursaries} />
  }

  const { data: profile } = await sb
    .from('students')
    .select('postcode, household_income_band, school_stage, demographic_completed')
    .eq('id', user.id)
    .single()

  const { data: matchesData, error: rpcError } = await sb.rpc(
    'match_bursaries_for_student',
    { target_student_id: user.id }
  )

  let matches: BursaryMatch[] = []
  let matchError: string | null = null
  if (rpcError) {
    console.error('[bursaries] RPC error:', rpcError)
    matchError = 'We couldn\'t run the matching engine right now — here\'s the full list of available support.'
  } else {
    matches = (matchesData ?? []) as BursaryMatch[]
  }

  // Persist match rows for tracking (ignore duplicates, don't overwrite status).
  if (matches.length > 0) {
    await sb.from('student_bursary_matches').upsert(
      matches.map((m) => ({ student_id: user.id, bursary_id: m.bursary_id })),
      { onConflict: 'student_id,bursary_id', ignoreDuplicates: true }
    )
  }

  const { data: existingMatchRows } = await sb
    .from('student_bursary_matches')
    .select('bursary_id, match_status')
    .eq('student_id', user.id)

  const statusByBursary: StudentMatchRow[] = (existingMatchRows ?? []) as StudentMatchRow[]

  return (
    <BursariesClient
      loggedIn={true}
      bursaries={bursaries}
      matches={matches}
      matchStatuses={statusByBursary}
      missingProfile={deriveMissingProfile(profile as ProfileSummary | null)}
      matchError={matchError}
    />
  )
}
