import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

interface BursaryMatch {
  bursary_id: string
  name: string
  administering_body: string
  description: string | null
  award_type: string
  amount_description: string | null
  amount_max: number | null
  url: string | null
  application_deadline: string | null
  match_confidence: 'definite' | 'likely' | 'check_eligibility'
}

interface ProfileForCompleteness {
  postcode: string | null
  household_income_band: string | null
  school_stage: string | null
  care_experienced: boolean | null
  is_estranged: boolean | null
  is_carer: boolean | null
  is_young_carer: boolean
  has_disability: boolean
  is_refugee_or_asylum_seeker: boolean | null
  demographic_completed: boolean | null
}

// Profile is "complete enough" when the student has set demographic fields
// AND we know their postcode, stage, and income band — otherwise the
// matching engine will inevitably mark income/SIMD bursaries as
// check_eligibility, which we surface to the student as actionable.
function describeMissingProfile(profile: ProfileForCompleteness): string | null {
  const missing: string[] = []
  if (!profile.postcode) missing.push('postcode')
  if (!profile.school_stage) missing.push('school stage')
  if (!profile.household_income_band) missing.push('household income band')
  if (!profile.demographic_completed) missing.push('demographic questions')
  if (missing.length === 0) return null
  return `Complete your profile to see all bursaries you may be eligible for. Missing: ${missing.join(', ')}.`
}

export async function POST() {
  return handle()
}

export async function GET() {
  return handle()
}

async function handle() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = user.id

    // Pull the profile fields that drive the "complete your profile" hint.
    // The matching function reads the full record itself.
    const { data: profile, error: profileError } = await supabase
      .from('students')
      .select(
        'postcode, household_income_band, school_stage, care_experienced, is_estranged, is_carer, is_young_carer, has_disability, is_refugee_or_asylum_seeker, demographic_completed'
      )
      .eq('id', studentId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: matches, error: rpcError } = await (supabase as any).rpc(
      'match_bursaries_for_student',
      { target_student_id: studentId }
    )

    if (rpcError) {
      console.error('[bursaries/match] RPC error:', rpcError)
      return NextResponse.json(
        { error: 'Failed to match bursaries' },
        { status: 500 }
      )
    }

    const matchRows: BursaryMatch[] = matches ?? []

    // Persist matches so the student can track applied / dismissed status
    // across sessions. We only INSERT new matches; existing rows keep their
    // status (e.g. don't reset 'applied' back to 'eligible').
    if (matchRows.length > 0) {
      const upsertRows = matchRows.map((m) => ({
        student_id: studentId,
        bursary_id: m.bursary_id,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upsertError } = await (supabase as any)
        .from('student_bursary_matches')
        .upsert(upsertRows, {
          onConflict: 'student_id,bursary_id',
          ignoreDuplicates: true,
        })

      if (upsertError) {
        // Don't fail the request — the student still gets their matches even
        // if persistence fails. Log for diagnosis.
        console.error('[bursaries/match] upsert error:', upsertError)
      }
    }

    return NextResponse.json({
      matches: matchRows,
      total: matchRows.length,
      profile_message: describeMissingProfile(profile as ProfileForCompleteness),
    })
  } catch (err) {
    console.error('[bursaries/match] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
