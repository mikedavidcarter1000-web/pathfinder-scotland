'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSubjects, useCurricularAreas, useCareerSectors } from '@/hooks/use-subjects'
import type { QualificationLevel, SubjectWithArea } from '@/hooks/use-subjects'
import {
  CURRICULAR_AREA_COLOURS,
  DEFAULT_CURRICULAR_AREA_COLOUR,
} from '@/lib/constants'

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
  const searchParams = useSearchParams()
  const careerSectorParam = searchParams.get('career_sector') || ''

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore Subjects</h1>
              <p className="text-gray-600 mt-1">
                Browse every subject available across Scottish schools — from National 4 to Advanced Higher
              </p>
            </div>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {/* Career sector filter banner */}
          {activeCareerSector && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Showing subjects linked to {activeCareerSector.name}
                </p>
                {activeCareerSector.description && (
                  <p className="text-xs text-blue-700 mt-0.5">{activeCareerSector.description}</p>
                )}
              </div>
              <button
                onClick={() => setCareerSectorId('')}
                className="text-blue-700 hover:text-blue-900 text-sm font-medium"
              >
                Clear
              </button>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subjects by name, description or skill..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Curricular Areas</option>
              {areas?.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Level toggle buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {LEVEL_BUTTONS.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setLevel(btn.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  level === btn.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Result count */}
        <div className="mb-6">
          {isLoading ? (
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-gray-600">
              {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'} found
              {hasFilters && ' matching your filters'}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Failed to load subjects. Please try again.</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-12 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredSubjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search term.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
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
  const areaColour =
    (area && CURRICULAR_AREA_COLOURS[area.name]) || DEFAULT_CURRICULAR_AREA_COLOUR

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
    <Link href={`/subjects/${subject.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all h-full flex flex-col">
        <div className={`h-1.5 bg-gradient-to-r ${areaColour.bar}`} />
        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-base line-clamp-2">
              {subject.name}
            </h3>
            {area && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${areaColour.bg} ${areaColour.text}`}
              >
                {area.name}
              </span>
            )}
          </div>

          {/* Level tags */}
          {levels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {levels.map((lvl) => (
                <span
                  key={lvl}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {lvl}
                </span>
              ))}
            </div>
          )}

          {/* Skills tags */}
          {subject.skills_tags && subject.skills_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {subject.skills_tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                >
                  {tag}
                </span>
              ))}
              {subject.skills_tags.length > 4 && (
                <span className="text-xs text-gray-500 self-center">
                  +{subject.skills_tags.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {descriptionToShow && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{descriptionToShow}</p>
          )}

          <div className="mt-auto">
            <span className="block w-full text-center py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      }
    >
      <SubjectsPageContent />
    </Suspense>
  )
}
