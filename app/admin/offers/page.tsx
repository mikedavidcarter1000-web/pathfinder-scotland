import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient, isAdminEmail } from '@/lib/admin-auth'
import { computeOffersAnalytics } from '@/lib/admin-offers-analytics'
import OffersAdminClient from './offers-admin-client'

export const metadata: Metadata = {
  title: 'Offers Admin — Pathfinder',
  description: 'Offer click analytics and offer management.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type AdminOfferRow = {
  id: string
  category_id: string
  title: string
  slug: string
  brand: string | null
  offer_type: string
  discount_text: string | null
  url: string | null
  affiliate_url: string | null
  promo_code: string | null
  is_featured: boolean
  featured_until: string | null
  is_active: boolean
  needs_review: boolean
  last_verified_at: string | null
  updated_at: string
  category: { id: string; name: string; slug: string; icon: string | null } | null
}

export default async function OffersAdminPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in?redirect=/admin/offers')
  if (!isAdminEmail(user.email)) redirect('/dashboard')

  const adminClient = getAdminClient()
  if (!adminClient) {
    return (
      <div className="pf-container pt-10 pb-16">
        <h1 style={{ marginBottom: '8px' }}>Offers Admin</h1>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          SUPABASE_SERVICE_ROLE_KEY is not configured — cannot load offer data.
        </p>
      </div>
    )
  }

  const [analytics, offersRes, categoriesRes] = await Promise.all([
    computeOffersAnalytics(adminClient),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminClient as any)
      .from('offers')
      .select(
        'id, category_id, title, slug, brand, offer_type, discount_text, url, affiliate_url, promo_code, is_featured, featured_until, is_active, needs_review, last_verified_at, updated_at, category:offer_categories ( id, name, slug, icon )'
      )
      .order('updated_at', { ascending: false })
      .limit(500),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminClient as any)
      .from('offer_categories')
      .select('id, name, slug')
      .order('display_order', { ascending: true }),
  ])

  const offers: AdminOfferRow[] = (offersRes.data ?? []) as AdminOfferRow[]
  const categories = (categoriesRes.data ?? []) as { id: string; name: string; slug: string }[]

  const { summary, topOffersLast30Days, clicksByCategoryLast30Days, supportHubReferrals, mostSavedOffers, staleOffers } = analytics

  return (
    <div className="pf-container pt-10 pb-16">
      <div className="mb-8">
        <div className="pf-badge-grey inline-flex mb-2" style={{ fontWeight: 600 }}>
          Internal · not indexed
        </div>
        <h1 style={{ marginBottom: '4px' }}>Offers Admin</h1>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          Click analytics and offer management for the Student Offers Hub.{' '}
          <Link href="/admin/revenue" style={{ color: 'var(--pf-blue-700)', textDecoration: 'underline' }}>
            Revenue dashboard
          </Link>{' '}
          covers the legacy benefits side.
        </p>
      </div>

      {/* Summary stats */}
      <h2 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Total offers"
          value={summary.totalOffers.toLocaleString()}
          subtitle={`${summary.activeOffers} active · ${summary.inactiveOffers} inactive`}
        />
        <MetricCard
          label="Clicks (7 days)"
          value={summary.clicksLast7Days.toLocaleString()}
        />
        <MetricCard
          label="Clicks (30 days)"
          value={summary.clicksLast30Days.toLocaleString()}
          subtitle={`${summary.uniqueStudentsLast30Days} unique students`}
        />
        <MetricCard
          label="Clicks (all-time)"
          value={summary.clicksAllTime.toLocaleString()}
        />
        <MetricCard
          label="Unique students (30d)"
          value={summary.uniqueStudentsLast30Days.toLocaleString()}
        />
        <MetricCard
          label="Needs review"
          value={summary.offersNeedingReview.toLocaleString()}
          subtitle={summary.offersNeedingReview > 0 ? 'Scroll to stale offers below' : 'All current'}
        />
      </div>

      {/* Top offers + category breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="pf-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>
            Top 10 offers by clicks (30 days)
          </h2>
          <DataTable
            headers={['Rank', 'Offer', 'Category', 'Clicks', 'Students']}
            rows={topOffersLast30Days.map((o, i) => [
              `#${i + 1}`,
              o.title,
              o.categoryName,
              String(o.clickCount),
              String(o.uniqueStudents),
            ])}
          />
        </div>
        <div className="pf-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>
            Clicks by category (30 days)
          </h2>
          <CategoryBarTable rows={clicksByCategoryLast30Days} />
        </div>
      </div>

      {/* Support hub referrals + Most saved */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="pf-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '6px' }}>
            Support hub referrals (30 days)
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
            Clicks that originated on a /support/* page — proof that cross-linking drives
            engagement, useful in funding and partner pitches.
          </p>
          <DataTable
            headers={['Referrer page', 'Clicks', 'Top offer']}
            rows={
              supportHubReferrals.length > 0
                ? supportHubReferrals.map((r) => [
                    r.referrerPage,
                    String(r.clickCount),
                    r.topOfferTitle ?? '—',
                  ])
                : []
            }
          />
        </div>
        <div className="pf-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>
            Most saved offers
          </h2>
          <DataTable
            headers={['Offer', 'Category', 'Times saved']}
            rows={mostSavedOffers.map((o) => [
              o.title,
              o.categoryName,
              String(o.saveCount),
            ])}
          />
        </div>
      </div>

      {/* Stale offers */}
      <div className="pf-card mb-8">
        <h2 style={{ fontSize: '1.125rem', marginBottom: '6px' }}>
          Stale offers needing review
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
          Flagged by flag_stale_offers() or manually. Hit “Mark verified” below to clear the flag and reset
          the verification timestamp.
        </p>
        <DataTable
          headers={['Title', 'Category', 'Last verified', 'Days since']}
          rows={staleOffers.map((o) => [
            o.title,
            o.categoryName,
            o.lastVerifiedAt ?? 'never',
            o.daysSinceVerification === null ? '—' : String(o.daysSinceVerification),
          ])}
        />
      </div>

      {/* Management */}
      <div className="mb-4">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Offer management</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
          Quick actions for day-to-day maintenance. For major edits (description, eligibility, category), use
          Supabase Studio.
        </p>
      </div>
      <OffersAdminClient initialOffers={offers} categories={categories} />
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

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (rows.length === 0) {
    return (
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
        No data yet.
      </p>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
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

function CategoryBarTable({
  rows,
}: {
  rows: { categoryName: string; clickCount: number; percentage: number }[]
}) {
  if (rows.length === 0) {
    return (
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
        No data yet.
      </p>
    )
  }
  const max = Math.max(...rows.map((r) => r.clickCount), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {rows.map((r) => {
        const pct = (r.clickCount / max) * 100
        return (
          <div key={r.categoryName}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
                marginBottom: '4px',
                color: 'var(--pf-grey-900)',
              }}
            >
              <span>{r.categoryName}</span>
              <span style={{ color: 'var(--pf-grey-600)' }}>
                {r.clickCount.toLocaleString()} · {r.percentage.toFixed(1)}%
              </span>
            </div>
            <div
              style={{
                height: '6px',
                width: '100%',
                background: 'var(--pf-grey-100)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: 'var(--pf-blue-500)',
                  transition: 'width 200ms ease',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
