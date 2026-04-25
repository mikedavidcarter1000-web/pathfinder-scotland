import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { SaveTrigger } from '@/lib/personal-statement/versions'

export const runtime = 'nodejs'

type VersionRow = {
  id: string
  draft_id: string
  student_id: string
  version_number: number
  q1_text: string
  q2_text: string
  q3_text: string
  saved_at: string
  save_trigger: SaveTrigger
}

/**
 * GET /api/personal-statement/versions/[versionId]
 *
 * Returns the full text of a single version. Used by the preview / diff UI.
 * RLS gates which versions the caller can read.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ versionId: string }> }
): Promise<Response> {
  const { versionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('personal_statement_versions')
    .select('id, draft_id, student_id, version_number, q1_text, q2_text, q3_text, saved_at, save_trigger')
    .eq('id', versionId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  }

  const row = data as VersionRow
  return NextResponse.json({
    version: {
      id: row.id,
      draftId: row.draft_id,
      versionNumber: row.version_number,
      q1: row.q1_text,
      q2: row.q2_text,
      q3: row.q3_text,
      savedAt: row.saved_at,
      saveTrigger: row.save_trigger,
    },
  })
}
