import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const TEN_MINUTES_MS = 10 * 60 * 1000

type FeedbackRow = {
  id: string
  draft_id: string
  author_user_id: string
  comment: string
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

/**
 * PATCH /api/personal-statement/feedback/[feedbackId]
 *
 * Body: { comment?: string, isResolved?: boolean }
 *
 * - Editing comment text: only the original author, only within 10 minutes
 *   of creation.
 * - Toggling is_resolved: the student who owns the draft can resolve any
 *   comment; the original author can also resolve their own.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ feedbackId: string }> }
): Promise<Response> {
  const { feedbackId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | { comment?: string; isResolved?: boolean }
    | null
  if (!body || (typeof body.comment !== 'string' && typeof body.isResolved !== 'boolean')) {
    return NextResponse.json({ error: 'Provide comment or isResolved' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('personal_statement_feedback')
    .select('id, draft_id, author_user_id, comment, is_resolved, resolved_at, resolved_by, created_at')
    .eq('id', feedbackId)
    .maybeSingle()
  if (!existing) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }
  const row = existing as FeedbackRow

  const isAuthor = row.author_user_id === user.id

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: draft } = await (supabase as any)
    .from('personal_statement_drafts')
    .select('student_id')
    .eq('id', row.draft_id)
    .maybeSingle()
  const isStudent = draft && (draft as { student_id: string }).student_id === user.id

  const update: Record<string, unknown> = {}

  if (typeof body.comment === 'string') {
    if (!isAuthor) {
      return NextResponse.json({ error: 'Only the author can edit a comment' }, { status: 403 })
    }
    const ageMs = Date.now() - new Date(row.created_at).getTime()
    if (ageMs > TEN_MINUTES_MS) {
      return NextResponse.json({ error: 'Edit window has expired (10 minutes)' }, { status: 403 })
    }
    const trimmed = body.comment.trim().slice(0, 4000)
    if (trimmed.length === 0) {
      return NextResponse.json({ error: 'Comment must be non-empty' }, { status: 400 })
    }
    update.comment = trimmed
  }

  if (typeof body.isResolved === 'boolean') {
    if (!isStudent && !isAuthor) {
      return NextResponse.json({ error: 'Only the student or author can resolve a comment' }, { status: 403 })
    }
    update.is_resolved = body.isResolved
    update.resolved_at = body.isResolved ? new Date().toISOString() : null
    update.resolved_by = body.isResolved ? user.id : null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updated, error } = await (supabase as any)
    .from('personal_statement_feedback')
    .update(update)
    .eq('id', feedbackId)
    .select('id, draft_id, version_id, question_number, author_type, author_user_id, author_name, comment, highlight_start, highlight_end, parent_feedback_id, is_resolved, resolved_at, resolved_by, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ feedback: updated })
}

/**
 * DELETE /api/personal-statement/feedback/[feedbackId]
 *
 * Only the original author within 10 minutes; school admins always.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ feedbackId: string }> }
): Promise<Response> {
  const { feedbackId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('personal_statement_feedback')
    .select('id, author_user_id, created_at')
    .eq('id', feedbackId)
    .maybeSingle()
  if (!existing) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
  }
  const row = existing as { id: string; author_user_id: string; created_at: string }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: staff } = await (supabase as any)
    .from('school_staff')
    .select('is_school_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  const isSchoolAdmin = !!(staff && (staff as { is_school_admin: boolean }).is_school_admin)

  const isAuthor = row.author_user_id === user.id
  if (!isAuthor && !isSchoolAdmin) {
    return NextResponse.json({ error: 'Only the author or a school admin may delete' }, { status: 403 })
  }

  if (isAuthor && !isSchoolAdmin) {
    const ageMs = Date.now() - new Date(row.created_at).getTime()
    if (ageMs > TEN_MINUTES_MS) {
      return NextResponse.json({ error: 'Delete window has expired (10 minutes)' }, { status: 403 })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('personal_statement_feedback')
    .delete()
    .eq('id', feedbackId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
