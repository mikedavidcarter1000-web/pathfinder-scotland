'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useStudentGrades } from '@/hooks/use-student'
import {
  useGradeSensitivity,
  type GradeEntry,
  type CourseInfo,
  type SubjectSensitivity,
  type SensitivityAnalysis,
} from '@/hooks/use-grade-sensitivity'
import { SUBJECTS } from '@/lib/constants'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/components/ui/toast'
import type { Tables } from '@/types/database'

export default function GradeSensitivityPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <GradeSensitivityContent />
    </Suspense>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────

function PageLoading() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh' }}>
      <div style={{ backgroundColor: 'var(--pf-blue-50)', padding: '64px 16px' }}>
        <div className="max-w-[1200px] mx-auto">
          <Skeleton height={48} width="60%" style={{ marginBottom: '16px' }} />
          <Skeleton height={24} width="80%" style={{ marginBottom: '32px' }} />
          <Skeleton height={300} />
        </div>
      </div>
    </div>
  )
}

// ── Main content ──────────────────────────────────────────────────────

function GradeSensitivityContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const toast = useToast()
  const { user } = useAuth()
  const { data: studentGrades } = useStudentGrades() as {
    data: Tables<'student_grades'>[] | undefined
  }

  // Parse URL params for shared grades
  const urlGrades = useMemo<GradeEntry[] | null>(() => {
    const param = searchParams.get('grades')
    if (!param) return null
    try {
      return param.split(',').map((pair) => {
        const [subject, grade] = pair.split(':')
        return {
          subject: decodeURIComponent(subject),
          grade: grade?.toUpperCase() ?? 'C',
        }
      }).filter((g) => g.subject && ['A', 'B', 'C', 'D'].includes(g.grade))
    } catch {
      return null
    }
  }, [searchParams])

  // Determine initial grades: URL params > student grades > empty
  const hasStudentHighers = useMemo(() => {
    if (!studentGrades) return false
    return studentGrades.filter((g) => g.qualification_type === 'higher').length > 0
  }, [studentGrades])

  const initialGrades = useMemo<GradeEntry[]>(() => {
    if (urlGrades && urlGrades.length >= 3) return urlGrades

    if (hasStudentHighers && studentGrades) {
      return studentGrades
        .filter((g) => g.qualification_type === 'higher' && g.grade)
        .map((g) => ({
          subject: g.subject,
          grade: g.grade,
          subjectId: g.subject_id ?? undefined,
        }))
    }

    return []
  }, [urlGrades, hasStudentHighers, studentGrades])

  // Editable grade state
  const [grades, setGrades] = useState<GradeEntry[]>(initialGrades)
  const [hasRun, setHasRun] = useState(false)

  // Sync initial grades once they load
  useEffect(() => {
    if (initialGrades.length > 0 && grades.length === 0) {
      setGrades(initialGrades)
    }
  }, [initialGrades]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-run analysis if grades came from URL or student profile
  useEffect(() => {
    if (initialGrades.length >= 3 && !hasRun) {
      setHasRun(true)
    }
  }, [initialGrades]) // eslint-disable-line react-hooks/exhaustive-deps

  const { analysis, isLoading, isReady } = useGradeSensitivity(
    hasRun ? grades : [],
  )

  const handleRunAnalysis = useCallback(() => {
    if (grades.length < 3) {
      toast.error('Need more grades', 'Enter at least 3 Higher grades to run the analysis.')
      return
    }
    const invalid = grades.some((g) => !g.subject || !g.grade)
    if (invalid) {
      toast.error('Incomplete grades', 'Make sure every row has both a subject and grade selected.')
      return
    }
    setHasRun(true)
  }, [grades, toast])

  const handleShare = useCallback(async () => {
    const encoded = grades
      .map((g) => `${encodeURIComponent(g.subject)}:${g.grade}`)
      .join(',')
    const url = `${window.location.origin}/tools/grade-sensitivity?grades=${encoded}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied', 'Share it with parents, teachers, or guidance staff.')
    } catch {
      toast.error('Copy failed', 'Please copy the URL from your browser address bar.')
    }
  }, [grades, toast])

  const handleGradeChange = useCallback(
    (index: number, field: 'subject' | 'grade', value: string) => {
      setGrades((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        return next
      })
      setHasRun(false)
    },
    [],
  )

  const handleAddRow = useCallback(() => {
    setGrades((prev) => [...prev, { subject: '', grade: 'C' }])
    setHasRun(false)
  }, [])

  const handleRemoveRow = useCallback((index: number) => {
    setGrades((prev) => prev.filter((_, i) => i !== index))
    setHasRun(false)
  }, [])

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '100vh' }}>
      {/* Hero */}
      <HeroSection />

      {/* Grade Input */}
      <section
        className="pf-container"
        style={{ paddingTop: '32px', paddingBottom: '32px' }}
      >
        <GradeInputSection
          grades={grades}
          isLoggedIn={!!user}
          hasStudentGrades={hasStudentHighers}
          onGradeChange={handleGradeChange}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
          onRunAnalysis={handleRunAnalysis}
          isLoading={isLoading}
        />
      </section>

      {/* Results */}
      {isLoading && hasRun && (
        <section className="pf-container" style={{ paddingBottom: '48px' }}>
          <div className="pf-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div
              className="mx-auto mb-4 rounded-full animate-spin"
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--pf-grey-300)',
                borderTopColor: 'var(--pf-blue-700)',
              }}
            />
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1.125rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '4px',
              }}
            >
              Analysing your grades...
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
              Checking eligibility across all courses
            </p>
          </div>
        </section>
      )}

      {analysis && hasRun && (
        <div style={{ paddingBottom: '64px' }}>
          {/* Section A: Current position */}
          <CurrentPositionSection analysis={analysis} />

          {/* Section B: Sensitivity table */}
          <SensitivityTableSection
            sensitivity={analysis.sensitivity}
            baselineCount={analysis.baseline.eligibleCount}
          />

          {/* Section C: Missing subjects */}
          {analysis.missingSubjects.length > 0 && (
            <MissingSubjectsSection missingSubjects={analysis.missingSubjects} />
          )}

          {/* Section D: Biggest risks */}
          {analysis.biggestRisk && analysis.biggestRisk.downgradeDelta < 0 && (
            <BiggestRiskSection risk={analysis.biggestRisk} />
          )}

          {/* Section E: WA comparison */}
          {analysis.waComparison && (
            <WaComparisonSection
              waComparison={analysis.waComparison}
              sensitivity={analysis.sensitivity}
            />
          )}

          {/* Share button */}
          <section className="pf-container" style={{ paddingTop: '32px' }}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={handleShare} className="pf-btn-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share these results
              </button>
              <Link href="/pathways" className="pf-btn-secondary no-underline hover:no-underline">
                Plan your subjects
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

// ── Hero Section ──────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <div
        className="pf-container"
        style={{ paddingTop: '48px', paddingBottom: '48px' }}
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.75rem, 5vw, 2rem)' }}>
              How much does one grade matter?
            </h1>
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                maxWidth: '520px',
              }}
            >
              See exactly how improving or dropping a grade changes which university
              courses you can apply for.
            </p>
          </div>
          {/* Visual: stylised bar chart */}
          <div className="flex items-end justify-center gap-3" style={{ height: '180px' }} aria-hidden="true">
            {[
              { h: '45%', label: 'D', color: 'var(--pf-red-500)', opacity: 0.2 },
              { h: '60%', label: 'C', color: 'var(--pf-amber-500)', opacity: 0.3 },
              { h: '80%', label: 'B', color: 'var(--pf-blue-500)', opacity: 0.5 },
              { h: '100%', label: 'A', color: 'var(--pf-green-500)', opacity: 0.7 },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-2" style={{ flex: 1, maxWidth: '80px' }}>
                <div
                  className="w-full rounded-t-lg"
                  style={{
                    height: bar.h,
                    backgroundColor: bar.color,
                    opacity: bar.opacity,
                    minHeight: '40px',
                    transition: 'height 0.3s ease',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'var(--pf-grey-600)',
                  }}
                >
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Grade Input Section ───────────────────────────────────────────────

const HIGHER_SUBJECTS = SUBJECTS.higher

function GradeInputSection({
  grades,
  isLoggedIn,
  hasStudentGrades,
  onGradeChange,
  onAddRow,
  onRemoveRow,
  onRunAnalysis,
  isLoading,
}: {
  grades: GradeEntry[]
  isLoggedIn: boolean
  hasStudentGrades: boolean
  onGradeChange: (index: number, field: 'subject' | 'grade', value: string) => void
  onAddRow: () => void
  onRemoveRow: (index: number) => void
  onRunAnalysis: () => void
  isLoading: boolean
}) {
  const showManualEntry = !isLoggedIn || !hasStudentGrades

  return (
    <div className="pf-card">
      <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
        {showManualEntry ? 'Enter your Higher grades' : 'Your current grades'}
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '20px' }}>
        {showManualEntry
          ? 'Add at least 3 Higher subjects to run the analysis. You can adjust grades to explore different scenarios.'
          : 'Adjust any grade below to see how it changes your options.'}
      </p>

      <div className="space-y-3" style={{ marginBottom: '16px' }}>
        {grades.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
          >
            {/* Subject select */}
            <select
              value={entry.subject}
              onChange={(e) => onGradeChange(index, 'subject', e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--pf-grey-300)',
                backgroundColor: 'var(--pf-white)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9375rem',
                minHeight: '44px',
                minWidth: 0,
              }}
            >
              <option value="">Select subject...</option>
              {HIGHER_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Grade select */}
            <select
              value={entry.grade}
              onChange={(e) => onGradeChange(index, 'grade', e.target.value)}
              style={{
                width: '80px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--pf-grey-300)',
                backgroundColor: 'var(--pf-white)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: '44px',
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              {['A', 'B', 'C', 'D'].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Remove button */}
            <button
              onClick={() => onRemoveRow(index)}
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                color: 'var(--pf-grey-600)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label={`Remove ${entry.subject || 'subject'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onAddRow} className="pf-btn-ghost pf-btn-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add another subject
        </button>

        <button
          onClick={onRunAnalysis}
          disabled={isLoading || grades.length < 3}
          className="pf-btn-primary pf-btn-sm"
        >
          {isLoading ? 'Analysing...' : 'Analyse my grades'}
        </button>

        {grades.length < 3 && grades.length > 0 && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
            Add {3 - grades.length} more subject{3 - grades.length !== 1 ? 's' : ''} to continue
          </span>
        )}
      </div>
    </div>
  )
}

