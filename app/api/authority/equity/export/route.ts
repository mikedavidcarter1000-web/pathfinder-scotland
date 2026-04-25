import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import { parseAuthorityFilters, resolveSchoolScope } from '@/lib/authority/filters'
import {
  countStudentsInScope,
  loadSchoolFilterContext,
} from '@/lib/authority/queries'
import {
  getEquityTabData,
  type EquityTabData,
  type DemographicGroupMetrics,
} from '@/lib/authority/equity-queries'
import { formatCohortValue } from '@/lib/authority/disclosure'

export const runtime = 'nodejs'

/**
 * GET /api/authority/equity/export?format=csv|xlsx&[filter params]
 *
 * Returns the current Equity-tab view as a CSV (flat: SIMD gap + group
 * summaries) or a multi-sheet Excel workbook (SIMD gap, five demographic
 * groups, gender gap, WA tool usage, plus a "Filters applied" metadata
 * sheet). Filters are read from the same querystring used by the dashboard
 * so the file matches what the user sees on screen.
 *
 * Authorisation: any verified authority staff member; QIO scope is enforced
 * via `resolveSchoolScope`. Every successful export is logged to
 * `authority_audit_log` with the filters applied. Disclosure control is
 * applied at the data layer; this route serialises pre-suppressed values
 * via `formatCohortValue` (counts) and explicit `< 5` strings.
 */
