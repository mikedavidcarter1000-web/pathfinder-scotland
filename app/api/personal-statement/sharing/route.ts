import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

/**
 * PATCH /api/personal-statement/sharing
 *
 * Body: { sharedWithSchool?: boolean, sharedWithParent?: boolean }
 *
 * Updates the per-flag sharing toggles on the student's draft. The student is
 * the only one allowed to flip these; RLS already enforces this on the
 * personal_statement_drafts table (UPDATE policy WITH CHECK student_id =
 * auth.uid()).
 *
 * When turning shared_with_school ON, also sets school_id to the student's
 * current school_id so the existing guidance staff RLS resolves correctly.
 */
export async function PATCH(request: Request): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | { sharedWithSchool?: boolean; sharedWithParent?: boolean }
    | null

  if (
    !body ||
    (typeof body.sharedWithSchool !== 'boolean' && typeof body.sharedWithParent !== 'boolean')
  ) {
    return NextResponse.json(
      { error: 'Provide sharedWithSchool and/or sharedWithParent' },
      { status: 400 },
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentRow } = await (supabase as any)
    .from('students')
    .select('school_id')
    .eq('id', user.id)
    .maybeSingle()
  const schoolId = (studentRow?.school_id as string | null | undefined) ?? null

  const update: Record<string, unknown> = {}
  if (typeof body.sharedWithSchool === 'boolean') {
    update.shared_with_school = body.sharedWithSchool
    // When enabling school share, copy student's current school_id so the
    // RLS join works without a separate roundtrip.
    if (body.sharedWithSchool && schoolId) {
      update.school_id = schoolId
    }
  }
  if (typeof body.sharedWithParent === 'boolean') {
    update.shared_with_parent = body.sharedWithParent
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updated, error } = await (supabase as any)
    .from('personal_statement_drafts')
    .update(update)
    .eq('student_id', user.id)
    .select('id, shared_with_school, shared_with_parent, school_id')
    .single()

  if (error || !updated) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })
  }

  const row = updated as {
    id: string
    shared_with_school: boolean
    shared_with_parent: boolean
    school_id: string | null
  }
  return NextResponse.json({
    draft: {
      id: row.id,
      sharedWithSchool: row.shared_with_school,
      sharedWithParent: row.shared_with_parent,
      schoolId: row.school_id,
    },
  })
}
