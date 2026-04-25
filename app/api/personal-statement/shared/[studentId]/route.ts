import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

type DraftFull = {
  id: string
  student_id: string
  q1_text: string
  q2_text: string
  q3_text: string
  last_saved_at: string
  created_at: string
  shared_with_school: boolean
  shared_with_parent: boolean
  school_id: string | null
}

/**
 * GET /api/personal-statement/shared/[studentId]
 *
 * Used by guidance teachers and linked parents to read a student's shared
 * personal statement draft. RLS gates whether the row is visible. The route
 * returns the draft plus a `viewerRole` describing the caller's relationship
 * to the draft so the client can render the right UI (read-only with comment
 * affordances vs. read-only with no affordances).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studentId: string }> }
): Promise<Response> {
  const { studentId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: draftRow } = await (supabase as any)
    .from('personal_statement_drafts')
    .select('id, student_id, q1_text, q2_text, q3_text, last_saved_at, created_at, shared_with_school, shared_with_parent, school_id')
    .eq('student_id', studentId)
    .maybeSingle()

  if (!draftRow) {
    return NextResponse.json({ error: 'No shared draft visible to you' }, { status: 404 })
  }

  const draft = draftRow as DraftFull

  // Determine viewer role. Trust RLS for the visibility decision; just label
  // the relationship for the UI.
  let viewerRole: 'student' | 'guidance' | 'parent' | 'admin' = 'admin'
  if (draft.student_id === user.id) {
    viewerRole = 'student'
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: staffRow } = await (supabase as any)
      .from('school_staff')
      .select('id, school_id, can_view_individual_students, full_name')
      .eq('user_id', user.id)
      .maybeSingle()
    if (
      staffRow &&
      staffRow.can_view_individual_students &&
      staffRow.school_id === draft.school_id &&
      draft.shared_with_school
    ) {
      viewerRole = 'guidance'
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: parentRow } = await (supabase as any)
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (parentRow && draft.shared_with_parent) {
        viewerRole = 'parent'
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentRow } = await (supabase as any)
    .from('students')
    .select('first_name, last_name, school_stage')
    .eq('id', studentId)
    .maybeSingle()

  const fn = (studentRow?.first_name as string | null) ?? null
  const ln = (studentRow?.last_name as string | null) ?? null

  return NextResponse.json({
    viewerRole,
    student: {
      id: studentId,
      firstName: fn,
      lastName: ln,
      schoolStage: (studentRow?.school_stage as string | null) ?? null,
    },
    draft: {
      id: draft.id,
      q1: draft.q1_text,
      q2: draft.q2_text,
      q3: draft.q3_text,
      lastSavedAt: draft.last_saved_at,
      createdAt: draft.created_at,
      sharedWithSchool: draft.shared_with_school,
      sharedWithParent: draft.shared_with_parent,
    },
  })
}
