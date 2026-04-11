'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type {
  CurricularArea,
  SubjectWithArea,
  CareerSector,
  CourseChoiceRule,
} from './use-subjects'

export type SimulatorStage = 's3' | 's4' | 's5' | 's6'

export const STAGE_TO_TRANSITION: Record<SimulatorStage, string> = {
  s3: 's2_to_s3',
  s4: 's3_to_s4',
  s5: 's4_to_s5',
  s6: 's5_to_s6',
}

export const STAGE_LABELS: Record<SimulatorStage, string> = {
  s3: 'S3 (going into S4)',
  s4: 'S4 (going into S5)',
  s5: 'S5 (going into S6)',
  s6: 'S6 (final year)',
}

type SimulatorRequirement = {
  course_id: string
  subject_id: string
  qualification_level: string
  min_grade: string | null
  is_mandatory: boolean
}

export type SimulatorCourse = {
  id: string
  name: string
  slug: string | null
  university_id: string | null
  university_name: string | null
}

export type SubjectProgressionRow = {
  from_level: string
  to_level: string
  min_grade: string | null
}

export type SimulatorData = {
  subjects: SubjectWithArea[]
  subjectsById: Map<string, SubjectWithArea>
  subjectsByArea: Array<{ area: CurricularArea; subjects: SubjectWithArea[] }>
  rules: Record<string, CourseChoiceRule>
  mandatoryByCourse: Map<string, Set<string>>
  courses: SimulatorCourse[]
  careerSectors: CareerSector[]
  subjectToSectors: Map<string, Set<string>>
  sectorToSubjects: Map<string, Set<string>>
  progressionsBySubject: Map<string, SubjectProgressionRow[]>
}

/**
 * One-shot bulk fetch for the simulator. Pulls every dataset the
 * impact calculation needs (subjects, requirements, courses, sectors,
 * progressions, choice rules) so the in-page calculation is purely
 * in-memory and stays well under the 1-second budget.
 */
export function useSimulatorData() {
  const supabase = getSupabaseClient()

  return useQuery<SimulatorData>({
    queryKey: ['simulator-data'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [
        subjectsResult,
        areasResult,
        rulesResult,
        reqsResult,
        sectorsResult,
        linksResult,
        progResult,
      ] = await Promise.all([
        supabase
          .from('subjects')
          .select('*, curricular_area:curricular_areas(*)')
          .eq('is_academy', false)
          .order('name'),
        supabase.from('curricular_areas').select('*').order('display_order'),
        supabase.from('course_choice_rules').select('*').eq('is_generic', true),
        supabase
          .from('course_subject_requirements')
          .select('course_id, subject_id, qualification_level, min_grade, is_mandatory'),
        supabase
          .from('career_sectors')
          .select('*')
          .order('display_order', { nullsFirst: false })
          .order('name'),
        supabase.from('subject_career_sectors').select('subject_id, career_sector_id'),
        supabase
          .from('subject_progressions')
          .select('from_subject_id, to_subject_id, from_level, to_level, min_grade'),
      ])

      if (subjectsResult.error) throw subjectsResult.error
      if (areasResult.error) throw areasResult.error
      if (rulesResult.error) throw rulesResult.error
      if (reqsResult.error) throw reqsResult.error
      if (sectorsResult.error) throw sectorsResult.error
      if (linksResult.error) throw linksResult.error
      if (progResult.error) throw progResult.error

      const subjects = (subjectsResult.data as unknown as SubjectWithArea[]) || []
      const subjectsById = new Map(subjects.map((s) => [s.id, s]))

      const areas = (areasResult.data as CurricularArea[]) || []
      const subjectsByArea = areas
        .map((area) => ({
          area,
          subjects: subjects.filter((s) => s.curricular_area_id === area.id),
        }))
        .filter((g) => g.subjects.length > 0)

      const rules: Record<string, CourseChoiceRule> = {}
      for (const r of (rulesResult.data as CourseChoiceRule[]) || []) {
        rules[r.transition] = r
      }

      const requirements = ((reqsResult.data as unknown as SimulatorRequirement[]) || []).map(
        (r) => ({ ...r, is_mandatory: r.is_mandatory ?? true })
      )

      // Track every course that has at least one requirement row, plus the
      // set of mandatory subject_ids per course (for eligibility checks).
      const courseIdsWithAnyReq = new Set<string>()
      const mandatoryByCourse = new Map<string, Set<string>>()
      for (const r of requirements) {
        courseIdsWithAnyReq.add(r.course_id)
        if (!r.is_mandatory) continue
        let set = mandatoryByCourse.get(r.course_id)
        if (!set) {
          set = new Set<string>()
          mandatoryByCourse.set(r.course_id, set)
        }
        set.add(r.subject_id)
      }

      // Fetch course metadata for every course that has any requirement row.
      // Courses with only optional requirements stay in the denominator and
      // are trivially "subject-eligible" since they have no mandatory subjects.
      let courses: SimulatorCourse[] = []
      const courseIdsArr = Array.from(courseIdsWithAnyReq)
      if (courseIdsArr.length > 0) {
        const { data: courseRows, error: courseErr } = await supabase
          .from('courses')
          .select('id, name, slug, university_id, university:universities(name)')
          .in('id', courseIdsArr)
        if (courseErr) throw courseErr
        type CourseJoinRow = {
          id: string
          name: string
          slug: string | null
          university_id: string | null
          university: { name: string } | null
        }
        courses = ((courseRows as unknown as CourseJoinRow[]) || []).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          university_id: c.university_id,
          university_name: c.university?.name ?? null,
        }))
      }

      const careerSectors = (sectorsResult.data as CareerSector[]) || []

      const subjectToSectors = new Map<string, Set<string>>()
      const sectorToSubjects = new Map<string, Set<string>>()
      for (const l of (linksResult.data as Array<{
        subject_id: string | null
        career_sector_id: string | null
      }>) || []) {
        if (!l.subject_id || !l.career_sector_id) continue
        let s2c = subjectToSectors.get(l.subject_id)
        if (!s2c) {
          s2c = new Set<string>()
          subjectToSectors.set(l.subject_id, s2c)
        }
        s2c.add(l.career_sector_id)
        let c2s = sectorToSubjects.get(l.career_sector_id)
        if (!c2s) {
          c2s = new Set<string>()
          sectorToSubjects.set(l.career_sector_id, c2s)
        }
        c2s.add(l.subject_id)
      }

      // Only keep self-progressions (e.g. N5 → Higher in the same subject) so
      // we can show the qualification chain in the pathway summary section.
      const progressionsBySubject = new Map<string, SubjectProgressionRow[]>()
      type ProgRow = {
        from_subject_id: string | null
        to_subject_id: string | null
        from_level: string
        to_level: string
        min_grade: string | null
      }
      for (const p of (progResult.data as ProgRow[]) || []) {
        if (!p.from_subject_id || p.from_subject_id !== p.to_subject_id) continue
        let arr = progressionsBySubject.get(p.from_subject_id)
        if (!arr) {
          arr = []
          progressionsBySubject.set(p.from_subject_id, arr)
        }
        arr.push({ from_level: p.from_level, to_level: p.to_level, min_grade: p.min_grade })
      }

      return {
        subjects,
        subjectsById,
        subjectsByArea,
        rules,
        mandatoryByCourse,
        courses,
        careerSectors,
        subjectToSectors,
        sectorToSubjects,
        progressionsBySubject,
      }
    },
  })
}

