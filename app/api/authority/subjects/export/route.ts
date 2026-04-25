import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import { parseAuthorityFilters, resolveSchoolScope } from '@/lib/authority/filters'
import {
  countStudentsInScope,
  loadSchoolFilterContext,
} from '@/lib/authority/queries'
import {
  getSubjectsTabData,
  type SubjectsTabData,
} from '@/lib/authority/subjects-queries'
import { formatCohortValue } from '@/lib/authority/disclosure'

export const runtime = 'nodejs'

/**
 * GET /api/authority/subjects/export?format=csv|xlsx&[filter params]
 *
 * Returns the current Subjects-tab view as a CSV (subject uptake only) or
 * a multi-sheet Excel workbook (uptake, STEM gender, curriculum breadth,
 * heatmap matrix). Filters are read from the same querystring used by the
 * dashboard so the file matches what the user sees on screen.
 *
 * Authorisation: any verified authority staff member; QIO scope is enforced
 * via `resolveSchoolScope`. Every successful export is logged to
 * `authority_audit_log` with the filters applied.
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (admin as any)
    .from('authority_staff')
    .select('assigned_school_ids')
    .eq('id', ctx.staffId)
    .maybeSingle()
  // For QIOs, default to the empty list when assigned_school_ids is missing
  // or malformed -- failing closed prevents an unrestricted export.
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
  const data = await getSubjectsTabData(
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
      resource: `subjects:${format}`,
      filters_applied: serialiseFilters(filters, scopedSchoolIds),
      ip_address: ip,
    })
    .then(() => undefined, () => undefined)

  const datestamp = todayDatestamp()
  const safeAuthority = sanitiseFilenamePart(ctx.authorityName)

  if (format === 'csv') {
    const csv = buildSubjectUptakeCsv(data)
    const filename = `pathfinder-${safeAuthority}-subjects-${datestamp}.csv`
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
  const filename = `pathfinder-${safeAuthority}-subjects-${datestamp}.xlsx`
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
// CSV
// ---------------------------------------------------------------------------

function buildSubjectUptakeCsv(data: SubjectsTabData): string {
  const header = [
    'Subject',
    'Category',
    'Students',
    '% of cohort',
    'Female',
    'Female %',
    'Male',
    'Male %',
    'Other',
    'SIMD Q1',
    'SIMD Q1 %',
    'SIMD Q2',
    'SIMD Q2 %',
    'SIMD Q3',
    'SIMD Q3 %',
    'SIMD Q4',
    'SIMD Q4 %',
    'SIMD Q5',
    'SIMD Q5 %',
  ]
  const lines: string[] = [header.map(csvEscape).join(',')]
  for (const r of data.uptake) {
    const row = [
      r.subject_name,
      r.subject_category ?? '',
      formatCohortValue(r.student_count),
      formatPercent(r.percentage),
      formatCohortValue(r.gender_breakdown.female),
      formatPercent(r.gender_percentages.female),
      formatCohortValue(r.gender_breakdown.male),
      formatPercent(r.gender_percentages.male),
      formatCohortValue(r.gender_breakdown.other),
      formatCohortValue(r.simd_breakdown.Q1),
      formatPercent(r.simd_percentages.Q1),
      formatCohortValue(r.simd_breakdown.Q2),
      formatPercent(r.simd_percentages.Q2),
      formatCohortValue(r.simd_breakdown.Q3),
      formatPercent(r.simd_percentages.Q3),
      formatCohortValue(r.simd_breakdown.Q4),
      formatPercent(r.simd_percentages.Q4),
      formatCohortValue(r.simd_breakdown.Q5),
      formatPercent(r.simd_percentages.Q5),
    ]
    lines.push(row.map((v) => csvEscape(String(v))).join(','))
  }
  return lines.join('\n')
}

function formatPercent(p: number | null | undefined): string {
  if (p == null) return ''
  return `${p.toFixed(1)}%`
}

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

// ---------------------------------------------------------------------------
// Excel multi-sheet
// ---------------------------------------------------------------------------

function buildWorkbook(
  data: SubjectsTabData,
  authorityName: string,
  filters: ReturnType<typeof parseAuthorityFilters>,
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()

  // Sheet 1: subject uptake
  const uptakeRows = data.uptake.map((r) => ({
    Subject: r.subject_name,
    Category: r.subject_category ?? '',
    Students: formatCohortValue(r.student_count),
    'Percent of cohort': formatPercent(r.percentage),
    Female: formatCohortValue(r.gender_breakdown.female),
    'Female %': formatPercent(r.gender_percentages.female),
    Male: formatCohortValue(r.gender_breakdown.male),
    'Male %': formatPercent(r.gender_percentages.male),
    Other: formatCohortValue(r.gender_breakdown.other),
    'SIMD Q1': formatCohortValue(r.simd_breakdown.Q1),
    'SIMD Q1 %': formatPercent(r.simd_percentages.Q1),
    'SIMD Q2': formatCohortValue(r.simd_breakdown.Q2),
    'SIMD Q2 %': formatPercent(r.simd_percentages.Q2),
    'SIMD Q3': formatCohortValue(r.simd_breakdown.Q3),
    'SIMD Q3 %': formatPercent(r.simd_percentages.Q3),
    'SIMD Q4': formatCohortValue(r.simd_breakdown.Q4),
    'SIMD Q4 %': formatPercent(r.simd_percentages.Q4),
    'SIMD Q5': formatCohortValue(r.simd_breakdown.Q5),
    'SIMD Q5 %': formatPercent(r.simd_percentages.Q5),
  }))
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(uptakeRows),
    'Subject uptake',
  )

  // Sheet 2: STEM gender analysis
  const stemRows = data.stem_gender.map((r) => ({
    Subject: r.subject_name,
    Female: formatCohortValue(r.female_count),
    'Female %': formatPercent(r.female_percentage),
    Male: formatCohortValue(r.male_count),
    'Male %': formatPercent(r.male_percentage),
    Other: formatCohortValue(r.other_count),
    Total: formatCohortValue(r.total_count),
    Balance: r.gender_balance_flag ?? '',
  }))
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(stemRows),
    'STEM gender',
  )

  // Sheet 3: curriculum breadth
  const breadthRows = data.curriculum_breadth.map((r) => ({
    School: r.school_name,
    Students: formatCohortValue(r.student_count),
    'Subjects offered': r.subjects_offered,
    'Avg subjects per student': r.avg_subjects_per_student ?? '',
    'Categories covered': r.subject_categories_covered,
    'Breadth index (0-10)': r.curriculum_breadth_index ?? '',
  }))
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(breadthRows),
    'Curriculum breadth',
  )

  // Sheet 4: availability matrix (schools × subjects)
  const matrixHeader: string[] = ['School', ...data.heatmap.subjects.map((s) => s.subject_name)]
  const matrixRows: Array<Array<string | number>> = [matrixHeader]
  const cellMap = new Map<string, number | null>()
  for (const c of data.heatmap.cells) {
    cellMap.set(`${c.school_id}|${c.subject_id}`, c.student_count)
  }
  for (const school of data.heatmap.schools) {
    const row: Array<string | number> = [school.school_name]
    for (const sub of data.heatmap.subjects) {
      const v = cellMap.get(`${school.school_id}|${sub.subject_id}`) ?? 0
      if (v === 0) row.push('')
      else if (v == null) row.push('< 5')
      else row.push(v)
    }
    matrixRows.push(row)
  }
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(matrixRows),
    'Availability heatmap',
  )

  // Sheet 5: applied filters and metadata (so the recipient can see what's in scope)
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
