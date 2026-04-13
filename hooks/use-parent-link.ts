import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from './use-auth'

export interface LinkedChild {
  link_id: string
  student_id: string
  first_name: string | null
  last_name: string | null
  email: string
  school_stage: string | null
  school_name: string | null
  postcode: string | null
  simd_decile: number | null
  linked_at: string
}

export interface LinkedParent {
  link_id: string
  parent_id: string
  full_name: string
  email: string
  linked_at: string | null
  status: 'pending' | 'active' | 'revoked'
}

// Parents view: list of linked children
export function useLinkedChildren() {
  const supabase = getSupabaseClient()
  const { user, parent } = useAuth()

  return useQuery({
    queryKey: ['linked-children', user?.id],
    queryFn: async () => {
      if (!user || !parent) return [] as LinkedChild[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('get_linked_children')
      if (error) throw error
      return (data || []) as LinkedChild[]
    },
    enabled: !!user && !!parent,
  })
}

// Student view: list of linked parents
export function useLinkedParents() {
  const supabase = getSupabaseClient()
  const { user, student } = useAuth()

  return useQuery({
    queryKey: ['linked-parents', user?.id],
    queryFn: async () => {
      if (!user || !student) return [] as LinkedParent[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('get_linked_parents')
      if (error) throw error
      return (data || []) as LinkedParent[]
    },
    enabled: !!user && !!student,
  })
}

// Student: generate a fresh invite code
export function useGenerateParentInviteCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/parent-link/generate', { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate invite code')
      }
      return json as { code: string; expires_in_hours: number }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-parents'] })
    },
  })
}

// Parent: redeem an invite code
export function useRedeemParentInviteCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/parent-link/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || 'Failed to redeem invite code')
      }
      return json as { link_id: string; student_id: string; student_name: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-children'] })
    },
  })
}

// Student: revoke a parent's access
export function useRevokeParentLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (linkId: string) => {
      const res = await fetch('/api/parent-link/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: linkId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || 'Failed to revoke access')
      }
      return json as { ok: boolean }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-parents'] })
    },
  })
}
