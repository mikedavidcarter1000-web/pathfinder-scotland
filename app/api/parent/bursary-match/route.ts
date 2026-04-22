import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const url = new URL(req.url)
    const studentId = url.searchParams.get('student_id') ?? ''
    if (!UUID_RE.test(studentId)) {
      return NextResponse.json({ error: 'Invalid student id.' }, { status: 400 })
    }

    // Verify the caller is a linked parent of this student.
    // is_linked_parent is a SECURITY DEFINER function that reads auth.uid()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: linkedRaw, error: linkedErr } = await (supabase as any).rpc(
      'is_linked_parent',
      { p_student_id: studentId }
    )
    if (linkedErr) {
      console.error('[parent/bursary-match] is_linked_parent error:', linkedErr)
      return NextResponse.json({ error: 'Access check failed.' }, { status: 500 })
    }
    if (!linkedRaw) {
      return NextResponse.json({ error: 'Not linked to this student.' }, { status: 403 })
    }

    // Use the service-role client to read sensitive flags + bursaries.
    // Only the matched bursary list is returned to the parent -- never the
    // flag values that triggered the match.
    const admin = getAdminClient()
    if (!admin) {
      return NextResponse.json(
        { error: 'Server not configured.' },
        { status: 500 }
      )
    }

    const { data: student } = await admin
      .from('students')
      .select(
        'care_experienced, is_young_carer, is_carer, has_disability, is_estranged, is_refugee_or_asylum_seeker, is_young_parent, is_single_parent_household, simd_decile, household_income_band, receives_free_school_meals, receives_ema, school_stage'
      )
      .eq('id', studentId)
      .maybeSingle()

    if (!student) {
      return NextResponse.json({ matches: [] })
    }

    const { data: bursaries } = await admin
      .from('bursaries')
      .select(
        'id, name, administering_body, amount_description, amount_min, amount_max, award_type, is_repayable, requires_care_experience, requires_estranged, requires_carer, requires_young_carer, requires_disability, requires_refugee_or_asylum, requires_young_parent, requires_lone_parent, simd_quintile_max, income_threshold_max, is_government_scheme, is_universal, url, priority_score'
      )
      .eq('is_active', true)

    const simdQuintile =
      typeof student.simd_decile === 'number'
        ? Math.ceil(student.simd_decile / 2)
        : null

    const incomeMaxFor: Record<string, number> = {
      under_21000: 21000,
      '21000_24000': 24000,
      '24000_34000': 34000,
      '34000_45000': 45000,
      over_45000: 99999,
    }
    const approxIncome =
      student.household_income_band && student.household_income_band in incomeMaxFor
        ? incomeMaxFor[student.household_income_band]
        : null

    type Bursary = NonNullable<typeof bursaries>[number]
    const matches: Array<{
      id: string
      name: string
      administering_body: string
      amount_description: string | null
      award_type: string
      is_repayable: boolean
      url: string | null
    }> = []

    for (const b of (bursaries ?? []) as Bursary[]) {
      // Universal bursaries always match (e.g. SAAS Young Students' Bursary)
      if (b.is_universal) {
        matches.push({
          id: b.id,
          name: b.name,
          administering_body: b.administering_body,
          amount_description: b.amount_description,
          award_type: b.award_type,
          is_repayable: !!b.is_repayable,
          url: b.url,
        })
        continue
      }

      // Flag-gated requirements: if the bursary REQUIRES a flag, the student must have it.
      if (b.requires_care_experience && !student.care_experienced) continue
      if (b.requires_estranged && !student.is_estranged) continue
      if (b.requires_carer && !(student.is_carer || student.is_young_carer)) continue
      if (b.requires_young_carer && !student.is_young_carer) continue
      if (b.requires_disability && !student.has_disability) continue
      if (b.requires_refugee_or_asylum && !student.is_refugee_or_asylum_seeker) continue
      if (b.requires_young_parent && !student.is_young_parent) continue
      if (b.requires_lone_parent && !student.is_single_parent_household) continue

      // SIMD quintile threshold
      if (
        b.simd_quintile_max != null &&
        (simdQuintile == null || simdQuintile > b.simd_quintile_max)
      ) {
        continue
      }

      // Household income threshold
      if (
        b.income_threshold_max != null &&
        (approxIncome == null || approxIncome > b.income_threshold_max)
      ) {
        continue
      }

      matches.push({
        id: b.id,
        name: b.name,
        administering_body: b.administering_body,
        amount_description: b.amount_description,
        award_type: b.award_type,
        is_repayable: !!b.is_repayable,
        url: b.url,
      })
    }

    // Sort: grants first, then by administering body for stability
    matches.sort((a, b) => {
      const ap = a.is_repayable ? 1 : 0
      const bp = b.is_repayable ? 1 : 0
      if (ap !== bp) return ap - bp
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      matches,
      income_band: student.household_income_band ?? null,
      simd_decile: student.simd_decile ?? null,
      school_stage: student.school_stage ?? null,
    })
  } catch (err) {
    console.error('[parent/bursary-match] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
