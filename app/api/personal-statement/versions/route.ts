import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createVersionSnapshot, type SaveTrigger } from '@/lib/personal-statement/versions'

export const runtime = 'nodejs'

type VersionRow = {
  id: string
  draft_id: string
  student_id: string
  version_number: number
  q1_char_count: number
  q2_char_count: number
  q3_char_count: number
  total_char_count: number
  saved_at: string
  save_trigger: SaveTrigger
}

/**
 * GET /api/personal-statement/versions?draftId=...
 *
 * Lists every version snapshot for a draft (RLS gates which drafts the
 * caller can see). Returns char-count summaries rather than full text -- the
 * detail endpoint /api/personal-statement/versions/[versionId] returns the
 * text for a single version.
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
    .from('personal_statement_versions')
    .select('id, draft_id, student_id, version_number, q1_char_count, q2_char_count, q3_char_count, total_char_count, saved_at, save_trigger')
    .eq('draft_id', draftId)
    .order('version_number', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    versions: ((data ?? []) as VersionRow[]).map((v) => ({
      id: v.id,
      draftId: v.draft_id,
      versionNumber: v.version_number,
      q1Len: v.q1_char_count,
      q2Len: v.q2_char_count,
      q3Len: v.q3_char_count,
      totalLen: v.total_char_count,
      savedAt: v.saved_at,
      saveTrigger: v.save_trigger,
    })),
  })
}

/**
 * POST /api/personal-statement/versions
 *
 * Body: { saveTrigger?: 'manual' | 'pre_feedback' | 'restore' }
 *
 * Creates a snapshot of the current working copy. Only the student themselves
 * can create snapshots (RLS gates `WITH CHECK (student_id = auth.uid())`).
 * Deduplicates against the most recent snapshot.
 */
export async function POST(request: Request): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { saveTrigger?: SaveTrigger }
  const trigger: SaveTrigger = body.saveTrigger ?? 'manual'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: draft } = await (supabase as any)
    .from('personal_statement_drafts')
    .select('id, student_id, q1_text, q2_text, q3_text')
    .eq('student_id', user.id)
    .maybeSingle()

  if (!draft) {
    return NextResponse.json({ error: 'No draft to snapshot' }, { status: 404 })
  }

  const v = await createVersionSnapshot(supabase, draft, trigger)
  return NextResponse.json({
    version: v
      ? {
          id: v.id,
          versionNumber: v.version_number,
          savedAt: v.saved_at,
          saveTrigger: v.save_trigger,
        }
      : null,
    deduplicated: !v,
  })
}
