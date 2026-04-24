import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { generateToken } from '@/lib/school/parent-evening-prep'

export const runtime = 'nodejs'

// POST /api/school/parents-evening/[id]/tokens
// Body: { year_group?: string, student_ids?: string[] }
// Creates one parent_evening_tokens row per student in the target cohort.
// Returns CSV-shaped rows for the admin to hand out.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as { year_group?: unknown; student_ids?: unknown; ttl_days?: unknown }
  const yearGroup = typeof body.year_group === 'string' && body.year_group ? body.year_group : null
  const explicitIds = Array.isArray(body.student_ids) ? body.student_ids.filter((v): v is string => typeof v === 'string') : null
  const ttlDays = typeof body.ttl_days === 'number' && body.ttl_days > 0 ? body.ttl_days : 30

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evening } = await (admin as any)
    .from('parent_evenings')
    .select('id')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!evening) return NextResponse.json({ error: 'Evening not found' }, { status: 404 })

  // Resolve target students.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: linkRows } = await (admin as any)
    .from('school_student_links')
    .select('student_id, students:student_id(id, first_name, last_name, school_stage)')
    .eq('school_id', ctx.schoolId)
  type Row = {
    student_id: string
    students: { id: string; first_name: string | null; last_name: string | null; school_stage: string | null } | null
  }
  let students = ((linkRows ?? []) as Row[]).map((r) => r.students).filter((s): s is NonNullable<Row['students']> => !!s)
  if (explicitIds && explicitIds.length) {
    const set = new Set(explicitIds)
    students = students.filter((s) => set.has(s.id))
  }
  if (yearGroup) students = students.filter((s) => s.school_stage === yearGroup)
  if (students.length === 0) return NextResponse.json({ error: 'No students match.' }, { status: 400 })

  const expiresAt = new Date(Date.now() + ttlDays * 24 * 3600 * 1000).toISOString()
  const rows = students.map((s) => ({
    parent_evening_id: id,
    student_id: s.id,
    token: generateToken(),
    expires_at: expiresAt,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error } = await (admin as any)
    .from('parent_evening_tokens')
    .insert(rows)
    .select('student_id, token')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pathfinderscot.co.uk').replace(/\/$/, '')
  type InsertedRow = { student_id: string; token: string }
  const output = ((inserted ?? []) as InsertedRow[]).map((r) => {
    const student = students.find((s) => s.id === r.student_id)
    return {
      student_id: r.student_id,
      name: `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim(),
      year_group: student?.school_stage ?? '',
      url: `${siteUrl}/parent/parents-evening/${id}/book?token=${encodeURIComponent(r.token)}`,
    }
  })

  return NextResponse.json({ tokens: output, expires_at: expiresAt })
}
