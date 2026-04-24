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

  const { data: employer } = await (admin as any)
    .from('employer_contacts')
    .select('*, sector:sector_id(id, name, slug)')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!employer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: placements } = await (admin as any)
    .from('work_placements')
    .select('id, title, placement_type, start_date, end_date, status, hours, is_group_event, group_student_count')
    .eq('school_id', ctx.schoolId)
    .eq('employer_id', id)
    .order('start_date', { ascending: false })

  return NextResponse.json({ employer, placements: placements ?? [] })
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
    'company_name', 'sector_id', 'sector_notes', 'contact_name', 'contact_role',
    'contact_email', 'contact_phone', 'address', 'website', 'relationship_status',
    'partnership_types', 'notes', 'first_contacted_at', 'last_contacted_at',
  ]
  for (const k of editable) {
    if (k in body) update[k] = body[k]
  }

  const { data, error } = await (admin as any)
    .from('employer_contacts')
    .update(update)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ employer: data })
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
    .from('employer_contacts')
    .delete()
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
