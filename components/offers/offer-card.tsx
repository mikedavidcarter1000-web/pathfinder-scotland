'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { OfferWithCategory, SupportGroup } from '@/types/offers'
import { SaveOfferButton } from './save-offer-button'
import {
  CategoryIcon,
  OFFER_TYPE_BADGE,
  SUPPORT_GROUP_LABELS,
  collapseStages,
} from './offer-utils'

interface OfferCardProps {
  offer: OfferWithCategory
  supportGroups?: SupportGroup[]
  returnUrl?: string
  referrerPage?: string
  onUnsave?: (offerId: string) => void
}

export function OfferCard({
  offer,
  supportGroups,
  returnUrl,
  referrerPage,
  onUnsave,
}: OfferCardProps) {
  const badge = OFFER_TYPE_BADGE[offer.offer_type] ?? OFFER_TYPE_BADGE.general
  const stagePills = collapseStages(offer.eligible_stages)
  const categoryIconName = offer.category?.icon ?? null
  const categoryName = offer.category?.name ?? null
  const shownGroups = (supportGroups ?? []).slice(0, 2)
  const moreGroups = Math.max(0, (supportGroups?.length ?? 0) - shownGroups.length)

  // Fire detail_view click with explicit referrer when clicked from a referring
  // context (e.g. a support-hub page). The detail page fires its own detail_view
  // with its own referrer; the analytics query filters by referrer_page.
  const handleNavClick = () => {
    if (!referrerPage) return
    fetch('/api/offers/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offer_id: offer.id,
        click_type: 'detail_view',
        referrer_page: referrerPage,
      }),
    }).catch(() => {})
  }

  const handleSaveToggle = (next: boolean) => {
    if (!next && onUnsave) onUnsave(offer.id)
  }

  return (
    <article
      className="pf-card flex flex-col h-full"
      style={{ padding: '20px', gap: '12px' }}
    >
      {/* Header: image/icon + save button */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: offer.image_url ? 'var(--pf-white)' : 'var(--pf-blue-50)',
            color: 'var(--pf-blue-700)',
            overflow: 'hidden',
            border: offer.image_url ? '1px solid var(--pf-grey-300)' : 'none',
          }}
        >
          {offer.image_url ? (
            <Image
              src={offer.image_url}
              alt={offer.brand ?? offer.title}
              width={56}
              height={56}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              unoptimized
            />
          ) : (
            <CategoryIcon name={categoryIconName} size={24} strokeWidth={1.8} />
          )}
        </div>

        <SaveOfferButton
          offerId={offer.id}
          initialIsSaved={!!offer.is_saved}
          returnUrl={returnUrl ?? `/offers/${offer.slug}`}
          size="sm"
          onToggle={handleSaveToggle}
        />
      </div>

      {/* Brand / category tag */}
      <div className="flex items-center gap-2 flex-wrap" style={{ minHeight: '16px' }}>
        {offer.brand && (
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.6875rem',
              color: 'var(--pf-grey-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {offer.brand}
          </span>
        )}
        {offer.scotland_only && (
          <span
            className="pf-badge"
            style={{
              backgroundColor: 'rgba(0, 94, 184, 0.1)',
              color: 'var(--pf-blue-700)',
              fontSize: '0.6875rem',
              padding: '2px 8px',
            }}
            aria-label="Scotland only"
            title="Scotland only"
          >
            🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland only
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '1.0625rem',
          lineHeight: 1.3,
          marginBottom: 0,
          color: 'var(--pf-grey-900)',
        }}
      >
        <Link
          href={`/offers/${offer.slug}`}
          className="no-underline hover:no-underline"
          style={{ color: 'inherit' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pf-blue-700)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
          onClick={handleNavClick}
        >
          {offer.title}
        </Link>
      </h3>

      {/* Summary (clamped to 2 lines) */}
      {offer.summary && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--pf-grey-600)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}
        >
          {offer.summary}
        </p>
      )}

      {/* Discount + type badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {offer.discount_text && (
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: badge.bg,
              color: badge.fg,
              borderRadius: '9999px',
              padding: '4px 12px',
              lineHeight: 1.3,
            }}
          >
            {offer.discount_text}
          </span>
        )}
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.6875rem',
            color: 'var(--pf-grey-600)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* Stage pills */}
      {stagePills.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap" aria-label="Eligible stages">
          {stagePills.map((p) => (
            <span
              key={p}
              className="pf-badge"
              style={{
                fontSize: '0.6875rem',
                padding: '2px 8px',
                backgroundColor: 'var(--pf-blue-100)',
                color: 'var(--pf-blue-700)',
              }}
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Support groups (optional) */}
      {shownGroups.length > 0 && (
        <div
          className="flex items-center gap-1.5 flex-wrap"
          style={{ marginTop: '-4px' }}
          aria-label="Relevant for"
        >
          {shownGroups.map((g) => (
            <span
              key={g}
              className="pf-badge-grey"
              style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
            >
              {SUPPORT_GROUP_LABELS[g]}
            </span>
          ))}
          {moreGroups > 0 && (
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--pf-grey-600)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              +{moreGroups} more
            </span>
          )}
        </div>
      )}

      {/* CTA — aligns to bottom of flex column */}
      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        <Link
          href={`/offers/${offer.slug}`}
          className="no-underline hover:no-underline"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--pf-blue-700)',
          }}
          onClick={handleNavClick}
        >
          View offer
          <span aria-hidden="true">→</span>
        </Link>
        {categoryName && (
          <div
            style={{
              fontSize: '0.6875rem',
              color: 'var(--pf-grey-600)',
              marginTop: '4px',
            }}
          >
            {categoryName}
          </div>
        )}
      </div>
    </article>
  )
}

export function OfferCardSkeleton() {
  return (
    <div
      className="pf-card flex flex-col h-full"
      style={{ padding: '20px', gap: '12px' }}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="rounded-lg pf-skeleton"
          style={{ width: '56px', height: '56px' }}
        />
        <div
          className="rounded-full pf-skeleton"
          style={{ width: '32px', height: '32px' }}
        />
      </div>
      <div className="pf-skeleton" style={{ height: '14px', width: '40%' }} />
      <div className="pf-skeleton" style={{ height: '20px', width: '75%' }} />
      <div className="pf-skeleton" style={{ height: '14px', width: '95%' }} />
      <div className="pf-skeleton" style={{ height: '14px', width: '85%' }} />
      <div className="pf-skeleton" style={{ height: '24px', width: '50%' }} />
      <div className="flex gap-1.5 flex-wrap">
        <div className="pf-skeleton" style={{ height: '16px', width: '40px' }} />
        <div className="pf-skeleton" style={{ height: '16px', width: '48px' }} />
      </div>
    </div>
  )
}
