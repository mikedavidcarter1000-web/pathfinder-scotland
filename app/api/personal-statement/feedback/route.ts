import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { sendSchoolNotification } from '@/lib/school/notifications'
import { createVersionSnapshot } from '@/lib/personal-statement/versions'

export const runtime = 'nodejs'

type FeedbackRow = {
  id: string
  draft_id: string
  version_id: string | null
  question_number: number
  author_type: 'student' | 'guidance' | 'parent'
  author_user_id: string
  author_name: string
  comment: string
  highlight_start: number | null
  highlight_end: number | null
  parent_feedback_id: string | null
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

/**
 * GET /api/personal-statement/feedback?draftId=...
 *
 * Returns every comment row the caller can see (RLS gates the read scope).
 * Threading is left to the client -- the route returns a flat list with
 * parent_feedback_id, the UI groups replies under their parent.
 */
export async function GET(request: Request): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const draftId = searchParams.get('draftId')
  if (!draftId) {
    return NextResponse.json({ error: 'draftId required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('personal_statement_feedback')
    .select('id, draft_id, version_id, question_number, author_type, author_user_id, author_name, comment, highlight_start, highlight_end, parent_feedback_id, is_resolved, resolved_at, resolved_by, created_at')
    .eq('draft_id', draftId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ feedback: (data ?? []) as FeedbackRow[] })
}

type DraftLite = {
  id: string
  student_id: string
  shared_with_school: boolean
  shared_with_parent: boolean
  school_id: string | null
  q1_text: string
  q2_text: string
  q3_text: string
}

/**
 * POST /api/personal-statement/feedback
 *
 * Body: {
 *   draftId, questionNumber (1|2|3), comment,
 *   highlightStart?, highlightEnd?, parentFeedbackId?
 * }
 *
 * The route resolves the caller's role for the draft (student / guidance /
 * parent) so the client doesn't need to know it. Before inserting, it asks
 * the version-snapshot helper to create a `pre_feedback` snapshot so the
 * comment's anchor (highlight range) is durable against subsequent edits.
 * After insert, fires a school notification using `ps_feedback`.
 */
export async function POST(request: Request): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | {
        draftId?: string
        questionNumber?: number
        comment?: string
        highlightStart?: number | null
        highlightEnd?: number | null
        parentFeedbackId?: string | null
      }
    | null

  if (!body || !body.draftId || !body.questionNumber || !body.comment) {
    return NextResponse.json({ error: 'draftId, questionNumber, comment required' }, { status: 400 })
  }
  if (![1, 2, 3].includes(body.questionNumber)) {
    return NextResponse.json({ error: 'questionNumber must be 1, 2 or 3' }, { status: 400 })
  }
  if (typeof body.comment !== 'string' || body.comment.trim().length === 0) {
    return NextResponse.json({ error: 'comment must be non-empty' }, { status: 400 })
  }
  const trimmedComment = body.comment.trim().slice(0, 4000)

  // Validate highlight range (half-open [start, end))
  let highlightStart: number | null = null
  let highlightEnd: number | null = null
  if (typeof body.highlightStart === 'number' && typeof body.highlightEnd === 'number') {
    if (body.highlightEnd <= body.highlightStart) {
      return NextResponse.json({ error: 'highlightEnd must be > highlightStart' }, { status: 400 })
    }
    highlightStart = Math.max(0, Math.floor(body.highlightStart))
    highlightEnd = Math.max(highlightStart + 1, Math.floor(body.highlightEnd))
  }

  // Resolve the draft + caller's role.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: draft } = await (supabase as any)
    .from('personal_statement_drafts')
    .select('id, student_id, shared_with_school, shared_with_parent, school_id, q1_text, q2_text, q3_text')
    .eq('id', body.draftId)
    .maybeSingle()

  if (!draft) {
    return NextResponse.json({ error: 'Draft not visible to you' }, { status: 403 })
  }
  const draftRow = draft as DraftLite

  // Determine author_type + author_name. Try student -> guidance -> parent.
  let authorType: 'student' | 'guidance' | 'parent' | null = null
  let authorName: string | null = null

  if (draftRow.student_id === user.id) {
    authorType = 'student'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: studentRow } = await (supabase as any)
      .from('students')
      .select('first_name, last_name')
      .eq('id', user.id)
      .maybeSingle()
    const fn = (studentRow?.first_name as string | null) ?? null
    const ln = (studentRow?.last_name as string | null) ?? null
    authorName = [fn, ln].filter(Boolean).join(' ') || (user.email ?? 'Student')
  }

  if (!authorType) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: staffRow } = await (supabase as any)
      .from('school_staff')
      .select('full_name, school_id, can_view_individual_students')
      .eq('user_id', user.id)
      .maybeSingle()
    if (
      staffRow &&
      staffRow.can_view_individual_students &&
      draftRow.shared_with_school &&
      // Staff at the same school as the student
      staffRow.school_id &&
      draftRow.school_id &&
      staffRow.school_id === draftRow.school_id
    ) {
      authorType = 'guidance'
      authorName = (staffRow.full_name as string | null) ?? 'Guidance teacher'
    }
  }

  if (!authorType) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parentRow } = await (supabase as any)
      .from('parents')
      .select('id, full_name')
      .eq('user_id', user.id)
      .maybeSingle()
    if (parentRow && draftRow.shared_with_parent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: link } = await (supabase as any)
        .from('parent_student_links')
        .select('id, status')
        .eq('parent_id', parentRow.id)
        .eq('student_id', draftRow.student_id)
        .eq('status', 'active')
        .maybeSingle()
      if (link) {
        authorType = 'parent'
        authorName = (parentRow.full_name as string | null) ?? 'Parent / carer'
      }
    }
  }

  if (!authorType || !authorName) {
    return NextResponse.json({ error: 'You do not have permission to comment on this draft' }, { status: 403 })
  }

  // Anchor comments to a fresh snapshot so the highlight range is durable.
  let versionId: string | null = null
  if (highlightStart !== null && highlightEnd !== null) {
    const v = await createVersionSnapshot(supabase, draftRow, 'pre_feedback')
    if (v) versionId = v.id
  }

  // Insert via the user's auth client so the per-author RLS policy fires.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error: insertError } = await (supabase as any)
    .from('personal_statement_feedback')
    .insert({
      draft_id: body.draftId,
      version_id: versionId,
      question_number: body.questionNumber,
      author_type: authorType,
      author_user_id: user.id,
      author_name: authorName,
      comment: trimmedComment,
      highlight_start: highlightStart,
      highlight_end: highlightEnd,
      parent_feedback_id: body.parentFeedbackId ?? null,
    })
    .select('id, draft_id, version_id, question_number, author_type, author_user_id, author_name, comment, highlight_start, highlight_end, parent_feedback_id, is_resolved, resolved_at, resolved_by, created_at')
    .single()

  if (insertError || !inserted) {
    return NextResponse.json({ error: insertError?.message ?? 'Insert failed' }, { status: 500 })
  }

  // Fire-and-forget notification. The student is the recipient when the
  // author is guidance/parent; if author is replying to another comment, the
  // notification target is the original commenter (student or otherwise).
  void notifyFeedbackTarget({
    draftRow,
    studentId: draftRow.student_id,
    authorType,
    authorName,
    comment: trimmedComment,
    parentFeedbackId: body.parentFeedbackId ?? null,
    schoolId: draftRow.school_id,
  })

  return NextResponse.json({ feedback: inserted as FeedbackRow })
}

