import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { Tables } from '@/types/database'

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
        query = query.eq('type', filters.type)
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

// Fetch single university by ID
export function useUniversity(universityId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['university', universityId],
    queryFn: async () => {
      if (!universityId) return null

      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', universityId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!universityId,
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

// Fetch courses for a specific university
export function useUniversityCourses(universityId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['university-courses', universityId],
    queryFn: async () => {
      if (!universityId) return []

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('university_id', universityId)
        .order('name')

      if (error) throw error
      return data || []
    },
    enabled: !!universityId,
  })
}
