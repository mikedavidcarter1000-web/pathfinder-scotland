'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useOfferForCourse,
  useUpsertOffer,
  useDeleteOffer,
  OFFER_STATUS_LABELS,
  OFFER_STATUS_COLOURS,
  type OfferStatus,
} from '@/hooks/use-offers'
import { useToast } from '@/components/ui/toast'

interface OfferTrackerProps {
  courseId: string
  universityId: string
  courseName: string
  universityName: string
}

export function OfferTracker({ courseId, universityId, courseName, universityName }: OfferTrackerProps) {
  const { data: offer, isLoading } = useOfferForCourse(courseId)
  const upsertOffer = useUpsertOffer()
  const deleteOffer = useDeleteOffer()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<OfferStatus>('considering')
  const [offerGrades, setOfferGrades] = useState('')
  const [isFirm, setIsFirm] = useState(false)
  const [isInsurance, setIsInsurance] = useState(false)

  if (isLoading) {
    return (
      <div className="pf-card">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 rounded" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
          <div className="h-11 rounded-lg" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
        </div>
      </div>
    )
  }

  // Already tracked — show status card
  if (offer && !showForm) {
    const offerStatus = offer.status as OfferStatus
    const colours = OFFER_STATUS_COLOURS[offerStatus]
    return (
      <div className="pf-card">
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--pf-grey-900)',
            marginBottom: '12px',
          }}
        >
          Application Tracking
        </h3>

        {/* Current status badge */}
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 mb-3"
          style={{
            display: 'inline-flex',
            backgroundColor: colours.bg,
            color: colours.text,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          {offerStatus === 'accepted' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {OFFER_STATUS_LABELS[offerStatus]}
        </div>

        {/* Offer grades if conditional */}
        {offer.offer_grades && (
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
            Offer grades: <strong style={{ color: 'var(--pf-grey-900)' }}>{offer.offer_grades}</strong>
          </p>
        )}

        {/* Firm/insurance indicators */}
        {(offer.is_firm || offer.is_insurance) && (
          <div className="flex gap-2 mb-3">
            {offer.is_firm && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--pf-blue-100)', color: 'var(--pf-blue-700)' }}
              >
                Firm choice
              </span>
            )}
            {offer.is_insurance && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--pf-grey-100)', color: 'var(--pf-grey-600)' }}
              >
                Insurance
              </span>
            )}
          </div>
        )}

        {/* Accepted offer → link to prep hub */}
        {offerStatus === 'accepted' && (
          <Link
            href="/prep"
            className="flex items-center gap-2 no-underline hover:no-underline rounded-lg transition-colors"
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '12px',
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--pf-green-500)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.875rem', color: 'var(--pf-green-500)' }}>
                Your Prep Hub is ready
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                Start getting ready for {universityName}
              </p>
            </div>
            <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--pf-green-500)' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatus(offerStatus)
              setOfferGrades(offer.offer_grades ?? '')
              setIsFirm(offer.is_firm ?? false)
              setIsInsurance(offer.is_insurance ?? false)
              setShowForm(true)
            }}
            className="pf-btn-secondary flex-1 justify-center"
            style={{ minHeight: '40px', fontSize: '0.875rem' }}
          >
            Update
          </button>
          <button
            onClick={async () => {
              await deleteOffer.mutateAsync(offer.id)
              toast.info('Offer removed', `${courseName} removed from your applications`)
            }}
            disabled={deleteOffer.isPending}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              minWidth: '40px',
              minHeight: '40px',
              color: 'var(--pf-grey-600)',
              backgroundColor: 'var(--pf-grey-100)',
            }}
            aria-label="Remove from applications"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Form for creating/updating
  if (showForm || !offer) {
    return (
      <div className="pf-card">
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--pf-grey-900)',
            marginBottom: '16px',
          }}
        >
          {offer ? 'Update Application' : 'Track this course'}
        </h3>

        <div className="space-y-4">
          {/* Status dropdown */}
          <div>
            <label className="pf-label" htmlFor="offer-status">Status</label>
            <select
              id="offer-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OfferStatus)}
              className="pf-input w-full"
              style={{ marginTop: '4px' }}
            >
              {(Object.entries(OFFER_STATUS_LABELS) as [OfferStatus, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Offer grades if conditional */}
          {status === 'conditional' && (
            <div>
              <label className="pf-label" htmlFor="offer-grades">Offer grades</label>
              <input
                id="offer-grades"
                type="text"
                value={offerGrades}
                onChange={(e) => setOfferGrades(e.target.value.toUpperCase())}
                placeholder="e.g. AABB"
                className="pf-input w-full"
                style={{ marginTop: '4px' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
                Enter the grades required for your conditional offer
              </p>
            </div>
          )}

          {/* Firm/Insurance toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFirm}
                onChange={(e) => {
                  setIsFirm(e.target.checked)
                  if (e.target.checked) setIsInsurance(false)
                }}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--pf-blue-700)' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>Firm choice</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInsurance}
                onChange={(e) => {
                  setIsInsurance(e.target.checked)
                  if (e.target.checked) setIsFirm(false)
                }}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--pf-blue-700)' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>Insurance</span>
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  await upsertOffer.mutateAsync({
                    course_id: courseId,
                    university_id: universityId,
                    status,
                    offer_grades: status === 'conditional' ? offerGrades || null : null,
                    is_firm: isFirm,
                    is_insurance: isInsurance,
                  })
                  setShowForm(false)
                  if (status === 'accepted') {
                    toast.success('Offer accepted!', 'Your Prep Hub is ready — get started preparing for university')
                  } else {
                    toast.success('Application tracked', `${courseName} saved to your applications`)
                  }
                } catch {
                  toast.error('Failed to save', 'Please try again')
                }
              }}
              disabled={upsertOffer.isPending}
              className="pf-btn-primary flex-1 justify-center"
              style={{ minHeight: '44px' }}
            >
              {upsertOffer.isPending ? 'Saving...' : offer ? 'Update' : 'Track'}
            </button>
            {(offer || showForm) && (
              <button
                onClick={() => {
                  setShowForm(false)
                  if (!offer) {
                    setStatus('considering')
                    setOfferGrades('')
                    setIsFirm(false)
                    setIsInsurance(false)
                  }
                }}
                className="pf-btn-secondary"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
