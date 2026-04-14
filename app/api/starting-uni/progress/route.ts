import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { ChecklistProgressResponse } from '@/types/offers'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      checklist_item_id?: string
      completed?: boolean
    }
    const itemId = body.checklist_item_id
    const completed = body.completed

    if (!itemId || typeof itemId !== 'string' || !UUID_RE.test(itemId)) {
      return NextResponse.json({ error: 'Invalid checklist_item_id' }, { status: 400 })
    }
    if (typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid completed flag' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (completed) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('student_checklist_progress').upsert(
        { student_id: user.id, checklist_item_id: itemId },
        { onConflict: 'student_id,checklist_item_id', ignoreDuplicates: true }
      )
      if (error) {
        console.error('[starting-uni/progress] insert error:', error)
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 400 })
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('student_checklist_progress')
        .delete()
        .eq('student_id', user.id)
        .eq('checklist_item_id', itemId)
      if (error) {
        console.error('[starting-uni/progress] delete error:', error)
        return NextResponse.json({ error: 'Failed to clear progress' }, { status: 500 })
      }
    }

    // Recalculate counts so the client can update the progress bar without
    // a follow-up round trip.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalCount } = await (supabase as any)
      .from('starting_uni_checklist_items')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: completedCount } = await (supabase as any)
      .from('student_checklist_progress')
      .select('checklist_item_id', { count: 'exact', head: true })
      .eq('student_id', user.id)

    const response: ChecklistProgressResponse = {
      checklist_item_id: itemId,
      completed,
      completed_count: completedCount ?? 0,
      total_count: totalCount ?? 0,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[starting-uni/progress] unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
