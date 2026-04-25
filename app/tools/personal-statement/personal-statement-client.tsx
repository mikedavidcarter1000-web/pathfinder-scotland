'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import examplesDataRaw from '@/data/personal-statement-examples.json'
import { VersionHistoryPanel } from '@/components/personal-statement/version-history-panel'
import { SharingControls } from '@/components/personal-statement/sharing-controls'
import {
  FeedbackSection,
  useFeedback,
  unresolvedCountByQuestion,
  type FeedbackRow,
} from '@/components/personal-statement/feedback-section'

// ---- Types ------------------------------------------------------------------

type BadType =
  | 'bad_generic'
  | 'bad_grammar'
  | 'bad_ai_slop'
  | 'bad_vague'
  | 'bad_oversell'
  | 'bad_overshare'
  | 'bad_casual'

type Annotation = { label: string; text: string }

type Version = {
  type: BadType | 'good'
  text: string
  annotations: Annotation[]
}

type Example = {
  studentId: string
  questionId: string
  bad: Version
  good: Version
}

type Question = {
  id: string
  label: string
  short: string
  hint: string
}

type Student = {
  id: string
  name: string
  location: string
  subject: string
  university: string
  bio: string
  backgrounds: string[]
}

type ExamplesData = {
  questions: Question[]
  students: Student[]
  examples: Example[]
}

type ContextResponse = {
  authenticated: boolean
  firstName?: string | null
  schoolStage?: string | null
  savedCourses?: { name: string; university: string; subjectArea: string | null }[]
  currentSubjects?: string[]
  grades?: { subject: string; grade: string; qualification: string }[]
  topRiasec?: string[]
}

const data = examplesDataRaw as ExamplesData

// ---- Filter chips -----------------------------------------------------------

const FILTER_CHIPS: { id: string; label: string; backgroundKey: string | null }[] = [
  { id: 'all', label: 'All', backgroundKey: null },
  { id: 'first-gen', label: 'First generation', backgroundKey: 'first-generation' },
  { id: 'rural', label: 'Rural', backgroundKey: 'rural' },
  { id: 'care', label: 'Care experienced', backgroundKey: 'care-experienced' },
  { id: 'state', label: 'State school', backgroundKey: 'state-school' },
  { id: 'changer', label: 'Career changer', backgroundKey: 'career-changer' },
]

const CHARACTER_LIMITS = {
  minPerQuestion: 350,
  totalMax: 4000,
  amberUntil: 500,
}

const DRAFT_STORAGE_KEY = 'pf_personal_statement_draft_v1'

type CloudDraft = {
  id: string
  q1: string
  q2: string
  q3: string
  lastSavedAt: string
  createdAt: string
  sharedWithSchool: boolean
  sharedWithParent: boolean
  schoolId: string | null
}

async function cloudSave(
  drafts: { q1: string; q2: string; q3: string },
  setState: (s: 'idle' | 'saving' | 'saved' | 'error') => void,
  setDraftMeta: (d: CloudDraft | null) => void,
  saveTrigger: 'auto' | 'manual' | 'restore' = 'auto',
): Promise<void> {
  setState('saving')
  try {
    const res = await fetch('/api/personal-statement/drafts', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...drafts, saveTrigger }),
    })
    if (!res.ok) throw new Error('save failed')
    const json = (await res.json()) as { draft?: CloudDraft }
    if (json.draft) setDraftMeta(json.draft)
    setState('saved')
  } catch {
    setState('error')
  }
}

function formatRelativeTime(iso: string | null): string | null {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return null
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000))
  if (diffSec < 10) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleString('en-GB')
}

// ---- RIASEC labels ----------------------------------------------------------

const RIASEC_LABEL: Record<string, string> = {
  R: 'Realistic / hands-on',
  I: 'Investigative / analytical',
  A: 'Artistic / creative',
  S: 'Social / caring',
  E: 'Enterprising / leading',
  C: 'Conventional / organising',
}

// ---- Root client component --------------------------------------------------

export function PersonalStatementClient() {
  const [ctx, setCtx] = useState<ContextResponse | null>(null)

  useEffect(() => {
    fetch('/api/personal-statement/context')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setCtx(json as ContextResponse | null))
      .catch(() => setCtx({ authenticated: false }))
  }, [])

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '100vh' }}>
      <HeroAndIntro />
      <ExampleBrowser />
      <DraftingTool ctx={ctx} />
      <CommonMistakes />
      <RelatedLinks />
    </div>
  )
}

// ---- Hero + Intro -----------------------------------------------------------

