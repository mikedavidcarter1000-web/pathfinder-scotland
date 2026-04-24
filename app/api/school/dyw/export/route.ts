import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { toCsvRow, STATUS_LABELS, PLACEMENT_TYPE_LABELS, type EmployerStatus, type PlacementType } from '@/lib/school/dyw'

export async function GET(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const url = new URL(req.url)
  const kind = url.searchParams.get('kind') ?? 'employers'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any).from('schools').select('slug').eq('id', ctx.schoolId).maybeSingle()
  const slug = school?.slug ?? 'school'
  const today = new Date().toISOString().slice(0, 10)

  if (kind === 'employers') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('employer_contacts')
      .select('*, sector:sector_id(name)')
      .eq('school_id', ctx.schoolId)
      .order('company_name')
    const rows = data ?? []
    const header = toCsvRow(['company_name','contact_name','contact_email','contact_phone','sector','status','partnership_types','last_contacted_at'])
    const body = rows.map((r: any) => toCsvRow([
      r.company_name,
      r.contact_name,
      r.contact_email,
      r.contact_phone,
      r.sector?.name ?? '',
      STATUS_LABELS[(r.relationship_status as EmployerStatus)] ?? r.relationship_status,
      (r.partnership_types ?? []).join(' | '),
      r.last_contacted_at ?? '',
    ])).join('\n')
    const csv = `${header}\n${body}`
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slug}-employers-${today}.csv"`,
      },
    })
  }

  if (kind === 'placements') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('work_placements')
      .select('*, employer:employer_id(company_name)')
      .eq('school_id', ctx.schoolId)
      .order('start_date', { ascending: false, nullsFirst: false })
    const rows = data ?? []
    const studentIds = Array.from(new Set(rows.filter((r: any) => r.student_id).map((r: any) => r.student_id as string)))
    const nameMap = new Map<string, string>()
    if (studentIds.length > 0 && (ctx.canViewIndividualStudents || ctx.isAdmin)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: sts } = await (admin as any).from('students').select('id, first_name, last_name, school_stage').in('id', studentIds)
      for (const s of sts ?? []) nameMap.set(s.id, `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim())
    }
    const header = toCsvRow(['title','type','employer','student','year_group','start_date','end_date','hours','status','student_rating','employer_rating'])
    const body = rows.map((r: any) => toCsvRow([
      r.title,
      PLACEMENT_TYPE_LABELS[(r.placement_type as PlacementType)] ?? r.placement_type,
      r.employer?.company_name ?? '',
      r.is_group_event ? '[Group event]' : (nameMap.get(r.student_id) ?? (ctx.canViewIndividualStudents || ctx.isAdmin ? '' : '[restricted]')),
      r.is_group_event ? (r.group_year_groups ?? []).join('/') : '',
      r.start_date ?? '',
      r.end_date ?? '',
      r.hours ?? '',
      r.status,
      r.student_rating ?? '',
      r.employer_rating ?? '',
    ])).join('\n')
    const csv = `${header}\n${body}`
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slug}-placements-${today}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
}
