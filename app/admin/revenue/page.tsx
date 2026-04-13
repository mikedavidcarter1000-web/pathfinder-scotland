import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Database, Tables } from '@/types/database'

export const metadata: Metadata = {
  title: 'Revenue Dashboard — Admin',
  description: 'Benefit click analytics and revenue tracking.',
  robots: { index: false, follow: false },
}

type Benefit = Tables<'student_benefits'>
type Click = Tables<'benefit_clicks'>

type ClickWithBenefit = Click & { benefit: Pick<Benefit, 'name' | 'category' | 'provider' | 'affiliate_network' | 'affiliate_commission' | 'affiliate_url' | 'is_government_scheme'> | null }

function getAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
}

function formatCommissionEstimate(click: ClickWithBenefit): number {
  // Parse the first number out of strings like "3-7%", "85% first month",
  // "GBP flat fee", "$7.35 flat" — we only get order-of-magnitude accuracy
  // here; real numbers come from the affiliate networks once active.
  const commission = click.benefit?.affiliate_commission ?? null
  if (!commission) return 0
  const match = commission.match(/(\d+(?:\.\d+)?)/)
  if (!match) return 0
  const value = Number(match[1])
  if (Number.isNaN(value)) return 0
  // Assume a conservative average order value of GBP 30 on clicked links.
  // This is purely illustrative — the admin dashboard copy says so.
  return commission.includes('%') ? (value / 100) * 30 : value
}

