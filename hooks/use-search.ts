import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { Tables, Enums } from '@/types/database'
import type { SearchResults } from '@/app/api/search/route'

export type { SearchResults } from '@/app/api/search/route'

interface UseSearchOptions {
  enabled?: boolean
}

const EMPTY_RESULTS: SearchResults = {
  subjects: [],
  courses: [],
  universities: [],
  careerSectors: [],
}

async function fetchSearch(query: string): Promise<SearchResults> {
  if (!query || query.length < 2) return EMPTY_RESULTS

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) {
    throw new Error(`Search request failed: ${res.status}`)
  }
  return res.json()
}

export function useSearch(query: string, options: UseSearchOptions = {}) {
  const { enabled = true } = options

  return useQuery<SearchResults>({
    queryKey: ['search', query],
    queryFn: () => fetchSearch(query),
    enabled: enabled && query.length >= 2,
    staleTime: 60 * 1000,
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

// Advanced course filtering -- still queries Supabase directly since it's
// a per-page use case that needs flexible filter composition.
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
        queryBuilder = queryBuilder.eq('degree_type', filters.degreeType as Enums<'degree_type'>)
      }

      const { data, error } = await queryBuilder.limit(50)

      if (error) throw error
      return (data || []) as Tables<'courses'>[]
    },
    enabled: true,
  })
}
