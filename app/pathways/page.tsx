'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { usePathways, useCareerSectors, type Stage, type SubjectWithArea } from '@/hooks/use-subjects'
import {
  getCurricularAreaColour,
  QUALIFICATION_LEVEL_LABELS,
} from '@/lib/constants'
import type { Tables } from '@/types/database'

type YearGoingInto = 's3' | 's4' | 's5' | 's6'

const YEAR_BUTTONS: Array<{ value: YearGoingInto; label: string; subtitle: string }> = [
  { value: 's3', label: 'S3', subtitle: 'Third year' },
  { value: 's4', label: 'S4', subtitle: 'National 5 year' },
  { value: 's5', label: 'S5', subtitle: 'Higher year' },
  { value: 's6', label: 'S6', subtitle: 'Advanced Higher year' },
]

// The usePathways hook takes the student's CURRENT stage (the one they are in now).
// The UI asks "what year are you going INTO", so we map target → current.
const YEAR_TO_CURRENT_STAGE: Record<YearGoingInto, Stage> = {
  s3: 's2',
  s4: 's3',
  s5: 's4',
  s6: 's5',
}

// Match a compulsory subject name from the rule against a subject row.
// The rule uses short names like "English" or "Mathematics", but the
// subjects table may have slight variations. Try exact, then prefix match.
function matchesCompulsory(compulsoryName: string, subjectName: string): boolean {
  const c = compulsoryName.trim().toLowerCase()
  const s = subjectName.trim().toLowerCase()
  if (c === s) return true
  if (s.startsWith(c + ' ') || s.startsWith(c + '(')) return true
  // Handle "Maths" vs "Mathematics"
  if (c === 'maths' && s === 'mathematics') return true
  if (c === 'mathematics' && s === 'maths') return true
  return false
}