function HeroAndIntro() {
  return (
    <>
      <section style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div className="pf-container" style={{ paddingTop: '48px', paddingBottom: '24px' }}>
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}
          >
            <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>
              Home
            </Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <Link href="/tools" style={{ color: 'var(--pf-grey-600)' }}>
              Tools
            </Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>Personal Statement Guide</span>
          </nav>
          <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.75rem, 5vw, 2.125rem)' }}>
            UCAS Personal Statement Guide
          </h1>
          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-700)',
              lineHeight: 1.65,
              maxWidth: '720px',
              marginBottom: '24px',
            }}
          >
            How to answer the three UCAS personal statement questions for 2026 entry. Annotated
            examples from six very different Scottish students, plus a guided writing tool that
            uses your Pathfinder data.
          </p>
        </div>
      </section>

      <section style={{ paddingBottom: '32px' }}>
        <div className="pf-container" style={{ maxWidth: '900px' }}>
          <div className="pf-card" style={{ padding: '24px 28px', lineHeight: 1.7 }}>
            <p style={{ marginBottom: '12px', color: 'var(--pf-grey-800)' }}>
              From 2026 entry, the UCAS personal statement is <strong>three questions</strong>{' '}
              instead of one essay. You have <strong>4,000 characters total</strong>, with at least{' '}
              <strong>350 per question</strong>.
            </p>
            <p style={{ marginBottom: '12px', color: 'var(--pf-grey-800)' }}>
              Universities use your answers to understand why you want to study your chosen course
              and what makes you a good fit. Admissions tutors read hundreds of these -- yours needs
              to be <strong>specific, honest and personal</strong>.
            </p>
            <p style={{ marginBottom: '0', color: 'var(--pf-grey-800)' }}>
              Below you will find examples of strong and weak answers from students with different
              backgrounds and interests. Then you can use our guided tool to draft your own.{' '}
              <a
                href="https://www.ucas.com/undergraduate/applying-university/writing-personal-statement"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--pf-blue-500)' }}
              >
                UCAS official guidance
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

// ---- Example browser --------------------------------------------------------

function ExampleBrowser() {
  const [activeQuestionId, setActiveQuestionId] = useState<string>(data.questions[0]?.id ?? 'q1')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [activeStudentId, setActiveStudentId] = useState<string>(data.students[0]?.id ?? 'aisha')
  const [mobileView, setMobileView] = useState<'bad' | 'good'>('bad')

  const filteredStudents = useMemo(() => {
    if (activeFilter === 'all') return data.students
    const chip = FILTER_CHIPS.find((c) => c.id === activeFilter)
    if (!chip || !chip.backgroundKey) return data.students
    return data.students.filter((s) => s.backgrounds.includes(chip.backgroundKey as string))
  }, [activeFilter])

  // If the currently active student is filtered out, pick the first available.
  useEffect(() => {
    if (filteredStudents.length === 0) return
    const stillVisible = filteredStudents.some((s) => s.id === activeStudentId)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!stillVisible) setActiveStudentId(filteredStudents[0].id)
  }, [filteredStudents, activeStudentId])

  const activeStudent = data.students.find((s) => s.id === activeStudentId) ?? data.students[0]
  const activeExample = data.examples.find(
    (e) => e.studentId === activeStudentId && e.questionId === activeQuestionId
  )

  return (
    <section id="examples" style={{ paddingTop: '16px', paddingBottom: '32px' }}>
      <div className="pf-container" style={{ maxWidth: '1080px' }}>
        <header style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: 'clamp(1.375rem, 3.5vw, 1.625rem)', marginBottom: '8px' }}>
            Annotated examples
          </h2>
          <p style={{ color: 'var(--pf-grey-700)', lineHeight: 1.6, maxWidth: '720px' }}>
            Six fictional students, three questions each, one weak version and one strong version
            per answer. Tap the annotations to see what admissions tutors notice.
          </p>
        </header>

        {/* Question tabs */}
        <div
          role="tablist"
          aria-label="UCAS personal statement question"
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {data.questions.map((q, idx) => {
            const active = q.id === activeQuestionId
            return (
              <button
                key={q.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveQuestionId(q.id)}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: active ? '1px solid var(--pf-blue-700)' : '1px solid var(--pf-grey-300)',
                  backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                  color: active ? '#fff' : 'var(--pf-grey-900)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ opacity: 0.65, marginRight: '6px', fontSize: '0.8125rem' }}>
                  Q{idx + 1}
                </span>
                {q.short}
              </button>
            )
          })}
        </div>

        {/* Active question full text + hint */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '8px',
            backgroundColor: 'var(--pf-blue-100)',
            borderLeft: '3px solid var(--pf-blue-700)',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontWeight: 600, color: 'var(--pf-blue-900)', marginBottom: '4px' }}>
            {data.questions.find((q) => q.id === activeQuestionId)?.label}
          </p>
          <p style={{ color: 'var(--pf-blue-900)', fontSize: '0.9375rem', lineHeight: 1.55 }}>
            {data.questions.find((q) => q.id === activeQuestionId)?.hint}
          </p>
        </div>

        {/* Filter chips */}
        <div style={{ marginBottom: '12px' }}>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            Show students like:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {FILTER_CHIPS.map((chip) => {
              const active = chip.id === activeFilter
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: active ? '1px solid var(--pf-blue-700)' : '1px solid var(--pf-grey-300)',
                    backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                    color: active ? '#fff' : 'var(--pf-grey-800)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Student selector */}
        {filteredStudents.length === 0 ? (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--pf-white)',
              borderRadius: '8px',
              border: '1px solid var(--pf-grey-200)',
              textAlign: 'center',
              color: 'var(--pf-grey-600)',
              marginBottom: '24px',
            }}
          >
            No example students match this filter yet. Try &quot;All&quot;.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {filteredStudents.map((s) => {
              const active = s.id === activeStudentId
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStudentId(s.id)}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: active ? '2px solid var(--pf-blue-700)' : '1px solid var(--pf-grey-300)',
                    backgroundColor: active ? 'var(--pf-blue-100)' : 'var(--pf-white)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--pf-grey-900)',
                      marginBottom: '4px',
                    }}
                  >
                    {s.name}
                  </p>
                  <p
                    style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '6px' }}
                  >
                    {s.location} &middot; {s.subject}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-500)', lineHeight: 1.45 }}>
                    {s.bio}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {/* Mobile toggle bad/good */}
        {activeExample && (
          <div
            className="md:hidden"
            role="tablist"
            aria-label="Show weak or strong example"
            style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}
          >
            {([
              ['bad', 'Weak version'],
              ['good', 'Strong version'],
            ] as const).map(([key, label]) => {
              const active = key === mobileView
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMobileView(key as 'bad' | 'good')}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--pf-grey-300)',
                    backgroundColor: active ? 'var(--pf-grey-900)' : 'var(--pf-white)',
                    color: active ? '#fff' : 'var(--pf-grey-800)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {/* Example display: side-by-side on md+, stacked with toggle on mobile */}
        {activeExample ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '16px',
            }}
            className="compare-grid"
          >
            <div
              data-mobile-role="bad"
              style={{ display: 'block' }}
              className="example-card example-bad"
            >
              <ExampleCard
                tone="bad"
                heading="Weak version"
                subheading={friendlyBadLabel(activeExample.bad.type as BadType)}
                student={activeStudent}
                version={activeExample.bad}
              />
            </div>
            <div
              data-mobile-role="good"
              style={{ display: 'block' }}
              className="example-card example-good"
            >
              <ExampleCard
                tone="good"
                heading="Strong version"
                subheading="What works"
                student={activeStudent}
                version={activeExample.good}
              />
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--pf-grey-600)' }}>No example available for this combination.</p>
        )}

        <style jsx>{`
          @media (min-width: 768px) {
            .compare-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 20px !important;
            }
          }
          @media (max-width: 767px) {
            .compare-grid > [data-mobile-role='bad'] {
              display: ${mobileView === 'bad' ? 'block' : 'none'} !important;
            }
            .compare-grid > [data-mobile-role='good'] {
              display: ${mobileView === 'good' ? 'block' : 'none'} !important;
            }
          }
        `}</style>
      </div>
    </section>
  )
}

