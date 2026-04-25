import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { SubscriptionManageClient } from './manage-client'

export const dynamic = 'force-dynamic'

export default async function AuthoritySubscriptionSettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in?redirect=/authority/settings/subscription')

  const admin = getAdminClient()
  if (!admin) return <p style={{ padding: '32px' }}>Service unavailable.</p>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('authority_staff')
    .select('role, authority_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) redirect('/authority/register')
  if (staff.role !== 'la_admin') {
    return (
      <main style={{ padding: '40px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Subscription</h1>
        <p style={{ color: '#4b5563' }}>Only the LA Admin can manage the subscription.</p>
        <p style={{ marginTop: '16px' }}>
          <Link href="/authority/dashboard" style={{ color: '#3b82f6' }}>
            Back to dashboard
          </Link>
        </p>
      </main>
    )
  }

  return <SubscriptionManageClient />
}
