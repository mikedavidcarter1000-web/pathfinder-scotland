import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { currentAcademicYear, academicYearStartIso, CPD_TYPE_LABELS, GTCS_LABELS, type CpdType, type GtcsStandard } from '@/lib/school/cpd'
import { toCsvRow } from '@/lib/school/dyw'

export async function GET() {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  const isLeadership = ctx.isAdmin || ctx.role === 'depute' || ctx.role === 'head_teacher'
  if (!isLeadership) {
    return NextResponse.json({ error: 'Leadership only' }, { status: 403 })
  }

  const ay = currentAcademicYear()
  const startDate = academicYearStartIso(ay)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any).from('schools').select('slug').eq('id', ctx.schoolId).maybeSingle()
  const slug = school?.slug ?? 'school'
  const today = new Date().toISOString().slice(0, 10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: records } = await (admin as any)
    .from('cpd_records')
    .select('*, staff:staff_id(full_name, role), indicator:hgios4_indicator_id(indicator_code, indicator_name)')
    .eq('school_id', ctx.schoolId)
    .gte('date_completed', startDate)
    .order('date_completed', { ascending: false })

  const header = toCsvRow([
    'staff_name','role','title','provider','cpd_type','date_completed','hours',
    'gtcs_standard','hgios4_indicator','reflection','impact_on_practice',
  ])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (records ?? []).map((r: any) => toCsvRow([
    r.staff?.full_name ?? '',
    r.staff?.role ?? '',
    r.title,
    r.provider ?? '',
    CPD_TYPE_LABELS[(r.cpd_type as CpdType)] ?? r.cpd_type,
    r.date_completed,
    r.hours ?? '',
    r.gtcs_standard ? (GTCS_LABELS[(r.gtcs_standard as GtcsStandard)] ?? r.gtcs_standard) : '',
    r.indicator ? `${r.indicator.indicator_code} ${r.indicator.indicator_name}` : '',
    r.reflection ?? '',
    r.impact_on_practice ?? '',
  ])).join('\n')
  const csv = `${header}\n${body}`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}-cpd-${today}.csv"`,
    },
  })
}
