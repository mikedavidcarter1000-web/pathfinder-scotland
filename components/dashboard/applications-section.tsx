'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useStudentOffers,
  useUpdateOfferStatus,
  OFFER_STATUS_LABELS,
  OFFER_STATUS_COLOURS,
  type OfferStatus,
} from '@/hooks/use-offers'
import { useToast } from '@/components/ui/toast'
import type { Tables } from '@/types/database'

type OfferWithDetails = Tables<'student_offers'> & {
  course: Tables<'courses'> & { university: Tables<'universities'> }
}

const STATUS_ORDER: OfferStatus[] = ['accepted', 'unconditional', 'conditional', 'applied', 'considering', 'declined', 'rejected']

export function ApplicationsSection() {
  const { data: offers, isLoading } = useStudentOffers()

  if (isLoading) {
    return (
      <div className="pf-card">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 rounded" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
          <div className="h-20 rounded-lg" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
          <div className="h-20 rounded-lg" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
        </div>
      </div>
    )
  }

  if (!offers || offers.length === 0) return null

  // Group by status, ordered by priority
  const grouped = STATUS_ORDER
    .map((status) => ({
      status,
      offers: offers.filter((o) => o.status === status),
    }))
    .filter((g) => g.offers.length > 0)

  return (
    <div className="pf-card">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: '1.125rem', marginBottom: 0 }}>My Applications</h2>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
          }}
        >
          {offers.length} course{offers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {grouped.map(({ status, offers: groupOffers }) => (
          <div key={status}>
            {/* Group header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: OFFER_STATUS_COLOURS[status].bg,
                  color: OFFER_STATUS_COLOURS[status].text,
                }}
              >
                {OFFER_STATUS_LABELS[status]}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                {groupOffers.length}
              </span>
            </div>

            {/* Offer cards */}
            <div className="space-y-2">
              {groupOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer as OfferWithDetails} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OfferCard({ offer }: { offer: OfferWithDetails }) {
  const updateStatus = useUpdateOfferStatus()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [newStatus, setNewStatus] = useState(offer.status as OfferStatus)

  const course = offer.course
  const university = course?.university
  const colours = OFFER_STATUS_COLOURS[offer.status as OfferStatus]

  return (
    <div
      className="rounded-lg"
      style={{
        padding: '14px 16px',
        backgroundColor: 'var(--pf-grey-100)',
        border: '1px solid transparent',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/courses/${offer.course_id}`}
            className="no-underline hover:underline"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-900)',
              display: 'block',
            }}
          >
            {course?.name ?? 'Unknown course'}
          </Link>
          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '2px' }}>
            {university?.name ?? 'Unknown university'}
            {university?.city ? ` \u2022 ${university.city}` : ''}
          </p>

          {/* Offer details */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {offer.offer_grades && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                Offer: <strong style={{ color: 'var(--pf-grey-900)' }}>{offer.offer_grades}</strong>
              </span>
            )}
            {offer.is_firm && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--pf-blue-100)', color: 'var(--pf-blue-700)' }}
              >
                Firm
              </span>
            )}
            {offer.is_insurance && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--pf-grey-100)', color: 'var(--pf-grey-600)', border: '1px solid var(--pf-grey-300)' }}
              >
                Insurance
              </span>
            )}
          </div>
        </div>

        {/* Status update dropdown */}
        {isEditing ? (
          <div className="flex items-center gap-1">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OfferStatus)}
              className="pf-input text-sm"
              style={{ padding: '6px 8px', fontSize: '0.8125rem' }}
            >
              {(Object.entries(OFFER_STATUS_LABELS) as [OfferStatus, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              onClick={async () => {
                try {
                  await updateStatus.mutateAsync({ offerId: offer.id, status: newStatus })
                  setIsEditing(false)
                  if (newStatus === 'accepted') {
                    toast.success('Offer accepted!', 'Your Prep Hub is ready')
                  } else {
                    toast.success('Status updated')
                  }
                } catch {
                  toast.error('Failed to update')
                }
              }}
              disabled={updateStatus.isPending}
              className="p-1.5 rounded"
              style={{ color: 'var(--pf-green-500)' }}
              aria-label="Save status"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={() => { setIsEditing(false); setNewStatus(offer.status as OfferStatus) }}
              className="p-1.5 rounded"
              style={{ color: 'var(--pf-grey-600)' }}
              aria-label="Cancel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 rounded-lg transition-colors"
            style={{
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              backgroundColor: colours.bg,
              color: colours.text,
            }}
          >
            {OFFER_STATUS_LABELS[offer.status as OfferStatus]}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
