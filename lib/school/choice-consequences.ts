import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Traffic-light status for a course against a student's current subject picks.
//   green  -- all mandatory subjects selected (or course has no subject requirements).
//   amber  -- at least one mandatory subject is met but others are missing.
//   red    -- zero mandatory subjects met.
export type CourseFitStatus = 'green' | 'amber' | 'red' | 'unknown'

export type CourseFit = {
  course_id: string
  course_name?: string
  university_id?: string
  university_name?: string
  status: CourseFitStatus
  required_count: number
  met_count: number
  missing_subjects: string[]
}

export type SectorCoverage = {
  sector_id: string
  sector_name: string
  subject_count: number
  core_subject_count: number
}

export type ConsequencesPayload = {
  selected_subject_ids: string[]
  course_fits: CourseFit[]
  sector_coverage: SectorCoverage[]
  subject_count: number
}

// Compute consequences for a student:
//   - For each saved course, evaluate their subject requirements against selected_subject_ids.
//   - For each career sector the selected subjects touch, sum coverage.
// admin: service-role client (so we can bypass RLS when reading the subject
//        requirements tables, which are public read anyway).
export async function computeConsequences(
  admin: SupabaseClient<Database>,
  studentId: string,
  selectedSubjectIds: string[]
): Promise<ConsequencesPayload> {
  const selected = new Set(selectedSubjectIds)

  // 1. Saved courses + their requirements.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: savedCourses } = await (admin as any)
    .from('saved_courses')
    .select('course_id, courses(id, name, university_id, universities(name))')
    .eq('student_id', studentId)

  const courseIds = (savedCourses ?? []).map((r: { course_id: string }) => r.course_id)

  type RequirementRow = { course_id: string; subject_id: string; is_mandatory: boolean | null; subjects?: { name?: string } | null }
  let requirements: RequirementRow[] = []
  if (courseIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('course_subject_requirements')
      .select('course_id, subject_id, is_mandatory, subjects(name)')
      .in('course_id', courseIds)
    requirements = (data ?? []) as RequirementRow[]
  }

  const courseFits: CourseFit[] = (savedCourses ?? []).map(
    (row: { course_id: string; courses?: { name?: string; university_id?: string; universities?: { name?: string } | null } | null }) => {
      const courseId = row.course_id
      const reqs = requirements.filter((r) => r.course_id === courseId && r.is_mandatory !== false)
      const required = reqs.length
      const met = reqs.filter((r) => selected.has(r.subject_id)).length
      const missing = reqs
        .filter((r) => !selected.has(r.subject_id))
        .map((r) => r.subjects?.name || 'Unknown subject')
      let status: CourseFitStatus = 'green'
      if (required === 0) status = 'unknown'
      else if (met === required) status = 'green'
      else if (met === 0) status = 'red'
      else status = 'amber'

      return {
        course_id: courseId,
        course_name: row.courses?.name,
        university_id: row.courses?.university_id,
        university_name: row.courses?.universities?.name,
        status,
        required_count: required,
        met_count: met,
        missing_subjects: missing,
      }
    }
  )

  // 2. Sector coverage.
  let sectorCoverage: SectorCoverage[] = []
  if (selected.size > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: junctions } = await (admin as any)
      .from('subject_career_sectors')
      .select('subject_id, career_sector_id, relevance, career_sectors(id, name)')
      .in('subject_id', Array.from(selected))

    const sectorMap = new Map<string, { name: string; subject_count: number; core_count: number }>()
    for (const j of junctions ?? []) {
      const sid = j.career_sector_id
      const name = j.career_sectors?.name ?? 'Unknown sector'
      const entry = sectorMap.get(sid) ?? { name, subject_count: 0, core_count: 0 }
      entry.subject_count += 1
      if (j.relevance === 'core') entry.core_count += 1
      sectorMap.set(sid, entry)
    }
    sectorCoverage = Array.from(sectorMap.entries())
      .map(([sector_id, v]) => ({
        sector_id,
        sector_name: v.name,
        subject_count: v.subject_count,
        core_subject_count: v.core_count,
      }))
      .sort((a, b) => b.subject_count - a.subject_count)
  }

  return {
    selected_subject_ids: Array.from(selected),
    course_fits: courseFits,
    sector_coverage: sectorCoverage,
    subject_count: selected.size,
  }
}
