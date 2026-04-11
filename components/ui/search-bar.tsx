'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDebouncedSearch, type SearchResults } from '@/hooks/use-search'

interface SearchBarProps {
  placeholder?: string
  autoFocus?: boolean
  showSuggestions?: boolean
  onSearch?: (query: string) => void
  className?: string
  ariaLabel?: string
  // Called when the user presses Escape or clicks clear-to-close. Used by the
  // navbar search overlay to collapse its expandable input on a single press.
  onClose?: () => void
}

type NavItem = {
  href: string
  kind: 'subject' | 'course' | 'university' | 'career'
}

const PER_TYPE_DROPDOWN_LIMIT = 5

const POPULAR_SEARCHES = [
  'Chemistry',
  'Medicine',
  'Engineering',
  'Psychology',
  'Computer Science',
]

const CURRICULAR_AREAS: { name: string; colorVar: string }[] = [
  { name: 'Languages', colorVar: 'var(--pf-area-languages)' },
  { name: 'Mathematics', colorVar: 'var(--pf-area-mathematics)' },
  { name: 'Sciences', colorVar: 'var(--pf-area-sciences)' },
  { name: 'Social Studies', colorVar: 'var(--pf-area-social)' },
  { name: 'Expressive Arts', colorVar: 'var(--pf-area-expressive)' },
  { name: 'Technologies', colorVar: 'var(--pf-area-technologies)' },
  { name: 'Religious and Moral Education', colorVar: 'var(--pf-area-rme)' },
  { name: 'Health and Wellbeing', colorVar: 'var(--pf-area-health)' },
]

const TOOLS = [
  { name: 'Discover', href: '/discover' },
  { name: 'Simulator', href: '/simulator' },
  { name: 'Plan Choices', href: '/pathways' },
]

function getAreaColor(name?: string | null): string {
  if (!name) return 'var(--pf-grey-300)'
  return CURRICULAR_AREAS.find((a) => a.name === name)?.colorVar ?? 'var(--pf-grey-300)'
}

