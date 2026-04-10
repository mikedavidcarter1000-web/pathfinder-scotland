'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { usePathways, useCareerSectors, type Stage, type SubjectWithArea } from '@/hooks/use-subjects'
import {
  CURRICULAR_AREA_COLOURS,
  DEFAULT_CURRICULAR_AREA_COLOUR,
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

export default function PathwaysPage() {
  const [yearGoingInto, setYearGoingInto] = useState<YearGoingInto | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set())

  const currentStage = yearGoingInto ? YEAR_TO_CURRENT_STAGE[yearGoingInto] : null
  const { data: pathway, isLoading } = usePathways(currentStage)
  const { data: careerSectors } = useCareerSectors()

  // Expand all curricular areas by default when pathway loads
  useEffect(() => {
    if (pathway?.subjectsByArea) {
      setExpandedAreas(new Set(pathway.subjectsByArea.map((g) => g.area.id)))
    }
  }, [pathway?.stage, pathway?.subjectsByArea])

  // Pre-select compulsory subjects whenever the pathway rules change
  useEffect(() => {
    if (!pathway?.rule || !pathway?.subjectsByArea) return
    const compulsoryNames = pathway.rule.compulsory_subjects || []
    if (compulsoryNames.length === 0) return

    const allSubjects = pathway.subjectsByArea.flatMap((g) => g.subjects)
    const toPreselect = allSubjects
      .filter((s) => compulsoryNames.some((cn) => cn.toLowerCase() === s.name.toLowerCase()))
      .map((s) => s.id)

    if (toPreselect.length === 0) return

    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const id of toPreselect) next.add(id)
      return next
    })
  }, [pathway?.rule, pathway?.subjectsByArea])

  // Reset selections when stage changes
  useEffect(() => {
    setSelectedIds(new Set())
  }, [yearGoingInto])

  const compulsoryIds = useMemo(() => {
    if (!pathway?.rule || !pathway?.subjectsByArea) return new Set<string>()
    const names = pathway.rule.compulsory_subjects || []
    const allSubjects = pathway.subjectsByArea.flatMap((g) => g.subjects)
    return new Set(
      allSubjects
        .filter((s) => names.some((cn) => cn.toLowerCase() === s.name.toLowerCase()))
        .map((s) => s.id)
    )
  }, [pathway?.rule, pathway?.subjectsByArea])

  const selectedSubjects = useMemo(() => {
    if (!pathway) return [] as SubjectWithArea[]
    const all = [
      ...pathway.subjectsByArea.flatMap((g) => g.subjects),
      ...pathway.academySubjects,
    ]
    return all.filter((s) => selectedIds.has(s.id))
  }, [pathway, selectedIds])

  const toggleSubject = (subject: SubjectWithArea) => {
    if (compulsoryIds.has(subject.id)) return // cannot deselect compulsory
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(subject.id)) next.delete(subject.id)
      else next.add(subject.id)
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
  const selectedCount = selectedIds.size

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Plan Your Subject Choices</h1>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
          <p className="text-gray-600">
            Explore how different subject combinations shape your qualifications and future career options.
          </p>
        </div>
      </div>

      {/* Stage Selector */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: rules + picker */}
            <div className="lg:col-span-2 space-y-6">
              <RulesPanel
                rule={pathway.rule}
                selectedCount={selectedCount}
                yearLabel={YEAR_BUTTONS.find((y) => y.value === yearGoingInto)?.label ?? ''}
              />

              {/* Curricular area picker */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 2 — Pick your subjects
                </h2>

                {pathway.subjectsByArea.map((group) => {
                  const areaColour =
                    CURRICULAR_AREA_COLOURS[group.area.name] || DEFAULT_CURRICULAR_AREA_COLOUR
                  const expanded = expandedAreas.has(group.area.id)
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
                          {group.subjects.map((subject) => (
                            <SubjectRow
                              key={subject.id}
                              subject={subject}
                              selected={selectedIds.has(subject.id)}
                              compulsory={compulsoryIds.has(subject.id)}
                              onToggle={() => toggleSubject(subject)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Academies — only shown when going into S3 */}
                {yearGoingInto === 's3' && pathway.academySubjects.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 bg-purple-50 border-b border-purple-100">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                          Academies
                        </span>
                        <span className="text-sm text-purple-700">
                          Enrichment and elective programmes
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 mt-2">
                        Most schools ask students to rank a small number of Academy options. These don&apos;t replace SQA qualifications but develop skills that feed into senior phase choices.
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {pathway.academySubjects.map((subject) => (
                        <SubjectRow
                          key={subject.id}
                          subject={subject}
                          selected={selectedIds.has(subject.id)}
                          compulsory={false}
                          onToggle={() => toggleSubject(subject)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

function RulesPanel({
  rule,
  selectedCount,
  yearLabel,
}: {
  rule: Tables<'course_choice_rules'> | null
  selectedCount: number
  yearLabel: string
}) {
  if (!rule) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500 text-sm">No choice rules found for this transition.</p>
      </div>
    )
  }

  const compulsory = rule.compulsory_subjects || []
  const freeCount = rule.num_free_choices
  const reserveCount = rule.num_reserves ?? 0
  const nonExamined = rule.non_examined_core || []
  const specialRules = rule.special_rules || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Going into {yearLabel} — choice rules
        </h2>
        <span className="text-sm text-gray-500">
          {selectedCount} of {rule.total_subjects} selected
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width: `${Math.min(100, (selectedCount / Math.max(1, rule.total_subjects)) * 100)}%`,
            }}
          />
        </div>
      </div>

      <p className="text-gray-700 mb-4">
        You need to choose <span className="font-semibold">{rule.total_subjects} subjects</span>
        {compulsory.length > 0 && (
          <>
            , including <span className="font-semibold">{compulsory.join(' and ')}</span>
          </>
        )}
        .
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {compulsory.length > 0 && (
          <div>
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Compulsory
            </dt>
            <dd className="text-sm text-gray-900">{compulsory.join(', ')}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Free choices
          </dt>
          <dd className="text-sm text-gray-900">{freeCount}</dd>
        </div>
        {reserveCount > 0 && (
          <div>
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Reserves
            </dt>
            <dd className="text-sm text-gray-900">
              {reserveCount} {reserveCount === 1 ? 'reserve' : 'reserves'}
            </dd>
          </div>
        )}
      </div>

      {rule.breadth_requirements && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">
            Breadth recommendation
          </p>
          <p className="text-sm text-blue-800">{rule.breadth_requirements}</p>
        </div>
      )}

      {nonExamined.length > 0 && (
        <p className="text-xs text-gray-500 mb-3">
          <span className="font-semibold">Also timetabled (not counted in choices):</span>{' '}
          {nonExamined.join(', ')}
        </p>
      )}

      {specialRules.length > 0 && (
        <div className="mt-4 space-y-2">
          {specialRules.map((srule, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg"
            >
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-900">{srule}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SubjectRow({
  subject,
  selected,
  compulsory,
  onToggle,
}: {
  subject: SubjectWithArea
  selected: boolean
  compulsory: boolean
  onToggle: () => void
}) {
  const [showPreview, setShowPreview] = useState(false)
  return (
    <div
      className={`px-5 py-3 transition-colors ${
        selected ? 'bg-blue-50/40' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          disabled={compulsory}
          aria-label={selected ? `Deselect ${subject.name}` : `Select ${subject.name}`}
          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
            selected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300 hover:border-blue-500'
          } ${compulsory ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {selected && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 text-left"
            >
              {subject.name}
            </button>
            {compulsory && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600">
                Compulsory
              </span>
            )}
            <Link
              href={`/subjects/${subject.id}`}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Details →
            </Link>
          </div>

          {selected && showPreview && subject.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-3">{subject.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

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

  // Fetch career sector coverage for selected subjects
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

  // Fetch matching university courses (simple fetch + client-side filter)
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
