import type { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getArticles } from '@/lib/blog'

const SITE_URL = 'https://pathfinderscot.co.uk'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/discover`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/discover/career-search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/discover/explore`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/subjects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/careers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ai-careers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pathways`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/simulator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/universities`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/colleges`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/widening-access`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/benefits`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/offers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/starting-uni`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/parents`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/parent/join`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/for-parents`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/for-schools`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/school/register`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/demo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tools/roi-calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/resources`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Blog articles read from the local content/blog directory at build time.
  const blogRoutes: MetadataRoute.Sitemap = getArticles().map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: a.updated ? new Date(a.updated) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Dynamic routes: pull IDs from Supabase. If the database read fails
  // (e.g. at build time without credentials), fall back to static routes
  // only so the build still succeeds.
  try {
    const supabase = await createServerSupabaseClient()

    const [subjectsRes, universitiesRes, coursesRes, careerSectorsRes, collegesRes, offersRes] = await Promise.all([
      supabase.from('subjects').select('id, created_at'),
      supabase.from('universities').select('id, updated_at'),
      supabase.from('courses').select('id, updated_at'),
      supabase.from('career_sectors').select('id'),
      supabase.from('colleges').select('id, created_at').eq('is_active', true),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('offers').select('slug, updated_at').eq('is_active', true),
    ])

    const subjectRoutes: MetadataRoute.Sitemap = (subjectsRes.data ?? []).map((row) => ({
      url: `${SITE_URL}/subjects/${row.id}`,
      lastModified: row.created_at ? new Date(row.created_at) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    const universityRoutes: MetadataRoute.Sitemap = (universitiesRes.data ?? []).map((row) => ({
      url: `${SITE_URL}/universities/${row.id}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    const courseRoutes: MetadataRoute.Sitemap = (coursesRes.data ?? []).map((row) => ({
      url: `${SITE_URL}/courses/${row.id}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    const careerSectorRoutes: MetadataRoute.Sitemap = (careerSectorsRes.data ?? []).map((row) => ({
      url: `${SITE_URL}/careers/${row.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    const collegeRoutes: MetadataRoute.Sitemap = (collegesRes.data ?? []).map((row) => ({
      url: `${SITE_URL}/colleges/${row.id}`,
      lastModified: row.created_at ? new Date(row.created_at) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    const offerRoutes: MetadataRoute.Sitemap = (
      (offersRes.data ?? []) as Array<{ slug: string; updated_at: string | null }>
    ).map((row) => ({
      url: `${SITE_URL}/offers/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    return [
      ...staticRoutes,
      ...blogRoutes,
      ...subjectRoutes,
      ...universityRoutes,
      ...courseRoutes,
      ...careerSectorRoutes,
      ...collegeRoutes,
      ...offerRoutes,
    ]
  } catch {
    return [...staticRoutes, ...blogRoutes]
  }
}
