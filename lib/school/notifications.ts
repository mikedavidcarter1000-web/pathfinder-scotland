// Shared helper for sending school notifications. Writes to
// `school_notifications` and, for email / both channels, dispatches email
// via Resend using the branded template set in `lib/school/email-templates`.
//
// This module assumes the caller already has a service-role admin client
// (available via `requireSchoolStaffApi` / `getAdminClient`). RLS gates
// the direct-from-browser path; admin clients fly past RLS, so the
// validation work is the caller's responsibility.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import {
  choiceDeadlineEmail,
  choiceApprovalNeededEmail,
  genericSchoolMessageEmail,
  parentEveningConfirmationEmail,
  parentEveningOpenEmail,
  parentEveningReminderEmail,
  reportReadyEmail,
  type EmailOut,
} from '@/lib/school/email-templates'

export type NotificationType =
  | 'choice_deadline'
  | 'tracking_deadline'
  | 'report_ready'
  | 'parent_evening_reminder'
  | 'intervention_followup'
  | 'safeguarding_escalation'
  | 'asn_review_due'
  | 'results_available'
  | 'booking_confirmation'
  | 'attendance_alert'
  | 'bursary_reminder'
  | 'ps_feedback'
  | 'custom'

export type NotificationChannel = 'in_app' | 'email' | 'both'

export type SendNotificationParams = {
  admin: SupabaseClient<Database>
  schoolId: string
  type: NotificationType
  title: string
  body: string
  channel?: NotificationChannel
  targetRole?: string
  targetStaffIds?: string[]
  targetStudentIds?: string[]
  targetParentIds?: string[]
  createdBy?: string | null
  sendAt?: Date
  // Optional: override the generic message template with a specific one.
  // Useful when the caller already knows this is e.g. a parentEveningOpen
  // and wants the structured CTA template instead of a plain text body.
  emailOverride?: EmailOut
}

export type SendNotificationResult = {
  ok: boolean
  notificationId: string | null
  emailsSent: number
  emailsFailed: number
  emailsSkipped: number
  error?: string
}

