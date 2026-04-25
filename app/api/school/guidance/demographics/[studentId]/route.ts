import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { fetchCaseload, canStaffSeeStudent } from '@/lib/school/guidance-caseload'

export const runtime = 'nodejs'

// GET /api/school/guidance/demographics/[studentId]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params
  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (!ctx.canViewSensitiveFlags) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const { staff, students: caseloadStudents } = await fetchCaseload(admin, ctx.userId, ctx.schoolId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, school_id, school_stage, house_group, gender, care_experienced, has_asn, receives_free_school_meals, eal, is_young_carer, is_home_educated, student_type, ethnicity, demographic_source, demographic_updated_at')
    .eq('id', studentId)
    .maybeSingle()

  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const inCaseload =
    caseloadStudents.some((s) => s.id === studentId) ||
    canStaffSeeStudent(
      staff,
      { id: student.id, school_id: student.school_id, school_stage: student.school_stage, house_group: student.house_group },
      ctx.schoolId,
    )
  if (!inCaseload) return NextResponse.json({ error: 'Student not in your caseload' }, { status: 403 })

  return NextResponse.json({
    gender: student.gender,
    careExperienced: student.care_experienced,
    hasAsn: student.has_asn,
    fsm: student.receives_free_school_meals,
    eal: student.eal,
    isYoungCarer: student.is_young_carer,
    isHomeEducated: student.is_home_educated,
    studentType: student.student_type,
    ethnicity: student.ethnicity,
    demographicSource: student.demographic_source,
    demographicUpdatedAt: student.demographic_updated_at,
  })
}

// PUT /api/school/guidance/demographics/[studentId]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params
  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (!ctx.canViewSensitiveFlags) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as {
    careExperienced?: boolean
    hasAsn?: boolean
    fsm?: boolean
    eal?: boolean
    isYoungCarer?: boolean
    isHomeEducated?: boolean
    studentType?: string
    ethnicity?: string | null
    gender?: string | null
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  // Load current demographic_source to decide escalation.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current } = await (admin as any)
    .from('students')
    .select('demographic_source')
    .eq('id', studentId)
    .maybeSingle()
  if (!current) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const prevSource: string | null = current.demographic_source ?? null
  let newSource: string
  if (prevSource === 'seemis_import') {
    newSource = 'mixed'
  } else if (prevSource === 'guidance_teacher' || prevSource === 'mixed') {
    newSource = prevSource
  } else {
    newSource = 'guidance_teacher'
  }

  const update: Record<string, unknown> = {
    demographic_source: newSource,
    demographic_updated_at: new Date().toISOString(),
  }
  if (typeof body.careExperienced === 'boolean') update.care_experienced = body.careExperienced
  if (typeof body.hasAsn === 'boolean') update.has_asn = body.hasAsn
  if (typeof body.fsm === 'boolean') update.receives_free_school_meals = body.fsm
  if (typeof body.eal === 'boolean') update.eal = body.eal
  if (typeof body.isYoungCarer === 'boolean') update.is_young_carer = body.isYoungCarer
  if (typeof body.isHomeEducated === 'boolean') update.is_home_educated = body.isHomeEducated
  if (typeof body.studentType === 'string') update.student_type = body.studentType
  if ('ethnicity' in body) update.ethnicity = body.ethnicity ?? null
  if ('gender' in body) update.gender = body.gender ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('students')
    .update(update)
    .eq('id', studentId)
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json({ ok: true, demographicSource: newSource })
}
