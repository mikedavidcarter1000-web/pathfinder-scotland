'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import {
  usePathways,
  useCareerSectors,
  useStudentSubjectChoices,
  useStudentAcademyChoices,
  useSaveSubjectChoices,
  type Stage,
  type SubjectWithArea,
  type ChoiceTransition,
} from '@/hooks/use-subjects'
import { useAuth } from '@/hooks/use-auth'
import {
  getCurricularAreaColour,
  QUALIFICATION_LEVEL_LABELS,
} from '@/lib/constants'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { useToast } from '@/components/ui/toast'
import { SubmitButton } from '@/components/ui/submit-button'
import type { Tables } from '@/types/database'

type YearGoingInto = 's3' | 's4' | 's5' | 's6'

const YEAR_TO_TRANSITION: Record<YearGoingInto, ChoiceTransition> = {
  s3: 's2_to_s3',
  s4: 's3_to_s4',
  s5: 's4_to_s5',
  s6: 's5_to_s6',
}

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
  const [yearGoingInto, setYearGoingInto] = useState<YearGoingInto | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set())
  const [showBreadthTip, setShowBreadthTip] = useState(false)
  const [subjectSearch, setSubjectSearch] = useState('')
  const [shakenId, setShakenId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const { user } = useAuth()
  const pfToast = useToast()
  const currentStage = yearGoingInto ? YEAR_TO_CURRENT_STAGE[yearGoingInto] : null
  const currentTransition = yearGoingInto ? YEAR_TO_TRANSITION[yearGoingInto] : null
  const { data: pathway, isLoading } = usePathways(currentStage)
  const { data: careerSectors } = useCareerSectors()
  const { data: savedChoices, isLoading: savedChoicesLoading } = useStudentSubjectChoices(
    currentTransition ?? undefined
  )
  const { data: savedAcademyChoices } = useStudentAcademyChoices()
  const saveChoices = useSaveSubjectChoices()

  // Track which stage we've applied pre-selection for so we don't overwrite
  // user selections when React Query refetches the same data.
  const appliedStageRef = useRef<YearGoingInto | null>(null)

  // Expand all curricular areas by default when pathway loads
  useEffect(() => {
    if (pathway?.subjectsByArea) {
      setExpandedAreas(new Set(pathway.subjectsByArea.map((g) => g.area.id)))
    }
  }, [pathway?.stage, pathway?.subjectsByArea])

  // Reset + pre-select compulsory subjects when the user changes stage.
  // When the student is signed in, also merge any previously saved picks for
  // this transition so the planner resumes where they left off.
  useEffect(() => {
    if (!yearGoingInto) {
      setSelectedIds(new Set())
      setAcademyRankings([])
      appliedStageRef.current = null
      return
    }

    if (!pathway?.rule || !pathway?.subjectsByArea) return

    // Wait for the saved-choices query to resolve before seeding so signed-in
    // students don't briefly see the unsaved (compulsory-only) state.
    if (user && savedChoicesLoading) return

    // Skip if we've already seeded selections for this stage (prevents
    // user selections being wiped when React Query refetches).
    if (appliedStageRef.current === yearGoingInto) return

    const compulsoryNames = pathway.rule.compulsory_subjects || []
    const allSubjects = pathway.subjectsByArea.flatMap((g) => g.subjects)
    const compulsoryIdList = allSubjects
      .filter((s) => compulsoryNames.some((cn) => matchesCompulsory(cn, s.name)))
      .map((s) => s.id)

    // Merge saved picks (if any) with compulsory — compulsory always applies.
    const savedIds = (savedChoices || [])
      .map((c) => c.subject_id)
      .filter((id) => allSubjects.some((s) => s.id === id))

    setSelectedIds(new Set<string>([...compulsoryIdList, ...savedIds]))

    if (yearGoingInto === 's3' && savedAcademyChoices && savedAcademyChoices.length > 0) {
      const slots: (string | null)[] = [null, null, null]
      for (const choice of savedAcademyChoices) {
        const slot = choice.rank_order - 1
        if (slot >= 0 && slot < 3) slots[slot] = choice.subject_id
      }
      setAcademyRankings(slots)
    } else {
      setAcademyRankings([null, null, null])
    }

    appliedStageRef.current = yearGoingInto
  }, [
    yearGoingInto,
    pathway?.rule,
    pathway?.subjectsByArea,
    user,
    savedChoicesLoading,
    savedChoices,
    savedAcademyChoices,
  ])

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
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in"
          style={{
            padding: '10px 20px',
            borderRadius: '9999px',
            boxShadow: '0 8px 24px rgba(0, 45, 114, 0.25)',
            backgroundColor: 'var(--pf-blue-900)',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {toast}
        </div>
      )}
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '8px' }}>
            Plan Your Subject Choices
          </h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
            Explore how different subject combinations shape your qualifications and future career options.
          </p>
        </div>
      </div>

      {/* Stage Selector */}
      <div className="pf-container pt-6 sm:pt-8 pb-12 sm:pb-16">
        <div className="pf-card mb-6">
          <h2 style={{ marginBottom: '16px', fontSize: 'clamp(1.125rem, 3vw, 1.5rem)' }}>
            Step 1 — What year are you going into?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {YEAR_BUTTONS.map((btn) => {
              const active = yearGoingInto === btn.value
              return (
                <button
                  key={btn.value}
                  onClick={() => setYearGoingInto(btn.value)}
                  className="text-left transition-all"
                  style={{
                    padding: '14px',
                    minHeight: '80px',
                    borderRadius: '8px',
                    backgroundColor: active ? 'var(--pf-blue-50)' : 'var(--pf-white)',
                    border: active ? '2px solid var(--pf-blue-700)' : '2px solid var(--pf-grey-300)',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.375rem',
                      color: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-900)',
                    }}
                  >
                    {btn.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--pf-grey-600)',
                      marginTop: '4px',
                    }}
                  >
                    {btn.subtitle}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading state for pathway data */}
        {yearGoingInto && isLoading && (
          <>
            <div className="pf-card mb-6">
              <Skeleton width="50%" height={22} rounded="md" />
              <div style={{ height: '12px' }} />
              <Skeleton variant="text" lines={3} />
            </div>
            <div className="pf-card">
              <Skeleton width="40%" height={22} rounded="md" />
              <div style={{ height: '16px' }} />
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton width={20} height={20} rounded="sm" />
                    <Skeleton width="60%" height={18} rounded="sm" />
                  </div>
                ))}
              </div>
            </div>
            <SlowLoadingNotice isLoading={isLoading} />
          </>
        )}

        {/* Main planning UI */}
        {yearGoingInto && !isLoading && pathway && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: picker + rules */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sticky progress bar */}
              <div
                className="sticky z-20 -mx-4 px-4 py-3 backdrop-blur"
                style={{
                  top: '64px',
                  backgroundColor: 'rgba(240, 250, 248, 0.95)',
                  borderBottom: '1px solid var(--pf-grey-300)',
                }}
              >
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
                  <h2>Step 2 — Pick your subjects</h2>
                </div>

                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--pf-grey-600)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Search for a subject..."
                    aria-label="Search subjects in pathway planner"
                    className="pf-input w-full"
                    style={{ paddingLeft: '36px', paddingRight: '44px' }}
                  />
                  {subjectSearch && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSubjectSearch('')}
                      className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center"
                      style={{ color: 'var(--pf-grey-600)', minWidth: '44px', minHeight: '44px' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {limitReached && (
                  <div
                    className="flex items-start gap-2 rounded-lg"
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: 'var(--pf-green-500)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ color: 'var(--pf-grey-900)' }}>
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
                      <div className="pf-card p-8 text-center">
                        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
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
                      className="pf-card-flat"
                      style={{ overflow: 'hidden' }}
                    >
                      <button
                        onClick={() => toggleArea(group.area.id)}
                        className="w-full flex items-center justify-between transition-colors"
                        style={{ padding: '16px 20px' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`pf-area-badge ${areaColour.bg} ${areaColour.text}`}>
                            {group.area.name}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                            {group.subjects.length} {group.subjects.length === 1 ? 'subject' : 'subjects'}
                            {areaSelectedCount > 0 && (
                              <span
                                className="ml-2"
                                style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                              >
                                · {areaSelectedCount} selected
                              </span>
                            )}
                          </span>
                        </div>
                        <svg
                          className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                          style={{ color: 'var(--pf-grey-600)' }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expanded && (
                        <div style={{ borderTop: '1px solid var(--pf-grey-100)' }} className="divide-y divide-[var(--pf-grey-100)]">

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

              {/* Save / sign-in prompt — planner works without saving, but
                  signed-in students can persist their picks per transition. */}
              <SaveChoicesPanel
                isSignedIn={!!user}
                isSaving={saveChoices.isPending}
                hasSelection={selectedIds.size > 0}
                onSave={async () => {
                  if (!currentTransition) return
                  const orderedFreeIds = Array.from(selectedIds).filter(
                    (id) => !compulsoryIds.has(id)
                  )
                  try {
                    await saveChoices.mutateAsync({
                      transition: currentTransition,
                      subjectIds: orderedFreeIds,
                      academyRankings:
                        yearGoingInto === 's3' ? academyRankings : undefined,
                    })
                    pfToast.success('Choices saved', 'Your subject plan is up to date.')
                  } catch (err) {
                    const message =
                      err instanceof Error ? err.message : 'Please try again.'
                    pfToast.error("Couldn't save choices", message)
                  }
                }}
              />
            </div>

            {/* Right: pathway preview — sticky on desktop, stacks below picker on mobile */}
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
          <span
            className="pf-data-number"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: complete ? 'var(--pf-green-500)' : 'var(--pf-grey-900)',
            }}
          >
            {selectedFreeCount} of {freeRequired}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>choices made</span>
          {complete && (
            <span className="pf-badge-green inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              All picked
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
          + {compulsoryCount} compulsory = {totalRequired} total
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ height: '10px', backgroundColor: 'var(--pf-grey-100)' }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: complete ? 'var(--pf-green-500)' : 'var(--pf-blue-500)',
          }}
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
      <div className="pf-card">
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem' }}>
          No choice rules found for this transition.
        </p>
      </div>
    )
  }

  const nonExamined = rule.non_examined_core || []
  const specialRules = rule.special_rules || []

  const headline = compulsoryNames.length > 0
    ? `Pick ${freeRequired} subjects — ${compulsoryNames.join(' and ')} ${compulsoryNames.length === 1 ? 'is' : 'are'} already sorted for you.`
    : `Pick ${freeRequired} subjects.`

  const reserveText = reserveCount > 0
    ? `Choose ${reserveCount} reserve${reserveCount > 1 ? 's' : ''} in case your top picks aren't available.`
    : null

  return (
    <div
      className="rounded-lg"
      style={{
        backgroundColor: 'var(--pf-blue-50)',
        border: '1px solid var(--pf-blue-100)',
        padding: '20px',
      }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Going into {yearLabel}</h3>
      </div>

      <p style={{ color: 'var(--pf-grey-900)', lineHeight: 1.6 }}>{headline}</p>
      {reserveText && (
        <p style={{ color: 'var(--pf-grey-900)', lineHeight: 1.6, marginTop: '4px' }}>
          {reserveText}
        </p>
      )}

      {nonExamined.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '12px' }}>
          You&apos;ll also have {nonExamined.join(', ')} timetabled — these don&apos;t count toward your choices.
        </p>
      )}

      {rule.breadth_requirements && (
        <div className="mt-4">
          <button
            onClick={onToggleBreadthTip}
            className="inline-flex items-center gap-1.5"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--pf-blue-700)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
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
            <p
              className="mt-2 rounded-lg"
              style={{
                padding: '12px',
                backgroundColor: 'var(--pf-blue-100)',
                color: 'var(--pf-blue-900)',
                fontSize: '0.875rem',
              }}
            >
              {rule.breadth_requirements}
            </p>
          )}
        </div>
      )}

      {specialRules.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {specialRules.map((srule, idx) => (
            <span
              key={idx}
              className="inline-flex items-start gap-1.5 max-w-full rounded-lg"
              style={{
                padding: '6px 10px',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: 'var(--pf-grey-900)',
              }}
              title={srule}
            >
              <svg
                className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--pf-amber-500)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

  const rowBg = selected
    ? 'var(--pf-blue-100)'
    : disabled
    ? 'var(--pf-grey-100)'
    : 'transparent'

  return (
    <div
      className={`transition-colors ${shaken ? 'animate-shake' : ''}`}
      style={{ backgroundColor: rowBg }}
      onMouseEnter={(e) => {
        if (!selected && !disabled) e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = rowBg
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={selected}
        title={compulsory ? `${subject.name} is compulsory and included automatically.` : undefined}
        className={`w-full text-left flex items-center gap-3 ${
          disabled ? 'cursor-not-allowed' : compulsory ? 'cursor-help' : 'cursor-pointer'
        }`}
        style={{
          padding: '14px 20px',
          minHeight: '56px',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span
          className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: selected ? 'var(--pf-blue-700)' : 'transparent',
            border: selected ? '2px solid var(--pf-blue-700)' : '2px solid var(--pf-grey-300)',
            color: '#fff',
            opacity: compulsory ? 0.8 : 1,
          }}
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
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: disabled ? 'var(--pf-grey-600)' : 'var(--pf-grey-900)' }}>
              {subject.name}
            </span>
            {compulsory && (
              <span className="pf-badge-grey" style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Compulsory
              </span>
            )}
            <Link
              href={`/subjects/${subject.id}`}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto"
              style={{ fontSize: '0.75rem', color: 'var(--pf-blue-700)', fontWeight: 600 }}
            >
              Details →
            </Link>
          </div>
          {truncatedDescription && (
            <p
              className="line-clamp-1 mt-1 ml-4"
              style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}
            >
              {truncatedDescription}
            </p>
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
        <h2>Step 3 — Choose your Academy</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
          Rank your top 3 Academy choices. Not all options run every year, so having reserves helps.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {academies.map((academy) => {
          const rank = rankOf(academy.id)
          const ranked = isRanked(academy.id)
          return (
            <div
              key={academy.id}
              className="rounded-lg transition-all"
              style={{
                padding: '20px',
                backgroundColor: ranked ? 'var(--pf-blue-50)' : 'var(--pf-white)',
                border: ranked ? '2px solid var(--pf-blue-500)' : '1px solid var(--pf-grey-300)',
                boxShadow: ranked ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{academy.name}</h3>
                {ranked && (
                  <span
                    className="inline-flex items-center justify-center rounded-full"
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: 'var(--pf-blue-700)',
                      color: '#fff',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 700,
                    }}
                  >
                    {rank + 1}
                  </span>
                )}
              </div>

              {academy.description && (
                <p
                  className="line-clamp-3 mb-3"
                  style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}
                >
                  {academy.description}
                </p>
              )}

              {academy.why_choose && (
                <div className="mb-3 pt-3" style={{ borderTop: '1px solid var(--pf-grey-100)' }}>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--pf-blue-700)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px',
                    }}
                  >
                    Why choose this
                  </p>
                  <p
                    className="line-clamp-3"
                    style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}
                  >
                    {academy.why_choose}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--pf-grey-600)' }}>
                  Rank:
                </label>
                <select
                  value={ranked ? rank + 1 : ''}
                  onChange={(e) => {
                    const v = e.target.value
                    if (!v) clearRank(academy.id)
                    else setRank(academy.id, parseInt(v, 10) - 1)
                  }}
                  className="pf-input"
                  style={{ width: 'auto', padding: '6px 10px', fontSize: '0.875rem' }}
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
                    className="ml-auto"
                    style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}
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
        <div
          className="rounded-lg"
          style={{
            padding: '16px',
            backgroundColor: 'var(--pf-blue-50)',
            border: '1px solid var(--pf-blue-100)',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--pf-blue-900)',
              marginBottom: '4px',
            }}
          >
            Your ranking
          </p>
          <ol style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }} className="space-y-0.5">
            {rankings.map((id, idx) => {
              if (!id) return null
              const academy = academies.find((a) => a.id === id)
              if (!academy) return null
              return (
                <li key={id}>
                  <span style={{ fontWeight: 600 }}>{idx + 1}.</span> {academy.name}
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

  // Use the course_subject_requirements junction table to compute both full
  // and partial matches for the user's current subject selection. We fetch
  // every mandatory Higher-level requirement from the DB and bucket courses
  // by (a) "all mandatory requirements satisfied" → full match,
  // (b) "some satisfied, some missing" → partial match.
  type CourseMatch = {
    course: {
      id: string
      name: string
      university: { id: string; name: string } | null
    }
    requiredSubjects: Array<{ id: string; name: string }>
    satisfiedSubjects: Array<{ id: string; name: string }>
    missingSubjects: Array<{ id: string; name: string }>
  }

  const { data: courseMatches } = useQuery<{
    full: CourseMatch[]
    partial: CourseMatch[]
  }>({
    queryKey: ['pathway-preview-course-matches', selectedIds.sort().join(',')],
    queryFn: async () => {
      if (selectedIds.length === 0) return { full: [], partial: [] }

      const { data, error } = await supabase
        .from('course_subject_requirements')
        .select(
          `
          subject_id,
          is_mandatory,
          qualification_level,
          subject:subjects(id, name),
          course:courses(
            id,
            name,
            university:universities(id, name)
          )
        `
        )
        .eq('qualification_level', 'higher')
        .eq('is_mandatory', true)
      if (error) throw error

      type Row = {
        subject_id: string
        is_mandatory: boolean | null
        qualification_level: string
        subject: { id: string; name: string } | null
        course: {
          id: string
          name: string
          university: { id: string; name: string } | null
        } | null
      }

      // Group requirements by course
      const byCourse = new Map<
        string,
        {
          course: NonNullable<Row['course']>
          requiredSubjects: Array<{ id: string; name: string }>
        }
      >()
      for (const row of ((data as unknown as Row[]) || [])) {
        if (!row.course || !row.subject) continue
        const entry = byCourse.get(row.course.id) ?? {
          course: row.course,
          requiredSubjects: [] as Array<{ id: string; name: string }>,
        }
        if (!entry.requiredSubjects.some((s) => s.id === row.subject!.id)) {
          entry.requiredSubjects.push({ id: row.subject.id, name: row.subject.name })
        }
        byCourse.set(row.course.id, entry)
      }

      const selectedSet = new Set(selectedIds)
      const full: CourseMatch[] = []
      const partial: CourseMatch[] = []

      for (const entry of byCourse.values()) {
        const satisfied = entry.requiredSubjects.filter((s) => selectedSet.has(s.id))
        const missing = entry.requiredSubjects.filter((s) => !selectedSet.has(s.id))
        if (satisfied.length === 0) continue
        const match: CourseMatch = {
          course: entry.course,
          requiredSubjects: entry.requiredSubjects,
          satisfiedSubjects: satisfied,
          missingSubjects: missing,
        }
        if (missing.length === 0) full.push(match)
        else partial.push(match)
      }

      full.sort((a, b) => a.course.name.localeCompare(b.course.name))
      partial.sort((a, b) => {
        // Fewer missing subjects first
        if (a.missingSubjects.length !== b.missingSubjects.length) {
          return a.missingSubjects.length - b.missingSubjects.length
        }
        return a.course.name.localeCompare(b.course.name)
      })

      return { full, partial }
    },
    enabled: selectedIds.length > 0,
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
      <div className="pf-card text-center">
        <div
          className="rounded-full flex items-center justify-center mx-auto mb-3"
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--pf-blue-100)',
          }}
        >
          <svg
            className="w-6 h-6"
            style={{ color: 'var(--pf-blue-700)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 style={{ marginBottom: '4px' }}>Your pathway preview</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
          Select subjects to see where they lead, which university courses open up, and which career sectors you&apos;d cover.
        </p>
      </div>
    )
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--pf-grey-600)',
    fontWeight: 600,
    marginBottom: '12px',
  }

  return (
    <div className="space-y-4">
      {/* Selected summary */}
      <div
        className="rounded-lg"
        style={{
          padding: '16px',
          backgroundColor: 'var(--pf-blue-100)',
        }}
      >
        <div className="flex items-baseline justify-between mb-1">
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--pf-blue-900)' }}>Your selection</h3>
          <span
            className="pf-data-number"
            style={{ fontSize: '0.875rem', color: 'var(--pf-blue-700)', fontWeight: 600 }}
          >
            {selectedSubjects.length} / {totalRequired}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedSubjects.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center"
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500,
                backgroundColor: 'var(--pf-white)',
                color: 'var(--pf-blue-700)',
              }}
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {/* Where these subjects lead */}
      <div className="pf-card">
        <h3 style={sectionTitleStyle}>Where these subjects lead</h3>
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
              <li key={s.id} className="flex items-start gap-2" style={{ fontSize: '0.875rem' }}>
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: 'var(--pf-blue-500)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>
                  <span style={{ fontWeight: 500, color: 'var(--pf-grey-900)' }}>{s.name}</span>
                  {nextLevel ? (
                    <span style={{ color: 'var(--pf-grey-600)' }}> → {nextLevel}</span>
                  ) : (
                    <span style={{ color: 'var(--pf-grey-600)' }}> (elective)</span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Matching university courses — full and partial matches */}
      <div className="pf-card">
        <h3 style={sectionTitleStyle}>University courses you could apply for</h3>
        {courseMatches === undefined ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>Loading...</p>
        ) : courseMatches.full.length === 0 && courseMatches.partial.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
            No courses in our database list these subjects as Higher requirements yet.
          </p>
        ) : (
          <div className="space-y-4">
            {courseMatches.full.length > 0 && (
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1"
                    style={{
                      padding: '2px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--pf-green-500)',
                    }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Full match
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                    {courseMatches.full.length} course{courseMatches.full.length === 1 ? '' : 's'}
                  </span>
                </div>
                <ul className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin">
                  {courseMatches.full.slice(0, 8).map((m) => (
                    <CourseMatchRow key={`full-${m.course.id}`} match={m} variant="full" />
                  ))}
                  {courseMatches.full.length > 8 && (
                    <li
                      className="text-center pt-1"
                      style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}
                    >
                      and {courseMatches.full.length - 8} more...
                    </li>
                  )}
                </ul>
              </div>
            )}

            {courseMatches.partial.length > 0 && (
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1"
                    style={{
                      padding: '2px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      color: 'var(--pf-amber-500)',
                    }}
                  >
                    Partial match
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                    {courseMatches.partial.length} course
                    {courseMatches.partial.length === 1 ? '' : 's'}
                  </span>
                </div>
                <ul className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin">
                  {courseMatches.partial.slice(0, 6).map((m) => (
                    <CourseMatchRow key={`partial-${m.course.id}`} match={m} variant="partial" />
                  ))}
                  {courseMatches.partial.length > 6 && (
                    <li
                      className="text-center pt-1"
                      style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}
                    >
                      and {courseMatches.partial.length - 6} more...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Career sectors covered */}
      <div className="pf-card">
        <div className="flex items-baseline justify-between mb-3">
          <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>Career sectors covered</h3>
          {totalSectors > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
              {uniqueSectors.length} / {totalSectors}
            </span>
          )}
        </div>
        {uniqueSectors.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>Loading...</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {uniqueSectors.map((sec) => (
              <span key={sec.id} className="pf-badge-green">
                {sec.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <p
        className="text-center"
        style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}
      >
        This tool is for exploration only — your actual subject choices are recorded through the dashboard.
      </p>
    </div>
  )
}

function CourseMatchRow({
  match,
  variant,
}: {
  match: {
    course: { id: string; name: string; university: { id: string; name: string } | null }
    satisfiedSubjects: Array<{ id: string; name: string }>
    missingSubjects: Array<{ id: string; name: string }>
  }
  variant: 'full' | 'partial'
}) {
  return (
    <li>
      <Link
        href={`/courses/${match.course.id}`}
        className="block rounded-lg no-underline hover:no-underline"
        style={{
          padding: '8px 8px',
          margin: '0 -8px',
          transition: 'background-color 0.15s',
          fontSize: '0.875rem',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <div
          className="line-clamp-1"
          style={{ fontWeight: 500, color: 'var(--pf-grey-900)' }}
        >
          {match.course.name}
        </div>
        {match.course.university && (
          <div
            className="line-clamp-1"
            style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}
          >
            {match.course.university.name}
          </div>
        )}
        {variant === 'partial' && match.missingSubjects.length > 0 && (
          <div
            className="flex flex-wrap gap-1 mt-1"
            style={{ fontSize: '0.6875rem' }}
          >
            <span style={{ color: 'var(--pf-grey-600)' }}>Missing:</span>
            {match.missingSubjects.map((s) => (
              <span
                key={s.id}
                style={{
                  padding: '1px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: 'var(--pf-amber-500)',
                  fontWeight: 500,
                }}
              >
                {s.name}
              </span>
            ))}
          </div>
        )}
      </Link>
    </li>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Save panel — persist the current picks to the student's profile.
// ──────────────────────────────────────────────────────────────────────────

function SaveChoicesPanel({
  isSignedIn,
  isSaving,
  hasSelection,
  onSave,
}: {
  isSignedIn: boolean
  isSaving: boolean
  hasSelection: boolean
  onSave: () => void
}) {
  if (!isSignedIn) {
    return (
      <div
        className="rounded-lg text-center"
        style={{
          padding: '24px',
          backgroundColor: 'var(--pf-white)',
          border: '1px dashed var(--pf-blue-500)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1rem', marginBottom: '8px' }}>
          Want to save this for later?
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--pf-grey-600)',
            marginBottom: '16px',
          }}
        >
          Sign in to save your choices to your dashboard and personalise
          your course recommendations.
        </p>
        <Link href="/auth/sign-in" className="pf-btn-primary">
          Sign in to save your choices
        </Link>
      </div>
    )
  }

  return (
    <div
      className="rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      style={{
        padding: '20px 24px',
        backgroundColor: 'var(--pf-blue-100)',
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            color: 'var(--pf-blue-900)',
            marginBottom: '2px',
          }}
        >
          Happy with your picks?
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', margin: 0 }}>
          Saving keeps them on your dashboard and powers your course matches.
        </p>
      </div>
      <SubmitButton
        type="button"
        onClick={onSave}
        disabled={!hasSelection}
        isLoading={isSaving}
        loadingText="Saving..."
        style={{ whiteSpace: 'nowrap' }}
      >
        Save my choices
      </SubmitButton>
    </div>
  )
}
