// Schools-7 DYW analytics library -- shared helpers for /school/dyw,
// CES Networks capacity, and the inspection QI 3.3 auto-generator.
//
// Every function accepts a service-role `admin` client + schoolId and
// returns plain JSON. Zero-data shapes are returned without throwing so
// schools with an empty DYW ledger still render.

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js'

export type EmployerStatus =
  | 'identified'
  | 'contacted'
  | 'engaged'
  | 'active_partner'
  | 'dormant'

export const PLACEMENT_TYPES = [
  'work_experience',
  'careers_talk',
  'workplace_tour',
  'mock_interview',
  'mentoring',
  'industry_project',
  'other',
] as const

export type PlacementType = (typeof PLACEMENT_TYPES)[number]

export const PLACEMENT_TYPE_LABELS: Record<PlacementType, string> = {
  work_experience: 'Work experience',
  careers_talk: 'Careers talk',
  workplace_tour: 'Workplace tour',
  mock_interview: 'Mock interview',
  mentoring: 'Mentoring',
  industry_project: 'Industry project',
  other: 'Other',
}

export const PARTNERSHIP_TYPES = [
  'work_placement',
  'mock_interviews',
  'careers_talk',
  'workplace_tour',
  'mentoring',
  'employer_of_month',
  'industry_project',
  'curriculum_input',
] as const

export const PARTNERSHIP_LABELS: Record<(typeof PARTNERSHIP_TYPES)[number], string> = {
  work_placement: 'Work placement',
  mock_interviews: 'Mock interviews',
  careers_talk: 'Careers talk',
  workplace_tour: 'Workplace tour',
  mentoring: 'Mentoring',
  employer_of_month: 'Employer of the month',
  industry_project: 'Industry project',
  curriculum_input: 'Curriculum input',
}

export const STATUS_LABELS: Record<EmployerStatus, string> = {
  identified: 'Identified',
  contacted: 'Contacted',
  engaged: 'Engaged',
  active_partner: 'Active partner',
  dormant: 'Dormant',
}

export function academicYearOfDate(d: Date): string {
  // Scottish school year starts mid-August. Treat Aug 1 as the boundary.
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() // 0-indexed
  if (m >= 7) return `${y}/${String((y + 1) % 100).padStart(2, '0')}`
  return `${y - 1}/${String(y % 100).padStart(2, '0')}`
}

export function currentAcademicYear(): string {
  return academicYearOfDate(new Date())
}

export function academicYearRange(ay: string): { start: string; end: string } {
  const [a] = ay.split('/')
  const y = Number(a)
  if (!Number.isFinite(y)) {
    const now = new Date().getUTCFullYear()
    return { start: `${now}-08-01`, end: `${now + 1}-07-31` }
  }
  return { start: `${y}-08-01`, end: `${y + 1}-07-31` }
}

// ---------------------------------------------------------------------------
// Overview stats
// ---------------------------------------------------------------------------

export type DywOverview = {
  active_partners: number
  engaged_partners: number
  total_contacts: number
  placements_this_year: number
  placements_completed_this_year: number
  distinct_students_placed: number
  linked_student_total: number
  student_reach_pct: number
  sectors_covered: number
  sectors_total: number
  dormant_count: number
  average_student_rating: number | null
  average_employer_rating: number | null
}

export async function getDywOverview(
  admin: SupabaseClient,
  schoolId: string,
): Promise<DywOverview> {
  const ay = currentAcademicYear()
  const { start, end } = academicYearRange(ay)

  const { data: employers } = await (admin as any)
    .from('employer_contacts')
    .select('id, relationship_status, sector_id')
    .eq('school_id', schoolId)
  const employerRows = employers ?? []

  const { data: placements } = await (admin as any)
    .from('work_placements')
    .select('id, student_id, is_group_event, status, start_date, student_rating, employer_rating, linked_sector_id')
    .eq('school_id', schoolId)
    .gte('start_date', start)
    .lte('start_date', end)
  const placementRows = placements ?? []

  const { data: links } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', schoolId)
  const linkedTotal = (links ?? []).length

  const activePartners = employerRows.filter(
    (e: any) => e.relationship_status === 'active_partner',
  ).length
  const engaged = employerRows.filter(
    (e: any) => e.relationship_status === 'engaged',
  ).length
  const dormant = employerRows.filter(
    (e: any) => e.relationship_status === 'dormant',
  ).length

  const completed = placementRows.filter((p: any) => p.status === 'completed')
  const distinctStudents = new Set<string>(
    placementRows
      .filter((p: any) => !p.is_group_event && p.student_id)
      .map((p: any) => p.student_id as string),
  )

  const sectorsFromActiveEmployers = new Set<string>()
  for (const e of employerRows) {
    if (
      (e.relationship_status === 'active_partner' || e.relationship_status === 'engaged') &&
      e.sector_id
    ) {
      sectorsFromActiveEmployers.add(e.sector_id)
    }
  }

  const studentRatings = completed
    .map((p: any) => p.student_rating)
    .filter((r: number | null) => r != null && Number.isFinite(r)) as number[]
  const employerRatings = completed
    .map((p: any) => p.employer_rating)
    .filter((r: number | null) => r != null && Number.isFinite(r)) as number[]

  const avgStudent =
    studentRatings.length > 0
      ? Math.round((studentRatings.reduce((a, b) => a + b, 0) / studentRatings.length) * 100) / 100
      : null
  const avgEmployer =
    employerRatings.length > 0
      ? Math.round((employerRatings.reduce((a, b) => a + b, 0) / employerRatings.length) * 100) / 100
      : null

  return {
    active_partners: activePartners,
    engaged_partners: engaged,
    total_contacts: employerRows.length,
    placements_this_year: placementRows.length,
    placements_completed_this_year: completed.length,
    distinct_students_placed: distinctStudents.size,
    linked_student_total: linkedTotal,
    student_reach_pct:
      linkedTotal > 0 ? Math.round((distinctStudents.size / linkedTotal) * 1000) / 10 : 0,
    sectors_covered: sectorsFromActiveEmployers.size,
    sectors_total: 19,
    dormant_count: dormant,
    average_student_rating: avgStudent,
    average_employer_rating: avgEmployer,
  }
}

