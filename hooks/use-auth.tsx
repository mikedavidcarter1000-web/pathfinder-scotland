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
  parent: Tables<'parents'> | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  student: null,
  parent: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [student, setStudent] = useState<Tables<'students'> | null>(null)
  const [parent, setParent] = useState<Tables<'parents'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // A signed-in user is either a student or a parent (or rarely neither
  // mid-onboarding). Fetch both in parallel so the dashboard can branch
  // without a second round-trip.
  const fetchProfiles = async (userId: string) => {
    const supabase = getSupabaseClient()
    const [studentRes, parentRes] = await Promise.all([
      supabase.from('students').select('*').eq('id', userId).maybeSingle(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('parents')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
    ])
    setStudent(studentRes.data as Tables<'students'> | null)
    setParent(parentRes.data as Tables<'parents'> | null)
    setIsLoading(false)
  }

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfiles(session.user.id)
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
        fetchProfiles(session.user.id)
      } else {
        setStudent(null)
        setParent(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, student, parent, isLoading }}>
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
const SIGN_IN_TIMEOUT_MS = 15_000

function friendlySignInMessage(err: unknown): string {
  const e = err as { status?: number; message?: string; name?: string }
  const status = e?.status ?? 0
  const msg = (e?.message || '').toLowerCase()

  if (e?.name === 'SignInTimeoutError' || msg.includes('timeout') || msg.includes('timed out')) {
    return 'Something went wrong. Please try again.'
  }
  if (status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please wait a moment.'
  }
  if (
    status === 400 ||
    msg.includes('invalid login') ||
    msg.includes('invalid credentials') ||
    msg.includes('invalid email or password')
  ) {
    return 'Invalid email or password.'
  }
  if (status >= 500 || msg.includes('database') || msg.includes('schema') || msg.includes('internal')) {
    return 'Something went wrong. Please try again later.'
  }
  // Fall back to friendly generic (never leak raw Supabase/DB text).
  return 'Invalid email or password.'
}

export function useSignIn() {
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          const err = new Error('Sign-in request timed out.') as Error & { name: string }
          err.name = 'SignInTimeoutError'
          reject(err)
        }, SIGN_IN_TIMEOUT_MS)
      })

      try {
        const result = await Promise.race([
          supabase.auth.signInWithPassword({ email, password }),
          timeoutPromise,
        ])
        const { data, error } = result
        if (error) {
          const friendly = new Error(friendlySignInMessage(error))
          throw friendly
        }
        return data
      } catch (err) {
        if ((err as Error)?.name === 'SignInTimeoutError') {
          throw new Error(friendlySignInMessage(err))
        }
        if (err instanceof Error && err.message && !err.message.toLowerCase().includes('database')) {
          // Already a friendly Error thrown above — rethrow as-is.
          throw err
        }
        throw new Error(friendlySignInMessage(err))
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
      }
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
      // Clear all Pathfinder-specific localStorage data on sign-out
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('pf_')) keysToRemove.push(key)
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key))
      }
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
export type OAuthProvider = 'google' | 'github' | 'facebook' | 'apple' | 'twitter' | 'azure'

export function useOAuthSignIn() {
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async ({
      provider,
      redirectTo,
    }: {
      provider: OAuthProvider
      redirectTo?: string
    }) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`,
        },
      })
      if (error) throw error
    },
  })
}
