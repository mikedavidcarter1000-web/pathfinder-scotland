import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import {
  calculateSchoolDataQuality,
  type StudentWithDemographics,
} from '@/lib/authority/data-quality'

export const dynamic = 'force-dynamic'

type AuthorityDataQualitySummary = {
  total_students: number
  schools_count: number
  overall_score: 1 | 2 | 3 | 4 | 5
  fields: ReturnType<typeof calculateSchoolDataQuality>['fields']
}

async function loadAuthorityDataQuality(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  authorityName: string,
): Promise<AuthorityDataQualitySummary | null> {
  const { data: schools } = await admin
    .from('schools')
    .select('id, name')
    .eq('local_authority', authorityName)
    .eq('visible_to_authority', true)

  if (!schools || schools.length === 0) return null

  const schoolIds = schools.map((s: { id: string }) => s.id)

  const { data: students } = await admin
    .from('students')
    .select('id, gender, care_experienced, has_asn, receives_free_school_meals, eal, is_young_carer, ethnicity, student_type, demographic_source')
    .in('school_id', schoolIds)

  const rows = (students ?? []) as StudentWithDemographics[]
  if (rows.length === 0) {
    return {
      total_students: 0,
      schools_count: schools.length,
      overall_score: 1,
      fields: calculateSchoolDataQuality([]).fields,
    }
  }

  const summary = calculateSchoolDataQuality(rows)
  return {
    total_students: summary.total_students,
    schools_count: schools.length,
    overall_score: summary.overall_score,
    fields: summary.fields,
  }
}

const SCORE_LABELS: Record<1 | 2 | 3 | 4 | 5, { label: string; bg: string; fg: string }> = {
  5: { label: 'Excellent', bg: '#dcfce7', fg: '#166534' },
  4: { label: 'Good', bg: '#d1fae5', fg: '#065f46' },
  3: { label: 'Fair', bg: '#fef3c7', fg: '#92400e' },
  2: { label: 'Limited', bg: '#fed7aa', fg: '#9a3412' },
  1: { label: 'Sparse', bg: '#fee2e2', fg: '#991b1b' },
}

