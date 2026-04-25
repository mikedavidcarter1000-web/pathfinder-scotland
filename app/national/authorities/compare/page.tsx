// Authority-16: cross-LA comparison builder. Server component shells in
// the data; the client picker drives selection state via URL params.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getNationalStaffContext } from '@/lib/national/auth'
import { getAdminClient } from '@/lib/admin-auth'
import { parseNationalFilters } from '@/lib/national/filters'
import { loadOptedInAuthorities, getAuthorityScorecards } from '@/lib/national/queries'
import { CompareBuilderClient } from '@/components/national/compare-builder-client'

export const dynamic = 'force-dynamic'

const ALLOWED_METRICS = ['students', 'active_pct', 'simd_q1_pct'] as const
type MetricKey = (typeof ALLOWED_METRICS)[number]

export default async function NationalCompareLAsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const ctx = await getNationalStaffContext()
  if (!ctx) redirect('/auth/sign-in?redirect=/national/authorities/compare')

  const admin = getAdminClient()
  if (!admin) return <p style={{ padding: '32px' }}>Service unavailable.</p>

  const filters = parseNationalFilters(sp)
  const authorities = await loadOptedInAuthorities(admin)

  // Selected codes from `?compare=` (comma-separated), capped to 5
  const compareRaw = typeof sp.compare === 'string' ? sp.compare : Array.isArray(sp.compare) ? sp.compare[0] : ''
  const requestedCodes = (compareRaw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((c) => authorities.some((a) => a.code === c))
    .slice(0, 5)

  // Selected metrics from `?metrics=`
  const metricsRaw = typeof sp.metrics === 'string' ? sp.metrics : Array.isArray(sp.metrics) ? sp.metrics[0] : ''
  const requestedMetrics = ((metricsRaw ?? 'students,active_pct,simd_q1_pct')
    .split(',')
    .map((s) => s.trim()) as MetricKey[]).filter((m) => (ALLOWED_METRICS as readonly string[]).includes(m))
  const selectedMetrics: MetricKey[] = requestedMetrics.length > 0 ? requestedMetrics : ['students', 'active_pct', 'simd_q1_pct']

  const includeNational = sp.national === '1'

  // Pre-fetch scorecards for the selected LAs (and for ALL when "include national average" is set)
  const scopeForFetch = includeNational ? authorities.map((a) => a.code) : requestedCodes
  const scorecards = scopeForFetch.length > 0
    ? await getAuthorityScorecards(admin, authorities, scopeForFetch, filters)
    : []

  const nationalAvg = computeNationalAverage(scorecards.filter((s) => authorities.some((a) => a.code === s.authority_code)))
  const selectedScorecards = scorecards.filter((s) => requestedCodes.includes(s.authority_code))

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '1200px' }}>
        <Link
          href="/national/dashboard"
          style={{ color: '#1d4ed8', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}
        >
          ← Back to national dashboard
        </Link>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: 0,
          }}
        >
          Cross-authority comparison
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem', marginTop: '6px' }}>
          Pick 2-5 opted-in local authorities to compare on student count, activation rate and SIMD Q1 share. Use the Challenge preset to load all 9 Challenge Authorities at once.
        </p>

        <CompareBuilderClient
          authorities={authorities.map((a) => ({
            code: a.code,
            name: a.name,
            is_challenge_authority: a.is_challenge_authority,
          }))}
          selectedCodes={requestedCodes}
          selectedMetrics={selectedMetrics}
          includeNational={includeNational}
          scorecards={selectedScorecards.map((s) => ({
            authority_code: s.authority_code,
            authority_name: s.authority_name,
            is_challenge_authority: s.is_challenge_authority,
            student_count: s.student_count,
            active_pct_30d: s.active_pct_30d,
            simd_q1_pct: s.simd_q1_pct,
          }))}
          nationalAverage={nationalAvg}
        />
      </div>
    </main>
  )
}

function computeNationalAverage(
  scorecards: Array<{ student_count: number | null; active_pct_30d: number | null; simd_q1_pct: number | null }>,
) {
  const sum = (xs: Array<number | null>) => {
    const valid = xs.filter((x): x is number => x != null)
    if (valid.length === 0) return null
    return Math.round((valid.reduce((s, x) => s + x, 0) / valid.length) * 10) / 10
  }
  return {
    students: scorecards.length === 0 ? null : Math.round(scorecards.reduce((s, x) => s + (x.student_count ?? 0), 0) / Math.max(1, scorecards.filter((x) => x.student_count != null).length)),
    active_pct_30d: sum(scorecards.map((x) => x.active_pct_30d)),
    simd_q1_pct: sum(scorecards.map((x) => x.simd_q1_pct)),
  }
}
