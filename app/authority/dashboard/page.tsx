import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import {
  parseAuthorityFilters,
  parseDashboardTab,
  resolveSchoolScope,
  type DashboardTab,
} from '@/lib/authority/filters'
import {
  getAuthorityOverview,
  getSchoolScorecards,
  loadSchoolFilterContext,
} from '@/lib/authority/queries'
import { getLastMaterialisedViewRefresh } from '@/lib/authority/refresh-time'
import { DashboardHeader } from '@/components/authority/dashboard-header'
import { DashboardTabs } from '@/components/authority/dashboard-tabs'
import { DashboardFilterBar } from '@/components/authority/dashboard-filter-bar'
import { OverviewTab } from '@/components/authority/tabs/overview-tab'
import { PlaceholderTab } from '@/components/authority/tabs/placeholder-tab'

export const dynamic = 'force-dynamic'

type FlashFlags = { registered?: string; joined?: string; expired?: string }
type DashboardSearchParams = Record<string, string | string[] | undefined> & FlashFlags

export default async function AuthorityDashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>
}) {
  const sp = await searchParams
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in?redirect=/authority/dashboard')

  const admin = getAdminClient()
  if (!admin) return <p style={{ padding: '32px' }}>Service unavailable.</p>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('authority_staff')
    .select(`
      id, full_name, role, assigned_school_ids, authority_id,
      local_authorities(name, verified, subscription_status, subscription_tier)
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) redirect('/authority/register')

  const la = staff.local_authorities as {
    name: string
    verified: boolean
    subscription_status: string | null
    subscription_tier: string | null
  } | null

  const isVerified = la?.verified ?? false
  const isAdmin = staff.role === 'la_admin'
  const authorityName = la?.name ?? ''
  const qioAssignedIds: string[] | null =
    staff.role === 'qio'
      ? Array.isArray(staff.assigned_school_ids)
        ? (staff.assigned_school_ids as string[])
        : []
      : null

  const filters = parseAuthorityFilters(sp)
  const tab: DashboardTab = parseDashboardTab(sp)

  const [filterCtx, refreshTimestamp] = isVerified
    ? await Promise.all([
        loadSchoolFilterContext(admin, authorityName, qioAssignedIds),
        getLastMaterialisedViewRefresh(admin),
      ])
    : [{ schoolOptions: [], totalSchools: 0 }, null]

  const scopedSchoolIds = isVerified
    ? resolveSchoolScope(filters.schoolIds, filterCtx.schoolOptions, qioAssignedIds)
    : []

  const overview = isVerified
    ? await getAuthorityOverview(admin, authorityName, filters, scopedSchoolIds, refreshTimestamp)
    : null

  const scorecards = isVerified && tab === 'overview'
    ? await getSchoolScorecards(admin, authorityName, filters, scopedSchoolIds)
    : []

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top bar */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
        <div className="pf-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem', color: '#1a1a2e' }}>
              Pathfinder Scotland
            </span>
            <span style={{ color: '#94a3b8', margin: '0 8px' }}>|</span>
            <span style={{ color: '#64748b', fontSize: '0.9375rem' }}>{authorityName || 'Authority Portal'}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {isAdmin && (
              <>
                <Link href="/authority/settings/term-dates" style={{ color: '#1d4ed8', fontSize: '0.875rem', textDecoration: 'none' }}>
                  Term dates
                </Link>
                <Link href="/authority/settings/staff" style={{ color: '#1d4ed8', fontSize: '0.875rem', textDecoration: 'none' }}>
                  Staff settings
                </Link>
              </>
            )}
            <Link href="/api/auth/signout" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>
              Sign out
            </Link>
          </div>
        </div>
      </div>

      <div className="pf-container" style={{ padding: '32px 16px' }}>
        {/* Flash messages */}
        {sp.registered && (
          <FlashCard
            tone="success"
            title="Registration received"
            body="Thank you for registering. Your authority will be verified within 2 working days. You can log in here to check your status."
          />
        )}
        {sp.joined && (
          <FlashCard
            tone="success"
            title={`Welcome to ${authorityName}!`}
            body="Your account has been set up. Your authority admin will let you know when the portal is ready to use."
          />
        )}

        {!isVerified && (
          <FlashCard
            tone="warn"
            title="Awaiting verification"
            body={
              <>
                The Pathfinder team are reviewing your registration for <strong>{authorityName}</strong>.
                Verification typically takes 1–2 working days. You&apos;ll receive an email when your authority is approved.
              </>
            }
          />
        )}

        {!isVerified ? (
          <PendingVerificationCard authorityName={authorityName} fullName={staff.full_name} />
        ) : (
          <>
            <DashboardHeader
              authorityName={authorityName}
              subscriptionTier={la?.subscription_tier ?? null}
              totalSchools={filterCtx.totalSchools}
              metrics={overview}
              refreshTimestamp={refreshTimestamp}
            />

            <DashboardTabs />

            <DashboardFilterBar
              schoolOptions={filterCtx.schoolOptions}
              appliedCount={scopedSchoolIds.length}
            />

            {tab === 'overview' && overview && (
              <OverviewTab
                metrics={overview}
                scorecards={scorecards}
                totalSchoolsInLa={filterCtx.totalSchools}
              />
            )}
            {tab !== 'overview' && <PlaceholderTab tab={tab} />}
          </>
        )}
      </div>
    </main>
  )
}

function FlashCard({
  tone,
  title,
  body,
}: {
  tone: 'success' | 'warn'
  title: string
  body: React.ReactNode
}) {
  const colours =
    tone === 'success'
      ? { bg: '#f0fdf4', border: '#bbf7d0', fg: '#166534' }
      : { bg: '#fffbeb', border: '#fde68a', fg: '#92400e' }
  return (
    <div
      style={{
        backgroundColor: colours.bg,
        border: `1px solid ${colours.border}`,
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '24px',
      }}
    >
      <p style={{ color: colours.fg, margin: 0, fontWeight: 700 }}>{title}</p>
      <p style={{ color: colours.fg, margin: '4px 0 0', fontSize: '0.875rem', lineHeight: 1.6 }}>{body}</p>
    </div>
  )
}

function PendingVerificationCard({
  authorityName,
  fullName,
}: {
  authorityName: string
  fullName: string
}) {
  return (
    <>
      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#1a1a2e',
          marginBottom: '8px',
        }}
      >
        Hello, {fullName}
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        Your registration for {authorityName} is pending verification.
      </p>
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          maxWidth: '560px',
        }}
      >
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1.125rem',
            marginBottom: '20px',
            color: '#1a1a2e',
          }}
        >
          What happens next?
        </h2>
        <ol
          style={{
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            color: '#374151',
            fontSize: '0.9375rem',
            lineHeight: 1.6,
          }}
        >
          <li>The Pathfinder team verifies your authority registration (1–2 working days)</li>
          <li>You receive a confirmation email when approved</li>
          <li>Your portal activates on a 30-day free trial</li>
          <li>
            Invite QIOs and data analysts via <strong>Staff settings</strong>
          </li>
        </ol>
        <p style={{ marginTop: '20px', color: '#64748b', fontSize: '0.875rem' }}>
          Questions? Email{' '}
          <a href="mailto:hello@pathfinderscot.co.uk" style={{ color: '#1d4ed8' }}>
            hello@pathfinderscot.co.uk
          </a>
        </p>
      </div>
    </>
  )
}
