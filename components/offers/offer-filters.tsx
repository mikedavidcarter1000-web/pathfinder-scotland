'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { OfferCategory } from '@/types/offers'
import { CategoryIcon } from './offer-utils'

export type StageFilterValue =
  | ''
  | 's1_s4'
  | 's5_s6'
  | 'college'
  | 'undergraduate'
  | 'postgraduate'

const STAGE_OPTIONS: Array<{ value: StageFilterValue; label: string; apiStage: string | null }> = [
  { value: '', label: 'All stages', apiStage: null },
  { value: 's1_s4', label: 'S1-S4', apiStage: 's4' },
  { value: 's5_s6', label: 'S5-S6', apiStage: 's5' },
  { value: 'college', label: 'College', apiStage: 'college' },
  { value: 'undergraduate', label: 'University', apiStage: 'undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate', apiStage: 'postgraduate' },
]

export function stageFilterToApi(value: StageFilterValue): string | null {
  return STAGE_OPTIONS.find((o) => o.value === value)?.apiStage ?? null
}

export function deriveStageFromSchoolStage(
  schoolStage: string | null | undefined
): StageFilterValue {
  if (!schoolStage) return ''
  if (['s1', 's2', 's3', 's4'].includes(schoolStage)) return 's1_s4'
  if (['s5', 's6'].includes(schoolStage)) return 's5_s6'
  if (schoolStage === 'college') return 'college'
  if (schoolStage === 'mature' || schoolStage === 'undergraduate') return 'undergraduate'
  if (schoolStage === 'postgraduate') return 'postgraduate'
  return ''
}

interface OfferFiltersProps {
  categories: OfferCategory[]
  initialCategory?: string
  initialStage?: StageFilterValue
  initialSearch?: string
}

const ALL_CATEGORY = 'all'

export function OfferFilters({
  categories,
  initialCategory,
  initialStage,
  initialSearch,
}: OfferFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory ?? ALL_CATEGORY
  )
  const [stageFilter, setStageFilter] = useState<StageFilterValue>(initialStage ?? '')
  const [search, setSearch] = useState(initialSearch ?? '')
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync state from URL if the URL changes externally (back/forward, share link).
  useEffect(() => {
    const cat = searchParams.get('category') ?? ALL_CATEGORY
    const stg = (searchParams.get('stage') as StageFilterValue) ?? ''
    const q = searchParams.get('q') ?? ''
    setSelectedCategory(cat)
    setStageFilter(stg)
    setSearch(q)
  }, [searchParams])

  const updateUrl = useCallback(
    (next: { category?: string; stage?: StageFilterValue; q?: string }) => {
      const params = new URLSearchParams(searchParams.toString())
      const cat = next.category ?? selectedCategory
      const stg = next.stage ?? stageFilter
      const q = next.q ?? search

      if (cat && cat !== ALL_CATEGORY) params.set('category', cat)
      else params.delete('category')

      if (stg) params.set('stage', stg)
      else params.delete('stage')

      if (q.trim()) params.set('q', q.trim())
      else params.delete('q')

      // Reset pagination when filters change
      params.delete('page')

      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams, selectedCategory, stageFilter, search]
  )

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug)
    updateUrl({ category: slug })
  }

  const handleStageChange = (value: StageFilterValue) => {
    setStageFilter(value)
    updateUrl({ stage: value })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      updateUrl({ q: value })
    }, 300)
  }

  const clearAll = () => {
    setSelectedCategory(ALL_CATEGORY)
    setStageFilter('')
    setSearch('')
    router.replace(pathname, { scroll: false })
  }

  const filtersActive = useMemo(
    () => selectedCategory !== ALL_CATEGORY || !!stageFilter || !!search.trim(),
    [selectedCategory, stageFilter, search]
  )

  return (
    <section
      style={{
        backgroundColor: 'var(--pf-white)',
        position: 'sticky',
        top: 64,
        zIndex: 10,
        borderBottom: '1px solid var(--pf-grey-300)',
      }}
    >
      <div className="pf-container" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
        {/* Category pills */}
        <div
          className="flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'thin' }}
          role="tablist"
          aria-label="Offer categories"
        >
          <CategoryPill
            label="All"
            iconName={null}
            active={selectedCategory === ALL_CATEGORY}
            onClick={() => handleCategoryChange(ALL_CATEGORY)}
          />
          {categories.map((c) => (
            <CategoryPill
              key={c.slug}
              label={c.name}
              iconName={c.icon}
              active={selectedCategory === c.slug}
              onClick={() => handleCategoryChange(c.slug)}
            />
          ))}
        </div>

        {/* Stage dropdown + search */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <label className="flex flex-col">
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: 'var(--pf-grey-600)',
                marginBottom: '4px',
              }}
            >
              Stage
            </span>
            <select
              className="pf-input"
              style={{ minHeight: '40px', padding: '8px 12px', fontSize: '0.9375rem' }}
              value={stageFilter}
              onChange={(e) => handleStageChange(e.target.value as StageFilterValue)}
              aria-label="Filter by stage"
            >
              {STAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col sm:col-span-1 lg:col-span-2">
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: 'var(--pf-grey-600)',
                marginBottom: '4px',
              }}
            >
              Search
            </span>
            <div className="relative">
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--pf-grey-600)',
                  pointerEvents: 'none',
                  display: 'inline-flex',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search by name, brand, description..."
                className="pf-input"
                style={{
                  minHeight: '40px',
                  padding: '8px 12px 8px 36px',
                  fontSize: '0.9375rem',
                }}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Search offers"
              />
            </div>
          </label>
        </div>

        {filtersActive && (
          <div className="mt-3">
            <button
              type="button"
              onClick={clearAll}
              style={{
                color: 'var(--pf-blue-500)',
                fontSize: '0.8125rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function CategoryPill({
  label,
  iconName,
  active,
  onClick,
}: {
  label: string
  iconName: string | null
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="whitespace-nowrap rounded-full transition-colors inline-flex items-center gap-2"
      style={{
        padding: '8px 14px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: '0.875rem',
        border: '1px solid var(--pf-grey-300)',
        backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-white)',
        color: active ? '#fff' : 'var(--pf-grey-900)',
        borderColor: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-300)',
      }}
    >
      {iconName && <CategoryIcon name={iconName} size={14} strokeWidth={2} />}
      {label}
    </button>
  )
}
