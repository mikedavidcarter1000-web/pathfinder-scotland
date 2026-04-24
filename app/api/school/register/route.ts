import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { generateInitialJoinCode, saltJoinCode, slugifySchoolName } from '@/lib/school/join-code'
import { FOUNDING_SCHOOLS_CAP, TRIAL_MONTHS, STAFF_ROLE_LABELS, type SchoolStaffRole } from '@/lib/school/constants'

export const runtime = 'nodejs'

const VALID_ROLES: SchoolStaffRole[] = [
  'guidance_teacher',
  'pt_guidance',
  'dyw_coordinator',
  'depute',
  'head_teacher',
  'admin',
]

type RegisterBody = {
  schoolName?: unknown
  localAuthority?: unknown
  postcode?: unknown
  seedCode?: unknown
  schoolType?: unknown
  contactName?: unknown
  contactRole?: unknown
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const admin = getAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    const body = (await req.json().catch(() => null)) as RegisterBody | null
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const schoolName = typeof body.schoolName === 'string' ? body.schoolName.trim() : ''
    const contactName = typeof body.contactName === 'string' ? body.contactName.trim() : ''
    const contactRole = typeof body.contactRole === 'string' ? body.contactRole : ''
    const localAuthority = typeof body.localAuthority === 'string' ? body.localAuthority.trim() : ''
    const postcode = typeof body.postcode === 'string' ? body.postcode.trim().toUpperCase() : ''
    const seedCode = typeof body.seedCode === 'string' ? body.seedCode.trim() : ''
    const schoolType = typeof body.schoolType === 'string' ? body.schoolType : 'secondary'

    if (!schoolName || schoolName.length < 2) {
      return NextResponse.json({ error: 'School name is required.' }, { status: 400 })
    }
    if (!contactName) {
      return NextResponse.json({ error: 'Contact name is required.' }, { status: 400 })
    }
    if (!VALID_ROLES.includes(contactRole as SchoolStaffRole)) {
      return NextResponse.json({ error: 'Select a valid role.' }, { status: 400 })
    }
    if (!localAuthority) {
      return NextResponse.json({ error: 'Select a local authority.' }, { status: 400 })
    }

    // Prevent the same user registering twice
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingStaff } = await (admin as any)
      .from('school_staff')
      .select('school_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (existingStaff) {
      return NextResponse.json(
        { error: 'You are already linked to a school. Sign in to reach your dashboard.' },
        { status: 409 }
      )
    }

    // Founding school logic: first 10 active/trial schools qualify
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: activeCount } = await (admin as any)
      .from('schools')
      .select('id', { count: 'exact', head: true })
      .in('subscription_status', ['trial', 'active'])
      .eq('is_founding_school', true)

    const isFounding = (activeCount ?? 0) < FOUNDING_SCHOOLS_CAP

    // Generate unique slug and join code
    const baseSlug = slugifySchoolName(schoolName)
    let slug = baseSlug
    let suffix = 0
    for (;;) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: clash } = await (admin as any)
        .from('schools')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      if (!clash) break
      suffix += 1
      slug = `${baseSlug}-${suffix}`
      if (suffix > 50) {
        return NextResponse.json({ error: 'Could not generate a unique slug.' }, { status: 500 })
      }
    }

    const baseCode = generateInitialJoinCode(schoolName)
    let joinCode = baseCode
    for (let i = 0; i < 20; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: clash } = await (admin as any)
        .from('school_join_codes')
        .select('id')
        .eq('code', joinCode)
        .maybeSingle()
      if (!clash) break
      joinCode = saltJoinCode(baseCode)
    }

    const now = new Date()
    const trialExpires = new Date(now)
    trialExpires.setMonth(trialExpires.getMonth() + TRIAL_MONTHS)

    // Resolve Scotland territory id. Pathfinder is Scotland-only at the
    // pilot stage; the territory FK makes the data model extensible to
    // other nations without a schema rewrite.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: territoryRow } = await (admin as any)
      .from('territories')
      .select('id')
      .eq('code', 'SCO')
      .maybeSingle()
    const territoryId = territoryRow?.id ?? null

    // Create school
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: school, error: schoolErr } = await (admin as any)
      .from('schools')
      .insert({
        name: schoolName,
        slug,
        territory_id: territoryId,
        local_authority: localAuthority,
        postcode: postcode || null,
        seed_code: seedCode || null,
        school_type: schoolType,
        subscription_status: 'trial',
        subscription_tier: 'trial',
        is_founding_school: isFounding,
        trial_started_at: now.toISOString(),
        trial_expires_at: trialExpires.toISOString(),
      })
      .select('id, slug')
      .single()

    if (schoolErr || !school) {
      console.error('[school/register] create school failed:', schoolErr)
      return NextResponse.json({ error: 'Could not create school.' }, { status: 500 })
    }

    // Create staff row: registering user is the school's first admin and
    // gets every permission regardless of their stated role.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: staffErr } = await (admin as any).from('school_staff').insert({
      user_id: user.id,
      school_id: school.id,
      full_name: contactName,
      email: user.email ?? '',
      role: contactRole,
      is_school_admin: true,
      can_view_individual_students: true,
      can_view_tracking: true,
      can_edit_tracking: true,
      can_view_guidance_notes: true,
      can_edit_guidance_notes: true,
      can_view_analytics: true,
      can_manage_school: true,
    })
    if (staffErr) {
      console.error('[school/register] create staff failed:', staffErr)
      return NextResponse.json({ error: 'Could not create staff record.' }, { status: 500 })
    }

    // Create initial join code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('school_join_codes').insert({
      school_id: school.id,
      code: joinCode,
      is_active: true,
    })

    return NextResponse.json({
      ok: true,
      schoolId: school.id,
      slug: school.slug,
      isFounding,
      joinCode,
      trialExpiresAt: trialExpires.toISOString(),
      roleLabel: STAFF_ROLE_LABELS[contactRole as SchoolStaffRole],
    })
  } catch (err) {
    console.error('[school/register] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET returns count of founding places remaining (public).
export async function GET() {
  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ remaining: FOUNDING_SCHOOLS_CAP, cap: FOUNDING_SCHOOLS_CAP })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (admin as any)
    .from('schools')
    .select('id', { count: 'exact', head: true })
    .eq('is_founding_school', true)
    .in('subscription_status', ['trial', 'active'])
  const taken = count ?? 0
  return NextResponse.json({
    remaining: Math.max(FOUNDING_SCHOOLS_CAP - taken, 0),
    cap: FOUNDING_SCHOOLS_CAP,
    taken,
  })
}
