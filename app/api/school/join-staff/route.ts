import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { INDIVIDUAL_VIEW_ROLES, type SchoolStaffRole } from '@/lib/school/constants'

export const runtime = 'nodejs'

const VALID_ROLES: SchoolStaffRole[] = [
  'guidance_teacher',
  'pt_guidance',
  'dyw_coordinator',
  'depute',
  'head_teacher',
  'admin',
]

// POST body: { schoolSlug, role, fullName }
// Caller must be authenticated. Creates a school_staff row tying the user to
// the school identified by slug. Intended for use after an email invite.
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

    const body = (await req.json().catch(() => null)) as {
      schoolSlug?: unknown
      role?: unknown
      fullName?: unknown
    } | null
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

    const schoolSlug = typeof body.schoolSlug === 'string' ? body.schoolSlug : ''
    const role = typeof body.role === 'string' ? body.role : ''
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''

    if (!schoolSlug || !VALID_ROLES.includes(role as SchoolStaffRole) || !fullName) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: school } = await (admin as any)
      .from('schools')
      .select('id')
      .eq('slug', schoolSlug)
      .maybeSingle()
    if (!school) {
      return NextResponse.json({ error: 'School not found.' }, { status: 404 })
    }

    const canIndividual = (INDIVIDUAL_VIEW_ROLES as string[]).includes(role)
    const isAdmin = role === 'admin'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: staffErr } = await (admin as any).from('school_staff').upsert(
      {
        user_id: user.id,
        school_id: school.id,
        full_name: fullName,
        email: user.email ?? '',
        role,
        is_school_admin: isAdmin,
        can_view_individual_students: canIndividual || isAdmin,
      },
      { onConflict: 'user_id,school_id' }
    )

    if (staffErr) {
      console.error('[school/join-staff] upsert failed:', staffErr)
      return NextResponse.json({ error: 'Could not link you to the school.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, schoolId: school.id })
  } catch (err) {
    console.error('[school/join-staff] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
