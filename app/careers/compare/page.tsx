import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getAnonSupabase } from '@/lib/supabase-public'
import { CompareShell } from '@/components/compare/compare-shell'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Compare careers',
  description:
    'Compare up to three Scottish career paths side by side. See entry routes, typical salary, training length, and day-to-day work.',
  alternates: { canonical: '/careers/compare' },
}

// Example seed titles -- resolved to UUIDs at render time so the page tolerates
// title drift. MIN_SLOTS_PER_TAB is 2, so 2 of 3 lookups is still enough to
// show the example tab; a single successful match falls back to an empty tab.
const EXAMPLE_TITLES = ['Electrician', 'Primary Teacher', 'Nurse'] as const

async function loadExampleRoleIds(): Promise<string[]> {
  const supabase = getAnonSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('career_roles')
    .select('id, title')
    .in('title', EXAMPLE_TITLES as unknown as string[])
  if (error || !data) return []
  const byTitle = new Map(data.map((r) => [r.title, r.id]))
  return EXAMPLE_TITLES.map((t) => byTitle.get(t)).filter(
    (v): v is string => typeof v === 'string',
  )
}

export default async function CompareCareersPage() {
  const exampleRoleIds = await loadExampleRoleIds()

  return (
    <main
      style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '32px 16px 64px',
      }}
    >
      <nav
        aria-label="Breadcrumb"
        style={{ fontSize: '0.8125rem', marginBottom: '12px' }}
      >
        <Link
          href="/careers"
          style={{ color: 'var(--pf-blue-700)', textDecoration: 'none' }}
        >
          Careers
        </Link>
        <span style={{ color: 'var(--pf-grey-600)' }}> / Compare</span>
      </nav>
      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--pf-grey-900)',
          margin: '0 0 8px',
        }}
      >
        Compare careers
      </h1>
      <p
        style={{
          margin: '0 0 24px',
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          maxWidth: '640px',
        }}
      >
        Pick up to three careers and see how they stack up on entry routes,
        typical salary, and training time. Add more comparisons to run different
        shortlists side by side.
      </p>

      <Suspense fallback={<p>Loading&hellip;</p>}>
        <CompareShell exampleRoleIds={exampleRoleIds} />
      </Suspense>
    </main>
  )
}
