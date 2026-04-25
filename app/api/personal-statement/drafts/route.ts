import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createVersionSnapshot, shouldAutoSnapshot, type SaveTrigger } from '@/lib/personal-statement/versions'

export const runtime = 'nodejs'

const Q_MAX = 4000
const CLAMP = (s: unknown) => (typeof s === 'string' ? s.slice(0, Q_MAX) : '')

type DraftRow = {
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

export async function GET(): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('personal_statement_drafts')
    .select('id, student_id, q1_text, q2_text, q3_text, last_saved_at, created_at, shared_with_school, shared_with_parent, school_id')
    .eq('student_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const row = (data ?? null) as DraftRow | null
  return NextResponse.json({
    authenticated: true,
    draft: row
      ? {
          id: row.id,
          q1: row.q1_text,
          q2: row.q2_text,
          q3: row.q3_text,
          lastSavedAt: row.last_saved_at,
          createdAt: row.created_at,
          sharedWithSchool: row.shared_with_school,
          sharedWithParent: row.shared_with_parent,
          schoolId: row.school_id,
        }
      : null,
  })
}

export async function PUT(request: Request): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | { q1?: unknown; q2?: unknown; q3?: unknown; saveTrigger?: SaveTrigger }
    | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const q1 = CLAMP(body.q1)
  const q2 = CLAMP(body.q2)
  const q3 = CLAMP(body.q3)
  const trigger: SaveTrigger = body.saveTrigger ?? 'auto'

  // Resolve current school_id for the row so RLS-qualified guidance sharing
  // resolves correctly. eslint-disable for the dynamic students table access.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentRow } = await (supabase as any)
    .from('students')
    .select('school_id')
    .eq('id', user.id)
    .maybeSingle()
  const schoolId = (studentRow?.school_id as string | null | undefined) ?? null

  const { data, error } = await supabase
    .from('personal_statement_drafts')
    .upsert(
      {
        student_id: user.id,
        q1_text: q1,
        q2_text: q2,
        q3_text: q3,
        school_id: schoolId,
      },
      { onConflict: 'student_id' },
    )
    .select('id, student_id, q1_text, q2_text, q3_text, last_saved_at, created_at, shared_with_school, shared_with_parent, school_id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Save failed' }, { status: 500 })
  }

  const row = data as DraftRow

  // Snapshot policy:
  // - manual / pre_feedback / restore -> always attempt (createVersionSnapshot
  //   dedupes against the most recent row)
  // - auto -> only if the most recent snapshot is >= 10 minutes old
  let snapshotCreated = false
  if (trigger === 'manual' || trigger === 'pre_feedback' || trigger === 'restore') {
    const v = await createVersionSnapshot(supabase, row, trigger)
    snapshotCreated = !!v
  } else if (await shouldAutoSnapshot(supabase, row.id)) {
    const v = await createVersionSnapshot(supabase, row, 'auto')
    snapshotCreated = !!v
  }

  return NextResponse.json({
    draft: {
      id: row.id,
      q1: row.q1_text,
      q2: row.q2_text,
      q3: row.q3_text,
      lastSavedAt: row.last_saved_at,
      createdAt: row.created_at,
      sharedWithSchool: row.shared_with_school,
      sharedWithParent: row.shared_with_parent,
      schoolId: row.school_id,
    },
    snapshotCreated,
  })
}

export async function DELETE(): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { error } = await supabase
    .from('personal_statement_drafts')
    .delete()
    .eq('student_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
