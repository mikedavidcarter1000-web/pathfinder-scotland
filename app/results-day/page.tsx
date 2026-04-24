'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentStudent, useStudentGrades, useUpdateGrade, useGradeSummary, useBulkUpsertGrades } from '@/hooks/use-student'
import { useMatchedCourses } from '@/hooks/use-course-matching'
import { useHasAcceptedOffer } from '@/hooks/use-offers'
import {
  RESULTS_DAY_DISPLAY,
  useResultsDayCountdown,
  buildComparisons,
  overallShift,
  quickUCASPoints,
  useQuickEligibility,
  type GradeComparison,
} from '@/hooks/use-results-day'
import { useToast } from '@/components/ui/toast'
import { COMMON_SUBJECTS_BY_LEVEL } from '@/lib/constants'
import { useSubjects } from '@/hooks/use-subjects'
import { compareGradeStrings } from '@/lib/grades'
import type { Tables } from '@/types/database'
import { SchoolImportedResults } from '@/components/results-day/school-imported-results'
import { ResultsDayDecisionTree } from '@/components/results-day/results-day-decision-tree'
import { ResultsDayContacts } from '@/components/results-day/results-day-contacts'
import { ResultsDayHelplines } from '@/components/results-day/results-day-helplines'

type StudentGrade = Tables<'student_grades'>

// ── Grades available in the results dropdown ────────────────────────
const RESULT_GRADES = ['A', 'B', 'C', 'D', 'No Award']

// ── Page state ──────────────────────────────────────────────────────
interface QuickGrade {
  subject: string
  grade: string
}

const INITIAL_QUICK_GRADES: QuickGrade[] = Array.from({ length: 5 }, () => ({
  subject: '',
  grade: '',
}))

// ── Main page ───────────────────────────────────────────────────────

