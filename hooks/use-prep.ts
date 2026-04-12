import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from './use-auth'
import type { Tables } from '@/types/database'

type ChecklistItem = Tables<'prep_checklist_items'>

// Fetch all checklist items for the current student
export function usePrepChecklist() {
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  return useQuery<ChecklistItem[]>({
    queryKey: ['prep-checklist', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('prep_checklist_items')
        .select('*')
        .eq('student_id', user.id)

      if (error) throw error
      return (data || []) as ChecklistItem[]
    },
    enabled: !!user,
  })
}

// Toggle a checklist item (upsert: create if not exists, toggle if exists)
export function useToggleChecklistItem() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      itemKey,
      isCompleted,
    }: {
      itemKey: string
      isCompleted: boolean
    }) => {
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('prep_checklist_items')
        .upsert(
          {
            student_id: user.id,
            item_key: itemKey,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          },
          { onConflict: 'student_id,item_key' }
        )
        .select()
        .single()

      if (error) throw error
      return data as ChecklistItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prep-checklist'] })
    },
  })
}

// Get completion count for progress tracking
export function usePrepProgress(totalItems: number) {
  const { data: items, isLoading } = usePrepChecklist()
  const completed = items?.filter((i) => i.is_completed)?.length ?? 0
  const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0

  return {
    completed,
    total: totalItems,
    percentage,
    isLoading,
  }
}