export default async function RevenueDashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Auth gate — require a signed-in admin user.
  // Whitelist approach until a proper admin role column is added.
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/sign-in?redirect=/admin/revenue')
  }

  // Fail closed: if ADMIN_EMAILS is unset or the user isn't on the list, deny.
  // Previously this fell through when ADMIN_EMAILS was empty, exposing the
  // dashboard (and service-role-backed data reads) to any logged-in user.
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
    redirect('/dashboard')
  }

  // Clicks are only readable by the service role (per RLS). Use the admin
  // client for the aggregate reads on this internal dashboard.
  const adminClient = getAdminClient()
  if (!adminClient) {
    return (
      <div className="pf-container pt-10 pb-16">
        <h1 style={{ marginBottom: '8px' }}>Revenue Dashboard</h1>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          SUPABASE_SERVICE_ROLE_KEY is not configured — cannot load click data.
        </p>
      </div>
    )
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [allClicksRes, benefitsRes] = await Promise.all([
    adminClient
      .from('benefit_clicks')
      .select(
        'id, benefit_id, student_id, is_affiliate, clicked_at, source_page'
      )
      .order('clicked_at', { ascending: false })
      .limit(5000),
    adminClient
      .from('student_benefits')
      .select(
        'id, name, provider, category, affiliate_network, affiliate_commission, affiliate_url, is_government_scheme'
      ),
  ])

  const clicks: Click[] = allClicksRes.data ?? []
  const benefits: Benefit[] = (benefitsRes.data ?? []) as Benefit[]
  const benefitById = new Map(benefits.map((b) => [b.id, b]))

  const enrichedClicks: ClickWithBenefit[] = clicks.map((c) => ({
    ...c,
    benefit: benefitById.get(c.benefit_id) ?? null,
  }))

  // Student stage lookup (bulk)
  const studentIds = Array.from(
    new Set(clicks.map((c) => c.student_id).filter((v): v is string => !!v))
  )
  type StudentStage = { id: string; school_stage: string | null }
  let students: StudentStage[] = []
  if (studentIds.length > 0) {
    const { data } = await adminClient
      .from('students')
      .select('id, school_stage')
      .in('id', studentIds)
    students = (data ?? []) as StudentStage[]
  }
  const stageByStudent = new Map(students.map((s) => [s.id, s.school_stage]))

  // Aggregates
  const clicksThisMonth = enrichedClicks.filter(
    (c) => c.clicked_at && new Date(c.clicked_at) >= startOfMonth
  )
  const clicksLastMonth = enrichedClicks.filter((c) => {
    if (!c.clicked_at) return false
    const d = new Date(c.clicked_at)
    return d >= startOfLastMonth && d <= endOfLastMonth
  })

  // Clicks by category
  const byCategory = new Map<string, number>()
  for (const c of enrichedClicks) {
    const cat = c.benefit?.category ?? 'unknown'
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + 1)
  }
  const categoryRows = Array.from(byCategory.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  // Top 10 most clicked benefits
  const byBenefit = new Map<string, number>()
  for (const c of enrichedClicks) {
    byBenefit.set(c.benefit_id, (byBenefit.get(c.benefit_id) ?? 0) + 1)
  }
  const topBenefits = Array.from(byBenefit.entries())
    .map(([id, count]) => ({ id, count, benefit: benefitById.get(id) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Priority affiliate sign-ups: benefits where affiliate_network is set but
  // affiliate_url is not yet — and students are clicking on them.
  const prioritySignups = Array.from(byBenefit.entries())
    .map(([id, count]) => ({ id, count, benefit: benefitById.get(id) }))
    .filter(
      (x) =>
        x.benefit &&
        x.benefit.affiliate_network != null &&
        x.benefit.affiliate_url == null &&
        !x.benefit.is_government_scheme
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Estimated revenue if affiliate programmes were active
  const estimatedRevenue = enrichedClicks.reduce(
    (sum, c) => sum + formatCommissionEstimate(c),
    0
  )

  // Clicks by student stage
  const byStage = new Map<string, number>()
  for (const c of enrichedClicks) {
    const stage = c.student_id ? stageByStudent.get(c.student_id) ?? 'anonymous' : 'anonymous'
    byStage.set(stage, (byStage.get(stage) ?? 0) + 1)
  }
  const stageRows = Array.from(byStage.entries())
    .map(([stage, count]) => ({ stage: stage ?? 'unknown', count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="pf-container pt-10 pb-16">
      <div className="mb-8">
        <div
          className="pf-badge-grey inline-flex mb-2"
          style={{ fontWeight: 600 }}
        >
          Internal · not indexed
        </div>
        <h1 style={{ marginBottom: '4px' }}>Revenue Dashboard</h1>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          Benefit click analytics and affiliate pipeline tracking. Data from{' '}
          {enrichedClicks.length.toLocaleString()} clicks recorded to date.
        </p>
      </div>

      {/* Top-line metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Clicks this month"
          value={clicksThisMonth.length.toLocaleString()}
          subtitle={`from ${new Set(clicksThisMonth.map((c) => c.student_id).filter(Boolean)).size} students`}
        />
        <MetricCard
          label="Clicks last month"
          value={clicksLastMonth.length.toLocaleString()}
        />
        <MetricCard
          label="All-time clicks"
          value={enrichedClicks.length.toLocaleString()}
        />
        <MetricCard
          label="Est. monthly revenue (if live)"
          value={`GBP ${(estimatedRevenue * (clicksThisMonth.length / Math.max(enrichedClicks.length, 1))).toFixed(0)}`}
          subtitle="Illustrative — conservative AOV assumption"
        />
      </div>

      {/* Top benefits + priority signups side-by-side */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="pf-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>
            Top 10 most-clicked benefits
          </h2>
          <DataTable
            headers={['Benefit', 'Provider', 'Clicks']}
            rows={topBenefits.map((x) => [
              x.benefit?.name ?? '(deleted)',
              x.benefit?.provider ?? '—',
              String(x.count),
            ])}
          />
        </div>
        <div className="pf-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '6px' }}>
            Priority affiliate sign-ups
          </h2>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginBottom: '12px',
            }}
          >
            Benefits with affiliate potential that students are clicking — sign up to
            these networks first.
          </p>
          <DataTable
            headers={['Benefit', 'Network', 'Clicks']}
            rows={prioritySignups.map((x) => [
              x.benefit?.name ?? '(deleted)',
              x.benefit?.affiliate_network ?? '—',
              String(x.count),
            ])}
          />
        </div>
      </div>

      {/* Category + stage tables */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="pf-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>
            Clicks by category
          </h2>
          <DataTable
            headers={['Category', 'Clicks']}
            rows={categoryRows.map((r) => [r.category, String(r.count)])}
          />
        </div>
        <div className="pf-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>
            Clicks by student stage
          </h2>
          <DataTable
            headers={['Stage', 'Clicks']}
            rows={stageRows.map((r) => [r.stage, String(r.count)])}
          />
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  subtitle,
}: {
  label: string
  value: string
  subtitle?: string
}) {
  return (
    <div className="pf-card">
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--pf-grey-600)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '4px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.75rem',
          color: 'var(--pf-grey-900)',
          lineHeight: 1.1,
          marginBottom: subtitle ? '4px' : 0,
        }}
      >
        {value}
      </p>
      {subtitle && (
        <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>{subtitle}</p>
      )}
    </div>
  )
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  if (rows.length === 0) {
    return (
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
        No data yet.
      </p>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          fontSize: '0.875rem',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px 8px 0',
                  borderBottom: '1px solid var(--pf-grey-300)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: '10px 12px 10px 0',
                    borderBottom: '1px solid var(--pf-grey-100)',
                    color: 'var(--pf-grey-900)',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
