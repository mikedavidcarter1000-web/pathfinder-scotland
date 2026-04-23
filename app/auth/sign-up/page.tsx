'use client'

import { Suspense, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSignUp } from '@/hooks/use-auth'
import { SocialLoginButtons, SocialLoginDivider } from '@/components/auth/social-login-buttons'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'

// NOTE: the students.user_type column is retained (values: 'student', 'parent')
// as a reserved discriminator for future role expansion. The MVP sign-up only
// creates 'student' rows -- parent/carer sign-up was dropped 2026-04-25.

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  )
}

function SignUpContent() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const signUp = useSignUp()
  const toast = useToast()

  const onboardingHref = '/onboarding'

  const passwordRules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least one number', met: /[0-9]/.test(password) },
  ]

  const collectValidationErrors = (): string[] => {
    const errors: string[] = []
    const unmetRules = passwordRules.filter((r) => !r.met)
    if (unmetRules.length > 0) {
      errors.push(
        `Password must have: ${unmetRules.map((r) => r.label.toLowerCase()).join(', ')}`
      )
    }
    if (password && confirmPassword && password !== confirmPassword) {
      errors.push('Passwords do not match')
    }
    if (!acceptTerms) {
      errors.push('Please accept the terms and conditions')
    }
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = collectValidationErrors()
    setValidationErrors(errors)
    if (errors.length > 0) return

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
      className="flex justify-center px-4 py-4 sm:py-5"
      style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '100%' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center no-underline hover:no-underline"
          >
            <Image
              src="/logo-full.png"
              alt="Pathfinder Scotland"
              width={140}
              height={58}
              priority
              style={{ height: '58px', width: 'auto' }}
            />
          </Link>
        </div>

        {/* Card */}
        <div
          className="pf-card-flat p-5"
          style={{
            boxShadow: '0 10px 30px rgba(0, 45, 114, 0.08)',
          }}
        >
          <div className="text-center mb-3">
            <h1 style={{ marginBottom: '2px' }}>Create your account</h1>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
              Start your university journey today.
            </p>
          </div>

          {/* Social Login */}
          <SocialLoginButtons redirectTo={onboardingHref} />
          <SocialLoginDivider />

          {/* Error Message */}
          {(signUp.error || validationErrors.length > 0) && (
            <div
              role="alert"
              className="mb-4 rounded-lg"
              style={{
                padding: '12px',
                backgroundColor: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: 'var(--pf-red-500)',
                fontSize: '0.875rem',
              }}
            >
              {validationErrors.length > 0 ? (
                validationErrors.length === 1 ? (
                  <span>{validationErrors[0]}</span>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )
              ) : (
                signUp.error?.message || 'An error occurred'
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
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

              {/* Password Rules Checklist */}
              <ul
                aria-label="Password requirements"
                style={{
                  marginTop: '8px',
                  padding: 0,
                  listStyle: 'none',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                }}
              >
                {passwordRules.map((rule) => (
                  <li
                    key={rule.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: rule.met ? 'var(--pf-green-500)' : 'var(--pf-grey-600)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {rule.met ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                    </span>
                    <span>
                      <span className="sr-only">{rule.met ? 'Met:' : 'Not yet met:'} </span>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
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

            <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-500)', margin: 0 }}>
              <Link href="/privacy/young-persons" style={{ color: 'var(--pf-blue-500)' }}>
                How we look after your information
              </Link>{' '}
              -- a plain-English guide for students.
            </p>

            <SubmitButton
              type="submit"
              isLoading={signUp.isPending}
              loadingText="Creating account..."
              fullWidth
            >
              Create account
            </SubmitButton>
          </form>

          <div className="mt-3 text-center">
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

