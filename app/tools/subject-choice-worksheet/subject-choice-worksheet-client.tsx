'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useSubjects, useCareerSectors } from '@/hooks/use-subjects'
import { getSupabaseClient } from '@/lib/supabase'

// ── Year groups ──────────────────────────────────────────────────────────
type YearGoingInto = 's3' | 's4' | 's5' | 's6'

const YEAR_OPTIONS: Array<{
  value: YearGoingInto
  title: string
  subtitle: string
  totalSubjects: number
  defaultLevel: 'n5' | 'higher' | 'adv_higher'
  allowsLevelChoice: boolean
}> = [
  { value: 's3', title: 'Going into S3', subtitle: 'Curriculum for Excellence broad subjects', totalSubjects: 8, defaultLevel: 'n5', allowsLevelChoice: false },
  { value: 's4', title: 'Going into S4', subtitle: 'Mostly National 5 level', totalSubjects: 6, defaultLevel: 'n5', allowsLevelChoice: false },
  { value: 's5', title: 'Going into S5', subtitle: 'Higher year - around 5 subjects', totalSubjects: 5, defaultLevel: 'higher', allowsLevelChoice: true },
  { value: 's6', title: 'Going into S6', subtitle: 'Higher and Advanced Higher', totalSubjects: 5, defaultLevel: 'adv_higher', allowsLevelChoice: true },
]

type QualLevel = 'n5' | 'higher' | 'adv_higher'

const QUAL_LABELS: Record<QualLevel, string> = {
  n5: 'National 5',
  higher: 'Higher',
  adv_higher: 'Advanced Higher',
}

// UCAS tariff per grade (matches /tools/ucas-calculator).
const TARIFF: Record<QualLevel, Record<string, number>> = {
  n5: {},
  higher: { A: 33, B: 27, C: 21, D: 15 },
  adv_higher: { A: 56, B: 48, C: 40, D: 32 },
}

interface Choice {
  subject_id: string
  subject_name: string
  level: QualLevel
}

// ── Main component ───────────────────────────────────────────────────────

