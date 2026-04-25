import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type SaveTrigger = 'auto' | 'manual' | 'pre_feedback' | 'restore'

type DraftSnapshot = {
  id: string
  student_id: string
  q1_text: string
  q2_text: string
  q3_text: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

/**
 * Insert a new immutable version snapshot for a draft. Skips if the q1/q2/q3
 * text is identical to the most recent version (deduplication). Returns the
 * inserted version row, or null if skipped.
 */
export async function createVersionSnapshot(
  client: SupabaseClient<Database>,
  draft: DraftSnapshot,
  saveTrigger: SaveTrigger
): Promise<{ id: string; version_number: number; saved_at: string; save_trigger: SaveTrigger } | null> {
  const { data: latest } = await (client as AnyClient)
    .from('personal_statement_versions')
    .select('q1_text, q2_text, q3_text, version_number')
    .eq('draft_id', draft.id)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (
    latest &&
    latest.q1_text === draft.q1_text &&
    latest.q2_text === draft.q2_text &&
    latest.q3_text === draft.q3_text
  ) {
    return null
  }

  const nextVersion = (latest?.version_number ?? 0) + 1

  const { data: inserted, error } = await (client as AnyClient)
    .from('personal_statement_versions')
    .insert({
      draft_id: draft.id,
      student_id: draft.student_id,
      version_number: nextVersion,
      q1_text: draft.q1_text,
      q2_text: draft.q2_text,
      q3_text: draft.q3_text,
      save_trigger: saveTrigger,
    })
    .select('id, version_number, saved_at, save_trigger')
    .single()

  if (error || !inserted) return null
  return inserted as { id: string; version_number: number; saved_at: string; save_trigger: SaveTrigger }
}

const TEN_MINUTES_MS = 10 * 60 * 1000

/**
 * Returns true if the most recent version is older than 10 minutes (or
 * there are no versions yet). Used to decide whether the auto-save flow
 * should also create a snapshot.
 */
export async function shouldAutoSnapshot(
  client: SupabaseClient<Database>,
  draftId: string
): Promise<boolean> {
  const { data: latest } = await (client as AnyClient)
    .from('personal_statement_versions')
    .select('saved_at')
    .eq('draft_id', draftId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!latest) return true
  const elapsed = Date.now() - new Date(latest.saved_at as string).getTime()
  return elapsed >= TEN_MINUTES_MS
}
