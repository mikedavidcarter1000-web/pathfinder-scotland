import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET students in a class
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links, error } = await (admin as any)
    .from('class_students')
    .select(
      `id, class_assignment_id, student_id, created_at,
       students:student_id (id, first_name, last_name, school_stage, registration_class, house_group)`
    )
    .eq('class_assignment_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type LinkRow = {
    id: string
    class_assignment_id: string
    student_id: string
    students: Record<string, unknown> | null
  }
  const rows = ((links ?? []) as LinkRow[])
    .map((r) => ({
      id: r.id,
      student_id: r.student_id,
      student: r.students,
    }))
    .sort((a, b) => {
      const an = ((a.student as Record<string, unknown> | null)?.last_name as string) ?? ''
      const bn = ((b.student as Record<string, unknown> | null)?.last_name as string) ?? ''
      return an.localeCompare(bn)
    })

  return NextResponse.json({ students: rows })
}

// POST student_ids: string[] — add students to class
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { admin } = guard

  const body = (await req.json().catch(() => null)) as { student_ids?: unknown } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  const ids = Array.isArray(body.student_ids)
    ? body.student_ids.filter((v): v is string => typeof v === 'string')
    : []
  if (ids.length === 0) return NextResponse.json({ error: 'No student ids provided.' }, { status: 400 })

  const rows = ids.map((sid) => ({ class_assignment_id: id, student_id: sid }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('class_students')
    .upsert(rows, { onConflict: 'class_assignment_id,student_id', ignoreDuplicates: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, added: ids.length })
}

// DELETE ?student_id=... — remove a single student from the class
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { admin } = guard

  const url = new URL(req.url)
  const studentId = url.searchParams.get('student_id')
  if (!studentId) return NextResponse.json({ error: 'student_id required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('class_students')
    .delete()
    .eq('class_assignment_id', id)
    .eq('student_id', studentId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
