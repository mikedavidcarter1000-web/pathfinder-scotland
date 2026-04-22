'use client'

import { useState, useTransition } from 'react'
import {
  submitPilotInterest,
  type PilotInterestRole,
} from '@/app/actions/pilot-interest'

export interface PilotInterestFormProps {
  role: PilotInterestRole
  heading: string
  description: string
  organisationLabel?: string
  submitLabel?: string
}

export function PilotInterestForm({
  role,
  heading,
  description,
  organisationLabel = 'Organisation (school, council, etc.)',
  submitLabel = 'Register interest',
}: PilotInterestFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [postcode, setPostcode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName) {
      setError('Please add your name.')
      return
    }
    if (!trimmedEmail) {
      setError('Please add your email address.')
      return
    }
    startTransition(async () => {
      const res = await submitPilotInterest({
        role,
        name: trimmedName,
        email: trimmedEmail,
        organisation: organisation.trim() || undefined,
        postcode: postcode.trim() || undefined,
        message: message.trim() || undefined,
      })
      if (res.status === 'ok') {
        setSubmitted(true)
        setName('')
        setEmail('')
        setOrganisation('')
        setPostcode('')
        setMessage('')
      } else if (res.status === 'invalid') {
        setError('Please check your name and email and try again.')
      } else {
        setError(
          res.status === 'server_error'
            ? res.message
            : 'Something went wrong. Please try again.',
        )
      }
    })
  }

  if (submitted) {
    return (
      <section
        aria-live="polite"
        className="pf-card"
        style={{
          padding: '24px',
          borderColor: 'var(--pf-green-500)',
          background: 'rgba(16, 185, 129, 0.06)',
        }}
      >
        <h2 style={{ marginBottom: '8px' }}>Thanks — we&rsquo;ll be in touch.</h2>
        <p style={{ color: 'var(--pf-grey-900)', margin: 0 }}>
          Your interest has been logged. We&rsquo;ll email you with next steps for
          the pilot.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-labelledby={`pf-pilot-${role}-heading`}
      className="pf-card"
      style={{ padding: '28px 24px' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h2 id={`pf-pilot-${role}-heading`} style={{ marginBottom: '6px' }}>
          {heading}
        </h2>
        <p style={{ color: 'var(--pf-grey-600)', margin: 0 }}>{description}</p>
      </div>
      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr' }}>
          <div className="sm:grid sm:grid-cols-2 sm:gap-4">
            <div style={{ marginBottom: '12px' }} className="sm:mb-0">
              <label htmlFor={`pf-pi-name-${role}`} className="pf-label">
                Your name
              </label>
              <input
                id={`pf-pi-name-${role}`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
                maxLength={120}
                className="pf-input"
              />
            </div>
            <div>
              <label htmlFor={`pf-pi-email-${role}`} className="pf-label">
                Email
              </label>
              <input
                id={`pf-pi-email-${role}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
                autoComplete="email"
                maxLength={200}
                className="pf-input"
              />
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-2 sm:gap-4">
            <div style={{ marginBottom: '12px' }} className="sm:mb-0">
              <label htmlFor={`pf-pi-org-${role}`} className="pf-label">
                {organisationLabel}
              </label>
              <input
                id={`pf-pi-org-${role}`}
                type="text"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                disabled={isPending}
                maxLength={200}
                className="pf-input"
              />
            </div>
            <div>
              <label htmlFor={`pf-pi-postcode-${role}`} className="pf-label">
                Postcode (optional)
              </label>
              <input
                id={`pf-pi-postcode-${role}`}
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                disabled={isPending}
                maxLength={10}
                autoComplete="postal-code"
                className="pf-input"
              />
            </div>
          </div>
          <div>
            <label htmlFor={`pf-pi-msg-${role}`} className="pf-label">
              Anything we should know? (optional)
            </label>
            <textarea
              id={`pf-pi-msg-${role}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
              maxLength={2000}
              rows={4}
              className="pf-input"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
        {error && (
          <p
            role="alert"
            style={{
              color: 'var(--pf-red-500)',
              fontSize: '0.875rem',
              margin: '12px 0 0',
            }}
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="pf-btn-primary"
          style={{ marginTop: '16px', minHeight: '48px' }}
        >
          {isPending ? 'Sending…' : submitLabel}
        </button>
      </form>
    </section>
  )
}
