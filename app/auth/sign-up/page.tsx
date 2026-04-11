'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSignUp } from '@/hooks/use-auth'
import { SocialLoginButtons, SocialLoginDivider } from '@/components/auth/social-login-buttons'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'

type AccountType = 'student' | 'parent'

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  )
}

function SignUpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialType: AccountType =
    searchParams.get('type') === 'parent' ? 'parent' : 'student'

  const [accountType, setAccountType] = useState<AccountType>(initialType)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [validationError, setValidationError] = useState('')

  const signUp = useSignUp()
  const toast = useToast()

  const onboardingHref =
    accountType === 'parent' ? '/onboarding?type=parent' : '/onboarding'

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    const passwordError = validatePassword(password)
    if (passwordError) {
      setValidationError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (!acceptTerms) {
      setValidationError('Please accept the terms and conditions')
      return
    }

    signUp.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success('Account created', "Let's get you set up.")
          router.push(onboardingHref)
        },
        onError: (err) => {
          toast.error('Sign up failed', err.message || 'Please try again.')
        },
      }
    )
  }

  const getPasswordStrength = () => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength()
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = [
    'var(--pf-red-500)',
    'var(--pf-amber-500)',
    'var(--pf-amber-500)',
    'var(--pf-blue-500)',
    'var(--pf-green-500)',
  ]

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
            <h1 style={{ marginBottom: '4px' }}>Create your account</h1>
            <p style={{ color: 'var(--pf-grey-600)' }}>
              {accountType === 'parent'
                ? 'Support your child through their subject choices.'
                : 'Start your university journey today.'}
            </p>
          </div>

          {/* Account type toggle */}
          <div
            role="radiogroup"
            aria-label="Account type"
            className="grid grid-cols-2 gap-3 mb-5"
          >
            <AccountTypeCard
              label="I'm a student"
              description="Build your pathway"
              active={accountType === 'student'}
              onClick={() => setAccountType('student')}
            />
            <AccountTypeCard
              label="I'm a parent or carer"
              description="Support your child"
              active={accountType === 'parent'}
              onClick={() => setAccountType('parent')}
            />
          </div>

          {/* Social Login */}
          <SocialLoginButtons redirectTo={onboardingHref} />
          <SocialLoginDivider />

          {/* Error Message */}
          {(signUp.error || validationError) && (
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
              {validationError || signUp.error?.message || 'An error occurred'}
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
              <label htmlFor="password" className="pf-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pf-input"
                  style={{ paddingRight: '44px' }}
                  placeholder="Create a strong password"
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full"
                        style={{
                          backgroundColor:
                            i < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : 'var(--pf-grey-100)',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                    Password strength:{' '}
                    {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too short'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="pf-label">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pf-input"
                style={{
                  borderColor:
                    confirmPassword && confirmPassword !== password
                      ? 'var(--pf-red-500)'
                      : undefined,
                  backgroundColor:
                    confirmPassword && confirmPassword !== password
                      ? 'rgba(239,68,68,0.04)'
                      : undefined,
                }}
                placeholder="Confirm your password"
              />
              {confirmPassword && confirmPassword !== password && (
                <p style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--pf-red-500)' }}>
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded flex-shrink-0"
                style={{ accentColor: 'var(--pf-blue-700)' }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link href="/terms" style={{ color: 'var(--pf-blue-500)' }}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" style={{ color: 'var(--pf-blue-500)' }}>
                  Privacy Policy
                </Link>
              </label>
            </div>

            <SubmitButton
              type="submit"
              isLoading={signUp.isPending}
              loadingText="Creating account..."
              fullWidth
            >
              Create account
            </SubmitButton>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: 'var(--pf-grey-600)' }}>
              Already have an account?{' '}
              <Link
                href="/auth/sign-in"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountTypeCard({
  label,
  description,
  active,
  onClick,
}: {
  label: string
  description: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-pressed={active}
      onClick={onClick}
      className="text-left transition-all"
      style={{
        padding: '14px 16px',
        borderRadius: '8px',
        backgroundColor: active ? 'var(--pf-blue-50)' : 'var(--pf-white)',
        border: active
          ? '2px solid var(--pf-blue-700)'
          : '2px solid var(--pf-grey-300)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.9375rem',
          color: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-900)',
          lineHeight: 1.2,
          marginBottom: '2px',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
        {description}
      </div>
    </button>
  )
}