export function SubjectChoiceWorksheetClient() {
  const [year, setYear] = useState<YearGoingInto | null>(null)
  const [choices, setChoices] = useState<Choice[]>([])
  const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>([])
  const [predictedGrade, setPredictedGrade] = useState<string>('B')

  const yearConfig = year ? YEAR_OPTIONS.find((y) => y.value === year)! : null

  // Subjects available at the year's relevant levels.
  // For S5/S6 we want both Higher and Advanced Higher subjects. For S3/S4 we want N5+.
  const subjectsLevel: 'n5' | 'higher' | 'adv_higher' =
    year === 's6' ? 'adv_higher' : year === 's5' ? 'higher' : 'n5'
  const { data: allSubjects = [], isLoading: subjectsLoading } = useSubjects({ level: subjectsLevel })
  const { data: allSectors = [] } = useCareerSectors()

  // Filter out academy/elective-only subjects from the dropdown for cleanliness.
  const subjectOptions = useMemo(
    () =>
      allSubjects
        .filter((s) => !s.is_academy)
        .map((s) => ({ id: s.id, name: s.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [allSubjects]
  )

  const sectorOptions = useMemo(
    () => allSectors.sort((a, b) => a.name.localeCompare(b.name)),
    [allSectors]
  )

  const subjectIds = choices.map((c) => c.subject_id).filter(Boolean)

  // ── Consequence query: courses + sectors connected to chosen subjects ──
  const consequenceQuery = useQuery({
    queryKey: ['scw-consequences', subjectIds.sort().join(',')],
    queryFn: async () => {
      if (subjectIds.length === 0) return { courseCount: 0, sectorIds: new Set<string>() }
      const supabase = getSupabaseClient()
      const [courseRes, sectorRes] = await Promise.all([
        supabase
          .from('course_subject_requirements')
          .select('course_id')
          .in('subject_id', subjectIds),
        supabase
          .from('subject_career_sectors')
          .select('career_sector_id')
          .in('subject_id', subjectIds),
      ])
      if (courseRes.error) throw courseRes.error
      if (sectorRes.error) throw sectorRes.error
      const courseIds = new Set<string>()
      for (const row of (courseRes.data ?? []) as Array<{ course_id: string }>) {
        courseIds.add(row.course_id)
      }
      const sectorIds = new Set<string>()
      for (const row of (sectorRes.data ?? []) as Array<{ career_sector_id: string }>) {
        sectorIds.add(row.career_sector_id)
      }
      return { courseCount: courseIds.size, sectorIds }
    },
    enabled: subjectIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  // ── Total course count for context ─────────────────────────────────────
  const totalCoursesQuery = useQuery({
    queryKey: ['scw-total-courses'],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { count, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
      if (error) throw error
      return count ?? 0
    },
    staleTime: 60 * 60 * 1000,
  })

  // ── Subject-to-sector lookup for the per-choice display ────────────────
  const choiceSectorLinks = useQuery({
    queryKey: ['scw-choice-sectors', subjectIds.sort().join(',')],
    queryFn: async () => {
      if (subjectIds.length === 0) return new Map<string, string[]>()
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('subject_career_sectors')
        .select('subject_id, career_sector:career_sectors(name)')
        .in('subject_id', subjectIds)
      if (error) throw error
      type Row = { subject_id: string; career_sector: { name: string } | null }
      const m = new Map<string, string[]>()
      for (const row of (data ?? []) as Row[]) {
        if (!row.career_sector) continue
        const arr = m.get(row.subject_id) ?? []
        arr.push(row.career_sector.name)
        m.set(row.subject_id, arr)
      }
      return m
    },
    enabled: subjectIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const matchedSectorCount = consequenceQuery.data?.sectorIds.size ?? 0
  const matchedCourseCount = consequenceQuery.data?.courseCount ?? 0
  const totalCourses = totalCoursesQuery.data ?? 0

  // UCAS tariff: assume each Higher / Advanced Higher gets the predicted grade.
  const ucasEstimate = useMemo(() => {
    return choices
      .filter((c) => c.level !== 'n5')
      .reduce((sum, c) => sum + (TARIFF[c.level]?.[predictedGrade] ?? 0), 0)
  }, [choices, predictedGrade])

  // Show the worksheet section once both year and at least one choice exist.
  const showWorksheet = !!year && choices.filter((c) => !!c.subject_id).length > 0

  // ── Handlers ───────────────────────────────────────────────────────────

  function handleYearSelect(value: YearGoingInto) {
    setYear(value)
    const cfg = YEAR_OPTIONS.find((y) => y.value === value)!
    // Initialise empty rows for the year's typical subject count.
    setChoices(
      Array.from({ length: cfg.totalSubjects }, () => ({
        subject_id: '',
        subject_name: '',
        level: cfg.defaultLevel,
      }))
    )
  }

  function updateChoice(index: number, patch: Partial<Choice>) {
    setChoices((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      // Sync subject_name when subject_id changes.
      if (patch.subject_id !== undefined) {
        const subject = subjectOptions.find((s) => s.id === patch.subject_id)
        next[index].subject_name = subject?.name ?? ''
      }
      return next
    })
  }

  function addChoiceRow() {
    if (!yearConfig) return
    setChoices((prev) => [...prev, { subject_id: '', subject_name: '', level: yearConfig.defaultLevel }])
  }

  function removeChoiceRow(index: number) {
    setChoices((prev) => prev.filter((_, i) => i !== index))
  }

  function toggleSector(id: string) {
    setSelectedSectorIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  function handlePrint() {
    window.print()
  }

  function resetAll() {
    setYear(null)
    setChoices([])
    setSelectedSectorIds([])
    setPredictedGrade('B')
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="worksheet-page" style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh' }}>
      {/* Action bar */}
      <div
        className="no-print"
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-200)',
          padding: '10px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
            <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>Home</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <Link href="/tools" style={{ color: 'var(--pf-grey-600)' }}>Tools</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>Subject Choice Worksheet</span>
          </nav>
          {showWorksheet && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={resetAll}
                className="pf-btn-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                Start over
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="pf-btn-primary"
                style={{ fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print or save as PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)' }}>
            Subject Choice Worksheet
          </h1>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              maxWidth: '640px',
            }}
          >
            Plan your subject choices and see what each combination opens up. No account needed.
            When you are happy, print the worksheet to take to your guidance teacher meeting.
          </p>
        </div>

        {/* Step 1: Year group */}
        <Section step={1} title="Which year are you choosing for?">
          <div
            role="radiogroup"
            aria-label="Year group"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {YEAR_OPTIONS.map((opt) => {
              const isActive = year === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => handleYearSelect(opt.value)}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: `2px solid ${isActive ? 'var(--pf-blue-700)' : 'var(--pf-grey-200)'}`,
                    backgroundColor: isActive ? 'var(--pf-blue-50)' : 'var(--pf-white)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: isActive ? 'var(--pf-blue-700)' : 'var(--pf-grey-900)',
                      marginBottom: '4px',
                    }}
                  >
                    {opt.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                    {opt.subtitle}
                  </div>
                </button>
              )
            })}
          </div>
        </Section>

        {/* Step 2: Subjects */}
        {year && yearConfig && (
          <Section step={2} title={`Your ${yearConfig.totalSubjects} subject${yearConfig.totalSubjects === 1 ? '' : 's'}`}>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.875rem',
                marginBottom: '14px',
                lineHeight: 1.5,
              }}
            >
              Pick the subjects you plan to take.{' '}
              {yearConfig.allowsLevelChoice ? 'You can choose Higher or Advanced Higher per subject.' : ''}
            </p>

            {subjectsLoading ? (
              <div className="pf-skeleton" style={{ height: '200px', borderRadius: '8px' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {choices.map((choice, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        width: '24px',
                        textAlign: 'center',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        color: 'var(--pf-grey-500)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {i + 1}.
                    </span>
                    <select
                      value={choice.subject_id}
                      onChange={(e) => updateChoice(i, { subject_id: e.target.value })}
                      className="pf-input"
                      style={{ flex: 1, padding: '9px 12px', minWidth: '200px', minHeight: '44px' }}
                      aria-label={`Subject ${i + 1}`}
                    >
                      <option value="">Select a subject&hellip;</option>
                      {subjectOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {yearConfig.allowsLevelChoice && (
                      <select
                        value={choice.level}
                        onChange={(e) => updateChoice(i, { level: e.target.value as QualLevel })}
                        className="pf-input"
                        style={{ width: '160px', padding: '9px 12px', minHeight: '44px' }}
                        aria-label={`Qualification level for subject ${i + 1}`}
                      >
                        <option value="higher">Higher</option>
                        <option value="adv_higher">Advanced Higher</option>
                      </select>
                    )}
                    {choices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChoiceRow(i)}
                        aria-label={`Remove row ${i + 1}`}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid var(--pf-grey-300)',
                          backgroundColor: 'var(--pf-white)',
                          color: 'var(--pf-grey-600)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addChoiceRow}
                  style={{
                    marginTop: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--pf-blue-700)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 0',
                    width: 'fit-content',
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add another subject
                </button>
              </div>
            )}
          </Section>
        )}

        {/* Step 3: Career interests (optional) */}
        {year && choices.some((c) => !!c.subject_id) && (
          <Section step={3} title="Career interests (optional)">
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.875rem',
                marginBottom: '14px',
                lineHeight: 1.5,
              }}
            >
              Pick up to three career sectors you are curious about. We will check whether your
              chosen subjects connect to them.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sectorOptions.map((sector) => {
                const isActive = selectedSectorIds.includes(sector.id)
                const isDisabled = !isActive && selectedSectorIds.length >= 3
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => toggleSector(sector.id)}
                    disabled={isDisabled}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      border: `1.5px solid ${isActive ? 'var(--pf-blue-700)' : 'var(--pf-grey-300)'}`,
                      backgroundColor: isActive ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                      color: isActive ? '#fff' : 'var(--pf-grey-700)',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.5 : 1,
                    }}
                  >
                    {sector.name}
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        {/* Step 4: Predicted grade for tariff (only for S5/S6) */}
        {year && (year === 's5' || year === 's6') && choices.some((c) => !!c.subject_id) && (
          <Section step={4} title="Estimate your UCAS tariff (optional)">
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.875rem',
                marginBottom: '14px',
                lineHeight: 1.5,
              }}
            >
              Pick the grade you would predict on average across your Highers / Advanced Highers.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['A', 'B', 'C', 'D'].map((g) => {
                const isActive = predictedGrade === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPredictedGrade(g)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      border: `2px solid ${isActive ? 'var(--pf-blue-700)' : 'var(--pf-grey-200)'}`,
                      backgroundColor: isActive ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                      color: isActive ? '#fff' : 'var(--pf-grey-700)',
                      cursor: 'pointer',
                      minWidth: '50px',
                    }}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        {/* Worksheet output */}
        {showWorksheet && (
          <div className="print-break-before" style={{ marginTop: '32px' }}>
            <div
              className="worksheet-section pf-card"
              style={{ padding: '24px 28px', marginBottom: '20px' }}
            >
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--pf-blue-700)',
                  marginBottom: '8px',
                }}
              >
                Pathfinder Scotland &mdash; Subject Choice Worksheet
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Your worksheet</h2>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', margin: 0 }}>
                {yearConfig?.title} &middot; Generated {new Date().toLocaleDateString('en-GB')}
              </p>
            </div>

            {/* My Subject Choices */}
            <WorksheetSection title="My subject choices">
              <table className="worksheet-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--pf-grey-200)' }}>
                    <Th>#</Th>
                    <Th>Subject</Th>
                    <Th>Level</Th>
                    <Th>Career sectors</Th>
                  </tr>
                </thead>
                <tbody>
                  {choices
                    .filter((c) => !!c.subject_id)
                    .map((c, i) => {
                      const sectors = choiceSectorLinks.data?.get(c.subject_id) ?? []
                      return (
                        <tr key={c.subject_id + i} style={{ borderBottom: '1px solid var(--pf-grey-100)', verticalAlign: 'top' }}>
                          <Td muted>{i + 1}</Td>
                          <Td>
                            <strong>{c.subject_name}</strong>
                          </Td>
                          <Td muted>{QUAL_LABELS[c.level]}</Td>
                          <Td>
                            {sectors.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '2px' }}>
                                {sectors.map((s) => (
                                  <span
                                    key={s}
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                      backgroundColor: 'var(--pf-grey-100)',
                                      color: 'var(--pf-grey-700)',
                                    }}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--pf-grey-400)', fontSize: '0.8125rem' }}>
                                Not yet mapped
                              </span>
                            )}
                          </Td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </WorksheetSection>

            {/* What my choices open up */}
            <WorksheetSection title="What your choices open up">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <StatCard
                  label="University courses connected"
                  value={consequenceQuery.isLoading ? '...' : String(matchedCourseCount)}
                  context={totalCourses > 0 ? `of ${totalCourses}` : ''}
                />
                <StatCard
                  label="Career sectors covered"
                  value={consequenceQuery.isLoading ? '...' : String(matchedSectorCount)}
                  context={`of ${sectorOptions.length}`}
                />
                {(year === 's5' || year === 's6') && (
                  <StatCard
                    label={`UCAS tariff (at predicted grade ${predictedGrade})`}
                    value={String(ucasEstimate)}
                    context="tariff points"
                  />
                )}
              </div>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-500)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Course count is the number of Scottish university courses that list any of your
                chosen subjects in their entry requirements. Some courses will require additional
                subjects you have not picked.
              </p>
            </WorksheetSection>

            {/* What I might be missing */}
            {selectedSectorIds.length > 0 && (
              <WorksheetSection title="What you might be missing">
                <SectorAlignment
                  selectedSectorIds={selectedSectorIds}
                  matchedSectorIds={consequenceQuery.data?.sectorIds ?? new Set<string>()}
                  sectorOptions={sectorOptions}
                />
              </WorksheetSection>
            )}

            {/* Questions for guidance teacher */}
            <WorksheetSection title="Questions to ask your guidance teacher">
              <ol
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: 'var(--pf-grey-700)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.8,
                }}
              >
                <li>
                  Can I take{' '}
                  <strong>
                    {choices
                      .filter((c) => !!c.subject_id)
                      .slice(0, 2)
                      .map((c) => c.subject_name)
                      .join(' and ')}
                  </strong>{' '}
                  alongside each other in my school&apos;s timetable?
                </li>
                {(year === 's5' || year === 's6') && (
                  <li>
                    Are all of my chosen subjects available at{' '}
                    {yearConfig?.allowsLevelChoice ? 'Higher and Advanced Higher' : 'Higher'} at this school?
                  </li>
                )}
                <li>
                  What support is available if I find a subject challenging during the year?
                </li>
                {selectedSectorIds.length > 0 && (
                  <li>
                    Are my chosen subjects a good fit for{' '}
                    {sectorOptions
                      .filter((s) => selectedSectorIds.includes(s.id))
                      .map((s) => s.name)
                      .join(', ')}{' '}
                    careers?
                  </li>
                )}
                <li>
                  Are there widening access programmes, bursaries, or summer schools I should be
                  applying for now?
                </li>
              </ol>
            </WorksheetSection>

            {/* Next steps */}
            <div
              className="no-print"
              style={{
                marginTop: '24px',
                padding: '20px 24px',
                borderRadius: '12px',
                backgroundColor: 'var(--pf-blue-50)',
                border: '1px solid var(--pf-blue-100)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'var(--pf-grey-900)',
                  marginBottom: '8px',
                }}
              >
                Want to save this worksheet?
              </p>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', marginBottom: '16px', lineHeight: 1.55 }}>
                Sign up free to save your worksheet, sync your subject choices with the Pathfinder
                planner, and get a personalised version with your school&apos;s data.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/auth/sign-up" className="pf-btn-primary no-underline hover:no-underline">
                  Create free account
                </Link>
                <Link href="/tools/worksheet" className="pf-btn-secondary no-underline hover:no-underline">
                  See the personalised worksheet
                </Link>
              </div>
            </div>

            {/* Print footer */}
            <div className="print-only worksheet-print-footer" aria-hidden="true">
              Pathfinder Scotland &middot; pathfinderscot.co.uk &middot; Generated{' '}
              {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section
      className="pf-card no-print"
      style={{ padding: '24px 28px', marginBottom: '20px' }}
    >
      <h2
        style={{
          fontSize: '1.0625rem',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'baseline',
          gap: '10px',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--pf-blue-700)',
            color: '#fff',
            fontSize: '0.8125rem',
            fontWeight: 700,
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function WorksheetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="worksheet-section pf-card"
      style={{ padding: '22px 28px', marginBottom: '20px' }}
    >
      <h3 style={{ fontSize: '1rem', marginBottom: '14px' }}>{title}</h3>
      {children}
    </section>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '8px 12px',
        fontWeight: 600,
        color: 'var(--pf-grey-600)',
        fontSize: '0.8125rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  muted,
}: {
  children: React.ReactNode
  muted?: boolean
}) {
  return (
    <td
      style={{
        padding: '10px 12px',
        color: muted ? 'var(--pf-grey-500)' : 'var(--pf-grey-900)',
        fontSize: '0.9375rem',
        verticalAlign: 'top',
      }}
    >
      {children}
    </td>
  )
}

function StatCard({ label, value, context }: { label: string; value: string; context: string }) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '10px',
        backgroundColor: 'var(--pf-blue-50)',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '6px' }}>{label}</p>
      <p
        className="pf-data-number"
        style={{
          fontSize: '1.625rem',
          fontWeight: 700,
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          lineHeight: 1.1,
          marginBottom: '4px',
        }}
      >
        {value}
      </p>
      {context && (
        <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-500)' }}>{context}</p>
      )}
    </div>
  )
}

function SectorAlignment({
  selectedSectorIds,
  matchedSectorIds,
  sectorOptions,
}: {
  selectedSectorIds: string[]
  matchedSectorIds: Set<string>
  sectorOptions: { id: string; name: string }[]
}) {
  const selected = sectorOptions.filter((s) => selectedSectorIds.includes(s.id))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {selected.map((s) => {
        const isMatched = matchedSectorIds.has(s.id)
        return (
          <div
            key={s.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${isMatched ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              backgroundColor: isMatched ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.06)',
            }}
          >
            <span style={{ fontWeight: 500, color: 'var(--pf-grey-900)' }}>{s.name}</span>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: isMatched ? 'var(--pf-green-500)' : 'var(--pf-amber-500)',
              }}
            >
              {isMatched
                ? 'Your subjects support this sector'
                : 'Consider adding a subject linked to this sector'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
