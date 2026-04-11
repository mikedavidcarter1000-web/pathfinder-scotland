'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useCurricularAreas,
  useExploreData,
  type SubjectWithArea,
  type CurricularArea,
  type ExploreCareerSectorRow,
  type CareerRole,
} from '@/hooks/use-subjects'
import { getCurricularAreaColour, AI_ROLE_SOURCE } from '@/lib/constants'
import { AiRoleBadge } from '@/components/ui/ai-role-badge'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { classifyError } from '@/lib/errors'

const MAX_AREAS = 3

// Friendly one-line descriptions that sit alongside the raw CfE area names
// on the curricular-area selection cards. Keyed by area name so the mapping
// stays in one place.
const AREA_BLURBS: Record<string, string> = {
  Languages: 'Reading, writing, and communicating in English and other languages.',
  Mathematics: 'Numbers, patterns, problem-solving, and logical reasoning.',
  Sciences: 'Experiments, discoveries, and understanding how the world works.',
  'Social Studies': 'People, places, history, politics, and how society works.',
  'Expressive Arts': 'Creating, performing, designing, and expressing ideas.',
  Technologies: 'Computing, engineering, design, and making things work.',
  'Religious and Moral Education': 'Beliefs, ethics, philosophy, and big questions.',
  'Health and Wellbeing': 'Physical activity, nutrition, and looking after yourself and others.',
}

