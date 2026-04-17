import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Bursary, AwardType } from '../types'

const SITE_URL = 'https://pathfinderscot.co.uk'

interface PageProps {
  params: Promise<{ slug: string }>
}

const AWARD_LABELS: Record<AwardType, string> = {
  grant: 'Grant',
  bursary: 'Bursary',
  fee_waiver: 'Fee waiver',
  accommodation: 'Accommodation',
  loan: 'Loan',
  discount: 'Discount',
  entitlement: 'Entitlement',
}

const STAGE_LABELS: Record<string, string> = {
  S1: 'S1', S2: 'S2', S3: 'S3', S4: 'S4', S5: 'S5', S6: 'S6',
  FE: 'College / Further Education',
  undergraduate: 'University (Undergraduate)',
  postgraduate: 'Postgraduate',
  nursing: 'Nursing',
  midwifery: 'Midwifery',
  paramedic: 'Paramedic',
  PGDE: 'PGDE (Teaching)',
}

async function fetchBursary(slug: string): Promise<Bursary | null> {
  const supabase = await createServerSupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('bursaries')
    .select(
      'id, slug, name, administering_body, description, student_stages, award_type, amount_description, amount_min, amount_max, is_means_tested, is_repayable, application_process, application_deadline, url, notes, is_active, requires_care_experience, requires_estranged, requires_carer, requires_disability, requires_refugee_or_asylum, requires_young_parent, income_threshold_max, simd_quintile_max, min_age, max_age'
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  return (data as Bursary | null) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const bursary = await fetchBursary(slug)
  if (!bursary) return { title: 'Bursary not found' }

  const title = `${bursary.name} | Bursaries & Funding`
  const description =
    bursary.description?.slice(0, 160) ??
    `${bursary.name} — ${bursary.amount_description ?? 'financial support for Scottish students'}.`

  return {
    title,
    description,
    alternates: { canonical: `/bursaries/${bursary.slug}` },
    openGraph: {
      title: `${bursary.name} | Pathfinder Scotland`,
      description,
      url: `/bursaries/${bursary.slug}`,
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  }
}

function EligibilityItem({
  label,
  required,
}: {
  label: string
  required: boolean | null
}) {
  if (required !== true) return null
  return (
    <li className="flex items-start gap-2" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="#10B981"
        strokeWidth={2}
        viewBox="0 0 24 24"
        style={{ marginTop: '2px' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        <circle cx={12} cy={12} r={10} />
      </svg>
      <span style={{ color: 'var(--pf-grey-900)' }}>{label}</span>
    </li>
  )
}

export default async function BursaryDetailPage({ params }: PageProps) {
  const { slug } = await params
  const bursary = await fetchBursary(slug)
  if (!bursary) notFound()

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Bursaries & Funding', item: `${SITE_URL}/bursaries` },
      { '@type': 'ListItem', position: 3, name: bursary.name, item: `${SITE_URL}/bursaries/${bursary.slug}` },
    ],
  }

  // Schema.org GovernmentService for government-administered bursaries,
  // otherwise a generic WebPage schema
  const isGovernment = bursary.administering_body.toLowerCase().includes('saas') ||
    bursary.administering_body.toLowerCase().includes('social security') ||
    bursary.administering_body.toLowerCase().includes('scottish government') ||
    bursary.administering_body.toLowerCase().includes('council') ||
    bursary.administering_body.toLowerCase().includes('nhs')

  const entitySchema = {
    '@context': 'https://schema.org',
    '@type': isGovernment ? 'GovernmentService' : 'WebPage',
    name: bursary.name,
    description: bursary.description,
    provider: {
      '@type': 'Organization',
      name: bursary.administering_body,
    },
    ...(bursary.url ? { url: bursary.url } : {}),
    ...(isGovernment ? { serviceType: 'Student Financial Support' } : {}),
  }

  const hasEligibilityCriteria =
    bursary.requires_care_experience ||
    bursary.requires_estranged ||
    bursary.requires_carer ||
    bursary.requires_disability ||
    bursary.requires_refugee_or_asylum ||
    bursary.requires_young_parent ||
    bursary.is_means_tested ||
    bursary.min_age != null ||
    bursary.max_age != null ||
    bursary.simd_quintile_max != null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(entitySchema) }}
      />

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
                href="/"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/bursaries"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                Bursaries &amp; Funding
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: 'var(--pf-grey-900)',
                }}
              >
                {bursary.name}
              </span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          paddingTop: '48px',
          paddingBottom: '40px',
        }}
      >
        <div className="pf-container">
          <div style={{ maxWidth: '720px' }}>
            <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '16px' }}>
              <span
                className="pf-badge-blue"
                style={{ fontSize: '0.6875rem', fontWeight: 600 }}
              >
                {AWARD_LABELS[bursary.award_type]}
              </span>
              {bursary.is_repayable ? (
                <span
                  className="pf-badge"
                  style={{
                    fontSize: '0.6875rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: '#B45309',
                  }}
                >
                  Repayable
                </span>
              ) : (
                <span className="pf-badge-green" style={{ fontSize: '0.6875rem' }}>
                  Non-repayable
                </span>
              )}
              {bursary.is_means_tested && (
                <span className="pf-badge-grey" style={{ fontSize: '0.6875rem' }}>
                  Income-assessed
                </span>
              )}
            </div>

            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                color: 'var(--pf-blue-900)',
                lineHeight: 1.15,
                marginBottom: '8px',
              }}
            >
              {bursary.name}
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: 'var(--pf-grey-600)',
                marginBottom: '16px',
              }}
            >
              Administered by {bursary.administering_body}
            </p>

            {bursary.amount_description && (
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: 'var(--pf-blue-700)',
                  lineHeight: 1.2,
                }}
              >
                {bursary.amount_description}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <div className="pf-container">
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            style={{ alignItems: 'start' }}
          >
            {/* Main content */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Description */}
              {bursary.description && (
                <div
                  style={{
                    backgroundColor: 'var(--pf-white)',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    padding: '24px',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--pf-grey-900)',
                      marginBottom: '12px',
                    }}
                  >
                    About this {AWARD_LABELS[bursary.award_type].toLowerCase()}
                  </h2>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--pf-grey-700)',
                      lineHeight: 1.6,
                    }}
                  >
                    {bursary.description}
                  </p>
                </div>
              )}

              {/* Eligibility */}
              {hasEligibilityCriteria && (
                <div
                  style={{
                    backgroundColor: 'var(--pf-white)',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    padding: '24px',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--pf-grey-900)',
                      marginBottom: '16px',
                    }}
                  >
                    Eligibility criteria
                  </h2>
                  <ul
                    className="flex flex-col gap-3"
                    style={{ listStyle: 'none', padding: 0, margin: 0 }}
                  >
                    <EligibilityItem label="Care experienced" required={bursary.requires_care_experience} />
                    <EligibilityItem label="Estranged from family" required={bursary.requires_estranged} />
                    <EligibilityItem label="Carer or young carer" required={bursary.requires_carer} />
                    <EligibilityItem label="Has a disability" required={bursary.requires_disability} />
                    <EligibilityItem label="Refugee or asylum seeker" required={bursary.requires_refugee_or_asylum} />
                    <EligibilityItem label="Young parent / lone parent" required={bursary.requires_young_parent} />
                    {bursary.is_means_tested && (
                      <li className="flex items-start gap-2" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                          style={{ marginTop: '2px' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                          <circle cx={12} cy={12} r={10} />
                        </svg>
                        <span style={{ color: 'var(--pf-grey-900)' }}>
                          Income-assessed
                          {bursary.income_threshold_max
                            ? ` — household income below £${Number(bursary.income_threshold_max).toLocaleString('en-GB')}`
                            : ' — check provider for thresholds'}
                        </span>
                      </li>
                    )}
                    {bursary.simd_quintile_max != null && (
                      <li className="flex items-start gap-2" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                          style={{ marginTop: '2px' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                          <circle cx={12} cy={12} r={10} />
                        </svg>
                        <span style={{ color: 'var(--pf-grey-900)' }}>
                          SIMD quintile {bursary.simd_quintile_max} or below (most deprived {bursary.simd_quintile_max * 20}% of areas)
                        </span>
                      </li>
                    )}
                    {(bursary.min_age != null || bursary.max_age != null) && (
                      <li className="flex items-start gap-2" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                          style={{ marginTop: '2px' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                          <circle cx={12} cy={12} r={10} />
                        </svg>
                        <span style={{ color: 'var(--pf-grey-900)' }}>
                          Age{' '}
                          {bursary.min_age != null && bursary.max_age != null
                            ? `${bursary.min_age}–${bursary.max_age}`
                            : bursary.min_age != null
                              ? `${bursary.min_age}+`
                              : `under ${bursary.max_age}`}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Student stages */}
              {bursary.student_stages.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'var(--pf-white)',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    padding: '24px',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--pf-grey-900)',
                      marginBottom: '12px',
                    }}
                  >
                    Available to
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {bursary.student_stages.map((stage) => (
                      <span
                        key={stage}
                        className="pf-badge-blue"
                        style={{ fontSize: '0.8125rem' }}
                      >
                        {STAGE_LABELS[stage] ?? stage}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Application process */}
              {bursary.application_process && (
                <div
                  style={{
                    backgroundColor: 'var(--pf-white)',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    padding: '24px',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--pf-grey-900)',
                      marginBottom: '12px',
                    }}
                  >
                    How to apply
                  </h2>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--pf-grey-700)',
                      lineHeight: 1.6,
                    }}
                  >
                    {bursary.application_process}
                  </p>
                </div>
              )}

              {/* Notes */}
              {bursary.notes && (
                <div
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.06)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '8px',
                    padding: '20px 24px',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#78350F',
                      marginBottom: '8px',
                    }}
                  >
                    Important notes
                  </h2>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#78350F',
                      lineHeight: 1.6,
                    }}
                  >
                    {bursary.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-6">
              {/* CTA card */}
              <div
                style={{
                  backgroundColor: 'var(--pf-white)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  padding: '24px',
                }}
              >
                {bursary.application_deadline && (
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--pf-grey-700)',
                      marginBottom: '16px',
                    }}
                  >
                    <strong style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>
                      Deadline:
                    </strong>{' '}
                    {bursary.application_deadline}
                  </div>
                )}

                {bursary.amount_description && (
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      color: 'var(--pf-blue-700)',
                      marginBottom: '16px',
                    }}
                  >
                    {bursary.amount_description}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {bursary.url && (
                    <a
                      href={bursary.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pf-btn-primary no-underline hover:no-underline"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                      }}
                    >
                      {bursary.award_type === 'entitlement' ? 'More info' : 'Apply now'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}

                  <Link
                    href="/bursaries"
                    className="pf-btn-secondary no-underline hover:no-underline"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    Back to all bursaries
                  </Link>
                </div>
              </div>

              {/* Quick facts */}
              <div
                style={{
                  backgroundColor: 'var(--pf-white)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  padding: '24px',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--pf-grey-900)',
                    marginBottom: '16px',
                  }}
                >
                  Quick facts
                </h3>
                <dl className="flex flex-col gap-3" style={{ margin: 0 }}>
                  <div>
                    <dt style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pf-grey-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Type
                    </dt>
                    <dd style={{ margin: 0, fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
                      {AWARD_LABELS[bursary.award_type]}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pf-grey-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Repayable
                    </dt>
                    <dd style={{ margin: 0, fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
                      {bursary.is_repayable ? 'Yes' : 'No'}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pf-grey-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Income-assessed
                    </dt>
                    <dd style={{ margin: 0, fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
                      {bursary.is_means_tested ? 'Yes' : 'No'}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pf-grey-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Provider
                    </dt>
                    <dd style={{ margin: 0, fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
                      {bursary.administering_body}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
