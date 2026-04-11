'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSearch } from '@/hooks/use-search'
import type { SubjectWithArea } from '@/app/api/search/route'
import { CourseCard } from '@/components/ui/course-card'
import { UniversityCard } from '@/components/ui/university-card'
import type { Tables } from '@/types/database'

type SearchTab = 'all' | 'subjects' | 'courses' | 'universities' | 'careers'

const CURRICULAR_AREA_COLORS: Record<string, string> = {
  Languages: 'var(--pf-area-languages)',
  Mathematics: 'var(--pf-area-mathematics)',
  Sciences: 'var(--pf-area-sciences)',
  'Social Studies': 'var(--pf-area-social)',
  'Expressive Arts': 'var(--pf-area-expressive)',
  Technologies: 'var(--pf-area-technologies)',
  'Religious and Moral Education': 'var(--pf-area-rme)',
  'Health and Wellbeing': 'var(--pf-area-health)',
}

function areaColor(name?: string | null): string {
  if (!name) return 'var(--pf-grey-300)'
  return CURRICULAR_AREA_COLORS[name] ?? 'var(--pf-grey-300)'
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
  const [collapsed, setCollapsed] = useState<Record<SearchTab, boolean>>({
    all: false,
    subjects: false,
    courses: false,
    universities: false,
    careers: false,
  })

  const { data, isLoading, error } = useSearch(query, {
    enabled: query.length >= 2,
  })

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const subjects = useMemo(() => data?.subjects ?? [], [data])
  const courses = useMemo(() => data?.courses ?? [], [data])
  const universities = useMemo(() => data?.universities ?? [], [data])
  const careerSectors = useMemo(() => data?.careerSectors ?? [], [data])

  const totalResults =
    subjects.length + courses.length + universities.length + careerSectors.length

  const tabs: { id: SearchTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: totalResults },
    { id: 'subjects', label: 'Subjects', count: subjects.length },
    { id: 'courses', label: 'Courses', count: courses.length },
    { id: 'universities', label: 'Universities', count: universities.length },
    { id: 'careers', label: 'Careers', count: careerSectors.length },
  ]

  const toggleCollapse = (section: SearchTab) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const showSubjects = activeTab === 'all' || activeTab === 'subjects'
  const showCourses = activeTab === 'all' || activeTab === 'courses'
  const showUniversities = activeTab === 'all' || activeTab === 'universities'
  const showCareers = activeTab === 'all' || activeTab === 'careers'

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <h1 className="sr-only">Search results</h1>
      {/* Search Header */}
      <div
        className="sticky top-0 z-10"
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="pf-container py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="no-underline"
              style={{ color: 'var(--pf-grey-600)' }}
              aria-label="Back to home"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subjects, courses, universities, careers..."
                autoFocus
                className="w-full focus:outline-none"
                style={{
                  backgroundColor: 'var(--pf-white)',
                  border: '1px solid var(--pf-grey-300)',
                  borderRadius: '8px',
                  padding: '12px 44px 12px 44px',
                  minHeight: '48px',
                  fontSize: '1rem',
                  color: 'var(--pf-grey-900)',
                }}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: 'var(--pf-grey-600)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--pf-grey-600)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          {query.length >= 2 && (
            <div
              className="flex gap-1 mt-4 overflow-x-auto scrollbar-hide"
              style={{ marginBottom: '-1px' }}
              role="tablist"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={isActive}
                    className="inline-flex items-center gap-2 whitespace-nowrap transition-colors"
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.875rem',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      borderBottom: `2px solid ${isActive ? 'var(--pf-blue-700)' : 'transparent'}`,
                      color: isActive ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
                      backgroundColor: isActive ? 'var(--pf-blue-50)' : 'transparent',
                      borderRadius: '8px 8px 0 0',
                    }}
                  >
                    {tab.label}
                    <span
                      className="pf-data-number"
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: isActive ? 'var(--pf-blue-100)' : 'var(--pf-grey-100)',
                        color: isActive ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary line */}
      {query.length >= 2 && !isLoading && !error && totalResults > 0 && (
        <div className="pf-container pt-6">
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.875rem',
              marginBottom: 0,
            }}
          >
            <span style={{ color: 'var(--pf-grey-900)', fontWeight: 600 }}>
              {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </span>{' '}
            for &quot;{query}&quot; ·{' '}
            <span className="pf-data-number">
              Subjects ({subjects.length}) · Courses ({courses.length}) · Universities ({universities.length}) · Careers ({careerSectors.length})
            </span>
          </p>
        </div>
      )}

      {/* Results body */}
      <div className="pf-container py-8">
        {query.length < 2 ? (
          <EmptyPrompt />
        ) : isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : totalResults === 0 ? (
          <NoResultsState query={query} />
        ) : (
          <div className="space-y-10">
            {showSubjects && subjects.length > 0 && (
              <SectionBlock
                title="Subjects"
                count={subjects.length}
                collapsed={collapsed.subjects}
                onToggle={() => toggleCollapse('subjects')}
                showCollapse={activeTab === 'all'}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  {subjects.map((subject) => (
                    <SubjectResultCard key={subject.id} subject={subject} />
                  ))}
                </div>
              </SectionBlock>
            )}

            {showCourses && courses.length > 0 && (
              <SectionBlock
                title="Courses"
                count={courses.length}
                collapsed={collapsed.courses}
                onToggle={() => toggleCollapse('courses')}
                showCollapse={activeTab === 'all'}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={{
                        ...course,
                        university: course.university ?? undefined,
                      }}
                    />
                  ))}
                </div>
              </SectionBlock>
            )}

            {showUniversities && universities.length > 0 && (
              <SectionBlock
                title="Universities"
                count={universities.length}
                collapsed={collapsed.universities}
                onToggle={() => toggleCollapse('universities')}
                showCollapse={activeTab === 'all'}
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {universities.map((uni) => (
                    <UniversityCard key={uni.id} university={uni} />
                  ))}
                </div>
              </SectionBlock>
            )}

            {showCareers && careerSectors.length > 0 && (
              <SectionBlock
                title="Career sectors"
                count={careerSectors.length}
                collapsed={collapsed.careers}
                onToggle={() => toggleCollapse('careers')}
                showCollapse={activeTab === 'all'}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  {careerSectors.map((career) => (
                    <CareerSectorCard key={career.id} career={career} />
                  ))}
                </div>
              </SectionBlock>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionBlock({
  title,
  count,
  collapsed,
  onToggle,
  showCollapse,
  children,
}: {
  title: string
  count: number
  collapsed: boolean
  onToggle: () => void
  showCollapse: boolean
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2
          style={{
            fontSize: '1.25rem',
            color: 'var(--pf-grey-900)',
            margin: 0,
          }}
        >
          {title}{' '}
          <span
            className="pf-data-number"
            style={{ color: 'var(--pf-grey-600)', fontWeight: 400 }}
          >
            ({count})
          </span>
        </h2>
        {showCollapse && (
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-1"
            style={{
              color: 'var(--pf-blue-700)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Expand' : 'Collapse'}
            <svg
              className="w-4 h-4 transition-transform"
              style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>
      {!collapsed && children}
    </section>
  )
}

function SubjectResultCard({ subject }: { subject: SubjectWithArea }) {
  const areaName = subject.curricular_area?.name ?? null
  const dotColor = areaColor(areaName)

  const levels: string[] = []
  if (subject.is_available_n5) levels.push('N5')
  if (subject.is_available_higher) levels.push('Higher')
  if (subject.is_available_adv_higher) levels.push('Adv Higher')

  const skills = subject.skills_tags?.slice(0, 3) ?? []
  const descriptionSnippet = subject.description
    ? subject.description.length > 140
      ? `${subject.description.slice(0, 140).trim()}…`
      : subject.description
    : null

  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="block group no-underline hover:no-underline h-full"
    >
      <div
        className="pf-card-hover"
        style={{
          padding: 0,
          overflow: 'hidden',
          height: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '4px',
            backgroundColor: dotColor,
          }}
        />
        <div style={{ padding: '20px' }}>
          <div className="flex items-start gap-2 mb-2">
            <h3
              className="flex-1"
              style={{
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-900)',
                margin: 0,
              }}
            >
              {subject.name}
            </h3>
          </div>
          {areaName && (
            <div className="mb-3">
              <span
                className="pf-badge inline-flex items-center gap-1.5"
                style={{
                  backgroundColor: 'var(--pf-grey-100)',
                  color: 'var(--pf-grey-900)',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: dotColor,
                    display: 'inline-block',
                  }}
                />
                {areaName}
              </span>
            </div>
          )}
          {descriptionSnippet && (
            <p
              className="line-clamp-3"
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.875rem',
                marginBottom: '12px',
              }}
            >
              {descriptionSnippet}
            </p>
          )}
          {(levels.length > 0 || skills.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {levels.map((level) => (
                <span key={level} className="pf-badge-blue">
                  {level}
                </span>
              ))}
              {skills.map((skill) => (
                <span key={skill} className="pf-badge-grey">
                  {skill}
                </span>
              ))}
            </div>
          )}
          <span
            className="block text-center"
            style={{
              padding: '10px',
              fontSize: '0.875rem',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              color: 'var(--pf-blue-700)',
              backgroundColor: 'var(--pf-blue-100)',
              borderRadius: '6px',
            }}
          >
            View subject
          </span>
        </div>
      </div>
    </Link>
  )
}

function CareerSectorCard({ career }: { career: Tables<'career_sectors'> }) {
  return (
    <Link
      href={`/discover/career-search?q=${encodeURIComponent(career.name)}`}
      className="block group no-underline hover:no-underline h-full"
    >
      <div
        className="pf-card-hover"
        style={{ padding: '20px', height: '100%' }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex-shrink-0 rounded-lg flex items-center justify-center"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--pf-blue-100)',
              color: 'var(--pf-blue-700)',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3
            className="flex-1"
            style={{
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-900)',
              margin: 0,
            }}
          >
            {career.name}
          </h3>
        </div>
        {career.description && (
          <p
            className="line-clamp-3"
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.875rem',
              marginBottom: '12px',
            }}
          >
            {career.description}
          </p>
        )}
        <span
          className="inline-flex items-center gap-1"
          style={{
            color: 'var(--pf-blue-700)',
            fontSize: '0.8125rem',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}
        >
          Explore careers
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </span>
      </div>
    </Link>
  )
}

