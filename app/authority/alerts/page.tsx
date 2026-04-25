import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { AlertsCentreClient } from './alerts-client'

export const dynamic = 'force-dynamic'

export default async function AuthorityAlertsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in?redirect=/authority/alerts')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (supabase as any)
    .from('authority_staff')
    .select('id, role, can_configure_alerts, authority_id, local_authorities(name, verified)')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!staff) redirect('/authority/register')
  const la = staff.local_authorities as { name: string; verified: boolean } | null
  if (!la?.verified) redirect('/authority/dashboard')

  const admin = getAdminClient()
  // Surface the schools list for the school filter dropdown.
  let schoolOptions: Array<{ id: string; name: string }> = []
  if (admin) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: schools } = await (admin as any)
      .from('schools')
      .select('id, name')
      .eq('local_authority', la.name)
      .eq('visible_to_authority', true)
      .order('name', { ascending: true })
    schoolOptions = ((schools ?? []) as Array<{ id: string; name: string }>)
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', margin: 0 }}>
            Alert centre
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>
            {la.name} · review and acknowledge alerts triggered by the alert engine
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/authority/dashboard"
            style={{ fontSize: 13, color: '#1D4ED8', textDecoration: 'none', alignSelf: 'center' }}
          >
            ← Dashboard
          </Link>
          {staff.can_configure_alerts && (
            <Link
              href="/authority/alerts/settings"
              style={{
                fontSize: 13,
                padding: '8px 14px',
                background: '#1B3A5C',
                color: '#fff',
                borderRadius: 6,
                textDecoration: 'none',
              }}
            >
              Settings
            </Link>
          )}
        </div>
      </div>
      <AlertsCentreClient schoolOptions={schoolOptions} />
    </main>
  )
}
