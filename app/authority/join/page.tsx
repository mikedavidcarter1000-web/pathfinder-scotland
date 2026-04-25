'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

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

type InvitationDetails = {
  email: string
  role: string
  roleLabel: string
  authorityName: string
}

function JoinForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [tokenError, setTokenError] = useState('')

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setTokenError('No invitation token found in this link.')
      setLoading(false)
      return
    }
    fetch(`/api/authority/join/${token}`)
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) { setTokenError(d.error ?? 'Invalid invitation.'); return }
        setInvitation(d)
      })
      .catch(() => setTokenError('Could not load invitation details.'))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setSubmitting(true)
    const res = await fetch(`/api/authority/join/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setSubmitting(false)
      setError(data.error ?? 'Could not complete registration.')
      return
    }

    // Sign in with the newly-created credentials
    const supabase = getSupabaseClient()
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: invitation!.email,
      password,
    })
    setSubmitting(false)
    if (signInErr) {
      // Account created but auto sign-in failed — direct them to sign in manually
      router.push('/auth/sign-in?message=account-created')
      return
    }
    router.push('/authority/dashboard?joined=1')
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    maxWidth: '540px',
    margin: '0 auto',
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '60px 16px' }}>
        <div style={cardStyle}>
          <p style={{ color: '#64748b' }}>Validating invitation…</p>
        </div>
      </main>
    )
  }

  if (tokenError) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '60px 16px' }}>
        <div style={cardStyle}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
            Invitation not found
          </h1>
          <p style={{ color: '#dc2626', marginBottom: '24px' }}>{tokenError}</p>
          <Link href="/for-authorities" style={{ color: 'var(--pf-blue-700, #1d4ed8)', fontSize: '0.875rem' }}>
            ← For Authorities
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '60px 16px' }}>
      <div style={cardStyle}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', color: '#1a1a2e' }}>
          Accept your invitation
        </h1>
        <div style={{ backgroundColor: '#eff6ff', borderRadius: '8px', padding: '16px', marginBottom: '28px' }}>
          <p style={{ color: '#1e40af', margin: 0, fontSize: '0.9375rem' }}>
            You have been invited to join <strong>{invitation!.authorityName}</strong> as a{' '}
            <strong>{invitation!.roleLabel}</strong>.
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Email address</label>
            <p style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b', margin: 0, display: 'block', border: '1px solid #e2e8f0' }}>
              {invitation!.email}
            </p>
          </div>
          <div>
            <label style={labelStyle} htmlFor="fullName">Your full name</label>
            <input id="fullName" type="text" required style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="password">Create a password</label>
            <input id="password" type="password" required style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" required style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" style={btnStyle} disabled={submitting}>
            {submitting ? 'Creating account…' : 'Accept invitation'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function AuthorityJoinPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '60px 16px' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <p style={{ color: '#64748b' }}>Loading…</p>
        </div>
      </main>
    }>
      <JoinForm />
    </Suspense>
  )
}
