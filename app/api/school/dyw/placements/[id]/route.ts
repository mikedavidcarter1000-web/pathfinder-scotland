import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

function canManageDyw(ctx: { role: string; isAdmin: boolean }): boolean {
  return ctx.isAdmin || ctx.role === 'dyw_coordinator' || ctx.role === 'depute' || ctx.role === 'head_teacher'
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const { data, error } = await (admin as any)
    .from('work_placements')
    .select('*, employer:employer_id(id, company_name), sector:linked_sector_id(id, name, slug)')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Attach student name if relevant + viewer can see individuals.
  let student = null
  if (data.student_id && (ctx.canViewIndividualStudents || ctx.isAdmin)) {
    const { data: s } = await (admin as any)
      .from('students')
      .select('id, first_name, last_name, school_stage')
      .eq('id', data.student_id)
      .maybeSingle()
    student = s
  }

  return NextResponse.json({ placement: data, student })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  if (!canManageDyw(ctx)) {
    return NextResponse.json({ error: 'DYW management permission required' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const update: Record<string, unknown> = {}
  const editable = [
    'employer_id', 'title', 'placement_type', 'start_date', 'end_date', 'hours',
    'status', 'description', 'supervisor_name', 'supervisor_email', 'supervisor_phone',
    'health_safety_completed', 'parental_consent_received', 'risk_assessment_url',
    'linked_sector_id', 'group_year_groups', 'group_student_count',
    'student_feedback', 'student_rating', 'employer_feedback', 'employer_rating',
  ]
  for (const k of editable) {
    if (k in body) update[k] = body[k]
  }

  const { data, error } = await (admin as any)
    .from('work_placements')
    .update(update)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ placement: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  if (!canManageDyw(ctx)) {
    return NextResponse.json({ error: 'DYW management permission required' }, { status: 403 })
  }
  const { error } = await (admin as any)
    .from('work_placements')
    .delete()
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
