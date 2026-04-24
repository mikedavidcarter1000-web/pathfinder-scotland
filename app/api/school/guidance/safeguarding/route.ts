import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

type ConcernType =
  | 'disclosure' | 'observed_behaviour' | 'third_party_report' | 'online_safety'
  | 'self_harm_risk' | 'domestic' | 'neglect' | 'bullying' | 'substance_misuse' | 'other'

const VALID_CONCERN_TYPES: ReadonlySet<ConcernType> = new Set([
  'disclosure', 'observed_behaviour', 'third_party_report', 'online_safety',
  'self_harm_risk', 'domestic', 'neglect', 'bullying', 'substance_misuse', 'other',
])

type EscalationLevel =
  | 'concern' | 'escalated_pt' | 'escalated_dht' | 'escalated_named_person'
  | 'referral_social_work' | 'referral_police'

const VALID_ESCALATIONS: ReadonlySet<EscalationLevel> = new Set([
  'concern', 'escalated_pt', 'escalated_dht', 'escalated_named_person',
  'referral_social_work', 'referral_police',
])

// GET /api/school/guidance/safeguarding
// Lists safeguarding concerns for the caller's school. can_view_safeguarding required.
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi({ mustViewSafeguarding: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const studentId = url.searchParams.get('student_id')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin as any)
    .from('safeguarding_concerns')
    .select('id, student_id, concern_type, description, immediate_actions_taken, escalation_level, escalated_to, escalated_at, outcome, resolved_at, created_at, supersedes_id, reported_by, students:student_id(first_name, last_name, school_stage), reporter:reported_by(full_name, role), escalated_to_staff:escalated_to(full_name, role)')
    .eq('school_id', ctx.schoolId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (studentId) query = query.eq('student_id', studentId)

  const { data, error } = await query
  if (error) {
    console.error('[guidance/safeguarding GET] query failed:', error)
    return NextResponse.json({ error: 'Could not load concerns.' }, { status: 500 })
  }

  return NextResponse.json({ concerns: data ?? [] })
}

// POST /api/school/guidance/safeguarding
// Creates a safeguarding concern. Insert is append-only per RLS.
// Also writes an access-log 'created' entry.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustViewSafeguarding: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const studentId = typeof body.student_id === 'string' ? body.student_id : ''
  const concernType = typeof body.concern_type === 'string' ? body.concern_type : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const immediate = typeof body.immediate_actions_taken === 'string' ? body.immediate_actions_taken : null
  const escalation = typeof body.escalation_level === 'string' ? body.escalation_level : 'concern'
  const escalatedTo = typeof body.escalated_to === 'string' && body.escalated_to ? body.escalated_to : null
  const supersedesId = typeof body.supersedes_id === 'string' && body.supersedes_id ? body.supersedes_id : null

  if (!studentId) return NextResponse.json({ error: 'student_id required' }, { status: 400 })
  if (!VALID_CONCERN_TYPES.has(concernType as ConcernType)) return NextResponse.json({ error: 'Invalid concern_type' }, { status: 400 })
  if (!VALID_ESCALATIONS.has(escalation as EscalationLevel)) return NextResponse.json({ error: 'Invalid escalation_level' }, { status: 400 })
  if (description.length < 50) return NextResponse.json({ error: 'Description must be at least 50 characters.' }, { status: 400 })

  // Confirm student is at the school (append-only surface doesn't use caseload filter --
  // safeguarding visibility is school-wide for permitted staff).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, school_id')
    .eq('id', studentId)
    .maybeSingle()
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  // school_student_links gates cross-school write attempts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('student_id', studentId)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!link) return NextResponse.json({ error: 'Student not linked to your school.' }, { status: 403 })

  const escalatedAt = escalation !== 'concern' ? new Date().toISOString() : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error } = await (admin as any)
    .from('safeguarding_concerns')
    .insert({
      school_id: ctx.schoolId,
      student_id: studentId,
      reported_by: ctx.staffId,
      concern_type: concernType,
      description,
      immediate_actions_taken: immediate,
      escalation_level: escalation,
      escalated_to: escalatedTo,
      escalated_at: escalatedAt,
      supersedes_id: supersedesId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[guidance/safeguarding POST] insert failed:', error)
    return NextResponse.json({ error: 'Could not log concern.' }, { status: 500 })
  }

  // Log the creation in the access log.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('safeguarding_access_log').insert({
    concern_id: inserted.id,
    accessed_by: ctx.staffId,
    action: escalation !== 'concern' ? 'escalated' : 'created',
  })

  // Fire a safeguarding_escalation notification when the concern is
  // escalated to a named staff member. The concern description is NOT
  // included in the notification body; it is sensitive and only viewable
  // via the safeguarding detail page.
  if (escalation !== 'concern' && escalatedTo) {
    try {
      const { sendSchoolNotification } = await import('@/lib/school/notifications')
      await sendSchoolNotification({
        admin,
        schoolId: ctx.schoolId,
        type: 'safeguarding_escalation',
        title: 'URGENT: Safeguarding concern escalated',
        body: 'A safeguarding concern has been escalated to you. Please review the case immediately in the safeguarding log.',
        targetStaffIds: [escalatedTo],
        channel: 'both',
        createdBy: ctx.userId,
      })
    } catch {
      // Best-effort.
    }
  }

  return NextResponse.json({ ok: true, id: inserted.id })
}
