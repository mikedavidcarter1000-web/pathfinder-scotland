import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Prep snapshot captured at booking time and rendered on the teacher's
// schedule print. Kept small (one JSONB column) but complete enough that a
// teacher doesn't need to tab back to the grade grid during a 5-minute slot.

export type PrepSnapshot = {
  student: {
    id: string
    first_name: string | null
    last_name: string | null
    school_stage: string | null
    registration_class: string | null
    attendance_pct: number | null
  }
  subjects: Array<{
    subject: string
    working_grade: string | null
    on_track: string | null
    effort: string | null
  }>
  saved_courses: Array<{ title: string; university: string; eligibility: string | null }>
  active_flags: string[]
}

// Compile a prep snapshot for (student, school). Uses the current tracking
// cycle's entries for the student; non-cycle classes or empty entries
// simply don't appear.
export async function buildPrepSnapshot(
  admin: SupabaseClient<Database>,
  schoolId: string,
  studentId: string
): Promise<PrepSnapshot | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, school_stage, registration_class, attendance_pct, care_experienced, receives_free_school_meals, is_young_carer, has_asn')
    .eq('id', studentId)
    .maybeSingle()
  if (!student) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cycle } = await (admin as any)
    .from('tracking_cycles')
    .select('id')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .maybeSingle()

  let subjects: PrepSnapshot['subjects'] = []
  if (cycle) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: entries } = await (admin as any)
      .from('tracking_entries')
      .select(
        `working_grade, on_track, effort,
         class_assignments:class_assignment_id (subjects:subject_id(name))`
      )
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .eq('cycle_id', cycle.id)
    type Entry = {
      working_grade: string | null
      on_track: string | null
      effort: string | null
      class_assignments: { subjects: { name: string } | null } | null
    }
    subjects = ((entries ?? []) as Entry[])
      .filter((e) => e.class_assignments?.subjects?.name)
      .map((e) => ({
        subject: e.class_assignments?.subjects?.name ?? '',
        working_grade: e.working_grade,
        on_track: e.on_track,
        effort: e.effort,
      }))
  }

  // Saved courses with best-effort eligibility text. Saved courses are
  // keyed by students.id (saved_courses.student_id), and courses relate to
  // universities via university_id. Limit 5 to keep the snapshot small.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: saved } = await (admin as any)
    .from('saved_courses')
    .select('courses:course_id (name, universities:university_id (name))')
    .eq('student_id', studentId)
    .limit(5)
  type SavedRow = {
    courses: {
      name: string
      universities: { name: string } | null
    } | null
  }
  const savedCourses: PrepSnapshot['saved_courses'] = ((saved ?? []) as SavedRow[])
    .filter((r) => r.courses?.name)
    .map((r) => ({
      title: r.courses?.name ?? '',
      university: r.courses?.universities?.name ?? '',
      eligibility: null,
    }))

  // Active interventions / safeguarding flags summary (no free text).
  const flags: string[] = []
  if (student.care_experienced) flags.push('Care-experienced')
  if (student.receives_free_school_meals) flags.push('FSM')
  if (student.is_young_carer) flags.push('Young carer')
  if (student.has_asn) flags.push('ASN')
  if (student.attendance_pct !== null && student.attendance_pct < 90) flags.push('Attendance below 90%')

  return {
    student: {
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      school_stage: student.school_stage,
      registration_class: student.registration_class,
      attendance_pct: student.attendance_pct,
    },
    subjects,
    saved_courses: savedCourses,
    active_flags: flags,
  }
}

// Generate a bookable-token string. Uses randomUUID() minus dashes for a
// compact, URL-safe identifier. Crypto-grade uniqueness is not strictly
// required -- the tokens are scoped to an event -- but it's cheap.
export function generateToken(): string {
  return globalThis.crypto.randomUUID().replace(/-/g, '')
}