export type MissedOpportunity = {
  subject: SubjectWithArea
  additionalCount: number
  sampleCourses: SimulatorCourse[]
}

export type PathwaySummaryEntry = {
  subject: SubjectWithArea
  levels: Array<'n5' | 'higher' | 'adv_higher'>
  progressions: SubjectProgressionRow[]
}

export type ImpactResult = {
  eligibleCourses: SimulatorCourse[]
  eligibleCount: number
  totalCourses: number
  missedOpportunities: MissedOpportunity[]
  coveredSectorIds: Set<string>
  uncoveredSectorIds: Set<string>
  sectorAddBy: Map<string, SubjectWithArea[]>
  pathwaySummary: PathwaySummaryEntry[]
}

/**
 * Pure function: given the bulk simulator dataset and a set of selected
 * subject IDs, returns the four-section impact analysis the page renders.
 *
 * - eligible: courses where every mandatory subject is selected
 * - missed opportunities: unselected subjects that, if added, would unlock
 *   the most additional courses (single-subject delta — i.e. courses where
 *   the only missing requirement is that one subject)
 * - sector coverage: career sectors touched by any selected subject
 * - pathway summary: per-subject qualification chain based on level flags
 */
export function calculateSimulatorImpact(
  data: SimulatorData,
  selectedIds: Set<string>
): ImpactResult {
  const totalCourses = data.courses.length
  const eligibleCourses: SimulatorCourse[] = []
  const ineligibleByMissingSingle = new Map<string, SimulatorCourse[]>()

  for (const course of data.courses) {
    const mandatory = data.mandatoryByCourse.get(course.id)
    if (!mandatory || mandatory.size === 0) {
      eligibleCourses.push(course)
      continue
    }
    let missingSubject: string | null = null
    let missingCount = 0
    for (const subId of mandatory) {
      if (!selectedIds.has(subId)) {
        if (missingCount === 0) missingSubject = subId
        missingCount++
        if (missingCount > 1) break
      }
    }
    if (missingCount === 0) {
      eligibleCourses.push(course)
    } else if (missingCount === 1 && missingSubject) {
      let arr = ineligibleByMissingSingle.get(missingSubject)
      if (!arr) {
        arr = []
        ineligibleByMissingSingle.set(missingSubject, arr)
      }
      arr.push(course)
    }
  }

  eligibleCourses.sort((a, b) => a.name.localeCompare(b.name))

  const missedOpportunities: MissedOpportunity[] = []
  for (const [subjectId, coursesArr] of ineligibleByMissingSingle) {
    if (selectedIds.has(subjectId)) continue
    const subject = data.subjectsById.get(subjectId)
    if (!subject) continue
    missedOpportunities.push({
      subject,
      additionalCount: coursesArr.length,
      sampleCourses: coursesArr.slice(0, 3),
    })
  }
  missedOpportunities.sort((a, b) => b.additionalCount - a.additionalCount)

  const coveredSectorIds = new Set<string>()
  for (const subId of selectedIds) {
    const sectors = data.subjectToSectors.get(subId)
    if (sectors) for (const sId of sectors) coveredSectorIds.add(sId)
  }
  const uncoveredSectorIds = new Set<string>()
  for (const sector of data.careerSectors) {
    if (!coveredSectorIds.has(sector.id)) uncoveredSectorIds.add(sector.id)
  }

  const sectorAddBy = new Map<string, SubjectWithArea[]>()
  for (const sectorId of uncoveredSectorIds) {
    const subjectIdsForSector = data.sectorToSubjects.get(sectorId)
    if (!subjectIdsForSector) continue
    const candidates: SubjectWithArea[] = []
    for (const subId of subjectIdsForSector) {
      if (selectedIds.has(subId)) continue
      const sub = data.subjectsById.get(subId)
      if (sub) candidates.push(sub)
    }
    if (candidates.length > 0) sectorAddBy.set(sectorId, candidates)
  }

  const pathwaySummary: PathwaySummaryEntry[] = []
  for (const subId of selectedIds) {
    const subject = data.subjectsById.get(subId)
    if (!subject) continue
    const levels: PathwaySummaryEntry['levels'] = []
    if (subject.is_available_n5) levels.push('n5')
    if (subject.is_available_higher) levels.push('higher')
    if (subject.is_available_adv_higher) levels.push('adv_higher')
    const progressions = data.progressionsBySubject.get(subId) ?? []
    pathwaySummary.push({ subject, levels, progressions })
  }
  pathwaySummary.sort((a, b) => a.subject.name.localeCompare(b.subject.name))

  return {
    eligibleCourses,
    eligibleCount: eligibleCourses.length,
    totalCourses,
    missedOpportunities,
    coveredSectorIds,
    uncoveredSectorIds,
    sectorAddBy,
    pathwaySummary,
  }
}