function ExampleCard({
  tone,
  heading,
  subheading,
  student,
  version,
}: {
  tone: 'bad' | 'good'
  heading: string
  subheading: string
  student: Student
  version: Version
}) {
  const accentColor = tone === 'bad' ? 'var(--pf-red-500)' : 'var(--pf-green-500)'
  const softBg = tone === 'bad' ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)'

  return (
    <div
      className="pf-card"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: 'var(--pf-white)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: accentColor,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {tone === 'bad' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--pf-grey-900)',
            }}
          >
            {heading}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
            {student.name} &middot; {subheading}
          </p>
        </div>
      </div>

      <div
        style={{
          padding: '14px 16px',
          backgroundColor: softBg,
          borderRadius: '8px',
          lineHeight: 1.65,
          color: 'var(--pf-grey-900)',
          fontSize: '0.9375rem',
          whiteSpace: 'pre-wrap',
        }}
      >
        {version.text}
      </div>

      <div>
        <p
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--pf-grey-500)',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          {tone === 'bad' ? 'What goes wrong' : 'What works'}
        </p>
        <ol style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '0', margin: 0, listStyle: 'none' }}>
          {version.annotations.map((a, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'var(--pf-grey-50, #f9fafb)',
                border: '1px solid var(--pf-grey-200)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '2px',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {a.label}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-700)', lineHeight: 1.55 }}>
                  {a.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function friendlyBadLabel(t: BadType): string {
  switch (t) {
    case 'bad_generic':
      return 'Too generic'
    case 'bad_grammar':
      return 'Spelling and grammar'
    case 'bad_ai_slop':
      return 'AI-generated tone'
    case 'bad_vague':
      return 'Too vague'
    case 'bad_oversell':
      return 'Overselling'
    case 'bad_overshare':
      return 'Oversharing'
    case 'bad_casual':
      return 'Register too casual'
    default:
      return 'What goes wrong'
  }
}

// ---- Drafting tool ----------------------------------------------------------

function DraftingTool({ ctx }: { ctx: ContextResponse | null }) {
  const [drafts, setDrafts] = useState<{ q1: string; q2: string; q3: string }>({
    q1: '',
    q2: '',
    q3: '',
  })
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [cloudState, setCloudState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [draftMeta, setDraftMeta] = useState<CloudDraft | null>(null)
  const cloudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const authedAfterLoad = ctx?.authenticated === true
  const lastCloudSavedAt = draftMeta?.lastSavedAt ?? null
  const draftId = draftMeta?.id ?? null
  const { feedback, reload: reloadFeedback } = useFeedback(draftId)

  // Load on mount. For authenticated users we prefer the DB copy (cross-device
  // source of truth); anon users fall back to localStorage. If DB is empty but
  // localStorage has content, we upload the localStorage copy on first save.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false

    const loadLocal = () => {
      try {
        const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Partial<{ q1: string; q2: string; q3: string }>
        return {
          q1: typeof parsed.q1 === 'string' ? parsed.q1 : '',
          q2: typeof parsed.q2 === 'string' ? parsed.q2 : '',
          q3: typeof parsed.q3 === 'string' ? parsed.q3 : '',
        }
      } catch {
        return null
      }
    }

    const run = async () => {
      if (ctx === null) return
      if (!ctx.authenticated) {
        const local = loadLocal()
        if (!cancelled) {
          if (local) setDrafts(local)
          setLoaded(true)
        }
        return
      }
      try {
        const res = await fetch('/api/personal-statement/drafts', { cache: 'no-store' })
        if (!res.ok) throw new Error('load failed')
        const json = (await res.json()) as {
          draft: CloudDraft | null
        }
        if (cancelled) return
        if (json.draft) {
          setDrafts({ q1: json.draft.q1, q2: json.draft.q2, q3: json.draft.q3 })
          setDraftMeta(json.draft)
          setCloudState('saved')
        } else {
          // First login with no DB draft yet -- migrate localStorage if any
          const local = loadLocal()
          if (local && (local.q1 || local.q2 || local.q3)) {
            setDrafts(local)
          }
        }
      } catch {
        const local = loadLocal()
        if (!cancelled && local) setDrafts(local)
        if (!cancelled) setCloudState('error')
      }
      if (!cancelled) setLoaded(true)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [ctx])

  // Save to localStorage immediately; for authenticated users also queue a
  // 30-second debounced cloud save (per spec 3c) plus an on-blur save (below).
  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts))
    } catch {
      // storage quota or privacy mode -- silent
    }
    if (!authedAfterLoad) return
    if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current)
    cloudTimerRef.current = setTimeout(() => {
      void cloudSave(drafts, setCloudState, setDraftMeta, 'auto')
    }, 30_000)
    return () => {
      if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current)
    }
  }, [drafts, loaded, authedAfterLoad])

  const total = drafts.q1.length + drafts.q2.length + drafts.q3.length

  const personalisedPrompts = usePersonalisedPrompts(ctx)

  const clearDraft = useCallback(() => {
    const msg = authedAfterLoad
      ? 'Clear all three drafts from your account AND this browser? This cannot be undone.'
      : 'Clear all three drafts from this browser? This cannot be undone.'
    if (!window.confirm(msg)) return
    setDrafts({ q1: '', q2: '', q3: '' })
    if (authedAfterLoad) {
      void fetch('/api/personal-statement/drafts', { method: 'DELETE' }).then(() => {
        setCloudState('idle')
        setDraftMeta(null)
      })
    }
  }, [authedAfterLoad])

  const copyAll = useCallback(async () => {
    const text = formatDraftForExport(drafts)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey('all')
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      setCopiedKey('error')
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }, [drafts])

  const download = useCallback(() => {
    const text = formatDraftForExport(drafts)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pathfinder-personal-statement-draft.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [drafts])

  const handlePrint = useCallback(() => window.print(), [])

  const saveNow = useCallback(async () => {
    if (!authedAfterLoad) return
    if (cloudTimerRef.current) {
      clearTimeout(cloudTimerRef.current)
      cloudTimerRef.current = null
    }
    await cloudSave(drafts, setCloudState, setDraftMeta, 'manual')
  }, [drafts, authedAfterLoad])

  const restoreVersion = useCallback(
    async (version: { q1: string; q2: string; q3: string; versionNumber: number }) => {
      // Save current text first (manual snapshot of the current working copy
      // before it gets overwritten), then write the version's text into the
      // draft with saveTrigger='restore'.
      await cloudSave(drafts, setCloudState, setDraftMeta, 'manual')
      const restored = { q1: version.q1, q2: version.q2, q3: version.q3 }
      setDrafts(restored)
      await cloudSave(restored, setCloudState, setDraftMeta, 'restore')
    },
    [drafts]
  )

  const handleSharingChange = useCallback(
    (next: { sharedWithSchool: boolean; sharedWithParent: boolean }) => {
      setDraftMeta((prev) => (prev ? { ...prev, ...next } : prev))
    },
    []
  )

  return (
    <section id="draft" style={{ paddingTop: '16px', paddingBottom: '32px' }}>
      <div className="pf-container" style={{ maxWidth: '900px' }}>
        <header style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: 'clamp(1.375rem, 3.5vw, 1.625rem)', marginBottom: '8px' }}>
            Draft your own
          </h2>
          <p style={{ color: 'var(--pf-grey-700)', lineHeight: 1.6, maxWidth: '720px' }}>
            {authedAfterLoad
              ? 'Write directly into each question below. Your draft auto-saves to this browser AND to your Pathfinder account, so you can pick up on any device. When you are ready, copy or download the full draft and paste it into your UCAS application.'
              : 'Write directly into each question below. Your draft auto-saves to this browser only. Sign in to save your draft to your Pathfinder account so you can work on it from any device.'}
          </p>
          {authedAfterLoad && (
            <CloudSaveStatus
              state={cloudState}
              lastSavedAt={lastCloudSavedAt}
              onSaveNow={saveNow}
            />
          )}
        </header>

        {!ctx?.authenticated && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '8px',
              border: '1px solid var(--pf-grey-200)',
              backgroundColor: 'var(--pf-white)',
              marginBottom: '20px',
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-700)',
              lineHeight: 1.6,
            }}
          >
            <strong>Sign in for personalised prompts.</strong>{' '}
            <Link href="/auth/sign-in?redirect=/tools/personal-statement" style={{ color: 'var(--pf-blue-500)' }}>
              Sign in
            </Link>{' '}
            or{' '}
            <Link href="/auth/sign-up" style={{ color: 'var(--pf-blue-500)' }}>
              create an account
            </Link>{' '}
            to get prompts based on your saved courses, subjects and career quiz results. The
            drafting tool still works without an account -- you just get generic prompts.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.questions.map((q, idx) => {
            const questionNumber = (idx + 1) as 1 | 2 | 3
            const unresolved = unresolvedCountByQuestion(feedback, questionNumber)
            return (
              <DraftQuestionBlock
                key={q.id}
                index={questionNumber}
                question={q}
                value={drafts[q.id as 'q1' | 'q2' | 'q3']}
                onChange={(v) => setDrafts((prev) => ({ ...prev, [q.id]: v }))}
                onBlur={authedAfterLoad ? saveNow : undefined}
                prompt={personalisedPrompts[q.id as 'q1' | 'q2' | 'q3']}
                draftId={draftId}
                feedback={feedback}
                onFeedbackChange={reloadFeedback}
                unresolvedCount={unresolved}
                showFeedback={authedAfterLoad}
              />
            )
          })}
        </div>

        <TotalCounter total={total} />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '18px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={copyAll}
            className="pf-btn-primary"
            style={{ minWidth: '180px' }}
          >
            {copiedKey === 'all' ? 'Copied!' : copiedKey === 'error' ? 'Copy failed' : 'Copy all to clipboard'}
          </button>
          <button type="button" onClick={download} className="pf-btn-secondary">
            Download as text
          </button>
          <button type="button" onClick={handlePrint} className="pf-btn-secondary">
            Print
          </button>
          <button
            type="button"
            onClick={clearDraft}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--pf-grey-300)',
              backgroundColor: 'transparent',
              color: 'var(--pf-grey-600)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Clear draft
          </button>
        </div>

        {authedAfterLoad && draftId && (
          <SharingControls
            initial={{
              sharedWithSchool: draftMeta?.sharedWithSchool ?? false,
              sharedWithParent: draftMeta?.sharedWithParent ?? false,
            }}
            hasSchool={!!draftMeta?.schoolId}
            onChange={handleSharingChange}
          />
        )}

        {authedAfterLoad && draftId && (
          <VersionHistoryPanel
            draftId={draftId}
            currentDraft={drafts}
            onRestore={async (v) => {
              await restoreVersion(v)
            }}
          />
        )}

        <WarningBanner
          title="Do not paste AI-generated text"
          text="UCAS runs similarity and AI detection on every submission. AI-generated statements are easy to spot and will be flagged. Use AI to brainstorm or to proofread your own writing, never to write for you."
          tone="warn"
        />
        {authedAfterLoad ? (
          <WarningBanner
            title="Drafts are saved to your Pathfinder account"
            text="We auto-save your draft to your account every 30 seconds and when you move to another field, so you can pick up from any device. Your guidance teacher (if your school uses Pathfinder) can see how many characters you have drafted per question, so they know when you are ready for feedback. They cannot edit your draft."
            tone="info"
          />
        ) : (
          <WarningBanner
            title="Your draft lives only in this browser"
            text="We do not save your personal statement on our servers for anonymous users. If you clear your browser data, use a different device, or open this page in private browsing, your draft will be lost. Sign in to save it to your Pathfinder account, or copy and download your draft regularly to keep it safe."
            tone="info"
          />
        )}
      </div>
    </section>
  )
}

