'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

type Role =
  | 'student'
  | 'parent'
  | 'teacher'
  | 'school-leadership'
  | 'funder'
  | 'other'

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent / Carer' },
  { value: 'teacher', label: 'Teacher / Guidance' },
  { value: 'school-leadership', label: 'School Leadership' },
  { value: 'funder', label: 'Funder' },
  { value: 'other', label: 'Other' },
]

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

interface FieldErrors {
  name?: string
  email?: string
  role?: string
  message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    if (!name.trim()) next.name = 'Please tell us your name.'
    if (!email.trim()) next.email = 'Please enter your email.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.'
    if (!role) next.role = 'Please choose the option that best describes you.'
    if (!message.trim()) next.message = 'Please enter a message.'
    else if (message.trim().length < 10) next.message = 'Message must be at least 10 characters.'
    return next
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('submitting')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          message: message.trim(),
        }),
      })
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
      }
      if (!response.ok || !data.success) {
        setStatus('error')
        setErrorMessage(data.error ?? null)
        return
      }
      setStatus('success')
      setName('')
      setEmail('')
      setRole('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <section
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-300)',
          paddingTop: '56px',
          paddingBottom: '40px',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}
          >
            <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>
              Home
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>Contact</span>
          </nav>
          <h1 style={{ marginBottom: '12px' }}>Get in touch</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem', maxWidth: '560px' }}>
            Whether you&apos;re a student, parent, school, or funder — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: '48px', paddingBottom: '80px' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <div className="pf-card" style={{ padding: '32px' }}>
            {status === 'success' ? (
              <div role="status" aria-live="polite">
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--pf-green-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 style={{ marginBottom: '8px' }}>Message sent</h2>
                <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
                  Thanks for your message. We&apos;ll get back to you within 2 working days.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="pf-btn-secondary"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <FormField
                  id="name"
                  label="Name"
                  error={errors.name}
                >
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={status === 'submitting'}
                    autoComplete="name"
                    required
                    style={inputStyle(Boolean(errors.name))}
                  />
                </FormField>

                <FormField
                  id="email"
                  label="Email"
                  error={errors.email}
                >
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'submitting'}
                    autoComplete="email"
                    required
                    style={inputStyle(Boolean(errors.email))}
                  />
                </FormField>

                <FormField
                  id="role"
                  label="I am a..."
                  error={errors.role}
                >
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    disabled={status === 'submitting'}
                    required
                    style={{
                      ...inputStyle(Boolean(errors.role)),
                      appearance: 'none',
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234A4A5A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                      paddingRight: '40px',
                    }}
                  >
                    <option value="">Select an option</option>
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  id="message"
                  label="Message"
                  error={errors.message}
                  hint="Minimum 10 characters."
                >
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={status === 'submitting'}
                    required
                    rows={6}
                    style={{
                      ...inputStyle(Boolean(errors.message)),
                      resize: 'vertical',
                      minHeight: '140px',
                      fontFamily: 'inherit',
                    }}
                  />
                </FormField>

                {status === 'error' && (
                  <div
                    role="alert"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: 'var(--pf-grey-900)',
                      fontSize: '0.9375rem',
                      marginBottom: '20px',
                    }}
                  >
                    {errorMessage ??
                      'Something went wrong. Please try again or email us directly at '}
                    {!errorMessage && (
                      <a
                        href="mailto:hello@pathfinderscot.co.uk"
                        style={{ color: 'var(--pf-blue-500)', fontWeight: 600 }}
                      >
                        hello@pathfinderscot.co.uk
                      </a>
                    )}
                    {!errorMessage && '.'}
                  </div>
                )}

                <button
                  type="submit"
                  className="pf-btn-primary"
                  disabled={status === 'submitting'}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {status === 'submitting' ? (
                    <>
                      <Spinner />
                      Sending...
                    </>
                  ) : (
                    'Send message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function FormField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.9375rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p style={{ marginTop: '6px', fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
          {hint}
        </p>
      )}
      {error && (
        <p
          role="alert"
          style={{ marginTop: '6px', fontSize: '0.8125rem', color: 'var(--pf-red-500)' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${hasError ? 'var(--pf-red-500)' : 'var(--pf-grey-300)'}`,
    backgroundColor: 'var(--pf-white)',
    color: 'var(--pf-grey-900)',
    fontSize: '1rem',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    outline: 'none',
  }
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