// ---------------------------------------------------------------------------
// Sector coverage map
// ---------------------------------------------------------------------------

export type SectorCoverageRow = {
  sector_id: string
  name: string
  slug: string
  active_partners: number
  engaged_partners: number
  total_contacts: number
  placements_this_year: number
}

export async function getSectorCoverage(
  admin: SupabaseClient,
  schoolId: string,
): Promise<SectorCoverageRow[]> {
  const { data: sectors } = await (admin as any)
    .from('career_sectors')
    .select('id, name, slug')
    .order('name', { ascending: true })
  if (!sectors || sectors.length === 0) return []

  const { data: employers } = await (admin as any)
    .from('employer_contacts')
    .select('id, sector_id, relationship_status')
    .eq('school_id', schoolId)

  const ay = currentAcademicYear()
  const { start, end } = academicYearRange(ay)
  const { data: placements } = await (admin as any)
    .from('work_placements')
    .select('linked_sector_id, employer_id, start_date')
    .eq('school_id', schoolId)
    .gte('start_date', start)
    .lte('start_date', end)

  const employerToSector = new Map<string, string | null>(
    (employers ?? []).map((e: any) => [e.id as string, (e.sector_id as string) ?? null]),
  )

  return (sectors as any[]).map((s) => {
    const forSector = (employers ?? []).filter((e: any) => e.sector_id === s.id)
    const active = forSector.filter((e: any) => e.relationship_status === 'active_partner').length
    const engaged = forSector.filter((e: any) => e.relationship_status === 'engaged').length
    const plCount = (placements ?? []).filter((p: any) => {
      if (p.linked_sector_id === s.id) return true
      if (p.employer_id && employerToSector.get(p.employer_id) === s.id) return true
      return false
    }).length
    return {
      sector_id: s.id,
      name: s.name,
      slug: s.slug,
      active_partners: active,
      engaged_partners: engaged,
      total_contacts: forSector.length,
      placements_this_year: plCount,
    }
  })
}

// ---------------------------------------------------------------------------
// CES Networks capacity -- 0-100, four 25-point components
// ---------------------------------------------------------------------------

export type NetworksCapacity = {
  score: number
  components: {
    active_partners: { score: number; value: number; max_value: number }
    placements: { score: number; value: number; max_value: number }
    student_reach: { score: number; value: number; max_value: number }
    sector_coverage: { score: number; value: number; max_value: number }
  }
  overview: DywOverview
  evidence_statement: string
}

function linearPoints(value: number, maxValueForFullScore: number, maxPoints: number): number {
  if (value <= 0) return 0
  const pts = (value / maxValueForFullScore) * maxPoints
  return Math.round(Math.min(pts, maxPoints) * 10) / 10
}

export async function getNetworksCapacity(
  admin: SupabaseClient,
  schoolId: string,
): Promise<NetworksCapacity> {
  const overview = await getDywOverview(admin, schoolId)
  const sectorCoverage = overview.sectors_covered

  // 25 points each, full score at: 5 active partners, 20 placements,
  // 50% reach, 10 of 19 sectors covered.
  const pActive = linearPoints(overview.active_partners, 5, 25)
  const pPlace = linearPoints(overview.placements_completed_this_year, 20, 25)
  const pReach = linearPoints(overview.student_reach_pct, 50, 25)
  const pSector = linearPoints(sectorCoverage, 10, 25)
  const total = Math.round(pActive + pPlace + pReach + pSector)

  const evidenceStatement = `${overview.active_partners} active employer partners across ${sectorCoverage} of 19 career sectors. ${overview.placements_completed_this_year} placements completed this year reaching ${overview.distinct_students_placed} distinct students (${overview.student_reach_pct}% of linked cohort).`

  return {
    score: Math.min(total, 100),
    components: {
      active_partners: { score: pActive, value: overview.active_partners, max_value: 5 },
      placements: { score: pPlace, value: overview.placements_completed_this_year, max_value: 20 },
      student_reach: { score: pReach, value: overview.student_reach_pct, max_value: 50 },
      sector_coverage: { score: pSector, value: sectorCoverage, max_value: 10 },
    },
    overview,
    evidence_statement: evidenceStatement,
  }
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export type PipelineColumn = {
  status: EmployerStatus
  label: string
  count: number
}

export async function getEmployerPipeline(
  admin: SupabaseClient,
  schoolId: string,
): Promise<PipelineColumn[]> {
  const { data } = await (admin as any)
    .from('employer_contacts')
    .select('relationship_status')
    .eq('school_id', schoolId)
  const rows = data ?? []
  const statuses: EmployerStatus[] = ['identified', 'contacted', 'engaged', 'active_partner', 'dormant']
  return statuses.map((s) => ({
    status: s,
    label: STATUS_LABELS[s],
    count: rows.filter((r: any) => r.relationship_status === s).length,
  }))
}

// ---------------------------------------------------------------------------
// CSV helpers (string building only -- route writes HTTP headers)
// ---------------------------------------------------------------------------

export function toCsvRow(fields: (string | number | null | undefined)[]): string {
  return fields
    .map((f) => {
      if (f == null) return ''
      const s = String(f)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    })
    .join(',')
}
