import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from './use-auth'
import type { Tables } from '@/types/database'

type StudentOffer = Tables<'student_offers'>
type OfferWithDetails = StudentOffer & {
  course: Tables<'courses'> & { university: Tables<'universities'> }
}

export type OfferStatus = 'considering' | 'applied' | 'conditional' | 'unconditional' | 'accepted' | 'declined' | 'rejected'

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  considering: 'Considering',
  applied: 'Applied',
  conditional: 'Conditional Offer',
  unconditional: 'Unconditional Offer',
  accepted: 'Accepted',
  declined: 'Declined',
  rejected: 'Rejected',
}

export const OFFER_STATUS_COLOURS: Record<OfferStatus, { bg: string; text: string }> = {
  considering: { bg: 'var(--pf-grey-100)', text: 'var(--pf-grey-600)' },
  applied: { bg: 'var(--pf-blue-100)', text: 'var(--pf-blue-700)' },
  conditional: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--pf-amber-500)' },
  unconditional: { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--pf-green-500)' },
  accepted: { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--pf-green-500)' },
  declined: { bg: 'var(--pf-grey-100)', text: 'var(--pf-grey-600)' },
  rejected: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--pf-red-500)' },
}

// Fetch all offers for the current student with course and university details
export function useStudentOffers() {
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  return useQuery<OfferWithDetails[]>({
    queryKey: ['student-offers', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('student_offers')
        .select(`
          *,
          course:courses(
            *,
            university:universities(*)
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as unknown as OfferWithDetails[]
    },
    enabled: !!user,
  })
}

// Fetch a single offer for a specific course
export function useOfferForCourse(courseId: string | null) {
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  return useQuery<StudentOffer | null>({
    queryKey: ['student-offer', user?.id, courseId],
    queryFn: async () => {
      if (!user || !courseId) return null

      const { data, error } = await supabase
        .from('student_offers')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()

      if (error) throw error
      return data as StudentOffer | null
    },
    enabled: !!user && !!courseId,
  })
}

// Check if student has any accepted offers
export function useHasAcceptedOffer() {
  const { data: offers } = useStudentOffers()
  const accepted = offers?.filter((o) => o.status === 'accepted') ?? []
  const firmChoice = accepted.find((o) => o.is_firm) ?? accepted[0] ?? null
  return {
    hasAccepted: accepted.length > 0,
    acceptedOffer: firmChoice,
    acceptedOffers: accepted,
  }
}

// Create or upsert an offer
export function useUpsertOffer() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: {
      course_id: string
      university_id: string
      status: OfferStatus
      offer_grades?: string | null
      is_firm?: boolean
      is_insurance?: boolean
      notes?: string | null
    }) => {
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: offer, error } = await (supabase as any)
        .from('student_offers')
        .upsert(
          {
            student_id: user.id,
            ...data,
            status_updated_at: new Date().toISOString(),
          },
          { onConflict: 'student_id,course_id' }
        )
        .select()
        .single()

      if (error) throw error
      return offer as StudentOffer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-offers'] })
      queryClient.invalidateQueries({ queryKey: ['student-offer'] })
    },
  })
}

// Update offer status
export function useUpdateOfferStatus() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      offerId,
      status,
      offer_grades,
    }: {
      offerId: string
      status: OfferStatus
      offer_grades?: string | null
    }) => {
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('student_offers')
        .update({
          status,
          offer_grades: offer_grades ?? null,
          status_updated_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .eq('student_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as StudentOffer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-offers'] })
      queryClient.invalidateQueries({ queryKey: ['student-offer'] })
    },
  })
}

// Delete an offer
export function useDeleteOffer() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (offerId: string) => {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('student_offers')
        .delete()
        .eq('id', offerId)
        .eq('student_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-offers'] })
      queryClient.invalidateQueries({ queryKey: ['student-offer'] })
    },
  })
}
