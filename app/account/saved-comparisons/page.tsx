import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAnonSupabase } from '@/lib/supabase-public'
import { SavedComparisonsClient } from './saved-comparisons-client'

export const metadata: Metadata = {
  title: 'Saved comparisons',
  description: 'Your saved career comparisons.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/account/saved-comparisons' },
}

export default async function SavedComparisonsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in?redirect=/account/saved-comparisons')
  }

  const { data: rows } = await supabase
    .from('saved_comparisons')
    .select('id, name, role_ids, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const comparisons = rows ?? []

  const allRoleIds = Array.from(
    new Set(comparisons.flatMap((c) => c.role_ids as string[])),
  )

  // Resolve role titles via the anon client — this data is public.
  let titleById = new Map<string, string>()
  if (allRoleIds.length > 0) {
    const anon = getAnonSupabase()
    if (anon) {
      const { data: roleRows } = await anon
        .from('career_roles')
        .select('id, title')
        .in('id', allRoleIds)
      titleById = new Map((roleRows ?? []).map((r) => [r.id, r.title]))
    }
  }

  const enriched = comparisons.map((c) => ({
    id: c.id,
    name: c.name,
    created_at: c.created_at,
    role_ids: c.role_ids as string[],
    role_titles: (c.role_ids as string[]).map(
      (id) => titleById.get(id) ?? 'Unknown role',
    ),
  }))

  return (
    <main
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '32px 16px 64px',
      }}
    >
      <nav
        aria-label="Breadcrumb"
        style={{ fontSize: '0.8125rem', marginBottom: '12px' }}
      >
        <Link
          href="/dashboard"
          style={{ color: 'var(--pf-blue-700)', textDecoration: 'none' }}
        >
          Dashboard
        </Link>
        <span style={{ color: 'var(--pf-grey-600)' }}> / Saved comparisons</span>
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
        Saved comparisons
      </h1>
      <p
        style={{
          margin: '0 0 24px',
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          maxWidth: '640px',
        }}
      >
        Pick one to open it in the comparison view, or remove the ones you no
        longer need.
      </p>
      <SavedComparisonsClient initial={enriched} />
    </main>
  )
}
