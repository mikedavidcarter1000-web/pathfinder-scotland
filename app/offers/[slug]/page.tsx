import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type {
  Offer,
  OfferCategory,
  OfferDetail,
  OfferWithCategory,
  SupportGroup,
} from '@/types/offers'
import { OfferDetailClient } from './offer-detail-client'

const SITE_URL = 'https://pathfinderscot.co.uk'

interface PageProps {
  params: Promise<{ slug: string }>
}

type OfferRow = Offer & {
  category: Pick<OfferCategory, 'id' | 'name' | 'slug' | 'icon'> | null
}

async function fetchOffer(slug: string) {
  const supabase = await createServerSupabaseClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: offer } = await (supabase as any)
    .from('offers')
    .select(
      'id, category_id, title, slug, summary, description, brand, offer_type, discount_text, url, affiliate_url, promo_code, min_age, max_age, eligible_stages, scotland_only, requires_young_scot, requires_totum, requires_unidays, requires_student_beans, verification_method, locations, university_specific, seasonal_tags, active_from, active_until, partner_id, is_featured, featured_until, affiliate_network, commission_type, commission_value, cookie_days, last_verified_at, verified_by, is_active, needs_review, image_url, display_order, created_at, updated_at, category:offer_categories ( id, name, slug, icon )'
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  return (offer as OfferRow | null) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const offer = await fetchOffer(slug)
  if (!offer) return { title: 'Offer not found' }

  const title = `${offer.title}${offer.brand ? ` -- ${offer.brand}` : ''} | Student Offers`
  const description =
    offer.summary ??
    (offer.description ? offer.description.slice(0, 160) : 'Student offer on Pathfinder Scotland.')

  return {
    title,
    description,
    alternates: { canonical: `/offers/${offer.slug}` },
    openGraph: {
      title,
      description,
      url: `/offers/${offer.slug}`,
      type: 'website',
      ...(offer.image_url ? { images: [{ url: offer.image_url }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function OfferDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const offer = await fetchOffer(slug)
  if (!offer) notFound()

  // Support groups, related offers, and logged-in user's saved state
  const [{ data: sgRows }, { data: relatedData }, { data: { user } }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('offer_support_groups')
      .select('support_group')
      .eq('offer_id', offer.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('offers')
      .select(
        'id, category_id, title, slug, summary, description, brand, offer_type, discount_text, url, affiliate_url, promo_code, min_age, max_age, eligible_stages, scotland_only, requires_young_scot, requires_totum, requires_unidays, requires_student_beans, verification_method, locations, university_specific, seasonal_tags, active_from, active_until, partner_id, is_featured, featured_until, affiliate_network, commission_type, commission_value, cookie_days, last_verified_at, verified_by, is_active, needs_review, image_url, display_order, created_at, updated_at, category:offer_categories ( id, name, slug, icon )'
      )
      .eq('category_id', offer.category_id)
      .eq('is_active', true)
      .neq('id', offer.id)
      .order('display_order', { ascending: true })
      .limit(4),
    supabase.auth.getUser(),
  ])

  const supportGroups: SupportGroup[] = ((sgRows ?? []) as { support_group: SupportGroup }[]).map(
    (r) => r.support_group
  )
  const related = ((relatedData ?? []) as OfferRow[]) as OfferWithCategory[]

  // Resolve saved state in a single query
  let savedIds = new Set<string>()
  if (user) {
    const ids = [offer.id, ...related.map((r) => r.id)]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: saved } = await (supabase as any)
      .from('saved_offers')
      .select('offer_id')
      .eq('student_id', user.id)
      .in('offer_id', ids)
    savedIds = new Set(((saved ?? []) as { offer_id: string }[]).map((r) => r.offer_id))
  }

  const detail: OfferDetail = {
    ...offer,
    support_groups: supportGroups,
    is_saved: savedIds.has(offer.id),
  }
  const relatedWithSaved: OfferWithCategory[] = related.map((r) => ({
    ...r,
    is_saved: savedIds.has(r.id),
  }))

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Offers', item: `${SITE_URL}/offers` },
      ...(offer.category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: offer.category.name,
              item: `${SITE_URL}/offers?category=${offer.category.slug}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: offer.category ? 3 : 2,
        name: offer.title,
        item: `${SITE_URL}/offers/${offer.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <OfferDetailClient offer={detail} related={relatedWithSaved} />
    </>
  )
}
