'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useSignUp } from '@/hooks/use-auth'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'
import { SCOTTISH_LOCAL_AUTHORITIES, STAFF_ROLE_LABELS, type SchoolStaffRole } from '@/lib/school/constants'

type FoundingStatus = { remaining: number; cap: number; taken: number }

const CONTACT_ROLES: SchoolStaffRole[] = [
  'guidance_teacher',
  'pt_guidance',
  'dyw_coordinator',
  'depute',
  'head_teacher',
  'admin',
]

export default function SchoolRegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const signUp = useSignUp()
  const toast = useToast()

  const [founding, setFounding] = useState<FoundingStatus | null>(null)
  const [schoolName, setSchoolName] = useState('')
  const [localAuthority, setLocalAuthority] = useState('')
  const [postcode, setPostcode] = useState('')
  const [seedCode, setSeedCode] = useState('')
  const [schoolType, setSchoolType] = useState<string>('secondary')
  const [contactName, setContactName] = useState('')
  const [contactRole, setContactRole] = useState<SchoolStaffRole>('guidance_teacher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accept, setAccept] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/school/register')
      .then((r) => r.json())
      .then((d) => setFounding(d))
      .catch(() => null)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!schoolName || !contactName || !localAuthority || !email || !password) {
      setError('Please fill in all required fields.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!accept) {
      setError('Please accept the terms.')
      return
    }

    setSubmitting(true)
    try {
      // Sign-up if not already logged in
      if (!user) {
        try {
          await signUp.mutateAsync({ email, password })
        } catch (err) {
          setError((err as Error).message || 'Could not create account.')
          setSubmitting(false)
          return
        }
      }

      const res = await fetch('/api/school/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName,
          localAuthority,
          postcode,
          seedCode,
          schoolType,
          contactName,
          contactRole,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Registration failed.')
        setSubmitting(false)
        return
      }
      toast.success('School registered', 'Your 12-month trial is active.')
      router.push('/school/dashboard')
    } catch (err) {
      setError((err as Error).message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const remainingText = founding
    ? founding.remaining > 0
      ? `${founding.remaining} of ${founding.cap} founding-school places remaining.`
      : 'All founding-school places have been taken.'
    : ''

  return (
    <div className="pf-container pt-8 pb-12">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Link href="/for-schools" style={{ fontSize: '0.875rem', color: 'var(--pf-blue-700)' }}>
          &larr; Back to For Schools
        </Link>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem', marginTop: '12px' }}>
          Register your school
        </h1>

        {founding && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: founding.remaining > 0 ? '#FEF3C7' : '#E0E7FF',
              border: '1px solid',
              borderColor: founding.remaining > 0 ? '#F59E0B' : '#6366F1',
              borderRadius: '8px',
            }}
          >
            <p style={{ fontWeight: 600, margin: 0 }}>
              Free for 12 months for our first 10 founding schools. No card required.
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '0.875rem', opacity: 0.85 }}>{remainingText}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={labelStyle}>
            <span>School name *</span>
            <input style={inputStyle} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
          </label>

          <label style={labelStyle}>
            <span>Local authority *</span>
            <select style={inputStyle} value={localAuthority} onChange={(e) => setLocalAuthority(e.target.value)} required>
              <option value="">Select...</option>
              {SCOTTISH_LOCAL_AUTHORITIES.map((la) => (
                <option key={la} value={la}>
                  {la}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <label style={labelStyle}>
              <span>Postcode</span>
              <input style={inputStyle} value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="EH1 1AA" />
            </label>
            <label style={labelStyle}>
              <span>SEED code (optional)</span>
              <input style={inputStyle} value={seedCode} onChange={(e) => setSeedCode(e.target.value)} placeholder="e.g. 8123456" />
            </label>
          </div>

          <label style={labelStyle}>
            <span>School type</span>
            <select style={inputStyle} value={schoolType} onChange={(e) => setSchoolType(e.target.value)}>
              <option value="secondary">Secondary</option>
              <option value="all_through">All-through</option>
              <option value="special">Special</option>
              <option value="independent">Independent</option>
            </select>
          </label>

          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--pf-grey-200)' }} />
          <p style={{ fontWeight: 600, margin: 0 }}>Your contact details</p>

          <label style={labelStyle}>
            <span>Your full name *</span>
            <input style={inputStyle} value={contactName} onChange={(e) => setContactName(e.target.value)} required />
          </label>

          <label style={labelStyle}>
            <span>Your role *</span>
            <select style={inputStyle} value={contactRole} onChange={(e) => setContactRole(e.target.value as SchoolStaffRole)}>
              {CONTACT_ROLES.map((r) => (
                <option key={r} value={r}>
                  {STAFF_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>

          {!user && (
            <>
              <label style={labelStyle}>
                <span>Work email *</span>
                <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <label style={labelStyle}>
                  <span>Password *</span>
                  <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <label style={labelStyle}>
                  <span>Confirm password *</span>
                  <input style={inputStyle} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </label>
              </div>
            </>
          )}

          <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
            <span>
              I accept the Pathfinder Scotland <Link href="/terms" target="_blank">terms</Link> and{' '}
              <Link href="/privacy" target="_blank">privacy policy</Link> on behalf of my school.
            </span>
          </label>

          {error && <p role="alert" style={{ color: '#DC2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>}

          <SubmitButton isLoading={submitting}>Register school</SubmitButton>

          <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
            Already registered? <Link href="/auth/sign-in?redirect=/school/dashboard">Sign in</Link>.
          </p>
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
