import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type StaffContext = {
  staffId: string
  userId: string
  email: string
  schoolId: string
  isAdmin: boolean
  canViewIndividualStudents: boolean
  canEditTracking: boolean
  canManageTracking: boolean
  role: string
  fullName: string
  department: string | null
}

/**
 * API-route guard for school staff. Verifies sign-in + school_staff row.
 * Returns either { ok: true, ctx, admin } where admin is a service-role
 * client, or a NextResponse error to return as-is.
 */
export async function requireSchoolStaffApi(opts?: {
  mustBeAdmin?: boolean
  mustViewStudents?: boolean
  mustEditTracking?: boolean
  mustManageTracking?: boolean
}): Promise<
  | { ok: true; ctx: StaffContext; admin: SupabaseClient<Database> }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (supabase as any)
    .from('school_staff')
    .select('id, user_id, school_id, email, full_name, role, department, is_school_admin, can_view_individual_students, can_edit_tracking, can_manage_tracking')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) {
    return { ok: false, response: NextResponse.json({ error: 'Not a school staff member' }, { status: 403 }) }
  }

  if (opts?.mustBeAdmin && !staff.is_school_admin) {
    return { ok: false, response: NextResponse.json({ error: 'School admin only' }, { status: 403 }) }
  }

  if (opts?.mustViewStudents && !staff.can_view_individual_students) {
    return { ok: false, response: NextResponse.json({ error: 'Individual-student view not permitted for your role' }, { status: 403 }) }
  }

  if (opts?.mustEditTracking && !staff.can_edit_tracking && !staff.is_school_admin) {
    return { ok: false, response: NextResponse.json({ error: 'Tracking edit not permitted for your role' }, { status: 403 }) }
  }

  if (opts?.mustManageTracking && !staff.can_manage_tracking && !staff.is_school_admin) {
    return { ok: false, response: NextResponse.json({ error: 'Tracking management not permitted for your role' }, { status: 403 }) }
  }

  const admin = getAdminClient()
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Service role key not configured' }, { status: 500 }),
    }
  }

  return {
    ok: true,
    ctx: {
      staffId: staff.id,
      userId: user.id,
      email: user.email ?? '',
      schoolId: staff.school_id,
      isAdmin: !!staff.is_school_admin,
      canViewIndividualStudents: !!staff.can_view_individual_students,
      canEditTracking: !!staff.can_edit_tracking,
      canManageTracking: !!staff.can_manage_tracking,
      role: staff.role,
      fullName: staff.full_name,
      department: staff.department ?? null,
    },
    admin,
  }
}
