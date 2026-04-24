// Caseload-filter helpers used by API routes that serve a guidance
// teacher's visible student list. The DB function is_in_staff_caseload()
// is the authoritative filter for RLS; this module mirrors the logic in
// JavaScript for use inside service-role API routes (admin client bypasses
// RLS, so filters must be applied in application code).

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type StaffCaseload = {
  staffId: string
  userId: string
  role: string
  isAdmin: boolean
  canViewIndividualStudents: boolean
  caseloadYearGroups: string[] | null
  caseloadHouseGroups: string[] | null
}

export type StudentMin = {
  id: string
  school_id: string | null
  school_stage: string | null
  house_group: string | null
}

// Roles that see all students at the school regardless of caseload filters.
const WHOLE_SCHOOL_ROLES = new Set(['depute', 'head_teacher'])

export function canStaffSeeStudent(staff: StaffCaseload, student: StudentMin, staffSchoolId: string): boolean {
  if (staff.isAdmin) return true
  if (WHOLE_SCHOOL_ROLES.has(staff.role)) return true
  if (!staff.canViewIndividualStudents) return false

  if (student.school_id !== staffSchoolId) return false

  const ygFilter = staff.caseloadYearGroups
  const hgFilter = staff.caseloadHouseGroups

  if ((!ygFilter || ygFilter.length === 0) && (!hgFilter || hgFilter.length === 0)) {
    return true
  }

  if (ygFilter && ygFilter.length > 0) {
    if (!student.school_stage || !ygFilter.includes(student.school_stage)) return false
  }

  if (hgFilter && hgFilter.length > 0) {
    if (!student.house_group || !hgFilter.includes(student.house_group)) return false
  }

  return true
}

// Fetch every student at the school that the caller can see per their
// caseload filters. Uses the admin client so results don't depend on
// whoever happens to be reading.
export async function fetchCaseload(
  admin: SupabaseClient<Database>,
  staffUserId: string,
  schoolId: string
): Promise<{ staff: StaffCaseload; students: StudentMin[] }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staffRow } = await (admin as any)
    .from('school_staff')
    .select('id, user_id, role, is_school_admin, can_view_individual_students, caseload_year_groups, caseload_house_groups')
    .eq('user_id', staffUserId)
    .maybeSingle()

  const staff: StaffCaseload = {
    staffId: staffRow?.id ?? '',
    userId: staffRow?.user_id ?? staffUserId,
    role: staffRow?.role ?? '',
    isAdmin: !!staffRow?.is_school_admin,
    canViewIndividualStudents: !!staffRow?.can_view_individual_students,
    caseloadYearGroups: staffRow?.caseload_year_groups ?? null,
    caseloadHouseGroups: staffRow?.caseload_house_groups ?? null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', schoolId)

  const ids = ((links ?? []) as Array<{ student_id: string }>).map((r) => r.student_id)
  if (ids.length === 0) return { staff, students: [] }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentRows } = await (admin as any)
    .from('students')
    .select('id, school_id, school_stage, house_group')
    .in('id', ids)

  const students = (studentRows ?? []) as StudentMin[]
  return { staff, students: students.filter((s) => canStaffSeeStudent(staff, s, schoolId)) }
}
