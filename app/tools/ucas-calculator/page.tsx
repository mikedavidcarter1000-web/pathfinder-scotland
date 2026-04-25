'use client'

import { Suspense, useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { useAuth } from '@/hooks/use-auth'
import { useStudentGrades } from '@/hooks/use-student'
import { FeedbackWidget } from '@/components/ui/feedback-widget'
import { trackEngagement } from '@/lib/engagement/track'
import type { Tables } from '@/types/database'

// UCAS tariff points for Scottish qualifications — current as at 2024-25.
// Source: UCAS Tariff Tables (ucas.com/advisers/ucas-tariff).
// Advanced Higher and Higher values are stable and well-established.
// Scottish Baccalaureate values should be re-verified annually.
const TARIFF: Record<string, Record<string, number>> = {
  advanced_higher: { A: 56, B: 48, C: 40, D: 32 },
  higher:          { A: 33, B: 27, C: 21, D: 15 },
  national_5:      {},  // N5s do not carry UCAS tariff points
  scottish_baccalaureate: { Distinction: 40, Pass: 32 },
}

const GRADE_OPTIONS: Record<string, string[]> = {
  advanced_higher:       ['A', 'B', 'C', 'D'],
  higher:                ['A', 'B', 'C', 'D'],
  national_5:            ['A', 'B', 'C', 'D'],
  scottish_baccalaureate: ['Distinction', 'Pass'],
}

const QUAL_LABELS: Record<string, string> = {
  advanced_higher:       'Advanced Higher',
  higher:                'Higher',
  national_5:            'National 5',
  scottish_baccalaureate: 'Scottish Baccalaureate',
}

type Row = { id: number; qual: string; grade: string }

let nextId = 1

function emptyRow(): Row {
  return { id: nextId++, qual: 'higher', grade: 'A' }
}

export default function UcasCalculatorPage() {
  return (
    <>
      <Suspense fallback={<PageLoading />}>
        <CalculatorContent />
      </Suspense>
      <FeedbackWidget />
    </>
  )
}

function PageLoading() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh', padding: '64px 16px' }}>
      <div className="max-w-[800px] mx-auto">
        <div style={{ height: '40px', backgroundColor: 'var(--pf-grey-200)', borderRadius: '6px', marginBottom: '16px', width: '60%' }} />
        <div style={{ height: '20px', backgroundColor: 'var(--pf-grey-100)', borderRadius: '6px', marginBottom: '32px', width: '80%' }} />
        <div style={{ height: '300px', backgroundColor: 'var(--pf-grey-100)', borderRadius: '8px' }} />
      </div>
    </div>
  )
}

