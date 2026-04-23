'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { FeedbackWidget } from '@/components/ui/feedback-widget'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/hooks/use-auth'
import { useCurrentStudent, useStudentGrades, useGradeSummary } from '@/hooks/use-student'
import { useSubjectAreas, useToggleSaveCourse } from '@/hooks/use-courses'
import {
  calculateEligibility,
  type EligibilityDetail,
  type CourseRequirementRow,
} from '@/hooks/use-course-matching'
import { getSupabaseClient } from '@/lib/supabase'
import { EmptyState, EmptyStateIcons } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { ParentNotice } from '@/components/ui/parent-notice'
import { formatApproxSalary, pickCourseOutcomes } from '@/lib/outcomes'
import { useToast } from '@/components/ui/toast'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type StudentGrade = Tables<'student_grades'>
type University = Tables<'universities'>
type Course = Tables<'courses'> & { university: University }
type CourseWithEligibility = Course & {
  eligibility: EligibilityDetail | null
  requiredSubjectsForDisplay: string[]
}

// Coral brand accent for widening-access surfaces — spec'd in Task 13.
const CORAL = '#E8593C'

// Max-entry-requirement filter options. Each has a numeric ceiling derived
// from the grade sum (A=4, B=3, C=2, D=1). A course passes if its Highers
// requirement sums to ≤ ceiling.
const MAX_ENTRY_OPTIONS: { value: string; label: string; ceiling: number }[] = [
  { value: '', label: 'Any entry level', ceiling: Infinity },
  { value: 'AAAA', label: 'AAAA or lower', ceiling: 16 },
  { value: 'AAAB', label: 'AAAB or lower', ceiling: 15 },
  { value: 'AABB', label: 'AABB or lower', ceiling: 14 },
  { value: 'ABBB', label: 'ABBB or lower', ceiling: 13 },
  { value: 'BBBB', label: 'BBBB or lower', ceiling: 12 },
  { value: 'BBBC', label: 'BBBC or lower', ceiling: 11 },
  { value: 'BBCC', label: 'BBCC or lower', ceiling: 10 },
  { value: 'CCCC', label: 'CCCC or lower', ceiling: 8 },
]

const DEGREE_TYPE_LABELS: Record<string, string> = {
  bsc: 'BSc', ba: 'BA', ma: 'MA', beng: 'BEng', meng: 'MEng', llb: 'LLB',
  mbchb: 'MBChB', bds: 'BDS', bvm: 'BVM&S', bmus: 'BMus', bed: 'BEd', bnurs: 'BNurs',
}

const UNI_TYPE_LABELS: Record<string, string> = {
  ancient: 'Ancient',
  established: 'Established',
  modern: 'Modern',
  specialist: 'Specialist',
}

function gradeStringScore(grades: string | null | undefined): number {
  if (!grades) return 0
  const values: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 }
  let total = 0
  for (const ch of grades.toUpperCase()) total += values[ch] ?? 0
  return total
}

type SortKey = 'entry' | 'university' | 'duration'