export type RecipientEmail = { userId: string | null; email: string; kind: 'staff' | 'student' | 'parent' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminAny = any

/**
 * Store a school notification and (when channel includes email) dispatch
 * the email messages via Resend. The send is best-effort:
 *   - if RESEND_API_KEY is unset, the notification row still gets inserted
 *     (in_app still works); email counts return 0/0/N
 *   - individual email failures do not roll back the row; they are counted
 *     in emailsFailed
 *
 * Scheduled sends (sendAt > now) write the row with sent_at = null and do
 * not attempt delivery. Phase-2: a scheduler will sweep send_at <= now.
 */
export async function sendSchoolNotification(
  params: SendNotificationParams
): Promise<SendNotificationResult> {
  const {
    admin,
    schoolId,
    type,
    title,
    body,
    channel = 'in_app',
    targetRole,
    targetStaffIds,
    targetStudentIds,
    targetParentIds,
    createdBy,
    sendAt,
    emailOverride,
  } = params

  const isFutureScheduled = sendAt && sendAt.getTime() > Date.now()

  const insertPayload = {
    school_id: schoolId,
    notification_type: type,
    title,
    body,
    channel,
    target_role: targetRole ?? null,
    target_staff_ids: targetStaffIds?.length ? targetStaffIds : null,
    target_student_ids: targetStudentIds?.length ? targetStudentIds : null,
    target_parent_ids: targetParentIds?.length ? targetParentIds : null,
    send_at: sendAt ? sendAt.toISOString() : null,
    sent_at: isFutureScheduled ? null : null, // filled below after email send
    created_by: createdBy ?? null,
    read_by: [],
  }

  const { data: inserted, error } = await (admin as AdminAny)
    .from('school_notifications')
    .insert(insertPayload)
    .select('id')
    .single()

  if (error || !inserted) {
    return {
      ok: false,
      notificationId: null,
      emailsSent: 0,
      emailsFailed: 0,
      emailsSkipped: 0,
      error: error?.message ?? 'Insert failed',
    }
  }

  const notificationId = inserted.id as string

  // In-app only: done.
  if (channel === 'in_app' || isFutureScheduled) {
    if (isFutureScheduled) {
      console.info(
        '[notifications] scheduled send (Phase-2 feature). Notification saved but email will not auto-send at the scheduled time.',
        { notificationId, sendAt }
      )
    }
    return { ok: true, notificationId, emailsSent: 0, emailsFailed: 0, emailsSkipped: 0 }
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return { ok: true, notificationId, emailsSent: 0, emailsFailed: 0, emailsSkipped: 0 }
  }

  const recipients = await resolveRecipientEmails(admin, {
    schoolId,
    targetRole,
    targetStaffIds,
    targetStudentIds,
    targetParentIds,
  })

  if (recipients.length === 0) {
    return { ok: true, notificationId, emailsSent: 0, emailsFailed: 0, emailsSkipped: 0 }
  }

  // Build the email payload. Use emailOverride when provided, otherwise
  // fall back to the generic branded template.
  const brand = await loadSchoolBrand(admin, schoolId)
  const email =
    emailOverride ??
    genericSchoolMessageEmail({
      schoolName: brand.schoolName,
      title,
      body,
      headerColour: brand.headerColour,
      logoUrl: brand.logoUrl,
    })

  const fromAddress = process.env.RESEND_FROM_ADDRESS ?? 'noreply@pathfinderscot.co.uk'
  const fromName = process.env.RESEND_FROM_NAME ?? 'Pathfinder Scotland'
  const from = `${fromName} <${fromAddress}>`

  // Rate-limit Resend at 10/sec per the existing convention. For recipient
  // lists under 10, this runs as a single parallel batch with no delay.
  const BATCH = 10
  const WINDOW_MS = 1000
  let emailsSent = 0
  let emailsFailed = 0
  const emailsSkipped = 0

  for (let i = 0; i < recipients.length; i += BATCH) {
    const slice = recipients.slice(i, i + BATCH)
    const windowStart = Date.now()
    const results = await Promise.all(
      slice.map(async (r) => {
        try {
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'content-type': 'application/json', authorization: `Bearer ${resendKey}` },
            body: JSON.stringify({
              from,
              to: [r.email],
              subject: email.subject,
              html: email.html,
              text: email.text,
            }),
          })
          return resp.ok
        } catch {
          return false
        }
      })
    )
    for (const ok of results) {
      if (ok) emailsSent += 1
      else emailsFailed += 1
    }
    const elapsed = Date.now() - windowStart
    if (i + BATCH < recipients.length && elapsed < WINDOW_MS) {
      await new Promise((r) => setTimeout(r, WINDOW_MS - elapsed))
    }
  }

  // Stamp sent_at regardless of partial failures -- partial-delivery is
  // tracked via the counts returned, not via the notification row.
  if (emailsSent > 0) {
    await (admin as AdminAny)
      .from('school_notifications')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', notificationId)
  }

  return { ok: true, notificationId, emailsSent, emailsFailed, emailsSkipped }
}

/**
 * Append the current user id to `read_by` if not already present. Safe
 * to call repeatedly; re-call is idempotent.
 */
export async function markAsRead(
  admin: SupabaseClient<Database>,
  notificationId: string,
  userId: string
): Promise<{ ok: boolean }> {
  // Fetch current array, append if missing, update. A single-statement
  // UPDATE using jsonb_insert + condition works but is harder to reason
  // about; two-step is fine for the "user clicked" cadence.
  const { data: row } = await (admin as AdminAny)
    .from('school_notifications')
    .select('read_by')
    .eq('id', notificationId)
    .maybeSingle()
  if (!row) return { ok: false }
  const current = (Array.isArray(row.read_by) ? row.read_by : []) as string[]
  if (current.includes(userId)) return { ok: true }
  const next = [...current, userId]
  const { error } = await (admin as AdminAny)
    .from('school_notifications')
    .update({ read_by: next })
    .eq('id', notificationId)
  return { ok: !error }
}

