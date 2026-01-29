'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from './use-auth'

interface Subscription {
  has_subscription: boolean
  subscription_id?: string
  status?: string
  current_period_end?: string
  cancel_at?: string | null
  price?: {
    id: string
    amount: number
    currency: string
    interval: string
  }
  product?: {
    id: string
    name: string
  }
}

export function useSubscription() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<Subscription> => {
      if (!user) {
        return { has_subscription: false }
      }

      const { data, error } = await supabase.rpc('get_user_subscription')

      if (error) {
        console.error('Error fetching subscription:', error)
        return { has_subscription: false }
      }

      return data as Subscription
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useHasActiveSubscription() {
  const { data: subscription, isLoading } = useSubscription()

  return {
    hasSubscription: subscription?.has_subscription ?? false,
    isLoading,
    subscription,
  }
}

export function useManageSubscription() {
  const openPortal = async () => {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
    })

    const data = await response.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      throw new Error(data.error || 'Failed to open billing portal')
    }
  }

  return { openPortal }
}