// ── Section A: Current Position ───────────────────────────────────────

function CurrentPositionSection({ analysis }: { analysis: SensitivityAnalysis }) {
  const [expanded, setExpanded] = useState(false)
  const { baseline } = analysis
  const topCourses = expanded
    ? baseline.eligibleCourses
    : baseline.eligibleCourses.slice(0, 10)

  return (
    <section style={{ backgroundColor: 'var(--pf-white)', padding: '48px 0' }}>
      <div className="pf-container">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your current position</h2>
        <p style={{ fontSize: '1.0625rem', color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
          With your current grades, you&apos;re eligible for{' '}
          <span
            className="pf-data-number"
            style={{ fontWeight: 700, color: 'var(--pf-grey-900)' }}
          >
            {baseline.eligibleCount} courses
          </span>{' '}
          across{' '}
          <span
            className="pf-data-number"
            style={{ fontWeight: 700, color: 'var(--pf-grey-900)' }}
          >
            {baseline.universityCount} universities
          </span>
          {baseline.eligibleViaWaCount > 0 && (
            <>
              {', including '}
              <span
                className="pf-data-number"
                style={{ fontWeight: 600, color: '#B45309' }}
              >
                {baseline.eligibleViaWaCount} via widening access
              </span>
            </>
          )}
        </p>

        {baseline.eligibleCount > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="pf-card-hover no-underline hover:no-underline"
                style={{ padding: '16px' }}
              >
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '2px',
                  }}
                >
                  {course.name}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                  {course.universityName}
                </p>
              </Link>
            ))}
          </div>
        )}

        {baseline.eligibleCount > 10 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="pf-btn-ghost pf-btn-sm"
            style={{ marginTop: '16px' }}
          >
            Show all {baseline.eligibleCount} courses
          </button>
        )}
        {expanded && baseline.eligibleCount > 10 && (
          <button
            onClick={() => setExpanded(false)}
            className="pf-btn-ghost pf-btn-sm"
            style={{ marginTop: '16px' }}
          >
            Show fewer
          </button>
        )}

        {baseline.eligibleCount === 0 && (
          <div
            className="rounded-lg"
            style={{
              padding: '24px',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
            }}
          >
            <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)' }}>
              Your current grades don&apos;t meet the published requirements for any courses
              in our database. Check the analysis below to see where improving a single grade
              could make a difference.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Section B: Sensitivity Table ──────────────────────────────────────

function SensitivityTableSection({
  sensitivity,
  baselineCount,
}: {
  sensitivity: SubjectSensitivity[]
  baselineCount: number
}) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)

  return (
    <section style={{ backgroundColor: 'var(--pf-grey-100)', padding: '48px 0' }}>
      <div className="pf-container">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          Where one grade makes the difference
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
          How changing a single subject grade affects your total eligible courses.
        </p>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="pf-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--pf-blue-50)',
                    borderBottom: '1px solid var(--pf-grey-300)',
                  }}
                >
                  <Th>Subject</Th>
                  <Th align="center">Current</Th>
                  <Th align="center">If you improve</Th>
                  <Th align="center">If you drop</Th>
                </tr>
              </thead>
              <tbody>
                {sensitivity.map((row) => (
                  <SensitivityRow
                    key={row.subject}
                    row={row}
                    isExpanded={expandedSubject === row.subject}
                    onToggle={() =>
                      setExpandedSubject(
                        expandedSubject === row.subject ? null : row.subject,
                      )
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {sensitivity.map((row) => (
            <SensitivityCard
              key={row.subject}
              row={row}
              isExpanded={expandedSubject === row.subject}
              onToggle={() =>
                setExpandedSubject(
                  expandedSubject === row.subject ? null : row.subject,
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: string }) {
  return (
    <th
      style={{
        padding: '14px 20px',
        textAlign: align as React.CSSProperties['textAlign'],
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: '0.8125rem',
        color: 'var(--pf-grey-600)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </th>
  )
}

function SensitivityRow({
  row,
  isExpanded,
  onToggle,
}: {
  row: SubjectSensitivity
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasUpgrade = row.upgradeGrade !== null
  const hasDowngrade = row.downgradeGrade !== null

  return (
    <>
      <tr
        style={{
          borderBottom: '1px solid var(--pf-grey-100)',
          cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        <td style={{ padding: '16px 20px' }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-900)',
            }}
          >
            {row.subject}
          </span>
        </td>
        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
          <GradeBadge grade={row.currentGrade} />
        </td>
        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
          {hasUpgrade ? (
            <ImpactBadge
              delta={row.upgradeDelta}
              grade={row.upgradeGrade!}
              direction="up"
              courses={row.upgradeCourses}
            />
          ) : (
            <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
              Already at A
            </span>
          )}
        </td>
        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
          {hasDowngrade ? (
            <ImpactBadge
              delta={row.downgradeDelta}
              grade={row.downgradeGrade!}
              direction="down"
              courses={row.downgradeCourses}
            />
          ) : (
            <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
              Already at D
            </span>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={4} style={{ padding: '0 20px 16px' }}>
            <ExpandedCourseList row={row} />
          </td>
        </tr>
      )}
    </>
  )
}

function SensitivityCard({
  row,
  isExpanded,
  onToggle,
}: {
  row: SubjectSensitivity
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasUpgrade = row.upgradeGrade !== null
  const hasDowngrade = row.downgradeGrade !== null

  return (
    <div className="pf-card" style={{ padding: '16px' }}>
      <button
        onClick={onToggle}
        className="w-full text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--pf-grey-900)',
            }}
          >
            {row.subject}
          </span>
          <GradeBadge grade={row.currentGrade} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', display: 'block', marginBottom: '4px' }}>
              {hasUpgrade ? `Improve to ${row.upgradeGrade}` : 'Already at A'}
            </span>
            {hasUpgrade && (
              <ImpactBadge
                delta={row.upgradeDelta}
                grade={row.upgradeGrade!}
                direction="up"
                courses={row.upgradeCourses}
              />
            )}
          </div>
          <div className="flex-1">
            <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', display: 'block', marginBottom: '4px' }}>
              {hasDowngrade ? `Drop to ${row.downgradeGrade}` : 'Already at D'}
            </span>
            {hasDowngrade && (
              <ImpactBadge
                delta={row.downgradeDelta}
                grade={row.downgradeGrade!}
                direction="down"
                courses={row.downgradeCourses}
              />
            )}
          </div>
        </div>
      </button>
      {isExpanded && <ExpandedCourseList row={row} />}
    </div>
  )
}

function ExpandedCourseList({ row }: { row: SubjectSensitivity }) {
  return (
    <div
      className="mt-3 pt-3"
      style={{ borderTop: '1px solid var(--pf-grey-100)' }}
    >
      {row.upgradeCourses.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <p
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#047857',
              marginBottom: '6px',
            }}
          >
            Courses you&apos;d gain with {row.upgradeGrade}:
          </p>
          <CourseChipList courses={row.upgradeCourses} />
        </div>
      )}
      {row.downgradeCourses.length > 0 && (
        <div>
          <p
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#B91C1C',
              marginBottom: '6px',
            }}
          >
            Courses you&apos;d lose with {row.downgradeGrade}:
          </p>
          <CourseChipList courses={row.downgradeCourses} />
        </div>
      )}
      {row.upgradeCourses.length === 0 && row.downgradeCourses.length === 0 && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
          Changing this grade has no impact on your eligible courses.
        </p>
      )}
    </div>
  )
}

function CourseChipList({ courses }: { courses: CourseInfo[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? courses : courses.slice(0, 5)

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((c) => (
        <Link
          key={c.id}
          href={`/courses/${c.id}`}
          className="no-underline hover:no-underline"
          style={{
            display: 'inline-flex',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: 'var(--pf-blue-100)',
            color: 'var(--pf-blue-700)',
          }}
        >
          {c.name} — {c.universityName}
        </Link>
      ))}
      {courses.length > 5 && !showAll && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowAll(true) }}
          style={{
            display: 'inline-flex',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: 'var(--pf-grey-100)',
            color: 'var(--pf-grey-900)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          +{courses.length - 5} more
        </button>
      )}
    </div>
  )
}

// ── Section C: Missing Subjects ───────────────────────────────────────

function MissingSubjectsSection({
  missingSubjects,
}: {
  missingSubjects: SensitivityAnalysis['missingSubjects']
}) {
  return (
    <section style={{ backgroundColor: 'var(--pf-white)', padding: '48px 0' }}>
      <div className="pf-container">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
          Subjects you could add
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
          Subjects that would open the most doors if you added them at Higher level.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {missingSubjects.map((ms) => (
            <div key={ms.subjectId} className="pf-card" style={{ padding: '20px' }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '1.0625rem',
                    color: 'var(--pf-grey-900)',
                    margin: 0,
                  }}
                >
                  {ms.subject}
                </h3>
                <span
                  className="pf-data-number"
                  style={{
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: 'var(--pf-green-500)',
                    flexShrink: 0,
                  }}
                >
                  +{ms.coursesUnlocked}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
                Adding Higher {ms.subject} at grade {ms.gradeNeeded} would unlock{' '}
                <strong>{ms.coursesUnlocked} more course{ms.coursesUnlocked !== 1 ? 's' : ''}</strong>
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {ms.courses.slice(0, 3).map((c) => (
                  <span
                    key={c.id}
                    style={{
                      display: 'inline-flex',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      backgroundColor: 'var(--pf-blue-100)',
                      color: 'var(--pf-blue-700)',
                    }}
                  >
                    {c.name}
                  </span>
                ))}
                {ms.courses.length > 3 && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--pf-grey-600)',
                      padding: '3px 0',
                    }}
                  >
                    +{ms.courses.length - 3} more
                  </span>
                )}
              </div>
              <Link
                href={`/subjects/${ms.subjectId}`}
                className="pf-btn-ghost pf-btn-sm no-underline hover:no-underline"
                style={{ padding: '6px 0', fontSize: '0.8125rem' }}
              >
                Learn about {ms.subject} →
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px' }}>
          <Link href="/pathways" className="pf-btn-secondary no-underline hover:no-underline">
            Plan your subjects →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Section D: Biggest Risk ───────────────────────────────────────────

function BiggestRiskSection({ risk }: { risk: SubjectSensitivity }) {
  return (
    <section style={{ backgroundColor: 'var(--pf-grey-100)', padding: '48px 0' }}>
      <div className="pf-container">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Your biggest risks</h2>
        <div
          className="pf-card"
          style={{
            padding: '24px',
            borderLeft: '4px solid var(--pf-red-500)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--pf-red-500)',
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1.0625rem',
                  color: 'var(--pf-grey-900)',
                  marginBottom: '6px',
                }}
              >
                Your most grade-sensitive subject is {risk.subject}
              </p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
                Dropping from {risk.currentGrade} to {risk.downgradeGrade} would close{' '}
                <span style={{ fontWeight: 600, color: 'var(--pf-red-500)' }}>
                  {Math.abs(risk.downgradeDelta)} course{Math.abs(risk.downgradeDelta) !== 1 ? 's' : ''}
                </span>
                {risk.worstCaseDelta < risk.downgradeDelta && (
                  <>
                    {'. Worst case (dropping to D): '}
                    <span style={{ fontWeight: 600, color: 'var(--pf-red-500)' }}>
                      {Math.abs(risk.worstCaseDelta)} courses lost
                    </span>
                  </>
                )}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-blue-700)', fontWeight: 500 }}>
                Focus your revision time where it has the biggest impact on your options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Section E: WA Comparison ──────────────────────────────────────────

function WaComparisonSection({
  waComparison,
  sensitivity,
}: {
  waComparison: NonNullable<SensitivityAnalysis['waComparison']>
  sensitivity: SubjectSensitivity[]
}) {
  return (
    <section
      style={{
        backgroundColor: 'var(--pf-blue-900)',
        padding: '48px 0',
        color: '#fff',
      }}
    >
      <div className="pf-container">
        <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '16px' }}>
          How widening access changes the picture
        </h2>

        <div className="grid sm:grid-cols-3 gap-6" style={{ marginBottom: '24px' }}>
          <StatBlock
            label="Without widening access"
            value={waComparison.withoutWa}
            unit="courses"
          />
          <StatBlock
            label="With your WA status"
            value={waComparison.withWa}
            unit="courses"
            highlight
          />
          <StatBlock
            label="Additional courses from WA"
            value={waComparison.difference}
            unit="extra"
            highlight
          />
        </div>

        {waComparison.difference > 0 && (
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: '640px',
            }}
          >
            Widening access opens {waComparison.difference} additional course{waComparison.difference !== 1 ? 's' : ''}{' '}
            for you. Check the sensitivity table above to see which subject improvements
            give you the biggest advantage beyond what widening access already provides.
          </p>
        )}
      </div>
    </section>
  )
}