export default function ExplorePage() {
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([])

  const {
    data: areas,
    isLoading: areasLoading,
    error: areasError,
    refetch: refetchAreas,
  } = useCurricularAreas()

  const {
    data: exploreData,
    isLoading: exploreLoading,
    error: exploreError,
  } = useExploreData(selectedAreaIds)

  const toggleArea = (id: string) => {
    setSelectedAreaIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      }
      if (prev.length >= MAX_AREAS) {
        // Replace the first selected area with the new one (FIFO) — keeps
        // the cap visible without silently ignoring clicks.
        return [...prev.slice(1), id]
      }
      return [...prev, id]
    })
  }

  const clearSelection = () => setSelectedAreaIds([])

  const hasSelection = selectedAreaIds.length > 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-100)',
        }}
      >
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <nav aria-label="Breadcrumb" style={{ marginBottom: '12px' }}>
            <Link
              href="/discover"
              style={{
                color: 'var(--pf-blue-700)',
                fontSize: '0.875rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Discover
            </Link>
          </nav>
          <h1 style={{ marginBottom: '8px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
            Let&apos;s figure this out together
          </h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', maxWidth: '720px' }}>
            Pick a few things you enjoy — no commitment. We&apos;ll show you the subjects and
            career areas that fit, including some you might not have thought about.
          </p>
        </div>
      </div>

      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {/* Section 1 — enjoyment picker */}
        <section aria-labelledby="section-enjoy">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
            <div>
              <h2 id="section-enjoy" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                What do you enjoy?
              </h2>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                Pick up to {MAX_AREAS} areas. You can change this any time.
              </p>
            </div>
            {hasSelection && (
              <button
                onClick={clearSelection}
                className="pf-btn-ghost pf-btn-sm"
                style={{ minHeight: '40px' }}
              >
                Clear selection
              </button>
            )}
          </div>

          {areasLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="pf-card">
                  <Skeleton width="48px" height={48} rounded="md" />
                  <div style={{ height: '12px' }} />
                  <Skeleton width="70%" height={18} rounded="sm" />
                  <div style={{ height: '8px' }} />
                  <Skeleton width="100%" height={12} rounded="sm" />
                </div>
              ))}
            </div>
          )}

          {!areasLoading && areasError && (
            <ErrorState
              title={classifyError(areasError).title}
              message="Couldn't load curricular areas. Please try again."
              retryAction={() => refetchAreas()}
            />
          )}

          {!areasLoading && !areasError && areas && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {areas.map((area) => (
                <AreaPickerCard
                  key={area.id}
                  area={area}
                  selected={selectedAreaIds.includes(area.id)}
                  onToggle={() => toggleArea(area.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sections 2-4 — only render once a selection exists */}
        {hasSelection && (
          <>
            {exploreLoading && (
              <div className="mt-12 space-y-6">
                <Skeleton variant="card" />
                <Skeleton variant="card" />
                <Skeleton variant="card" />
              </div>
            )}

            {!exploreLoading && exploreError && (
              <div className="mt-12">
                <ErrorState
                  title={classifyError(exploreError).title}
                  message="Couldn't load suggestions. Please try again."
                  retryAction={clearSelection}
                />
              </div>
            )}

            {!exploreLoading && !exploreError && exploreData && (
              <>
                {/* Section 2 — subjects by area */}
                <section aria-labelledby="section-subjects" style={{ marginTop: '56px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h2
                      id="section-subjects"
                      style={{ fontSize: '1.25rem', marginBottom: '4px' }}
                    >
                      Based on what you enjoy
                    </h2>
                    <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                      Subjects in your chosen areas, with the skills they build and the
                      careers they connect to.
                    </p>
                  </div>

                  {exploreData.subjects_by_area.length === 0 && (
                    <div className="pf-card text-center" style={{ padding: '32px' }}>
                      <p style={{ color: 'var(--pf-grey-600)' }}>
                        No subjects found for the selected areas.
                      </p>
                    </div>
                  )}

                  <div className="space-y-10">
                    {exploreData.subjects_by_area.map((group) => (
                      <AreaSubjectsGroup key={group.area.id} group={group} />
                    ))}
                  </div>
                </section>

                {/* Section 3 — careers */}
                {exploreData.suggested_sectors.length > 0 && (
                  <section
                    aria-labelledby="section-careers"
                    style={{ marginTop: '56px' }}
                  >
                    <div style={{ marginBottom: '20px' }}>
                      <span
                        className="pf-badge-amber inline-flex"
                        style={{ marginBottom: '10px' }}
                      >
                        You might not have considered these
                      </span>
                      <h2
                        id="section-careers"
                        style={{ fontSize: '1.25rem', marginBottom: '4px' }}
                      >
                        Careers that connect to your choices
                      </h2>
                      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                        Every sector below has subjects linked to at least one of your
                        chosen areas. Some connections might surprise you.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {exploreData.suggested_sectors.slice(0, 8).map((sector) => (
                        <SectorSuggestionCard key={sector.id} sector={sector} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 3b — Specific roles + AI ratings */}
                {exploreData.reachable_roles.length > 0 && (
                  <ReachableRolesSection roles={exploreData.reachable_roles} />
                )}

                {/* Section 4 — CTAs */}
                <section
                  aria-labelledby="section-ready"
                  style={{ marginTop: '56px' }}
                >
                  <div
                    className="pf-card"
                    style={{
                      backgroundColor: 'var(--pf-blue-900)',
                      padding: '32px',
                      color: '#fff',
                    }}
                  >
                    <h2
                      id="section-ready"
                      style={{ color: '#fff', marginBottom: '8px', fontSize: '1.375rem' }}
                    >
                      Ready to plan?
                    </h2>
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '24px',
                        fontSize: '0.9375rem',
                      }}
                    >
                      Take what you&apos;ve found into the planner, browse every subject, or
                      see which university courses you could apply to.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href="/pathways"
                        className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
                        style={{
                          backgroundColor: '#fff',
                          color: 'var(--pf-blue-900)',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          minHeight: '48px',
                        }}
                      >
                        Plan your subject choices
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link
                        href="/subjects"
                        className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#fff',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.35)',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          minHeight: '48px',
                        }}
                      >
                        Explore all subjects
                      </Link>
                      <Link
                        href="/courses"
                        className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#fff',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.35)',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          minHeight: '48px',
                        }}
                      >
                        Check university courses
                      </Link>
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- */

function AreaPickerCard({
  area,
  selected,
  onToggle,
}: {
  area: CurricularArea
  selected: boolean
  onToggle: () => void
}) {
  const colour = getCurricularAreaColour(area.name)
  const blurb = AREA_BLURBS[area.name]

  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      className="pf-card-hover text-left flex flex-col h-full relative"
      style={{
        padding: '20px',
        border: selected ? '2px solid var(--pf-blue-700)' : '2px solid transparent',
        backgroundColor: selected ? 'var(--pf-blue-100)' : 'var(--pf-white)',
      }}
    >
      {selected && (
        <span
          className="absolute flex items-center justify-center"
          style={{
            top: '12px',
            right: '12px',
            width: '24px',
            height: '24px',
            borderRadius: '9999px',
            backgroundColor: 'var(--pf-blue-700)',
            color: '#fff',
          }}
          aria-hidden="true"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <div className={`h-1 -mx-5 -mt-5 mb-4 bg-gradient-to-r ${colour.bar}`} />
      <h3
        style={{
          fontSize: '1rem',
          marginBottom: '6px',
          color: 'var(--pf-grey-900)',
        }}
      >
        {area.name}
      </h3>
      {blurb && (
        <p
          style={{
            color: 'var(--pf-grey-600)',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
          }}
        >
          {blurb}
        </p>
      )}
    </button>
  )
}

function AreaSubjectsGroup({
  group,
}: {
  group: { area: CurricularArea; subjects: SubjectWithArea[] }
}) {
  const colour = getCurricularAreaColour(group.area.name)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2.5 h-2.5 rounded-full ${colour.dot}`} aria-hidden="true" />
        <h3 style={{ fontSize: '1.0625rem', marginBottom: 0 }}>{group.area.name}</h3>
        <span style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem' }}>
          · {group.subjects.length} {group.subjects.length === 1 ? 'subject' : 'subjects'}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.subjects.map((subject) => (
          <ExploreSubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  )
}

function ExploreSubjectCard({ subject }: { subject: SubjectWithArea }) {
  const colour = getCurricularAreaColour(subject.curricular_area?.name)

  const levels: string[] = []
  if (subject.is_available_n5) levels.push('N5')
  if (subject.is_available_higher) levels.push('H')
  if (subject.is_available_adv_higher) levels.push('AH')

  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full"
      style={{ padding: 0, overflow: 'hidden' }}
      aria-label={`View details for ${subject.name}`}
    >
      <div className={`h-1 bg-gradient-to-r ${colour.bar}`} />
      <div className="p-5 flex-1 flex flex-col">
        <h4
          style={{
            color: 'var(--pf-grey-900)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            marginBottom: '10px',
            lineHeight: 1.3,
          }}
          className="line-clamp-2"
        >
          {subject.name}
        </h4>

        {subject.description && (
          <p
            className="line-clamp-3 mb-3"
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
            }}
          >
            {subject.description}
          </p>
        )}

        {subject.skills_tags && subject.skills_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {subject.skills_tags.slice(0, 3).map((tag) => (
              <span key={tag} className="pf-badge-blue">
                {tag}
              </span>
            ))}
          </div>
        )}

        {levels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {levels.map((lvl) => (
              <span key={lvl} className="pf-badge-grey">
                {lvl}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <span
            className="flex w-full items-center justify-center"
            style={{
              minHeight: '40px',
              padding: '8px',
              fontSize: '0.8125rem',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              color: 'var(--pf-blue-700)',
              backgroundColor: 'var(--pf-blue-100)',
              borderRadius: '6px',
            }}
          >
            View details
          </span>
        </div>
      </div>
    </Link>
  )
}

function ReachableRolesSection({
  roles,
}: {
  roles: Array<CareerRole & { sector_name: string }>
}) {
  // Show the most resilient and most exposed sets, plus a small spotlight
  // on any new AI roles connected to the chosen areas.
  const resilient = roles.filter((r) => r.ai_rating <= 3 && !r.is_new_ai_role).slice(0, 8)
  const transforming = roles.filter((r) => r.ai_rating >= 7 && !r.is_new_ai_role).slice(0, 6)
  const newAi = roles.filter((r) => r.is_new_ai_role).slice(0, 6)

  return (
    <section
      aria-labelledby="section-roles"
      style={{ marginTop: '56px' }}
    >
      <div style={{ marginBottom: '20px' }}>
        <span
          className="pf-badge-blue inline-flex"
          style={{ marginBottom: '10px' }}
        >
          The road ahead
        </span>
        <h2 id="section-roles" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
          Specific jobs your subjects could lead to
        </h2>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
          AI is reshaping every career, but the picture is more nuanced than the headlines.
          Roles change — they don&apos;t all disappear.
        </p>
      </div>

      {resilient.length > 0 && (
        <div
          className="pf-card"
          style={{
            padding: '20px 24px',
            borderLeft: '3px solid var(--pf-green-500)',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              color: 'var(--pf-green-500)',
              marginBottom: '4px',
            }}
          >
            These careers are highly resilient to AI change
          </h3>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginBottom: '12px',
            }}
          >
            Roles where human strengths — care, judgment, physical work, relationships — keep
            people at the centre of the job.
          </p>
          <RoleChipList roles={resilient} />
        </div>
      )}

      {transforming.length > 0 && (
        <div
          className="pf-card"
          style={{
            padding: '20px 24px',
            borderLeft: '3px solid #C2410C',
            backgroundColor: 'rgba(249, 115, 22, 0.05)',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ fontSize: '1rem', color: '#C2410C', marginBottom: '4px' }}>
            These careers will change significantly — but people who adapt will thrive
          </h3>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginBottom: '12px',
            }}
          >
            Routine tasks are being automated, freeing up time for the strategic, creative,
            and advisory work that&apos;s now valued more than ever.
          </p>
          <RoleChipList roles={transforming} />
        </div>
      )}

      {newAi.length > 0 && (
        <div
          className="pf-card"
          style={{
            padding: '20px 24px',
            borderTop: '3px solid var(--pf-green-500)',
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              color: 'var(--pf-green-500)',
              marginBottom: '4px',
            }}
          >
            New careers created by AI
          </h3>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginBottom: '12px',
            }}
          >
            Jobs that didn&apos;t exist a decade ago. Students starting school now will be among
            the first generation to step straight into them.
          </p>
          <RoleChipList roles={newAi} />
        </div>
      )}

      <p
        style={{
          fontSize: '0.6875rem',
          color: 'var(--pf-grey-600)',
          marginTop: '12px',
          lineHeight: 1.6,
          maxWidth: '720px',
        }}
      >
        {AI_ROLE_SOURCE}
      </p>
    </section>
  )
}

function RoleChipList({
  roles,
}: {
  roles: Array<CareerRole & { sector_name: string }>
}) {
  return (
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
      {roles.map((role) => (
        <li
          key={role.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '8px 0',
            borderTop: '1px solid var(--pf-grey-100)',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: 'var(--pf-grey-900)',
                margin: 0,
                fontSize: '0.875rem',
              }}
            >
              {role.title}
            </p>
            {role.sector_name && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--pf-grey-600)',
                  margin: 0,
                }}
              >
                {role.sector_name}
              </p>
            )}
          </div>
          <AiRoleBadge rating={role.ai_rating} size="sm" />
        </li>
      ))}
    </ul>
  )
}

function SectorSuggestionCard({ sector }: { sector: ExploreCareerSectorRow }) {
  return (
    <Link
      href={`/discover/career-search?sector=${sector.id}`}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full"
      style={{ padding: '24px' }}
      aria-label={`Explore ${sector.name}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--pf-blue-100)',
            color: 'var(--pf-blue-700)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="pf-badge-blue">
          {sector.matched_subject_count}{' '}
          {sector.matched_subject_count === 1 ? 'match' : 'matches'}
        </span>
      </div>
      <h3
        style={{
          fontSize: '1rem',
          marginBottom: '6px',
          color: 'var(--pf-grey-900)',
        }}
      >
        {sector.name}
      </h3>
      {sector.description && (
        <p
          className="line-clamp-3"
          style={{
            color: 'var(--pf-grey-600)',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {sector.description}
        </p>
      )}
      <div
        className="mt-3"
        style={{
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.8125rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        Explore this sector
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