/**
 * Count notifications where the given userId is NOT in read_by and the
 * row targets this user (via one of target_staff_ids / target_student_ids /
 * target_parent_ids / no targeting = broadcast).
 *
 * The `audience` filter lets callers narrow the match:
 *   - 'staff'   : staff user -- sees broadcast + target_staff_ids matches +
 *                 target_role matches (if matching role passed)
 *   - 'student' : student user -- sees only target_student_ids matches
 *   - 'parent'  : parent user -- sees only target_parent_ids matches
 */
export async function getUnreadCount(
  admin: SupabaseClient<Database>,
  params: {
    schoolId: string
    userId: string
    audience: 'staff' | 'student' | 'parent'
    staffId?: string
    studentId?: string
    parentId?: string
    staffRole?: string
  }
): Promise<number> {
  const rows = await fetchRelevantNotifications(admin, params)
  return rows.filter((r) => {
    const readBy = (Array.isArray(r.read_by) ? r.read_by : []) as string[]
    return !readBy.includes(params.userId)
  }).length
}

export type RelevantNotification = {
  id: string
  school_id: string
  notification_type: NotificationType
  title: string
  body: string
  target_role: string | null
  target_staff_ids: string[] | null
  target_student_ids: string[] | null
  target_parent_ids: string[] | null
  channel: NotificationChannel
  sent_at: string | null
  send_at: string | null
  read_by: string[]
  created_at: string
}

export async function fetchRelevantNotifications(
  admin: SupabaseClient<Database>,
  params: {
    schoolId: string
    audience: 'staff' | 'student' | 'parent'
    staffId?: string
    studentId?: string
    parentId?: string
    staffRole?: string
    limit?: number
  }
): Promise<RelevantNotification[]> {
  const limit = params.limit ?? 100
  const { data } = await (admin as AdminAny)
    .from('school_notifications')
    .select(
      'id, school_id, notification_type, title, body, target_role, target_staff_ids, target_student_ids, target_parent_ids, channel, sent_at, send_at, read_by, created_at'
    )
    .eq('school_id', params.schoolId)
    .order('created_at', { ascending: false })
    .limit(limit)
  const all = (data ?? []) as RelevantNotification[]

  return all.filter((r) => {
    // Future-scheduled rows are hidden until their send_at is due. send_at
    // null = immediate; when set, must be in the past.
    if (r.send_at && new Date(r.send_at).getTime() > Date.now()) return false

    if (params.audience === 'staff') {
      // Broadcast if no targeting at all.
      const hasAnyTarget =
        (r.target_staff_ids && r.target_staff_ids.length > 0) ||
        (r.target_student_ids && r.target_student_ids.length > 0) ||
        (r.target_parent_ids && r.target_parent_ids.length > 0) ||
        !!r.target_role
      if (!hasAnyTarget) return true
      if (r.target_staff_ids && params.staffId && r.target_staff_ids.includes(params.staffId)) return true
      if (r.target_role && params.staffRole && r.target_role === params.staffRole) return true
      return false
    }
    if (params.audience === 'student') {
      if (r.target_student_ids && params.studentId && r.target_student_ids.includes(params.studentId))
        return true
      return false
    }
    if (params.audience === 'parent') {
      if (r.target_parent_ids && params.parentId && r.target_parent_ids.includes(params.parentId))
        return true
      return false
    }
    return false
  })
}

type SchoolBrand = {
  schoolName: string
  headerColour: string
  logoUrl: string | null
}

