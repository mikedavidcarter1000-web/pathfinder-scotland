'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { isOfficialCouncilDomain } from '@/lib/authority/constants'

type LA = { id: string; name: string; code: string; slug: string }

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '6px',
  color: '#1a1a2e',
  fontSize: '0.9375rem',
  fontFamily: "'Space Grotesk', sans-serif",
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '0.9375rem',
  outline: 'none',
  boxSizing: 'border-box',
}
const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: 'var(--pf-blue-700, #1d4ed8)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  fontFamily: "'Space Grotesk', sans-serif",
}

export default function AuthorityRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'account' | 'authority'>('account')
  const [authorities, setAuthorities] = useState<LA[]>([])
  const [loadingLAs, setLoadingLAs] = useState(false)

  // Step 1 — account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2 — authority details
  const [authorityId, setAuthorityId] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactRole, setContactRole] = useState('')
  const [phone, setPhone] = useState('')
  const [domainWarning, setDomainWarning] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Check if already signed in
  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setStep('authority')
    })
  }, [])

  // Load LAs when we reach step 2
  useEffect(() => {
    if (step !== 'authority') return
    setLoadingLAs(true)
    fetch('/api/authority/register')
      .then((r) => r.json())
      .then((d) => setAuthorities(d.authorities ?? []))
      .catch(() => {})
      .finally(() => setLoadingLAs(false))
  }, [step])

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    const supabase = getSupabaseClient()
    const { error: signUpErr } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password })
    setSubmitting(false)
    if (signUpErr) {
      setError(signUpErr.message)
      return
    }
    setContactEmail(email.trim().toLowerCase())
    setStep('authority')
  }

  function handleContactEmailChange(val: string) {
    setContactEmail(val)
    setDomainWarning(val.includes('@') && !isOfficialCouncilDomain(val))
  }

  async function handleAuthoritySubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!authorityId) { setError('Please select a local authority.'); return }
    if (!contactName.trim()) { setError('Contact name is required.'); return }
    if (!contactEmail.trim()) { setError('Contact email is required.'); return }
    if (!contactRole.trim()) { setError('Job title / role is required.'); return }

    setSubmitting(true)
    const res = await fetch('/api/authority/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorityId, contactName, contactEmail, contactRole, phone }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setError(data.error ?? 'Registration failed.')
      return
    }
    router.push('/authority/dashboard?registered=1')
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    maxWidth: '540px',
    margin: '0 auto',
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '60px 16px' }}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '32px' }}>
          <Link href="/for-authorities" style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← For Authorities
          </Link>
        </div>

        {step === 'account' && (
          <>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', color: '#1a1a2e' }}>
              Create your account
            </h1>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>
              Step 1 of 2 — create an account to register your local authority.
            </p>
            <form onSubmit={handleAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle} htmlFor="email">Email address</label>
                <input id="email" type="email" required style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="password">Password</label>
                <input id="password" type="password" required style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type="password" required style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
              <button type="submit" style={btnStyle} disabled={submitting}>
                {submitting ? 'Creating account…' : 'Continue'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link href="/auth/sign-in?redirect=/authority/register" style={{ color: 'var(--pf-blue-700, #1d4ed8)' }}>
                Sign in
              </Link>
            </p>
          </>
        )}

        {step === 'authority' && (
          <>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', color: '#1a1a2e' }}>
              Register your authority
            </h1>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>
              Step 2 of 2 — select your local authority and provide contact details. Registrations are reviewed within 2 working days.
            </p>
            <form onSubmit={handleAuthoritySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle} htmlFor="authority">Local authority</label>
                {loadingLAs ? (
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading…</p>
                ) : (
                  <select
                    id="authority"
                    required
                    style={{ ...inputStyle, backgroundColor: '#fff' }}
                    value={authorityId}
                    onChange={(e) => setAuthorityId(e.target.value)}
                  >
                    <option value="">Select a local authority…</option>
                    {authorities.map((la) => (
                      <option key={la.id} value={la.id}>{la.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label style={labelStyle} htmlFor="contactName">Your full name</label>
                <input id="contactName" type="text" required style={inputStyle} value={contactName} onChange={(e) => setContactName(e.target.value)} autoComplete="name" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="contactEmail">Official email address</label>
                <input id="contactEmail" type="email" required style={inputStyle} value={contactEmail} onChange={(e) => handleContactEmailChange(e.target.value)} autoComplete="email" />
                {domainWarning && (
                  <p style={{ color: '#d97706', fontSize: '0.8125rem', marginTop: '6px' }}>
                    This does not appear to be an official council email address. Verification may take longer.
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle} htmlFor="contactRole">Job title / role</label>
                <input id="contactRole" type="text" required style={inputStyle} value={contactRole} onChange={(e) => setContactRole(e.target.value)} placeholder="e.g. Education Development Officer" />
              </div>
              <div>
                <label style={labelStyle} htmlFor="phone">Phone number <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
                <input id="phone" type="tel" style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
              <button type="submit" style={btnStyle} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Register authority'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
