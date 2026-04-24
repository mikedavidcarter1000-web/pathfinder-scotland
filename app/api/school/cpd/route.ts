import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { listStaffCpd, CPD_TYPES, GTCS_STANDARDS } from '@/lib/school/cpd'

export async function GET(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const url = new URL(req.url)
  const scope = url.searchParams.get('scope') ?? 'mine'
  const ay = url.searchParams.get('academic_year') ?? undefined

  if (scope === 'all') {
    const isLeadership = ctx.isAdmin || ctx.role === 'depute' || ctx.role === 'head_teacher'
    if (!isLeadership) {
      return NextResponse.json({ error: 'Leadership only' }, { status: 403 })
    }
    const records = await listStaffCpd(admin, ctx.schoolId, { academicYear: ay })
    return NextResponse.json({ records })
  }

  const records = await listStaffCpd(admin, ctx.schoolId, { staffId: ctx.staffId, academicYear: ay })
  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const body = await req.json().catch(() => ({}))
  const title = String(body.title ?? '').trim()
  const cpd_type = String(body.cpd_type ?? '').trim()
  const date_completed = String(body.date_completed ?? '').trim()
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
  if (!(CPD_TYPES as readonly string[]).includes(cpd_type)) {
    return NextResponse.json({ error: 'cpd_type must be one of ' + CPD_TYPES.join(', ') }, { status: 400 })
  }
  if (!date_completed) return NextResponse.json({ error: 'date_completed is required' }, { status: 400 })

  const gtcs = body.gtcs_standard ? String(body.gtcs_standard) : null
  if (gtcs && !(GTCS_STANDARDS as readonly string[]).includes(gtcs)) {
    return NextResponse.json({ error: 'gtcs_standard must be one of ' + GTCS_STANDARDS.join(', ') }, { status: 400 })
  }

  const insert = {
    school_id: ctx.schoolId,
    staff_id: ctx.staffId,
    title,
    provider: body.provider || null,
    cpd_type,
    date_completed,
    hours: body.hours ?? null,
    reflection: body.reflection || null,
    impact_on_practice: body.impact_on_practice || null,
    hgios4_indicator_id: body.hgios4_indicator_id || null,
    gtcs_standard: gtcs,
    evidence_url: body.evidence_url || null,
    certificate_url: body.certificate_url || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any).from('cpd_records').insert(insert).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
