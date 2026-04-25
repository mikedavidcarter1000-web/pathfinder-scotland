// Authority-16: national tier dashboard. Reads aggregated metrics from
// mv_national_* materialised views and base tables filtered to schools
// belonging to LAs that have set share_national = true.

import { redirect } from 'next/navigation'
import { getNationalStaffContext } from '@/lib/national/auth'
import { getAdminClient } from '@/lib/admin-auth'
import { NATIONAL_ROLE_LABELS } from '@/lib/national/constants'
import { parseNationalFilters, parseNationalTab, resolveAuthorityScope } from '@/lib/national/filters'
import {
  loadOptedInAuthorities,
  getNationalOverview,
  getAuthorityScorecards,
  getNationalSubjectsData,
  getNationalEquityData,
  getNationalCareersData,
  getNationalEngagementData,
} from '@/lib/national/queries'
import { getLastMaterialisedViewRefresh } from '@/lib/authority/refresh-time'
import { NationalHeader } from '@/components/national/national-header'
import { NationalDashboardTabs } from '@/components/national/dashboard-tabs'
import { NationalDashboardFilterBar } from '@/components/national/dashboard-filter-bar'
import { NationalOverviewTab } from '@/components/national/tabs/overview-tab'
import { NationalSubjectsTab } from '@/components/national/tabs/subjects-tab'
import { NationalEquityTab } from '@/components/national/tabs/equity-tab'
import { NationalCareersTab } from '@/components/national/tabs/careers-tab'
import { NationalEngagementTab } from '@/components/national/tabs/engagement-tab'
import { NationalExportButton } from '@/components/national/national-export-button'

export const dynamic = 'force-dynamic'

export default async function NationalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const ctx = await getNationalStaffContext()
  if (!ctx) redirect('/auth/sign-in?redirect=/national/dashboard')

  const admin = getAdminClient()
  if (!admin) {
    return <p style={{ padding: '32px' }}>Service unavailable.</p>
  }

  const filters = parseNationalFilters(sp)
  const tab = parseNationalTab(sp)

  const [authorities, refreshTimestamp] = await Promise.all([
    loadOptedInAuthorities(admin),
    getLastMaterialisedViewRefresh(admin),
  ])

  const scopedCodes = resolveAuthorityScope(filters, authorities)

  if (authorities.length === 0) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '1200px' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e' }}>
            National dashboard
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontSize: '0.9375rem' }}>
            No local authorities have opted in to national data sharing yet. Once an LA admin enables sharing in their authority settings, their aggregated data will appear here.
          </p>
        </div>
      </main>
    )
  }

  const overview = await getNationalOverview(admin, authorities, scopedCodes, filters, refreshTimestamp)

  const scorecards = tab === 'overview'
    ? await getAuthorityScorecards(admin, authorities, scopedCodes, filters)
    : []

  const subjectsData = tab === 'subjects'
    ? await getNationalSubjectsData(admin, authorities, scopedCodes, filters)
    : null

  const equityData = tab === 'equity'
    ? await getNationalEquityData(admin, authorities, scopedCodes, filters)
    : null

  const careersData = tab === 'careers'
    ? await getNationalCareersData(admin, authorities, scopedCodes, filters)
    : null

  const engagementData = tab === 'engagement'
    ? await getNationalEngagementData(admin, authorities, scopedCodes, filters)
    : null

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="pf-container" style={{ padding: '32px 16px', maxWidth: '1280px' }}>
        <NationalHeader
          staffName={ctx.fullName}
          organisation={`${ctx.organisation} · ${NATIONAL_ROLE_LABELS[ctx.role]}`}
          overview={overview}
          refreshTimestamp={refreshTimestamp}
        />

        <NationalDashboardTabs />

        <NationalDashboardFilterBar
          authorityOptions={authorities.map((a) => ({
            code: a.code,
            name: a.name,
            is_challenge_authority: a.is_challenge_authority,
          }))}
          appliedAuthorityCount={scopedCodes.length}
        />

        {ctx.canExportData && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <NationalExportButton tab={tab} />
          </div>
        )}

        {tab === 'overview' && (
          <NationalOverviewTab overview={overview} scorecards={scorecards} />
        )}
        {tab === 'subjects' && subjectsData && (
          <NationalSubjectsTab data={subjectsData} />
        )}
        {tab === 'equity' && equityData && (
          <NationalEquityTab data={equityData} />
        )}
        {tab === 'careers' && careersData && (
          <NationalCareersTab data={careersData} />
        )}
        {tab === 'engagement' && engagementData && (
          <NationalEngagementTab data={engagementData} />
        )}
      </div>
    </main>
  )
}