function EmptyPrompt() {
  return (
    <div className="text-center py-16">
      <div
        className="rounded-full flex items-center justify-center mx-auto mb-4"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'var(--pf-grey-100)',
        }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: 'var(--pf-grey-600)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h2 style={{ color: 'var(--pf-grey-900)', marginBottom: '8px' }}>
        Search Pathfinder
      </h2>
      <p style={{ color: 'var(--pf-grey-600)', margin: 0 }}>
        Enter at least 2 characters to search subjects, courses, universities and careers.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="pf-skeleton"
          style={{ borderRadius: '8px', height: '96px' }}
        />
      ))}
    </div>
  )
}

function ErrorState() {
  return (
    <div className="text-center py-16">
      <div
        className="rounded-full flex items-center justify-center mx-auto mb-4"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
        }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: 'var(--pf-red-500)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 style={{ color: 'var(--pf-grey-900)', marginBottom: '8px' }}>Search error</h2>
      <p style={{ color: 'var(--pf-grey-600)', margin: 0 }}>
        Something went wrong. Please try again.
      </p>
    </div>
  )
}

function NoResultsState({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <div
        className="rounded-full flex items-center justify-center mx-auto mb-4"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'var(--pf-grey-100)',
        }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: 'var(--pf-grey-600)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>
      <h2 style={{ color: 'var(--pf-grey-900)', marginBottom: '8px' }}>No results found</h2>
      <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
        We couldn&apos;t find anything matching &quot;{query}&quot;.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/subjects" className="pf-btn-secondary">
          Browse subjects
        </Link>
        <Link href="/courses" className="pf-btn-secondary">
          Browse courses
        </Link>
        <Link href="/discover" className="pf-btn-primary">
          Open Discover
        </Link>
      </div>
    </div>
  )
}
