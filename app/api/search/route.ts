import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Tables } from '@/types/database'

export const runtime = 'nodejs'

export type SubjectWithArea = Tables<'subjects'> & {
  curricular_area: Tables<'curricular_areas'> | null
}

export type CourseWithUniversity = Tables<'courses'> & {
  university: Tables<'universities'> | null
}

export interface SearchResults {
  subjects: SubjectWithArea[]
  courses: CourseWithUniversity[]
  universities: Tables<'universities'>[]
  careerSectors: Tables<'career_sectors'>[]
}

const EMPTY_RESULTS: SearchResults = {
  subjects: [],
  courses: [],
  universities: [],
  careerSectors: [],
}

const PER_TYPE_LIMIT = 20

const CACHE_TTL_MS = 60_000
const cache = new Map<string, { at: number; data: SearchResults }>()

function cacheGet(key: string): SearchResults | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function cacheSet(key: string, data: SearchResults) {
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value
    if (firstKey !== undefined) cache.delete(firstKey)
  }
  cache.set(key, { at: Date.now(), data })
}

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get('q') ?? ''
  const query = rawQuery.trim()

  if (query.length < 2) {
    return NextResponse.json(EMPTY_RESULTS)
  }

  const cacheKey = query.toLowerCase()
  const cached = cacheGet(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Search-Cache': 'HIT' },
    })
  }

  const supabase = await createServerSupabaseClient()
  const pattern = `%${query}%`

  const [subjectsRes, coursesRes, universitiesRes, careerSectorsRes] = await Promise.all([
    supabase
      .from('subjects')
      .select('*, curricular_area:curricular_areas(*)')
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .limit(PER_TYPE_LIMIT),
    supabase
      .from('courses')
      .select('*, university:universities(*)')
      .or(`name.ilike.${pattern},subject_area.ilike.${pattern},description.ilike.${pattern}`)
      .limit(PER_TYPE_LIMIT),
    supabase
      .from('universities')
      .select('*')
      .or(`name.ilike.${pattern},city.ilike.${pattern}`)
      .limit(PER_TYPE_LIMIT),
    supabase
      .from('career_sectors')
      .select('*')
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .limit(PER_TYPE_LIMIT),
  ])

  const results: SearchResults = {
    subjects: (subjectsRes.data ?? []) as unknown as SubjectWithArea[],
    courses: (coursesRes.data ?? []) as unknown as CourseWithUniversity[],
    universities: (universitiesRes.data ?? []) as Tables<'universities'>[],
    careerSectors: (careerSectorsRes.data ?? []) as Tables<'career_sectors'>[],
  }

  cacheSet(cacheKey, results)

  return NextResponse.json(results, {
    headers: { 'X-Search-Cache': 'MISS' },
  })
}