function DraftQuestionBlock({
  index,
  question,
  value,
  onChange,
  onBlur,
  prompt,
  draftId,
  feedback,
  onFeedbackChange,
  unresolvedCount,
  showFeedback,
}: {
  index: 1 | 2 | 3
  question: Question
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  prompt: string
  draftId: string | null
  feedback: FeedbackRow[]
  onFeedbackChange: () => Promise<void>
  unresolvedCount: number
  showFeedback: boolean
}) {
  const len = value.length
  const { color, label } = charCountBand(len)

  return (
    <div
      className="pf-card"
      style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div>
        <p
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--pf-grey-500)',
            fontWeight: 700,
            marginBottom: '4px',
          }}
        >
          Question {index}
          {showFeedback && unresolvedCount > 0 && (
            <span
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(245,158,11,0.18)',
                color: '#92400e',
                fontWeight: 700,
                fontSize: '0.6875rem',
              }}
            >
              {unresolvedCount} unresolved comment{unresolvedCount === 1 ? '' : 's'}
            </span>
          )}
        </p>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>{question.label}</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', lineHeight: 1.55 }}>
          {question.hint}
        </p>
      </div>

      {prompt && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--pf-blue-100)',
            borderLeft: '3px solid var(--pf-blue-700)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: 'var(--pf-blue-900)',
            lineHeight: 1.55,
          }}
        >
          <strong>Prompt:</strong> {prompt}
        </div>
      )}

      <label htmlFor={`draft-${question.id}`} className="sr-only">
        Your answer to: {question.label}
      </label>
      <textarea
        id={`draft-${question.id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onBlur?.()}
        className="pf-input"
        rows={8}
        maxLength={CHARACTER_LIMITS.totalMax}
        placeholder="Start with a specific moment, book, conversation, or observation..."
        style={{
          fontFamily: 'inherit',
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          resize: 'vertical',
          width: '100%',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          fontSize: '0.8125rem',
          color: 'var(--pf-grey-600)',
        }}
      >
        <span style={{ color, fontWeight: 600 }}>
          {len.toLocaleString()} / {CHARACTER_LIMITS.minPerQuestion}+ characters &middot; {label}
        </span>
        <span>
          Suggested share of 4,000:{' '}
          <strong>{Math.min(100, Math.round((len / CHARACTER_LIMITS.totalMax) * 100))}%</strong>
        </span>
      </div>

      {showFeedback && draftId && feedback.some((f) => f.question_number === index) && (
        <FeedbackSection
          draftId={draftId}
          questionNumber={index}
          questionText={value}
          feedback={feedback}
          viewerRole="student"
          onChange={onFeedbackChange}
          textSelectionEnabled={false}
        />
      )}
    </div>
  )
}

function CloudSaveStatus({
  state,
  lastSavedAt,
  onSaveNow,
}: {
  state: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt: string | null
  onSaveNow: () => Promise<void>
}) {
  const relative = formatRelativeTime(lastSavedAt)
  const badge =
    state === 'saving'
      ? { text: 'Saving...', color: 'var(--pf-blue-700)' }
      : state === 'error'
      ? { text: 'Save failed', color: 'var(--pf-red-500)' }
      : state === 'saved' && relative
      ? { text: `Saved ${relative}`, color: 'var(--pf-green-500)' }
      : { text: 'Not saved yet', color: 'var(--pf-grey-600)' }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '12px',
        fontSize: '0.8125rem',
        color: 'var(--pf-grey-700)',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ color: badge.color, fontWeight: 600 }}>{badge.text}</span>
      <button
        type="button"
        onClick={() => void onSaveNow()}
        disabled={state === 'saving'}
        style={{
          padding: '6px 12px',
          borderRadius: '999px',
          border: '1px solid var(--pf-blue-700)',
          backgroundColor: state === 'saving' ? 'var(--pf-grey-100)' : 'transparent',
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          cursor: state === 'saving' ? 'wait' : 'pointer',
        }}
      >
        Save now
      </button>
    </div>
  )
}

function charCountBand(len: number): { color: string; label: string } {
  if (len < CHARACTER_LIMITS.minPerQuestion) {
    return { color: 'var(--pf-red-500)', label: 'Below 350 minimum' }
  }
  if (len < CHARACTER_LIMITS.amberUntil) {
    return { color: 'var(--pf-amber-500)', label: 'Over the minimum -- keep going' }
  }
  return { color: 'var(--pf-green-500)', label: 'Good depth' }
}

function TotalCounter({ total }: { total: number }) {
  const pct = Math.min(100, Math.round((total / CHARACTER_LIMITS.totalMax) * 100))
  const over = total > CHARACTER_LIMITS.totalMax
  const colour = over
    ? 'var(--pf-red-500)'
    : total < 1000
    ? 'var(--pf-grey-600)'
    : total < 3000
    ? 'var(--pf-amber-500)'
    : 'var(--pf-green-500)'

  return (
    <div
      style={{
        marginTop: '18px',
        padding: '14px 18px',
        borderRadius: '8px',
        backgroundColor: 'var(--pf-white)',
        border: '1px solid var(--pf-grey-200)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: 700, color: 'var(--pf-grey-900)' }}>
          Total: {total.toLocaleString()} / {CHARACTER_LIMITS.totalMax.toLocaleString()} characters
        </span>
        <span style={{ fontWeight: 600, color: colour }}>{pct}% of limit</span>
      </div>
      <div
        aria-hidden="true"
        style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--pf-grey-100)', overflow: 'hidden' }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: colour,
            transition: 'width 200ms ease',
          }}
        />
      </div>
      {over && (
        <p style={{ marginTop: '6px', fontSize: '0.8125rem', color: 'var(--pf-red-500)' }}>
          You are over the 4,000-character limit. UCAS will not accept a longer statement.
        </p>
      )}
    </div>
  )
}

function WarningBanner({
  title,
  text,
  tone,
}: {
  title: string
  text: string
  tone: 'warn' | 'info'
}) {
  const bg = tone === 'warn' ? 'rgba(245,158,11,0.08)' : 'var(--pf-blue-100)'
  const border = tone === 'warn' ? 'var(--pf-amber-500)' : 'var(--pf-blue-700)'
  const fg = tone === 'warn' ? 'var(--pf-grey-900)' : 'var(--pf-blue-900)'
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '6px',
        backgroundColor: bg,
        borderLeft: `3px solid ${border}`,
        marginBottom: '10px',
        fontSize: '0.875rem',
        lineHeight: 1.55,
        color: fg,
      }}
    >
      <strong>{title}.</strong> {text}
    </div>
  )
}

function formatDraftForExport(drafts: { q1: string; q2: string; q3: string }): string {
  const q1Label = data.questions.find((q) => q.id === 'q1')?.label ?? 'Question 1'
  const q2Label = data.questions.find((q) => q.id === 'q2')?.label ?? 'Question 2'
  const q3Label = data.questions.find((q) => q.id === 'q3')?.label ?? 'Question 3'
  const total = drafts.q1.length + drafts.q2.length + drafts.q3.length
  return [
    'UCAS Personal Statement Draft',
    '(drafted using Pathfinder Scotland -- pathfinderscot.co.uk)',
    '',
    `Total: ${total} / 4000 characters`,
    '',
    '--------------------------------------------------------------',
    `Q1. ${q1Label}`,
    `(${drafts.q1.length} characters)`,
    '',
    drafts.q1 || '[ not started ]',
    '',
    '--------------------------------------------------------------',
    `Q2. ${q2Label}`,
    `(${drafts.q2.length} characters)`,
    '',
    drafts.q2 || '[ not started ]',
    '',
    '--------------------------------------------------------------',
    `Q3. ${q3Label}`,
    `(${drafts.q3.length} characters)`,
    '',
    drafts.q3 || '[ not started ]',
    '',
    '--------------------------------------------------------------',
    'Reminder: do not paste AI-generated text into your UCAS application.',
    'UCAS runs similarity detection on every submission.',
  ].join('\n')
}

// ---- Personalised prompts ---------------------------------------------------

function usePersonalisedPrompts(ctx: ContextResponse | null): { q1: string; q2: string; q3: string } {
  return useMemo(() => {
    if (!ctx || !ctx.authenticated) {
      return {
        q1: 'Think about a specific moment when you first became interested in this subject. What happened? What did you learn about yourself?',
        q2: 'Which of your school subjects has been most relevant to your chosen course? What specific topic, project, or unit stands out?',
        q3: 'Think about part-time work, volunteering, caring responsibilities, hobbies, or personal projects. What skills have these given you, and how do they connect to your course? If you have overcome challenges -- financial, personal, health-related -- universities value hearing about your resilience. You do not need to go into detail, but you can mention it.',
      }
    }

    const savedNames = (ctx.savedCourses ?? []).map((c) => c.name).filter(Boolean)
    const savedSubjectAreas = Array.from(
      new Set((ctx.savedCourses ?? []).map((c) => c.subjectArea).filter((s): s is string => !!s))
    )
    const currentSubjects = (ctx.currentSubjects ?? []).filter(Boolean)
    const grades = ctx.grades ?? []
    const topRiasec = ctx.topRiasec ?? []

    const q1Parts: string[] = []
    if (savedNames.length > 0) {
      const names = savedNames.slice(0, 3).join(', ')
      const area = savedSubjectAreas[0]
      q1Parts.push(
        `You have saved ${names}${savedNames.length > 3 ? ' and others' : ''}. What specifically interests you about ${area ?? 'this subject area'}?`
      )
    }
    if (topRiasec.length > 0) {
      const types = topRiasec
        .slice(0, 3)
        .map((t) => RIASEC_LABEL[t] ?? t)
        .join(', ')
      q1Parts.push(
        `Your career quiz suggested you lean toward ${types}. How does this connect to the course you are choosing?`
      )
    }
    if (q1Parts.length === 0) {
      q1Parts.push(
        'Think about a specific moment when you first became interested in this subject. What happened? What did you learn about yourself?'
      )
    }

    const q2Parts: string[] = []
    if (currentSubjects.length > 0) {
      const subjects = currentSubjects.slice(0, 5).join(', ')
      q2Parts.push(
        `You are studying ${subjects}. Which of these has been most relevant, and what specific unit or project stands out?`
      )
    } else if (grades.length > 0) {
      const subjects = Array.from(new Set(grades.map((g) => g.subject))).slice(0, 5).join(', ')
      q2Parts.push(
        `You have grades in ${subjects}. Which of these has been most relevant to your chosen course?`
      )
    }
    const actuals = grades.filter((g) => !!g.grade)
    if (actuals.length > 0) {
      const highest =
        actuals.find((g) => g.grade === 'A') ??
        actuals.find((g) => g.grade === 'Distinction') ??
        actuals[0]
      q2Parts.push(
        `You recorded ${highest.grade} in ${highest.subject}. What did you learn in that subject that connects to your degree?`
      )
    }
    if (q2Parts.length === 0) {
      q2Parts.push(
        'Which of your school subjects has been most relevant to your chosen course? What specific topic or project stands out?'
      )
    }

    // TODO: If the student has recorded extenuating circumstances (illness, bereavement, serious
    // family disruption), surface a contextual prompt here encouraging them to mention it briefly
    // and factually in Q3 — one or two sentences on what happened and how they kept going.
    // See /support/difficult-circumstances for the admissions guidance this prompt should echo.
    const q3 =
      'Think about part-time work, volunteering, caring responsibilities, hobbies or personal projects. What skills have these given you, and how do they connect to your course? If you are first in your family to apply, have caring responsibilities, or have faced barriers that others have not, this is a strength in your application. Scottish universities actively look for students who have achieved in difficult circumstances.'

    return {
      q1: q1Parts.join(' '),
      q2: q2Parts.join(' '),
      q3,
    }
  }, [ctx])
}

// ---- Common mistakes --------------------------------------------------------

const MISTAKES: { heading: string; detail: string }[] = [
  {
    heading: '"I have always been passionate about..."',
    detail:
      'The most overused opening in UCAS history. Be specific instead -- start with a moment, not a feeling.',
  },
  {
    heading: 'Using AI to generate your statement',
    detail:
      'UCAS flags similarity and AI-generated language. Admissions tutors can tell. Use AI to brainstorm or proofread, but write in your own words.',
  },
  {
    heading: 'Listing activities without reflecting on them',
    detail:
      '"I did X, Y and Z" tells the tutor nothing. "X taught me Y, which is why I want to study Z" tells them everything.',
  },
  {
    heading: 'Spelling and grammar errors',
    detail:
      'Get someone to proofread: a teacher, parent, guidance counsellor, or friend. Use a spell-checker. Read it aloud -- your ear catches what your eye misses.',
  },
  {
    heading: 'Writing what you think they want to hear',
    detail:
      'Admissions tutors read thousands of statements. Authenticity stands out. Honesty about your actual interests beats a rehearsed version of the "ideal" applicant.',
  },
  {
    heading: 'Repeating information already in your application',
    detail:
      'They can see your grades and school. Use the statement to tell them what your grades do not show.',
  },
  {
    heading: 'Being too modest',
    detail:
      'Common among Scottish students and among those from less confident backgrounds. This is your chance to say what you are good at. Take it.',
  },
  {
    heading: 'One generic statement for five different courses',
    detail:
      'If you apply to courses in different subject areas, this will not work. The statement should focus on one subject area.',
  },
]

function CommonMistakes() {
  const [open, setOpen] = useState(false)
  return (
    <section id="mistakes" style={{ paddingTop: '16px', paddingBottom: '48px' }}>
      <div className="pf-container" style={{ maxWidth: '900px' }}>
        <div
          className="pf-card"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '20px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>The most common mistakes</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                A pre-submission checklist drawn from reviewing thousands of UCAS statements.
              </p>
            </div>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              style={{
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
                color: 'var(--pf-grey-600)',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--pf-grey-200)' }}>
              <ol
                style={{
                  paddingLeft: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginTop: '16px',
                }}
              >
                {MISTAKES.map((m, i) => (
                  <li
                    key={m.heading}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--pf-grey-50, #f9fafb)',
                      border: '1px solid var(--pf-grey-200)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        flexShrink: 0,
                        borderRadius: '50%',
                        backgroundColor: 'var(--pf-grey-200)',
                        color: 'var(--pf-grey-700)',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p
                        style={{
                          fontWeight: 700,
                          fontFamily: "'Space Grotesk', sans-serif",
                          color: 'var(--pf-grey-900)',
                          marginBottom: '4px',
                        }}
                      >
                        {m.heading}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-700)', lineHeight: 1.55 }}>
                        {m.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ---- Related links ----------------------------------------------------------

function RelatedLinks() {
  const links = [
    { href: '/simulator', label: 'Subject choice simulator', blurb: 'Try different combinations for S3-S6 and see what it unlocks.' },
    { href: '/universities', label: 'Scottish universities', blurb: 'Entry requirements, widening access routes, and graduate outcomes.' },
    { href: '/blog/first-generation-university-scotland', label: 'First-generation guide', blurb: 'What no one in your family can tell you about applying.' },
    { href: '/widening-access', label: 'Widening access routes', blurb: 'Contextual offers and guaranteed interviews for eligible students.' },
  ]
  return (
    <section style={{ paddingBottom: '64px' }}>
      <div className="pf-container" style={{ maxWidth: '900px' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>See also</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="pf-card-hover no-underline hover:no-underline"
              style={{ padding: '16px 18px', display: 'block', color: 'var(--pf-grey-900)' }}
            >
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: 'var(--pf-blue-700)',
                  marginBottom: '4px',
                }}
              >
                {l.label}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', lineHeight: 1.5 }}>
                {l.blurb}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