export function SearchBar({
  placeholder = 'Search subjects, courses, universities, careers...',
  autoFocus = false,
  showSuggestions = true,
  onSearch,
  className = '',
  ariaLabel = 'Search',
  onClose,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: results, isLoading } = useDebouncedSearch(query, {
    enabled: showSuggestions && query.length >= 2,
  })

  // Live-filter parents via onSearch on every keystroke.
  useEffect(() => {
    if (onSearch) onSearch(query)
  }, [query, onSearch])

  // Close dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keep dropdown open whenever the input has focus.
  useEffect(() => {
    if (isFocused) setIsOpen(true)
  }, [isFocused])

  // Reset active index when results or query change.
  useEffect(() => {
    setActiveIndex(-1)
  }, [query, results])

  const subjects = (results?.subjects ?? []).slice(0, PER_TYPE_DROPDOWN_LIMIT)
  const courses = (results?.courses ?? []).slice(0, PER_TYPE_DROPDOWN_LIMIT)
  const universities = (results?.universities ?? []).slice(0, PER_TYPE_DROPDOWN_LIMIT)
  const careerSectors = (results?.careerSectors ?? []).slice(0, PER_TYPE_DROPDOWN_LIMIT)

  const totalResults =
    (results?.subjects.length ?? 0) +
    (results?.courses.length ?? 0) +
    (results?.universities.length ?? 0) +
    (results?.careerSectors.length ?? 0)

  const hasResults =
    subjects.length + courses.length + universities.length + careerSectors.length > 0

  const showEmptyState = showSuggestions && isOpen && query.length < 2
  const showResultsDropdown = showSuggestions && isOpen && query.length >= 2

  // Flat navigable list for keyboard navigation — order matches visual order.
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = []
    subjects.forEach((s) => items.push({ href: `/subjects/${s.id}`, kind: 'subject' }))
    courses.forEach((c) => items.push({ href: `/courses/${c.id}`, kind: 'course' }))
    universities.forEach((u) => items.push({ href: `/universities/${u.id}`, kind: 'university' }))
    careerSectors.forEach(() =>
      items.push({ href: `/discover/career-search?q=${encodeURIComponent(query)}`, kind: 'career' })
    )
    return items
  }, [subjects, courses, universities, careerSectors, query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeIndex >= 0 && activeIndex < navItems.length) {
      router.push(navItems[activeIndex].href)
      closeDropdown()
      return
    }
    if (query.trim()) {
      if (onSearch) {
        onSearch(query)
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
      closeDropdown()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      // Single Escape closes everything: clears query, closes the dropdown,
      // blurs the input, and fires onClose so a parent (e.g. the navbar) can
      // collapse its expandable search bar in the same keystroke.
      setQuery('')
      closeDropdown()
      inputRef.current?.blur()
      onClose?.()
      return
    }
    if (!isOpen) return
    if (!navItems.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % navItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? navItems.length - 1 : i - 1))
    }
  }

  const closeDropdown = () => {
    setIsOpen(false)
    setIsFocused(false)
    setActiveIndex(-1)
  }

  const handleResultClick = () => {
    closeDropdown()
  }

  // Cumulative index helpers so each rendered row knows its global position.
  let cursor = 0
  const subjectsStart = cursor
  cursor += subjects.length
  const coursesStart = cursor
  cursor += courses.length
  const universitiesStart = cursor
  cursor += universities.length
  const careersStart = cursor

  // Polite live-region message that screen readers announce when results
  // arrive. Empty string while typing/loading so we don't interrupt.
  const liveMessage = !showResultsDropdown
    ? ''
    : isLoading
      ? 'Searching…'
      : !hasResults
        ? `No results for ${query}`
        : `${totalResults} ${totalResults === 1 ? 'result' : 'results'} for ${query}`

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {liveMessage}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label={ariaLabel}
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="search-dropdown"
            className="w-full focus:outline-none"
            style={{
              backgroundColor: 'var(--pf-white)',
              border: `1px solid ${isFocused ? 'var(--pf-blue-500)' : 'var(--pf-grey-300)'}`,
              borderRadius: '8px',
              padding: '12px 44px 12px 44px',
              minHeight: '48px',
              fontSize: '1rem',
              color: 'var(--pf-grey-900)',
              boxShadow: isFocused ? '0 0 0 3px rgba(0, 114, 206, 0.15)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
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
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
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
      </form>

      {/* Empty-state suggestions */}
      {showEmptyState && (
        <div
          id="search-dropdown"
          role="listbox"
          className="absolute z-50 w-full mt-2 overflow-hidden animate-slide-down"
          style={{
            backgroundColor: 'var(--pf-white)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--pf-grey-100)',
          }}
        >
          <div className="p-4">
            <SectionHeader label="Popular searches" />
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term)
                    inputRef.current?.focus()
                  }}
                  className="pf-badge-blue transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  {term}
                </button>
              ))}
            </div>

            <SectionHeader label="Explore by area" />
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {CURRICULAR_AREAS.map((area) => (
                <Link
                  key={area.name}
                  href={`/subjects?area=${encodeURIComponent(area.name)}`}
                  onClick={handleResultClick}
                  className="pf-badge inline-flex items-center gap-1.5 no-underline"
                  style={{
                    backgroundColor: 'var(--pf-grey-100)',
                    color: 'var(--pf-grey-900)',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: area.colorVar,
                      display: 'inline-block',
                    }}
                  />
                  {area.name}
                </Link>
              ))}
            </div>

            <SectionHeader label="Try our tools" />
            <div className="flex flex-wrap gap-2 mt-2">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={handleResultClick}
                  className="pf-badge-grey no-underline"
                  style={{ cursor: 'pointer' }}
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results dropdown */}
      {showResultsDropdown && (
        <div
          id="search-dropdown"
          role="listbox"
          className="absolute z-50 w-full mt-2 overflow-hidden animate-slide-down"
          style={{
            backgroundColor: 'var(--pf-white)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--pf-grey-100)',
          }}
        >
          <div
            className="overflow-y-auto scrollbar-thin"
            style={{ maxHeight: '400px' }}
          >
            {isLoading ? (
              <div
                className="p-4 text-center"
                style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem' }}
              >
                <svg
                  className="animate-spin w-5 h-5 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Searching...
              </div>
            ) : !hasResults ? (
              <div className="p-6 text-center">
                <p
                  style={{
                    color: 'var(--pf-grey-900)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    fontSize: '0.9375rem',
                  }}
                >
                  No results found for &quot;{query}&quot;
                </p>
                <p
                  style={{
                    color: 'var(--pf-grey-600)',
                    fontSize: '0.8125rem',
                    marginBottom: '12px',
                  }}
                >
                  Try one of these instead:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCHES.slice(0, 3).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term)
                        inputRef.current?.focus()
                      }}
                      className="pf-badge-blue"
                      style={{ cursor: 'pointer' }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {subjects.length > 0 && (
                  <section>
                    <SectionHeader label="Subjects" />
                    {subjects.map((subject, i) => {
                      const areaName = subject.curricular_area?.name ?? null
                      const globalIdx = subjectsStart + i
                      return (
                        <ResultRow
                          key={subject.id}
                          href={`/subjects/${subject.id}`}
                          active={globalIdx === activeIndex}
                          onHover={() => setActiveIndex(globalIdx)}
                          onClick={handleResultClick}
                        >
                          <span
                            aria-hidden
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: getAreaColor(areaName),
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate"
                              style={{
                                fontWeight: 500,
                                color: 'var(--pf-grey-900)',
                                fontSize: '0.9375rem',
                                margin: 0,
                              }}
                            >
                              {subject.name}
                            </p>
                            {areaName && (
                              <p
                                className="truncate"
                                style={{
                                  color: 'var(--pf-grey-600)',
                                  fontSize: '0.75rem',
                                  margin: 0,
                                }}
                              >
                                {areaName}
                              </p>
                            )}
                          </div>
                        </ResultRow>
                      )
                    })}
                  </section>
                )}

                {courses.length > 0 && (
                  <section>
                    <SectionHeader label="Courses" />
                    {courses.map((course, i) => {
                      const globalIdx = coursesStart + i
                      return (
                        <ResultRow
                          key={course.id}
                          href={`/courses/${course.id}`}
                          active={globalIdx === activeIndex}
                          onHover={() => setActiveIndex(globalIdx)}
                          onClick={handleResultClick}
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate"
                              style={{
                                fontWeight: 500,
                                color: 'var(--pf-grey-900)',
                                fontSize: '0.9375rem',
                                margin: 0,
                              }}
                            >
                              {course.name}
                            </p>
                            {course.university?.name && (
                              <p
                                className="truncate"
                                style={{
                                  color: 'var(--pf-grey-600)',
                                  fontSize: '0.75rem',
                                  margin: 0,
                                }}
                              >
                                {course.university.name}
                              </p>
                            )}
                          </div>
                        </ResultRow>
                      )
                    })}
                  </section>
                )}

                {universities.length > 0 && (
                  <section>
                    <SectionHeader label="Universities" />
                    {universities.map((uni, i) => {
                      const globalIdx = universitiesStart + i
                      return (
                        <ResultRow
                          key={uni.id}
                          href={`/universities/${uni.id}`}
                          active={globalIdx === activeIndex}
                          onHover={() => setActiveIndex(globalIdx)}
                          onClick={handleResultClick}
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate"
                              style={{
                                fontWeight: 500,
                                color: 'var(--pf-grey-900)',
                                fontSize: '0.9375rem',
                                margin: 0,
                              }}
                            >
                              {uni.name}
                            </p>
                            {uni.city && (
                              <p
                                className="truncate"
                                style={{
                                  color: 'var(--pf-grey-600)',
                                  fontSize: '0.75rem',
                                  margin: 0,
                                }}
                              >
                                {uni.city}
                              </p>
                            )}
                          </div>
                        </ResultRow>
                      )
                    })}
                  </section>
                )}

                {careerSectors.length > 0 && (
                  <section>
                    <SectionHeader label="Career sectors" />
                    {careerSectors.map((career, i) => {
                      const globalIdx = careersStart + i
                      return (
                        <ResultRow
                          key={career.id}
                          href={`/discover/career-search?q=${encodeURIComponent(career.name)}`}
                          active={globalIdx === activeIndex}
                          onHover={() => setActiveIndex(globalIdx)}
                          onClick={handleResultClick}
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate"
                              style={{
                                fontWeight: 500,
                                color: 'var(--pf-grey-900)',
                                fontSize: '0.9375rem',
                                margin: 0,
                              }}
                            >
                              {career.name}
                            </p>
                            {career.description && (
                              <p
                                className="truncate"
                                style={{
                                  color: 'var(--pf-grey-600)',
                                  fontSize: '0.75rem',
                                  margin: 0,
                                }}
                              >
                                {career.description}
                              </p>
                            )}
                          </div>
                        </ResultRow>
                      )
                    })}
                  </section>
                )}
              </>
            )}
          </div>

          {hasResults && !isLoading && (
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={handleResultClick}
              className="block text-center no-underline"
              style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--pf-grey-100)',
                color: 'var(--pf-blue-700)',
                backgroundColor: 'var(--pf-blue-50)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {totalResults} {totalResults === 1 ? 'result' : 'results'} found · View all
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '8px 16px 6px',
        fontSize: '0.6875rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--pf-grey-600)',
        backgroundColor: 'var(--pf-grey-100)',
      }}
    >
      {label}
    </div>
  )
}

interface ResultRowProps {
  href: string
  active: boolean
  onHover: () => void
  onClick: () => void
  children: React.ReactNode
}

function ResultRow({ href, active, onHover, onClick, children }: ResultRowProps) {
  return (
    <Link
      href={href}
      onMouseEnter={onHover}
      onClick={onClick}
      role="option"
      aria-selected={active}
      className="flex items-center gap-3 no-underline"
      style={{
        padding: '10px 16px',
        backgroundColor: active ? 'var(--pf-blue-50)' : 'transparent',
        transition: 'background-color 0.12s',
      }}
    >
      {children}
    </Link>
  )
}
