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
export type CareerRole = Tables<'career_roles'>

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

export type CareerSubjectRow = SubjectWithArea & {
  relevance: string | null
  course_count: number
}

export type CareerSectorDetail = {
  sector: CareerSector
  subjects_by_relevance: {
    essential: CareerSubjectRow[]
    recommended: CareerSubjectRow[]
    related: CareerSubjectRow[]
  }
  all_subjects: CareerSubjectRow[]
  career_roles: CareerRole[]
}

/**
 * Fetch a career sector with every linked subject (grouped by relevance),
 * each subject's curricular area, and a count of related university courses.
 * Powers the /discover/career-search reverse lookup.
 */
export function useCareerSectorDetail(sectorId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery<CareerSectorDetail | null>({
    queryKey: ['career-sector-detail', sectorId],
    queryFn: async () => {
      if (!sectorId) return null

      // 1. Fetch sector metadata.
      const { data: sector, error: sectorErr } = await supabase
        .from('career_sectors')
        .select('*')
        .eq('id', sectorId)
        .single()
      if (sectorErr) throw sectorErr
      if (!sector) return null

      // 2. Fetch subject links for this sector, joining the subject + area.
      const { data: links, error: linksErr } = await supabase
        .from('subject_career_sectors')
        .select(
          `
          relevance,
          subject:subjects(
            *,
            curricular_area:curricular_areas(*)
          )
        `
        )
        .eq('career_sector_id', sectorId)
      if (linksErr) throw linksErr

      type LinkRow = {
        relevance: string | null
        subject: (Subject & { curricular_area: CurricularArea | null }) | null
      }

      const typedLinks = (links as unknown as LinkRow[]) || []

      // 3. Count related courses per subject in a single query.
      const subjectIds = typedLinks
        .map((l) => l.subject?.id)
        .filter((id): id is string => !!id)

      const countMap = new Map<string, number>()
      if (subjectIds.length > 0) {
        const { data: reqs, error: reqErr } = await supabase
          .from('course_subject_requirements')
          .select('subject_id, course_id')
          .in('subject_id', subjectIds)
        if (reqErr) throw reqErr
        const uniqPerSubject = new Map<string, Set<string>>()
        for (const row of (reqs || []) as Array<{ subject_id: string; course_id: string }>) {
          let set = uniqPerSubject.get(row.subject_id)
          if (!set) {
            set = new Set<string>()
            uniqPerSubject.set(row.subject_id, set)
          }
          set.add(row.course_id)
        }
        for (const [id, set] of uniqPerSubject) {
          countMap.set(id, set.size)
        }
      }

      // 4. Shape into rows + group by relevance.
      const rows: CareerSubjectRow[] = typedLinks
        .filter((l): l is LinkRow & { subject: Subject & { curricular_area: CurricularArea | null } } => !!l.subject)
        .map((l) => ({
          ...l.subject,
          relevance: l.relevance,
          course_count: countMap.get(l.subject.id) ?? 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      const subjects_by_relevance = {
        essential: rows.filter((r) => r.relevance === 'essential'),
        recommended: rows.filter((r) => r.relevance === 'recommended'),
        related: rows.filter((r) => r.relevance === 'related' || !r.relevance),
      }

      // 4. Granular career roles for the sector (if any).
      const { data: roles, error: rolesErr } = await supabase
        .from('career_roles')
        .select('*')
        .eq('career_sector_id', sectorId)
        .order('ai_rating_2030_2035', { ascending: true, nullsFirst: false })
        .order('title', { ascending: true })
      if (rolesErr) throw rolesErr

      return {
        sector: sector as CareerSector,
        subjects_by_relevance,
        all_subjects: rows,
        career_roles: (roles as CareerRole[]) || [],
      }
    },
    enabled: !!sectorId,
    staleTime: 5 * 60 * 1000,
  })
}

export type CareerSectorPageCourse = Pick<
  Course,
  'id' | 'name' | 'degree_type' | 'duration_years' | 'entry_requirements' | 'subject_area'
> & {
  university: Pick<University, 'id' | 'name' | 'slug'> | null
}

export type CareerSectorPageData = CareerSectorDetail & {
  related_courses: CareerSectorPageCourse[]
  career_roles: CareerRole[]
}

/**
 * Fetch everything the /careers/[id] detail page needs: the sector row
 * (with all the rich content columns), linked subjects grouped by relevance
 * + course count, and university courses whose subject_area matches the
 * sector's course_subject_areas array.
 */
export function useCareerSectorPageData(sectorId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery<CareerSectorPageData | null>({
    queryKey: ['career-sector-page', sectorId],
    queryFn: async () => {
      if (!sectorId) return null

      // 1. Sector metadata (includes the new enrichment columns).
      const { data: sector, error: sectorErr } = await supabase
        .from('career_sectors')
        .select('*')
        .eq('id', sectorId)
        .single()
      if (sectorErr) throw sectorErr
      if (!sector) return null
      const typedSector = sector as CareerSector

      // 2. Subject links grouped by relevance, with curricular area + course counts.
      const { data: links, error: linksErr } = await supabase
        .from('subject_career_sectors')
        .select(
          `
          relevance,
          subject:subjects(
            *,
            curricular_area:curricular_areas(*)
          )
        `
        )
        .eq('career_sector_id', sectorId)
      if (linksErr) throw linksErr

      type LinkRow = {
        relevance: string | null
        subject: (Subject & { curricular_area: CurricularArea | null }) | null
      }
      const typedLinks = (links as unknown as LinkRow[]) || []

      const subjectIds = typedLinks
        .map((l) => l.subject?.id)
        .filter((id): id is string => !!id)

      const countMap = new Map<string, number>()
      if (subjectIds.length > 0) {
        const { data: reqs, error: reqErr } = await supabase
          .from('course_subject_requirements')
          .select('subject_id, course_id')
          .in('subject_id', subjectIds)
        if (reqErr) throw reqErr
        const uniqPerSubject = new Map<string, Set<string>>()
        for (const row of (reqs || []) as Array<{ subject_id: string; course_id: string }>) {
          let set = uniqPerSubject.get(row.subject_id)
          if (!set) {
            set = new Set<string>()
            uniqPerSubject.set(row.subject_id, set)
          }
          set.add(row.course_id)
        }
        for (const [id, set] of uniqPerSubject) {
          countMap.set(id, set.size)
        }
      }

      const rows: CareerSubjectRow[] = typedLinks
        .filter((l): l is LinkRow & { subject: Subject & { curricular_area: CurricularArea | null } } => !!l.subject)
        .map((l) => ({
          ...l.subject,
          relevance: l.relevance,
          course_count: countMap.get(l.subject.id) ?? 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      const subjects_by_relevance = {
        essential: rows.filter((r) => r.relevance === 'essential'),
        recommended: rows.filter((r) => r.relevance === 'recommended'),
        related: rows.filter((r) => r.relevance === 'related' || !r.relevance),
      }

      // 3. University courses whose subject_area maps to this sector.
      const areas = (typedSector.course_subject_areas || []) as string[]
      let relatedCourses: CareerSectorPageCourse[] = []
      if (areas.length > 0) {
        const { data: courses, error: coursesErr } = await supabase
          .from('courses')
          .select(
            `
            id, name, degree_type, duration_years, entry_requirements, subject_area,
            university:universities(id, name, slug)
          `
          )
          .in('subject_area', areas)
          .order('name')
        if (coursesErr) throw coursesErr
        relatedCourses = (courses as unknown as CareerSectorPageCourse[]) || []
      }

      // 4. Granular career roles within this sector with their 1-10 AI ratings.
      const { data: roles, error: rolesErr } = await supabase
        .from('career_roles')
        .select('*')
        .eq('career_sector_id', sectorId)
        .order('ai_rating_2030_2035', { ascending: true, nullsFirst: false })
        .order('title', { ascending: true })
      if (rolesErr) throw rolesErr

      return {
        sector: typedSector,
        subjects_by_relevance,
        all_subjects: rows,
        related_courses: relatedCourses,
        career_roles: (roles as CareerRole[]) || [],
      }
    },
    enabled: !!sectorId,
    staleTime: 5 * 60 * 1000,
  })
}

// ──────────────────────────────────────────────────────────────────────────
// Per-role AI impact hooks
// ──────────────────────────────────────────────────────────────────────────

export type SubjectCareerRole = CareerRole & {
  career_sector: Pick<CareerSector, 'id' | 'name'> | null
  relevance: string | null
}

/**
 * Fetch every career_role linked to a given subject (via career_role_subjects),
 * with the parent sector joined so we can group by sector in the UI.
 */
export function useSubjectCareerRoles(subjectId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery<SubjectCareerRole[]>({
    queryKey: ['subject-career-roles', subjectId],
    queryFn: async () => {
      if (!subjectId) return []
      const { data, error } = await supabase
        .from('career_role_subjects')
        .select(
          `
          relevance,
          career_role:career_roles(
            *,
            career_sector:career_sectors(id, name)
          )
        `
        )
        .eq('subject_id', subjectId)
      if (error) throw error

      type Row = {
        relevance: string | null
        career_role:
          | (CareerRole & {
              career_sector: Pick<CareerSector, 'id' | 'name'> | null
            })
          | null
      }

      return ((data as unknown as Row[]) || [])
        .filter((r): r is Row & { career_role: NonNullable<Row['career_role']> } => !!r.career_role)
        .map((r) => ({
          ...r.career_role,
          career_sector: r.career_role.career_sector,
          relevance: r.relevance,
        }))
        .sort((a, b) => {
          const ra = a.ai_rating_2030_2035 ?? 999
          const rb = b.ai_rating_2030_2035 ?? 999
          if (ra !== rb) return ra - rb
          return a.title.localeCompare(b.title)
        })
    },
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
  })
}

export type AiCareersHubData = {
  sectors: CareerSector[]
  rolesBySector: Map<string, CareerRole[]>
  allRoles: Array<CareerRole & { sector_name: string }>
}

/**
 * Bulk fetch for the /ai-careers hub: every sector + every role in one go,
 * organised both by sector (for the explorer) and as a flat list (for search).
 */
export function useAiCareersHubData() {
  const supabase = getSupabaseClient()

  return useQuery<AiCareersHubData>({
    queryKey: ['ai-careers-hub'],
    queryFn: async () => {
      const [sectorsRes, rolesRes] = await Promise.all([
        supabase
          .from('career_sectors')
          .select('*')
          .order('display_order', { nullsFirst: false })
          .order('name'),
        supabase
          .from('career_roles')
          .select('*')
          .order('ai_rating_2030_2035', { ascending: true, nullsFirst: false })
          .order('title', { ascending: true }),
      ])
      if (sectorsRes.error) throw sectorsRes.error
      if (rolesRes.error) throw rolesRes.error

      const sectors = (sectorsRes.data as CareerSector[]) || []
      const sectorNameById = new Map(sectors.map((s) => [s.id, s.name]))

      const allRoles: Array<CareerRole & { sector_name: string }> = []
      const rolesBySector = new Map<string, CareerRole[]>()
      for (const role of (rolesRes.data as CareerRole[]) || []) {
        allRoles.push({ ...role, sector_name: sectorNameById.get(role.career_sector_id) ?? '' })
        let arr = rolesBySector.get(role.career_sector_id)
        if (!arr) {
          arr = []
          rolesBySector.set(role.career_sector_id, arr)
        }
        arr.push(role)
      }

      return { sectors, rolesBySector, allRoles }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export type ExploreCareerSectorRow = CareerSector & {
  matched_subject_count: number
}

export type ExploreData = {
  subjects_by_area: Array<{
    area: CurricularArea
    subjects: SubjectWithArea[]
  }>
  suggested_sectors: ExploreCareerSectorRow[]
  reachable_roles: Array<CareerRole & { sector_name: string }>
}

/**
 * Fetch subjects from the chosen curricular areas plus the career sectors
 * those subjects connect to. Powers the /discover/explore guided flow.
 */
export function useExploreData(curricularAreaIds: string[]) {
  const supabase = getSupabaseClient()

  const key = [...curricularAreaIds].sort().join(',')

  return useQuery<ExploreData | null>({
    queryKey: ['explore-data', key],
    queryFn: async () => {
      if (curricularAreaIds.length === 0) return null

      // 1. Fetch subjects in the selected areas, with curricular area joined.
      const { data: subjects, error: subjectErr } = await supabase
        .from('subjects')
        .select('*, curricular_area:curricular_areas(*)')
        .in('curricular_area_id', curricularAreaIds)
        .eq('is_academy', false)
        .order('name')
      if (subjectErr) throw subjectErr

      const typedSubjects = (subjects as unknown as SubjectWithArea[]) || []

      // 2. Group subjects by curricular area (only areas with any subjects).
      const areaMap = new Map<string, { area: CurricularArea; subjects: SubjectWithArea[] }>()
      for (const s of typedSubjects) {
        if (!s.curricular_area) continue
        const existing = areaMap.get(s.curricular_area.id)
        if (existing) {
          existing.subjects.push(s)
        } else {
          areaMap.set(s.curricular_area.id, {
            area: s.curricular_area,
            subjects: [s],
          })
        }
      }
      const subjects_by_area = Array.from(areaMap.values()).sort(
        (a, b) => a.area.display_order - b.area.display_order
      )

      // 3. Find career sectors connected to these subjects (with per-sector
      //    count of how many selected subjects touch it).
      const subjectIds = typedSubjects.map((s) => s.id)
      let suggested_sectors: ExploreCareerSectorRow[] = []
      let reachable_roles: Array<CareerRole & { sector_name: string }> = []
      if (subjectIds.length > 0) {
        const { data: links, error: linksErr } = await supabase
          .from('subject_career_sectors')
          .select(
            `
            subject_id,
            career_sector:career_sectors(*)
          `
          )
          .in('subject_id', subjectIds)
        if (linksErr) throw linksErr

        type LinkRow = {
          subject_id: string
          career_sector: CareerSector | null
        }

        const sectorCounts = new Map<string, { sector: CareerSector; subjectIds: Set<string> }>()
        for (const row of (links as unknown as LinkRow[]) || []) {
          if (!row.career_sector) continue
          const existing = sectorCounts.get(row.career_sector.id)
          if (existing) {
            existing.subjectIds.add(row.subject_id)
          } else {
            sectorCounts.set(row.career_sector.id, {
              sector: row.career_sector,
              subjectIds: new Set<string>([row.subject_id]),
            })
          }
        }

        suggested_sectors = Array.from(sectorCounts.values())
          .map((entry) => ({
            ...entry.sector,
            matched_subject_count: entry.subjectIds.size,
          }))
          .sort((a, b) => {
            if (b.matched_subject_count !== a.matched_subject_count) {
              return b.matched_subject_count - a.matched_subject_count
            }
            return (a.display_order ?? 999) - (b.display_order ?? 999)
          })

        // 4. Reachable career roles via career_role_subjects (any subject in
        //    a selected area). Dedupe by role id, sort by AI rating asc.
        const { data: roleLinks, error: roleErr } = await supabase
          .from('career_role_subjects')
          .select(
            `
            career_role:career_roles(*, career_sector:career_sectors(name))
          `
          )
          .in('subject_id', subjectIds)
        if (roleErr) throw roleErr

        type RoleLinkRow = {
          career_role:
            | (CareerRole & { career_sector: { name: string } | null })
            | null
        }
        const roleMap = new Map<string, CareerRole & { sector_name: string }>()
        for (const row of (roleLinks as unknown as RoleLinkRow[]) || []) {
          if (!row.career_role) continue
          if (roleMap.has(row.career_role.id)) continue
          roleMap.set(row.career_role.id, {
            ...row.career_role,
            sector_name: row.career_role.career_sector?.name ?? '',
          })
        }
        reachable_roles = Array.from(roleMap.values()).sort((a, b) => {
          const ra = a.ai_rating_2030_2035 ?? 999
          const rb = b.ai_rating_2030_2035 ?? 999
          if (ra !== rb) return ra - rb
          return a.title.localeCompare(b.title)
        })
      }

      return {
        subjects_by_area,
        suggested_sectors,
        reachable_roles,
      }
    },
    enabled: curricularAreaIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })
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
