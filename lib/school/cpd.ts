// Schools-7 CPD helpers -- shared between /school/cpd, PRD summary,
// inspection QI 1.4 / 2.3 auto-generation, and the CSV export.

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js'

export const CPD_TYPES = [
  'course',
  'conference',
  'workshop',
  'self_study',
  'peer_observation',
  'masters',
  'teacher_led_research',
  'collaborative_enquiry',
  'other',
] as const

export type CpdType = (typeof CPD_TYPES)[number]

export const CPD_TYPE_LABELS: Record<CpdType, string> = {
  course: 'Course',
  conference: 'Conference',
  workshop: 'Workshop',
  self_study: 'Self-study',
  peer_observation: 'Peer observation',
  masters: 'Masters-level study',
  teacher_led_research: 'Teacher-led research',
  collaborative_enquiry: 'Collaborative enquiry',
  other: 'Other',
}

export const GTCS_STANDARDS = [
  'professional_values',
  'professional_knowledge',
  'professional_skills',
] as const

export type GtcsStandard = (typeof GTCS_STANDARDS)[number]

export const GTCS_LABELS: Record<GtcsStandard, string> = {
  professional_values: 'Professional Values and Personal Commitment',
  professional_knowledge: 'Professional Knowledge and Understanding',
  professional_skills: 'Professional Skills and Abilities',
}

export function academicYearStartIso(ay: string): string {
  // ay looks like "2025/26" -- return 2025-08-01.
  const [a] = ay.split('/')
  const y = Number(a)
  if (!Number.isFinite(y)) return `${new Date().getUTCFullYear()}-08-01`
  return `${y}-08-01`
}

export function currentAcademicYear(): string {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth()
  if (m >= 7) return `${y}/${String((y + 1) % 100).padStart(2, '0')}`
  return `${y - 1}/${String(y % 100).padStart(2, '0')}`
}

export async function listStaffCpd(
  admin: SupabaseClient,
  schoolId: string,
  opts: { staffId?: string; academicYear?: string },
): Promise<any[]> {
  const ay = opts.academicYear ?? currentAcademicYear()
  const startDate = academicYearStartIso(ay)

  let query = (admin as any)
    .from('cpd_records')
    .select('*, indicator:hgios4_indicator_id(id, indicator_code, indicator_name)')
    .eq('school_id', schoolId)
    .gte('date_completed', startDate)
    .order('date_completed', { ascending: false })
  if (opts.staffId) query = query.eq('staff_id', opts.staffId)
  const { data } = await query
  return data ?? []
}

export type StaffCpdSummary = {
  staff_id: string
  full_name: string
  role: string
  department: string | null
  total_hours: number
  total_records: number
  last_cpd_date: string | null
  gtcs_standards_covered: GtcsStandard[]
  hgios4_indicators_covered: number
}

export async function getSchoolCpdSummary(
  admin: SupabaseClient,
  schoolId: string,
  academicYear?: string,
): Promise<{ staff: StaffCpdSummary[]; total_hours: number; average_hours: number; staff_zero_cpd: number }> {
  const ay = academicYear ?? currentAcademicYear()
  const startDate = academicYearStartIso(ay)

  const { data: staffRows } = await (admin as any)
    .from('school_staff')
    .select('id, full_name, role, department')
    .eq('school_id', schoolId)
    .order('full_name', { ascending: true })
  const staff = staffRows ?? []

  const { data: records } = await (admin as any)
    .from('cpd_records')
    .select('staff_id, hours, date_completed, gtcs_standard, hgios4_indicator_id')
    .eq('school_id', schoolId)
    .gte('date_completed', startDate)

  const byStaff = new Map<string, { hours: number; count: number; last: string | null; gtcs: Set<GtcsStandard>; indicators: Set<string> }>()
  for (const r of records ?? []) {
    const s = byStaff.get(r.staff_id) ?? { hours: 0, count: 0, last: null, gtcs: new Set<GtcsStandard>(), indicators: new Set<string>() }
    s.hours += Number(r.hours ?? 0)
    s.count += 1
    if (!s.last || r.date_completed > s.last) s.last = r.date_completed
    if (r.gtcs_standard) s.gtcs.add(r.gtcs_standard as GtcsStandard)
    if (r.hgios4_indicator_id) s.indicators.add(r.hgios4_indicator_id)
    byStaff.set(r.staff_id, s)
  }

  const summary: StaffCpdSummary[] = staff.map((s: any) => {
    const row = byStaff.get(s.id)
    return {
      staff_id: s.id,
      full_name: s.full_name ?? '',
      role: s.role ?? '',
      department: s.department ?? null,
      total_hours: row ? Math.round(row.hours * 10) / 10 : 0,
      total_records: row?.count ?? 0,
      last_cpd_date: row?.last ?? null,
      gtcs_standards_covered: row ? Array.from(row.gtcs) : [],
      hgios4_indicators_covered: row?.indicators.size ?? 0,
    }
  })

  const totalHours = Math.round(summary.reduce((a, b) => a + b.total_hours, 0) * 10) / 10
  const avg = summary.length > 0 ? Math.round((totalHours / summary.length) * 10) / 10 : 0
  const zero = summary.filter((s) => s.total_records === 0).length

  return { staff: summary, total_hours: totalHours, average_hours: avg, staff_zero_cpd: zero }
}

export type CpdByIndicatorRow = {
  indicator_id: string
  indicator_code: string
  indicator_name: string
  record_count: number
  hours: number
  unique_staff: number
}

export async function getCpdByHgiosIndicator(
  admin: SupabaseClient,
  schoolId: string,
  academicYear?: string,
): Promise<CpdByIndicatorRow[]> {
  const ay = academicYear ?? currentAcademicYear()
  const startDate = academicYearStartIso(ay)

  const { data: indicators } = await (admin as any)
    .from('inspection_indicators')
    .select('id, indicator_code, indicator_name, framework_name')
    .eq('framework_name', 'HGIOS4')
    .order('indicator_code', { ascending: true })

  const { data: records } = await (admin as any)
    .from('cpd_records')
    .select('hgios4_indicator_id, hours, staff_id')
    .eq('school_id', schoolId)
    .gte('date_completed', startDate)
    .not('hgios4_indicator_id', 'is', null)

  const byId = new Map<string, { count: number; hours: number; staff: Set<string> }>()
  for (const r of records ?? []) {
    const row = byId.get(r.hgios4_indicator_id) ?? { count: 0, hours: 0, staff: new Set<string>() }
    row.count += 1
    row.hours += Number(r.hours ?? 0)
    row.staff.add(r.staff_id)
    byId.set(r.hgios4_indicator_id, row)
  }

  return (indicators ?? []).map((i: any) => {
    const row = byId.get(i.id)
    return {
      indicator_id: i.id,
      indicator_code: i.indicator_code,
      indicator_name: i.indicator_name,
      record_count: row?.count ?? 0,
      hours: row ? Math.round(row.hours * 10) / 10 : 0,
      unique_staff: row?.staff.size ?? 0,
    }
  })
}
