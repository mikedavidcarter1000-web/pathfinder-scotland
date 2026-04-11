import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from './use-auth'
import type { Tables } from '@/types/database'

export type ChoiceTransition = 's2_to_s3' | 's3_to_s4' | 's4_to_s5' | 's5_to_s6'

export type Subject = Tables<'subjects'>
export type CurricularArea = Tables<'curricular_areas'>
export type SubjectProgression = Tables<'subject_progressions'>
export type CareerSector = Tables<'career_sectors'>
export type CourseChoiceRule = Tables<'course_choice_rules'>
export type Course = Tables<'courses'>
export type University = Tables<'universities'>
export type CourseSubjectRequirement = Tables<'course_subject_requirements'>

export type QualificationLevel = 'n4' | 'n5' | 'higher' | 'adv_higher' | 'npa' | 'academy'
export type Stage = 's2' | 's3' | 's4' | 's5'

export interface SubjectFilters {
  curricularAreaId?: string
  level?: QualificationLevel
  search?: string
  typicalAvailability?: string
  careerSectorId?: string
  isNpa?: boolean
  isAcademy?: boolean
}

export type SubjectWithArea = Subject & {
  curricular_area: CurricularArea | null
}

export type ProgressionLink = SubjectProgression & {
  from_subject: Pick<Subject, 'id' | 'name'> | null
  to_subject: Pick<Subject, 'id' | 'name'> | null
}

export type CareerLink = {
  relevance: string | null
  career_sector: CareerSector | null
}

export type CourseEntryRequirements = {
  highers?: string
  advanced_highers?: string
  ucas_points?: number
  required_subjects?: string[]
}

export type RelatedCourse = Course & {
  university: University | null
  requirement: {
    qualification_level: string
    min_grade: string | null
    is_mandatory: boolean
    notes: string | null
  }
}

export type RelatedCoursesByLevel = {
  higher: RelatedCourse[]
  n5: RelatedCourse[]
  adv_higher: RelatedCourse[]
}

export type SubjectDetail = SubjectWithArea & {
  progressions_upstream: ProgressionLink[]
  progressions_downstream: ProgressionLink[]
  career_links: CareerLink[]
  related_courses: RelatedCourse[]
  related_courses_by_level: RelatedCoursesByLevel
}

const LEVEL_TO_COLUMN: Record<QualificationLevel, keyof Subject | null> = {
  n4: 'is_available_n4',
  n5: 'is_available_n5',
  higher: 'is_available_higher',
  adv_higher: 'is_available_adv_higher',
  npa: 'is_npa',
  academy: 'is_academy',
}

/**
 * Fetch all subjects with curricular area joined.
 * Supports filtering by curricular area, qualification level, text search,
 * typical availability, and career sector.
 */