function StatBlock({
  label,
  value,
  unit,
  highlight,
}: {
  label: string
  value: number
  unit: string
  highlight?: boolean
}) {
  return (
    <div
      className="rounded-lg"
      style={{
        padding: '20px 24px',
        backgroundColor: highlight
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(255,255,255,0.05)',
      }}
    >
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '8px',
        }}
      >
        {label}
      </p>
      <p className="pf-data-number" style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
        {value}
      </p>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{unit}</p>
    </div>
  )
}

// ── Shared UI components ──────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const gradeColors: Record<string, { bg: string; text: string }> = {
    A: { bg: 'rgba(16, 185, 129, 0.12)', text: '#047857' },
    B: { bg: 'var(--pf-blue-100)', text: 'var(--pf-blue-700)' },
    C: { bg: 'rgba(245, 158, 11, 0.12)', text: '#B45309' },
    D: { bg: 'rgba(239, 68, 68, 0.12)', text: '#B91C1C' },
  }
  const colors = gradeColors[grade] ?? gradeColors.C

  return (
    <span
      className="pf-data-number"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '1rem',
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {grade}
    </span>
  )
}

function ImpactBadge({
  delta,
  grade,
  direction,
  courses,
}: {
  delta: number
  grade: string
  direction: 'up' | 'down'
  courses: CourseInfo[]
}) {
  const isPositive = delta > 0
  const isNegative = delta < 0
  const abs = Math.abs(delta)
  const isHighImpact = abs >= 5

  let color: string
  let bg: string
  if (direction === 'up') {
    color = isHighImpact ? '#047857' : 'var(--pf-grey-600)'
    bg = isHighImpact ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
  } else {
    color = isHighImpact ? '#B91C1C' : 'var(--pf-grey-600)'
    bg = isHighImpact ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
  }

  if (delta === 0) {
    return (
      <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
        No change with {grade}
      </span>
    )
  }

  return (
    <span
      className="pf-data-number"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '0.9375rem',
        color,
        backgroundColor: bg,
      }}
    >
      {isPositive ? '+' : ''}
      {delta} course{abs !== 1 ? 's' : ''}
      <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>
        ({grade})
      </span>
    </span>
  )
}
