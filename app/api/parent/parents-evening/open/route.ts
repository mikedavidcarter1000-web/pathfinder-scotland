import { NextResponse } from 'next/server'
import { requireParentApi } from '@/lib/school/student-auth'

export const runtime = 'nodejs'

// GET /api/parent/parents-evening/open?student_id=...
// Returns the first currently-open parent evening at the child's school,
// or `{ evening: null }` when none are open.
export async function GET(req: Request) {
  const guard = await requireParentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const studentId = url.searchParams.get('student_id')
  if (!studentId) return NextResponse.json({ error: 'student_id required' }, { status: 400 })
  if (!ctx.linkedStudentIds.includes(studentId)) {
    return NextResponse.json({ error: 'Not linked to this student.' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any)
    .from('school_student_links')
    .select('school_id')
    .eq('student_id', studentId)
  const schoolIds = (links ?? []).map((r: { school_id: string }) => r.school_id)
  if (schoolIds.length === 0) return NextResponse.json({ evening: null })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('parent_evenings')
    .select('id, name, event_date, booking_closes_at, schools:school_id(name)')
    .in('school_id', schoolIds)
    .eq('status', 'open')
    .order('event_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!data) return NextResponse.json({ evening: null })
  return NextResponse.json({
    evening: {
      id: data.id,
      name: data.name,
      event_date: data.event_date,
      booking_closes_at: data.booking_closes_at,
      school: data.schools,
    },
  })
}