export function useSubjects(filters: SubjectFilters = {}) {
  const supabase = getSupabaseClient()

  return useQuery<SubjectWithArea[]>({
    queryKey: ['subjects', filters],
    queryFn: async () => {
      // Career sector filter requires an inner join against the junction table
      const selectClause = filters.careerSectorId
        ? `
          *,
          curricular_area:curricular_areas(*),
          subject_career_sectors!inner(career_sector_id)
        `
        : `
          *,
          curricular_area:curricular_areas(*)
        `

      let query = supabase.from('subjects').select(selectClause).order('name')

      if (filters.curricularAreaId) {
        query = query.eq('curricular_area_id', filters.curricularAreaId)
      }
      if (filters.typicalAvailability) {
        query = query.eq('typical_availability', filters.typicalAvailability)
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
      if (filters.careerSectorId) {
        query = query.eq(
          'subject_career_sectors.career_sector_id',
          filters.careerSectorId
        )
      }
      if (filters.level) {
        const column = LEVEL_TO_COLUMN[filters.level]
        if (column) {
          query = query.eq(column as string, true)
        }
      }
      if (filters.isNpa !== undefined) {
        query = query.eq('is_npa', filters.isNpa)
      }
      if (filters.isAcademy !== undefined) {
        query = query.eq('is_academy', filters.isAcademy)
      }

      const { data, error } = await query
      if (error) throw error
      return (data as unknown as SubjectWithArea[]) || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch a single subject with full detail: curricular area, progressions
 * (upstream + downstream), career sector mappings, and university courses
 * that list the subject in their entry_requirements.required_subjects.
 */
export function useSubjectDetail(subjectId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery<SubjectDetail | null>({
    queryKey: ['subject-detail', subjectId],
    queryFn: async () => {
      if (!subjectId) return null

      // 1. Fetch subject with curricular area and career sector links
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select(
          `
          *,
          curricular_area:curricular_areas(*),
          career_links:subject_career_sectors(
            relevance,
            career_sector:career_sectors(*)
          )
        `
        )
        .eq('id', subjectId)
        .single()

      if (subjectError) throw subjectError
      if (!subject) return null

      const typedSubject = subject as unknown as SubjectWithArea & {
        career_links: CareerLink[]
      }

      // 2. Fetch progression links where this subject is either end
      const { data: progressions, error: progError } = await supabase
        .from('subject_progressions')
        .select(
          `
          *,
          from_subject:subjects!subject_progressions_from_subject_id_fkey(id, name),
          to_subject:subjects!subject_progressions_to_subject_id_fkey(id, name)
        `
        )
        .or(`from_subject_id.eq.${subjectId},to_subject_id.eq.${subjectId}`)

      if (progError) throw progError

      const allProgressions = (progressions as unknown as ProgressionLink[]) || []

      // Upstream: this subject is the *target* (to_subject_id = subjectId)
      const upstream = allProgressions.filter(
        (p) => p.to_subject_id === subjectId && p.from_subject_id !== subjectId
      )
      // Downstream: this subject is the *source* (from_subject_id = subjectId)
      const downstream = allProgressions.filter(
        (p) => p.from_subject_id === subjectId
      )

      // 3. Fetch courses via the relational junction table. Returns the
      //    course + joined university along with the per-level requirement.
      const { data: requirementRows, error: coursesError } = await supabase
        .from('course_subject_requirements')
        .select(
          `
          qualification_level,
          min_grade,
          is_mandatory,
          notes,
          course:courses(
            *,
            university:universities(*)
          )
        `
        )
        .eq('subject_id', subjectId)

      if (coursesError) throw coursesError

      type RequirementJoinRow = {
        qualification_level: string
        min_grade: string | null
        is_mandatory: boolean | null
        notes: string | null
        course: (Course & { university: University | null }) | null
      }

      const byLevel: RelatedCoursesByLevel = { higher: [], n5: [], adv_higher: [] }
      const allRelated: RelatedCourse[] = []

      for (const row of (requirementRows as unknown as RequirementJoinRow[]) || []) {
        if (!row.course) continue
        const related: RelatedCourse = {
          ...row.course,
          requirement: {
            qualification_level: row.qualification_level,
            min_grade: row.min_grade,
            is_mandatory: !!row.is_mandatory,
            notes: row.notes,
          },
        }
        allRelated.push(related)
        if (row.qualification_level === 'higher') byLevel.higher.push(related)
        else if (row.qualification_level === 'n5') byLevel.n5.push(related)
        else if (row.qualification_level === 'adv_higher') byLevel.adv_higher.push(related)
      }

      const sortByName = (a: RelatedCourse, b: RelatedCourse) =>
        a.name.localeCompare(b.name)
      byLevel.higher.sort(sortByName)
      byLevel.n5.sort(sortByName)
      byLevel.adv_higher.sort(sortByName)
      allRelated.sort(sortByName)

      return {
        ...typedSubject,
        progressions_upstream: upstream,
        progressions_downstream: downstream,
        career_links: typedSubject.career_links || [],
        related_courses: allRelated,
        related_courses_by_level: byLevel,
      }
    },
    enabled: !!subjectId,
  })
}

const STAGE_TO_TRANSITION: Record<Stage, string> = {
  s2: 's2_to_s3',
  s3: 's3_to_s4',
  s4: 's4_to_s5',
  s5: 's5_to_s6',
}

const STAGE_TO_TARGET_LEVEL_COLUMN: Record<Stage, keyof Subject> = {
  s2: 'is_available_n5', // S2 → S3 typically begins N4/N5 pathway; use N5 as broadest
  s3: 'is_available_n5',
  s4: 'is_available_higher',
  s5: 'is_available_adv_higher',
}

export type PathwayData = {
  rule: CourseChoiceRule | null
  stage: Stage
  transition: string
  targetLevel: QualificationLevel
  subjectsByArea: Array<{
    area: CurricularArea
    subjects: SubjectWithArea[]
  }>
  academySubjects: SubjectWithArea[]
}

/**
 * Fetch the pathway planning context for a given stage:
 * - the course_choice_rule for the transition
 * - subjects available at the target level, grouped by curricular area
 * - academy/elective subjects (shown separately for S2→S3)
 */
export function usePathways(stage: Stage | null) {
  const supabase = getSupabaseClient()

  return useQuery<PathwayData | null>({
    queryKey: ['pathways', stage],
    queryFn: async () => {
      if (!stage) return null

      const transition = STAGE_TO_TRANSITION[stage]
      const targetLevelColumn = STAGE_TO_TARGET_LEVEL_COLUMN[stage]
      const targetLevel: QualificationLevel =
        stage === 's4' ? 'higher' : stage === 's5' ? 'adv_higher' : 'n5'

      // 1. Fetch the generic rule for this transition
      const { data: rules, error: ruleError } = await supabase
        .from('course_choice_rules')
        .select('*')
        .eq('transition', transition)
        .eq('is_generic', true)
        .limit(1)

      if (ruleError) throw ruleError
      const rule = (rules?.[0] as CourseChoiceRule) || null

      // 2. Fetch subjects available at the target level (non-academy)
      const { data: subjects, error: subjectError } = await supabase
        .from('subjects')
        .select('*, curricular_area:curricular_areas(*)')
        .eq(targetLevelColumn as string, true)
        .eq('is_academy', false)
        .order('name')

      if (subjectError) throw subjectError
      const typedSubjects =
        (subjects as unknown as SubjectWithArea[]) || []

      // 3. Fetch academy subjects (only surfaced for S2 → S3 stage UI)
      const { data: academies, error: academyError } = await supabase
        .from('subjects')
        .select('*, curricular_area:curricular_areas(*)')
        .eq('is_academy', true)
        .order('name')

      if (academyError) throw academyError
      const typedAcademies =
        (academies as unknown as SubjectWithArea[]) || []

      // 4. Fetch curricular areas for grouping
      const { data: areas, error: areasError } = await supabase
        .from('curricular_areas')
        .select('*')
        .order('display_order')

      if (areasError) throw areasError
      const typedAreas = (areas as CurricularArea[]) || []

      // Group subjects by curricular area
      const subjectsByArea = typedAreas
        .map((area) => ({
          area,
          subjects: typedSubjects.filter(
            (s) => s.curricular_area_id === area.id
          ),
        }))
        .filter((group) => group.subjects.length > 0)

      return {
        rule,
        stage,
        transition,
        targetLevel,
        subjectsByArea,
        academySubjects: typedAcademies,
      }
    },
    enabled: !!stage,
    staleTime: 5 * 60 * 1000,
  })
}

export type CareerSectorWithCount = CareerSector & {
  subject_count: number
}

/**
 * Fetch all career sectors with count of linked subjects.
 */
export function useCareerSectors() {
  const supabase = getSupabaseClient()

  return useQuery<CareerSectorWithCount[]>({
    queryKey: ['career-sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('career_sectors')
        .select('*, subject_career_sectors(subject_id)')
        .order('display_order', { nullsFirst: false })
        .order('name')

      if (error) throw error

      type Row = CareerSector & {
        subject_career_sectors: Array<{ subject_id: string }> | null
      }

      return (
        ((data as unknown as Row[]) || []).map((row) => {
          const { subject_career_sectors, ...sector } = row
          return {
            ...sector,
            subject_count: subject_career_sectors?.length ?? 0,
          }
        })
      )
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch all curricular areas ordered by display_order.
 */
export function useCurricularAreas() {
  const supabase = getSupabaseClient()

  return useQuery<CurricularArea[]>({
    queryKey: ['curricular-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curricular_areas')
        .select('*')
        .order('display_order')

      if (error) throw error
      return (data as CurricularArea[]) || []
    },
    staleTime: 10 * 60 * 1000,
  })
}

// ──────────────────────────────────────────────────────────────────────────
// Student subject & academy choice persistence
// ──────────────────────────────────────────────────────────────────────────

export type StudentSubjectChoice = Tables<'student_subject_choices'>
export type StudentAcademyChoice = Tables<'student_academy_choices'>

export type StudentSubjectChoiceWithSubject = StudentSubjectChoice & {
  subject: SubjectWithArea | null
}

export type StudentAcademyChoiceWithSubject = StudentAcademyChoice & {
  subject: SubjectWithArea | null
}

/**
 * Fetch the current student's saved subject choices, with each choice's
 * subject + curricular area joined. Returned ordered by transition then
 * rank_order so the pathway planner can rebuild the selection cleanly.
 */
export function useStudentSubjectChoices(transition?: ChoiceTransition) {
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  return useQuery<StudentSubjectChoiceWithSubject[]>({
    queryKey: ['student-subject-choices', user?.id, transition ?? 'all'],
    queryFn: async () => {
      if (!user) return []

      let query = supabase
        .from('student_subject_choices')
        .select(
          `
          *,
          subject:subjects(
            *,
            curricular_area:curricular_areas(*)
          )
        `
        )
        .eq('student_id', user.id)

      if (transition) {
        query = query.eq('transition', transition)
      }

      const { data, error } = await query.order('transition').order('rank_order', {
        nullsFirst: false,
      })

      if (error) throw error
      return (data as unknown as StudentSubjectChoiceWithSubject[]) || []
    },
    enabled: !!user,
  })
}

/**
 * Fetch the current student's saved academy rankings (ordered 1st, 2nd, 3rd).
 */
export function useStudentAcademyChoices() {
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  return useQuery<StudentAcademyChoiceWithSubject[]>({
    queryKey: ['student-academy-choices', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('student_academy_choices')
        .select(
          `
          *,
          subject:subjects(
            *,
            curricular_area:curricular_areas(*)
          )
        `
        )
        .eq('student_id', user.id)
        .order('rank_order')

      if (error) throw error
      return (data as unknown as StudentAcademyChoiceWithSubject[]) || []
    },
    enabled: !!user,
  })
}

/**
 * Replace all saved choices for a given transition. Deletes any existing
 * rows for (student, transition), then inserts the new selection ordered by
 * rank. For S2→S3 the caller can also pass academy rankings, which are saved
 * to the separate student_academy_choices table (full replacement).
 */
export function useSaveSubjectChoices() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      transition,
      subjectIds,
      academyRankings,
    }: {
      transition: ChoiceTransition
      subjectIds: string[]
      academyRankings?: (string | null)[]
    }) => {
      if (!user) throw new Error('Not authenticated')

      // Replace subject picks for this transition.
      const { error: delErr } = await supabase
        .from('student_subject_choices')
        .delete()
        .eq('student_id', user.id)
        .eq('transition', transition)
      if (delErr) throw delErr

      if (subjectIds.length > 0) {
        const rows = subjectIds.map((subject_id, idx) => ({
          student_id: user.id,
          subject_id,
          transition,
          rank_order: idx + 1,
          is_reserve: false,
        }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insErr } = await (supabase as any)
          .from('student_subject_choices')
          .insert(rows)
        if (insErr) throw insErr
      }

      // Replace academy rankings when provided (S2→S3 flow).
      if (academyRankings) {
        const { error: delAcadErr } = await supabase
          .from('student_academy_choices')
          .delete()
          .eq('student_id', user.id)
        if (delAcadErr) throw delAcadErr

        const rows = academyRankings
          .map((subject_id, idx) =>
            subject_id
              ? {
                  student_id: user.id,
                  subject_id,
                  rank_order: idx + 1,
                }
              : null
          )
          .filter((r): r is NonNullable<typeof r> => r !== null)

        if (rows.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: insAcadErr } = await (supabase as any)
            .from('student_academy_choices')
            .insert(rows)
          if (insAcadErr) throw insAcadErr
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-subject-choices'] })
      queryClient.invalidateQueries({ queryKey: ['student-academy-choices'] })
    },
  })
}
