'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { OfferDetail, OfferWithCategory } from '@/types/offers'
import { OfferCard } from '@/components/offers/offer-card'
import { SaveOfferButton } from '@/components/offers/save-offer-button'
import {
  CategoryIcon,
  OFFER_TYPE_BADGE,
  SUPPORT_GROUP_LABELS,
  SUPPORT_GROUP_ROUTES,
  collapseStages,
} from '@/components/offers/offer-utils'

interface OfferDetailClientProps {
  offer: OfferDetail
  related: OfferWithCategory[]
}

// Session-level dedup for detail_view logging so we don't inflate the metric
// if the user navigates back/forward or refreshes.
const SESSION_VIEW_KEY = 'pf_offer_viewed_ids'

function getViewedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(SESSION_VIEW_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? new Set(arr as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function markViewed(id: string) {
  if (typeof window === 'undefined') return
  try {
    const set = getViewedSet()
    set.add(id)
    sessionStorage.setItem(SESSION_VIEW_KEY, JSON.stringify([...set]))
  } catch {
    /* session storage unavailable */
  }
}

export function OfferDetailClient({ offer, related }: OfferDetailClientProps) {
  const [ctaLoading, setCtaLoading] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const detailViewFiredRef = useRef(false)

  // Fire detail_view click exactly once per session per offer.
  useEffect(() => {
    if (detailViewFiredRef.current) return
    detailViewFiredRef.current = true
    const viewed = getViewedSet()
    if (viewed.has(offer.id)) return
    markViewed(offer.id)
    fetch('/api/offers/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offer_id: offer.id,
        click_type: 'detail_view',
        referrer_page: window.location.pathname,
      }),
    }).catch(() => {})
  }, [offer.id])

  const badge = OFFER_TYPE_BADGE[offer.offer_type] ?? OFFER_TYPE_BADGE.general
  const stagePills = collapseStages(offer.eligible_stages)
  const categoryIconName = offer.category?.icon ?? null

  const accessHints = buildAccessHints(offer)
  const eligibilityBits = buildEligibilityBits(offer)

  const lastVerified = offer.last_verified_at
    ? new Date(offer.last_verified_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const handleCta = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (ctaLoading) return
    setCtaLoading(true)
    let target = offer.affiliate_url || offer.url || '#'
    try {
      const res = await fetch('/api/offers/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offer.id,
          click_type: 'outbound',
          referrer_page: window.location.pathname,
        }),
      })
      if (res.ok) {
        const body = (await res.json()) as { url?: string }
        if (body.url) target = body.url
      }
    } catch {
      /* fall back to local URL */
    } finally {
      window.open(target, '_blank', 'noopener,noreferrer')
      setCtaLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (!offer.promo_code) return
    try {
      await navigator.clipboard.writeText(offer.promo_code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
      fetch('/api/offers/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offer.id,
          click_type: 'copy_code',
          referrer_page: window.location.pathname,
        }),
      }).catch(() => {})
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-300)',
          padding: '16px 0',
        }}
      >
        <div className="pf-container">
          <ol
            className="flex flex-wrap items-center gap-2"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            <li>
              <Link
                href="/offers"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                Offers
              </Link>
            </li>
            {offer.category && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/offers?category=${offer.category.slug}`}
                    style={{
                      color: 'var(--pf-blue-700)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {offer.category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li
              style={{
                color: 'var(--pf-grey-900)',
                maxWidth: '420px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              aria-current="page"
            >
              {offer.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Header */}
      <header
        style={{
          backgroundColor: 'var(--pf-white)',
          paddingTop: '40px',
          paddingBottom: '32px',
          borderBottom: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="pf-container">
          <div className="flex items-start gap-4 flex-wrap">
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{
                width: '80px',
                height: '80px',
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
                  width={80}
                  height={80}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                  unoptimized
                />
              ) : (
                <CategoryIcon name={categoryIconName} size={36} strokeWidth={1.6} />
              )}
            </div>

            <div className="flex-1" style={{ minWidth: '260px' }}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {offer.brand && (
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.8125rem',
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
                    }}
                  >
                    🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland only
                  </span>
                )}
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.625rem, 4vw, 2.125rem)',
                  lineHeight: 1.2,
                  marginBottom: '12px',
                  color: 'var(--pf-grey-900)',
                }}
              >
                {offer.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {offer.discount_text && (
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      backgroundColor: badge.bg,
                      color: badge.fg,
                      borderRadius: '9999px',
                      padding: '6px 14px',
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
                    fontSize: '0.75rem',
                    color: 'var(--pf-grey-600)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {badge.label}
                </span>
                {stagePills.map((p) => (
                  <span
                    key={p}
                    className="pf-badge"
                    style={{
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--pf-blue-100)',
                      color: 'var(--pf-blue-700)',
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <SaveOfferButton
              offerId={offer.id}
              initialIsSaved={!!offer.is_saved}
              returnUrl={`/offers/${offer.slug}`}
              size="md"
            />
          </div>
        </div>
      </header>

      {/* Body */}
      <section style={{ padding: '40px 0' }}>
        <div className="pf-container">
          <div
            className="grid gap-8"
            style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
          >
            <div
              className="lg:grid lg:gap-8"
              style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px' }}
            >
              {/* Main column */}
              <div className="flex flex-col gap-6">
                {offer.description && (
                  <div className="pf-card" style={{ padding: '28px' }}>
                    <h2
                      style={{
                        fontSize: '1.125rem',
                        marginBottom: '10px',
                        color: 'var(--pf-grey-900)',
                      }}
                    >
                      About this offer
                    </h2>
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        lineHeight: 1.7,
                        color: 'var(--pf-grey-900)',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {offer.description}
                    </p>
                  </div>
                )}

                {/* How to access */}
                {accessHints.length > 0 && (
                  <div className="pf-card" style={{ padding: '28px' }}>
                    <h2
                      style={{
                        fontSize: '1.125rem',
                        marginBottom: '12px',
                        color: 'var(--pf-grey-900)',
                      }}
                    >
                      How to access
                    </h2>
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {accessHints.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2"
                          style={{
                            fontSize: '0.9375rem',
                            color: 'var(--pf-grey-900)',
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              color: 'var(--pf-blue-700)',
                              fontWeight: 700,
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            ✓
                          </span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    {offer.promo_code && (
                      <div
                        style={{
                          marginTop: '20px',
                          padding: '16px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--pf-blue-50)',
                          border: '1px dashed var(--pf-blue-500)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 600,
                            color: 'var(--pf-grey-600)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '6px',
                          }}
                        >
                          Promo code
                        </div>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <code
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                              fontSize: '1.125rem',
                              color: 'var(--pf-blue-700)',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {offer.promo_code}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="pf-btn-secondary pf-btn-sm"
                          >
                            {codeCopied ? 'Copied ✓' : 'Copy code'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Eligibility */}
                {eligibilityBits.length > 0 && (
                  <div className="pf-card" style={{ padding: '28px' }}>
                    <h2
                      style={{
                        fontSize: '1.125rem',
                        marginBottom: '12px',
                        color: 'var(--pf-grey-900)',
                      }}
                    >
                      Who can access this
                    </h2>
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {eligibilityBits.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2"
                          style={{
                            fontSize: '0.9375rem',
                            color: 'var(--pf-grey-900)',
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              color: 'var(--pf-blue-700)',
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            •
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Support groups */}
                {offer.support_groups.length > 0 && (
                  <div
                    className="pf-card"
                    style={{
                      padding: '24px 28px',
                      borderLeft: '4px solid var(--pf-blue-700)',
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '1rem',
                        marginBottom: '8px',
                        color: 'var(--pf-grey-900)',
                      }}
                    >
                      This offer is particularly relevant for:
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {offer.support_groups.map((g) => {
                        const route = SUPPORT_GROUP_ROUTES[g]
                        const label = SUPPORT_GROUP_LABELS[g]
                        return route ? (
                          <Link
                            key={g}
                            href={route}
                            className="pf-badge-blue"
                            style={{
                              fontSize: '0.8125rem',
                              textDecoration: 'none',
                            }}
                          >
                            {label} →
                          </Link>
                        ) : (
                          <span
                            key={g}
                            className="pf-badge-grey"
                            style={{ fontSize: '0.8125rem' }}
                          >
                            {label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Verification footer */}
                {(lastVerified || offer.needs_review) && (
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--pf-grey-600)',
                      padding: '0 4px',
                    }}
                  >
                    {offer.needs_review && (
                      <span style={{ color: '#B45309', marginRight: '8px' }}>
                        ⚠ This offer was last verified over 6 months ago — details may have
                        changed.
                      </span>
                    )}
                    {lastVerified && (
                      <span>
                        Last checked: <strong>{lastVerified}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar: sticky CTA */}
              <aside className="mt-6 lg:mt-0">
                <div
                  className="pf-card"
                  style={{
                    padding: '24px',
                    position: 'sticky',
                    top: '88px',
                  }}
                >
                  {offer.discount_text && (
                    <div
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        color: badge.fg,
                        marginBottom: '4px',
                        lineHeight: 1.2,
                      }}
                    >
                      {offer.discount_text}
                    </div>
                  )}
                  {offer.summary && (
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--pf-grey-600)',
                        marginBottom: '16px',
                        lineHeight: 1.5,
                      }}
                    >
                      {offer.summary}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleCta}
                    className="pf-btn-primary"
                    style={{ width: '100%', marginBottom: '10px' }}
                    disabled={ctaLoading}
                  >
                    {ctaLoading ? 'Opening…' : offer.brand ? `Visit ${offer.brand}` : 'Find out more'}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </button>
                  <div className="flex items-center justify-center">
                    <SaveOfferButton
                      offerId={offer.id}
                      initialIsSaved={!!offer.is_saved}
                      returnUrl={`/offers/${offer.slug}`}
                      size="md"
                    />
                  </div>
                  {offer.affiliate_url && (
                    <p
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--pf-grey-600)',
                        marginTop: '12px',
                        textAlign: 'center',
                      }}
                    >
                      Pathfinder may earn a small commission at no cost to you.
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Related offers */}
      {related.length > 0 && (
        <section style={{ padding: '40px 0', backgroundColor: 'var(--pf-white)' }}>
          <div className="pf-container">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Related offers</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {related.map((r) => (
                <OfferCard key={r.id} offer={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function buildAccessHints(offer: OfferDetail): string[] {
  const hints: string[] = []
  if (offer.requires_young_scot) hints.push("You'll need a Young Scot NEC card.")
  if (offer.requires_unidays) hints.push('Verify through UNiDAYS.')
  if (offer.requires_student_beans) hints.push('Verify through Student Beans.')
  if (offer.requires_totum) hints.push('Verify through TOTUM.')
  if (offer.verification_method === 'institution_email') {
    hints.push('Use your school or university email to verify.')
  } else if (offer.verification_method === 'school_id') {
    hints.push('Show your student ID to access.')
  } else if (offer.verification_method === 'none') {
    hints.push('No verification needed — available to everyone eligible.')
  } else if (offer.verification_method === 'young_scot' && !offer.requires_young_scot) {
    hints.push('Access via your Young Scot NEC.')
  }
  return hints
}

function buildEligibilityBits(offer: OfferDetail): string[] {
  const bits: string[] = []
  const pills = collapseStages(offer.eligible_stages)
  if (pills.length > 0) bits.push(`Stages: ${pills.join(', ')}`)

  if (offer.min_age != null && offer.max_age != null) {
    bits.push(`Ages ${offer.min_age}-${offer.max_age}`)
  } else if (offer.min_age != null) {
    bits.push(`Ages ${offer.min_age}+`)
  } else if (offer.max_age != null) {
    bits.push(`Up to age ${offer.max_age}`)
  }

  if (offer.scotland_only) bits.push('Scotland residents only')
  if (offer.locations && offer.locations.length > 0) {
    bits.push(`Locations: ${offer.locations.join(', ')}`)
  }
  return bits
}
