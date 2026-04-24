import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { fetchRelevantNotifications, sendSchoolNotification, type NotificationType } from '@/lib/school/notifications'

export const runtime = 'nodejs'

const VALID_TYPES: ReadonlySet<NotificationType> = new Set([
  'choice_deadline', 'tracking_deadline', 'report_ready', 'parent_evening_reminder',
  'intervention_followup', 'safeguarding_escalation', 'asn_review_due',
  'results_available', 'booking_confirmation', 'attendance_alert',
  'bursary_reminder', 'custom',
])

// GET /api/school/notifications?limit=50&type=custom
// Returns notifications relevant to the caller (staff visibility: broadcast
// + target_role matches + target_staff_ids matches).
export async function GET(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const limitParam = url.searchParams.get('limit')
  const limit = Math.min(Math.max(Number(limitParam ?? '100') || 100, 1), 500)
  const typeFilter = url.searchParams.get('type')

  let rows = await fetchRelevantNotifications(admin, {
    schoolId: ctx.schoolId,
    audience: 'staff',
    staffId: ctx.staffId,
    staffRole: ctx.role,
    limit,
  })
  if (typeFilter && VALID_TYPES.has(typeFilter as NotificationType)) {
    rows = rows.filter((r) => r.notification_type === typeFilter)
  }

  return NextResponse.json({ notifications: rows })
}

// POST /api/school/notifications
// Body: { title, body, channel?, recipients: { kind: 'all_staff'|'role'|'year_group_parents'|'year_group_students'|'specific_staff', value?: string, ids?: string[] } }
// Admin / leadership (depute / head_teacher) can send bulk messages.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const isLeadership = ctx.isAdmin || ctx.role === 'depute' || ctx.role === 'head_teacher'
  if (!isLeadership) {
    return NextResponse.json({ error: 'Bulk messaging is restricted to school leadership.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as {
    title?: unknown
    body?: unknown
    channel?: unknown
    recipients?: {
      kind?: unknown
      value?: unknown
      ids?: unknown
    }
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const msgBody = typeof body.body === 'string' ? body.body.trim() : ''
  const channel =
    body.channel === 'email' || body.channel === 'both' || body.channel === 'in_app' ? body.channel : 'in_app'
  if (!title || !msgBody) return NextResponse.json({ error: 'title and body required' }, { status: 400 })
  if (title.length > 200) return NextResponse.json({ error: 'title too long (max 200 chars)' }, { status: 400 })
  if (msgBody.length > 5000) return NextResponse.json({ error: 'body too long (max 5000 chars)' }, { status: 400 })

  const rec = body.recipients ?? {}
  const kind = typeof rec.kind === 'string' ? rec.kind : ''
  const value = typeof rec.value === 'string' ? rec.value : null
  const ids = Array.isArray(rec.ids) ? rec.ids.filter((v): v is string => typeof v === 'string') : []

  let targetRole: string | undefined
  let targetStaffIds: string[] | undefined
  let targetParentIds: string[] | undefined
  let targetStudentIds: string[] | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = admin as any

  if (kind === 'all_staff') {
    const { data } = await adminAny
      .from('school_staff')
      .select('id')
      .eq('school_id', ctx.schoolId)
    targetStaffIds = ((data ?? []) as Array<{ id: string }>).map((r) => r.id)
  } else if (kind === 'role' && value) {
    const { data } = await adminAny
      .from('school_staff')
      .select('id')
      .eq('school_id', ctx.schoolId)
      .eq('role', value)
    targetStaffIds = ((data ?? []) as Array<{ id: string }>).map((r) => r.id)
    if (!targetStaffIds.length) targetRole = value
  } else if (kind === 'specific_staff') {
    // Validate staff ids belong to caller's school.
    if (ids.length === 0) return NextResponse.json({ error: 'No staff ids provided' }, { status: 400 })
    const { data } = await adminAny
      .from('school_staff')
      .select('id')
      .in('id', ids)
      .eq('school_id', ctx.schoolId)
    targetStaffIds = ((data ?? []) as Array<{ id: string }>).map((r) => r.id)
  } else if (kind === 'year_group_parents' && value) {
    // Find student ids in this year group, then active linked parents.
    const { data: linkRows } = await adminAny
      .from('school_student_links')
      .select('student_id, students:student_id(id, school_stage)')
      .eq('school_id', ctx.schoolId)
    type LR = { student_id: string; students: { id: string; school_stage: string | null } | null }
    const studentIds = ((linkRows ?? []) as LR[])
      .filter((r) => r.students?.school_stage === value)
      .map((r) => r.student_id)
    if (studentIds.length === 0) {
      targetParentIds = []
    } else {
      const { data: parentLinks } = await adminAny
        .from('parent_student_links')
        .select('parent_id')
        .in('student_id', studentIds)
        .eq('status', 'active')
      targetParentIds = Array.from(
        new Set(
          ((parentLinks ?? []) as Array<{ parent_id: string | null }>)
            .map((r) => r.parent_id)
            .filter((v): v is string => !!v)
        )
      )
    }
  } else if (kind === 'year_group_students' && value) {
    const { data: linkRows } = await adminAny
      .from('school_student_links')
      .select('student_id, students:student_id(id, school_stage)')
      .eq('school_id', ctx.schoolId)
    type LR = { student_id: string; students: { id: string; school_stage: string | null } | null }
    targetStudentIds = ((linkRows ?? []) as LR[])
      .filter((r) => r.students?.school_stage === value)
      .map((r) => r.student_id)
  } else {
    return NextResponse.json({ error: 'Invalid recipients.kind' }, { status: 400 })
  }

  // Rate-limit guard on outbound email volume.
  const emailRecipientCount =
    channel === 'in_app'
      ? 0
      : (targetStaffIds?.length ?? 0) +
        (targetParentIds?.length ?? 0) +
        (targetStudentIds?.length ?? 0)
  if (channel !== 'in_app' && emailRecipientCount > 500) {
    return NextResponse.json(
      {
        error: `That targets ${emailRecipientCount} email recipients, which exceeds the 500-per-send limit. Split by year group and try again.`,
      },
      { status: 400 }
    )
  }

  const result = await sendSchoolNotification({
    admin,
    schoolId: ctx.schoolId,
    type: 'custom',
    title,
    body: msgBody,
    channel,
    targetRole,
    targetStaffIds,
    targetStudentIds,
    targetParentIds,
    createdBy: ctx.userId,
  })

  return NextResponse.json({
    ok: result.ok,
    notification_id: result.notificationId,
    recipient_count:
      (targetStaffIds?.length ?? 0) +
      (targetParentIds?.length ?? 0) +
      (targetStudentIds?.length ?? 0),
    emails_sent: result.emailsSent,
    emails_failed: result.emailsFailed,
    needs_confirm: channel !== 'in_app' && emailRecipientCount > 200,
  })
}