/**
 * Apply a quick-start preset by matching subject names against the live
 * subject list. Returns a Set of subject IDs that exist in the data.
 */
export type SimulatorPresetId =
  | 'science'
  | 'creative'
  | 'business'
  | 'languages'
  | 'broad'

const PRESET_NAME_LISTS: Record<SimulatorPresetId, string[]> = {
  science: ['English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'French'],
  creative: ['English', 'Mathematics', 'Art and Design', 'Music', 'Drama', 'History'],
  business: [
    'English',
    'Mathematics',
    'Business Management',
    'Administration and IT',
    'Computing Science',
    'French',
  ],
  languages: [
    'English',
    'Mathematics',
    'French',
    'Spanish',
    'History',
    'Modern Studies',
  ],
  broad: [],
}

function findSubjectByName(
  subjects: SubjectWithArea[],
  name: string
): SubjectWithArea | null {
  const target = name.toLowerCase().trim()
  const exact = subjects.find((s) => s.name.toLowerCase().trim() === target)
  if (exact) return exact
  // Tolerate "Maths" vs "Mathematics", "Art & Design" vs "Art and Design", etc.
  const normalized = target.replace(/\s+&\s+/g, ' and ').replace(/maths\b/, 'mathematics')
  const fallback = subjects.find(
    (s) =>
      s.name.toLowerCase().trim().replace(/\s+&\s+/g, ' and ') === normalized ||
      s.name.toLowerCase().startsWith(target)
  )
  return fallback ?? null
}

export function applySimulatorPreset(
  presetId: SimulatorPresetId,
  data: SimulatorData
): Set<string> {
  if (presetId === 'broad') {
    // Pick the first available subject from each curricular area, with a
    // sensible bias towards the most common starting subjects where they
    // exist (English in Languages, Mathematics in Mathematics, etc.).
    const ids = new Set<string>()
    const seedNames = new Map<string, string>([
      ['Languages', 'English'],
      ['Mathematics', 'Mathematics'],
      ['Sciences', 'Biology'],
      ['Social Studies', 'History'],
      ['Expressive Arts', 'Art and Design'],
      ['Technologies', 'Computing Science'],
      ['Health and Wellbeing', 'Physical Education'],
      ['Religious and Moral Education', 'Religious, Moral and Philosophical Studies'],
    ])
    for (const group of data.subjectsByArea) {
      const seed = seedNames.get(group.area.name)
      const picked = seed
        ? findSubjectByName(group.subjects, seed) ?? group.subjects[0]
        : group.subjects[0]
      if (picked) ids.add(picked.id)
    }
    return ids
  }

  const ids = new Set<string>()
  for (const name of PRESET_NAME_LISTS[presetId]) {
    const found = findSubjectByName(data.subjects, name)
    if (found) ids.add(found.id)
  }
  return ids
}
