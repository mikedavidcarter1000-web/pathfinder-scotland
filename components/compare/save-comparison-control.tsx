'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const MAX_NAME_LENGTH = 60

export interface SaveComparisonControlProps {
  isAuthenticated: boolean
  canSave: boolean
  roleIds: string[]
}

export function SaveComparisonControl({
  isAuthenticated,
  canSave,
  roleIds,
}: SaveComparisonControlProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedName, setSavedName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (open) {
      setError(null)
      setSavedName(null)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, submitting])

  useEffect(() => {
    if (!savedName) return
    const id = setTimeout(() => setSavedName(null), 2800)
    return () => clearTimeout(id)
  }, [savedName])

  if (!isAuthenticated) {
    const qs = searchParams?.toString() ?? ''
    const returnTo = qs ? `${pathname}?${qs}` : pathname ?? '/careers/compare'
    const signInHref = `/auth/sign-in?redirect=${encodeURIComponent(returnTo)}`
    return (
      <Link
        href={signInHref}
        className="no-underline hover:no-underline"
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          border: '1px solid var(--pf-blue-500)',
          color: 'var(--pf-blue-700)',
          background: 'var(--pf-white)',
          marginBottom: '6px',
        }}
      >
        Sign in to save
      </Link>
    )
  }

  const disabled = !canSave

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give this comparison a name')
      return
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setError(`Max ${MAX_NAME_LENGTH} characters`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/saved-comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, roleIds }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        setError(payload?.error ?? 'Failed to save')
        return
      }
      setSavedName(trimmed)
      setName('')
      setOpen(false)
    } catch {
      setError('Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0, marginBottom: '6px' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-disabled={disabled}
        title={
          disabled ? 'Add at least 2 careers to save this comparison' : undefined
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          border: '1px solid var(--pf-blue-500)',
          color: disabled ? 'var(--pf-grey-600)' : 'var(--pf-blue-700)',
          background: 'var(--pf-white)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
          />
        </svg>
        Save this comparison
      </button>

      {savedName ? (
        <p
          role="status"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            fontSize: '0.75rem',
            color: 'var(--pf-green-500)',
            whiteSpace: 'nowrap',
            margin: 0,
          }}
        >
          Saved &ldquo;{savedName}&rdquo;
        </p>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Save comparison"
          onClick={() => !submitting && setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.45)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            style={{
              background: 'var(--pf-white)',
              borderRadius: '12px',
              padding: '20px 20px 16px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.125rem',
                fontWeight: 700,
                margin: '0 0 6px',
                color: 'var(--pf-grey-900)',
              }}
            >
              Save this comparison
            </h2>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                margin: '0 0 14px',
              }}
            >
              Give it a name you&rsquo;ll recognise later.
            </p>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--pf-grey-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
              htmlFor="saved-comparison-name"
            >
              Name
            </label>
            <input
              id="saved-comparison-name"
              ref={inputRef}
              type="text"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nursing vs Medicine"
              aria-describedby={error ? 'saved-comparison-name-error' : undefined}
              aria-invalid={error ? true : undefined}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--pf-grey-300)',
                fontSize: '0.9375rem',
                boxSizing: 'border-box',
              }}
            />
            {error ? (
              <p
                id="saved-comparison-name-error"
                role="alert"
                style={{
                  color: 'var(--pf-red-500)',
                  fontSize: '0.8125rem',
                  margin: '8px 0 0',
                }}
              >
                {error}
              </p>
            ) : null}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '16px',
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--pf-grey-300)',
                  background: 'var(--pf-white)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || name.trim().length === 0}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--pf-blue-700)',
                  color: 'var(--pf-white)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor:
                    submitting || name.trim().length === 0
                      ? 'not-allowed'
                      : 'pointer',
                  opacity: submitting || name.trim().length === 0 ? 0.7 : 1,
                }}
              >
                {submitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