function ResultsDayContent() {
  const { user, isLoading: authLoading } = useAuth()
  const { data: student } = useCurrentStudent() as { data: Tables<'students'> | null | undefined }
  const { data: existingGrades, isLoading: gradesLoading } = useStudentGrades() as {
    data: StudentGrade[] | undefined
    isLoading: boolean
  }
  const gradeSummary = useGradeSummary()
  const { data: matchedCourses, stats: matchStats } = useMatchedCourses()
  const { hasAccepted, acceptedOffer } = useHasAcceptedOffer()
  const updateGrade = useUpdateGrade()
  const bulkUpsert = useBulkUpsertGrades()
  const toast = useToast()
  const countdown = useResultsDayCountdown()

  // Local state
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [actualMap, setActualMap] = useState<Record<string, string>>({})
  const [quickGrades, setQuickGrades] = useState<QuickGrade[]>(INITIAL_QUICK_GRADES)
  const [showResults, setShowResults] = useState(false)
  const [comparisons, setComparisons] = useState<GradeComparison[]>([])
  const [previousEligibleCount, setPreviousEligibleCount] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // Has the student already saved actual results?
  const hasActualResults = existingGrades?.some((g) => g.is_actual) ?? false

  // On return visits, derive comparisons from saved predicted_grade data
  const savedComparisons = useMemo<GradeComparison[]>(() => {
    if (!hasActualResults || comparisons.length > 0 || !existingGrades) return []
    return existingGrades
      .filter((g) => g.is_actual && g.predicted_grade)
      .map((g) => {
        const pIdx = ['A', 'B', 'C', 'D'].indexOf(g.predicted_grade!)
        const aIdx = ['A', 'B', 'C', 'D'].indexOf(g.grade)
        let change: 'up' | 'down' | 'same' = 'same'
        if (pIdx >= 0 && aIdx >= 0) {
          if (aIdx < pIdx) change = 'up'
          else if (aIdx > pIdx) change = 'down'
        }
        return {
          subject: g.subject,
          qualificationType: g.qualification_type,
          predictedGrade: g.predicted_grade!,
          actualGrade: g.grade,
          change,
        }
      })
  }, [hasActualResults, existingGrades, comparisons.length])

  // Quick eligibility for logged-out users
  const quickEligibility = useQuickEligibility(
    quickGrades,
    !user && showResults
  )

  // Logged-in eligibility stats
  const eligibleCount = (matchStats?.eligible ?? 0) + (matchStats?.eligibleViaWa ?? 0)
  const waCount = matchStats?.eligibleViaWa ?? 0
  const uniqueUnis = useMemo(() => {
    if (!matchedCourses) return 0
    const ids = new Set(
      matchedCourses
        .filter(
          (c) =>
            c.eligibility?.status === 'eligible' ||
            c.eligibility?.status === 'eligible_via_wa'
        )
        .map((c) => c.university_id)
    )
    return ids.size
  }, [matchedCourses])

  // ── Handlers ────────────────────────────────────────────────────

  const handleUpdateActual = (gradeId: string, value: string) => {
    setActualMap((prev) => ({ ...prev, [gradeId]: value }))
  }

  const handleSaveActualResults = async () => {
    if (!existingGrades || !user) return
    setSaving(true)
    // Capture predicted state before saving
    const prevCount = eligibleCount
    setPreviousEligibleCount(prevCount)
    const comps = buildComparisons(existingGrades, actualMap)
    setComparisons(comps)

    try {
      for (const grade of existingGrades) {
        const actual = actualMap[grade.id]
        if (!actual || actual === '') continue
        await updateGrade.mutateAsync({
          gradeId: grade.id,
          data: {
            predicted_grade: grade.grade,
            grade: actual === 'No Award' ? 'D' : actual,
            is_actual: true,
            predicted: false,
          },
        })
      }
      setShowResults(true)
      setShowUpdateForm(false)
      toast.success('Results saved', 'Your actual grades have been recorded')
    } catch (err) {
      toast.error('Failed to save', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFreshGrades = async () => {
    if (!user) return
    setSaving(true)
    try {
      const toSave = quickGrades
        .filter((g) => g.subject && g.grade)
        .map((g) => ({
          subject: g.subject,
          grade: g.grade === 'No Award' ? 'D' : g.grade,
          qualification_type: 'higher' as const,
          predicted: false,
          is_actual: true,
        }))
      await bulkUpsert.mutateAsync(toSave)
      setShowResults(true)
      toast.success('Results saved', 'Your grades have been recorded')
    } catch (err) {
      toast.error('Failed to save', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const handleQuickEntry = () => {
    setShowResults(true)
  }

  // Check offers against actual grades
  const offerStatus = useMemo(() => {
    if (!hasAccepted || !acceptedOffer || !existingGrades || !showResults) return null
    const offerGrades = acceptedOffer.offer_grades
    if (!offerGrades) return null
    const higherString = gradeSummary.highers || ''
    if (!higherString) return null
    const met = compareGradeStrings(higherString, offerGrades) >= 0
    return { met, offerGrades, courseName: (acceptedOffer as any).course?.name ?? 'your firm choice' }
  }, [hasAccepted, acceptedOffer, existingGrades, showResults, gradeSummary.highers])

  // Merge current-session and saved comparisons
  const activeComparisons = comparisons.length > 0 ? comparisons : savedComparisons

  // Determine which result advice to show
  const resultOutcome = useMemo(() => {
    if (activeComparisons.length === 0) return null
    const shift = overallShift(activeComparisons)
    const worse = activeComparisons.filter((c) => c.change === 'down')
    if (shift > 0) return 'better'
    if (shift === 0) return 'match'
    if (worse.length >= 2 || shift <= -3) return 'significantly_worse'
    return 'worse'
  }, [activeComparisons])

  const isLoggedIn = !!user && !authLoading
  const hasExistingGrades = (existingGrades?.length ?? 0) > 0

  // ── UCAS points for whatever mode ─────────────────────────────
  const ucasPoints = isLoggedIn
    ? gradeSummary.ucasPoints
    : quickUCASPoints(quickGrades.filter((g) => g.subject && g.grade).map((g) => ({ grade: g.grade, qualification_type: 'higher' })))
  const higherString = isLoggedIn
    ? gradeSummary.highers
    : quickGrades
        .filter((g) => g.subject && g.grade && g.grade !== 'No Award')
        .map((g) => g.grade)
        .sort((a, b) => ['A', 'B', 'C', 'D'].indexOf(a) - ['A', 'B', 'C', 'D'].indexOf(b))
        .slice(0, 5)
        .join('')

  // Quick eligible counts for logged-out
  const quickEligible = quickEligibility.stats.eligible + quickEligibility.stats.eligibleViaWa
  const quickUnis = quickEligibility.universityCount

  return (
    <div>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section
        className="py-12 sm:py-16"
        style={{ backgroundColor: 'var(--pf-blue-50)', position: 'relative', overflow: 'hidden' }}
      >
        <div className="pf-container relative" style={{ zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <span className="pf-badge-blue inline-flex" style={{ marginBottom: '16px' }}>
                {RESULTS_DAY_DISPLAY}
              </span>
              <h1
                style={{
                  fontSize: 'clamp(1.875rem, 5vw, 3rem)',
                  lineHeight: 1.1,
                  marginBottom: '16px',
                  color: 'var(--pf-grey-900)',
                }}
              >
                Results Day 2026
              </h1>
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--pf-grey-600)',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  maxWidth: '520px',
                }}
              >
                Enter your results and instantly see which university courses you qualify for
              </p>

              {/* Date callout + countdown / status */}
              <div
                className="rounded-lg"
                style={{
                  padding: '20px 24px',
                  backgroundColor: 'var(--pf-white)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  maxWidth: '480px',
                }}
              >
                {countdown.isBeforeResultsDay ? (
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--pf-blue-100)',
                        color: 'var(--pf-blue-700)',
                      }}
                    >
                      <span
                        className="pf-data-number"
                        style={{ fontSize: '1.5rem', fontWeight: 700 }}
                      >
                        {countdown.daysUntil}
                      </span>
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: 'var(--pf-grey-900)',
                          marginBottom: '2px',
                        }}
                      >
                        {countdown.daysUntil === 1 ? '1 day' : `${countdown.daysUntil} days`} until Results Day
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                        Qualifications Scotland results are released on {RESULTS_DAY_DISPLAY}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--pf-green-500)',
                      }}
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: 'var(--pf-grey-900)',
                          marginBottom: '2px',
                        }}
                      >
                        Results are out — enter yours below
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                        See which courses you qualify for instantly
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visual element */}
            <div className="flex items-center justify-center">
              <ResultsDayIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* School-imported SQA results (silent when no rows). */}
      <SchoolImportedResults />

      {/* ── OFFER CHECK BANNER ─────────────────────────────────── */}
      {offerStatus && showResults && (
        <section
          className="py-6"
          style={{
            backgroundColor: offerStatus.met ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          }}
        >
          <div className="pf-container">
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: offerStatus.met ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: offerStatus.met ? 'var(--pf-green-500)' : 'var(--pf-amber-500)',
                }}
              >
                {offerStatus.met ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>
                  {offerStatus.met
                    ? 'Your conditions are met!'
                    : 'Your offer conditions may not be met'}
                </h2>
                <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                  {offerStatus.met
                    ? `Congratulations! Your grades meet the ${offerStatus.offerGrades} requirement for ${offerStatus.courseName}. Check UCAS Track for confirmation.`
                    : `Your grades may not meet the ${offerStatus.offerGrades} requirement for ${offerStatus.courseName}. Don't panic — universities sometimes accept students who narrowly miss. Contact them directly.`}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PRE-RESULTS CHECKLIST ─────────────────────────────── */}
      {countdown.isBeforeResultsDay && !showResults && !hasActualResults && (
        <section className="pf-section pf-section-white">
          <div className="pf-container" style={{ maxWidth: '760px' }}>
            <h2 style={{ marginBottom: '8px' }}>Preparing for Results Day</h2>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '32px' }}>
              Get ready now so you can act quickly when your results arrive.
            </p>

            <div className="space-y-3">
              {[
                'Know your login for the Qualifications Scotland results portal',
                'Check your UCAS Track login works (ucas.com)',
                "Know your school's contact number for Results Day",
                'Have your SAAS funding application submitted',
                'Review your firm and insurance choices on UCAS Track',
                'Know the Clearing process in case you need it',
                'Have your UCAS ID ready (it starts with your year of entry)',
                'Check your predicted grades against your saved Pathfinder courses',
              ].map((item, i) => (
                <ChecklistItem key={i} label={item} />
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4" style={{ marginTop: '32px' }}>
              <LinkCard
                href="/tools/grade-sensitivity"
                title="Grade sensitivity tool"
                description="See how different results would affect your options"
                colour="var(--pf-green-500)"
              />
              <LinkCard
                href="/benefits"
                title="Benefits profile"
                description="Complete your profile — you might need to apply for funding quickly"
                colour="var(--pf-amber-500)"
              />
              {hasAccepted && (
                <LinkCard
                  href="/prep"
                  title="Prep Hub"
                  description="Make sure you're ready if your offer is confirmed"
                  colour="var(--pf-blue-700)"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── GRADE ENTRY ───────────────────────────────────────── */}
      {!showResults && !hasActualResults && (
        <section
          className="pf-section"
          style={{ backgroundColor: 'var(--pf-grey-100)' }}
        >
          <div className="pf-container" style={{ maxWidth: '760px' }}>
            {/* Mode 1: Logged in with existing grades — update to actual */}
            {isLoggedIn && hasExistingGrades && !showUpdateForm && (
              <div className="text-center">
                <h2 style={{ marginBottom: '8px' }}>Your predicted grades</h2>
                <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
                  You have {existingGrades!.length} predicted grade{existingGrades!.length !== 1 ? 's' : ''} on file.
                  Update them with your actual results.
                </p>

                <div className="pf-card" style={{ textAlign: 'left', marginBottom: '24px' }}>
                  {existingGrades!.map((g, i) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between"
                      style={{
                        padding: '12px 0',
                        borderTop: i > 0 ? '1px solid var(--pf-grey-100)' : 'none',
                      }}
                    >
                      <span style={{ fontWeight: 500, color: 'var(--pf-grey-900)' }}>{g.subject}</span>
                      <span
                        className="pf-data-number"
                        style={{ fontWeight: 600, color: 'var(--pf-grey-600)' }}
                      >
                        {g.grade} ({g.qualification_type === 'higher' ? 'Higher' : g.qualification_type === 'advanced_higher' ? 'Adv Higher' : 'N5'})
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowUpdateForm(true)}
                  className="pf-btn-primary"
                >
                  Update to actual results
                </button>
              </div>
            )}

            {/* Mode 1b: Update form shown */}
            {isLoggedIn && hasExistingGrades && showUpdateForm && (
              <div>
                <h2 style={{ marginBottom: '8px' }}>Enter your actual results</h2>
                <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
                  Your predicted grades are shown in grey. Select your actual grade for each subject.
                </p>

                <div className="pf-card" style={{ marginBottom: '24px' }}>
                  {existingGrades!.map((g, i) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-4 flex-wrap"
                      style={{
                        padding: '14px 0',
                        borderTop: i > 0 ? '1px solid var(--pf-grey-100)' : 'none',
                      }}
                    >
                      <span
                        className="flex-1 min-w-0"
                        style={{ fontWeight: 500, color: 'var(--pf-grey-900)' }}
                      >
                        {g.subject}
                      </span>
                      <span
                        className="pf-data-number"
                        style={{
                          fontWeight: 600,
                          color: 'var(--pf-grey-300)',
                          fontSize: '1rem',
                          minWidth: '32px',
                          textAlign: 'center',
                        }}
                      >
                        {g.grade}
                      </span>
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: 'var(--pf-grey-300)' }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <select
                        value={actualMap[g.id] ?? ''}
                        onChange={(e) => handleUpdateActual(g.id, e.target.value)}
                        className="pf-input"
                        style={{ padding: '8px 12px', minHeight: '44px', width: 'auto', minWidth: '110px' }}
                        aria-label={`Actual grade for ${g.subject}`}
                      >
                        <option value="">Actual…</option>
                        {RESULT_GRADES.map((gr) => (
                          <option key={gr} value={gr}>{gr}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="pf-btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSaveActualResults}
                    disabled={saving || Object.values(actualMap).filter((v) => v !== '').length === 0}
                    className="pf-btn-primary"
                    style={{ opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving...' : 'Update all grades'}
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Logged in without grades — fresh entry */}
            {isLoggedIn && !hasExistingGrades && !gradesLoading && (
              <div>
                <h2 style={{ marginBottom: '8px' }}>Enter your results</h2>
                <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
                  Add your Higher results to see which courses you qualify for.
                </p>

                <QuickGradeForm
                  grades={quickGrades}
                  onChange={setQuickGrades}
                />

                <div className="flex gap-3" style={{ marginTop: '24px' }}>
                  <button
                    onClick={handleSaveFreshGrades}
                    disabled={saving || quickGrades.filter((g) => g.subject && g.grade).length === 0}
                    className="pf-btn-primary"
                    style={{ opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving...' : 'Save my results'}
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Not logged in — quick entry */}
            {!isLoggedIn && !authLoading && (
              <div>
                <h2 style={{ marginBottom: '8px' }}>Enter your results</h2>
                <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
                  Add your Higher grades to see which courses you could qualify for. No account needed.
                </p>

                <QuickGradeForm
                  grades={quickGrades}
                  onChange={setQuickGrades}
                />

                <div className="flex flex-col sm:flex-row gap-3" style={{ marginTop: '24px' }}>
                  <button
                    onClick={handleQuickEntry}
                    disabled={quickGrades.filter((g) => g.subject && g.grade).length === 0}
                    className="pf-btn-primary"
                  >
                    See my options
                  </button>
                </div>

                <div
                  className="flex items-center gap-3 rounded-lg"
                  style={{
                    marginTop: '20px',
                    padding: '16px 20px',
                    backgroundColor: 'var(--pf-blue-100)',
                  }}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: 'var(--pf-blue-700)' }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p style={{ fontSize: '0.875rem', color: 'var(--pf-blue-700)' }}>
                    <Link
                      href="/auth/sign-up"
                      style={{ fontWeight: 600, color: 'var(--pf-blue-700)' }}
                    >
                      Sign up free
                    </Link>{' '}
                    to save your results, track your options, and get personalised widening access support.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── RESULTS SECTIONS (shown after entry) ─────────────── */}
      {(showResults || hasActualResults) && (
        <>
          {/* Section A — Results summary */}
          <section className="pf-section pf-section-white">
            <div className="pf-container" style={{ maxWidth: '760px' }}>
              <h2 style={{ marginBottom: '24px' }}>Your results summary</h2>

              <div className="grid sm:grid-cols-3 gap-4" style={{ marginBottom: '32px' }}>
                <SummaryStatCard label="Higher grades" value={higherString || '—'} />
                <SummaryStatCard label="UCAS tariff" value={String(ucasPoints)} />
                <SummaryStatCard
                  label="Subjects"
                  value={String(
                    isLoggedIn
                      ? existingGrades?.length ?? 0
                      : quickGrades.filter((g) => g.subject && g.grade).length
                  )}
                />
              </div>

              {/* Predicted vs actual comparison */}
              {activeComparisons.length > 0 && (
                <div className="pf-card" style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Predicted vs actual</h3>
                  <div className="space-y-0">
                    {activeComparisons.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                        style={{
                          padding: '10px 0',
                          borderTop: i > 0 ? '1px solid var(--pf-grey-100)' : 'none',
                        }}
                      >
                        <span style={{ fontWeight: 500, color: 'var(--pf-grey-900)' }}>
                          {c.subject}
                        </span>
                        <span style={{ fontSize: '0.9375rem' }}>
                          <span style={{ color: 'var(--pf-grey-300)' }}>
                            predicted {c.predictedGrade}
                          </span>
                          <span style={{ margin: '0 8px', color: 'var(--pf-grey-300)' }}>&rarr;</span>
                          <span
                            className="pf-data-number"
                            style={{
                              fontWeight: 700,
                              color:
                                c.change === 'up'
                                  ? 'var(--pf-green-500)'
                                  : c.change === 'down'
                                    ? 'var(--pf-red-500)'
                                    : 'var(--pf-grey-900)',
                            }}
                          >
                            actual {c.actualGrade}
                          </span>
                          <span style={{ marginLeft: '6px' }}>
                            {c.change === 'up' && '\u2B06\uFE0F'}
                            {c.change === 'down' && '\u2B07\uFE0F'}
                            {c.change === 'same' && '\u2714\uFE0F'}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section B — Courses you're eligible for */}
          <section className="pf-section" style={{ backgroundColor: 'var(--pf-grey-100)' }}>
            <div className="pf-container" style={{ maxWidth: '900px' }}>
              <h2 style={{ marginBottom: '8px' }}>Courses you qualify for</h2>

              {isLoggedIn ? (
                <>
                  <p style={{ color: 'var(--pf-grey-600)', marginBottom: '8px', fontSize: '1.0625rem' }}>
                    You qualify for{' '}
                    <strong style={{ color: 'var(--pf-grey-900)' }}>{eligibleCount} courses</strong>{' '}
                    across{' '}
                    <strong style={{ color: 'var(--pf-grey-900)' }}>{uniqueUnis} universities</strong>
                    {waCount > 0 && (
                      <>
                        {' '}
                        — including{' '}
                        <span style={{ color: 'var(--pf-amber-500)', fontWeight: 600 }}>
                          {waCount} via widening access
                        </span>
                      </>
                    )}
                  </p>

                  {previousEligibleCount !== null && previousEligibleCount !== eligibleCount && (
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        marginBottom: '24px',
                        color: eligibleCount > previousEligibleCount ? 'var(--pf-green-500)' : 'var(--pf-red-500)',
                        fontWeight: 600,
                      }}
                    >
                      {eligibleCount > previousEligibleCount
                        ? `You were predicted eligible for ${previousEligibleCount} courses — you're now eligible for ${eligibleCount} (+${eligibleCount - previousEligibleCount})`
                        : `You were predicted eligible for ${previousEligibleCount} courses — you're now eligible for ${eligibleCount} (${eligibleCount - previousEligibleCount})`}
                    </p>
                  )}

                  <div className="flex gap-3" style={{ marginBottom: '24px' }}>
                    <Link href="/courses?eligible=true" className="pf-btn-primary">
                      Browse eligible courses
                    </Link>
                    <Link href="/courses" className="pf-btn-secondary">
                      View all courses
                    </Link>
                  </div>

                  {/* Top eligible courses preview */}
                  {matchedCourses && matchedCourses.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {matchedCourses
                        .filter(
                          (c) =>
                            c.eligibility?.status === 'eligible' ||
                            c.eligibility?.status === 'eligible_via_wa'
                        )
                        .slice(0, 6)
                        .map((course) => (
                          <Link
                            key={course.id}
                            href={`/courses/${course.id}`}
                            className="pf-card-hover no-underline hover:no-underline"
                            style={{ padding: '20px' }}
                          >
                            <p
                              style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                color: 'var(--pf-grey-900)',
                                marginBottom: '4px',
                              }}
                            >
                              {course.name}
                            </p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
                              {(course as any).university?.name ?? ''}
                            </p>
                            <span
                              style={{
                                display: 'inline-flex',
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor:
                                  course.eligibility?.status === 'eligible_via_wa'
                                    ? 'rgba(245, 158, 11, 0.1)'
                                    : 'rgba(16, 185, 129, 0.1)',
                                color:
                                  course.eligibility?.status === 'eligible_via_wa'
                                    ? 'var(--pf-amber-500)'
                                    : 'var(--pf-green-500)',
                              }}
                            >
                              {course.eligibility?.status === 'eligible_via_wa'
                                ? 'Eligible via WA'
                                : 'Eligible'}
                            </span>
                          </Link>
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Logged-out eligibility results */}
                  {quickEligibility.isLoading ? (
                    <div
                      className="rounded-lg text-center"
                      style={{ padding: '40px', backgroundColor: 'var(--pf-white)', color: 'var(--pf-grey-600)' }}
                    >
                      Checking eligibility across all courses...
                    </div>
                  ) : (
                    <>
                      <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px', fontSize: '1.0625rem' }}>
                        With your grades ({higherString}), you could qualify for{' '}
                        <strong style={{ color: 'var(--pf-grey-900)' }}>{quickEligible} courses</strong>{' '}
                        across{' '}
                        <strong style={{ color: 'var(--pf-grey-900)' }}>{quickUnis} universities</strong>
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4" style={{ marginBottom: '24px' }}>
                        {quickEligibility.courses
                          .filter(
                            (c) =>
                              c.eligibility.status === 'eligible' ||
                              c.eligibility.status === 'eligible_via_wa'
                          )
                          .slice(0, 6)
                          .map((course) => (
                            <Link
                              key={course.id}
                              href={`/courses/${course.id}`}
                              className="pf-card-hover no-underline hover:no-underline"
                              style={{ padding: '20px' }}
                            >
                              <p
                                style={{
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontWeight: 600,
                                  fontSize: '0.9375rem',
                                  color: 'var(--pf-grey-900)',
                                  marginBottom: '4px',
                                }}
                              >
                                {course.name}
                              </p>
                              <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                                {course.university?.name ?? ''}
                              </p>
                            </Link>
                          ))}
                      </div>

                      <div
                        className="rounded-lg text-center"
                        style={{ padding: '24px', backgroundColor: 'var(--pf-blue-50)' }}
                      >
                        <p style={{ fontWeight: 600, color: 'var(--pf-grey-900)', marginBottom: '8px' }}>
                          Sign up to see your full results
                        </p>
                        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '16px' }}>
                          Get personalised widening access matching, save courses, and track your applications.
                        </p>
                        <Link href="/auth/sign-up" className="pf-btn-primary">
                          Create free account
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Section C — What to do now */}
          <section className="pf-section pf-section-white">
            <div className="pf-container" style={{ maxWidth: '760px' }}>
              <h2 style={{ marginBottom: '24px' }}>What to do now</h2>

              {/* Contextual advice based on result outcome */}
              {resultOutcome === 'better' && (
                <AdviceCard
                  variant="success"
                  title="Great news — your results have opened up more options"
                  items={[
                    'You may want to check if you can upgrade your firm choice through UCAS Adjustment — a service that lets you swap to a higher-preference course if your grades exceeded your offer.',
                    'Check UCAS Track for your confirmed offers.',
                  ]}
                  links={[
                    { label: 'Learn about UCAS Adjustment', href: 'https://www.ucas.com/undergraduate/results-confirmation-and-clearing/ucas-adjustment', external: true },
                  ]}
                />
              )}

              {resultOutcome === 'match' && (
                <AdviceCard
                  variant="info"
                  title="Your results match your predicted grades — your offers should be confirmed"
                  items={[
                    'Check UCAS Track for your offer status. Most universities confirm offers within a few days of results day.',
                  ]}
                  links={[
                    { label: 'Go to UCAS Track', href: 'https://www.ucas.com/students', external: true },
                  ]}
                />
              )}

              {resultOutcome === 'worse' && (
                <AdviceCard
                  variant="warning"
                  title="Your results are below what was predicted — but don't panic. You have options."
                  items={[
                    'Check if your conditional offers are still met — universities sometimes accept students who narrowly miss their grades.',
                    student?.simd_decile != null && student.simd_decile <= 4
                      ? 'Remember, your widening access status means adjusted offers may apply. Check with your university directly.'
                      : null,
                    'UCAS Clearing opens courses at universities with available places.',
                    'Consider the college route — HNC/HND can articulate into university Year 2 or 3.',
                  ]}
                  links={[
                    { label: 'UCAS Clearing search', href: 'https://www.ucas.com/undergraduate/results-confirmation-and-clearing/what-clearing', external: true },
                    { label: 'College pathways', href: '/pathways/alternatives' },
                    { label: 'Grade sensitivity tool', href: '/tools/grade-sensitivity' },
                  ]}
                />
              )}

              {resultOutcome === 'significantly_worse' && (
                <AdviceCard
                  variant="warning"
                  title="Your results are below what was predicted — but don't panic. You have options."
                  items={[
                    'Check if your conditional offers are still met — universities sometimes accept students who narrowly miss.',
                    student?.simd_decile != null && student.simd_decile <= 4
                      ? 'Your widening access status means adjusted offers may apply. Check with your university directly.'
                      : null,
                    'UCAS Clearing opens courses at universities with available places.',
                    'Retaking Highers in S6 is common — many students improve their grades.',
                    'College HNC/HND is a genuine alternative path into university.',
                    'Foundation Apprenticeships are another option worth exploring.',
                  ]}
                  links={[
                    { label: 'UCAS Clearing', href: 'https://www.ucas.com/undergraduate/results-confirmation-and-clearing/what-clearing', external: true },
                    { label: 'College pathways', href: '/colleges' },
                    { label: 'Alternative routes', href: '/pathways/alternatives' },
                    { label: 'Grade sensitivity tool', href: '/tools/grade-sensitivity' },
                  ]}
                />
              )}

              {/* Default advice for logged-out users or no comparison */}
              {!resultOutcome && (
                <AdviceCard
                  variant="info"
                  title="Next steps with your results"
                  items={[
                    'Check UCAS Track for your offer status.',
                    'If you have a conditional offer, confirm whether your grades meet the requirements.',
                    "If you're in Clearing, don't rush — take time to find the right course.",
                    'Consider using our grade sensitivity tool to explore how retaking subjects could help.',
                  ]}
                  links={[
                    { label: 'UCAS Track', href: 'https://www.ucas.com/students', external: true },
                    { label: 'Grade sensitivity tool', href: '/tools/grade-sensitivity' },
                    { label: 'Explore courses', href: '/courses' },
                  ]}
                />
              )}
            </div>
          </section>
        </>
      )}

      {/* ── INTERACTIVE DECISION TREE ─────────────────────── */}
      <ResultsDayDecisionTree />

      {/* ── UNIVERSITY ADMISSIONS CONTACTS ────────────────── */}
      <ResultsDayContacts />

      {/* ── DIFFICULT / EXTENUATING CIRCUMSTANCES ─────────── */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '760px' }}>
          <h2 style={{ marginBottom: '8px' }}>If something went wrong during your exams</h2>
          <p style={{ color: 'var(--pf-grey-600)', marginBottom: '20px', lineHeight: 1.6 }}>
            Illness, bereavement, or another serious event near exam time can affect your grades.
            There are formal processes &mdash; through Qualifications Scotland and through university
            admissions teams &mdash; that can take your circumstances into account. You do not have
            to accept a result that does not reflect what you are capable of.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link
              href="/support/extenuating-circumstances"
              className="inline-flex items-center gap-2 pf-btn-primary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Extenuating circumstances guide
            </Link>
            <Link
              href="/support/difficult-circumstances"
              className="inline-flex items-center gap-2 pf-btn-secondary"
            >
              Wider difficult-circumstances support
            </Link>
          </div>
        </div>
      </section>

      {/* ── CLEARING SECTION (always shown for reference) ───── */}
      <section
        id="clearing"
        className="pf-section"
        style={{ backgroundColor: 'var(--pf-blue-900)' }}
      >
        <div className="pf-container" style={{ maxWidth: '760px' }}>
          <span
            className="pf-badge inline-flex"
            style={{
              marginBottom: '16px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#fff',
            }}
          >
            UCAS Clearing
          </span>
          <h2 style={{ color: '#fff', marginBottom: '16px' }}>How Clearing works in Scotland</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '12px', lineHeight: 1.6 }}>
            Clearing opens on <strong style={{ color: '#fff' }}>2 July 2026</strong> and closes on{' '}
            <strong style={{ color: '#fff' }}>19 October 2026</strong>. You can apply through Clearing
            if: you have no offers, you declined all offers, you did not meet your conditions, or you
            applied late.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', fontSize: '0.875rem', fontStyle: 'italic' }}>
            Scottish students keep their full SAAS funding for Clearing places &mdash; you do not lose
            funding if you accept a Clearing offer.
          </p>

          <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.125rem' }}>
            Step by step
          </h3>
          <ol className="space-y-3" style={{ marginBottom: '32px', paddingLeft: 0, listStyle: 'none', counterReset: 'clearing-step' }}>
            {[
              'Check UCAS Track. If you are in Clearing, your Clearing number is shown there.',
              'Search for available courses on ucas.com/clearing or contact universities directly.',
              'When you find a course, phone the university Clearing hotline. Lines open at 8am.',
              'Have your results, your UCAS ID, and your Clearing number ready before you call.',
              'If they make a verbal offer, add it to UCAS Track using your Clearing number.',
              'Accept the offer on UCAS Track to confirm your place.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    marginTop: '1px',
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9375rem', lineHeight: 1.55 }}>
                  {item}
                </span>
              </li>
            ))}
          </ol>

          <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '1.125rem' }}>
            Tips
          </h3>
          <div className="space-y-3" style={{ marginBottom: '32px' }}>
            {[
              'Call early on Results Day - lines are quietest before 10am.',
              'Be ready to explain why you want the course - admissions staff make decisions on the call.',
              'Do not panic. Thousands of courses are available in Clearing, including at Russell Group universities.',
              'Scottish universities are generally supportive and helpful through Clearing.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                  }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9375rem' }}>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://www.ucas.com/undergraduate/results-confirmation-and-clearing/what-clearing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
              style={{
                backgroundColor: '#fff',
                color: 'var(--pf-blue-900)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                minHeight: '48px',
              }}
            >
              UCAS Clearing search
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
              style={{
                backgroundColor: 'transparent',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                minHeight: '48px',
              }}
            >
              Browse Pathfinder courses
            </Link>
          </div>
        </div>
      </section>

      {/* ── HELPLINES ─────────────────────────────────────── */}
      <ResultsDayHelplines />
    </div>
  )
}

export default function ResultsDayPage() {
  return (
    <Suspense
      fallback={
        <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh' }}>
          <div className="pf-container pt-12">
            <div className="pf-skeleton" style={{ width: '200px', height: '32px', borderRadius: '8px', marginBottom: '16px' }} />
            <div className="pf-skeleton" style={{ width: '400px', height: '48px', borderRadius: '8px', marginBottom: '16px' }} />
            <div className="pf-skeleton" style={{ width: '320px', height: '20px', borderRadius: '8px' }} />
          </div>
        </div>
      }
    >
      <ResultsDayContent />
    </Suspense>
  )
}

// ── Internal components ─────────────────────────────────────────────

function QuickGradeForm({
  grades,
  onChange,
}: {
  grades: QuickGrade[]
  onChange: (grades: QuickGrade[]) => void
}) {
  // Pull every Higher-level subject from the DB so students sitting less-common
  // subjects (Psychology, Philosophy, Gàidhlig, NPAs etc.) can still record
  // their result. Falls back to the hardcoded list while the fetch is in-flight
  // so the form is usable immediately on a cold load.
  const { data: higherSubjects } = useSubjects({ level: 'higher' })
  const subjects = useMemo(() => {
    if (higherSubjects && higherSubjects.length > 0) {
      return higherSubjects.map((s) => s.name)
    }
    return COMMON_SUBJECTS_BY_LEVEL.higher
  }, [higherSubjects])

  const updateRow = (index: number, field: 'subject' | 'grade', value: string) => {
    const next = [...grades]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  const addRow = () => {
    onChange([...grades, { subject: '', grade: '' }])
  }

  const removeRow = (index: number) => {
    if (grades.length <= 1) return
    onChange(grades.filter((_, i) => i !== index))
  }

  return (
    <div className="pf-card">
      <div className="space-y-0">
        {grades.map((g, i) => (
          <div
            key={i}
            className="flex items-center gap-3 flex-wrap"
            style={{
              padding: '12px 0',
              borderTop: i > 0 ? '1px solid var(--pf-grey-100)' : 'none',
            }}
          >
            <select
              value={g.subject}
              onChange={(e) => updateRow(i, 'subject', e.target.value)}
              className="pf-input flex-1"
              style={{ padding: '8px 12px', minHeight: '44px', minWidth: '180px' }}
              aria-label={`Subject ${i + 1}`}
            >
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={g.grade}
              onChange={(e) => updateRow(i, 'grade', e.target.value)}
              className="pf-input"
              style={{ padding: '8px 12px', minHeight: '44px', width: 'auto', minWidth: '110px' }}
              aria-label={`Grade ${i + 1}`}
            >
              <option value="">Grade...</option>
              {RESULT_GRADES.map((gr) => (
                <option key={gr} value={gr}>{gr}</option>
              ))}
            </select>

            {grades.length > 1 && (
              <button
                onClick={() => removeRow(i)}
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  color: 'var(--pf-grey-600)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label={`Remove row ${i + 1}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-2"
        style={{
          marginTop: '12px',
          padding: '8px 0',
          color: 'var(--pf-blue-500)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.875rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add another subject
      </button>
    </div>
  )
}

function ChecklistItem({ label }: { label: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg"
      style={{ padding: '14px 16px', backgroundColor: 'var(--pf-blue-50)' }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          border: '2px solid var(--pf-blue-500)',
          marginTop: '1px',
        }}
      />
      <span style={{ color: 'var(--pf-grey-900)', fontSize: '0.9375rem' }}>{label}</span>
    </div>
  )
}

function LinkCard({
  href,
  title,
  description,
  colour,
}: {
  href: string
  title: string
  description: string
  colour: string
}) {
  return (
    <Link
      href={href}
      className="pf-card-hover no-underline hover:no-underline flex items-start gap-3"
      style={{ padding: '20px' }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: `color-mix(in srgb, ${colour} 12%, transparent)`,
          color: colour,
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      <div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--pf-grey-900)',
            marginBottom: '2px',
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>{description}</p>
      </div>
    </Link>
  )
}

function SummaryStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg text-center"
      style={{
        padding: '20px',
        backgroundColor: 'var(--pf-blue-50)',
      }}
    >
      <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '6px' }}>{label}</p>
      <p
        className="pf-data-number"
        style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--pf-blue-700)' }}
      >
        {value}
      </p>
    </div>
  )
}

function AdviceCard({
  variant,
  title,
  items,
  links,
}: {
  variant: 'success' | 'info' | 'warning'
  title: string
  items: (string | null)[]
  links: { label: string; href: string; external?: boolean }[]
}) {
  const bgMap = {
    success: 'rgba(16, 185, 129, 0.06)',
    info: 'var(--pf-blue-50)',
    warning: 'rgba(245, 158, 11, 0.06)',
  }
  const iconColorMap = {
    success: 'var(--pf-green-500)',
    info: 'var(--pf-blue-700)',
    warning: 'var(--pf-amber-500)',
  }

  return (
    <div
      className="rounded-lg"
      style={{ padding: '24px', backgroundColor: bgMap[variant], marginBottom: '16px' }}
    >
      <h3
        style={{
          fontSize: '1.0625rem',
          marginBottom: '16px',
          color: 'var(--pf-grey-900)',
        }}
      >
        {title}
      </h3>
      <ul className="space-y-3" style={{ marginBottom: '20px' }}>
        {items.filter(Boolean).map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg
              className="w-4 h-4 flex-shrink-0"
              style={{ color: iconColorMap[variant], marginTop: '3px' }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              {item}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        {links.map((link, i) =>
          link.external ? (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 no-underline hover:no-underline"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--pf-blue-500)',
              }}
            >
              {link.label}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <Link
              key={i}
              href={link.href}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--pf-blue-500)',
              }}
            >
              {link.label} &rarr;
            </Link>
          )
        )}
      </div>
    </div>
  )
}

function ResultsDayIllustration() {
  return (
    <svg
      viewBox="0 0 400 360"
      width="100%"
      style={{ maxWidth: '400px', height: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background circles */}
      <circle cx="200" cy="180" r="160" fill="#E0EDF7" opacity="0.5" />
      <circle cx="200" cy="180" r="110" fill="#E0EDF7" opacity="0.6" />

      {/* Envelope (results letter) */}
      <g transform="translate(120, 100)">
        <rect x="0" y="30" width="160" height="110" rx="8" fill="#005EB8" />
        <path d="M 0 38 L 80 95 L 160 38" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <rect x="20" y="0" width="120" height="80" rx="6" fill="#fff" />
        {/* Grade marks on the letter */}
        <text x="45" y="30" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="20" fill="#005EB8">A</text>
        <text x="70" y="30" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="20" fill="#005EB8">A</text>
        <text x="95" y="30" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="20" fill="#005EB8">B</text>
        <rect x="40" y="42" width="80" height="4" rx="2" fill="#E0EDF7" />
        <rect x="40" y="52" width="60" height="4" rx="2" fill="#E0EDF7" />
        <rect x="40" y="62" width="70" height="4" rx="2" fill="#E0EDF7" />
      </g>

      {/* Check marks floating */}
      <g opacity="0.8">
        <circle cx="90" cy="140" r="16" fill="rgba(16, 185, 129, 0.15)" />
        <path d="M 82 140 L 88 146 L 98 134" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g opacity="0.8">
        <circle cx="310" cy="120" r="14" fill="rgba(16, 185, 129, 0.15)" />
        <path d="M 303 120 L 308 125 L 317 114" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Star */}
      <g transform="translate(320, 220)" opacity="0.7">
        <path
          d="M 0 -12 L 3 -4 L 12 -4 L 5 2 L 7 10 L 0 5 L -7 10 L -5 2 L -12 -4 L -3 -4 Z"
          fill="#F59E0B"
        />
      </g>

      {/* Graduation cap */}
      <g transform="translate(75, 250)" opacity="0.7">
        <path d="M 0 0 L 20 -10 L 40 0 L 20 10 Z" fill="#002D72" />
        <rect x="18" y="0" width="4" height="12" fill="#002D72" />
        <circle cx="20" cy="14" r="3" fill="#002D72" />
      </g>
    </svg>
  )
}
