import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { BursariesClient } from './bursaries-client'
import { TrackPageView } from '@/components/engagement/track-page-view'
import type { Bursary, BursaryMatch, StudentMatchRow, StudentProfile } from './types'

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
  care_experienced: boolean | null
  has_disability: boolean
  is_young_carer: boolean
  is_young_parent: boolean | null
  simd_decile: number | null
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
      'id, slug, name, administering_body, description, student_stages, award_type, amount_description, amount_min, amount_max, is_means_tested, is_repayable, application_process, application_deadline, url, notes, is_active, requires_care_experience, requires_estranged, requires_carer, requires_disability, requires_refugee_or_asylum, requires_young_parent, income_threshold_max, simd_quintile_max, min_age, max_age'
    )
    .eq('is_active', true)
    .order('amount_max', { ascending: false, nullsFirst: false })

  const bursaries: Bursary[] = (bursariesData ?? []) as Bursary[]

  if (!user) {
    return (
      <>
        <TrackPageView eventType="tool_use" eventCategory="bursary" />
        <BursariesClient loggedIn={false} bursaries={bursaries} />
      </>
    )
  }

  const { data: profile } = await sb
    .from('students')
    .select('postcode, household_income_band, school_stage, demographic_completed, care_experienced, has_disability, is_young_carer, is_young_parent, simd_decile')
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

  const profileData = profile as ProfileSummary | null
  const studentProfile: StudentProfile | null = profileData ? {
    school_stage: profileData.school_stage,
    care_experienced: profileData.care_experienced,
    has_disability: profileData.has_disability,
    is_young_carer: profileData.is_young_carer,
    is_young_parent: profileData.is_young_parent,
    simd_decile: profileData.simd_decile,
  } : null

  return (
    <>
      <TrackPageView eventType="tool_use" eventCategory="bursary" />
      <BursariesClient
        loggedIn={true}
        bursaries={bursaries}
        matches={matches}
        matchStatuses={statusByBursary}
        missingProfile={deriveMissingProfile(profileData)}
        matchError={matchError}
        studentProfile={studentProfile}
      />
    </>
  )
}
