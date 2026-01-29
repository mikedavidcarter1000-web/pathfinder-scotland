'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/auth/sign-in',
  fallback,
}: AuthGuardProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, requireAuth, redirectTo, router])

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    )
  }

  if (requireAuth && !user) {
    return null
  }

  return <>{children}</>
}

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <AuthGuard requireAuth>{children}</AuthGuard>
}

interface PublicOnlyRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function PublicOnlyRoute({
  children,
  redirectTo = '/dashboard',
}: PublicOnlyRouteProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return <>{children}</>
}
