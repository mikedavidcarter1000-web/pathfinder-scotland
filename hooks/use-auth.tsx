'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Tables } from '@/types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  student: Tables<'students'> | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  student: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [student, setStudent] = useState<Tables<'students'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchStudent(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchStudent(session.user.id)
      } else {
        setStudent(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchStudent = async (userId: string) => {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('id', userId)
      .single()

    setStudent(data)
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, session, student, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Sign Up
export function useSignUp() {
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return data
    },
  })
}

// Sign In
export function useSignIn() {
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
  })
}

// Sign Out
export function useSignOut() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

// Reset Password (send email)
export function useResetPassword() {
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
    },
  })
}

// Update Password
export function useUpdatePassword() {
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { error } = await supabase.auth.updateUser({
        password,
      })
      if (error) throw error
    },
  })
}

// OAuth Sign In
export function useOAuthSignIn() {
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async ({
      provider,
    }: {
      provider: 'google' | 'github' | 'facebook'
    }) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    },
  })
}