async function loadSchoolBrand(
  admin: SupabaseClient<Database>,
  schoolId: string
): Promise<SchoolBrand> {
  const { data: school } = await (admin as AdminAny)
    .from('schools')
    .select('name, settings')
    .eq('id', schoolId)
    .maybeSingle()
  const settings = (school?.settings as Record<string, unknown> | null) ?? {}
  const headerColour =
    typeof settings['primary_colour'] === 'string' ? (settings['primary_colour'] as string) : '#1B3A5C'
  const logoUrl = typeof settings['logo_url'] === 'string' ? (settings['logo_url'] as string) : null
  return {
    schoolName: (school?.name as string | null) ?? 'School',
    headerColour,
    logoUrl,
  }
}

async function resolveRecipientEmails(
  admin: SupabaseClient<Database>,
  params: {
    schoolId: string
    targetRole?: string
    targetStaffIds?: string[]
    targetStudentIds?: string[]
    targetParentIds?: string[]
  }
): Promise<RecipientEmail[]> {
  const seen = new Set<string>()
  const out: RecipientEmail[] = []

  function push(r: RecipientEmail) {
    const key = r.email.toLowerCase()
    if (seen.has(key) || !key) return
    seen.add(key)
    out.push(r)
  }

  if (params.targetStaffIds && params.targetStaffIds.length > 0) {
    const { data } = await (admin as AdminAny)
      .from('school_staff')
      .select('id, user_id, email')
      .in('id', params.targetStaffIds)
      .eq('school_id', params.schoolId)
    for (const s of ((data ?? []) as Array<{ id: string; user_id: string; email: string }>)) {
      push({ userId: s.user_id, email: s.email, kind: 'staff' })
    }
  }
  if (params.targetRole) {
    const { data } = await (admin as AdminAny)
      .from('school_staff')
      .select('id, user_id, email, role')
      .eq('school_id', params.schoolId)
      .eq('role', params.targetRole)
    for (const s of ((data ?? []) as Array<{ id: string; user_id: string; email: string }>)) {
      push({ userId: s.user_id, email: s.email, kind: 'staff' })
    }
  }
  if (params.targetStudentIds && params.targetStudentIds.length > 0) {
    const { data } = await (admin as AdminAny)
      .from('students')
      .select('id, email')
      .in('id', params.targetStudentIds)
    for (const s of ((data ?? []) as Array<{ id: string; email: string }>)) {
      if (s.email) push({ userId: s.id, email: s.email, kind: 'student' })
    }
  }
  if (params.targetParentIds && params.targetParentIds.length > 0) {
    const { data } = await (admin as AdminAny)
      .from('parents')
      .select('id, user_id, email')
      .in('id', params.targetParentIds)
    for (const p of ((data ?? []) as Array<{ id: string; user_id: string; email: string }>)) {
      if (p.email) push({ userId: p.user_id, email: p.email, kind: 'parent' })
    }
  }

  return out
}

/**
 * Skip the send if a notification with the same type + title already
 * exists for this school within the past 24 hours. Use-case: deadline
 * reminders that sweep nightly; we don't want to re-email the same
 * parents every night.
 */
export async function hasRecentDuplicate(
  admin: SupabaseClient<Database>,
  params: { schoolId: string; type: NotificationType; title: string }
): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data } = await (admin as AdminAny)
    .from('school_notifications')
    .select('id')
    .eq('school_id', params.schoolId)
    .eq('notification_type', params.type)
    .eq('title', params.title)
    .gte('created_at', since)
    .limit(1)
  return (data ?? []).length > 0
}

// Named template re-exports so callers can pass a structured email (CTA
// button, table, etc) rather than the generic message wrapper.
export const templates = {
  reportReady: reportReadyEmail,
  parentEveningOpen: parentEveningOpenEmail,
  parentEveningConfirmation: parentEveningConfirmationEmail,
  parentEveningReminder: parentEveningReminderEmail,
  choiceDeadline: choiceDeadlineEmail,
  choiceApprovalNeeded: choiceApprovalNeededEmail,
  genericMessage: genericSchoolMessageEmail,
}
