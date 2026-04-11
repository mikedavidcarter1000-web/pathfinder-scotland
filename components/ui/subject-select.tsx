'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSubjects, type QualificationLevel, type SubjectWithArea } from '@/hooks/use-subjects'
import { getCurricularAreaColour } from '@/lib/constants'

interface SubjectSelectProps {
  level: QualificationLevel
  excludeIds?: string[]
  onSelect: (subject: { id: string; name: string; curricular_area: string | null }) => void
  placeholder?: string
}

// Searchable single-subject picker. Pulls from the subjects table filtered
// by qualification level, hides subjects already chosen, and surfaces the
// curricular area as a coloured pill next to each option.
export function SubjectSelect({
  level,
  excludeIds = [],
  onSelect,
  placeholder = 'Add a subject…',
}: SubjectSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIdx, setHighlightedIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: allSubjects, isLoading } = useSubjects({ level })

  const excludeSet = useMemo(() => new Set(excludeIds), [excludeIds])

  const filteredSubjects = useMemo<SubjectWithArea[]>(() => {
    if (!allSubjects) return []
    const needle = search.trim().toLowerCase()
    return allSubjects.filter((s) => {
      if (s.is_academy) return false
      if (excludeSet.has(s.id)) return false
      if (needle && !s.name.toLowerCase().includes(needle)) return false
      return true
    })
  }, [allSubjects, search, excludeSet])

  // Close the menu when the user clicks anywhere outside the component.
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Reset highlight whenever the visible list changes, so arrow keys always
  // start from the top of the filtered results.
  useEffect(() => {
    setHighlightedIdx(0)
  }, [search, allSubjects, excludeIds])

  const handleSelect = (subject: SubjectWithArea) => {
    onSelect({
      id: subject.id,
      name: subject.name,
      curricular_area: subject.curricular_area?.name ?? null,
    })
    setSearch('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlightedIdx((i) => Math.min(i + 1, filteredSubjects.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const pick = filteredSubjects[highlightedIdx]
      if (pick) handleSelect(pick)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--pf-grey-600)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={search}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          className="pf-input"
          style={{ paddingLeft: '36px' }}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="subject-select-listbox"
        />
      </div>

      {open && (
        <div
          id="subject-select-listbox"
          role="listbox"
          className="absolute z-30 mt-2 w-full rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--pf-white)',
            boxShadow: '0 10px 30px rgba(12, 74, 66, 0.15)',
            border: '1px solid var(--pf-grey-300)',
            maxHeight: '320px',
          }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
            {isLoading && (
              <div
                className="px-4 py-3"
                style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}
              >
                Loading subjects…
              </div>
            )}

            {!isLoading && filteredSubjects.length === 0 && (
              <div
                className="px-4 py-3"
                style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}
              >
                {search.trim()
                  ? `No subjects match "${search}".`
                  : 'No more subjects available.'}
              </div>
            )}

            {filteredSubjects.map((subject, idx) => {
              const areaName = subject.curricular_area?.name ?? null
              const palette = getCurricularAreaColour(areaName)
              const active = idx === highlightedIdx
              return (
                <button
                  key={subject.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(subject)}
                  onMouseEnter={() => setHighlightedIdx(idx)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--pf-teal-50)' : 'transparent',
                  }}
                >
                  <span
                    className="truncate"
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--pf-grey-900)',
                      fontWeight: 500,
                    }}
                  >
                    {subject.name}
                  </span>
                  {areaName && (
                    <span
                      className={`pf-area-badge ${palette.bg} ${palette.text}`}
                      style={{ flexShrink: 0 }}
                    >
                      {areaName}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
