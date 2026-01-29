'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDebouncedSearch } from '@/hooks/use-search'

interface SearchBarProps {
  placeholder?: string
  autoFocus?: boolean
  showSuggestions?: boolean
  onSearch?: (query: string) => void
  className?: string
}

export function SearchBar({
  placeholder = 'Search courses, universities, subjects...',
  autoFocus = false,
  showSuggestions = true,
  onSearch,
  className = '',
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: results, isLoading } = useDebouncedSearch(query, {
    enabled: showSuggestions && query.length >= 2,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query)
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`)
      }
      setIsOpen(false)
    }
  }

  const handleFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Open dropdown when results arrive
  useEffect(() => {
    if (results && query.length >= 2) {
      setIsOpen(true)
    }
  }, [results, query])

  const courses = results?.courses || []
  const universities = results?.universities || []
  const hasResults = courses.length > 0 || universities.length > 0

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
                setIsOpen(false)
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <svg className="animate-spin w-5 h-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Searching...
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <>
              {/* Courses */}
              {courses.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    Courses
                  </div>
                  {courses.slice(0, 5).map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-gray-900 text-sm">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.university?.name}</p>
                    </Link>
                  ))}
                </div>
              )}

              {/* Universities */}
              {universities.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    Universities
                  </div>
                  {universities.slice(0, 3).map((uni) => (
                    <Link
                      key={uni.id}
                      href={`/universities/${uni.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-gray-900 text-sm">{uni.name}</p>
                      <p className="text-xs text-gray-500">{uni.city}</p>
                    </Link>
                  ))}
                </div>
              )}

              {/* View All Link */}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm text-center text-blue-600 hover:bg-blue-50 border-t border-gray-100 font-medium"
              >
                View all results for &quot;{query}&quot;
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
