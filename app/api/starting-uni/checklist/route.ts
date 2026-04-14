import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  ChecklistItem,
  ChecklistItemWithProgress,
  ChecklistResponse,
} from '@/types/offers'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items, error } = await (supabase as any)
      .from('starting_uni_checklist_items')
      .select(
        'id, title, description, category, linked_offer_id, url, display_order, is_active'
      )
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[starting-uni/checklist] query error:', error)
      return NextResponse.json({ error: 'Failed to load checklist' }, { status: 500 })
    }

    const allItems = (items ?? []) as ChecklistItem[]

    const {
      data: { user },
    } = await supabase.auth.getUser()

    let progressMap = new Map<string, string>()
    if (user && allItems.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: progress } = await (supabase as any)
        .from('student_checklist_progress')
        .select('checklist_item_id, completed_at')
        .eq('student_id', user.id)
        .in(
          'checklist_item_id',
          allItems.map((i) => i.id)
        )
      progressMap = new Map(
        ((progress ?? []) as { checklist_item_id: string; completed_at: string }[]).map((p) => [
          p.checklist_item_id,
          p.completed_at,
        ])
      )
    }

    const withProgress: ChecklistItemWithProgress[] = allItems.map((item) => {
      const completedAt = progressMap.get(item.id) ?? null
      return {
        ...item,
        completed: completedAt !== null,
        completed_at: completedAt,
      }
    })

    const completedCount = withProgress.filter((i) => i.completed).length

    const response: ChecklistResponse = {
      items: withProgress,
      completed_count: completedCount,
      total_count: withProgress.length,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[starting-uni/checklist] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
