'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSubjects, useCurricularAreas, useCareerSectors } from '@/hooks/use-subjects'
import type { QualificationLevel, SubjectWithArea } from '@/hooks/use-subjects'
import { getCurricularAreaColour } from '@/lib/constants'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'

type LevelFilter = 'all' | QualificationLevel

const LEVEL_BUTTONS: Array<{ value: LevelFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'n5', label: 'N4 / N5' },
  { value: 'higher', label: 'Higher' },
  { value: 'adv_higher', label: 'Advanced Higher' },
  { value: 'npa', label: 'NPA' },
  { value: 'academy', label: 'Academy' },
]

function SubjectsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const careerSectorParam = searchParams.get('career_sector') || ''

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const [search, setSearch] = useState('')
  const [areaId, setAreaId] = useState('')
  const [level, setLevel] = useState<LevelFilter>('all')
  const [careerSectorId, setCareerSectorId] = useState(careerSectorParam)

  const { data: areas } = useCurricularAreas()
  const { data: careerSectors } = useCareerSectors()

  const levelFilter = level === 'all' ? undefined : level

  const { data: subjects, isLoading, error, refetch } = useSubjects({
    curricularAreaId: areaId || undefined,
    level: levelFilter,
    careerSectorId: careerSectorId || undefined,
  })

  useAuthErrorRedirect([error])

  const filteredSubjects = useMemo(() => {
    if (!subjects) return []
    if (!search) return subjects
    const needle = search.toLowerCase()
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(needle) ||
        s.description?.toLowerCase().includes(needle) ||
        s.skills_tags?.some((tag) => tag.toLowerCase().includes(needle))
    )
  }, [subjects, search])

  const activeCareerSector = useMemo(
    () => careerSectors?.find((c) => c.id === careerSectorId) ?? null,
    [careerSectors, careerSectorId]
  )

  const clearFilters = () => {
    setSearch('')
    setAreaId('')
    setLevel('all')
    setCareerSectorId('')
  }

  const hasFilters = search || areaId || level !== 'all' || careerSectorId
  const showingAcademies = level === 'academy'

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)', borderBottom: '1px solid var(--pf-grey-100)' }}>
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h1 style={{ marginBottom: '8px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>Explore Subjects</h1>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                Browse every subject available across Scottish schools — from National 4 to Advanced Higher.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={goBack}
              style={{ color: 'var(--pf-grey-600)', minWidth: '44px', minHeight: '44px' }}
              className="flex items-center justify-center hover:opacity-80 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Career sector filter banner */}
          {activeCareerSector && (
            <div
              className="mb-6 p-4 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: 'var(--pf-blue-100)' }}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                style={{ color: 'var(--pf-blue-700)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="flex-1">
                <p style={{ color: 'var(--pf-blue-900)', fontWeight: 600, fontSize: '0.9375rem' }}>
                  Showing subjects linked to {activeCareerSector.name}
                </p>
                {activeCareerSector.description && (
                  <p style={{ color: 'var(--pf-blue-700)', fontSize: '0.8125rem', marginTop: '2px' }}>
                    {activeCareerSector.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setCareerSectorId('')}
                style={{ color: 'var(--pf-blue-700)', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Search */}
          <div className="mb-3 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
              style={{ color: 'var(--pf-grey-600)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects..."
              className="pf-input w-full"
              style={{ paddingLeft: '44px' }}
            />
          </div>

          {/* Filters row — stacked on mobile, inline on sm+ */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-3">
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="pf-input w-full sm:w-auto"
              style={{ paddingRight: '32px' }}
            >
              <option value="">All Curricular Areas</option>
              {areas?.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="pf-btn-ghost pf-btn-sm w-full sm:w-auto justify-center">
                Clear filters
              </button>
            )}
          </div>

          {/* Level toggle buttons — wraps to multiple rows on mobile */}
          <div className="flex flex-wrap gap-2">
            {LEVEL_BUTTONS.map((btn) => {
              const active = level === btn.value
              return (
                <button
                  key={btn.value}
                  onClick={() => setLevel(btn.value)}
                  className="transition-colors inline-flex items-center justify-center"
                  style={{
                    padding: '10px 16px',
                    minHeight: '44px',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                    color: active ? '#fff' : 'var(--pf-grey-900)',
                    border: active ? '1px solid var(--pf-blue-700)' : '1px solid var(--pf-grey-300)',
                  }}
                >
                  {btn.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {/* Result count */}
        <div className="mb-6">
          {isLoading ? (
            <div
              className="h-5 w-32 rounded animate-pulse"
              style={{ backgroundColor: 'var(--pf-grey-100)' }}
            />
          ) : (
            <p style={{ color: 'var(--pf-grey-600)' }}>
              {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'} found
              {hasFilters && ' matching your filters'}
            </p>
          )}
        </div>

        {/* Error */}
        {!isLoading && error && (
          <ErrorState
            title={classifyError(error).title}
            message="Something went wrong loading subjects. Please try again."
            retryAction={() => refetch()}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <>
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="pf-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <Skeleton width="100%" height={4} rounded="sm" />
                  <div style={{ padding: '20px' }}>
                    <Skeleton width="75%" height={18} rounded="sm" />
                    <div style={{ height: '8px' }} />
                    <Skeleton width="40%" height={22} rounded="full" />
                    <div style={{ height: '16px' }} />
                    <Skeleton width="100%" height={12} rounded="sm" />
                    <div style={{ height: '6px' }} />
                    <Skeleton width="90%" height={12} rounded="sm" />
                    <div style={{ height: '20px' }} />
                    <Skeleton width="100%" height={36} rounded="md" />
                  </div>
                </div>
              ))}
            </div>
            <SlowLoadingNotice isLoading={isLoading} />
          </>
        )}

        {/* Empty */}
        {!isLoading && !error && filteredSubjects.length === 0 && (
          <EmptyState
            icon={EmptyStateIcons.search}
            title="No subjects found"
            message="Try adjusting your filters or search term."
            actionLabel={hasFilters ? 'Clear filters' : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        )}

        {/* Subject grid */}
        {!isLoading && !error && filteredSubjects.length > 0 && (
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                highlightAcademyContent={showingAcademies}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SubjectCard({
  subject,
  highlightAcademyContent,
}: {
  subject: SubjectWithArea
  highlightAcademyContent: boolean
}) {
  const area = subject.curricular_area
  const areaColour = getCurricularAreaColour(area?.name)

  const levels: string[] = []
  if (subject.is_available_n4) levels.push('N4')
  if (subject.is_available_n5) levels.push('N5')
  if (subject.is_available_higher) levels.push('H')
  if (subject.is_available_adv_higher) levels.push('AH')
  if (subject.is_npa) levels.push('NPA')
  if (subject.is_academy) levels.push('Academy')

  const showRichContent =
    highlightAcademyContent && subject.is_academy && (subject.why_choose || subject.description)
  const descriptionToShow =
    showRichContent && subject.why_choose ? subject.why_choose : subject.description

  return (
    <Link href={`/subjects/${subject.id}`} className="block group no-underline hover:no-underline">
      <div
        className="pf-card-hover h-full flex flex-col"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        <div className={`h-1 bg-gradient-to-r ${areaColour.bar}`} />
        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-3">
            <h3
              style={{ color: 'var(--pf-grey-900)', fontSize: '1.0625rem', marginBottom: '8px' }}
              className="line-clamp-2"
            >
              {subject.name}
            </h3>
            {area && (
              <span className={`pf-area-badge ${areaColour.bg} ${areaColour.text}`}>
                {area.name}
              </span>
            )}
          </div>

          {/* Level tags -- grey-100 bg, grey-900 text */}
          {levels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {levels.map((lvl) => (
                <span key={lvl} className="pf-badge-grey">
                  {lvl}
                </span>
              ))}
            </div>
          )}

          {/* Skills tags -- blue-100 bg, blue-700 text */}
          {subject.skills_tags && subject.skills_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {subject.skills_tags.slice(0, 4).map((tag) => (
                <span key={tag} className="pf-badge-blue">
                  {tag}
                </span>
              ))}
              {subject.skills_tags.length > 4 && (
                <span
                  className="self-center"
                  style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}
                >
                  +{subject.skills_tags.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {descriptionToShow && (
            <p
              className="line-clamp-2 mb-4"
              style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem' }}
            >
              {descriptionToShow}
            </p>
          )}

          <div className="mt-auto">
            <span
              className="flex w-full items-center justify-center"
              style={{
                minHeight: '44px',
                padding: '10px',
                fontSize: '0.875rem',
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
      </div>
    </Link>
  )
}

export default function SubjectsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: 'var(--pf-blue-50)' }}
        >
          <div className="animate-pulse" style={{ color: 'var(--pf-grey-600)' }}>
            Loading...
          </div>
        </div>
      }
    >
      <SubjectsPageContent />
    </Suspense>
  )
}
