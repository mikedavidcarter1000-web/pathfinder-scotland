'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSubjects, useCurricularAreas, useCareerSectors } from '@/hooks/use-subjects'
import type { QualificationLevel, SubjectWithArea } from '@/hooks/use-subjects'
import { getCurricularAreaColour } from '@/lib/constants'

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

  const { data: subjects, isLoading, error } = useSubjects({
    curricularAreaId: areaId || undefined,
    level: levelFilter,
    careerSectorId: careerSectorId || undefined,
  })

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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-teal-50)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)', borderBottom: '1px solid var(--pf-grey-100)' }}>
        <div className="pf-container" style={{ paddingTop: '40px', paddingBottom: '32px' }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 style={{ marginBottom: '8px' }}>Explore Subjects</h1>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem' }}>
                Browse every subject available across Scottish schools — from National 4 to Advanced Higher.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={goBack}
              style={{ color: 'var(--pf-grey-600)' }}
              className="p-2 hover:opacity-80"
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
              style={{ backgroundColor: 'var(--pf-teal-100)' }}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                style={{ color: 'var(--pf-teal-700)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="flex-1">
                <p style={{ color: 'var(--pf-teal-900)', fontWeight: 600, fontSize: '0.9375rem' }}>
                  Showing subjects linked to {activeCareerSector.name}
                </p>
                {activeCareerSector.description && (
                  <p style={{ color: 'var(--pf-teal-700)', fontSize: '0.8125rem', marginTop: '2px' }}>
                    {activeCareerSector.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setCareerSectorId('')}
                style={{ color: 'var(--pf-teal-700)', fontWeight: 600, fontSize: '0.875rem' }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Search */}
          <div className="mb-4 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
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
              placeholder="Search subjects by name, description or skill..."
              className="pf-input"
              style={{ paddingLeft: '44px' }}
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="pf-input"
              style={{ width: 'auto', paddingRight: '32px' }}
            >
              <option value="">All Curricular Areas</option>
              {areas?.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="pf-btn-ghost pf-btn-sm">
                Clear filters
              </button>
            )}
          </div>

          {/* Level toggle buttons */}
          <div className="flex flex-wrap gap-2">
            {LEVEL_BUTTONS.map((btn) => {
              const active = level === btn.value
              return (
                <button
                  key={btn.value}
                  onClick={() => setLevel(btn.value)}
                  className="transition-colors"
                  style={{
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    backgroundColor: active ? 'var(--pf-teal-700)' : 'var(--pf-white)',
                    color: active ? '#fff' : 'var(--pf-grey-900)',
                    border: active ? '1px solid var(--pf-teal-700)' : '1px solid var(--pf-grey-300)',
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
        {error && (
          <div
            className="rounded-lg p-4 mb-6"
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              color: 'var(--pf-red-500)',
            }}
          >
            Failed to load subjects. Please try again.
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="pf-card animate-pulse">
                <div className="h-4 rounded w-3/4 mb-3" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
                <div className="h-3 rounded w-1/2 mb-4" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
                <div className="h-12 rounded" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredSubjects.length === 0 && (
          <div className="text-center py-16">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--pf-grey-100)' }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: 'var(--pf-grey-600)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            <h3 style={{ marginBottom: '8px' }}>No subjects found</h3>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
              Try adjusting your filters or search term.
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="pf-btn-primary">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Subject grid */}
        {!isLoading && filteredSubjects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

          {/* Skills tags -- teal-100 bg, teal-700 text */}
          {subject.skills_tags && subject.skills_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {subject.skills_tags.slice(0, 4).map((tag) => (
                <span key={tag} className="pf-badge-teal">
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
              className="block w-full text-center"
              style={{
                padding: '10px',
                fontSize: '0.875rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: 'var(--pf-teal-700)',
                backgroundColor: 'var(--pf-teal-100)',
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
          style={{ backgroundColor: 'var(--pf-teal-50)' }}
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
