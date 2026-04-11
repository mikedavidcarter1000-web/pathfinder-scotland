'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  applySimulatorPreset,
  calculateSimulatorImpact,
  STAGE_LABELS,
  STAGE_TO_TRANSITION,
  useSimulatorData,
  type ImpactResult,
  type SimulatorData,
  type SimulatorPresetId,
  type SimulatorStage,
} from '@/hooks/use-simulator'
import { useAuth } from '@/hooks/use-auth'
import { useSaveSubjectChoices, type ChoiceTransition } from '@/hooks/use-subjects'
import { useToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ParentNotice } from '@/components/ui/parent-notice'
import type { SubjectWithArea } from '@/hooks/use-subjects'

const STAGES: SimulatorStage[] = ['s3', 's4', 's5', 's6']

const PRESETS: Array<{ id: SimulatorPresetId; label: string; description: string }> = [
  { id: 'science', label: 'Science focus', description: 'Bio, Chem, Physics + core' },
  { id: 'creative', label: 'Creative focus', description: 'Art, Music, Drama + core' },
  { id: 'business', label: 'Business focus', description: 'Business, IT, Computing + core' },
  { id: 'languages', label: 'Languages focus', description: 'French, Spanish + core' },
  { id: 'broad', label: 'Broad mix', description: 'One from each area' },
]

const LEVEL_LABEL: Record<string, string> = {
  n5: 'N5',
  higher: 'Higher',
  adv_higher: 'Advanced Higher',
}

// Compulsory subject names are matched case-insensitively against the subject
// list, with "Maths" → "Mathematics" tolerance to mirror the pathways planner.
function matchesCompulsory(compulsoryName: string, subjectName: string): boolean {
  const c = compulsoryName.trim().toLowerCase()
  const s = subjectName.trim().toLowerCase()
  if (c === s) return true
  if (s.startsWith(c + ' ') || s.startsWith(c + '(')) return true
  if (c === 'maths' && s === 'mathematics') return true
  if (c === 'mathematics' && s === 'maths') return true
  return false
}

function getCompulsoryIds(data: SimulatorData, stage: SimulatorStage): Set<string> {
  const transition = STAGE_TO_TRANSITION[stage]
  const rule = data.rules[transition]
  const set = new Set<string>()
  if (!rule || !rule.compulsory_subjects) return set
  for (const subject of data.subjects) {
    if (rule.compulsory_subjects.some((cn) => matchesCompulsory(cn, subject.name))) {
      set.add(subject.id)
    }
  }
  return set
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<SimulatorLoading />}>
      <SimulatorContent />
    </Suspense>
  )
}

function SimulatorLoading() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh' }}>
      <div className="pf-container" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
        <Skeleton height={48} width="60%" style={{ marginBottom: '16px' }} />
        <Skeleton height={24} width="80%" style={{ marginBottom: '32px' }} />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton height={400} />
          <Skeleton height={400} />
        </div>
      </div>
    </div>
  )
}

function SimulatorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const toast = useToast()
  const { data, isLoading, error } = useSimulatorData()
  const saveChoices = useSaveSubjectChoices()

  const [stage, setStage] = useState<SimulatorStage>(() => {
    const param = searchParams.get('stage') as SimulatorStage | null
    return param && STAGES.includes(param) ? param : 's4'
  })
  const [compareMode, setCompareMode] = useState<boolean>(
    () => searchParams.get('compare') === '1' || !!searchParams.get('b')
  )
  const [selectedA, setSelectedA] = useState<Set<string>>(() => {
    const param = searchParams.get('subjects') || searchParams.get('a')
    return param ? new Set(param.split(',').filter(Boolean)) : new Set()
  })
  const [selectedB, setSelectedB] = useState<Set<string>>(() => {
    const param = searchParams.get('b')
    return param ? new Set(param.split(',').filter(Boolean)) : new Set()
  })

  // Track stages we've already auto-seeded compulsory subjects for, so the
  // user's manual deselections don't get clobbered when data refetches.
  const seededRef = useRef<Set<string>>(new Set())
  // Track whether we hydrated initial state from URL params (so we don't
  // wipe URL-supplied selections on first mount).
  const urlHydratedRef = useRef<boolean>(
    !!(
      searchParams.get('subjects') ||
      searchParams.get('a') ||
      searchParams.get('b')
    )
  )

  // Pre-select compulsory subjects whenever the stage changes, unless the
  // user already arrived with subjects in the URL.
  useEffect(() => {
    if (!data) return
    const key = `A:${stage}`
    if (seededRef.current.has(key)) return
    seededRef.current.add(key)
    if (urlHydratedRef.current) {
      // Honour URL-supplied selection on the first relevant stage, then
      // clear the flag so subsequent stage changes still seed compulsory.
      urlHydratedRef.current = false
      return
    }
    const compulsory = getCompulsoryIds(data, stage)
    setSelectedA((prev) => {
      const next = new Set(prev)
      for (const id of compulsory) next.add(id)
      return next
    })
  }, [data, stage])

  // Same compulsory pre-seed logic for Option B in comparison mode.
  useEffect(() => {
    if (!data || !compareMode) return
    const key = `B:${stage}`
    if (seededRef.current.has(key)) return
    seededRef.current.add(key)
    const compulsory = getCompulsoryIds(data, stage)
    setSelectedB((prev) => {
      const next = new Set(prev)
      for (const id of compulsory) next.add(id)
      return next
    })
  }, [data, stage, compareMode])

  const rule = data?.rules[STAGE_TO_TRANSITION[stage]]
  const totalLimit = rule?.total_subjects ?? 8

  const compulsoryIds = useMemo(() => {
    if (!data) return new Set<string>()
    return getCompulsoryIds(data, stage)
  }, [data, stage])

  const impactA = useMemo<ImpactResult | null>(() => {
    if (!data) return null
    return calculateSimulatorImpact(data, selectedA)
  }, [data, selectedA])

  const impactB = useMemo<ImpactResult | null>(() => {
    if (!data || !compareMode) return null
    return calculateSimulatorImpact(data, selectedB)
  }, [data, selectedB, compareMode])

  const toggleSubject = useCallback(
    (
      subjectId: string,
      side: 'A' | 'B',
      currentSelection: Set<string>,
      setSelection: (s: Set<string>) => void
    ) => {
      if (compulsoryIds.has(subjectId)) {
        toast.info('Compulsory subject', 'This subject is included automatically.')
        return
      }
      const next = new Set(currentSelection)
      if (next.has(subjectId)) {
        next.delete(subjectId)
      } else {
        if (next.size >= totalLimit) {
          toast.info(
            `Limit reached`,
            `You can only pick ${totalLimit} subjects for this stage.`
          )
          return
        }
        next.add(subjectId)
      }
      setSelection(next)
    },
    [compulsoryIds, toast, totalLimit]
  )

  const applyPreset = useCallback(
    (presetId: SimulatorPresetId, side: 'A' | 'B') => {
      if (!data) return
      const preset = applySimulatorPreset(presetId, data)
      // Always include compulsory subjects on top of the preset.
      for (const id of compulsoryIds) preset.add(id)
      // Trim to limit if preset overshoots.
      if (preset.size > totalLimit) {
        const trimmed = new Set<string>()
        for (const id of compulsoryIds) trimmed.add(id)
        for (const id of preset) {
          if (trimmed.size >= totalLimit) break
          trimmed.add(id)
        }
        if (side === 'A') setSelectedA(trimmed)
        else setSelectedB(trimmed)
        return
      }
      if (side === 'A') setSelectedA(preset)
      else setSelectedB(preset)
    },
    [data, compulsoryIds, totalLimit]
  )

  const buildShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return ''
    const params = new URLSearchParams()
    params.set('stage', stage)
    if (selectedA.size > 0) params.set('subjects', Array.from(selectedA).join(','))
    if (compareMode) {
      params.set('compare', '1')
      if (selectedB.size > 0) params.set('b', Array.from(selectedB).join(','))
    }
    return `${window.location.origin}/simulator?${params.toString()}`
  }, [stage, selectedA, selectedB, compareMode])

  const handleShare = useCallback(async () => {
    const url = buildShareUrl()
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied', 'Share it with parents or teachers.')
    } catch {
      toast.info('Copy this link', url)
    }
  }, [buildShareUrl, toast])

  const handleSave = useCallback(async () => {
    if (!user) {
      toast.info('Sign in to save', 'Create a free account to save combinations.')
      return
    }
    if (selectedA.size === 0) {
      toast.info('Nothing to save', 'Pick some subjects first.')
      return
    }
    const transition = STAGE_TO_TRANSITION[stage] as ChoiceTransition
    const ok = window.confirm(
      `Save this combination as your ${stage.toUpperCase()} pathway? This will replace any saved subject choices for this stage.`
    )
    if (!ok) return
    try {
      await saveChoices.mutateAsync({
        transition,
        subjectIds: Array.from(selectedA),
      })
      toast.success('Saved', 'Your subject pathway has been updated.')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Please try again.'
      toast.error("Couldn't save combination", message)
    }
  }, [user, selectedA, stage, saveChoices, toast])

  // Reflect current selection in the URL (replace, not push) so the share
  // link is always live and the back button doesn't accumulate history.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams()
    params.set('stage', stage)
    if (selectedA.size > 0) params.set('subjects', Array.from(selectedA).join(','))
    if (compareMode) {
      params.set('compare', '1')
      if (selectedB.size > 0) params.set('b', Array.from(selectedB).join(','))
    }
    const next = `/simulator?${params.toString()}`
    if (window.location.pathname + window.location.search !== next) {
      router.replace(next, { scroll: false })
    }
  }, [stage, selectedA, selectedB, compareMode, router])

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '100vh' }}>
      <ParentNotice>
        Try different subject combinations to understand the trade-offs. Share this
        page with your child to discuss together.
      </ParentNotice>
      <Hero />

      {/* Controls bar */}
      <section className="pf-container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        <div
          className="flex flex-wrap items-center gap-4"
          style={{ marginBottom: '24px' }}
        >
          <div className="flex items-center gap-3">
            <label
              htmlFor="stage-select"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-900)',
              }}
            >
              Stage
            </label>
            <select
              id="stage-select"
              value={stage}
              onChange={(e) => {
                const next = e.target.value as SimulatorStage
                setStage(next)
              }}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--pf-grey-300)',
                backgroundColor: 'var(--pf-white)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9375rem',
                minHeight: '44px',
              }}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <label
            className="inline-flex items-center gap-2 cursor-pointer"
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--pf-grey-300)',
              backgroundColor: 'var(--pf-white)',
              minHeight: '44px',
            }}
          >
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--pf-blue-700)' }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-900)',
              }}
            >
              Compare two combinations
            </span>
          </label>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleShare}
              className="pf-btn-secondary pf-btn-sm"
              aria-label="Copy share link"
            >
              Share
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="pf-btn-primary pf-btn-sm"
              disabled={saveChoices.isPending}
            >
              {saveChoices.isPending ? 'Saving…' : user ? 'Save' : 'Sign in to save'}
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginRight: '4px',
            }}
          >
            Quick start:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id, 'A')}
              title={preset.description}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: '1px solid var(--pf-blue-700)',
                backgroundColor: 'var(--pf-white)',
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--pf-white)'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main grid */}
      <section className="pf-container" style={{ paddingBottom: '64px' }}>
        {isLoading && <SimulatorLoading />}
        {error && (
          <div
            className="pf-card"
            style={{ borderLeft: '4px solid var(--pf-red-500)', padding: '24px' }}
          >
            <p style={{ color: 'var(--pf-red-500)', fontWeight: 600 }}>
              Couldn&apos;t load simulator data
            </p>
            <p style={{ color: 'var(--pf-grey-600)', marginTop: '8px' }}>
              {error instanceof Error ? error.message : 'Please refresh and try again.'}
            </p>
          </div>
        )}
        {data && !isLoading && (
          <>
            {!compareMode ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <SubjectSelector
                  data={data}
                  selected={selectedA}
                  compulsoryIds={compulsoryIds}
                  totalLimit={totalLimit}
                  onToggle={(id) => toggleSubject(id, 'A', selectedA, setSelectedA)}
                  onClear={() => {
                    const fresh = new Set<string>()
                    for (const id of compulsoryIds) fresh.add(id)
                    setSelectedA(fresh)
                  }}
                  label="Your subjects"
                />
                {impactA && (
                  <ImpactPanel data={data} impact={impactA} selected={selectedA} stage={stage} />
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-2" style={{ marginBottom: '32px' }}>
                  <SubjectSelector
                    data={data}
                    selected={selectedA}
                    compulsoryIds={compulsoryIds}
                    totalLimit={totalLimit}
                    onToggle={(id) => toggleSubject(id, 'A', selectedA, setSelectedA)}
                    onClear={() => {
                      const fresh = new Set<string>()
                      for (const id of compulsoryIds) fresh.add(id)
                      setSelectedA(fresh)
                    }}
                    label="Option A"
                    presetSide="A"
                    onApplyPreset={(id) => applyPreset(id, 'A')}
                    accentColour="var(--pf-blue-700)"
                  />
                  <SubjectSelector
                    data={data}
                    selected={selectedB}
                    compulsoryIds={compulsoryIds}
                    totalLimit={totalLimit}
                    onToggle={(id) => toggleSubject(id, 'B', selectedB, setSelectedB)}
                    onClear={() => {
                      const fresh = new Set<string>()
                      for (const id of compulsoryIds) fresh.add(id)
                      setSelectedB(fresh)
                    }}
                    label="Option B"
                    presetSide="B"
                    onApplyPreset={(id) => applyPreset(id, 'B')}
                    accentColour="var(--pf-amber-500)"
                  />
                </div>
                {impactA && impactB && (
                  <ComparisonPanel
                    data={data}
                    impactA={impactA}
                    impactB={impactB}
                    selectedA={selectedA}
                    selectedB={selectedB}
                  />
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function Hero() {
  return (
    <section
      className="pf-section"
      style={{
        backgroundColor: 'var(--pf-blue-50)',
        paddingTop: '48px',
        paddingBottom: '32px',
      }}
    >
      <div className="pf-container">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <span className="pf-badge-blue inline-flex" style={{ marginBottom: '20px' }}>
              Simulator
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                lineHeight: 1.15,
                marginBottom: '16px',
                color: 'var(--pf-grey-900)',
              }}
            >
              See where your subjects lead
            </h1>
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                maxWidth: '560px',
              }}
            >
              Pick subjects and instantly see which university courses and careers they
              open up — and what you&apos;d miss out on.
            </p>
          </div>
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}

function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        maxWidth: '320px',
        margin: '0 auto',
        backgroundColor: 'var(--pf-white)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 16px rgba(0, 45, 114, 0.08)',
      }}
    >
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          color: 'var(--pf-blue-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}
      >
        Eligible courses
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '2.25rem',
          color: 'var(--pf-grey-900)',
          lineHeight: 1,
          marginBottom: '12px',
        }}
      >
        47 / 117
      </div>
      <div
        style={{
          height: '8px',
          backgroundColor: 'var(--pf-grey-100)',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: '40%',
            height: '100%',
            backgroundColor: 'var(--pf-green-500)',
          }}
        />
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
        Adding Chemistry would open <strong>12 more courses</strong> including Medicine.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Subject selector panel
