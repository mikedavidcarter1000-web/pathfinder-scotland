import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { getAttainmentMeasures, getCesCapacities, getAttendanceCorrelation } from '@/lib/school/analytics'

// Recomputes current_value for a priority based on its target_metric.
export async function computeCurrentValue(admin: unknown, schoolId: string, metric: string | null | undefined): Promise<number | null> {
  if (!metric) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ad = admin as any
  switch (metric) {
    case 'pct_n5_5plus_ac': {
      const a = await getAttainmentMeasures(ad, schoolId); return a.n5_5plus_ac_pct
    }
    case 'pct_n5_5plus_ad': {
      const a = await getAttainmentMeasures(ad, schoolId); return a.n5_5plus_ad_pct
    }
    case 'pct_higher_3plus_ac': {
      const a = await getAttainmentMeasures(ad, schoolId); return a.higher_3plus_ac_pct
    }
    case 'pct_higher_5plus_ac': {
      const a = await getAttainmentMeasures(ad, schoolId); return a.higher_5plus_ac_pct
    }
    case 'pct_ah_1plus': {
      const a = await getAttainmentMeasures(ad, schoolId); return a.ah_1plus_pct
    }
    case 'ces_self_score': { const c = await getCesCapacities(ad, schoolId); return c.self.score }
    case 'ces_strengths_score': { const c = await getCesCapacities(ad, schoolId); return c.strengths.score }
    case 'ces_horizons_score': { const c = await getCesCapacities(ad, schoolId); return c.horizons.score }
    case 'ces_networks_score': { const c = await getCesCapacities(ad, schoolId); return c.networks.score }
    case 'pct_attendance_90plus': {
      const c = await getAttendanceCorrelation(ad, schoolId)
      const total = c.reduce((a, b) => a + b.student_count, 0)
      if (total === 0) return null
      const above = c.filter((b) => b.attendance_band === '95-100%' || b.attendance_band === '90-95%').reduce((a, b) => a + b.student_count, 0)
      return Math.round((above / total) * 1000) / 10
    }
    default: return null
  }
}

export const SUPPORTED_SIP_METRICS = [
  { key: 'pct_n5_5plus_ac', label: '% students with 5+ N5 at A-C' },
  { key: 'pct_n5_5plus_ad', label: '% students with 5+ N5 at A-D' },
  { key: 'pct_higher_3plus_ac', label: '% students with 3+ Higher at A-C' },
  { key: 'pct_higher_5plus_ac', label: '% students with 5+ Higher at A-C' },
  { key: 'pct_ah_1plus', label: '% students with 1+ Advanced Higher' },
  { key: 'pct_attendance_90plus', label: '% students with attendance >= 90%' },
  { key: 'ces_self_score', label: 'CES Self capacity score' },
  { key: 'ces_strengths_score', label: 'CES Strengths capacity score' },
  { key: 'ces_horizons_score', label: 'CES Horizons capacity score' },
  { key: 'ces_networks_score', label: 'CES Networks capacity score' },
]

export async function GET(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  // All staff can view SIP.
  const { searchParams } = new URL(req.url)
  const academicYear = searchParams.get('academic_year')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (admin as any).from('sip_priorities').select('*').eq('school_id', ctx.schoolId)
  if (academicYear) q = q.eq('academic_year', academicYear)
  const { data: priorities } = await q.order('priority_number', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: indicators } = await (admin as any)
    .from('inspection_indicators').select('id, indicator_code, indicator_name')
    .eq('framework_name', 'HGIOS4')
    .order('indicator_code', { ascending: true })

  return NextResponse.json({
    priorities: priorities ?? [],
    indicators: indicators ?? [],
    supported_metrics: SUPPORTED_SIP_METRICS,
  })
}

export async function POST(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'SIP management is leadership-only' }, { status: 403 })
  }
  const body = await req.json().catch(() => null)
  if (!body || !body.academic_year || body.priority_number == null || !body.title) {
    return NextResponse.json({ error: 'academic_year, priority_number, title required' }, { status: 400 })
  }

  const current = await computeCurrentValue(admin, ctx.schoolId, body.target_metric)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any).from('sip_priorities').insert({
    school_id: ctx.schoolId,
    academic_year: body.academic_year,
    priority_number: body.priority_number,
    title: body.title,
    description: body.description ?? null,
    target_metric: body.target_metric ?? null,
    baseline_value: body.baseline_value ?? null,
    target_value: body.target_value ?? null,
    current_value: current,
    inspection_indicator_id: body.inspection_indicator_id ?? null,
    status: body.status ?? 'in_progress',
  }).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ priority: data })
}
