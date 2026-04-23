'use client'

import Link from 'next/link'
import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { FeedbackWidget } from '@/components/ui/feedback-widget'
import {
  ANSWER_OPTIONS,
  RIASEC_COLOURS,
  RIASEC_DESCRIPTIONS,
  RIASEC_LABELS,
  RIASEC_TAGLINES,
  calculateScores,
  shuffleQuestions,
} from './constants'
import { RadarChart } from './radar-chart'
import type {
  AnswerValue,
  QuizQuestion,
  QuizResultRow,
  RiasecMapping,
  RiasecType,
  Scores,
} from './types'

type Mode = 'landing' | 'quiz' | 'results'

type Props = {
  questions: QuizQuestion[]
  mappings: RiasecMapping[]
  isLoggedIn: boolean
  previousResult: QuizResultRow | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function QuizClient({ questions, mappings, isLoggedIn, previousResult }: Props) {
  const [mode, setMode] = useState<Mode>('landing')
  const [orderedQuestions, setOrderedQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [transition, setTransition] = useState<'idle' | 'out' | 'in'>('idle')

  // Results state
  const [finalScores, setFinalScores] = useState<Scores | null>(null)
  const [finalTopTypes, setFinalTopTypes] = useState<RiasecType[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  const startQuiz = useCallback(() => {
    setOrderedQuestions(shuffleQuestions(questions))
    setCurrentIndex(0)
    setAnswers({})
    setSaveStatus('idle')
    setShareStatus('idle')
    setMode('quiz')
    setTransition('in')
  }, [questions])

  const handleAnswer = useCallback(
    (value: AnswerValue) => {
      const q = orderedQuestions[currentIndex]
      if (!q) return
      const nextAnswers = { ...answers, [q.id]: value }
      setAnswers(nextAnswers)
      setTransition('out')
      // Allow the fade-out animation to play, then advance / finish.
      window.setTimeout(() => {
        if (currentIndex < orderedQuestions.length - 1) {
          setCurrentIndex((i) => i + 1)
          setTransition('in')
        } else {
          const { scores, topTypes } = calculateScores(nextAnswers, orderedQuestions)
          setFinalScores(scores)
          setFinalTopTypes(topTypes)
          setMode('results')
          setTransition('idle')
        }
      }, 180)
    },
    [answers, currentIndex, orderedQuestions]
  )

  const goBack = useCallback(() => {
    if (currentIndex === 0) return
    setTransition('out')
    window.setTimeout(() => {
      setCurrentIndex((i) => i - 1)
      setTransition('in')
    }, 150)
  }, [currentIndex])

  const restart = useCallback(() => {
    setMode('landing')
    setFinalScores(null)
    setFinalTopTypes([])
    setSaveStatus('idle')
    setShareStatus('idle')
  }, [])

  const handleSave = useCallback(async () => {
    if (!finalScores || !isLoggedIn) return
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          realistic_score: finalScores.R,
          investigative_score: finalScores.I,
          artistic_score: finalScores.A,
          social_score: finalScores.S,
          enterprising_score: finalScores.E,
          conventional_score: finalScores.C,
          top_types: finalTopTypes,
        }),
      })
      if (!res.ok) throw new Error('save failed')
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [finalScores, finalTopTypes, isLoggedIn])

  const handleShare = useCallback(async () => {
    if (!finalScores || finalTopTypes.length === 0) return
    const typeLabels = finalTopTypes.map((t) => RIASEC_LABELS[t]).join(', ')
    const topArea = mappings
      .filter((m) => finalTopTypes.includes(m.riasec_type))
      .slice(0, 3)
      .map((m) => m.career_area)
      .join(', ')
    const text = `My Pathfinder Scotland career profile: ${typeLabels}. Careers that might suit me: ${topArea}. Take the quiz at pathfinderscot.co.uk/quiz`
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('copied')
      window.setTimeout(() => setShareStatus('idle'), 2500)
    } catch {
      setShareStatus('error')
    }
  }, [finalScores, finalTopTypes, mappings])

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '100vh' }}>
      {mode === 'landing' && (
        <LandingScreen
          isLoggedIn={isLoggedIn}
          previousResult={previousResult}
          onStart={startQuiz}
        />
      )}
      {mode === 'quiz' && orderedQuestions.length > 0 && (
        <QuizScreen
          question={orderedQuestions[currentIndex]!}
          currentAnswer={answers[orderedQuestions[currentIndex]!.id] ?? null}
          index={currentIndex}
          total={orderedQuestions.length}
          transition={transition}
          onAnswer={handleAnswer}
          onBack={goBack}
          onExit={restart}
        />
      )}
      {mode === 'results' && finalScores && (
        <ResultsScreen
          scores={finalScores}
          topTypes={finalTopTypes}
          mappings={mappings}
          isLoggedIn={isLoggedIn}
          saveStatus={saveStatus}
          shareStatus={shareStatus}
          onSave={handleSave}
          onShare={handleShare}
          onRetake={startQuiz}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------

function LandingScreen({
  isLoggedIn,
  previousResult,
  onStart,
}: {
  isLoggedIn: boolean
  previousResult: QuizResultRow | null
  onStart: () => void
}) {
  return (
    <section className="pf-container" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
      <div style={{ maxWidth: '640px' }}>
        <span
          className="pf-badge-blue"
          style={{ marginBottom: '16px', display: 'inline-flex' }}
        >
          Career quiz · 3 minutes
        </span>
        <h1 style={{ marginBottom: '16px', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)' }}>
          What kind of career might suit you?
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--pf-grey-600)',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          Answer 18 quick questions to explore careers that match your interests. You&apos;ll get a
          personalised RIASEC profile with Scottish career areas and recommended Highers.
        </p>

        {previousResult && (
          <div
            className="pf-card-flat"
            style={{
              padding: '16px 20px',
              marginBottom: '24px',
              borderLeft: '4px solid var(--pf-blue-500)',
            }}
          >
            <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', marginBottom: '4px' }}>
              You last took this quiz on <strong>{formatDate(previousResult.completed_at)}</strong>.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
              Your profile was {previousResult.top_types.map((t) => RIASEC_LABELS[t as RiasecType]).join(', ')}.
              Retake to see if anything has shifted.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onStart}
          className="pf-btn-primary"
          style={{ marginBottom: '12px' }}
        >
          {previousResult ? 'Retake quiz' : 'Start quiz'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {!isLoggedIn && (
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
            You can take the quiz without an account.{' '}
            <Link href="/auth/sign-in" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
              Sign in
            </Link>{' '}
            to save your results.
          </p>
        )}

        <div
          style={{
            marginTop: '40px',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: 'var(--pf-white)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <h2 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--pf-grey-900)' }}>
            How it works
          </h2>
          <ul style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)', lineHeight: 1.7, paddingLeft: '20px' }}>
            <li>Read each activity and rate how much you&apos;d enjoy doing it</li>
            <li>Based on the RIASEC career interests framework (Holland Code)</li>
            <li>Get your top 3 interest types plus Scottish careers and Highers that fit</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

function QuizScreen({
  question,
  currentAnswer,
  index,
  total,
  transition,
  onAnswer,
  onBack,
  onExit,
}: {
  question: QuizQuestion
  currentAnswer: AnswerValue | null
  index: number
  total: number
  transition: 'idle' | 'out' | 'in'
  onAnswer: (value: AnswerValue) => void
  onBack: () => void
  onExit: () => void
}) {
  const progress = ((index + 1) / total) * 100
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    // Move focus to the question heading each time it changes — helpful for
    // screen reader users and keeps keyboard flow inside the quiz card.
    headingRef.current?.focus()
  }, [question.id])

  const cardOpacity = transition === 'out' ? 0 : 1
  const cardTransform =
    transition === 'out' ? 'translateY(-8px)' : transition === 'in' ? 'translateY(0)' : 'translateY(0)'

  return (
    <section className="pf-container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--pf-grey-600)',
            }}
          >
            Question {index + 1} of {total}
          </span>
          <button
            type="button"
            onClick={onExit}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--pf-grey-600)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
            aria-label="Exit quiz"
          >
            Exit
          </button>
        </div>

        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '999px',
            backgroundColor: 'var(--pf-grey-100)',
            overflow: 'hidden',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: 'var(--pf-blue-700)',
              transition: 'width 0.25s ease-out',
            }}
          />
        </div>

        <div
          style={{
            opacity: cardOpacity,
            transform: cardTransform,
            transition: 'opacity 0.18s ease-out, transform 0.18s ease-out',
          }}
        >
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'var(--pf-blue-700)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
            }}
          >
            How much would you enjoy…
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            style={{
              fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)',
              lineHeight: 1.35,
              marginBottom: '32px',
              outline: 'none',
            }}
          >
            {question.question_text}
          </h2>

          <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
            {ANSWER_OPTIONS.map((opt) => {
              const selected = currentAnswer === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onAnswer(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    width: '100%',
                    minHeight: '56px',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: selected ? '2px solid var(--pf-blue-700)' : '2px solid var(--pf-grey-300)',
                    backgroundColor: selected ? 'var(--pf-blue-50)' : 'var(--pf-white)',
                    color: 'var(--pf-grey-900)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)'
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = 'var(--pf-white)'
                  }}
                >
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }} aria-hidden="true">
                    {opt.emoji}
                  </span>
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={onBack}
              disabled={index === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                color: index === 0 ? 'var(--pf-grey-300)' : 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: index === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

function ResultsScreen({
  scores,
  topTypes,
  mappings,
  isLoggedIn,
  saveStatus,
  shareStatus,
  onSave,
  onShare,
  onRetake,
}: {
  scores: Scores
  topTypes: RiasecType[]
  mappings: RiasecMapping[]
  isLoggedIn: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  shareStatus: 'idle' | 'copied' | 'error'
  onSave: () => void
  onShare: () => void
  onRetake: () => void
}) {
  const mappingsByType = useMemo(() => {
    const map = new Map<RiasecType, RiasecMapping[]>()
    for (const m of mappings) {
      const key = m.riasec_type
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return map
  }, [mappings])

  return (
    <>
    <section className="pf-container" style={{ paddingTop: '48px', paddingBottom: '72px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <span className="pf-badge-blue" style={{ display: 'inline-flex', marginBottom: '12px' }}>
            Your results
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', marginBottom: '8px' }}>
            Your top 3:{' '}
            {topTypes.map((t) => RIASEC_LABELS[t]).join(' · ')}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--pf-grey-600)', lineHeight: 1.6 }}>
            These are the interest types that stood out most in your answers. Everyone is a mix —
            your radar below shows how you score across all six.
          </p>
        </div>

        <div
          className="pf-card-flat"
          style={{
            padding: '28px 20px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <RadarChart scores={scores} />
        </div>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
          Your top matches
        </h2>

        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            marginBottom: '32px',
          }}
        >
          {topTypes.map((t, rank) => (
            <TypeCard
              key={t}
              rank={rank + 1}
              type={t}
              score={scores[t]}
              areas={mappingsByType.get(t) ?? []}
            />
          ))}
        </div>

        <div
          className="pf-card-flat"
          style={{
            padding: '20px 24px',
            marginBottom: '32px',
          }}
        >
          <h2 style={{ fontSize: '1rem', marginBottom: '12px' }}>
            Share your results
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
            Copies a short summary of your profile — no personal data — so you can share it with
            family, friends, or a careers adviser.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <button type="button" onClick={onShare} className="pf-btn-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy shareable summary
            </button>
            {shareStatus === 'copied' && (
              <span style={{ fontSize: '0.875rem', color: 'var(--pf-green-500)', fontWeight: 600 }}>
                Copied to clipboard
              </span>
            )}
            {shareStatus === 'error' && (
              <span style={{ fontSize: '0.875rem', color: 'var(--pf-red-500)', fontWeight: 600 }}>
                Couldn&apos;t copy — try selecting the text manually.
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className="pf-btn-primary"
            >
              {saveStatus === 'saving'
                ? 'Saving...'
                : saveStatus === 'saved'
                ? 'Saved to your profile'
                : 'Save results'}
            </button>
          ) : (
            <Link href="/auth/sign-up" className="pf-btn-primary no-underline hover:no-underline">
              Sign up to save results
            </Link>
          )}
          <button type="button" onClick={onRetake} className="pf-btn-secondary">
            Retake quiz
          </button>
          <Link href="/compare/subjects" className="pf-btn-ghost no-underline hover:no-underline">
            Explore subjects
          </Link>
          {saveStatus === 'error' && (
            <span style={{ fontSize: '0.875rem', color: 'var(--pf-red-500)', fontWeight: 600 }}>
              Couldn&apos;t save — please try again.
            </span>
          )}
        </div>
      </div>
    </section>
    <FeedbackWidget />
    </>
  )
}

function TypeCard({
  rank,
  type,
  score,
  areas,
}: {
  rank: number
  type: RiasecType
  score: number
  areas: RiasecMapping[]
}) {
  const colour = RIASEC_COLOURS[type]
  return (
    <article
      className="pf-card-flat"
      style={{
        padding: '20px',
        borderTop: `4px solid ${colour}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--pf-grey-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Rank {rank} · {RIASEC_TAGLINES[type]}
          </p>
          <h3 style={{ fontSize: '1.125rem', marginTop: '4px' }}>{RIASEC_LABELS[type]}</h3>
        </div>
        <span
          className="pf-data-number"
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: colour,
          }}
        >
          {score}
        </span>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', lineHeight: 1.5 }}>
        {RIASEC_DESCRIPTIONS[type]}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {areas.slice(0, 4).map((area) => (
          <div key={area.id}>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--pf-grey-900)',
                marginBottom: '4px',
              }}
            >
              {area.career_area}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', lineHeight: 1.45, marginBottom: '6px' }}>
              {(area.example_careers ?? []).slice(0, 4).join(', ')}
            </p>
            {area.recommended_highers && area.recommended_highers.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>Highers:</span>{' '}
                {area.recommended_highers.join(' · ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </article>
  )
}
