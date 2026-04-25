import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import { parseAuthorityFilters, resolveSchoolScope } from '@/lib/authority/filters'
import {
  countStudentsInScope,
  loadSchoolFilterContext,
} from '@/lib/authority/queries'
import {
  getCareersTabData,
  type CareersTabData,
} from '@/lib/authority/careers-queries'
import { formatCohortValue } from '@/lib/authority/disclosure'

export const runtime = 'nodejs'

/**
 * GET /api/authority/careers/export?format=csv|xlsx&[filter params]
 *
 * Returns the current Careers-tab view as a CSV (flat: sector exploration +
 * pathway split summary) or a multi-sheet Excel workbook covering each
 * subsection. Filters are read from the same querystring used by the
 * dashboard so the file matches what the user sees on screen.
 *
 * Authorisation: any verified authority staff member with `can_export_data`;
 * QIO scope is enforced via `resolveSchoolScope`. Disclosure control is
 * applied at the data layer; this route serialises pre-suppressed values via
 * `formatCohortValue` (counts) and explicit `< 5` strings.
 */
export async function GET(req: Request) {
  const guard = await requireAuthorityStaffApi({ mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (!ctx.canExportData) {
    return NextResponse.json(
      { error: 'Export permission not granted for this account' },
      { status: 403 },
    )
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
  const filters = parseAuthorityFilters(sp)

  // Resolve QIO scope -- never trust the client-supplied schoolIds alone.
  // Fail closed for QIOs whose `assigned_school_ids` is missing/malformed.
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
  const data = await getCareersTabData(
    admin,
    ctx.authorityName,
    filters,
    scopedSchoolIds,
    totalInScope,
  )

  // Audit log -- best effort; never block the export.
  const ip = clientIp(req)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (admin as any)
    .from('authority_audit_log')
    .insert({
      authority_id: ctx.authorityId,
      staff_id: ctx.staffId,
      action: 'export',
      resource: `careers:${format}`,
      filters_applied: serialiseFilters(filters, scopedSchoolIds),
      ip_address: ip,
    })
    .then(() => undefined, () => undefined)

  const datestamp = todayDatestamp()
  const safeAuthority = sanitiseFilenamePart(ctx.authorityName)

  if (format === 'csv') {
    const csv = buildCareersCsv(data)
    const filename = `pathfinder-${safeAuthority}-careers-${datestamp}.csv`
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
  const filename = `pathfinder-${safeAuthority}-careers-${datestamp}.xlsx`
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
// CSV (flat: sector rows + pathway split + concentration)
// ---------------------------------------------------------------------------

function buildCareersCsv(data: CareersTabData): string {
  const lines: string[] = []
  lines.push('Section,Item,Students,Percentage,Notes')

  // Sector exploration
  for (const s of data.sector_exploration) {
    if (s.unique_students == null || s.unique_students === 0) continue
    lines.push(csvRow([
      'Career sector',
      s.sector_name,
      formatCohortValue(s.unique_students),
      s.percentage_of_cohort != null ? `${s.percentage_of_cohort.toFixed(1)}%` : '',
      `Female: ${formatCohortValue(s.gender_breakdown.female)}; Male: ${formatCohortValue(s.gender_breakdown.male)}; Q1: ${formatCohortValue(s.simd_breakdown.Q1)}; Q5: ${formatCohortValue(s.simd_breakdown.Q5)}`,
    ]))
  }

  // Pathway split
  for (const r of data.pathway_split.rows) {
    lines.push(csvRow([
      'Pathway interest',
      r.label,
      formatCohortValue(r.unique_students),
      r.percentage != null ? `${r.percentage.toFixed(1)}%` : '',
      '',
    ]))
  }

  // Concentration analysis
  for (const r of data.concentration_analysis) {
    lines.push(csvRow([
      'Sector concentration',
      r.school_name,
      formatCohortValue(r.exploring_students),
      r.avg_sectors_per_student != null ? `${r.avg_sectors_per_student.toFixed(1)} avg` : '',
      r.concentration_flag ?? '',
    ]))
  }

  // DYW summary (when available)
  if (data.dyw) {
    lines.push(csvRow([
      'DYW summary',
      'Total employers',
      String(data.dyw.total_employers),
      '',
      `${data.dyw.sectors_covered.length} sectors covered`,
    ]))
    lines.push(csvRow([
      'DYW summary',
      'Total placements',
      formatCohortValue(data.dyw.total_placements),
      '',
      `${formatCohortValue(data.dyw.unique_placement_students)} unique students placed`,
    ]))
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

// ---------------------------------------------------------------------------
// Excel multi-sheet
// ---------------------------------------------------------------------------

function buildWorkbook(
  data: CareersTabData,
  authorityName: string,
  filters: ReturnType<typeof parseAuthorityFilters>,
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Sector exploration
  const sectorRows = data.sector_exploration
    .filter((s) => s.unique_students != null && s.unique_students > 0)
    .map((s) => ({
      Sector: s.sector_name,
      'Unique students': formatCohortValue(s.unique_students),
      '% of cohort': s.percentage_of_cohort != null ? `${s.percentage_of_cohort.toFixed(1)}%` : '',
      Events: formatCohortValue(s.total_events),
      Female: formatCohortValue(s.gender_breakdown.female),
      Male: formatCohortValue(s.gender_breakdown.male),
      Other: formatCohortValue(s.gender_breakdown.other),
      Q1: formatCohortValue(s.simd_breakdown.Q1),
      Q2: formatCohortValue(s.simd_breakdown.Q2),
      Q3: formatCohortValue(s.simd_breakdown.Q3),
      Q4: formatCohortValue(s.simd_breakdown.Q4),
      Q5: formatCohortValue(s.simd_breakdown.Q5),
    }))
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(sectorRows.length > 0
      ? sectorRows
      : [{ Sector: '(no exploration recorded)' }]),
    'Sector exploration',
  )

  // Sheet 2: Concentration analysis
  const concentrationRows = data.concentration_analysis.map((r) => ({
    School: r.school_name,
    Cohort: formatCohortValue(r.student_count),
    'Exploring students': formatCohortValue(r.exploring_students),
    'Distinct sectors': r.sectors_explored ?? '',
    'Avg sectors per exploring student': r.avg_sectors_per_student ?? '',
    Concentration: r.concentration_flag ?? '',
  }))
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(concentrationRows.length > 0
      ? concentrationRows
      : [{ School: '(no schools in scope)' }]),
    'Concentration',
  )

  // Sheet 3: Pathway interest split
  const pathwayRows = data.pathway_split.rows.map((r) => ({
    Pathway: r.label,
    Students: formatCohortValue(r.unique_students),
    '% of cohort': r.percentage != null ? `${r.percentage.toFixed(1)}%` : '',
  }))
  if (data.pathway_split.q1) {
    pathwayRows.push({ Pathway: '', Students: '', '% of cohort': '' })
    pathwayRows.push({ Pathway: `--- Q1 cohort (${data.pathway_split.q1.cohort_size}) ---`, Students: '', '% of cohort': '' })
    for (const r of data.pathway_split.q1.rows) {
      pathwayRows.push({
        Pathway: `Q1: ${r.label}`,
        Students: formatCohortValue(r.unique_students),
        '% of cohort': r.percentage != null ? `${r.percentage.toFixed(1)}%` : '',
      })
    }
  }
  if (data.pathway_split.q5) {
    pathwayRows.push({ Pathway: '', Students: '', '% of cohort': '' })
    pathwayRows.push({ Pathway: `--- Q5 cohort (${data.pathway_split.q5.cohort_size}) ---`, Students: '', '% of cohort': '' })
    for (const r of data.pathway_split.q5.rows) {
      pathwayRows.push({
        Pathway: `Q5: ${r.label}`,
        Students: formatCohortValue(r.unique_students),
        '% of cohort': r.percentage != null ? `${r.percentage.toFixed(1)}%` : '',
      })
    }
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pathwayRows), 'Pathway split')

  // Sheet 4: Pathway plans (placeholder)
  const pathwayPlansRows = data.pathway_plans
    ? [{ Status: 'Available', Detail: 'Pathway plan data is wired up.' }]
    : [{
        Status: 'Not yet available',
        Detail: 'Pathway plan data will appear when the pathway planner tool is wired into the student dashboard.',
      }]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pathwayPlansRows), 'Pathway plans')

  // Sheet 5: Saved courses
  if (data.saved_courses) {
    const sc = data.saved_courses
    const headerRows = [
      { Section: 'Total saves', Value: formatCohortValue(sc.total_saves) },
      { Section: 'Students saving', Value: formatCohortValue(sc.unique_students_saving) },
      { Section: 'Avg saves per student', Value: sc.avg_saves_per_student != null ? sc.avg_saves_per_student.toFixed(1) : '' },
      { Section: '', Value: '' },
      { Section: '--- Per school ---', Value: '' },
    ]
    const perSchool = sc.per_school.map((r) => ({
      Section: `School: ${r.school_name}`,
      Value: `Students saving: ${formatCohortValue(r.saving_students)}; Avg saves: ${r.avg_saves != null ? r.avg_saves.toFixed(1) : '—'}`,
    }))
    const topCourses = sc.top_courses.length > 0
      ? [
          { Section: '', Value: '' },
          { Section: '--- Top saved courses ---', Value: '' },
          ...sc.top_courses.map((c) => ({
            Section: `${c.course_name}${c.university_name ? ` (${c.university_name})` : ''}`,
            Value: formatCohortValue(c.save_count),
          })),
        ]
      : []
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([...headerRows, ...perSchool, ...topCourses]),
      'Saved courses',
    )
  } else {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Note: 'Saved-course data not yet available.' }]),
      'Saved courses',
    )
  }

  // Sheet 6: Personal statements
  if (data.personal_statements) {
    const ps = data.personal_statements
    const rows: Array<Record<string, string>> = [
      { Metric: 'Senior phase students', Value: formatCohortValue(ps.senior_phase_total) },
      { Metric: 'Started a draft', Value: formatCohortValue(ps.started_count) },
      { Metric: '% started', Value: ps.started_percentage != null ? `${ps.started_percentage.toFixed(1)}%` : '' },
      { Metric: '', Value: '' },
      { Metric: '--- Per school (S5/S6) ---', Value: '' },
    ]
    for (const r of ps.per_school) {
      rows.push({
        Metric: r.school_name,
        Value: `S5/S6: ${formatCohortValue(r.senior_phase_total)}; Started: ${formatCohortValue(r.started_count)}; %: ${r.percentage != null ? `${r.percentage.toFixed(1)}%` : '—'}`,
      })
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Personal statements')
  } else {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Note: 'Personal statement data not yet available.' }]),
      'Personal statements',
    )
  }

  // Sheet 7: DYW
  if (data.dyw) {
    const dyw = data.dyw
    const headerRows: Array<Record<string, string>> = [
      { Section: 'Total employers', Value: String(dyw.total_employers) },
      { Section: 'Total placements', Value: formatCohortValue(dyw.total_placements) },
      { Section: 'Students placed', Value: formatCohortValue(dyw.unique_placement_students) },
      { Section: 'Sectors covered', Value: String(dyw.sectors_covered.length) },
      { Section: '', Value: '' },
      { Section: '--- Sectors covered ---', Value: '' },
    ]
    for (const s of dyw.sectors_covered) {
      headerRows.push({ Section: s.sector_name, Value: `${s.employer_count} employer${s.employer_count === 1 ? '' : 's'}` })
    }
    headerRows.push({ Section: '', Value: '' })
    headerRows.push({ Section: '--- Per school ---', Value: '' })
    for (const r of dyw.per_school) {
      headerRows.push({
        Section: r.school_name,
        Value: `Employers: ${r.employer_count}; Placements: ${formatCohortValue(r.placement_count)}; Students placed: ${formatCohortValue(r.placement_students)}`,
      })
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(headerRows), 'DYW')
  } else {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Note: 'DYW data not yet available.' }]),
      'DYW',
    )
  }

  // Sheet 8: Articulation
  if (data.articulation) {
    const a = data.articulation
    const rows: Array<Record<string, string>> = [
      { Section: 'Unique students viewing articulation', Value: formatCohortValue(a.unique_students) },
      { Section: 'Total views', Value: formatCohortValue(a.total_events) },
      { Section: '', Value: '' },
      { Section: '--- Top routes ---', Value: '' },
    ]
    for (const r of a.top_routes) {
      rows.push({
        Section: r.display_label,
        Value: `Unique: ${formatCohortValue(r.unique_students)}; Views: ${formatCohortValue(r.view_count)}`,
      })
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Articulation')
  } else {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Note: 'Articulation route interest data not yet available.' }]),
      'Articulation',
    )
  }

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
    { Field: 'Schools reporting engagement', Value: String(data.data_completeness_schools) },
    { Field: 'Total students in scope', Value: formatCohortValue(data.total_students_in_scope) },
    { Field: 'Sectors explored', Value: `${data.total_sectors_explored} of ${data.total_sectors_available}` },
    { Field: 'Disclosure threshold', Value: 'Cohorts < 5 are suppressed' },
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(meta), 'Filters applied')

  return wb
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
