import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/choices/export?roundId=... -- SEEMIS-style CSV of confirmed choices.
// Columns: SCN, LastName, FirstName, Registration, Column 1, Column 2, ...
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const roundId = url.searchParams.get('roundId')
  if (!roundId) {
    return NextResponse.json({ error: 'roundId query param required.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: round } = await (admin as any)
    .from('choice_rounds')
    .select('id, name, school_id, schools(slug, name)')
    .eq('id', roundId)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })

  // Columns in order.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: columns } = await (admin as any)
    .from('choice_round_columns')
    .select('id, column_position, label')
    .eq('round_id', roundId)
    .order('column_position', { ascending: true })

  // Confirmed (or submitted if round still open) submissions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: submissions } = await (admin as any)
    .from('student_choices')
    .select('id, student_id, status, students(first_name, last_name, scn, registration_class)')
    .eq('round_id', roundId)
    .in('status', ['submitted', 'parent_pending', 'confirmed'])
    .order('created_at', { ascending: true })

  const subIds = (submissions ?? []).map((s: { id: string }) => s.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = subIds.length > 0
    ? await (admin as any)
        .from('student_choice_items')
        .select('student_choice_id, column_id, is_reserve, reserve_order, subjects(name)')
        .in('student_choice_id', subIds)
    : { data: [] }

  // Build per-submission per-column string (comma-separated for multi).
  const columnIds = (columns ?? []).map((c: { id: string }) => c.id)
  const cellByRowCol = new Map<string, string>()
  for (const it of items ?? []) {
    const key = `${it.student_choice_id}:${it.column_id}`
    const name = it.subjects?.name ?? ''
    const annotated = it.is_reserve ? `${name} (reserve${it.reserve_order ? ` ${it.reserve_order}` : ''})` : name
    const prev = cellByRowCol.get(key)
    cellByRowCol.set(key, prev ? `${prev}; ${annotated}` : annotated)
  }

  const escape = (s: string) => {
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const headerRow = ['SCN', 'Last name', 'First name', 'Registration', 'Status', ...(columns ?? []).map((c: { label: string }) => c.label)]
  const lines: string[] = [headerRow.map(escape).join(',')]

  for (const sub of submissions ?? []) {
    const student = sub.students
    const row = [
      student?.scn ?? '',
      student?.last_name ?? '',
      student?.first_name ?? '',
      student?.registration_class ?? '',
      sub.status,
      ...columnIds.map((cid: string) => cellByRowCol.get(`${sub.id}:${cid}`) ?? ''),
    ]
    lines.push(row.map((c) => escape(String(c))).join(','))
  }

  const schoolSlug = round.schools?.slug ?? 'school'
  const safeRound = (round.name as string).replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
  const filename = `${schoolSlug}-${safeRound}-choices.csv`

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
