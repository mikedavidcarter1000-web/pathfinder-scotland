'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { OfferWithCategory } from '@/types/offers'
import { OfferCard } from '@/components/offers/offer-card'

interface SavedOffersClientProps {
  initialOffers: OfferWithCategory[]
}

export function SavedOffersClient({ initialOffers }: SavedOffersClientProps) {
  const [offers, setOffers] = useState<OfferWithCategory[]>(initialOffers)

  const handleUnsave = (offerId: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId))
  }

  // Group by category (preserving the original order for a stable layout).
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { name: string; slug: string | null; items: OfferWithCategory[] }
    >()
    for (const o of offers) {
      const key = o.category?.slug ?? 'uncategorised'
      const name = o.category?.name ?? 'Other'
      if (!map.has(key)) {
        map.set(key, { name, slug: o.category?.slug ?? null, items: [] })
      }
      map.get(key)!.items.push(o)
    }
    return Array.from(map.values())
  }, [offers])

  return (
    <div>
      {/* Header */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          paddingTop: '40px',
          paddingBottom: '32px',
        }}
      >
        <div className="pf-container">
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}
          >
            <Link href="/offers" style={{ color: 'var(--pf-grey-600)' }}>
              Offers
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>Saved</span>
          </nav>
          <h1 style={{ marginBottom: '8px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Saved Offers
          </h1>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '1rem',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '620px',
            }}
          >
            {offers.length > 0
              ? `${offers.length} saved offer${offers.length === 1 ? '' : 's'}, grouped by category.`
              : 'Bookmarks live here when you save an offer from the main list.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '32px 0 56px' }}>
        <div className="pf-container">
          {offers.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {grouped.map((group) => (
                <div key={group.slug ?? 'uncategorised'}>
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      marginBottom: '16px',
                      color: 'var(--pf-grey-900)',
                    }}
                  >
                    {group.name}
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 500,
                        fontSize: '0.8125rem',
                        color: 'var(--pf-grey-600)',
                        marginLeft: '8px',
                      }}
                    >
                      {group.items.length}
                    </span>
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.items.map((o) => (
                      <OfferCard
                        key={o.id}
                        offer={o}
                        returnUrl="/offers/saved"
                        onUnsave={handleUnsave}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="pf-card text-center"
      style={{
        maxWidth: '480px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--pf-blue-50)',
          color: 'var(--pf-blue-700)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden="true"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </div>
      <h2 style={{ fontSize: '1.125rem', marginBottom: '6px' }}>
        You haven&apos;t saved any offers yet
      </h2>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          marginBottom: '20px',
        }}
      >
        Browse student offers and tap the heart on any card to save it for later.
      </p>
      <Link
        href="/offers"
        className="pf-btn-primary no-underline hover:no-underline"
        style={{ display: 'inline-block' }}
      >
        Browse all offers
      </Link>
    </div>
  )
}
