import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { getAlertConfig } from '@/lib/authority/alerts'
import { AlertSettingsClient } from './settings-client'

export const dynamic = 'force-dynamic'

export default async function AuthorityAlertSettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in?redirect=/authority/alerts/settings')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (supabase as any)
    .from('authority_staff')
    .select('id, role, can_configure_alerts, authority_id, local_authorities(name, verified)')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!staff) redirect('/authority/register')
  const la = staff.local_authorities as { name: string; verified: boolean } | null
  if (!la?.verified) redirect('/authority/dashboard')
  if (!staff.can_configure_alerts) redirect('/authority/alerts')

  const admin = getAdminClient()
  const config = admin ? await getAlertConfig(admin, staff.authority_id) : null

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', margin: 0 }}>
            Alert settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>
            {la.name} · configure alert thresholds, notification channels, quiet periods and digest cadence
          </p>
        </div>
        <Link href="/authority/alerts" style={{ fontSize: 13, color: '#1D4ED8', textDecoration: 'none', alignSelf: 'center' }}>
          ← Alert centre
        </Link>
      </div>
      {!config && (
        <div style={{ padding: 16, background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8 }}>
          Could not load alert config -- service role key may not be configured.
        </div>
      )}
      {config && <AlertSettingsClient initialConfig={config} />}
    </main>
  )
}
