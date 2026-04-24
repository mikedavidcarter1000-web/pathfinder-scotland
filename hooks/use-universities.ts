import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { slugOrIdColumn } from '@/lib/slug-or-id'
import type { Tables, Enums } from '@/types/database'

interface UniversityFilters {
  type?: string
  city?: string
  russellGroup?: boolean
  search?: string
}

// Fetch all universities with optional filters
export function useUniversities(filters: UniversityFilters = {}) {
  const supabase = getSupabaseClient()

  return useQuery<Tables<'universities'>[]>({
    queryKey: ['universities', filters],
    queryFn: async () => {
      let query = supabase
        .from('universities')
        .select('*')
        .order('name')

      if (filters.type) {
        query = query.eq('type', filters.type as Enums<'university_type'>)
      }
      if (filters.city) {
        query = query.eq('city', filters.city)
      }
      if (filters.russellGroup !== undefined) {
        query = query.eq('russell_group', filters.russellGroup)
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch single university by ID or slug
export function useUniversity(universityIdOrSlug: string | null) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['university', universityIdOrSlug],
    queryFn: async () => {
      if (!universityIdOrSlug) return null
      const column = slugOrIdColumn(universityIdOrSlug)

      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq(column, universityIdOrSlug)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!universityIdOrSlug,
  })
}

// Fetch universities with course counts
export function useUniversitiesWithStats() {
  const supabase = getSupabaseClient()

  return useQuery<(Tables<'universities'> & { course_count: number })[]>({
    queryKey: ['universities-with-stats'],
    queryFn: async () => {
      // Fetch universities
      const { data: universitiesData, error: uniError } = await supabase
        .from('universities')
        .select('*')
        .order('name')

      if (uniError) throw uniError

      const universities = (universitiesData || []) as Tables<'universities'>[]

      // Fetch course counts
      const { data: counts, error: countError } = await supabase
        .from('courses')
        .select('university_id')

      if (countError) throw countError

      // Count courses per university
      const courseCounts: Record<string, number> = {}
      const countsList = (counts || []) as { university_id: string }[]
      countsList.forEach((c) => {
        courseCounts[c.university_id] = (courseCounts[c.university_id] || 0) + 1
      })

      return universities.map((uni) => ({
        ...uni,
        course_count: courseCounts[uni.id] || 0,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Get unique cities from universities
export function useUniversityCities() {
  const { data: universities } = useUniversities()

  const cities = [...new Set(universities?.map((u) => u.city).filter(Boolean))]
  return cities.sort() as string[]
}

// Resolve a universityId-or-slug to a UUID; returns null if not found.
async function resolveUniversityId(
  idOrSlug: string,
): Promise<string | null> {
  if (!idOrSlug) return null
  const supabase = getSupabaseClient()
  const column = slugOrIdColumn(idOrSlug)
  const { data } = await supabase
    .from('universities')
    .select('id')
    .eq(column, idOrSlug)
    .maybeSingle()
  return data?.id ?? null
}

// Fetch student_benefits records linked to a specific university via the
// related_university_id foreign key — used by the university detail page to
// show university-specific widening-access bursaries and CE top-ups.
export function useUniversityBenefits(universityIdOrSlug: string | null) {
  const supabase = getSupabaseClient()

  return useQuery<Tables<'student_benefits'>[]>({
    queryKey: ['university-benefits', universityIdOrSlug],
    queryFn: async () => {
      if (!universityIdOrSlug) return []
      const universityId = await resolveUniversityId(universityIdOrSlug)
      if (!universityId) return []

      const { data, error } = await supabase
        .from('student_benefits')
        .select('*')
        .eq('related_university_id', universityId)
        .eq('is_active', true)
        .order('priority_score', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!universityIdOrSlug,
    staleTime: 5 * 60 * 1000,
  })
}

// Fetch courses for a specific university
export function useUniversityCourses(universityIdOrSlug: string | null) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['university-courses', universityIdOrSlug],
    queryFn: async () => {
      if (!universityIdOrSlug) return []
      const universityId = await resolveUniversityId(universityIdOrSlug)
      if (!universityId) return []

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('university_id', universityId)
        .order('name')

      if (error) throw error
      return data || []
    },
    enabled: !!universityIdOrSlug,
  })
}
