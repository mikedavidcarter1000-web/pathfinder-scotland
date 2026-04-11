'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSignIn } from '@/hooks/use-auth'
import { SocialLoginButtons, SocialLoginDivider } from '@/components/auth/social-login-buttons'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const signIn = useSignIn()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    signIn.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success('Signed in')
          router.push(redirect)
        },
        onError: (err) => {
          toast.error('Sign in failed', err.message || 'Invalid email or password')
        },
      }
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--pf-blue-50)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 no-underline hover:no-underline"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt=""
              width={40}
              height={40}
              style={{ display: 'block', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '1.5rem',
                color: 'var(--pf-grey-900)',
              }}
            >
              Pathfinder Scotland
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          className="pf-card-flat p-6 sm:p-8"
          style={{
            boxShadow: '0 10px 30px rgba(0, 45, 114, 0.08)',
          }}
        >
          <div className="text-center mb-6">
            <h1 style={{ marginBottom: '4px' }}>Welcome back</h1>
            <p style={{ color: 'var(--pf-grey-600)' }}>Sign in to continue your journey.</p>
          </div>

          {/* Social Login */}
          <SocialLoginButtons redirectTo={redirect} />
          <SocialLoginDivider />

          {/* Error Message */}
          {signIn.error && (
            <div
              className="mb-4 rounded-lg"
              style={{
                padding: '12px',
                backgroundColor: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: 'var(--pf-red-500)',
                fontSize: '0.875rem',
              }}
            >
              {signIn.error.message || 'Invalid email or password'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="pf-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pf-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                <label
                  htmlFor="password"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                  }}
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  style={{ fontSize: '0.875rem', color: 'var(--pf-blue-500)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pf-input"
                  style={{ paddingRight: '44px' }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center"
                  style={{ color: 'var(--pf-grey-600)', minWidth: '44px', minHeight: '44px' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <SubmitButton
              type="submit"
              isLoading={signIn.isPending}
              loadingText="Signing in..."
              fullWidth
            >
              Sign in
            </SubmitButton>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: 'var(--pf-grey-600)' }}>
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center mt-6"
          style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}
        >
          By signing in, you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--pf-blue-500)' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ color: 'var(--pf-blue-500)' }}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
