import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

const VALID_PROVISIONS = new Set([
  'iep', 'csp', 'exam_access', 'reader', 'scribe',
  'extra_time', 'separate_room', 'assistive_tech',
  'modified_curriculum', 'support_worker', 'other',
])

const GUIDANCE_ROLES = new Set(['guidance_teacher', 'pt_guidance', 'depute', 'head_teacher'])

// POST /api/school/guidance/asn
// Creates an ASN provision entry.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (!GUIDANCE_ROLES.has(ctx.role) && !ctx.isAdmin) {
    return NextResponse.json({ error: 'Only guidance staff and school leadership can add ASN provisions.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const studentId = typeof body.student_id === 'string' ? body.student_id : ''
  const provisionType = typeof body.provision_type === 'string' ? body.provision_type : ''
  const description = typeof body.description === 'string' ? body.description : null
  const reviewDate = typeof body.review_date === 'string' && body.review_date ? body.review_date : null
  const responsibleStaffId = typeof body.responsible_staff_id === 'string' && body.responsible_staff_id ? body.responsible_staff_id : null

  if (!studentId) return NextResponse.json({ error: 'student_id required' }, { status: 400 })
  if (!VALID_PROVISIONS.has(provisionType)) return NextResponse.json({ error: 'Invalid provision_type' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, school_id')
    .eq('id', studentId)
    .maybeSingle()
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  if (student.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Student not linked to your school' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error } = await (admin as any)
    .from('asn_provisions')
    .insert({
      school_id: ctx.schoolId,
      student_id: studentId,
      provision_type: provisionType,
      description,
      review_date: reviewDate,
      responsible_staff_id: responsibleStaffId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[guidance/asn POST] insert failed:', error)
    return NextResponse.json({ error: 'Could not add provision.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: inserted?.id })
}
