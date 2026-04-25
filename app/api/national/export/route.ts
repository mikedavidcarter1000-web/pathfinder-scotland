import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { requireNationalStaffApi, logNationalAction } from '@/lib/national/auth'
import {
  parseNationalFilters,
  parseNationalTab,
  resolveAuthorityScope,
  type NationalDashboardTab,
} from '@/lib/national/filters'
import {
  loadOptedInAuthorities,
  getNationalOverview,
  getAuthorityScorecards,
  getNationalSubjectsData,
  getNationalEquityData,
  getNationalCareersData,
  getNationalEngagementData,
} from '@/lib/national/queries'
import { formatCohortValue } from '@/lib/authority/disclosure'

export const runtime = 'nodejs'

/**
 * GET /api/national/export?tab=overview|subjects|equity|careers|engagement&format=csv|xlsx&[filter params]
 *
 * Returns the current national-tier view as CSV (headline rows) or a
 * multi-sheet Excel workbook (one sheet per data section). All exports are
 * logged to `national_audit_log` with the staff_id and the filters applied.
 */
export async function GET(req: Request) {
  const guard = await requireNationalStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (!ctx.canExportData) {
    return NextResponse.json({ error: 'Export permission not granted' }, { status: 403 })
  }

  const url = new URL(req.url)
  const formatRaw = (url.searchParams.get('format') ?? 'csv').toLowerCase()
  if (formatRaw !== 'csv' && formatRaw !== 'xlsx') {
    return NextResponse.json({ error: 'format must be csv or xlsx' }, { status: 400 })
  }
  const format = formatRaw as 'csv' | 'xlsx'

  const sp: Record<string, string | string[]> = {}
  for (const [k, v] of url.searchParams.entries()) {
    const ex = sp[k]
    if (typeof ex === 'string') sp[k] = [ex, v]
    else if (Array.isArray(ex)) ex.push(v)
    else sp[k] = v
  }
  const filters = parseNationalFilters(sp)
  const tab: NationalDashboardTab = parseNationalTab(sp)

  const authorities = await loadOptedInAuthorities(admin)
  if (authorities.length === 0) {
    return NextResponse.json({ error: 'No opted-in authorities yet' }, { status: 404 })
  }
  const scopedCodes = resolveAuthorityScope(filters, authorities)
  if (scopedCodes.length === 0) {
    return NextResponse.json({ error: 'No authorities in scope' }, { status: 404 })
  }

  // Audit log -- await so the row is durably written before the response
  // returns. Serverless runtimes can drop fire-and-forget work mid-flight,
  // and a missed audit row defeats the purpose of the log.
  await logNationalAction(admin, ctx.staffId, 'export', `national:${tab}:${format}`, {
    tab,
    format,
    academicYear: filters.academicYear,
    challengeOnly: filters.challengeOnly,
    yearGroups: filters.yearGroups,
    simdQuintiles: filters.simdQuintiles,
    genders: filters.genders,
    authorityCount: scopedCodes.length,
  })

  const datestamp = todayDatestamp()
  const filenameBase = `pathfinder-national-${tab}-${datestamp}`

  if (format === 'csv') {
    const csv = await buildCsv(admin, authorities, scopedCodes, filters, tab)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  const workbook = await buildWorkbook(admin, authorities, scopedCodes, filters, tab)
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

async function buildCsv(
  admin: Parameters<typeof getAuthorityScorecards>[0],
  authorities: Awaited<ReturnType<typeof loadOptedInAuthorities>>,
  scopedCodes: string[],
  filters: ReturnType<typeof parseNationalFilters>,
  tab: NationalDashboardTab,
): Promise<string> {
  if (tab === 'overview') {
    const scorecards = await getAuthorityScorecards(admin, authorities, scopedCodes, filters)
    const header = ['Authority', 'Code', 'Type', 'Urban/Rural', 'Schools', 'Students', 'Active 30d %', 'SIMD Q1 %', 'Top 3 subjects']
    const rows = scorecards.map((s) => [
      s.authority_name,
      s.authority_code,
      s.is_challenge_authority ? 'Challenge' : 'Standard',
      s.urban_rural,
      String(s.school_count),
      s.student_count == null ? '' : formatCohortValue(s.student_count),
      s.active_pct_30d == null ? '' : `${s.active_pct_30d.toFixed(1)}%`,
      s.simd_q1_pct == null ? '' : `${s.simd_q1_pct.toFixed(1)}%`,
      s.top_3_subjects.map((t) => t.subject_name).join('; '),
    ])
    return toCsv(header, rows)
  }
  if (tab === 'subjects') {
    const data = await getNationalSubjectsData(admin, authorities, scopedCodes, filters)
    const header = ['Subject', 'Category', 'Total students', 'Female %', 'Male %', 'SIMD Q1 %', 'Authorities offering']
    const rows = data.subjects.map((s) => [
      s.subject_name,
      s.subject_category ?? '',
      s.total_students == null ? '' : formatCohortValue(s.total_students),
      s.female_pct == null ? '' : `${s.female_pct.toFixed(1)}%`,
      s.male_pct == null ? '' : `${s.male_pct.toFixed(1)}%`,
      s.q1_pct == null ? '' : `${s.q1_pct.toFixed(1)}%`,
      String(s.authorities_offering),
    ])
    return toCsv(header, rows)
  }
  if (tab === 'equity') {
    const data = await getNationalEquityData(admin, authorities, scopedCodes, filters)
    const header = ['Authority', 'Type', 'Q1 students', 'Q5 students', 'Q1 active %', 'Q5 active %', 'Gap (pp)']
    const rows = data.la_equity_gap.map((r) => [
      r.authority_name,
      r.is_challenge_authority ? 'Challenge' : 'Standard',
      r.q1_count == null ? '' : formatCohortValue(r.q1_count),
      r.q5_count == null ? '' : formatCohortValue(r.q5_count),
      r.q1_active_pct == null ? '' : `${r.q1_active_pct.toFixed(1)}%`,
      r.q5_active_pct == null ? '' : `${r.q5_active_pct.toFixed(1)}%`,
      r.gap_pct_points == null ? '' : r.gap_pct_points.toFixed(1),
    ])
    return toCsv(header, rows)
  }
  if (tab === 'careers') {
    const data = await getNationalCareersData(admin, authorities, scopedCodes, filters)
    const header = ['Sector', 'Unique students', 'Percentage of cohort']
    const rows = data.sector_popularity.map((s) => [
      s.sector_label,
      s.unique_students == null ? '' : formatCohortValue(s.unique_students),
      s.percentage == null ? '' : `${s.percentage.toFixed(1)}%`,
    ])
    return toCsv(header, rows)
  }
  // engagement
  const data = await getNationalEngagementData(admin, authorities, scopedCodes, filters)
  const header = ['Authority', 'Type', 'Students', 'Active %']
  const rows = data.la_activation_ranking.map((r) => [
    r.authority_name,
    r.is_challenge_authority ? 'Challenge' : 'Standard',
    r.student_count == null ? '' : formatCohortValue(r.student_count),
    r.active_pct == null ? '' : `${r.active_pct.toFixed(1)}%`,
  ])
  return toCsv(header, rows)
}

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------

async function buildWorkbook(
  admin: Parameters<typeof getAuthorityScorecards>[0],
  authorities: Awaited<ReturnType<typeof loadOptedInAuthorities>>,
  scopedCodes: string[],
  filters: ReturnType<typeof parseNationalFilters>,
  tab: NationalDashboardTab,
): Promise<XLSX.WorkBook> {
  const wb = XLSX.utils.book_new()

  if (tab === 'overview') {
    const overview = await getNationalOverview(admin, authorities, scopedCodes, filters, null)
    const scorecards = await getAuthorityScorecards(admin, authorities, scopedCodes, filters)
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { Field: 'Authorities opted in', Value: overview.total_authorities_opted_in },
        { Field: 'Schools', Value: overview.total_schools },
        { Field: 'Total students', Value: overview.total_students == null ? '< 5' : overview.total_students },
        { Field: 'Active in last 30 days', Value: overview.active_students_30d == null ? '< 5' : overview.active_students_30d },
        { Field: 'Challenge LAs', Value: overview.challenge_summary.challenge.authority_count },
        { Field: 'Other LAs', Value: overview.challenge_summary.other.authority_count },
      ]),
      'Headline',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        scorecards.map((s) => ({
          Authority: s.authority_name,
          Code: s.authority_code,
          Type: s.is_challenge_authority ? 'Challenge' : 'Standard',
          'Urban/Rural': s.urban_rural,
          Schools: s.school_count,
          Students: s.student_count == null ? '< 5' : s.student_count,
          'Active 30d %': s.active_pct_30d == null ? '' : Math.round(s.active_pct_30d * 10) / 10,
          'SIMD Q1 %': s.simd_q1_pct == null ? '' : Math.round(s.simd_q1_pct * 10) / 10,
          'Top 3 subjects': s.top_3_subjects.map((t) => t.subject_name).join(', '),
        })),
      ),
      'LA scorecards',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        overview.simd_distribution.map((r) => ({
          Quintile: r.quintile,
          Students: r.student_count == null ? '< 5' : r.student_count,
          'Percentage': r.percentage == null ? '' : `${r.percentage}%`,
        })),
      ),
      'SIMD distribution',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        overview.top_subjects_national.map((s) => ({ Subject: s.subject_name, Students: s.student_count })),
      ),
      'Top subjects',
    )
  } else if (tab === 'subjects') {
    const data = await getNationalSubjectsData(admin, authorities, scopedCodes, filters)
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.subjects.map((s) => ({
          Subject: s.subject_name,
          Category: s.subject_category ?? '',
          Students: s.total_students == null ? '< 5' : s.total_students,
          'Female %': s.female_pct == null ? '' : Math.round(s.female_pct * 10) / 10,
          'Male %': s.male_pct == null ? '' : Math.round(s.male_pct * 10) / 10,
          'SIMD Q1 %': s.q1_pct == null ? '' : Math.round(s.q1_pct * 10) / 10,
          'Authorities offering': s.authorities_offering,
        })),
      ),
      'Subject uptake',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.stem_gender.map((s) => ({
          Subject: s.subject_name,
          Female: s.female == null ? '< 5' : s.female,
          Male: s.male == null ? '< 5' : s.male,
          Other: s.other == null ? '< 5' : s.other,
          'Female %': s.female_pct == null ? '' : Math.round(s.female_pct * 10) / 10,
          Total: s.total == null ? '< 5' : s.total,
        })),
      ),
      'STEM gender',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.la_subject_ranking.map((r) => ({
          Subject: r.subject_name,
          'Highest LA': r.high_la?.name ?? '',
          'Highest %': r.high_la?.pct ?? '',
          'Lowest LA': r.low_la?.name ?? '',
          'Lowest %': r.low_la?.pct ?? '',
        })),
      ),
      'LA ranking',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.subject_coverage.map((c) => ({
          Subject: c.subject_name,
          'Authorities offering': c.authorities_offering,
          'Total authorities in scope': c.total_authorities,
        })),
      ),
      'Subject coverage',
    )
  } else if (tab === 'equity') {
    const data = await getNationalEquityData(admin, authorities, scopedCodes, filters)
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { Metric: 'Q1 students', Value: data.simd_summary.q1_count == null ? '< 5' : data.simd_summary.q1_count },
        { Metric: 'Q5 students', Value: data.simd_summary.q5_count == null ? '< 5' : data.simd_summary.q5_count },
        { Metric: 'Q1 active %', Value: data.simd_summary.q1_active_pct ?? '' },
        { Metric: 'Q5 active %', Value: data.simd_summary.q5_active_pct ?? '' },
      ]),
      'National SIMD',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.la_equity_gap.map((r) => ({
          Authority: r.authority_name,
          Type: r.is_challenge_authority ? 'Challenge' : 'Standard',
          'Q1 students': r.q1_count == null ? '< 5' : r.q1_count,
          'Q5 students': r.q5_count == null ? '< 5' : r.q5_count,
          'Q1 active %': r.q1_active_pct ?? '',
          'Q5 active %': r.q5_active_pct ?? '',
          'Gap (pp)': r.gap_pct_points ?? '',
        })),
      ),
      'LA equity gap',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        {
          Group: 'Challenge LAs',
          'Q1 share': data.challenge_vs_other.challenge.q1_pct ?? '',
          'Q1 active %': data.challenge_vs_other.challenge.q1_active_pct ?? '',
        },
        {
          Group: 'Other LAs',
          'Q1 share': data.challenge_vs_other.other.q1_pct ?? '',
          'Q1 active %': data.challenge_vs_other.other.q1_active_pct ?? '',
        },
      ]),
      'Challenge vs other',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.demographic_groups.map((g) => ({
          Group: g.label,
          Students: g.student_count == null ? '< 5' : g.student_count,
          'Active %': g.active_pct ?? '',
        })),
      ),
      'Demographic groups',
    )
  } else if (tab === 'careers') {
    const data = await getNationalCareersData(admin, authorities, scopedCodes, filters)
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.sector_popularity.map((s) => ({
          Sector: s.sector_label,
          'Unique students': s.unique_students == null ? '< 5' : s.unique_students,
          'Percentage': s.percentage ?? '',
        })),
      ),
      'Sector popularity',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.regional_variation.map((r) => ({
          Bucket: r.label,
          Authorities: r.authority_count,
          'Top sector': r.top_sector ?? '',
          'Top sector %': r.top_sector_pct ?? '',
          'Avg sectors / explorer': r.avg_sectors_per_student ?? '',
        })),
      ),
      'Regional variation',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { Pathway: 'University (national)', Percentage: data.pathway_split.university_pct ?? '' },
        { Pathway: 'College (national)', Percentage: data.pathway_split.college_pct ?? '' },
        { Pathway: 'Apprenticeship (national)', Percentage: data.pathway_split.apprenticeship_pct ?? '' },
        { Pathway: 'University (Challenge LAs)', Percentage: data.pathway_split.challenge_university_pct ?? '' },
        { Pathway: 'University (other LAs)', Percentage: data.pathway_split.other_university_pct ?? '' },
      ]),
      'Pathway split',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.la_sector_diversity.map((r) => ({
          Authority: r.authority_name,
          'Avg sectors / explorer': r.avg_sectors_per_student ?? '',
          'Exploring %': r.exploring_pct ?? '',
        })),
      ),
      'LA diversity',
    )
  } else {
    // engagement
    const data = await getNationalEngagementData(admin, authorities, scopedCodes, filters)
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { Metric: 'National active %', Value: data.national_active_pct_30d ?? '' },
        { Metric: 'National active count', Value: data.national_active_count == null ? '< 5' : data.national_active_count },
      ]),
      'Headline',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.la_activation_ranking.map((r) => ({
          Authority: r.authority_name,
          Type: r.is_challenge_authority ? 'Challenge' : 'Standard',
          Students: r.student_count == null ? '< 5' : r.student_count,
          'Active %': r.active_pct ?? '',
        })),
      ),
      'LA activation',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.feature_adoption.map((f) => ({
          Feature: f.feature,
          'Unique students': f.unique_students == null ? '< 5' : f.unique_students,
          Percentage: f.percentage ?? '',
        })),
      ),
      'Feature adoption',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.weekly_trend.map((w) => ({ 'Week starting': w.week_start, 'Unique students': w.unique_students })),
      ),
      'Weekly trend',
    )
  }

  // Filters applied sheet
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([
      { Field: 'Generated at', Value: new Date().toISOString() },
      { Field: 'Tab', Value: tab },
      { Field: 'Academic year', Value: String(filters.academicYear) },
      { Field: 'Year groups', Value: filters.yearGroups.length === 0 ? 'All' : filters.yearGroups.join(', ') },
      { Field: 'SIMD quintiles', Value: filters.simdQuintiles.length === 0 ? 'All' : filters.simdQuintiles.join(', ') },
      { Field: 'Genders', Value: filters.genders.length === 0 ? 'All' : filters.genders.join(', ') },
      { Field: 'Challenge only', Value: filters.challengeOnly ? 'Yes' : 'No' },
      { Field: 'Authorities in scope', Value: scopedCodes.length },
      { Field: 'Disclosure threshold', Value: 'Counts < 5 per LA suppressed' },
    ]),
    'Filters applied',
  )

  return wb
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toCsv(header: string[], rows: string[][]): string {
  const lines: string[] = [header.map(csvEscape).join(',')]
  for (const r of rows) lines.push(r.map(csvEscape).join(','))
  return lines.join('\n')
}

function csvEscape(s: string): string {
  // Formula-injection guard: cells starting with =, +, -, @, tab or CR can
  // be interpreted as formulas in Excel/LibreOffice and execute when opened.
  // Authority/subject/sector strings are DB-controlled but partially user
  // editable, so prefix with a single quote to neutralise.
  if (/^[=+\-@\t\r]/.test(s)) {
    s = "'" + s
  }
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function todayDatestamp(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