// Fetch courses scoped to a single subject area. Gated on `subject` so the
// page doesn't pull the full 410-row catalogue before the user picks something.
function useCoursesBySubject(subject: string | null) {
  const supabase = getSupabaseClient()
  return useQuery<Course[]>({
    queryKey: ['compare-subjects-courses', subject],
    enabled: !!subject,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`*, university:universities(*)`)
        .eq('subject_area', subject!)
        .order('name')
      if (error) throw error
      return (data as unknown as Course[]) || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Same pattern as app/compare/page.tsx — fetch the relational requirements
// rows for just the course set in view.
function useRequirementsForCourses(courseIds: string[]) {
  const supabase = getSupabaseClient()
  const key = courseIds.slice().sort().join(',')
  return useQuery<CourseRequirementRow[]>({
    queryKey: ['compare-subjects-requirements', key],
    enabled: courseIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_subject_requirements')
        .select(
          `course_id, subject_id, qualification_level, min_grade, is_mandatory, subject:subjects(name)`
        )
        .in('course_id', courseIds)
      if (error) throw error
      type Row = {
        course_id: string
        subject_id: string
        qualification_level: string
        min_grade: string | null
        is_mandatory: boolean | null
        subject: { name: string } | null
      }
      return ((data as unknown as Row[]) || []).map((r) => ({
        course_id: r.course_id,
        subject_id: r.subject_id,
        subject_name: r.subject?.name ?? '',
        qualification_level: r.qualification_level,
        min_grade: r.min_grade,
        is_mandatory: r.is_mandatory ?? true,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}

export default function CompareSubjectsPage() {
  return (
    <>
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
        <CompareSubjectsContent />
      </Suspense>
      <FeedbackWidget />
    </>
  )
}

function CompareSubjectsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const { data: studentGrades } = useStudentGrades() as { data: StudentGrade[] | undefined }
  const gradeSummary = useGradeSummary()
  const toast = useToast()
  const { data: subjectAreas } = useSubjectAreas()
  const { toggle: toggleSave, isSaved, isPending: savePending } = useToggleSaveCourse()

  // Seed the selected subject from ?subject=... so bookmarks and deep links work.
  const initialSubject = searchParams.get('subject')
  const [subject, setSubject] = useState<string | null>(initialSubject)

  const [typeFilter, setTypeFilter] = useState<string>('')
  const [cityFilter, setCityFilter] = useState<string>('')
  const [degreeFilter, setDegreeFilter] = useState<string>('')
  const [maxEntry, setMaxEntry] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('entry')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const { data: courses = [], isLoading, error, refetch } = useCoursesBySubject(subject)

  const courseIds = useMemo(() => courses.map((c) => c.id), [courses])
  const { data: requirements = [] } = useRequirementsForCourses(courseIds)

  // Attach eligibility + the required-subjects list for display to every course
  // once per dependency change. Uses the same calculateEligibility the rest of
  // the app uses so the "Can I get in?" indicator stays consistent.
  const coursesWithEligibility = useMemo<CourseWithEligibility[]>(() => {
    const reqsByCourse = new Map<string, CourseRequirementRow[]>()
    for (const row of requirements) {
      const existing = reqsByCourse.get(row.course_id) ?? []
      existing.push(row)
      reqsByCourse.set(row.course_id, existing)
    }

    return courses.map((course) => {
      const reqs = reqsByCourse.get(course.id) ?? []
      const hasAnyGrades = (studentGrades?.length ?? 0) > 0
      const detail = hasAnyGrades
        ? calculateEligibility(course, reqs, studentGrades ?? [], student ?? null, gradeSummary.highers || '')
        : null

      // Prefer relational mandatory Highers; fall back to the JSONB list so
      // legacy courses without relational rows still display something.
      const mandatoryHigherNames = reqs
        .filter((r) => r.is_mandatory && r.qualification_level === 'higher' && r.subject_name)
        .map((r) => r.subject_name)
      const legacyRequired =
        (course.entry_requirements as { required_subjects?: string[] } | null)?.required_subjects ?? []
      const requiredSubjectsForDisplay =
        mandatoryHigherNames.length > 0 ? mandatoryHigherNames : legacyRequired

      return { ...course, eligibility: detail, requiredSubjectsForDisplay }
    })
  }, [courses, requirements, studentGrades, student, gradeSummary.highers])

  // Derive the filter dropdown contents from the courses actually on the page
  // so we only offer values that could return a non-empty result.
  const availableTypes = useMemo(() => {
    const set = new Set<string>()
    for (const c of courses) if (c.university?.university_type) set.add(c.university.university_type)
    return [...set].sort()
  }, [courses])
  const availableCities = useMemo(() => {
    const set = new Set<string>()
    for (const c of courses) if (c.university?.city) set.add(c.university.city)
    return [...set].sort()
  }, [courses])
  const availableDegreeTypes = useMemo(() => {
    const set = new Set<string>()
    for (const c of courses) if (c.degree_type) set.add(String(c.degree_type))
    return [...set].sort()
  }, [courses])

  const filteredCourses = useMemo(() => {
    let list = coursesWithEligibility
    if (typeFilter) list = list.filter((c) => c.university?.university_type === typeFilter)
    if (cityFilter) list = list.filter((c) => c.university?.city === cityFilter)
    if (degreeFilter) list = list.filter((c) => String(c.degree_type) === degreeFilter)
    if (maxEntry) {
      const ceiling = MAX_ENTRY_OPTIONS.find((o) => o.value === maxEntry)?.ceiling ?? Infinity
      list = list.filter((c) => {
        const req = (c.entry_requirements as { highers?: string } | null)?.highers
        if (!req) return true
        return gradeStringScore(req) <= ceiling
      })
    }
    return list
  }, [coursesWithEligibility, typeFilter, cityFilter, degreeFilter, maxEntry])

  const sortedCourses = useMemo(() => {
    const list = [...filteredCourses]
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'entry') {
        const ea = gradeStringScore((a.entry_requirements as { highers?: string } | null)?.highers)
        const eb = gradeStringScore((b.entry_requirements as { highers?: string } | null)?.highers)
        // Higher score = harder entry; ascending means easiest first, so sort by score asc.
        cmp = ea - eb
      } else if (sortKey === 'university') {
        cmp = (a.university?.name ?? '').localeCompare(b.university?.name ?? '')
      } else if (sortKey === 'duration') {
        cmp = (a.duration_years ?? 0) - (b.duration_years ?? 0)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [filteredCourses, sortKey, sortDir])

  const hasGrades = gradeSummary.totalGrades > 0
  const waEligible = Boolean(
    student &&
      ((student.simd_decile !== null && student.simd_decile !== undefined && student.simd_decile <= 4) ||
        student.care_experienced ||
        student.is_carer ||
        student.first_generation)
  )

  const handleSelectSubject = (value: string | null) => {
    setSubject(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('subject', value)
    else params.delete('subject')
    const query = params.toString()
    router.replace(query ? `/compare/subjects?${query}` : '/compare/subjects', { scroll: false })
  }

  const handleToggleSave = async (courseId: string) => {
    if (!user) {
      toast.info('Sign in to save courses')
      return
    }
    const wasSaved = isSaved(courseId)
    try {
      await toggleSave(courseId)
      toast.success(wasSaved ? 'Removed from saved' : 'Added to saved')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.'
      toast.error("Couldn't update saved courses", message)
    }
  }

  const handleSort = (next: SortKey) => {
    if (sortKey === next) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(next)
      setSortDir('asc')
    }
  }

  const clearAllFilters = () => {
    setTypeFilter('')
    setCityFilter('')
    setDegreeFilter('')
    setMaxEntry('')
  }

  const hasFilters = typeFilter || cityFilter || degreeFilter || maxEntry

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <ParentNotice>
        Compare entry requirements for a single subject across Scottish universities. Your child
        can sign in for personalised eligibility indicators.
      </ParentNotice>

      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <div className="mb-5 sm:mb-6">
            <h1 style={{ marginBottom: '4px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
              Compare by subject
            </h1>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
              Pick a subject to see entry requirements side-by-side across every Scottish university that
              offers it.
            </p>
          </div>

          <div className="mb-5">
            <SubjectAutocomplete
              options={subjectAreas ?? []}
              value={subject}
              onChange={handleSelectSubject}
            />
          </div>

          {subject && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by university type"
                className="pf-input"
              >
                <option value="">All university types</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {UNI_TYPE_LABELS[t] ?? t}
                  </option>
                ))}
              </select>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                aria-label="Filter by city"
                className="pf-input"
              >
                <option value="">All regions</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
                aria-label="Filter by degree type"
                className="pf-input"
              >
                <option value="">All degree types</option>
                {availableDegreeTypes.map((d) => (
                  <option key={d} value={d}>
                    {DEGREE_TYPE_LABELS[d] ?? d.toUpperCase()}
                  </option>
                ))}
              </select>
              <select
                value={maxEntry}
                onChange={(e) => setMaxEntry(e.target.value)}
                aria-label="Maximum entry requirement"
                className="pf-input"
              >
                {MAX_ENTRY_OPTIONS.map((opt) => (
                  <option key={opt.value || 'any'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasFilters && (
            <div className="mt-3">
              <button onClick={clearAllFilters} className="pf-btn-ghost pf-btn-sm">
                Clear filters
              </button>
            </div>
          )}

          {user && !hasGrades && subject && (
            <div
              className="mt-6 rounded-lg flex items-center gap-3"
              style={{
                padding: '16px',
                backgroundColor: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                style={{ color: 'var(--pf-amber-500)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="flex-1" style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
                Add your grades from the dashboard to see &quot;Can I get in?&quot; indicators on each course.
              </p>
              <Link href="/dashboard" className="pf-btn-secondary pf-btn-sm">
                Add grades
              </Link>
            </div>
          )}

          {waEligible && subject && (
            <div
              className="mt-4 rounded-lg flex items-center gap-3"
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(232,89,60,0.08)',
                border: `1px solid ${CORAL}40`,
              }}
            >
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '9999px',
                  backgroundColor: CORAL,
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                WA
              </span>
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
                Widening access offers are highlighted below — these are your adjusted entry requirements
                based on your profile.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {!subject && (
          <div className="pf-card">
            <EmptyState
              icon={EmptyStateIcons.search}
              title="Pick a subject to start"
              message="Search for a subject to compare entry requirements across Scottish universities."
            />
          </div>
        )}

        {subject && isLoading && (
          <div className="pf-card">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded pf-skeleton" />
              ))}
            </div>
          </div>
        )}

        {subject && !isLoading && error && (
          <ErrorState
            title="Couldn't load courses"
            message="Something went wrong loading courses for this subject."
            retryAction={() => refetch()}
          />
        )}

        {subject && !isLoading && !error && sortedCourses.length === 0 && (
          <div className="pf-card">
            <EmptyState
              icon={EmptyStateIcons.book}
              title={
                courses.length === 0
                  ? `No courses found for ${subject}`
                  : 'No courses match your filters'
              }
              message={
                courses.length === 0
                  ? 'Try a broader subject — or check back soon as we add more courses.'
                  : 'Relax some filters to see more courses.'
              }
              actionLabel={hasFilters ? 'Clear filters' : undefined}
              onAction={hasFilters ? clearAllFilters : undefined}
            />
          </div>
        )}

        {subject && !isLoading && !error && sortedCourses.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                {sortedCourses.length} {sortedCourses.length === 1 ? 'course' : 'courses'} offering{' '}
                <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>{subject}</span>
              </p>
            </div>

            <DesktopTable
              courses={sortedCourses}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              student={student ?? null}
              waEligible={waEligible}
              onSave={handleToggleSave}
              isSaved={isSaved}
              savePending={savePending}
            />

            <MobileCardList
              courses={sortedCourses}
              student={student ?? null}
              waEligible={waEligible}
              onSave={handleToggleSave}
              isSaved={isSaved}
              savePending={savePending}
            />
          </>
        )}
      </div>

    </div>
  )
}

// ----------------------------------------------------------
// Subject autocomplete (combobox)
// ----------------------------------------------------------

function SubjectAutocomplete({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [text, setText] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the input text in sync when the selected subject changes externally
  // (e.g. via URL navigation or the clear button).
  useEffect(() => {
    setText(value ?? '')
  }, [value])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase()
    if (!q) return options.slice(0, 50)
    return options.filter((o) => o.toLowerCase().includes(q)).slice(0, 50)
  }, [options, text])

  const commit = (chosen: string) => {
    setText(chosen)
    onChange(chosen)
    setOpen(false)
  }

  const clear = () => {
    setText('')
    onChange(null)
    inputRef.current?.focus()
    setOpen(true)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && filtered[highlight]) commit(filtered[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label
        htmlFor="compare-subject-input"
        className="block mb-2"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.875rem',
          color: 'var(--pf-grey-900)',
        }}
      >
        Subject
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="compare-subject-input"
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setHighlight(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="e.g. Computer Science, Medicine, Law..."
          className="pf-input"
          style={{ paddingRight: text ? '88px' : '48px' }}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="compare-subject-listbox"
        />
        <svg
          aria-hidden="true"
          className="w-5 h-5 pointer-events-none absolute top-1/2 -translate-y-1/2"
          style={{ right: text ? '56px' : '16px', color: 'var(--pf-grey-600)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {text && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear subject"
            className="absolute top-1/2 -translate-y-1/2 rounded-md inline-flex items-center justify-center"
            style={{
              right: '12px',
              minWidth: '36px',
              minHeight: '36px',
              color: 'var(--pf-grey-600)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul
          id="compare-subject-listbox"
          role="listbox"
          className="absolute z-40 mt-1 w-full overflow-auto"
          style={{
            backgroundColor: 'var(--pf-white)',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            maxHeight: '320px',
            padding: '4px 0',
          }}
        >
          {filtered.map((opt, idx) => {
            const isActive = idx === highlight
            const isSelected = value === opt
            return (
              <li
                key={opt}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  commit(opt)
                }}
                className="cursor-pointer"
                style={{
                  padding: '10px 16px',
                  fontSize: '0.9375rem',
                  backgroundColor: isActive ? 'var(--pf-blue-50)' : 'transparent',
                  color: isSelected ? 'var(--pf-blue-700)' : 'var(--pf-grey-900)',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {opt}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ----------------------------------------------------------
// Desktop comparison table
// ----------------------------------------------------------

type TableProps = {
  courses: CourseWithEligibility[]
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  onSort: (key: SortKey) => void
  student: Student | null
  waEligible: boolean
  onSave: (courseId: string) => void
  isSaved: (courseId: string) => boolean
  savePending: boolean
}

// Best-value id helpers for outcome columns. Highlights the single row that
// leads on a column; ties yield no highlight (the user shouldn't be told
// "this is better" when the numbers are identical).
function winningIdForOutcome(
  courses: CourseWithEligibility[],
  get: (c: CourseWithEligibility) => number | null,
  direction: 'higher' | 'lower'
): string | null {
  const pairs = courses
    .map((c) => ({ id: c.id, value: get(c) }))
    .filter((p): p is { id: string; value: number } => p.value !== null)
  if (pairs.length === 0) return null
  const best = pairs.reduce((acc, p) =>
    direction === 'higher' ? (p.value > acc.value ? p : acc) : (p.value < acc.value ? p : acc)
  )
  const allTied = pairs.every((p) => p.value === best.value)
  return allTied ? null : best.id
}

const OUTCOME_HIGHLIGHT_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(16, 185, 129, 0.08)',
  fontWeight: 600,
}

function DesktopTable({
  courses,
  sortKey,
  sortDir,
  onSort,
  waEligible,
  onSave,
  isSaved,
  savePending,
}: TableProps) {
  const anyEmployment = courses.some((c) => pickCourseOutcomes(c).employment_rate_15m !== null)
  const anySalary = courses.some((c) => pickCourseOutcomes(c).salary_median_3yr !== null)
  const anyRank = courses.some((c) => pickCourseOutcomes(c).subject_ranking_cug !== null)

  const employmentWinnerId = anyEmployment
    ? winningIdForOutcome(courses, (c) => pickCourseOutcomes(c).employment_rate_15m, 'higher')
    : null
  const salaryWinnerId = anySalary
    ? winningIdForOutcome(courses, (c) => pickCourseOutcomes(c).salary_median_3yr, 'higher')
    : null
  const rankWinnerId = anyRank
    ? winningIdForOutcome(courses, (c) => pickCourseOutcomes(c).subject_ranking_cug, 'lower')
    : null

  return (
    <div
      className="hidden md:block bg-white border rounded-xl overflow-hidden"
      style={{ borderColor: 'var(--pf-grey-200)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ fontSize: '0.875rem', minWidth: '900px' }}>
          <thead style={{ backgroundColor: 'var(--pf-blue-50)' }}>
            <tr>
              <SortableHeader label="University" active={sortKey === 'university'} dir={sortDir} onClick={() => onSort('university')} />
              <th style={thStyle}>Course</th>
              <SortableHeader label="Duration" active={sortKey === 'duration'} dir={sortDir} onClick={() => onSort('duration')} />
              <SortableHeader label="Standard entry" active={sortKey === 'entry'} dir={sortDir} onClick={() => onSort('entry')} />
              <th style={thStyle}>Your entry</th>
              {anyEmployment && <th style={thStyle}>Employment 15m</th>}
              {anySalary && <th style={thStyle}>Median salary 3yr</th>}
              {anyRank && <th style={thStyle}>Subject rank</th>}
              <th style={thStyle}>Required subjects</th>
              <th style={{ ...thStyle, textAlign: 'right' }} aria-label="Save" />
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const standard =
                (course.entry_requirements as { highers?: string } | null)?.highers ?? '—'
              const yourEntry = resolveYourEntry(course, waEligible)
              const indicator = gradeMatchIndicator(course.eligibility)
              const outcomes = pickCourseOutcomes(course)
              return (
                <tr key={course.id} style={{ borderTop: '1px solid var(--pf-grey-200)' }}>
                  <td style={tdStyle}>
                    <UniCell university={course.university} />
                  </td>
                  <td style={tdStyle}>
                    <CourseCell course={course} indicator={indicator} />
                  </td>
                  <td style={tdStyle}>
                    {course.duration_years ? `${course.duration_years} years` : '—'}
                  </td>
                  <td style={tdStyle}>
                    <code style={gradeCodeStyle}>{standard}</code>
                  </td>
                  <td style={tdStyle}>
                    <YourEntryCell standard={standard} your={yourEntry} isWa={yourEntry.isWa} />
                  </td>
                  {anyEmployment && (
                    <td
                      style={{
                        ...tdStyle,
                        ...(employmentWinnerId === course.id ? OUTCOME_HIGHLIGHT_STYLE : {}),
                      }}
                    >
                      {outcomes.employment_rate_15m !== null
                        ? `${outcomes.employment_rate_15m}%`
                        : '—'}
                    </td>
                  )}
                  {anySalary && (
                    <td
                      style={{
                        ...tdStyle,
                        ...(salaryWinnerId === course.id ? OUTCOME_HIGHLIGHT_STYLE : {}),
                      }}
                    >
                      {outcomes.salary_median_3yr !== null
                        ? formatApproxSalary(outcomes.salary_median_3yr)
                        : '—'}
                    </td>
                  )}
                  {anyRank && (
                    <td
                      style={{
                        ...tdStyle,
                        ...(rankWinnerId === course.id ? OUTCOME_HIGHLIGHT_STYLE : {}),
                      }}
                    >
                      {outcomes.subject_ranking_cug !== null
                        ? `#${outcomes.subject_ranking_cug}`
                        : '—'}
                    </td>
                  )}
                  <td style={tdStyle}>
                    <RequiredSubjectsCell items={course.requiredSubjectsForDisplay} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <SaveButton
                      saved={isSaved(course.id)}
                      pending={savePending}
                      onClick={() => onSave(course.id)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--pf-grey-600)',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'top',
  color: 'var(--pf-grey-900)',
}

const gradeCodeStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontWeight: 600,
  fontSize: '0.875rem',
  letterSpacing: '0.05em',
  backgroundColor: 'var(--pf-grey-100)',
  padding: '3px 8px',
  borderRadius: '4px',
  color: 'var(--pf-grey-900)',
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
}) {
  return (
    <th style={thStyle}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1"
        style={{
          color: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
          fontFamily: 'inherit',
          fontWeight: 600,
          fontSize: 'inherit',
          textTransform: 'inherit',
          letterSpacing: 'inherit',
        }}
        aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        {label}
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            transform: active && dir === 'desc' ? 'rotate(180deg)' : 'none',
            opacity: active ? 1 : 0.4,
          }}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </th>
  )
}

// ----------------------------------------------------------
// Mobile card list
// ----------------------------------------------------------

function MobileCardList({
  courses,
  waEligible,
  onSave,
  isSaved,
  savePending,
}: Omit<TableProps, 'sortKey' | 'sortDir' | 'onSort'>) {
  return (
    <div className="md:hidden flex flex-col gap-3">
      {courses.map((course) => {
        const standard = (course.entry_requirements as { highers?: string } | null)?.highers ?? '—'
        const yourEntry = resolveYourEntry(course, waEligible)
        const indicator = gradeMatchIndicator(course.eligibility)
        return (
          <div key={course.id} className="pf-card" style={{ padding: '16px' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <UniCell university={course.university} />
                <div className="mt-2">
                  <CourseCell course={course} indicator={indicator} />
                </div>
              </div>
              <SaveButton
                saved={isSaved(course.id)}
                pending={savePending}
                onClick={() => onSave(course.id)}
              />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3" style={{ fontSize: '0.875rem' }}>
              <div>
                <dt style={mobileLabel}>Duration</dt>
                <dd style={mobileValue}>
                  {course.duration_years ? `${course.duration_years} years` : '—'}
                </dd>
              </div>
              <div>
                <dt style={mobileLabel}>Standard entry</dt>
                <dd style={mobileValue}>
                  <code style={gradeCodeStyle}>{standard}</code>
                </dd>
              </div>
              <div className="col-span-2">
                <dt style={mobileLabel}>Your entry</dt>
                <dd style={mobileValue}>
                  <YourEntryCell standard={standard} your={yourEntry} isWa={yourEntry.isWa} />
                </dd>
              </div>
              {(() => {
                const outcomes = pickCourseOutcomes(course)
                const nodes: React.ReactNode[] = []
                if (outcomes.employment_rate_15m !== null) {
                  nodes.push(
                    <div key="emp">
                      <dt style={mobileLabel}>Employment 15m</dt>
                      <dd style={mobileValue}>{outcomes.employment_rate_15m}%</dd>
                    </div>
                  )
                }
                if (outcomes.salary_median_3yr !== null) {
                  nodes.push(
                    <div key="sal">
                      <dt style={mobileLabel}>Median salary 3yr</dt>
                      <dd style={mobileValue}>{formatApproxSalary(outcomes.salary_median_3yr)}</dd>
                    </div>
                  )
                }
                if (outcomes.subject_ranking_cug !== null) {
                  nodes.push(
                    <div key="rnk">
                      <dt style={mobileLabel}>Subject rank (UK)</dt>
                      <dd style={mobileValue}>#{outcomes.subject_ranking_cug}</dd>
                    </div>
                  )
                }
                return nodes
              })()}
              {course.requiredSubjectsForDisplay.length > 0 && (
                <div className="col-span-2">
                  <dt style={mobileLabel}>Required subjects</dt>
                  <dd style={mobileValue}>
                    <RequiredSubjectsCell items={course.requiredSubjectsForDisplay} />
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )
      })}
    </div>
  )
}

const mobileLabel: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: '0.6875rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--pf-grey-600)',
  fontWeight: 600,
  marginBottom: '4px',
}

const mobileValue: React.CSSProperties = {
  color: 'var(--pf-grey-900)',
  margin: 0,
}

// ----------------------------------------------------------
// Small presentational helpers used by both table + cards
// ----------------------------------------------------------

function UniCell({ university }: { university: University }) {
  const href = university?.slug ? `/universities/${university.slug}` : '/universities'
  return (
    <Link
      href={href}
      className="no-underline hover:underline"
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        color: 'var(--pf-blue-700)',
        fontSize: '0.9375rem',
      }}
    >
      {university?.name ?? 'Unknown'}
    </Link>
  )
}

function CourseCell({
  course,
  indicator,
}: {
  course: CourseWithEligibility
  indicator: { label: string; color: string; icon: 'check' | 'warn' | 'cross' } | null
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      {indicator && <IndicatorDot indicator={indicator} />}
      <div className="min-w-0">
        <div
          style={{
            fontWeight: 600,
            color: 'var(--pf-grey-900)',
            fontSize: '0.9375rem',
            overflowWrap: 'anywhere',
          }}
        >
          {course.name}
        </div>
        {course.ucas_code && (
          <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '2px' }}>
            UCAS {course.ucas_code}
          </div>
        )}
      </div>
    </div>
  )
}

function IndicatorDot({
  indicator,
}: {
  indicator: { label: string; color: string; icon: 'check' | 'warn' | 'cross' }
}) {
  return (
    <span
      title={indicator.label}
      aria-label={indicator.label}
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '9999px',
        backgroundColor: `${indicator.color}1A`,
        color: indicator.color,
        marginTop: '2px',
      }}
    >
      {indicator.icon === 'check' && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {indicator.icon === 'warn' && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
        </svg>
      )}
      {indicator.icon === 'cross' && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </span>
  )
}

function YourEntryCell({
  standard,
  your,
  isWa,
}: {
  standard: string
  your: { grades: string; isWa: boolean }
  isWa: boolean
}) {
  if (!your.grades || your.grades === '—') {
    return <span style={{ color: 'var(--pf-grey-600)' }}>—</span>
  }
  if (!isWa || your.grades === standard) {
    return <code style={gradeCodeStyle}>{your.grades}</code>
  }
  // WA-adjusted offer: coral highlight + WA badge.
  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <code
        style={{
          ...gradeCodeStyle,
          backgroundColor: `${CORAL}1A`,
          color: CORAL,
          borderBottom: `2px solid ${CORAL}`,
        }}
      >
        {your.grades}
      </code>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '0.6875rem',
          letterSpacing: '0.04em',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: CORAL,
          color: '#fff',
        }}
      >
        WA
      </span>
    </span>
  )
}

function RequiredSubjectsCell({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <span style={{ color: 'var(--pf-grey-600)' }}>—</span>
  }
  return (
    <ul className="flex flex-wrap gap-1" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((s) => (
        <li
          key={s}
          style={{
            fontSize: '0.75rem',
            padding: '3px 8px',
            borderRadius: '999px',
            backgroundColor: 'var(--pf-blue-50)',
            color: 'var(--pf-blue-700)',
            fontWeight: 500,
          }}
        >
          {s}
        </li>
      ))}
    </ul>
  )
}

function SaveButton({
  saved,
  pending,
  onClick,
}: {
  saved: boolean
  pending: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save course'}
      className="inline-flex items-center gap-1 rounded-md transition-colors"
      style={{
        minHeight: '40px',
        padding: '8px 12px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: '0.8125rem',
        backgroundColor: saved ? 'var(--pf-blue-700)' : 'transparent',
        color: saved ? 'var(--pf-white)' : 'var(--pf-blue-700)',
        border: `1px solid var(--pf-blue-700)`,
        cursor: pending ? 'wait' : 'pointer',
        opacity: pending ? 0.7 : 1,
      }}
    >
      <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}

// ----------------------------------------------------------
// Eligibility helpers
// ----------------------------------------------------------

// Pick the offer the student should see. For WA-eligible students we try the
// tightest (SIMD20 → SIMD40 → care_experienced) that actually has a published
// offer on this course; fall back to the standard offer when nothing narrower
// applies.
function resolveYourEntry(
  course: CourseWithEligibility,
  waEligible: boolean
): { grades: string; isWa: boolean } {
  const entry = (course.entry_requirements as { highers?: string } | null)?.highers ?? '—'
  if (!waEligible) return { grades: entry, isWa: false }

  const wa = course.widening_access_requirements as
    | { simd20_offer?: string; simd40_offer?: string; care_experienced_offer?: string; general_offer?: string }
    | null
  if (!wa) return { grades: entry, isWa: false }

  if (course.eligibility?.wideningOfferType === 'simd20' && wa.simd20_offer) {
    return { grades: wa.simd20_offer, isWa: wa.simd20_offer !== entry }
  }
  if (course.eligibility?.wideningOfferType === 'simd40' && wa.simd40_offer) {
    return { grades: wa.simd40_offer, isWa: wa.simd40_offer !== entry }
  }
  if (course.eligibility?.wideningOfferType === 'care_experienced' && wa.care_experienced_offer) {
    return { grades: wa.care_experienced_offer, isWa: wa.care_experienced_offer !== entry }
  }
  const adjusted = course.eligibility?.adjustedRequirement ?? null
  if (adjusted && adjusted !== entry) return { grades: adjusted, isWa: true }
  return { grades: entry, isWa: false }
}

function gradeMatchIndicator(
  eligibility: EligibilityDetail | null
): { label: string; color: string; icon: 'check' | 'warn' | 'cross' } | null {
  if (!eligibility) return null
  switch (eligibility.status) {
    case 'eligible':
      return { label: 'Your grades meet this course', color: 'var(--pf-green-500)', icon: 'check' }
    case 'eligible_via_wa':
      return { label: 'You meet the widening access offer', color: CORAL, icon: 'check' }
    case 'possible':
      return { label: 'Close — you may still be in with a chance', color: 'var(--pf-amber-500)', icon: 'warn' }
    case 'missing_subjects':
      return { label: 'Missing required subjects', color: 'var(--pf-amber-500)', icon: 'warn' }
    case 'ineligible':
      return { label: 'Your grades are below entry', color: '#DC2626', icon: 'cross' }
    default:
      return null
  }
}