function CalculatorContent() {
  const { user } = useAuth()
  const { data: studentGrades } = useStudentGrades() as { data: Tables<'student_grades'>[] | undefined }
  const [rows, setRows] = useState<Row[]>([emptyRow()])
  const [prefillOffered, setPrefillOffered] = useState(false)
  const [prefillDismissed, setPrefillDismissed] = useState(false)

  useEffect(() => {
    trackEngagement('tool_use', 'tool', 'ucas_calculator')
  }, [])

  // Offer to pre-fill once grades are loaded
  useEffect(() => {
    if (!prefillOffered && studentGrades && studentGrades.length > 0) {
      const relevant = studentGrades.filter(
        (g) => g.qualification_type === 'higher' || g.qualification_type === 'advanced_higher'
      )
      if (relevant.length > 0) {
        setPrefillOffered(true)
      }
    }
  }, [studentGrades, prefillOffered])

  function applyPrefill() {
    if (!studentGrades) return
    const relevant = studentGrades.filter(
      (g) =>
        (g.qualification_type === 'higher' || g.qualification_type === 'advanced_higher') &&
        g.grade &&
        GRADE_OPTIONS[g.qualification_type]?.includes(g.grade.toUpperCase())
    )
    if (relevant.length > 0) {
      setRows(
        relevant.map((g) => ({
          id: nextId++,
          qual: g.qualification_type,
          grade: g.grade.toUpperCase(),
        }))
      )
    }
    setPrefillDismissed(true)
  }

  const updateRow = useCallback((id: number, field: 'qual' | 'grade', value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        if (field === 'qual') {
          // Reset grade to first valid option for the new qual type
          const firstGrade = GRADE_OPTIONS[value]?.[0] ?? 'A'
          return { ...r, qual: value, grade: firstGrade }
        }
        return { ...r, grade: value }
      })
    )
  }, [])

  const addRow = useCallback(() => {
    setRows((prev) => {
      if (prev.length >= 12) return prev
      return [...prev, emptyRow()]
    })
  }, [])

  const removeRow = useCallback((id: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }, [])

  const breakdown = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      points: TARIFF[r.qual]?.[r.grade] ?? 0,
      label: QUAL_LABELS[r.qual] ?? r.qual,
      countsTowardsTotal: r.qual !== 'national_5',
    }))
  }, [rows])

  const total = useMemo(
    () => breakdown.reduce((sum, r) => sum + r.points, 0),
    [breakdown]
  )

  const showPrefillBanner =
    user && prefillOffered && !prefillDismissed

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh' }}>
      {/* Header */}
      <section style={{ backgroundColor: 'var(--pf-white)', borderBottom: '1px solid var(--pf-grey-200)' }}>
        <div className="pf-container" style={{ paddingTop: '48px', paddingBottom: '40px', maxWidth: '800px' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
            <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/tools" style={{ color: 'var(--pf-grey-600)' }}>Tools</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>UCAS Tariff Calculator</span>
          </nav>
          <h1 style={{ marginBottom: '12px' }}>UCAS Tariff Point Calculator</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '640px' }}>
            Calculate your UCAS tariff points from Scottish Highers and Advanced Highers.
            Use this to check entry requirements for universities in England, Wales, and Northern Ireland.
          </p>
        </div>
      </section>

      <div className="pf-container" style={{ paddingTop: '40px', paddingBottom: '72px', maxWidth: '800px' }}>
        {/* Pre-fill banner */}
        {showPrefillBanner && (
          <div
            className="pf-card"
            style={{
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="var(--pf-blue-600)" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ flex: 1, margin: 0, fontSize: '0.9375rem', color: 'var(--pf-grey-700)' }}>
              We have your grades on file. Pre-fill the calculator?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={applyPrefill}
                className="pf-btn-primary"
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                Yes, pre-fill
              </button>
              <button
                type="button"
                onClick={() => setPrefillDismissed(true)}
                className="pf-btn-secondary"
                style={{ fontSize: '0.875rem', padding: '8px 16px' }}
              >
                No thanks
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: 'minmax(0,1fr)' }}>
          {/* Section 1: Your qualifications */}
          <div className="pf-card" style={{ padding: '28px 24px' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '20px' }}>Your qualifications</h2>

            {/* Column headers (desktop only) */}
            <div
              className="hidden sm:grid"
              style={{ gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '8px', paddingRight: '40px' }}
            >
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--pf-grey-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Qualification
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--pf-grey-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Grade
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rows.map((row) => (
                <QualRow
                  key={row.id}
                  row={row}
                  onChange={updateRow}
                  onRemove={removeRow}
                  canRemove={rows.length > 1}
                />
              ))}
            </div>

            {rows.length < 12 && (
              <button
                type="button"
                onClick={addRow}
                style={{
                  marginTop: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--pf-blue-700)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add another qualification
              </button>
            )}
          </div>

          {/* Section 2: Your UCAS points */}
          <div className="pf-card" style={{ padding: '28px 24px' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '20px' }}>Your UCAS tariff points</h2>

            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                  fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: total > 0 ? 'var(--pf-blue-700)' : 'var(--pf-grey-400)',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                {total}
              </div>
              <div style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)' }}>tariff points</div>
            </div>

            {/* Breakdown table */}
            {breakdown.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--pf-grey-200)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: 'var(--pf-grey-700)' }}>Qualification</th>
                      <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600, color: 'var(--pf-grey-700)' }}>Grade</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: 'var(--pf-grey-700)' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--pf-grey-900)' }}>{r.label}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--pf-grey-700)' }}>{r.grade}</td>
                        <td
                          style={{
                            padding: '8px 12px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: r.countsTowardsTotal ? 'var(--pf-blue-700)' : 'var(--pf-grey-400)',
                          }}
                        >
                          {r.countsTowardsTotal ? r.points : '—'}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: 'var(--pf-grey-50)' }}>
                      <td colSpan={2} style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--pf-grey-900)' }}>Total</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--pf-blue-700)', fontSize: '1.0625rem' }}>{total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* N5 note */}
            {breakdown.some((r) => r.qual === 'national_5') && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--pf-amber-50, #fffbeb)',
                  borderRadius: '6px',
                  border: '1px solid var(--pf-amber-200, #fde68a)',
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-700)',
                  lineHeight: 1.6,
                }}
              >
                <strong>Note:</strong> National 5 qualifications do not carry UCAS tariff points.
                However, they are still important for meeting specific subject entry requirements.
              </div>
            )}
          </div>

          {/* Section 3: Context and guidance */}
          <div className="pf-card" style={{ padding: '28px 24px' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '20px' }}>How Scottish universities use tariff points</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px 20px', backgroundColor: 'var(--pf-blue-50)', borderRadius: '8px', border: '1px solid var(--pf-blue-100)' }}>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--pf-grey-700)', lineHeight: 1.7 }}>
                  <strong>Most Scottish universities make offers based on specific Higher grades</strong> (e.g. AABB)
                  rather than total tariff points. Tariff points matter more when applying to universities in
                  England, Wales, or Northern Ireland.
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--pf-grey-700)', lineHeight: 1.7 }}>
                If a Scottish university asks for{' '}
                <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--pf-grey-100)', padding: '2px 6px', borderRadius: '4px' }}>BBBB at Higher</span>,
                that means four Highers at grade B — not a tariff total.
              </p>

              <h3 style={{ fontSize: '1rem', marginBottom: '8px', marginTop: '8px' }}>What if I have fewer Highers?</h3>
              <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--pf-grey-700)', lineHeight: 1.7 }}>
                Many universities will consider applicants with three or four Highers.{' '}
                <Link href="/blog" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
                  Read our blog for guidance
                </Link>
                {' '}or use the tools below.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                <Link href="/tools/simulator" className="pf-btn-secondary no-underline hover:no-underline" style={{ fontSize: '0.875rem' }}>
                  Subject simulator
                </Link>
                <Link href="/universities" className="pf-btn-secondary no-underline hover:no-underline" style={{ fontSize: '0.875rem' }}>
                  Browse universities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QualRow({
  row,
  onChange,
  onRemove,
  canRemove,
}: {
  row: Row
  onChange: (id: number, field: 'qual' | 'grade', value: string) => void
  onRemove: (id: number) => void
  canRemove: boolean
}) {
  const gradeOptions = GRADE_OPTIONS[row.qual] ?? ['A', 'B', 'C', 'D']

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: '10px',
        alignItems: 'center',
      }}
    >
      <select
        value={row.qual}
        onChange={(e) => onChange(row.id, 'qual', e.target.value)}
        aria-label="Qualification type"
        style={{
          padding: '9px 12px',
          borderRadius: '6px',
          border: '1px solid var(--pf-grey-300)',
          fontSize: '0.9375rem',
          backgroundColor: 'var(--pf-white)',
          color: 'var(--pf-grey-900)',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        {Object.entries(QUAL_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={row.grade}
        onChange={(e) => onChange(row.id, 'grade', e.target.value)}
        aria-label="Grade"
        style={{
          padding: '9px 12px',
          borderRadius: '6px',
          border: '1px solid var(--pf-grey-300)',
          fontSize: '0.9375rem',
          backgroundColor: 'var(--pf-white)',
          color: 'var(--pf-grey-900)',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        {gradeOptions.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => onRemove(row.id)}
        disabled={!canRemove}
        aria-label="Remove this qualification"
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          border: '1px solid var(--pf-grey-300)',
          backgroundColor: canRemove ? 'var(--pf-white)' : 'transparent',
          color: canRemove ? 'var(--pf-grey-500)' : 'var(--pf-grey-300)',
          cursor: canRemove ? 'pointer' : 'default',
        }}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
