'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { useCollege, useCollegeArticulation, type ArticulationWithUniversity } from '@/hooks/use-colleges'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'
import type { Tables, Json } from '@/types/database'

type College = Tables<'colleges'>

type Campus = {
  name: string
  address?: string
  postcode?: string
}

export default function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: college, isLoading, error, refetch } = useCollege(id)
  const { data: articulation, isLoading: articulationLoading } = useCollegeArticulation(id)

  useAuthErrorRedirect([error])

  const routesByUniversity = useMemo(() => {
    if (!articulation || articulation.length === 0) return []
    const groups: Record<string, { university_id: string; university_name: string; routes: ArticulationWithUniversity[] }> = {}
    for (const r of articulation) {
      if (!groups[r.university_id]) {
        groups[r.university_id] = {
          university_id: r.university_id,
          university_name: r.university_name,
          routes: [],
        }
      }
      groups[r.university_id].routes.push(r)
    }
    return Object.values(groups).sort((a, b) => a.university_name.localeCompare(b.university_name))
  }, [articulation])

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div style={{ backgroundColor: 'var(--pf-white)' }}>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Skeleton width="140px" height={14} rounded="sm" />
            <div style={{ height: '16px' }} />
            <Skeleton width="60%" height={32} rounded="md" />
            <div style={{ height: '8px' }} />
            <Skeleton width="40%" height={18} rounded="sm" />
            <div style={{ height: '16px' }} />
            <div className="flex gap-2">
              <Skeleton width={80} height={22} rounded="full" />
              <Skeleton width={100} height={22} rounded="full" />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <SlowLoadingNotice isLoading={isLoading} />
        </div>
      </div>
    )
  }

  if (error || !college) {
    const classified = error ? classifyError(error) : null
    const isNotFound = !error || classified?.kind === 'not-found'
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)', padding: '48px 16px' }}>
        <div className="max-w-4xl mx-auto px-4">
          <ErrorState
            title={isNotFound ? 'College not found' : classified?.title ?? 'Something went wrong'}
            message={
              isNotFound
                ? "The college you're looking for doesn't exist or has been removed."
                : classified?.message ?? 'Please try again in a moment.'
            }
            retryAction={isNotFound ? undefined : () => refetch()}
            backLink={{ href: '/colleges', label: 'Browse all colleges' }}
          />
        </div>
      </div>
    )
  }

  const campuses = parseCampuses(college.campuses)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--pf-grey-600)' }}>
            <Link href="/colleges" style={{ color: 'var(--pf-blue-700)' }}>Colleges</Link>
            <span>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>{college.name}</span>
          </nav>

          <h1 style={{ marginBottom: '8px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
            {college.name}
          </h1>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span
              className="inline-flex items-center gap-1"
              style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {college.city}, {college.region}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {college.has_swap && (
              <span className="pf-badge-amber">
                {college.swap_hub ? `SWAP ${college.swap_hub}` : 'SWAP'}
              </span>
            )}
            {college.uhi_partner && (
              <span className="pf-badge-blue">UHI Partner</span>
            )}
            {college.schools_programme && (
              <span className="pf-badge-green">Schools Programme</span>
            )}
            {college.has_foundation_apprenticeships && (
              <span className="pf-badge-blue">Foundation Apprenticeships</span>
            )}
            {college.has_modern_apprenticeships && (
              <span className="pf-badge-blue">Modern Apprenticeships</span>
            )}
          </div>

          {/* Website link */}
          {college.website_url && (
            <a
              href={college.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
              style={{
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
              }}
            >
              Visit college website
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Section 1 — About */}
        {(college.description || college.distinctive_features || college.student_count || college.qualification_levels) && (
          <section className="pf-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>About</h2>
            {college.description && (
              <p style={{ color: 'var(--pf-grey-600)', lineHeight: 1.6, marginBottom: '12px' }}>
                {college.description}
              </p>
            )}
            {college.distinctive_features && (
              <p style={{ color: 'var(--pf-grey-600)', lineHeight: 1.6, marginBottom: '12px' }}>
                {college.distinctive_features}
              </p>
            )}
            <div className="flex flex-wrap gap-x-8 gap-y-3" style={{ marginTop: '16px' }}>
              {college.student_count && (
                <div>
                  <dt style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>Students</dt>
                  <dd style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '1.125rem' }}>
                    {college.student_count.toLocaleString()}
                  </dd>
                </div>
              )}
              {college.qualification_levels && college.qualification_levels.length > 0 && (
                <div>
                  <dt style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '4px' }}>Qualification levels</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {college.qualification_levels.map((level) => (
                      <span key={level} className="pf-badge-blue">{level}</span>
                    ))}
                  </dd>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 2 — Campuses */}
        {campuses.length > 0 && (
          <section className="pf-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
              Campuses ({campuses.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {campuses.map((campus, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--pf-grey-100)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      color: 'var(--pf-grey-900)',
                      marginBottom: campus.address || campus.postcode ? '4px' : 0,
                    }}
                  >
                    {campus.name}
                  </p>
                  {(campus.address || campus.postcode) && (
                    <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.8125rem' }}>
                      {campus.address}
                      {campus.address && campus.postcode ? ', ' : ''}
                      {campus.postcode}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3 — Course Areas */}
        {college.course_areas && college.course_areas.length > 0 && (
          <section className="pf-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
              Course Areas ({college.course_areas.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {college.course_areas.map((area) => (
                <span
                  key={area}
                  className="pf-badge-blue"
                  style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
                >
                  {area}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Section 4 — Routes to University (key section) */}
        <section className="pf-card" style={{ padding: '24px' }}>
          <div className="flex items-center gap-3 mb-2">
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Routes to University</h2>
            <span className="pf-badge-blue">
              {articulation?.length || 0} routes
            </span>
          </div>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Start at college and transfer into university with advanced standing
          </p>

          {articulationLoading && (
            <div className="space-y-4">
              <Skeleton variant="card" />
              <Skeleton variant="card" />
            </div>
          )}

          {!articulationLoading && routesByUniversity.length === 0 && (
            <div
              style={{
                padding: '24px',
                borderRadius: '8px',
                backgroundColor: 'var(--pf-grey-100)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                This college has routes to multiple universities. Check the{' '}
                <a
                  href={college.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-500)' }}
                >
                  college website
                </a>{' '}
                for current articulation agreements.
              </p>
            </div>
          )}

          {!articulationLoading && routesByUniversity.length > 0 && (
            <div className="space-y-6">
              {routesByUniversity.map((group) => (
                <div key={group.university_id}>
                  <h3 style={{ fontSize: '1.0625rem', marginBottom: '12px' }}>
                    <Link
                      href={`/universities/${group.university_id}`}
                      style={{ color: 'var(--pf-blue-700)' }}
                    >
                      {group.university_name}
                    </Link>
                  </h3>
                  <div className="overflow-x-auto -mx-2 px-2">
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.875rem',
                        minWidth: '500px',
                      }}
                    >
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--pf-grey-300)' }}>
                          <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--pf-grey-600)', fontWeight: 600, fontSize: '0.8125rem' }}>
                            College Qualification
                          </th>
                          <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--pf-grey-600)', fontWeight: 600, fontSize: '0.8125rem' }}>
                            University Degree
                          </th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--pf-grey-600)', fontWeight: 600, fontSize: '0.8125rem' }}>
                            Entry Year
                          </th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--pf-grey-600)', fontWeight: 600, fontSize: '0.8125rem' }}>
                            WP Route?
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.routes.map((route) => (
                          <tr
                            key={route.id}
                            style={{
                              borderBottom: '1px solid var(--pf-grey-100)',
                            }}
                          >
                            <td style={{ padding: '10px 12px', color: 'var(--pf-grey-900)' }}>
                              {route.college_qualification}
                              {route.graded_unit_requirement && (
                                <span
                                  style={{ display: 'block', fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '2px' }}
                                >
                                  Graded unit: {route.graded_unit_requirement}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px', color: 'var(--pf-grey-900)' }}>
                              {route.university_degree}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontWeight: 600,
                                }}
                              >
                                Year {route.entry_year}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              {route.is_widening_participation ? (
                                <span
                                  className="pf-badge-amber"
                                  title={route.wp_eligibility || 'Widening participation route'}
                                >
                                  WP
                                </span>
                              ) : (
                                <span style={{ color: 'var(--pf-grey-300)' }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* WP explanation if any WP routes in this group */}
                  {group.routes.some((r) => r.is_widening_participation) && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--pf-grey-600)',
                        marginTop: '8px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      }}
                    >
                      <strong style={{ color: '#B45309' }}>WP</strong> = Widening
                      Participation — typically requires SIMD deciles 1-4 or other
                      widening access criteria
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 5 — Apprenticeships */}
        {(college.fa_frameworks?.length || college.ma_frameworks?.length) && (
          <section className="pf-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Apprenticeships</h2>

            {college.fa_frameworks && college.fa_frameworks.length > 0 && (
              <div style={{ marginBottom: college.ma_frameworks?.length ? '20px' : 0 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--pf-grey-900)' }}>
                  Foundation Apprenticeships
                </h3>
                <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '10px' }}>
                  Available for S4-S6 pupils alongside school study (SCQF Level 6)
                </p>
                <div className="flex flex-wrap gap-2">
                  {college.fa_frameworks.map((fw) => (
                    <span key={fw} className="pf-badge-blue">{fw}</span>
                  ))}
                </div>
              </div>
            )}

            {college.ma_frameworks && college.ma_frameworks.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--pf-grey-900)' }}>
                  Modern Apprenticeships
                </h3>
                <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '10px' }}>
                  Earn while you learn — paid employment with college study
                </p>
                <div className="flex flex-wrap gap-2">
                  {college.ma_frameworks.map((fw) => (
                    <span key={fw} className="pf-badge-blue">{fw}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <Link
                href="/pathways/alternatives"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Learn more about apprenticeships in Scotland →
              </Link>
            </div>
          </section>
        )}

        {/* Section 6 — Schools Programme */}
        {college.schools_programme && (
          <section className="pf-card" style={{ padding: '24px' }}>
            <div className="flex items-center gap-2 mb-3">
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Schools Programme</h2>
              <span className="pf-badge-green">S4-S6</span>
            </div>
            <p style={{ color: 'var(--pf-grey-600)', lineHeight: 1.6, marginBottom: '12px' }}>
              For S4-S6 pupils: you can study college courses alongside your school subjects.
            </p>
            {college.schools_programme_details && (
              <p style={{ color: 'var(--pf-grey-600)', lineHeight: 1.6, marginBottom: '12px' }}>
                {college.schools_programme_details}
              </p>
            )}
            {college.website_url && (
              <a
                href={college.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Check current programme details on the college website →
              </a>
            )}
          </section>
        )}

        {/* Section 7 — Student Support */}
        <section className="pf-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Student Support</h2>
          <div className="space-y-4">
            <SupportItem
              title="Care-Experienced Bursary"
              description="£9,000/year (£225/week), non-means-tested"
              badge="All colleges"
            />
            <SupportItem
              title="FE Bursary"
              description="Up to £125.55/week (means-tested)"
              badge="Means-tested"
            />
            <SupportItem
              title="Free Bus Travel"
              description="Free bus travel for all under-22s in Scotland"
              badge="Under 22"
            />
            {college.has_swap && (
              <SupportItem
                title="SWAP Access"
                description={`SWAP access courses available${college.swap_hub ? ` through SWAP ${college.swap_hub}` : ''} — free courses for adults (21+) without traditional qualifications`}
                badge="SWAP"
                highlight
              />
            )}
          </div>
          <div style={{ marginTop: '20px' }}>
            <Link
              href="/benefits"
              className="pf-btn-secondary inline-flex items-center gap-1"
              style={{ fontSize: '0.875rem' }}
            >
              View all student benefits
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function SupportItem({
  title,
  description,
  badge,
  highlight,
}: {
  title: string
  description: string
  badge: string
  highlight?: boolean
}) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: highlight ? 'rgba(245, 158, 11, 0.08)' : 'var(--pf-grey-100)',
        borderLeft: highlight ? '3px solid var(--pf-amber-500)' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-900)',
              marginBottom: '2px',
            }}
          >
            {title}
          </p>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.8125rem' }}>
            {description}
          </p>
        </div>
        <span className={highlight ? 'pf-badge-amber' : 'pf-badge-grey'} style={{ flexShrink: 0 }}>
          {badge}
        </span>
      </div>
    </div>
  )
}

function parseCampuses(raw: Json | null): Campus[] {
  if (!raw || !Array.isArray(raw)) return []
  const result: Campus[] = []
  for (const item of raw) {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      const obj = item as Record<string, Json | undefined>
      result.push({
        name: String(obj.name || 'Campus'),
        address: obj.address ? String(obj.address) : undefined,
        postcode: obj.postcode ? String(obj.postcode) : undefined,
      })
    }
  }
  return result
}
