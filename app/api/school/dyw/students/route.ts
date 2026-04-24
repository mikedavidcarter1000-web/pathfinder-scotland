import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export async function GET(req: NextRequest) {
  const gate = await requireSchoolStaffApi()
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  // DYW coordinators / leadership can see the full linked-student list (for
  // the "add placement" student picker). Class teachers without
  // can_view_individual_students will still not land on the DYW add-form.
  const isDyw = ctx.isAdmin || ctx.role === 'dyw_coordinator' || ctx.role === 'depute' || ctx.role === 'head_teacher'
  if (!isDyw) {
    return NextResponse.json({ error: 'DYW management only' }, { status: 403 })
  }

  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', ctx.schoolId)
  const ids = (links ?? []).map((l: { student_id: string }) => l.student_id)
  if (ids.length === 0) return NextResponse.json({ students: [] })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (admin as any)
    .from('students')
    .select('id, first_name, last_name, school_stage, registration_class, house_group')
    .in('id', ids)
    .order('last_name', { ascending: true })

  let rows = students ?? []
  if (q) {
    rows = rows.filter((s: { first_name: string | null; last_name: string | null }) =>
      `${s.first_name ?? ''} ${s.last_name ?? ''}`.toLowerCase().includes(q),
    )
  }
  return NextResponse.json({ students: rows.slice(0, 100) })
}
