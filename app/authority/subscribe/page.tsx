import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { isFoundingAuthority } from '@/lib/authority/pricing'
import { SubscribeClient } from './subscribe-client'

export const dynamic = 'force-dynamic'

export default async function AuthoritySubscribePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in?redirect=/authority/subscribe')

  const admin = getAdminClient()
  if (!admin) {
    return <p style={{ padding: '32px' }}>Service unavailable.</p>
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('authority_staff')
    .select(`
      id, role, full_name, email, authority_id,
      local_authorities (
        id, name, verified, subscription_status, subscription_tier,
        trial_started_at, trial_expires_at,
        primary_contact_email
      )
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) redirect('/authority/register')

  const la = staff.local_authorities as {
    id: string
    name: string
    verified: boolean
    subscription_status: string
    subscription_tier: string
    trial_started_at: string | null
    trial_expires_at: string | null
    primary_contact_email: string | null
  } | null

  if (!la) redirect('/authority/register')

  if (staff.role !== 'la_admin') {
    return (
      <main style={{ padding: '40px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Subscription</h1>
        <p style={{ color: '#4b5563' }}>
          Only the LA Admin can manage the Pathfinder subscription. Please ask
          your LA Admin to handle this.
        </p>
        <p style={{ marginTop: '16px' }}>
          <Link href="/authority/dashboard" style={{ color: '#3b82f6' }}>
            Back to dashboard
          </Link>
        </p>
      </main>
    )
  }

  if (!la.verified) {
    return (
      <main style={{ padding: '40px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Subscription</h1>
        <p style={{ color: '#4b5563' }}>
          Your authority is awaiting verification. We will email you once
          verification is complete; you can subscribe from that point.
        </p>
      </main>
    )
  }

  if (la.subscription_status === 'active') {
    redirect('/authority/settings/subscription')
  }

  // School count auto-population: number of Pathfinder-connected schools in
  // this LA area that are visible to the authority.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: schoolCount } = await (admin as any)
    .from('schools')
    .select('id', { count: 'exact', head: true })
    .eq('local_authority', la.name)
    .eq('visible_to_authority', true)

  const founding = await isFoundingAuthority(admin, la.id)

  return (
    <SubscribeClient
      authorityName={la.name}
      schoolCount={schoolCount ?? 0}
      isFoundingAuthority={founding}
      contactEmail={la.primary_contact_email ?? staff.email ?? ''}
    />
  )
}
