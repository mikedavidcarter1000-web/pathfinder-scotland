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
  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
  const sectorId = url.searchParams.get('sector_id') ?? ''

  let query = (admin as any)
    .from('employer_contacts')
    .select('*, sector:sector_id(id, name, slug)')
    .eq('school_id', ctx.schoolId)
    .order('company_name', { ascending: true })

  if (status) query = query.eq('relationship_status', status)
  if (sectorId) query = query.eq('sector_id', sectorId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let rows = data ?? []
  if (search) {
    rows = rows.filter(
      (r: any) =>
        (r.company_name ?? '').toLowerCase().includes(search) ||
        (r.contact_name ?? '').toLowerCase().includes(search) ||
        (r.contact_email ?? '').toLowerCase().includes(search),
    )
  }

  return NextResponse.json({ employers: rows })
}

export async function POST(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate
  if (!canManageDyw(ctx)) {
    return NextResponse.json({ error: 'DYW management permission required' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const company_name = String(body.company_name ?? '').trim()
  if (!company_name) return NextResponse.json({ error: 'company_name is required' }, { status: 400 })

  const insert = {
    school_id: ctx.schoolId,
    company_name,
    sector_id: body.sector_id || null,
    sector_notes: body.sector_notes || null,
    contact_name: body.contact_name || null,
    contact_role: body.contact_role || null,
    contact_email: body.contact_email || null,
    contact_phone: body.contact_phone || null,
    address: body.address || null,
    website: body.website || null,
    relationship_status: body.relationship_status || 'identified',
    partnership_types: Array.isArray(body.partnership_types) ? body.partnership_types : [],
    notes: body.notes || null,
    first_contacted_at: body.first_contacted_at || null,
    last_contacted_at: body.last_contacted_at || null,
    created_by: ctx.staffId,
  }

  const { data, error } = await (admin as any).from('employer_contacts').insert(insert).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ employer: data })
}
