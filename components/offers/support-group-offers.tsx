import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  Offer,
  OfferCategory,
  OfferWithCategory,
  SupportGroup,
} from '@/types/offers'
import { OfferCard } from './offer-card'
import { SUPPORT_GROUP_LABELS } from './offer-utils'

interface SupportGroupOffersProps {
  supportGroup: SupportGroup
  // Heading level so the section blends with the host page's heading structure.
  headingLevel?: 2 | 3
  // Optional override for the background shade behind the section.
  background?: 'white' | 'grey' | 'blue'
  // Referrer used to log click attribution (defaults to the support page path).
  referrerPage?: string
}

const MAX_SHOWN = 6

type OfferRow = Offer & {
  category: Pick<OfferCategory, 'id' | 'name' | 'slug' | 'icon'> | null
}

export async function SupportGroupOffers({
  supportGroup,
  headingLevel = 2,
  background = 'grey',
  referrerPage,
}: SupportGroupOffersProps) {
  const supabase = await createServerSupabaseClient()

  // 1. Find offer_ids tagged with this support group.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tagRows, error: tagError } = await (supabase as any)
    .from('offer_support_groups')
    .select('offer_id')
    .eq('support_group', supportGroup)

  if (tagError || !tagRows || tagRows.length === 0) return null

  const offerIds = (tagRows as { offer_id: string }[]).map((r) => r.offer_id)

  // 2. Fetch the matching active offers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: offerRows, error: offerError } = await (supabase as any)
    .from('offers')
    .select(
      'id, category_id, title, slug, summary, description, brand, offer_type, discount_text, url, affiliate_url, promo_code, min_age, max_age, eligible_stages, scotland_only, requires_young_scot, requires_totum, requires_unidays, requires_student_beans, verification_method, locations, university_specific, seasonal_tags, active_from, active_until, partner_id, is_featured, featured_until, affiliate_network, commission_type, commission_value, cookie_days, last_verified_at, verified_by, is_active, needs_review, image_url, display_order, created_at, updated_at, category:offer_categories ( id, name, slug, icon )'
    )
    .in('id', offerIds)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('title', { ascending: true })

  if (offerError) return null
  const allOffers = ((offerRows ?? []) as OfferRow[]).map<OfferWithCategory>((r) => ({
    ...r,
  }))

  if (allOffers.length === 0) return null

  // 3. Hydrate is_saved for the viewer so the heart icons reflect state.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let savedIds = new Set<string>()
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: saved } = await (supabase as any)
      .from('saved_offers')
      .select('offer_id')
      .eq('student_id', user.id)
      .in('offer_id', allOffers.map((o) => o.id))
    savedIds = new Set(((saved ?? []) as { offer_id: string }[]).map((r) => r.offer_id))
  }

  const offersWithSaved = allOffers.map((o) => ({ ...o, is_saved: savedIds.has(o.id) }))
  const shown = offersWithSaved.slice(0, MAX_SHOWN)
  const hasMore = offersWithSaved.length > MAX_SHOWN

  const groupLabel = SUPPORT_GROUP_LABELS[supportGroup]
  const sectionClass =
    background === 'white'
      ? 'pf-section pf-section-white'
      : background === 'blue'
        ? 'pf-section'
        : 'pf-section pf-section-grey'

  const resolvedReferrer = referrerPage ?? `/support/${supportGroup}`

  const Heading = headingLevel === 3 ? 'h3' : 'h2'

  return (
    <section
      className={sectionClass}
      style={background === 'blue' ? { backgroundColor: 'var(--pf-blue-50)' } : undefined}
    >
      <div className="pf-container" style={{ maxWidth: '960px' }}>
        <div className="flex items-start gap-3 flex-wrap" style={{ marginBottom: '16px' }}>
          <div
            className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--pf-blue-100)',
              color: 'var(--pf-blue-700)',
            }}
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12v10H4V12" />
              <path d="M22 7H2v5h20V7Z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <Heading style={{ marginBottom: '4px' }}>Offers &amp; Entitlements</Heading>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.9375rem',
                margin: 0,
              }}
            >
              Discounts, freebies, and money directly relevant to {groupLabel.toLowerCase()}.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              referrerPage={resolvedReferrer}
              returnUrl={resolvedReferrer}
            />
          ))}
        </div>

        {hasMore && (
          <div style={{ marginTop: '20px' }}>
            <Link
              href={`/offers?support_group=${supportGroup}`}
              className="inline-flex items-center gap-1"
              style={{
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                textDecoration: 'none',
              }}
            >
              View all offers for {groupLabel.toLowerCase()}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