export default function PathwaysPage() {
  const router = useRouter()
  const [yearGoingInto, setYearGoingInto] = useState<YearGoingInto | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set())
  const [showBreadthTip, setShowBreadthTip] = useState(false)
  const [subjectSearch, setSubjectSearch] = useState('')
  const [shakenId, setShakenId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current)
    }
  }, [])

  const flashCompulsory = (subject: SubjectWithArea) => {
    setShakenId(subject.id)
    setToast(`${subject.name} is compulsory and included automatically.`)
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    shakeTimerRef.current = setTimeout(() => setShakenId(null), 500)
    toastTimerRef.current = setTimeout(() => setToast(null), 2500)
  }
  // Fixed-length array of 3 slots for ranked academy picks (null = empty slot)
  const [academyRankings, setAcademyRankings] = useState<(string | null)[]>([null, null, null])

  const currentStage = yearGoingInto ? YEAR_TO_CURRENT_STAGE[yearGoingInto] : null
  const { data: pathway, isLoading } = usePathways(currentStage)
  const { data: careerSectors } = useCareerSectors()

  // Track which stage we've applied pre-selection for so we don't overwrite
  // user selections when React Query refetches the same data.
  const appliedStageRef = useRef<YearGoingInto | null>(null)

  // Expand all curricular areas by default when pathway loads
  useEffect(() => {
    if (pathway?.subjectsByArea) {
      setExpandedAreas(new Set(pathway.subjectsByArea.map((g) => g.area.id)))
    }
  }, [pathway?.stage, pathway?.subjectsByArea])

  // Reset + pre-select compulsory subjects when the user changes stage
  useEffect(() => {
    if (!yearGoingInto) {
      setSelectedIds(new Set())
      setAcademyRankings([])
      appliedStageRef.current = null
      return
    }

    if (!pathway?.rule || !pathway?.subjectsByArea) return

    // Skip if we've already seeded selections for this stage (prevents
    // user selections being wiped when React Query refetches).
    if (appliedStageRef.current === yearGoingInto) return

    const compulsoryNames = pathway.rule.compulsory_subjects || []
    const allSubjects = pathway.subjectsByArea.flatMap((g) => g.subjects)
    const toPreselect = allSubjects
      .filter((s) => compulsoryNames.some((cn) => matchesCompulsory(cn, s.name)))
      .map((s) => s.id)

    setSelectedIds(new Set(toPreselect))
    setAcademyRankings([null, null, null])
    appliedStageRef.current = yearGoingInto
  }, [yearGoingInto, pathway?.rule, pathway?.subjectsByArea])

  const compulsoryIds = useMemo(() => {
    if (!pathway?.rule || !pathway?.subjectsByArea) return new Set<string>()
    const names = pathway.rule.compulsory_subjects || []
    const allSubjects = pathway.subjectsByArea.flatMap((g) => g.subjects)
    return new Set(
      allSubjects
        .filter((s) => names.some((cn) => matchesCompulsory(cn, s.name)))
        .map((s) => s.id)
    )
  }, [pathway?.rule, pathway?.subjectsByArea])

  const selectedSubjects = useMemo(() => {
    if (!pathway) return [] as SubjectWithArea[]
    const all = pathway.subjectsByArea.flatMap((g) => g.subjects)
    return all.filter((s) => selectedIds.has(s.id))
  }, [pathway, selectedIds])

  const toggleSubject = (subject: SubjectWithArea) => {
    if (compulsoryIds.has(subject.id)) {
      flashCompulsory(subject)
      return
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(subject.id)) {
        next.delete(subject.id)
        return next
      }
      const currentFreeCount = Math.max(0, prev.size - compulsoryIds.size)
      if (freeRequired > 0 && currentFreeCount >= freeRequired) {
        return prev
      }
      next.add(subject.id)
      return next
    })
  }

  const toggleArea = (areaId: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev)
      if (next.has(areaId)) next.delete(areaId)
      else next.add(areaId)
      return next
    })
  }

  const totalRequired = pathway?.rule?.total_subjects ?? 0
  const freeRequired = pathway?.rule?.num_free_choices ?? 0
  const reserveCount = pathway?.rule?.num_reserves ?? 0
  const compulsoryNames = pathway?.rule?.compulsory_subjects || []
  const selectedFreeCount = Math.max(0, selectedIds.size - compulsoryIds.size)
  const limitReached = freeRequired > 0 && selectedFreeCount >= freeRequired

  return (
    <div className="bg-gray-50">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full shadow-lg bg-gray-900 text-white text-sm font-medium animate-fade-in"
        >
          {toast}
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Plan Your Subject Choices</h1>
            <button
              type="button"
              aria-label="Close"
              onClick={goBack}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600">
            Explore how different subject combinations shape your qualifications and future career options.
          </p>
        </div>
      </div>

      {/* Stage Selector */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Step 1 — What year are you going into?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {YEAR_BUTTONS.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setYearGoingInto(btn.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  yearGoingInto === btn.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <div
                  className={`text-2xl font-bold ${
                    yearGoingInto === btn.value ? 'text-blue-700' : 'text-gray-900'
                  }`}
                >
                  {btn.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{btn.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Loading state for pathway data */}
        {yearGoingInto && isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-pulse text-gray-500">Loading your pathway options...</div>
          </div>
        )}

        {/* Main planning UI */}
        {yearGoingInto && !isLoading && pathway && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: picker + rules */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sticky progress bar */}
              <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-gray-50/95 backdrop-blur border-b border-gray-200">
                <ProgressHeader
                  selectedFreeCount={selectedFreeCount}
                  freeRequired={freeRequired}
                  compulsoryCount={compulsoryIds.size}
                  totalRequired={totalRequired}
                />
              </div>

              {/* Simplified rules panel */}
              <RulesPanel
                rule={pathway.rule}
                yearLabel={YEAR_BUTTONS.find((y) => y.value === yearGoingInto)?.label ?? ''}
                showBreadthTip={showBreadthTip}
                onToggleBreadthTip={() => setShowBreadthTip((v) => !v)}
                freeRequired={freeRequired}
                reserveCount={reserveCount}
                compulsoryNames={compulsoryNames}
              />

              {/* Curricular area picker */}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Step 2 — Pick your subjects
                  </h2>
                </div>

                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Search for a subject..."
                    className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {subjectSearch && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSubjectSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {limitReached && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      You&apos;ve made all your choices. Deselect a subject to swap it.
                    </span>
                  </div>
                )}

                {(() => {
                  const needle = subjectSearch.trim().toLowerCase()
                  const filteredGroups = needle
                    ? pathway.subjectsByArea
                        .map((g) => ({
                          ...g,
                          subjects: g.subjects.filter((s) =>
                            s.name.toLowerCase().includes(needle)
                          ),
                        }))
                        .filter((g) => g.subjects.length > 0)
                    : pathway.subjectsByArea

                  if (filteredGroups.length === 0) {
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <p className="text-sm text-gray-500">
                          No subjects match &quot;{subjectSearch}&quot;. Try a different term.
                        </p>
                      </div>
                    )
                  }

                  return filteredGroups.map((group) => {
                  const areaColour = getCurricularAreaColour(group.area.name)
                  const expanded = expandedAreas.has(group.area.id) || !!needle
                  const areaSelectedCount = group.subjects.filter((s) =>
                    selectedIds.has(s.id)
                  ).length

                  return (
                    <div
                      key={group.area.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleArea(group.area.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${areaColour.bg} ${areaColour.text}`}
                          >
                            {group.area.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {group.subjects.length} subjects
                            {areaSelectedCount > 0 && (
                              <span className="ml-2 text-blue-600 font-medium">
                                · {areaSelectedCount} selected
                              </span>
                            )}
                          </span>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expanded && (
                        <div className="border-t border-gray-100 divide-y divide-gray-100">
                          {group.subjects.map((subject) => {
                            const isSelected = selectedIds.has(subject.id)
                            const isCompulsory = compulsoryIds.has(subject.id)
                            return (
                              <SubjectRow
                                key={subject.id}
                                subject={subject}
                                selected={isSelected}
                                compulsory={isCompulsory}
                                disabled={!isSelected && !isCompulsory && limitReached}
                                shaken={shakenId === subject.id}
                                areaColour={areaColour}
                                onToggle={() => toggleSubject(subject)}
                              />
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                  })
                })()}
              </div>

              {/* Academies — shown as a separate Step 3 when going into S3 */}
              {yearGoingInto === 's3' && pathway.academySubjects.length > 0 && (
                <AcademyPicker
                  academies={pathway.academySubjects}
                  rankings={academyRankings}
                  onChange={setAcademyRankings}
                />
              )}
            </div>

            {/* Right: pathway preview */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4">
                <PathwayPreview
                  selectedSubjects={selectedSubjects}
                  totalRequired={totalRequired}
                  totalSectors={careerSectors?.length ?? 0}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Progress header (sticky)
// ──────────────────────────────────────────────────────────────────────────

function ProgressHeader({
  selectedFreeCount,
  freeRequired,
  compulsoryCount,
  totalRequired,
}: {
  selectedFreeCount: number
  freeRequired: number
  compulsoryCount: number
  totalRequired: number
}) {
  const percent = freeRequired > 0
    ? Math.min(100, (selectedFreeCount / freeRequired) * 100)
    : 0
  const complete = selectedFreeCount >= freeRequired && freeRequired > 0

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${complete ? 'text-green-600' : 'text-gray-900'}`}>
            {selectedFreeCount} of {freeRequired}
          </span>
          <span className="text-sm text-gray-500">choices made</span>
          {complete && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              All picked
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          + {compulsoryCount} compulsory = {totalRequired} total
        </span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            complete ? 'bg-green-500' : 'bg-blue-600'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Simplified, student-friendly rules panel
// ──────────────────────────────────────────────────────────────────────────

function RulesPanel({
  rule,
  yearLabel,
  showBreadthTip,
  onToggleBreadthTip,
  freeRequired,
  reserveCount,
  compulsoryNames,
}: {
  rule: Tables<'course_choice_rules'> | null
  yearLabel: string
  showBreadthTip: boolean
  onToggleBreadthTip: () => void
  freeRequired: number
  reserveCount: number
  compulsoryNames: string[]
}) {
  if (!rule) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500 text-sm">No choice rules found for this transition.</p>
      </div>
    )
  }

  const nonExamined = rule.non_examined_core || []
  const specialRules = rule.special_rules || []

  // Build the student-friendly headline sentence
  const headline = compulsoryNames.length > 0
    ? `Pick ${freeRequired} subjects — ${compulsoryNames.join(' and ')} ${compulsoryNames.length === 1 ? 'is' : 'are'} already sorted for you.`
    : `Pick ${freeRequired} subjects.`

  const reserveText = reserveCount > 0
    ? `Choose ${reserveCount} reserve${reserveCount > 1 ? 's' : ''} in case your top picks aren't available.`
    : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-base font-semibold text-gray-900">
          Going into {yearLabel}
        </h2>
      </div>

      {/* Friendly headline */}
      <p className="text-gray-700 leading-relaxed">
        {headline}
      </p>
      {reserveText && (
        <p className="text-gray-700 leading-relaxed mt-1">{reserveText}</p>
      )}

      {/* Non-examined core as subtle note */}
      {nonExamined.length > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          You&apos;ll also have {nonExamined.join(', ')} timetabled — these don&apos;t count toward your choices.
        </p>
      )}

      {/* Collapsible breadth tip */}
      {rule.breadth_requirements && (
        <div className="mt-4">
          <button
            onClick={onToggleBreadthTip}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showBreadthTip ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Tip for picking a balanced mix
          </button>
          {showBreadthTip && (
            <p className="mt-2 p-3 bg-blue-50 text-sm text-blue-900 rounded-lg border border-blue-100">
              {rule.breadth_requirements}
            </p>
          )}
        </div>
      )}

      {/* Special rules as compact info badges */}
      {specialRules.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {specialRules.map((srule, idx) => (
            <span
              key={idx}
              className="inline-flex items-start gap-1.5 max-w-full px-2.5 py-1 rounded-lg text-xs bg-amber-50 border border-amber-200 text-amber-900"
              title={srule}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="leading-snug">{srule}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Subject row
// ──────────────────────────────────────────────────────────────────────────

function SubjectRow({
  subject,
  selected,
  compulsory,
  disabled,
  shaken,
  areaColour,
  onToggle,
}: {
  subject: SubjectWithArea
  selected: boolean
  compulsory: boolean
  disabled: boolean
  shaken: boolean
  areaColour: { bg: string; text: string; border: string; bar: string; dot: string }
  onToggle: () => void
}) {
  const truncatedDescription = subject.description
    ? subject.description.length > 80
      ? subject.description.slice(0, 80).trim() + '…'
      : subject.description
    : null

  return (
    <div
      className={`transition-colors ${
        selected ? 'bg-blue-50' : disabled ? 'bg-gray-50/60' : 'hover:bg-gray-50'
      } ${shaken ? 'animate-shake' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={selected}
        title={compulsory ? `${subject.name} is compulsory and included automatically.` : undefined}
        className={`w-full text-left px-5 py-3 flex items-start gap-3 ${
          disabled ? 'cursor-not-allowed opacity-50' : compulsory ? 'cursor-help' : 'cursor-pointer'
        }`}
      >
        <span
          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${
            selected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300'
          } ${compulsory ? 'opacity-80' : ''}`}
          aria-hidden="true"
        >
          {selected && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`w-2 h-2 rounded-full ${areaColour.dot}`}
              aria-hidden="true"
              title={subject.curricular_area?.name ?? ''}
            />
            <span className="text-sm font-medium text-gray-900">{subject.name}</span>
            {compulsory && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-gray-200 text-gray-700">
                Compulsory
              </span>
            )}
            <Link
              href={`/subjects/${subject.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:text-blue-700 ml-auto"
            >
              Details →
            </Link>
          </div>
          {truncatedDescription && (
            <p className="text-xs text-gray-500 mt-1 ml-4 line-clamp-1">{truncatedDescription}</p>
          )}
        </div>
      </button>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Academy picker — S3 only
// ──────────────────────────────────────────────────────────────────────────

function AcademyPicker({
  academies,
  rankings,
  onChange,
}: {
  academies: SubjectWithArea[]
  rankings: (string | null)[]
  onChange: (rankings: (string | null)[]) => void
}) {
  const rankOf = (id: string) => rankings.indexOf(id) // -1 if not ranked
  const isRanked = (id: string) => rankOf(id) !== -1

  const setRank = (id: string, newRank: number) => {
    // Start by clearing this id from any existing slot
    const next = rankings.map((r) => (r === id ? null : r))
    if (newRank >= 0 && newRank < 3) {
      // If the target slot is occupied, bump that id out
      next[newRank] = id
    }
    onChange(next)
  }

  const clearRank = (id: string) => {
    onChange(rankings.map((r) => (r === id ? null : r)))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Step 3 — Choose your Academy</h2>
        <p className="text-sm text-gray-600 mt-1">
          Rank your top 3 Academy choices. Not all options run every year, so having reserves helps.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {academies.map((academy) => {
          const rank = rankOf(academy.id)
          const ranked = isRanked(academy.id)
          return (
            <div
              key={academy.id}
              className={`rounded-xl border p-5 transition-all ${
                ranked
                  ? 'border-purple-400 bg-purple-50/50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-purple-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">{academy.name}</h3>
                {ranked && (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold">
                    {rank + 1}
                  </span>
                )}
              </div>

              {academy.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{academy.description}</p>
              )}

              {academy.why_choose && (
                <div className="mb-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                    Why choose this
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">{academy.why_choose}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <label className="text-xs font-medium text-gray-600">Rank:</label>
                <select
                  value={ranked ? rank + 1 : ''}
                  onChange={(e) => {
                    const v = e.target.value
                    if (!v) clearRank(academy.id)
                    else setRank(academy.id, parseInt(v, 10) - 1)
                  }}
                  className="text-sm px-2 py-1 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">—</option>
                  <option value="1">1st choice</option>
                  <option value="2">2nd choice</option>
                  <option value="3">3rd choice</option>
                </select>
                {ranked && (
                  <button
                    type="button"
                    onClick={() => clearRank(academy.id)}
                    className="text-xs text-gray-500 hover:text-red-600 ml-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {rankings.some((r) => r !== null) && (
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-sm font-medium text-purple-900 mb-1">Your ranking</p>
          <ol className="text-sm text-purple-800 space-y-0.5">
            {rankings.map((id, idx) => {
              if (!id) return null
              const academy = academies.find((a) => a.id === id)
              if (!academy) return null
              return (
                <li key={id}>
                  <span className="font-semibold">{idx + 1}.</span> {academy.name}
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Pathway preview sidebar
// ──────────────────────────────────────────────────────────────────────────

function PathwayPreview({
  selectedSubjects,
  totalRequired,
  totalSectors,
}: {
  selectedSubjects: SubjectWithArea[]
  totalRequired: number
  totalSectors: number
}) {
  const supabase = getSupabaseClient()
  const selectedIds = selectedSubjects.map((s) => s.id)
  const selectedNames = selectedSubjects.map((s) => s.name)

  const { data: sectorLinks } = useQuery({
    queryKey: ['pathway-preview-sectors', selectedIds.sort().join(',')],
    queryFn: async () => {
      if (selectedIds.length === 0) return []
      const { data, error } = await supabase
        .from('subject_career_sectors')
        .select('subject_id, career_sector:career_sectors(id, name)')
        .in('subject_id', selectedIds)
      if (error) throw error
      return (
        (data as unknown as Array<{
          subject_id: string
          career_sector: { id: string; name: string } | null
        }>) || []
      )
    },
    enabled: selectedIds.length > 0,
  })

  const { data: matchingCourses } = useQuery({
    queryKey: ['pathway-preview-courses', selectedNames.sort().join(',')],
    queryFn: async () => {
      if (selectedNames.length === 0) return []
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, entry_requirements, university:universities(id, name)')
        .not('entry_requirements', 'is', null)
        .limit(2000)
      if (error) throw error

      const lowerNames = selectedNames.map((n) => n.toLowerCase())
      type Row = {
        id: string
        name: string
        entry_requirements: { required_subjects?: string[] } | null
        university: { id: string; name: string } | null
      }
      return ((data as unknown as Row[]) || []).filter((c) => {
        const req = c.entry_requirements?.required_subjects
        if (!req || req.length === 0) return false
        return req.some((r) => lowerNames.includes(r.toLowerCase()))
      })
    },
    enabled: selectedNames.length > 0,
  })

  const uniqueSectors = useMemo(() => {
    if (!sectorLinks) return [] as Array<{ id: string; name: string }>
    const map = new Map<string, { id: string; name: string }>()
    for (const link of sectorLinks) {
      if (link.career_sector) map.set(link.career_sector.id, link.career_sector)
    }
    return Array.from(map.values())
  }, [sectorLinks])

  if (selectedSubjects.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Your pathway preview</h3>
        <p className="text-sm text-gray-500">
          Select subjects to see where they lead, which university courses open up, and which career sectors you&apos;d cover.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selected summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-semibold text-blue-900">Your selection</h3>
          <span className="text-sm text-blue-700">
            {selectedSubjects.length} / {totalRequired}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedSubjects.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-blue-200 text-blue-800"
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* Where these subjects lead */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          Where these subjects lead
        </h3>
        <ul className="space-y-2">
          {selectedSubjects.map((s) => {
            const nextLevel = s.is_available_adv_higher
              ? 'Advanced Higher'
              : s.is_available_higher
              ? 'Higher'
              : s.is_available_n5
              ? QUALIFICATION_LEVEL_LABELS.n5
              : null
            return (
              <li key={s.id} className="flex items-start gap-2 text-sm">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>
                  <span className="font-medium text-gray-900">{s.name}</span>
                  {nextLevel ? (
                    <span className="text-gray-600"> → {nextLevel}</span>
                  ) : (
                    <span className="text-gray-500"> (elective)</span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Matching university courses */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          University courses you could apply for
        </h3>
        {matchingCourses === undefined ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : matchingCourses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No courses in our database list these subjects as explicit requirements yet.
          </p>
        ) : (
          <ul className="space-y-2 max-h-56 overflow-y-auto">
            {matchingCourses.slice(0, 10).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/courses/${c.id}`}
                  className="block text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="font-medium text-gray-900 line-clamp-1">{c.name}</div>
                  {c.university && (
                    <div className="text-xs text-gray-500 line-clamp-1">{c.university.name}</div>
                  )}
                </Link>
              </li>
            ))}
            {matchingCourses.length > 10 && (
              <li className="text-xs text-gray-500 pt-1 text-center">
                and {matchingCourses.length - 10} more...
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Career sectors covered */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Career sectors covered
          </h3>
          {totalSectors > 0 && (
            <span className="text-xs text-gray-500">
              {uniqueSectors.length} / {totalSectors}
            </span>
          )}
        </div>
        {uniqueSectors.length === 0 ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {uniqueSectors.map((sec) => (
              <span
                key={sec.id}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                {sec.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        This tool is for exploration only — your actual subject choices are recorded through the dashboard.
      </p>
    </div>
  )
}
