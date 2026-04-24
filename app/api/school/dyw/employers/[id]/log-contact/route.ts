import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  if (!(ctx.isAdmin || ctx.role === 'dyw_coordinator' || ctx.role === 'depute' || ctx.role === 'head_teacher')) {
    return NextResponse.json({ error: 'DYW management permission required' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const note = String(body.note ?? '').trim()
  const now = new Date().toISOString()

  const { data: existing } = await (admin as any)
    .from('employer_contacts')
    .select('notes, first_contacted_at')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const stamped = note ? `[${now.slice(0, 10)} ${ctx.fullName}] ${note}` : `[${now.slice(0, 10)} ${ctx.fullName}] Contact logged.`
  const combined = existing.notes ? `${stamped}\n\n${existing.notes}` : stamped

  const update: Record<string, unknown> = {
    last_contacted_at: now,
    notes: combined,
  }
  if (!existing.first_contacted_at) update.first_contacted_at = now

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
