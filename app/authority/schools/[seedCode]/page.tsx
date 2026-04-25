import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AuthoritySchoolDetailPage({
  params,
}: {
  params: Promise<{ seedCode: string }>
}) {
  const { seedCode } = await params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/sign-in?redirect=/authority/schools/${seedCode}`)

  const admin = getAdminClient()
  if (!admin) return <p style={{ padding: '32px' }}>Service unavailable.</p>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('authority_staff')
    .select('id, role, assigned_school_ids, authority_id, local_authorities(name, verified)')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!staff) redirect('/authority/register')
  if (!staff.local_authorities?.verified) redirect('/authority/dashboard')

  type SchoolRow = {
    id: string
    name: string
    seed_code: string | null
    total_roll: number | null
    school_type: string | null
    visible_to_authority: boolean
  }

  const schoolSelect = 'id, name, seed_code, local_authority, total_roll, school_type, visible_to_authority'
  const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seedCode)

  // Use parameterised .eq() rather than building a PostgREST .or() filter
  // string. Two scoped queries — one against id (when the path looks like a
  // UUID), one against seed_code — keep the filter values out of the query
  // string interpolation path even if the regex gate is later loosened.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseFromSchools = () => (admin as any)
    .from('schools')
    .select(schoolSelect)
    .eq('local_authority', staff.local_authorities.name)
    .eq('visible_to_authority', true)

  let school: SchoolRow | null = null

  if (isUuidLike) {
    const { data } = await baseFromSchools().eq('id', seedCode).maybeSingle()
    school = (data as SchoolRow | null) ?? null
  }

  if (!school) {
    const { data } = await baseFromSchools().eq('seed_code', seedCode).maybeSingle()
    school = (data as SchoolRow | null) ?? null
  }

  if (!school) {
    return (
      <main style={{ padding: '40px 16px', maxWidth: '720px', margin: '0 auto' }}>
        <p>
          <Link href="/authority/dashboard" style={{ color: '#1d4ed8' }}>← Back to dashboard</Link>
        </p>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1a1a2e',
            marginTop: '16px',
          }}
        >
          School not found
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          We couldn&apos;t find a school in your local authority area with the supplied identifier.
          The school may not yet have joined Pathfinder, or may have opted out of LA visibility.
        </p>
      </main>
    )
  }

  // QIO scope check: only assigned schools (la_admin and data_analyst see all)
  const assigned = (staff.assigned_school_ids as string[] | null) ?? null
  if (staff.role === 'qio' && assigned && !assigned.includes(school.id)) {
    return (
      <main style={{ padding: '40px 16px', maxWidth: '720px', margin: '0 auto' }}>
        <p>
          <Link href="/authority/dashboard" style={{ color: '#1d4ed8' }}>← Back to dashboard</Link>
        </p>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1a1a2e',
            marginTop: '16px',
          }}
        >
          Not assigned
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>
          This school is not in your QIO assignment. Ask your LA admin to add it if you need access.
        </p>
      </main>
    )
  }

  return (
    <main style={{ padding: '40px 16px', maxWidth: '960px', margin: '0 auto' }}>
      <p>
        <Link href="/authority/dashboard" style={{ color: '#1d4ed8' }}>← Back to dashboard</Link>
      </p>
      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#1a1a2e',
          marginTop: '16px',
        }}
      >
        {school.name}
      </h1>
      <p style={{ color: '#64748b', marginTop: '4px' }}>
        {school.school_type ?? 'School'} · Seed {school.seed_code ?? '—'} · Roll {school.total_roll ?? '—'}
      </p>

      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '32px 28px',
          marginTop: '32px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: 0,
          }}
        >
          Coming soon
        </p>
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: '6px 0 0',
          }}
        >
          School detail view coming in a future update
        </h2>
        <p style={{ color: '#475569', margin: '12px auto 0', maxWidth: '480px' }}>
          Per-school drill-down with subject uptake, equity metrics, career exploration and engagement trends will appear here in a later session.
        </p>
      </div>
    </main>
  )
}
