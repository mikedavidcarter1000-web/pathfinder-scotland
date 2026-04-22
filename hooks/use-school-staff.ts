'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getSupabaseClient } from '@/lib/supabase'

export type SchoolStaffMembership = {
  schoolId: string
  isAdmin: boolean
}

export function useIsSchoolStaff(): { isStaff: boolean; membership: SchoolStaffMembership | null; isLoading: boolean } {
  const { user, isLoading: authLoading } = useAuth()
  const [membership, setMembership] = useState<SchoolStaffMembership | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setMembership(null)
      setIsLoading(false)
      return
    }
    const supabase = getSupabaseClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('school_staff')
      .select('school_id, is_school_admin')
      .eq('user_id', user.id)
      .maybeSingle()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: any) => {
        setMembership(data ? { schoolId: data.school_id, isAdmin: !!data.is_school_admin } : null)
        setIsLoading(false)
      })
  }, [user, authLoading])

  return { isStaff: !!membership, membership, isLoading }
}
