import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

function canManageDyw(ctx: { role: string; isAdmin: boolean }): boolean {
  return ctx.isAdmin || ctx.role === 'dyw_coordinator' || ctx.role === 'depute' || ctx.role === 'head_teacher'
}

export async function GET(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const url = new URL(req.url)
  const status = url.searchParams.get('status') ?? ''
  const type = url.searchParams.get('type') ?? ''
  const employerId = url.searchParams.get('employer_id') ?? ''
  const studentId = url.searchParams.get('student_id') ?? ''

  let query = (admin as any)
    .from('work_placements')
    .select('*, employer:employer_id(id, company_name, sector_id), sector:linked_sector_id(id, name, slug)')
    .eq('school_id', ctx.schoolId)
    .order('start_date', { ascending: false, nullsFirst: false })
  if (status) query = query.eq('status', status)
  if (type) query = query.eq('placement_type', type)
  if (employerId) query = query.eq('employer_id', employerId)
  if (studentId) query = query.eq('student_id', studentId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let rows = data ?? []
  // Mask student info from staff who cannot view individuals, unless the
  // row is a group event (no student_id).
  if (!ctx.canViewIndividualStudents && !ctx.isAdmin) {
    rows = rows.map((r: any) =>
      r.is_group_event ? r : { ...r, student_id: null, student_name: null, _masked: true },
    )
  } else {
    // Attach student name if present.
    const studentIds = Array.from(
      new Set(rows.filter((r: any) => r.student_id).map((r: any) => r.student_id as string)),
    )
    if (studentIds.length > 0) {
      const { data: students } = await (admin as any)
        .from('students')
        .select('id, first_name, last_name')
        .in('id', studentIds)
      const nameMap = new Map<string, string>(
        (students ?? []).map((s: any) => [s.id as string, `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim()]),
      )
      rows = rows.map((r: any) =>
        r.student_id ? { ...r, student_name: nameMap.get(r.student_id) ?? null } : r,
      )
    }
  }

  return NextResponse.json({ placements: rows })
}

export async function POST(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  if (!canManageDyw(ctx)) {
    return NextResponse.json({ error: 'DYW management permission required' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const title = String(body.title ?? '').trim()
  const placement_type = String(body.placement_type ?? '').trim()
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
  if (!placement_type) return NextResponse.json({ error: 'placement_type is required' }, { status: 400 })

  const is_group_event = !!body.is_group_event
  const student_id = is_group_event ? null : body.student_id || null
  if (!is_group_event && !student_id) {
    return NextResponse.json({ error: 'student_id is required for individual placements' }, { status: 400 })
  }

  const insert = {
    school_id: ctx.schoolId,
    employer_id: body.employer_id || null,
    student_id,
    is_group_event,
    group_year_groups: Array.isArray(body.group_year_groups) ? body.group_year_groups : [],
    group_student_count: body.group_student_count ?? null,
    title,
    placement_type,
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    hours: body.hours ?? null,
    status: body.status || 'planned',
    description: body.description || null,
    supervisor_name: body.supervisor_name || null,
    supervisor_email: body.supervisor_email || null,
    supervisor_phone: body.supervisor_phone || null,
    health_safety_completed: !!body.health_safety_completed,
    parental_consent_received: !!body.parental_consent_received,
    risk_assessment_url: body.risk_assessment_url || null,
    linked_sector_id: body.linked_sector_id || null,
    created_by: ctx.staffId,
  }

  const { data, error } = await (admin as any).from('work_placements').insert(insert).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ placement: data })
}
