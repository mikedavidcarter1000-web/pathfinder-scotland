'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  homepageTeaserAction,
  type HomepageTeaserResult,
} from '@/app/actions/homepage-teaser'

const YEAR_GROUPS = ['S2', 'S3', 'S4', 'S5', 'S6'] as const
type YearGroup = (typeof YEAR_GROUPS)[number]

export function PostcodeTeaser() {
  const [postcode, setPostcode] = useState('')
  const [yearGroup, setYearGroup] = useState<YearGroup | ''>('')
  const [result, setResult] = useState<HomepageTeaserResult | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setInlineError(null)

    const trimmed = postcode.trim()
    if (trimmed.length === 0) {
      setInlineError('Please enter your postcode.')
      return
    }
    if (!yearGroup) {
      setInlineError('Please choose your year group.')
      return
    }

    startTransition(async () => {
      const res = await homepageTeaserAction({ postcode: trimmed, yearGroup })
      setResult(res)
    })
  }

  function reset() {
    setResult(null)
    setInlineError(null)
  }

  if (result && result.ok) {
    return <TeaserResultPanel result={result} onReset={reset} />
  }

  return (
    <section
      id="try-it"
      aria-labelledby="try-it-heading"
      className="pf-card"
      style={{ padding: '28px 24px', scrollMarginTop: '80px' }}
    >
      <div style={{ marginBottom: '20px' }}>
        <span className="pf-badge-blue inline-flex" style={{ marginBottom: '12px' }}>
          Try it in 10 seconds
        </span>
        <h2
          id="try-it-heading"
          style={{
            fontSize: 'clamp(1.375rem, 4vw, 1.75rem)',
            marginBottom: '8px',
          }}
        >
          See what Pathfinder finds for you
        </h2>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem', margin: 0 }}>
          Enter your postcode and year group. No sign-up needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: '1fr', marginBottom: '16px' }}
        >
          <div className="sm:grid sm:grid-cols-2 sm:gap-4">
            <div style={{ marginBottom: '16px' }} className="sm:mb-0">
              <label
                htmlFor="pt-postcode"
                style={{
                  display: 'block',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginBottom: '6px',
                  color: 'var(--pf-grey-900)',
                }}
              >
                Postcode
              </label>
              <input
                id="pt-postcode"
                name="postcode"
                type="text"
                autoComplete="postal-code"
                inputMode="text"
                placeholder="e.g. EH11 4BN"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                disabled={isPending}
                maxLength={10}
                style={{
                  width: '100%',
                  minHeight: '48px',
                  padding: '10px 14px',
                  border: '1px solid var(--pf-grey-300)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: '#fff',
                  color: 'var(--pf-grey-900)',
                }}
              />
            </div>
            <div>
              <label
                htmlFor="pt-yeargroup"
                style={{
                  display: 'block',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginBottom: '6px',
                  color: 'var(--pf-grey-900)',
                }}
              >
                Year group
              </label>
              <select
                id="pt-yeargroup"
                name="yearGroup"
                value={yearGroup}
                onChange={(e) => setYearGroup(e.target.value as YearGroup | '')}
                disabled={isPending}
                style={{
                  width: '100%',
                  minHeight: '48px',
                  padding: '10px 14px',
                  border: '1px solid var(--pf-grey-300)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: '#fff',
                  color: 'var(--pf-grey-900)',
                }}
              >
                <option value="">Choose year group</option>
                {YEAR_GROUPS.map((yg) => (
                  <option key={yg} value={yg}>
                    {yg}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {inlineError && (
          <p
            role="alert"
            style={{
              color: 'var(--pf-red-500)',
              fontSize: '0.875rem',
              marginBottom: '12px',
              marginTop: 0,
            }}
          >
            {inlineError}
          </p>
        )}

        {result && !result.ok && result.error === 'not_found' && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '12px',
              color: 'var(--pf-red-500)',
              fontSize: '0.9375rem',
            }}
          >
            {result.message}
          </div>
        )}

        {result && !result.ok && result.error !== 'not_found' && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '12px',
              color: 'var(--pf-red-500)',
              fontSize: '0.9375rem',
            }}
          >
            {result.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="pf-btn-primary w-full sm:w-auto justify-center"
          style={{ minHeight: '48px' }}
        >
          {isPending ? (
            <>
              <Spinner />
              <span>Looking up your postcode...</span>
            </>
          ) : (
            <>
              Show me what Pathfinder can do
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <p
          style={{
            marginTop: '14px',
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
            margin: '14px 0 0',
          }}
        >
          We use your postcode to check SIMD eligibility. Nothing is saved.
        </p>
      </form>
    </section>
  )
}

function TeaserResultPanel({
  result,
  onReset,
}: {
  result: Extract<HomepageTeaserResult, { ok: true }>
  onReset: () => void
}) {
  const { simdDecile, bursaryCount, wideningAccessCourseCount, sectorSamples } = result
  const lowSimd = simdDecile <= 8

  const simdLine = lowSimd
    ? `You live in a SIMD ${simdDecile} area. This may unlock reduced entry requirements at all 18 Scottish universities.`
    : `You live in a SIMD ${simdDecile} area. You may still qualify for support based on other circumstances.`

  return (
    <section
      id="try-it"
      aria-live="polite"
      className="pf-card"
      style={{
        padding: '28px 24px',
        scrollMarginTop: '80px',
        borderColor: 'var(--pf-blue-500)',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <span
          className="pf-badge inline-flex"
          style={{
            marginBottom: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.14)',
            color: 'var(--pf-green-500)',
          }}
        >
          Here is what we found
        </span>
        <p
          style={{
            fontSize: 'clamp(1.0625rem, 2.5vw, 1.1875rem)',
            color: 'var(--pf-grey-900)',
            lineHeight: 1.5,
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
          }}
        >
          {simdLine}
        </p>
      </div>

      <ul
        className="space-y-3"
        style={{ marginBottom: '24px', listStyle: 'none', padding: 0 }}
      >
        <ResultLine
          text={
            wideningAccessCourseCount > 0
              ? `${wideningAccessCourseCount} widening access courses available for your area`
              : 'Widening access offers vary by course - sign up to see your personalised list'
          }
        />
        <ResultLine text={`${bursaryCount} bursaries may be available to you`} />
        {sectorSamples.length > 0 && (
          <li className="flex items-start gap-3">
            <CheckMark />
            <div style={{ color: 'var(--pf-grey-900)', fontSize: '0.9375rem' }}>
              Careers you could explore:{' '}
              {sectorSamples.map((s, idx) => (
                <span key={s.id}>
                  <Link
                    href={`/careers/${s.id}`}
                    style={{
                      color: 'var(--pf-blue-700)',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    {s.name}
                  </Link>
                  {idx < sectorSamples.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </li>
        )}
      </ul>

      <div
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          borderRadius: '10px',
          padding: '18px 20px',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            margin: '0 0 12px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--pf-grey-900)',
          }}
        >
          See your matched courses, named bursaries and deadlines
        </p>
        <Link
          href={`/auth/sign-up?postcode=${encodeURIComponent(result.postcode)}&yearGroup=${encodeURIComponent(result.yearGroup)}`}
          className="pf-btn-primary w-full sm:w-auto justify-center"
          style={{ minHeight: '48px' }}
        >
          Sign up free
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <button
        type="button"
        onClick={onReset}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          minHeight: '44px',
        }}
      >
        Try a different postcode
      </button>
    </section>
  )
}

function ResultLine({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckMark />
      <span style={{ color: 'var(--pf-grey-900)', fontSize: '0.9375rem' }}>{text}</span>
    </li>
  )
}

function CheckMark() {
  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0"
      style={{
        width: '22px',
        height: '22px',
        borderRadius: '9999px',
        backgroundColor: 'var(--pf-green-500)',
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '1px',
      }}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="animate-spin"
      style={{
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
      }}
    />
  )
}
