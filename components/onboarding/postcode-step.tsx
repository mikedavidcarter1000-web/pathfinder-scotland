'use client'

import { useState } from 'react'
import { useSIMDLookup } from '@/hooks/use-student'
import { SIMD_DESCRIPTIONS } from '@/lib/constants'
import type { Tables } from '@/types/database'

type SIMDPostcode = Tables<'simd_postcodes'>

interface PostcodeData {
  postcode: string
  simdDecile: number | null
}

interface PostcodeStepProps {
  data: PostcodeData
  onChange: (data: PostcodeData) => void
  onNext: () => void
  onBack: () => void
  nextLabel?: string
  isSubmitting?: boolean
}

export function PostcodeStep({
  data,
  onChange,
  onNext,
  onBack,
  nextLabel,
  isSubmitting = false,
}: PostcodeStepProps) {
  const [lookupAttempted, setLookupAttempted] = useState(false)
  const simdLookup = useSIMDLookup()

  const handleLookup = async () => {
    if (!data.postcode.trim()) return

    setLookupAttempted(true)
    const result = (await simdLookup.mutateAsync(data.postcode)) as SIMDPostcode | null

    if (result) {
      onChange({ ...data, simdDecile: result.simd_decile })
    } else {
      onChange({ ...data, simdDecile: null })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const decileBadge = (decile: number) => {
    if (decile <= 2) {
      return {
        label: 'SIMD20',
        bg: 'rgba(16, 185, 129, 0.1)',
        text: 'var(--pf-green-500)',
      }
    }
    if (decile <= 4) {
      return {
        label: 'SIMD40',
        bg: 'rgba(245, 158, 11, 0.1)',
        text: 'var(--pf-amber-500)',
      }
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 style={{ marginBottom: '6px' }}>Your location</h2>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          We use your postcode to check if you qualify for widening access schemes. This is
          optional.
        </p>
      </div>

      <div
        className="rounded-lg"
        style={{
          padding: '16px',
          backgroundColor: 'var(--pf-blue-100)',
          color: 'var(--pf-blue-900)',
        }}
      >
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--pf-blue-700)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div style={{ fontSize: '0.875rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--pf-blue-900)' }}>
              What is SIMD?
            </p>
            <p style={{ color: 'var(--pf-blue-900)' }}>
              The Scottish Index of Multiple Deprivation (SIMD) identifies areas of deprivation in
              Scotland. Students from SIMD20 areas may qualify for reduced entry requirements at
              many universities.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="postcode" className="pf-label">
          Home postcode
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="postcode"
            type="text"
            value={data.postcode}
            onChange={(e) => {
              onChange({ ...data, postcode: e.target.value.toUpperCase(), simdDecile: null })
              setLookupAttempted(false)
            }}
            className="pf-input flex-1 uppercase"
            placeholder="e.g. G12 8QQ"
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={!data.postcode.trim() || simdLookup.isPending}
            className="pf-btn pf-btn-secondary justify-center"
            style={{ minHeight: '48px' }}
          >
            {simdLookup.isPending ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Look up'
            )}
          </button>
        </div>
      </div>

      {/* SIMD Result */}
      {lookupAttempted && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          {data.simdDecile !== null ? (
            (() => {
              const badge = decileBadge(data.simdDecile)
              return (
                <div
                  className="rounded-lg"
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--pf-blue-50)',
                    border: '1px solid var(--pf-blue-100)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          color: 'var(--pf-blue-900)',
                        }}
                      >
                        SIMD Decile {data.simdDecile}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                        {SIMD_DESCRIPTIONS[data.simdDecile as keyof typeof SIMD_DESCRIPTIONS]}
                      </p>
                    </div>
                    {badge && (
                      <span
                        className="pf-area-badge"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                          fontWeight: 600,
                        }}
                      >
                        {badge.label} eligible
                      </span>
                    )}
                  </div>
                </div>
              )
            })()
          ) : (
            <div
              className="rounded-lg"
              style={{
                padding: '16px',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: 'var(--pf-amber-500)',
              }}
            >
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p style={{ fontWeight: 600 }}>Postcode not found</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    We couldn&apos;t find SIMD data for this postcode. You can continue without it,
                    or try a different postcode.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="pf-btn pf-btn-secondary justify-center"
          style={{ flex: 1, minHeight: '48px' }}
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="pf-btn pf-btn-primary justify-center"
          style={{ flex: 1, minHeight: '48px' }}
        >
          {isSubmitting ? 'Saving…' : nextLabel ?? 'Continue'}
        </button>
      </div>
    </form>
  )
}
