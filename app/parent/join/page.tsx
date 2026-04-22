'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, useSignIn, useSignUp } from '@/hooks/use-auth'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'

export default function ParentJoinPage() {
  return (
    <Suspense fallback={null}>
      <ParentJoinContent />
    </Suspense>
  )
}

type ValidateResult =
  | { valid: true; normalised_code: string; student_first_name: string | null }
  | { valid: false; reason: string }

function ParentJoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const signUp = useSignUp()
  const signIn = useSignIn()

  const [code, setCode] = useState(searchParams.get('code')?.toUpperCase() ?? '')
  const [validated, setValidated] = useState<ValidateResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')

  // Account fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [postcode, setPostcode] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Auto-validate an inbound code from the query string
  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode) {
      void validateCode(urlCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function validateCode(raw: string) {
    setValidating(true)
    setError(null)
    try {
      const res = await fetch('/api/parent-link/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: raw }),
      })
      const json = (await res.json().catch(() => ({}))) as ValidateResult | { error?: string }
      if ('valid' in json) {
        setValidated(json)
        if (json.valid) {
          setCode(json.normalised_code)
        }
      } else {
        setError((json.error as string) || 'Could not validate invite code.')
      }
    } catch {
      setError('Could not validate invite code.')
    } finally {
      setValidating(false)
    }
  }

  // If already signed in with an account, skip signup flow -- just link
  async function completeLinking(authedUserId: string) {
    if (!validated || !validated.valid) return
    try {
      const res = await fetch('/api/parent-link/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName || undefined,
          phone: phone || undefined,
          postcode: postcode || undefined,
          code: validated.normalised_code,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error || 'Could not complete linking.')
        return
      }
      toast.success('All set', 'Your parent account is now linked.')
      router.push('/parent/dashboard')
    } catch {
      setError('Could not complete linking. Please try again.')
    } finally {
      setSubmitting(false)
    }
    // authedUserId is informational; the server action uses the cookie session
    void authedUserId
  }

  async function handleSignUpAndLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!validated || !validated.valid) {
      setError('Enter a valid invite code first.')
      return
    }
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!acceptTerms) {
      setError('Please accept the terms and conditions.')
      return
    }

    setSubmitting(true)
    try {
      const signUpResult = await signUp.mutateAsync({ email: email.trim(), password })
      if (!signUpResult.user) {
        setError('Could not create account. Please try signing in instead.')
        setSubmitting(false)
        return
      }

      // Small wait for the auth cookie to settle before the server action fires.
      // The cookie is set during signUp, but the session-cookie sync needs a tick
      // under some auth-provider combinations.
      await new Promise((r) => setTimeout(r, 300))
      await completeLinking(signUpResult.user.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-up failed.'
      setError(msg)
      setSubmitting(false)
    }
  }

  async function handleSignInAndLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!validated || !validated.valid) {
      setError('Enter a valid invite code first.')
      return
    }

    setSubmitting(true)
    try {
      const result = await signIn.mutateAsync({ email: email.trim(), password })
      if (!result.user) {
        setError('Sign-in failed. Please check your password.')
        setSubmitting(false)
        return
      }
      await new Promise((r) => setTimeout(r, 200))
      await completeLinking(result.user.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed.'
      setError(msg)
      setSubmitting(false)
    }
  }

  // If user is already authenticated when they land, go straight to the "finish
  // your parent profile" form with just name/phone/postcode.
  const alreadyAuthed = !!user && !authLoading

  return (
    <div
      className="flex justify-center px-4 py-6"
      style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '100%' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <Link href="/" className="inline-flex items-center justify-center no-underline hover:no-underline">
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

        <div
          className="pf-card-flat p-5"
          style={{ boxShadow: '0 10px 30px rgba(0, 45, 114, 0.08)' }}
        >
          <div className="text-center mb-4">
            <h1 style={{ marginBottom: '4px' }}>Link to your child&apos;s Pathfinder</h1>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
              Enter your invite code to view their progress, saved courses, and funding options.
            </p>
          </div>

          {/* Step 1: code */}
          {!validated?.valid && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void validateCode(code)
              }}
              className="space-y-3"
            >
              <div>
                <label htmlFor="invite-code" className="pf-label">
                  Invite code
                </label>
                <input
                  id="invite-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABCD-1234"
                  autoComplete="off"
                  maxLength={12}
                  required
                  className="pf-input"
                  style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                />
              </div>
              {validated && !validated.valid && (
                <div
                  role="alert"
                  className="rounded-lg"
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: 'var(--pf-red-500)',
                    fontSize: '0.875rem',
                  }}
                >
                  {validated.reason === 'expired' &&
                    'This invite code has expired. Ask your child to generate a new one.'}
                  {validated.reason === 'already-redeemed' &&
                    'This invite has already been used. Ask your child for a new one.'}
                  {validated.reason === 'not-found' &&
                    'We could not find that invite code. Double-check the link your child shared.'}
                  {validated.reason === 'format' &&
                    'Invite codes look like ABCD-1234 (8 characters).'}
                  {validated.reason === 'error' && 'Something went wrong. Please try again.'}
                </div>
              )}
              {error && (
                <p role="alert" style={{ color: 'var(--pf-red-500)', fontSize: '0.875rem' }}>
                  {error}
                </p>
              )}
              <SubmitButton type="submit" isLoading={validating} loadingText="Checking..." fullWidth>
                Continue
              </SubmitButton>
            </form>
          )}

          {/* Step 2: account */}
          {validated?.valid && (
            <>
              <div
                className="rounded-lg"
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--pf-green-50, #ecfdf5)',
                  border: '1px solid var(--pf-green-200, #a7f3d0)',
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-900)',
                  marginBottom: '16px',
                }}
              >
                Invite code accepted
                {validated.student_first_name ? ` for ${validated.student_first_name}.` : '.'}
              </div>

              {alreadyAuthed ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSubmitting(true)
                    void completeLinking(user!.id)
                  }}
                  className="space-y-3"
                >
                  <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                    You&apos;re signed in as <strong>{user!.email}</strong>. Finish your parent
                    profile to link this child.
                  </p>
                  <LabelledInput
                    id="full-name"
                    label="Your full name"
                    value={fullName}
                    onChange={setFullName}
                    required
                  />
                  <LabelledInput
                    id="phone"
                    label="Phone (optional)"
                    value={phone}
                    onChange={setPhone}
                    type="tel"
                  />
                  <LabelledInput
                    id="postcode"
                    label="Postcode (optional)"
                    value={postcode}
                    onChange={(v) => setPostcode(v.toUpperCase())}
                    placeholder="EH1 2AB"
                  />
                  {error && (
                    <p role="alert" style={{ color: 'var(--pf-red-500)', fontSize: '0.875rem' }}>
                      {error}
                    </p>
                  )}
                  <SubmitButton type="submit" isLoading={submitting} loadingText="Linking..." fullWidth>
                    Link and continue
                  </SubmitButton>
                </form>
              ) : (
                <>
                  <div
                    role="tablist"
                    className="flex gap-1"
                    style={{
                      backgroundColor: 'var(--pf-grey-100)',
                      borderRadius: '10px',
                      padding: '4px',
                      marginBottom: '16px',
                    }}
                  >
                    {(['signup', 'signin'] as const).map((m) => (
                      <button
                        key={m}
                        role="tab"
                        type="button"
                        onClick={() => setMode(m)}
                        aria-selected={mode === m}
                        className="flex-1 text-sm"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: mode === m ? 'var(--pf-white)' : 'transparent',
                          color: 'var(--pf-grey-900)',
                          fontWeight: 600,
                          fontFamily: "'Space Grotesk', sans-serif",
                          boxShadow: mode === m ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        {m === 'signup' ? 'New account' : 'I already have one'}
                      </button>
                    ))}
                  </div>

                  {mode === 'signup' ? (
                    <form onSubmit={handleSignUpAndLink} className="space-y-3">
                      <LabelledInput
                        id="full-name"
                        label="Your full name"
                        value={fullName}
                        onChange={setFullName}
                        required
                      />
                      <LabelledInput
                        id="email"
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        required
                        autoComplete="email"
                      />
                      <LabelledInput
                        id="password"
                        label="Password (min. 8 characters)"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        required
                        autoComplete="new-password"
                      />
                      <LabelledInput
                        id="phone"
                        label="Phone (optional)"
                        value={phone}
                        onChange={setPhone}
                        type="tel"
                      />
                      <LabelledInput
                        id="postcode"
                        label="Postcode (optional)"
                        value={postcode}
                        onChange={(v) => setPostcode(v.toUpperCase())}
                        placeholder="EH1 2AB"
                      />
                      <label className="flex items-start gap-2" style={{ fontSize: '0.875rem' }}>
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: 'var(--pf-blue-700)' }}
                        />
                        <span style={{ color: 'var(--pf-grey-600)', lineHeight: 1.5 }}>
                          I agree to the{' '}
                          <Link href="/terms" style={{ color: 'var(--pf-blue-500)' }}>
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" style={{ color: 'var(--pf-blue-500)' }}>
                            Privacy Policy
                          </Link>
                          .
                        </span>
                      </label>
                      {error && (
                        <p role="alert" style={{ color: 'var(--pf-red-500)', fontSize: '0.875rem' }}>
                          {error}
                        </p>
                      )}
                      <SubmitButton
                        type="submit"
                        isLoading={submitting}
                        loadingText="Creating account..."
                        fullWidth
                      >
                        Create account and link
                      </SubmitButton>
                    </form>
                  ) : (
                    <form onSubmit={handleSignInAndLink} className="space-y-3">
                      <LabelledInput
                        id="email"
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        required
                        autoComplete="email"
                      />
                      <LabelledInput
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        required
                        autoComplete="current-password"
                      />
                      {error && (
                        <p role="alert" style={{ color: 'var(--pf-red-500)', fontSize: '0.875rem' }}>
                          {error}
                        </p>
                      )}
                      <SubmitButton
                        type="submit"
                        isLoading={submitting}
                        loadingText="Linking..."
                        fullWidth
                      >
                        Sign in and link
                      </SubmitButton>
                    </form>
                  )}
                </>
              )}
            </>
          )}

          <div
            className="mt-4 pt-4 text-center"
            style={{ borderTop: '1px solid var(--pf-grey-200)', fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}
          >
            Not sure what this is? Read our{' '}
            <Link href="/for-parents" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
              parent and guardian guide
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  )
}

function LabelledInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required,
  autoComplete,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  autoComplete?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="pf-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="pf-input"
      />
    </div>
  )
}