async function notifyFeedbackTarget(params: {
  draftRow: DraftLite
  studentId: string
  authorType: 'student' | 'guidance' | 'parent'
  authorName: string
  comment: string
  parentFeedbackId: string | null
  schoolId: string | null
}): Promise<void> {
  try {
    const admin = getAdminClient()
    if (!admin) return

    // Determine the title + body + which school to attribute to.
    const titleByAuthor: Record<typeof params.authorType, string> = {
      guidance: 'Your guidance teacher left feedback on your personal statement',
      parent: 'Your parent / carer commented on your personal statement',
      student: 'Reply on your personal statement comment',
    }

    // Replies notify the original author rather than (or in addition to) the
    // student. For guidance/parent replies to a student comment, the student
    // is still the right target.
    const isReply = params.parentFeedbackId !== null
    let recipientStudentId = params.studentId

    if (isReply && params.parentFeedbackId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: parentRow } = await (admin as any)
        .from('personal_statement_feedback')
        .select('author_user_id, author_type')
        .eq('id', params.parentFeedbackId)
        .maybeSingle()
      if (parentRow) {
        // If the original author was the student, stay on student.
        // If the original author was guidance/parent and the replier is the
        // student, the original guidance/parent is not in the student
        // notifications table -- fall back to the student.
        recipientStudentId = parentRow.author_type === 'student' ? params.studentId : params.studentId
      }
    }

    if (!params.schoolId) {
      // Nothing to send through if the student is not linked to a school.
      // Notifications are school-scoped per the existing schema.
      return
    }

    await sendSchoolNotification({
      admin,
      schoolId: params.schoolId,
      type: 'ps_feedback',
      title: titleByAuthor[params.authorType],
      body: `${params.authorName}: "${params.comment.slice(0, 240)}${params.comment.length > 240 ? '…' : ''}"`,
      channel: 'in_app',
      targetStudentIds: [recipientStudentId],
    })
  } catch (err) {
    console.warn('[ps_feedback] notification failed', err)
  }
}
