'use client'

import { useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrentStudent, useUpdateStudent } from '@/hooks/use-student'
import { useToast } from '@/components/ui/toast'
import {
  onboardingPostcodeLookupAction,
  type OnboardingPostcodeResult,
} from '@/app/actions/onboarding-postcode-lookup'

// Renders a dismissible banner when the signed-in student has a stored
// postcode but no SIMD decile (i.e. their postcode is no longer present in
// our refreshed simd_postcodes seed). Clicking "Update postcode" opens an
// inline modal that mirrors the onboarding postcode-step UX.
//
// Dismissal is session-only (component state) -- the banner returns on
// next session until the postcode is fixed, by design.

export function StalePostcodeBanner() {
  const { data: student } = useCurrentStudent()
  const [dismissed, setDismissed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  if (!student) return null
  const stored = student.postcode
  if (!stored) return null
  if (student.simd_decile != null) return null
  if (dismissed) return null

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg"
        style={{
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: 'var(--pf-blue-50)',
          border: '1px solid var(--pf-blue-100)',
          color: 'var(--pf-blue-900)',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          style={{ color: 'var(--pf-blue-700)', marginTop: '2px' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              margin: 0,
              marginBottom: '4px',
              fontSize: '0.9375rem',
            }}
          >
            Your postcode looks out of date
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
            We couldn&apos;t find SIMD data for {stored} in the current lookup. This
            usually means the postcode has been updated or replaced. Update it now
            to unlock personalised matching.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="pf-btn pf-btn-primary pf-btn-sm"
            style={{ minHeight: '40px' }}
          >
            Update postcode
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 4px',
              color: 'var(--pf-blue-700)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              minHeight: '40px',
            }}
          >
            Dismiss for now
          </button>
        </div>
      </div>

      {modalOpen && (
        <UpdatePostcodeModal
          currentPostcode={stored}
          onClose={() => setModalOpen(false)}
          onUpdated={() => {
            setModalOpen(false)
            setDismissed(true)
          }}
        />
      )}
    </>
  )
}

function UpdatePostcodeModal({
  currentPostcode,
  onClose,
  onUpdated,
}: {
  currentPostcode: string
  onClose: () => void
  onUpdated: () => void
}) {
  const [input, setInput] = useState(currentPostcode)
  const [result, setResult] = useState<OnboardingPostcodeResult | null>(null)
  const [isLookingUp, startLookup] = useTransition()
  const updateStudent = useUpdateStudent()
  const toast = useToast()
  const queryClient = useQueryClient()

  const handleLookup = () => {
    if (!input.trim()) return
    startLookup(async () => {
      const res = await onboardingPostcodeLookupAction(input)
      setResult(res)
    })
  }

  const handleSave = async () => {
    if (!result || (result.status !== 'ok' && result.status !== 'missing_simd')) return
    try {
      await updateStudent.mutateAsync({ postcode: result.postcode })
      // Refresh anything else that may depend on simd-derived data.
      queryClient.invalidateQueries({ queryKey: ['student'] })
      queryClient.invalidateQueries({ queryKey: ['matched-courses'] })
      queryClient.invalidateQueries({ queryKey: ['bursaries'] })
      toast.success("Postcode updated -- we'll now personalise your results.")
      onUpdated()
    } catch (err) {
      toast.error('Could not save the new postcode. Please try again.')
      // eslint-disable-next-line no-console
      console.error('[StalePostcodeBanner] update failed', err)
    }
  }

  const canSave =
    result != null &&
    (result.status === 'ok' || result.status === 'missing_simd') &&
    !updateStudent.isPending

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stale-postcode-modal-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        className="pf-card"
        style={{
          backgroundColor: '#fff',
          maxWidth: '480px',
          width: '100%',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
          <h2
            id="stale-postcode-modal-title"
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Update your postcode
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--pf-grey-600)',
              minHeight: '32px',
              minWidth: '32px',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p style={{ marginTop: 0, marginBottom: '16px', fontSize: '0.9375rem', color: 'var(--pf-grey-600)' }}>
          Enter your current postcode and we&apos;ll re-check your SIMD area and
          widening access eligibility.
        </p>

        <label htmlFor="stale-pc-input" className="pf-label">
          Postcode
        </label>
        <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: '16px' }}>
          <input
            id="stale-pc-input"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value.toUpperCase())
              setResult(null)
            }}
            className="pf-input flex-1 uppercase"
            placeholder="e.g. EH11 4BN"
            autoFocus
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={!input.trim() || isLookingUp}
            className="pf-btn pf-btn-secondary justify-center"
            style={{ minHeight: '48px' }}
          >
            {isLookingUp ? 'Looking up...' : 'Look up'}
          </button>
        </div>

        {result && <ModalResultPanel result={result} />}

        <div className="flex flex-col-reverse sm:flex-row gap-3" style={{ marginTop: '16px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={updateStudent.isPending}
            className="pf-btn pf-btn-secondary justify-center"
            style={{ flex: 1, minHeight: '48px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="pf-btn pf-btn-primary justify-center"
            style={{ flex: 1, minHeight: '48px' }}
          >
            {updateStudent.isPending ? 'Saving...' : 'Save and continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalResultPanel({ result }: { result: OnboardingPostcodeResult }) {
  if (result.status === 'ok') {
    return (
      <div
        className="rounded-lg"
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--pf-blue-50)',
          border: '1px solid var(--pf-blue-100)',
          color: 'var(--pf-blue-900)',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          {result.postcode} -- SIMD decile {result.simdDecile}
        </p>
        {result.councilArea && (
          <p style={{ margin: '4px 0 0', color: 'var(--pf-grey-600)' }}>{result.councilArea}</p>
        )}
      </div>
    )
  }

  if (result.status === 'missing_simd') {
    return (
      <div
        className="rounded-lg"
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--pf-blue-50)',
          border: '1px solid var(--pf-blue-100)',
          color: 'var(--pf-blue-900)',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          {result.postcode} is a valid Scottish postcode
        </p>
        <p style={{ margin: '4px 0 0' }}>
          We don&apos;t have SIMD data for this postcode yet. We&apos;ll save it and
          assess your widening access eligibility from your other circumstances.
        </p>
      </div>
    )
  }

  let title: string
  let body: string
  if (result.status === 'invalid_format') {
    title = "That doesn't look like a UK postcode"
    body = 'Double-check the postcode and try again.'
  } else if (result.status === 'not_scottish') {
    title = 'Not a Scottish postcode'
    body =
      "Pathfinder is built for Scottish students. If you've moved out of Scotland, you can leave the postcode as it is."
  } else if (result.status === 'not_found') {
    title = 'Postcode not found'
    body = "We couldn't find that postcode. Double-check and try again."
  } else {
    title = 'Something went wrong'
    body = result.message
  }

  return (
    <div
      className="rounded-lg"
      style={{
        padding: '12px 16px',
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        color: 'var(--pf-amber-500)',
        fontSize: '0.875rem',
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
      <p style={{ margin: '4px 0 0' }}>{body}</p>
    </div>
  )
}