// ─────────────────────────────────────────────────────────────────────────

function SubjectSelector({
  data,
  selected,
  compulsoryIds,
  totalLimit,
  onToggle,
  onClear,
  label,
  presetSide,
  onApplyPreset,
  accentColour,
}: {
  data: SimulatorData
  selected: Set<string>
  compulsoryIds: Set<string>
  totalLimit: number
  onToggle: (id: string) => void
  onClear: () => void
  label: string
  presetSide?: 'A' | 'B'
  onApplyPreset?: (id: SimulatorPresetId) => void
  accentColour?: string
}) {
  const accent = accentColour ?? 'var(--pf-blue-700)'
  const remaining = Math.max(0, totalLimit - selected.size)
  return (
    <div
      className="pf-card"
      style={{
        padding: '20px',
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
        <h2
          style={{
            fontSize: '1.125rem',
            color: 'var(--pf-grey-900)',
            margin: 0,
          }}
        >
          {label}
        </h2>
        <div
          style={{
            fontSize: '0.875rem',
            color: 'var(--pf-grey-600)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
          }}
        >
          <span style={{ color: accent, fontWeight: 700 }}>{selected.size}</span>
          {' of '}
          {totalLimit} chosen
        </div>
      </div>

      {presetSide && onApplyPreset && (
        <div className="flex flex-wrap gap-1.5" style={{ marginBottom: '12px' }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onApplyPreset(p.id)}
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                border: `1px solid ${accent}`,
                backgroundColor: 'transparent',
                color: accent,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          height: '6px',
          backgroundColor: 'var(--pf-grey-100)',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, (selected.size / totalLimit) * 100)}%`,
            height: '100%',
            backgroundColor: accent,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div
        style={{
          maxHeight: '520px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {data.subjectsByArea.map((group) => (
          <div key={group.area.id} style={{ marginBottom: '16px' }}>
            <div
              className="flex items-center gap-2"
              style={{ marginBottom: '8px' }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: areaColourValue(group.area.name),
                }}
              />
              <h3
                style={{
                  fontSize: '0.8125rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: 'var(--pf-grey-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                }}
              >
                {group.area.name}
              </h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {group.subjects.map((subject) => {
                const isSelected = selected.has(subject.id)
                const isCompulsory = compulsoryIds.has(subject.id)
                const colour = areaColourValue(group.area.name)
                return (
                  <li key={subject.id} style={{ marginBottom: '4px' }}>
                    <label
                      className="flex items-center gap-2 cursor-pointer"
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? 'rgba(0, 94, 184, 0.06)' : 'transparent',
                        opacity: isCompulsory ? 0.85 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'var(--pf-grey-100)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected
                          ? 'rgba(0, 94, 184, 0.06)'
                          : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(subject.id)}
                        disabled={isCompulsory && isSelected}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: colour,
                          cursor: isCompulsory ? 'not-allowed' : 'pointer',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--pf-grey-900)',
                          flex: 1,
                        }}
                      >
                        {subject.name}
                      </span>
                      {isCompulsory && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--pf-blue-100)',
                            color: 'var(--pf-blue-700)',
                            fontWeight: 600,
                          }}
                        >
                          Required
                        </span>
                      )}
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: '12px' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
          {remaining > 0 ? `${remaining} slots free` : 'Selection full'}
        </span>
        <button
          type="button"
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--pf-blue-500)',
            fontSize: '0.8125rem',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function areaColourValue(name: string): string {
  // Map area names onto the CSS custom properties so the dot/checkbox accents
  // stay aligned with the curricular area badge palette across the app.
  const lower = name.toLowerCase().replace(/\s+&\s+/g, ' and ')
  if (lower.includes('language')) return 'var(--pf-area-languages)'
  if (lower.includes('mathematic')) return 'var(--pf-area-mathematics)'
  if (lower.includes('science')) return 'var(--pf-area-sciences)'
  if (lower.includes('social')) return 'var(--pf-area-social)'
  if (lower.includes('expressive')) return 'var(--pf-area-expressive)'
  if (lower.includes('technolog')) return 'var(--pf-area-technologies)'
  if (lower.includes('religious')) return 'var(--pf-area-rme)'
  if (lower.includes('health')) return 'var(--pf-area-health)'
  return 'var(--pf-blue-500)'
}

// ─────────────────────────────────────────────────────────────────────────
// Impact panel (single mode)
// ─────────────────────────────────────────────────────────────────────────

function ImpactPanel({
  data,
  impact,
  selected,
  stage,
}: {
  data: SimulatorData
  impact: ImpactResult
  selected: Set<string>
  stage: SimulatorStage
}) {
  const sectorsById = useMemo(
    () => new Map(data.careerSectors.map((s) => [s.id, s])),
    [data.careerSectors]
  )

  const eligiblePct =
    impact.totalCourses > 0 ? (impact.eligibleCount / impact.totalCourses) * 100 : 0
  const sectorPct =
    data.careerSectors.length > 0
      ? (impact.coveredSectorIds.size / data.careerSectors.length) * 100
      : 0

  const visibleEligible = impact.eligibleCourses.slice(0, 10)
  const visibleMissed = impact.missedOpportunities.slice(0, 5)

  return (
    <div className="pf-card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.125rem', marginBottom: '4px', color: 'var(--pf-grey-900)' }}>
        Your impact
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '20px' }}>
        Updates as you change subjects.
      </p>

      {selected.size === 0 && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--pf-blue-50)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'var(--pf-grey-600)',
            fontSize: '0.875rem',
          }}
        >
          Pick some subjects to see your impact analysis.
        </div>
      )}

      {selected.size > 0 && (
        <>
          {/* Section A — Eligible courses */}
          <Section title="University courses you could apply for">
            <div
              className="flex items-baseline gap-2"
              style={{ marginBottom: '8px' }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.75rem',
                  color: 'var(--pf-green-500)',
                }}
              >
                {impact.eligibleCount}
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)' }}>
                of {impact.totalCourses} courses
              </span>
            </div>
            <div
              style={{
                height: '8px',
                backgroundColor: 'var(--pf-grey-100)',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, eligiblePct)}%`,
                  height: '100%',
                  backgroundColor: 'var(--pf-green-500)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            {visibleEligible.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {visibleEligible.map((course) => (
                  <li
                    key={course.id}
                    style={{
                      padding: '8px 0',
                      borderTop: '1px solid var(--pf-grey-100)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <span style={{ color: 'var(--pf-grey-900)', fontWeight: 500 }}>
                      {course.name}
                    </span>
                    {course.university_name && (
                      <span style={{ color: 'var(--pf-grey-600)' }}>
                        {' — '}
                        {course.university_name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                No courses match this combination yet. Try adding more subjects.
              </p>
            )}
            {impact.eligibleCount > visibleEligible.length && (
              <Link
                href="/courses"
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  fontSize: '0.875rem',
                  color: 'var(--pf-blue-500)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                View all {impact.eligibleCount} matches →
              </Link>
            )}
          </Section>

          {/* Section B — Missed opportunities */}
          <Section title="Courses you'd unlock by adding…">
            {visibleMissed.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {visibleMissed.map((opp) => (
                  <li
                    key={opp.subject.id}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--pf-amber-500)',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--pf-grey-900)',
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      Adding{' '}
                      <strong style={{ color: 'var(--pf-amber-500)' }}>
                        {opp.subject.name}
                      </strong>{' '}
                      would open{' '}
                      <strong>{opp.additionalCount} more course{opp.additionalCount === 1 ? '' : 's'}</strong>
                      {opp.sampleCourses.length > 0 && (
                        <span style={{ color: 'var(--pf-grey-600)' }}>
                          {' '}
                          (including{' '}
                          {opp.sampleCourses
                            .map((c) => c.name)
                            .slice(0, 2)
                            .join(', ')}
                          )
                        </span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                Looks like you&apos;ve covered the main bases — no single subject
                would dramatically change your options.
              </p>
            )}
          </Section>

          {/* Section C — Career sector coverage */}
          <Section title="Career sectors covered">
            <div
              className="flex items-baseline gap-2"
              style={{ marginBottom: '12px' }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: 'var(--pf-green-500)',
                }}
              >
                {impact.coveredSectorIds.size}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                of {data.careerSectors.length} sectors
              </span>
            </div>
            <div
              style={{
                height: '6px',
                backgroundColor: 'var(--pf-grey-100)',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, sectorPct)}%`,
                  height: '100%',
                  backgroundColor: 'var(--pf-green-500)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
            >
              {data.careerSectors.map((sector) => {
                const covered = impact.coveredSectorIds.has(sector.id)
                return (
                  <div
                    key={sector.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: covered
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'var(--pf-grey-100)',
                      color: covered ? 'var(--pf-green-500)' : 'var(--pf-grey-600)',
                      fontSize: '0.8125rem',
                      fontWeight: covered ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {covered ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        aria-hidden="true"
                      >
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span style={{ width: '12px' }} />
                    )}
                    <span style={{ flex: 1 }}>{sector.name}</span>
                  </div>
                )
              })}
            </div>
            {impact.uncoveredSectorIds.size > 0 && impact.sectorAddBy.size > 0 && (
              <details style={{ marginTop: '12px' }}>
                <summary
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--pf-blue-500)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  How to cover the rest →
                </summary>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '8px 0 0 0',
                    fontSize: '0.8125rem',
                  }}
                >
                  {Array.from(impact.uncoveredSectorIds)
                    .slice(0, 5)
                    .map((sectorId) => {
                      const sector = sectorsById.get(sectorId)
                      const candidates = impact.sectorAddBy.get(sectorId) ?? []
                      if (!sector || candidates.length === 0) return null
                      const top = candidates[0]
                      return (
                        <li
                          key={sectorId}
                          style={{ padding: '4px 0', color: 'var(--pf-grey-600)' }}
                        >
                          Add{' '}
                          <strong style={{ color: 'var(--pf-grey-900)' }}>{top.name}</strong>{' '}
                          to cover {sector.name}
                        </li>
                      )
                    })}
                </ul>
              </details>
            )}
          </Section>

          {/* Section D — Pathway summary */}
          <Section title="Your pathway summary">
            {impact.pathwaySummary.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {impact.pathwaySummary.map((entry) => {
                  const startIdx =
                    stage === 's5' || stage === 's6'
                      ? entry.levels.indexOf('higher')
                      : 0
                  const visibleLevels =
                    startIdx >= 0 ? entry.levels.slice(startIdx) : entry.levels
                  return (
                    <li
                      key={entry.subject.id}
                      style={{
                        padding: '10px 0',
                        borderTop: '1px solid var(--pf-grey-100)',
                        fontSize: '0.875rem',
                      }}
                    >
                      <div style={{ color: 'var(--pf-grey-900)', fontWeight: 600 }}>
                        {entry.subject.name}
                      </div>
                      {visibleLevels.length > 0 ? (
                        <div
                          style={{
                            color: 'var(--pf-grey-600)',
                            marginTop: '2px',
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {visibleLevels.map((lvl, i) => {
                            const prog = entry.progressions.find(
                              (p) =>
                                p.to_level === lvl &&
                                visibleLevels[i - 1] === p.from_level
                            )
                            const grade = prog?.min_grade
                            return (
                              <span key={lvl}>
                                {i > 0 && (
                                  <span
                                    style={{ color: 'var(--pf-grey-300)', margin: '0 6px' }}
                                  >
                                    →
                                  </span>
                                )}
                                {LEVEL_LABEL[lvl] ?? lvl}
                                {grade && (
                                  <span style={{ color: 'var(--pf-grey-600)' }}>
                                    {' '}
                                    (need {grade}+)
                                  </span>
                                )}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--pf-grey-600)', marginTop: '2px' }}>
                          No qualification levels recorded.
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                Pick a subject to see its qualification chain.
              </p>
            )}
          </Section>
        </>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: '24px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--pf-grey-100)',
      }}
    >
      <h3
        style={{
          fontSize: '0.9375rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '12px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Comparison panel
// ─────────────────────────────────────────────────────────────────────────

function ComparisonPanel({
  data,
  impactA,
  impactB,
  selectedA,
  selectedB,
}: {
  data: SimulatorData
  impactA: ImpactResult
  impactB: ImpactResult
  selectedA: Set<string>
  selectedB: Set<string>
}) {
  const eligibleDelta = impactB.eligibleCount - impactA.eligibleCount
  const sectorDelta = impactB.coveredSectorIds.size - impactA.coveredSectorIds.size

  // Subjects unique to each side help explain the trade-off in plain language.
  const onlyInA = useMemo(() => {
    const out: SubjectWithArea[] = []
    for (const id of selectedA) {
      if (!selectedB.has(id)) {
        const sub = data.subjectsById.get(id)
        if (sub) out.push(sub)
      }
    }
    return out
  }, [selectedA, selectedB, data.subjectsById])
  const onlyInB = useMemo(() => {
    const out: SubjectWithArea[] = []
    for (const id of selectedB) {
      if (!selectedA.has(id)) {
        const sub = data.subjectsById.get(id)
        if (sub) out.push(sub)
      }
    }
    return out
  }, [selectedA, selectedB, data.subjectsById])

  // Approximate "sectors lost" by side: sectors covered by the other option
  // but not by this one.
  const sectorsOnlyA = useMemo(() => {
    const out: string[] = []
    for (const id of impactA.coveredSectorIds) {
      if (!impactB.coveredSectorIds.has(id)) {
        const sector = data.careerSectors.find((s) => s.id === id)
        if (sector) out.push(sector.name)
      }
    }
    return out
  }, [impactA.coveredSectorIds, impactB.coveredSectorIds, data.careerSectors])
  const sectorsOnlyB = useMemo(() => {
    const out: string[] = []
    for (const id of impactB.coveredSectorIds) {
      if (!impactA.coveredSectorIds.has(id)) {
        const sector = data.careerSectors.find((s) => s.id === id)
        if (sector) out.push(sector.name)
      }
    }
    return out
  }, [impactA.coveredSectorIds, impactB.coveredSectorIds, data.careerSectors])

  return (
    <div className="pf-card" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--pf-grey-900)' }}>
        Side-by-side comparison
      </h2>

      <div className="grid gap-4 sm:grid-cols-2" style={{ marginBottom: '24px' }}>
        <ComparisonStat
          label="Option A"
          accent="var(--pf-blue-700)"
          value={impactA.eligibleCount}
          unit={`of ${impactA.totalCourses} eligible`}
          sectors={`${impactA.coveredSectorIds.size}/${data.careerSectors.length} sectors`}
        />
        <ComparisonStat
          label="Option B"
          accent="var(--pf-amber-500)"
          value={impactB.eligibleCount}
          unit={`of ${impactB.totalCourses} eligible`}
          sectors={`${impactB.coveredSectorIds.size}/${data.careerSectors.length} sectors`}
        />
      </div>

      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--pf-blue-50)',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--pf-grey-600)',
            margin: 0,
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Difference
        </p>
        <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', margin: 0 }}>
          {eligibleDelta === 0 && 'Both options unlock the same number of courses.'}
          {eligibleDelta > 0 && (
            <>
              Option B opens <strong>{eligibleDelta} more course{eligibleDelta === 1 ? '' : 's'}</strong>
              {sectorsOnlyA.length > 0 && (
                <>
                  {' '}
                  but loses access to{' '}
                  <strong style={{ color: 'var(--pf-amber-500)' }}>
                    {sectorsOnlyA.slice(0, 2).join(', ')}
                  </strong>
                </>
              )}
              .
            </>
          )}
          {eligibleDelta < 0 && (
            <>
              Option A opens <strong>{Math.abs(eligibleDelta)} more course{Math.abs(eligibleDelta) === 1 ? '' : 's'}</strong>
              {sectorsOnlyB.length > 0 && (
                <>
                  {' '}
                  but loses access to{' '}
                  <strong style={{ color: 'var(--pf-amber-500)' }}>
                    {sectorsOnlyB.slice(0, 2).join(', ')}
                  </strong>
                </>
              )}
              .
            </>
          )}
        </p>
        {sectorDelta !== 0 && (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--pf-grey-600)',
              margin: '6px 0 0 0',
            }}
          >
            {sectorDelta > 0
              ? `Option B covers ${sectorDelta} more sector${sectorDelta === 1 ? '' : 's'}.`
              : `Option A covers ${Math.abs(sectorDelta)} more sector${Math.abs(sectorDelta) === 1 ? '' : 's'}.`}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DiffList
          title="Only in Option A"
          accent="var(--pf-blue-700)"
          items={onlyInA.map((s) => s.name)}
        />
        <DiffList
          title="Only in Option B"
          accent="var(--pf-amber-500)"
          items={onlyInB.map((s) => s.name)}
        />
      </div>
    </div>
  )
}

function ComparisonStat({
  label,
  accent,
  value,
  unit,
  sectors,
}: {
  label: string
  accent: string
  value: number
  unit: string
  sectors: string
}) {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid var(--pf-grey-300)`,
        borderTop: `3px solid ${accent}`,
        backgroundColor: 'var(--pf-white)',
      }}
    >
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
          marginBottom: '8px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '2rem',
          color: 'var(--pf-grey-900)',
          margin: 0,
          lineHeight: 1,
          marginBottom: '4px',
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          margin: 0,
          marginBottom: '8px',
        }}
      >
        {unit}
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', margin: 0 }}>
        {sectors}
      </p>
    </div>
  )
}

function DiffList({
  title,
  accent,
  items,
}: {
  title: string
  accent: string
  items: string[]
}) {
  return (
    <div>
      <h3
        style={{
          fontSize: '0.875rem',
          color: accent,
          margin: 0,
          marginBottom: '8px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
        }}
      >
        {title}
      </h3>
      {items.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((item) => (
            <li
              key={item}
              style={{
                padding: '4px 0',
                fontSize: '0.875rem',
                color: 'var(--pf-grey-900)',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          (no unique subjects)
        </p>
      )}
    </div>
  )
}