export default async function AuthorityDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; joined?: string; expired?: string }>
}) {
  const sp = await searchParams
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in?redirect=/authority/dashboard')

  const admin = getAdminClient()
  if (!admin) return <p>Service unavailable.</p>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('authority_staff')
    .select('id, full_name, role, authority_id, local_authorities(name, verified, subscription_status, subscription_tier)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!staff) redirect('/authority/register')

  const la = staff.local_authorities as {
    name: string
    verified: boolean
    subscription_status: string
    subscription_tier: string
  } | null

  const isVerified = la?.verified ?? false
  const isAdmin = staff.role === 'la_admin'

  const dataQuality = isVerified && la?.name
    ? await loadAuthorityDataQuality(admin, la.name)
    : null

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
            <span style={{ color: '#64748b', fontSize: '0.9375rem' }}>{la?.name ?? 'Authority Portal'}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {isAdmin && (
              <Link href="/authority/settings/staff" style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.875rem', textDecoration: 'none' }}>
                Staff settings
              </Link>
            )}
            <Link href="/api/auth/signout" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>
              Sign out
            </Link>
          </div>
        </div>
      </div>

      <div className="pf-container" style={{ padding: '40px 16px' }}>
        {/* Flash messages */}
        {sp.registered && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
            <p style={{ color: '#166534', margin: 0, fontWeight: 600 }}>Registration received</p>
            <p style={{ color: '#166534', margin: '4px 0 0', fontSize: '0.875rem' }}>
              Thank you for registering. Your authority will be verified within 2 working days. You can log in here to check your status.
            </p>
          </div>
        )}
        {sp.joined && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
            <p style={{ color: '#166534', margin: 0, fontWeight: 600 }}>Welcome to {la?.name}!</p>
            <p style={{ color: '#166534', margin: '4px 0 0', fontSize: '0.875rem' }}>
              Your account has been set up. Your authority admin will let you know when the portal is ready to use.
            </p>
          </div>
        )}

        {/* Verification pending banner */}
        {!isVerified && (
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '20px 24px', marginBottom: '32px' }}>
            <p style={{ color: '#92400e', margin: 0, fontWeight: 700, fontSize: '1rem' }}>
              Awaiting verification
            </p>
            <p style={{ color: '#92400e', margin: '6px 0 0', fontSize: '0.875rem', lineHeight: 1.6 }}>
              The Pathfinder team are reviewing your registration for <strong>{la?.name}</strong>.
              Verification typically takes 1–2 working days. You&apos;ll receive an email when your authority is approved.
            </p>
          </div>
        )}

        {/* Welcome heading */}
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          {isVerified ? `Welcome, ${staff.full_name}` : 'Registration submitted'}
        </h1>
        <p style={{ color: '#64748b', marginBottom: '40px' }}>
          {isVerified
            ? `${la?.name} authority portal — ${la?.subscription_tier ?? 'trial'} plan`
            : `Your registration for ${la?.name} is pending verification.`}
        </p>

        {isVerified && dataQuality && (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem', margin: 0, color: '#1a1a2e' }}>
                  Student data quality
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>
                  Aggregated across {dataQuality.schools_count} school{dataQuality.schools_count === 1 ? '' : 's'} ({dataQuality.total_students.toLocaleString('en-GB')} students)
                </p>
              </div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  backgroundColor: SCORE_LABELS[dataQuality.overall_score].bg,
                  color: SCORE_LABELS[dataQuality.overall_score].fg,
                }}
              >
                {SCORE_LABELS[dataQuality.overall_score].label} ({dataQuality.overall_score}/5)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {Object.entries(dataQuality.fields).map(([field, stat]) => (
                <div key={field} style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: '12px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    {field.replace(/_/g, ' ')}
                  </p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a2e', margin: '4px 0 0', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {stat.pct}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isVerified ? (
          /* Verified: show feature tiles */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            {[
              { title: 'Subject Choices', desc: 'Track real-time subject selections across your schools.', href: '#', available: false },
              { title: 'Equity Metrics', desc: 'SIMD-weighted access and attainment dashboards.', href: '#', available: false },
              { title: 'Career Pathways', desc: 'Career destination tracking for school leavers.', href: '#', available: false },
              { title: 'Curriculum Reports', desc: 'Breadth, balance, and curriculum coverage analysis.', href: '#', available: false },
              { title: 'Alerts', desc: 'Automated alerts for emerging subject-choice gaps.', href: '#', available: false },
              { title: 'Staff', desc: 'Manage QIOs and data analysts for your authority.', href: '/authority/settings/staff', available: isAdmin },
            ].map((tile) => (
              <div
                key={tile.title}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  opacity: tile.available ? 1 : 0.6,
                  position: 'relative',
                }}
              >
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.0625rem', marginBottom: '8px', color: '#1a1a2e' }}>
                  {tile.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: tile.available ? '16px' : 0 }}>{tile.desc}</p>
                {tile.available && (
                  <Link href={tile.href} style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                    Go →
                  </Link>
                )}
                {!tile.available && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Coming soon
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Not yet verified: show next-steps checklist */
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxWidth: '560px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem', marginBottom: '20px', color: '#1a1a2e' }}>
              What happens next?
            </h2>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#374151', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              <li>The Pathfinder team verifies your authority registration (1–2 working days)</li>
              <li>You receive a confirmation email when approved</li>
              <li>Your portal activates on a 30-day free trial</li>
              <li>Invite QIOs and data analysts via <strong>Staff settings</strong></li>
            </ol>
            <p style={{ marginTop: '20px', color: '#64748b', fontSize: '0.875rem' }}>
              Questions? Email{' '}
              <a href="mailto:hello@pathfinderscot.co.uk" style={{ color: 'var(--pf-blue-700, #1d4ed8)' }}>
                hello@pathfinderscot.co.uk
              </a>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
