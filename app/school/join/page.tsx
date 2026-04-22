'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, useSignUp } from '@/hooks/use-auth'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'
import { STAFF_ROLE_LABELS, type SchoolStaffRole } from '@/lib/school/constants'

export default function SchoolJoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinContent />
    </Suspense>
  )
}

function JoinContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { user } = useAuth()
  const signUp = useSignUp()
  const toast = useToast()

  const schoolSlug = params.get('school') || ''
  const role = (params.get('role') || 'guidance_teacher') as SchoolStaffRole

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!schoolSlug) {
    return (
      <div className="pf-container pt-8 pb-12">
        <p>Invalid invite link (missing school). Ask your colleague to re-send the invite.</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!fullName) {
      setError('Enter your full name.')
      return
    }
    setSubmitting(true)
    try {
      if (!user) {
        if (!email || password.length < 8) {
          setError('Enter an email and password (8+ chars).')
          setSubmitting(false)
          return
        }
        try {
          await signUp.mutateAsync({ email, password })
        } catch (err) {
          setError((err as Error).message || 'Could not create account.')
          setSubmitting(false)
          return
        }
      }
      const res = await fetch('/api/school/join-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolSlug, role, fullName }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Could not join school.')
        setSubmitting(false)
        return
      }
      toast.success('You are in', 'Welcome to your school dashboard.')
      router.push('/school/dashboard')
    } catch (err) {
      setError((err as Error).message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pf-container pt-8 pb-12">
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem' }}>
          Join your school
        </h1>
        <p style={{ opacity: 0.8 }}>
          You&apos;ve been invited as a <strong>{STAFF_ROLE_LABELS[role] || role}</strong>.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={labelStyle}>
            <span>Full name *</span>
            <input style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>

          {!user && (
            <>
              <label style={labelStyle}>
                <span>Work email *</span>
                <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label style={labelStyle}>
                <span>Password *</span>
                <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>
            </>
          )}

          {error && <p role="alert" style={{ color: '#DC2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

          <SubmitButton isLoading={submitting}>Join school</SubmitButton>

          {!user && (
            <p style={{ fontSize: '0.8125rem', opacity: 0.7, margin: 0 }}>
              Already have an account? <Link href={`/auth/sign-in?redirect=/school/join?school=${schoolSlug}&role=${role}`}>Sign in</Link>.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  fontSize: '0.875rem',
  fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--pf-grey-300)',
  borderRadius: '6px',
  fontSize: '0.9375rem',
  fontWeight: 400,
}
