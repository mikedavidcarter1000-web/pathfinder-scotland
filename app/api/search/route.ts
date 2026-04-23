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

// Strip characters that would break the PostgREST .or() filter grammar
// (commas and parens act as separators / group delimiters).
function sanitiseToken(raw: string): string {
  return raw.replace(/[,()]/g, '').trim()
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
      headers: {
        'X-Search-Cache': 'HIT',
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
      },
    })
  }

  // Split the query into whitespace-delimited tokens. Every token must appear
  // somewhere in the row's searchable fields (AND across tokens, OR within
  // each token across fields). This turns "Medicine Glasgow" into a pair of
  // AND-ed constraints instead of an exact phrase match.
  const tokens = query.split(/\s+/).map(sanitiseToken).filter((t) => t.length > 0)
  if (tokens.length === 0) {
    return NextResponse.json(EMPTY_RESULTS)
  }

  const supabase = await createServerSupabaseClient()

  // Pre-fetch universities that match any of the tokens so the courses query
  // can cover "token appears in the university name or city" via university_id
  // lookups. The result set is also used directly for the Universities tab.
  const uniAnyTokenOr = tokens
    .map((t) => `name.ilike.%${t}%,city.ilike.%${t}%`)
    .join(',')
  const uniBroadRes = await supabase
    .from('universities')
    .select('*')
    .or(uniAnyTokenOr)
    .limit(100)
  const uniBroad = (uniBroadRes.data ?? []) as Tables<'universities'>[]

  // Subjects: AND across tokens, OR across (name, description).
  let subjectsBuilder = supabase
    .from('subjects')
    .select('*, curricular_area:curricular_areas(*)')
    .limit(PER_TYPE_LIMIT)
  for (const t of tokens) {
    subjectsBuilder = subjectsBuilder.or(`name.ilike.%${t}%,description.ilike.%${t}%`)
  }

  // Courses: AND across tokens, OR across (course fields + university match).
  // For each token we compute the subset of already-fetched universities where
  // the token appears in the name or city, and add an `university_id.in.(...)`
  // clause so a multi-word query like "Medicine Glasgow" matches courses whose
  // subject is Medicine and whose university is Glasgow.
  let coursesBuilder = supabase
    .from('courses')
    .select('*, university:universities(*)')
    .limit(PER_TYPE_LIMIT * 3)

  for (const t of tokens) {
    const parts = [
      `name.ilike.%${t}%`,
      `subject_area.ilike.%${t}%`,
      `description.ilike.%${t}%`,
    ]
    const tl = t.toLowerCase()
    const matchingUniIds = uniBroad
      .filter((u) => {
        const name = (u.name ?? '').toLowerCase()
        const city = ((u as { city?: string | null }).city ?? '').toLowerCase()
        return name.includes(tl) || city.includes(tl)
      })
      .map((u) => u.id)
    if (matchingUniIds.length > 0) {
      parts.push(`university_id.in.(${matchingUniIds.join(',')})`)
    }
    coursesBuilder = coursesBuilder.or(parts.join(','))
  }

  // Universities: AND across tokens, OR across (name, city).
  let universitiesBuilder = supabase
    .from('universities')
    .select('*')
    .limit(PER_TYPE_LIMIT)
  for (const t of tokens) {
    universitiesBuilder = universitiesBuilder.or(`name.ilike.%${t}%,city.ilike.%${t}%`)
  }

  // Career sectors: AND across tokens, OR across (name, description).
  let careersBuilder = supabase
    .from('career_sectors')
    .select('*')
    .limit(PER_TYPE_LIMIT)
  for (const t of tokens) {
    careersBuilder = careersBuilder.or(`name.ilike.%${t}%,description.ilike.%${t}%`)
  }

  const [subjectsRes, coursesRes, universitiesRes, careersRes] = await Promise.all([
    subjectsBuilder,
    coursesBuilder,
    universitiesBuilder,
    careersBuilder,
  ])

  // Final in-memory AND filter for courses -- belt-and-braces against any
  // over-fetch from the broad university_id.in(...) clause.
  const rawCourses = (coursesRes.data ?? []) as unknown as CourseWithUniversity[]
  const courses = rawCourses
    .filter((c) => {
      const uni = c.university as (Tables<'universities'> & { city?: string | null }) | null
      const haystack = [
        c.name,
        (c as { subject_area?: string | null }).subject_area,
        (c as { description?: string | null }).description,
        uni?.name,
        uni?.city,
      ]
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
        .join(' ')
        .toLowerCase()
      return tokens.every((t) => haystack.includes(t.toLowerCase()))
    })
    .slice(0, PER_TYPE_LIMIT)

  const results: SearchResults = {
    subjects: (subjectsRes.data ?? []) as unknown as SubjectWithArea[],
    courses,
    universities: (universitiesRes.data ?? []) as Tables<'universities'>[],
    careerSectors: (careersRes.data ?? []) as Tables<'career_sectors'>[],
  }

  cacheSet(cacheKey, results)

  return NextResponse.json(results, {
    headers: {
      'X-Search-Cache': 'MISS',
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
