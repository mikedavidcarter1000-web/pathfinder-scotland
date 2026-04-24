import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { parseUploaded } from '@/lib/school/import-parsing'
import { runDestinationsImport, mapDestinationType, getDestinationsDashboard } from '@/lib/school/import'

export const runtime = 'nodejs'

function canManageDestinations(ctx: { role: string; isAdmin: boolean }): boolean {
  return ctx.isAdmin || ['guidance_teacher', 'pt_guidance', 'dyw_coordinator', 'depute', 'head_teacher'].includes(ctx.role)
}

export async function GET(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const url = new URL(req.url)
  if (url.searchParams.get('dashboard') === '1') {
    const dash = await getDestinationsDashboard(admin, ctx.schoolId)
    return NextResponse.json(dash)
  }

  const { data } = await (admin as any)
    .from('alumni_destinations')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .order('leaving_year', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500)
  return NextResponse.json({ destinations: data ?? [] })
}

export async function POST(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  if (!canManageDestinations(ctx)) {
    return NextResponse.json({ error: 'Destinations management permission required' }, { status: 403 })
  }

  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('multipart/form-data')) {
    // File-based import
    const form = await req.formData()
    const file = form.get('file')
    const mapRaw = String(form.get('map') ?? '{}')
    if (!(file instanceof File)) return NextResponse.json({ error: 'file required' }, { status: 400 })
    let map: Record<string, string | null> = {}
    try { map = JSON.parse(mapRaw) } catch { return NextResponse.json({ error: 'invalid map JSON' }, { status: 400 }) }
    const parsed = await parseUploaded(file)
    const result = await runDestinationsImport(admin, {
      headers: parsed.headers,
      rows: parsed.rows,
      map,
      schoolId: ctx.schoolId,
      staffId: ctx.staffId,
      fileName: file.name ?? 'upload',
    })
    return NextResponse.json(result)
  }

  // Manual entry
  const body = await req.json().catch(() => ({}))
  const destType = mapDestinationType(String(body.destination_type ?? ''))
  if (!destType) return NextResponse.json({ error: 'Invalid destination_type' }, { status: 400 })
  if (!body.leaving_year || !body.leaving_stage) {
    return NextResponse.json({ error: 'leaving_year and leaving_stage are required' }, { status: 400 })
  }

  let simdDecile: number | null = null
  let careExperienced = false
  let fsm = false
  if (body.student_id) {
    const { data: s } = await (admin as any)
      .from('students')
      .select('simd_decile, care_experienced, receives_free_school_meals')
      .eq('id', body.student_id).maybeSingle()
    if (s) {
      simdDecile = s.simd_decile ?? null
      careExperienced = !!s.care_experienced
      fsm = !!s.receives_free_school_meals
    }
  }

  const { data, error } = await (admin as any).from('alumni_destinations').insert({
    school_id: ctx.schoolId,
    student_id: body.student_id ?? null,
    scn: body.scn ?? null,
    student_name: body.student_name ?? null,
    leaving_year: body.leaving_year,
    leaving_stage: body.leaving_stage,
    destination_type: destType,
    institution_name: body.institution_name ?? null,
    course_name: body.course_name ?? null,
    employer_name: body.employer_name ?? null,
    confirmed: !!body.confirmed,
    confirmed_date: body.confirmed_date ?? null,
    data_source: body.data_source ?? 'manual',
    simd_decile: simdDecile,
    was_widening_access: simdDecile != null && simdDecile <= 4,
    was_care_experienced: careExperienced,
    was_fsm: fsm,
    notes: body.notes ?? null,
  }).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ destination: data })
}