export async function GET(req: Request) {
  const guard = await requireAuthorityStaffApi({ mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (!ctx.canExportData) {
    return NextResponse.json({ error: 'Export permission not granted for this account' }, { status: 403 })
  }

  const url = new URL(req.url)
  const formatRaw = (url.searchParams.get('format') ?? 'csv').toLowerCase()
  if (formatRaw !== 'csv' && formatRaw !== 'xlsx') {
    return NextResponse.json({ error: 'format must be csv or xlsx' }, { status: 400 })
  }
  const format = formatRaw as 'csv' | 'xlsx'

  // Parse filters from the querystring. Same parser the page uses; it
  // validates schoolIds against the UUID pattern and ignores anything bad.
  const sp: Record<string, string | string[]> = {}
  for (const [k, v] of url.searchParams.entries()) {
    const ex = sp[k]
    if (typeof ex === 'string') sp[k] = [ex, v]
    else if (Array.isArray(ex)) ex.push(v)
    else sp[k] = v
  }
  const filters = parseAuthorityFilters(sp)

  // Resolve QIO scope -- never trust the client-supplied schoolIds alone.
  // For QIOs, default to the empty list when assigned_school_ids is missing
  // or malformed -- failing closed prevents an unrestricted export.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('authority_staff')
    .select('assigned_school_ids')
    .eq('id', ctx.staffId)
    .maybeSingle()
  let qioAssignedIds: string[] | null = null
  if (ctx.role === 'qio') {
    qioAssignedIds = Array.isArray(staff?.assigned_school_ids)
      ? (staff.assigned_school_ids as string[])
      : []
  }

  const filterCtx = await loadSchoolFilterContext(admin, ctx.authorityName, qioAssignedIds)
  const scopedSchoolIds = resolveSchoolScope(
    filters.schoolIds,
    filterCtx.schoolOptions,
    qioAssignedIds,
  )

  if (scopedSchoolIds.length === 0) {
    return NextResponse.json({ error: 'No schools in scope' }, { status: 404 })
  }

  const totalInScope = await countStudentsInScope(admin, scopedSchoolIds, filters)
  const data = await getEquityTabData(
    admin,
    ctx.authorityName,
    filters,
    scopedSchoolIds,
    totalInScope,
  )

  // Audit log -- best effort; do not block the export if it fails.
  const ip = clientIp(req)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (admin as any)
    .from('authority_audit_log')
    .insert({
      authority_id: ctx.authorityId,
      staff_id: ctx.staffId,
      action: 'export',
      resource: `equity:${format}`,
      filters_applied: serialiseFilters(filters, scopedSchoolIds),
      ip_address: ip,
    })
    .then(() => undefined, () => undefined)

  const datestamp = todayDatestamp()
  const safeAuthority = sanitiseFilenamePart(ctx.authorityName)

  if (format === 'csv') {
    const csv = buildEquityCsv(data)
    const filename = `pathfinder-${safeAuthority}-equity-${datestamp}.csv`
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  const workbook = buildWorkbook(data, ctx.authorityName, filters)
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  const filename = `pathfinder-${safeAuthority}-equity-${datestamp}.xlsx`
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

// ---------------------------------------------------------------------------
// CSV (flat: SIMD gap rows then group summaries)
// ---------------------------------------------------------------------------

function buildEquityCsv(data: EquityTabData): string {
  const lines: string[] = []
  lines.push('Section,Metric,Group / Q1,Other / Q5,Gap,Direction / Notes')

  for (const m of data.simd_gap.metrics) {
    lines.push(csvRow(['SIMD gap', m.metric_name, formatNumeric(m.q1_value, m.metric_unit), formatNumeric(m.q5_value, m.metric_unit), formatGapForCsv(m.gap, m.metric_unit), m.gap_direction ?? '']))
  }

  const groups: DemographicGroupMetrics[] = [
    data.demographic_groups.care_experienced,
    data.demographic_groups.fsm,
    data.demographic_groups.asn,
    data.demographic_groups.eal,
    data.demographic_groups.young_carer,
  ]
  for (const g of groups) {
    if (g.suppressed) {
      lines.push(csvRow([g.group_label, 'Cohort size', '< 5', '', '', 'Suppressed (cohort < 5)']))
      continue
    }
    lines.push(csvRow([g.group_label, 'Cohort size', formatCohortValue(g.cohort_size), formatCohortValue(g.comparison_cohort_size), '', g.percentage_of_cohort != null ? `${g.percentage_of_cohort.toFixed(1)}% of total` : '']))
    lines.push(csvRow([g.group_label, 'Avg subjects per student', formatAvg(g.subject_count_avg), formatAvg(g.comparison_subject_count_avg), formatGapNum(g.subject_count_avg, g.comparison_subject_count_avg), '']))
    lines.push(csvRow([g.group_label, 'Active in last 30d (%)', formatPctNum(g.engagement_rate_pct), formatPctNum(g.comparison_engagement_rate_pct), formatGapNum(g.engagement_rate_pct, g.comparison_engagement_rate_pct, 'pp'), '']))
    lines.push(csvRow([g.group_label, 'Career sectors explored avg', formatAvg(g.career_sectors_explored_avg), formatAvg(g.comparison_career_sectors_explored_avg), formatGapNum(g.career_sectors_explored_avg, g.comparison_career_sectors_explored_avg), '']))
  }

  return lines.join('\n')
}

function csvRow(cells: string[]): string {
  return cells.map(csvEscape).join(',')
}

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function formatNumeric(v: number | null, unit: 'count' | 'percent' | 'avg'): string {
  if (v == null) return ''
  if (unit === 'percent') return `${v.toFixed(1)}%`
  if (unit === 'avg') return v.toFixed(1)
  return v.toLocaleString('en-GB')
}

function formatGapForCsv(v: number | null, unit: 'count' | 'percent' | 'avg'): string {
  if (v == null) return ''
  if (unit === 'percent') return `${v.toFixed(1)}pp`
  return v.toFixed(1)
}

function formatPctNum(v: number | null): string {
  if (v == null) return ''
  return `${v.toFixed(1)}%`
}

function formatAvg(v: number | null): string {
  if (v == null) return ''
  return v.toFixed(1)
}

function formatGapNum(group: number | null, comparison: number | null, suffix?: 'pp'): string {
  if (group == null || comparison == null) return ''
  const diff = group - comparison
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)}${suffix ?? ''}`
}

// ---------------------------------------------------------------------------
// Excel multi-sheet
// ---------------------------------------------------------------------------

function buildWorkbook(
  data: EquityTabData,
  authorityName: string,
  filters: ReturnType<typeof parseAuthorityFilters>,
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()

  // Sheet 1: SIMD gap
  const simdRows: Array<Record<string, string | number>> = []
  for (const m of data.simd_gap.metrics) {
    simdRows.push({
      Metric: m.metric_name,
      Notes: m.notes ?? '',
      'Q1 value': formatNumeric(m.q1_value, m.metric_unit),
      'Q5 value': formatNumeric(m.q5_value, m.metric_unit),
      Gap: formatGapForCsv(m.gap, m.metric_unit),
      Direction: m.gap_direction ?? '',
      'Schools (per-school breakdown)': m.per_school.length,
    })
    // Per-school rows indented underneath
    for (const ps of m.per_school) {
      simdRows.push({
        Metric: `  ↳ ${ps.school_name}`,
        Notes: '',
        'Q1 value': formatNumeric(ps.q1_value, m.metric_unit),
        'Q5 value': formatNumeric(ps.q5_value, m.metric_unit),
        Gap: formatGapForCsv(ps.gap, m.metric_unit),
        Direction: '',
        'Schools (per-school breakdown)': '',
      })
    }
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(simdRows), 'SIMD gap')

  // Sheets 2-6: demographic groups
  appendGroupSheet(wb, 'Care-experienced', data.demographic_groups.care_experienced)
  appendGroupSheet(wb, 'FSM', data.demographic_groups.fsm)
  appendGroupSheet(wb, 'ASN', data.demographic_groups.asn)
  appendGroupSheet(wb, 'EAL', data.demographic_groups.eal)
  appendGroupSheet(wb, 'Young carers', data.demographic_groups.young_carer)

  // Sheet 7: Gender gap
  const genderRows = data.gender_gap.map((r) => ({
    Subject: r.subject_name,
    Category: r.subject_category ?? '',
    Female: formatCohortValue(r.female_count),
    'Female %': r.female_percentage != null ? `${r.female_percentage.toFixed(1)}%` : '',
    Male: formatCohortValue(r.male_count),
    'Male %': r.male_percentage != null ? `${r.male_percentage.toFixed(1)}%` : '',
    Total: formatCohortValue(r.total_count),
    'Gap (pp)': r.gap_percentage_points != null ? r.gap_percentage_points.toFixed(1) : '',
    Direction: r.direction ?? '',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(genderRows), 'Gender gap')

  // Sheet 8: WA tool usage
  const waRows = data.wa_tool_usage.map((r) => ({
    Tool: r.tool_label,
    'Q1 users': formatCohortValue(r.q1_unique_users),
    'Q1 %': r.q1_percentage != null ? `${r.q1_percentage.toFixed(1)}%` : '',
    'Q5 users': formatCohortValue(r.q5_unique_users),
    'Q5 %': r.q5_percentage != null ? `${r.q5_percentage.toFixed(1)}%` : '',
    'Gap (pp)': r.gap_percentage_points != null ? r.gap_percentage_points.toFixed(1) : '',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(waRows), 'WA tool usage')

  // Sheet 9: Filters applied (metadata)
  const meta: Array<{ Field: string; Value: string }> = [
    { Field: 'Authority', Value: authorityName },
    { Field: 'Generated at', Value: new Date().toISOString() },
    { Field: 'Academic year', Value: String(filters.academicYear) },
    { Field: 'Term', Value: String(filters.term) },
    { Field: 'Year groups', Value: filters.yearGroups.length === 0 ? 'All' : filters.yearGroups.join(', ') },
    { Field: 'SIMD quintiles', Value: filters.simdQuintiles.length === 0 ? 'All' : filters.simdQuintiles.join(', ') },
    { Field: 'Genders', Value: filters.genders.length === 0 ? 'All' : filters.genders.join(', ') },
    { Field: 'School filter', Value: filters.schoolIds.length === 0 ? 'All in scope' : `${filters.schoolIds.length} selected` },
    { Field: 'Schools in scope', Value: String(data.scope_school_count) },
    { Field: 'Schools reporting subject data', Value: String(data.data_completeness_schools) },
    { Field: 'Q1 cohort size', Value: formatCohortValue(data.simd_gap.q1_cohort_size) },
    { Field: 'Q5 cohort size', Value: formatCohortValue(data.simd_gap.q5_cohort_size) },
    { Field: 'Demographic data completeness', Value: `${data.data_completeness.overall_demographic_pct}%` },
    { Field: 'Disclosure threshold', Value: 'Cohorts < 5 are suppressed' },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(meta), 'Filters applied')

  return wb
}

function appendGroupSheet(
  wb: XLSX.WorkBook,
  sheetName: string,
  group: DemographicGroupMetrics,
): void {
  if (group.suppressed) {
    const sheet = XLSX.utils.aoa_to_sheet([
      [sheetName],
      ['Cohort suppressed (fewer than 5 students). Increase demographic flag completeness in schools to unlock this section.'],
    ])
    XLSX.utils.book_append_sheet(wb, sheet, sheetName)
    return
  }

  const rows: Array<Record<string, string | number>> = [
    { Metric: 'Cohort size', 'Group value': formatCohortValue(group.cohort_size), 'Comparison value': formatCohortValue(group.comparison_cohort_size), 'Gap (group - comparison)': '' },
    { Metric: 'Percentage of total cohort', 'Group value': group.percentage_of_cohort != null ? `${group.percentage_of_cohort.toFixed(1)}%` : '', 'Comparison value': '', 'Gap (group - comparison)': '' },
    { Metric: 'Average subjects per student', 'Group value': formatAvg(group.subject_count_avg), 'Comparison value': formatAvg(group.comparison_subject_count_avg), 'Gap (group - comparison)': formatGapNum(group.subject_count_avg, group.comparison_subject_count_avg) },
    { Metric: 'Active in last 30 days (%)', 'Group value': formatPctNum(group.engagement_rate_pct), 'Comparison value': formatPctNum(group.comparison_engagement_rate_pct), 'Gap (group - comparison)': formatGapNum(group.engagement_rate_pct, group.comparison_engagement_rate_pct, 'pp') },
    { Metric: 'Average career sectors explored', 'Group value': formatAvg(group.career_sectors_explored_avg), 'Comparison value': formatAvg(group.comparison_career_sectors_explored_avg), 'Gap (group - comparison)': formatGapNum(group.career_sectors_explored_avg, group.comparison_career_sectors_explored_avg) },
    { Metric: 'Pathway plans created (%)', 'Group value': 'Not yet available', 'Comparison value': 'Not yet available', 'Gap (group - comparison)': '' },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? null
  return req.headers.get('x-real-ip')
}

function todayDatestamp(): string {
  const d = new Date()
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function sanitiseFilenamePart(s: string): string {
  return s.replace(/[^a-z0-9-]+/gi, '-').toLowerCase().replace(/^-+|-+$/g, '') || 'authority'
}

function serialiseFilters(
  filters: ReturnType<typeof parseAuthorityFilters>,
  scopedSchoolIds: string[],
): Record<string, unknown> {
  return {
    academicYear: filters.academicYear,
    term: filters.term,
    yearGroups: filters.yearGroups,
    simdQuintiles: filters.simdQuintiles,
    genders: filters.genders,
    schoolFilterCount: filters.schoolIds.length,
    scopeSchoolCount: scopedSchoolIds.length,
  }
}
