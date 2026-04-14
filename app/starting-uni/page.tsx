import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  ChecklistItem,
  ChecklistItemWithProgress,
} from '@/types/offers'
import { StartingUniClient } from './starting-uni-client'

export const metadata: Metadata = {
  title: 'Starting University Checklist | Pathfinder Scotland',
  description:
    'Your complete checklist for starting university in Scotland. Bank accounts, GP registration, SAAS funding, free software, and everything else you need to sort.',
  openGraph: {
    title: 'Starting University Checklist | Pathfinder Scotland',
    description:
      'Your complete checklist for starting university in Scotland. Bank accounts, GP registration, SAAS funding, free software, and everything else you need to sort.',
  },
  alternates: {
    canonical: '/starting-uni',
  },
}

export default async function StartingUniPage() {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: itemsData } = await (supabase as any)
    .from('starting_uni_checklist_items')
    .select(
      'id, title, description, category, linked_offer_id, url, display_order, is_active'
    )
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('display_order', { ascending: true })

  const items = (itemsData ?? []) as ChecklistItem[]

  // Resolve linked offer slugs so we can render internal links directly.
  const linkedIds = Array.from(
    new Set(items.map((i) => i.linked_offer_id).filter((v): v is string => !!v))
  )

  const slugMap = new Map<string, string>()
  if (linkedIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: offerRows } = await (supabase as any)
      .from('offers')
      .select('id, slug')
      .in('id', linkedIds)
    for (const row of (offerRows ?? []) as { id: string; slug: string }[]) {
      slugMap.set(row.id, row.slug)
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let progressMap = new Map<string, string>()
  if (user && items.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: progress } = await (supabase as any)
      .from('student_checklist_progress')
      .select('checklist_item_id, completed_at')
      .eq('student_id', user.id)
      .in(
        'checklist_item_id',
        items.map((i) => i.id)
      )
    progressMap = new Map(
      ((progress ?? []) as { checklist_item_id: string; completed_at: string }[]).map((p) => [
        p.checklist_item_id,
        p.completed_at,
      ])
    )
  }

  const withProgress: ChecklistItemWithProgress[] = items.map((item) => {
    const completedAt = progressMap.get(item.id) ?? null
    return {
      ...item,
      completed: completedAt !== null,
      completed_at: completedAt,
    }
  })

  const linkedOfferSlugs: Record<string, string> = {}
  for (const [id, slug] of slugMap.entries()) linkedOfferSlugs[id] = slug

  return (
    <StartingUniClient
      initialItems={withProgress}
      linkedOfferSlugs={linkedOfferSlugs}
      isAuthenticated={!!user}
    />
  )
}
