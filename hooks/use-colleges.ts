import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { Tables } from '@/types/database'

type College = Tables<'colleges'>
type Articulation = Tables<'college_articulation'>

interface CollegeFilters {
  region?: string
  swap?: boolean
  uhi?: boolean
  fa?: boolean
  schools?: boolean
  search?: string
}

// Fetch all colleges with optional filters
export function useColleges(filters: CollegeFilters = {}) {
  const supabase = getSupabaseClient()

  return useQuery<College[]>({
    queryKey: ['colleges', filters],
    queryFn: async () => {
      let query = supabase
        .from('colleges')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (filters.region) {
        query = query.eq('region', filters.region)
      }
      if (filters.swap) {
        query = query.eq('has_swap', true)
      }
      if (filters.uhi) {
        query = query.eq('uhi_partner', true)
      }
      if (filters.fa) {
        query = query.eq('has_foundation_apprenticeships', true)
      }
      if (filters.schools) {
        query = query.eq('schools_programme', true)
      }
      if (filters.search) {
        // Search across name and course_areas (text match on name, array overlap not available via ilike)
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch single college by ID
export function useCollege(collegeId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery<College | null>({
    queryKey: ['college', collegeId],
    queryFn: async () => {
      if (!collegeId) return null

      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', collegeId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!collegeId,
  })
}

// Articulation route with joined university/college name
export type ArticulationWithUniversity = Articulation & {
  university_name: string
  university_id: string
}

export type ArticulationWithCollege = Articulation & {
  college_name: string
  college_id: string
}

// Fetch articulation routes for a college, grouped by university
export function useCollegeArticulation(collegeId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery<ArticulationWithUniversity[]>({
    queryKey: ['college-articulation', collegeId],
    queryFn: async () => {
      if (!collegeId) return []

      // Fetch articulation rows
      const { data: routes, error: routesError } = await supabase
        .from('college_articulation')
        .select('*')
        .eq('college_id', collegeId)
        .order('university_degree')

      if (routesError) throw routesError
      if (!routes || routes.length === 0) return []

      // Fetch university names for the referenced IDs
      const uniIds = [...new Set(routes.map((r) => r.university_id))]
      const { data: universities, error: uniError } = await supabase
        .from('universities')
        .select('id, name')
        .in('id', uniIds)

      if (uniError) throw uniError

      const uniMap: Record<string, string> = {}
      for (const u of universities || []) {
        uniMap[u.id] = u.name
      }

      return routes.map((r) => ({
        ...r,
        university_name: uniMap[r.university_id] || 'Unknown university',
      }))
    },
    enabled: !!collegeId,
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch articulation routes to a university, grouped by college
export function useUniversityArticulation(universityId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery<ArticulationWithCollege[]>({
    queryKey: ['university-articulation', universityId],
    queryFn: async () => {
      if (!universityId) return []

      const { data: routes, error: routesError } = await supabase
        .from('college_articulation')
        .select('*')
        .eq('university_id', universityId)
        .order('college_qualification')

      if (routesError) throw routesError
      if (!routes || routes.length === 0) return []

      // Fetch college names
      const collegeIds = [...new Set(routes.map((r) => r.college_id))]
      const { data: colleges, error: colError } = await supabase
        .from('colleges')
        .select('id, name')
        .in('id', collegeIds)

      if (colError) throw colError

      const collegeMap: Record<string, string> = {}
      for (const c of colleges || []) {
        collegeMap[c.id] = c.name
      }

      return routes.map((r) => ({
        ...r,
        college_name: collegeMap[r.college_id] || 'Unknown college',
      }))
    },
    enabled: !!universityId,
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch a sample of articulation routes for the pathways page
export function useArticulationExamples(limit = 15) {
  const supabase = getSupabaseClient()

  return useQuery<(Articulation & { college_name: string; university_name: string })[]>({
    queryKey: ['articulation-examples', limit],
    queryFn: async () => {
      const { data: routes, error: routesError } = await supabase
        .from('college_articulation')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (routesError) throw routesError
      if (!routes || routes.length === 0) return []

      const collegeIds = [...new Set(routes.map((r) => r.college_id))]
      const uniIds = [...new Set(routes.map((r) => r.university_id))]

      const [{ data: colleges }, { data: universities }] = await Promise.all([
        supabase.from('colleges').select('id, name').in('id', collegeIds),
        supabase.from('universities').select('id, name').in('id', uniIds),
      ])

      const collegeMap: Record<string, string> = {}
      for (const c of colleges || []) collegeMap[c.id] = c.name
      const uniMap: Record<string, string> = {}
      for (const u of universities || []) uniMap[u.id] = u.name

      return routes.map((r) => ({
        ...r,
        college_name: collegeMap[r.college_id] || 'Unknown college',
        university_name: uniMap[r.university_id] || 'Unknown university',
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Get unique regions from colleges
export function useCollegeRegions() {
  const { data: colleges } = useColleges()

  const regions = [...new Set(colleges?.map((c) => c.region).filter(Boolean))]
  return regions.sort() as string[]
}

// Find colleges whose course_areas overlap with given subjects/areas
export function useCollegesForAreas(courseAreas: string[]) {
  const supabase = getSupabaseClient()

  return useQuery<College[]>({
    queryKey: ['colleges-for-areas', courseAreas],
    queryFn: async () => {
      if (courseAreas.length === 0) return []

      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('is_active', true)
        .overlaps('course_areas', courseAreas)
        .order('name')
        .limit(6)

      if (error) throw error
      return data || []
    },
    enabled: courseAreas.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
