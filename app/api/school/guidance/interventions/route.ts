import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { canStaffSeeStudent, fetchCaseload } from '@/lib/school/guidance-caseload'

export const runtime = 'nodejs'

type InterventionType =
  | 'guidance_meeting' | 'parent_contact' | 'mentoring' | 'study_support'
  | 'behaviour_support' | 'attendance_followup' | 'wellbeing_check'
  | 'careers_guidance' | 'subject_change' | 'referral_external'
  | 'pef_intervention' | 'other'

const VALID_TYPES: ReadonlySet<InterventionType> = new Set([
  'guidance_meeting', 'parent_contact', 'mentoring', 'study_support',
  'behaviour_support', 'attendance_followup', 'wellbeing_check',
  'careers_guidance', 'subject_change', 'referral_external',
  'pef_intervention', 'other',
])

const GUIDANCE_ROLES = new Set(['guidance_teacher', 'pt_guidance', 'depute', 'head_teacher'])

// POST /api/school/guidance/interventions
// Creates a new intervention. Body: student_id, intervention_type, title,
// notes, action_items[], outcome, related_subject_id, related_course_id,
// pef_funded, pef_cost, scheduled_at, follow_up_date, is_confidential.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustViewStudents: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (!GUIDANCE_ROLES.has(ctx.role) && !ctx.isAdmin) {
    return NextResponse.json({ error: 'Only guidance staff and school leadership can log interventions.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const studentId = typeof body.student_id === 'string' ? body.student_id : ''
  const interventionType = typeof body.intervention_type === 'string' ? body.intervention_type : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''

  if (!studentId) return NextResponse.json({ error: 'student_id required' }, { status: 400 })
  if (!VALID_TYPES.has(interventionType as InterventionType)) return NextResponse.json({ error: 'Invalid intervention_type' }, { status: 400 })
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  // Confirm caseload access.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, school_id, school_stage, house_group')
    .eq('id', studentId)
    .maybeSingle()
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const { staff } = await fetchCaseload(admin, ctx.userId, ctx.schoolId)
  if (!canStaffSeeStudent(staff, student, ctx.schoolId)) {
    return NextResponse.json({ error: 'Student not in your caseload' }, { status: 403 })
  }

  const actionItems = Array.isArray(body.action_items) ? body.action_items : []
  const notes = typeof body.notes === 'string' ? body.notes : null
  const outcome = typeof body.outcome === 'string' ? body.outcome : null
  const relatedSubjectId = typeof body.related_subject_id === 'string' && body.related_subject_id ? body.related_subject_id : null
  const relatedCourseId = typeof body.related_course_id === 'string' && body.related_course_id ? body.related_course_id : null
  const pefFunded = body.pef_funded === true
  const pefCost = typeof body.pef_cost === 'number' ? body.pef_cost : null
  const scheduledAt = typeof body.scheduled_at === 'string' && body.scheduled_at ? body.scheduled_at : null
  const followUpDate = typeof body.follow_up_date === 'string' && body.follow_up_date ? body.follow_up_date : null
  const isConfidential = body.is_confidential === true

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error } = await (admin as any)
    .from('interventions')
    .insert({
      school_id: ctx.schoolId,
      student_id: studentId,
      staff_id: ctx.staffId,
      intervention_type: interventionType,
      title,
      notes,
      action_items: actionItems,
      outcome,
      related_subject_id: relatedSubjectId,
      related_course_id: relatedCourseId,
      pef_funded: pefFunded,
      pef_cost: pefCost,
      scheduled_at: scheduledAt,
      follow_up_date: followUpDate,
      is_confidential: isConfidential,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[guidance/interventions POST] insert failed:', error)
    return NextResponse.json({ error: 'Could not log intervention.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: inserted?.id })
}
