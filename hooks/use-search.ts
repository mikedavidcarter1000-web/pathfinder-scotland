import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { Tables } from '@/types/database'

interface SearchResults {
  courses: (Tables<'courses'> & { university?: Tables<'universities'> })[]
  universities: Tables<'universities'>[]
}

interface UseSearchOptions {
  enabled?: boolean
  limit?: number
}

export function useSearch(query: string, options: UseSearchOptions = {}) {
  const { enabled = true, limit = 10 } = options
  const supabase = getSupabaseClient()

  return useQuery<SearchResults>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return { courses: [], universities: [] }
      }

      const searchTerm = `%${query}%`

      const [coursesResponse, universitiesResponse] = await Promise.all([
        supabase
          .from('courses')
          .select(`
            *,
            university:universities(*)
          `)
          .or(`name.ilike.${searchTerm},subject_area.ilike.${searchTerm}`)
          .limit(limit),
        supabase
          .from('universities')
          .select('*')
          .or(`name.ilike.${searchTerm},city.ilike.${searchTerm}`)
          .limit(limit),
      ])

      return {
        courses: (coursesResponse.data || []) as (Tables<'courses'> & { university?: Tables<'universities'> })[],
        universities: (universitiesResponse.data || []) as Tables<'universities'>[],
      }
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useDebouncedSearch(
  query: string,
  options: UseSearchOptions & { debounceMs?: number } = {}
) {
  const { debounceMs = 300, ...searchOptions } = options
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  return useSearch(debouncedQuery, searchOptions)
}

export function useSearchSuggestions(query: string) {
  const supabase = getSupabaseClient()

  return useQuery<string[]>({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return []

      const { data: courses } = await supabase
        .from('courses')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(5)

      const { data: subjects } = await supabase
        .from('courses')
        .select('subject_area')
        .ilike('subject_area', `%${query}%`)
        .limit(5)

      const suggestions = new Set<string>()

      const courseList = (courses || []) as { name: string }[]
      const subjectList = (subjects || []) as { subject_area: string | null }[]

      courseList.forEach((c) => suggestions.add(c.name))
      subjectList.forEach((s) => {
        if (s.subject_area) suggestions.add(s.subject_area)
      })

      return Array.from(suggestions).slice(0, 8)
    },
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  })
}

// Hook for filtering and sorting search results
export function useFilteredSearch(
  query: string,
  filters: {
    universityId?: string
    subjectArea?: string
    degreeType?: string
    minUcasPoints?: number
    maxUcasPoints?: number
  } = {}
) {
  const supabase = getSupabaseClient()

  return useQuery<Tables<'courses'>[]>({
    queryKey: ['filtered-search', query, filters],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('courses')
        .select(`
          *,
          university:universities(*)
        `)

      if (query && query.length >= 2) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,subject_area.ilike.%${query}%`
        )
      }

      if (filters.universityId) {
        queryBuilder = queryBuilder.eq('university_id', filters.universityId)
      }

      if (filters.subjectArea) {
        queryBuilder = queryBuilder.eq('subject_area', filters.subjectArea)
      }

      if (filters.degreeType) {
        queryBuilder = queryBuilder.eq('degree_type', filters.degreeType)
      }

      const { data, error } = await queryBuilder.limit(50)

      if (error) throw error
      return (data || []) as Tables<'courses'>[]
    },
    enabled: true,
  })
}
