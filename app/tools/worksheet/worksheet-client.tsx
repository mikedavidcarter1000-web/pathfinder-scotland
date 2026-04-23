'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Choice = {
  id: string
  rank_order: number | null
  is_reserve: boolean | null
  subject_name: string
  subject_id: string
  career_sectors: string[]
  uni_course_count: number
}

type PreviousChoice = {
  id: string
  rank_order: number | null
  subject_name: string
  subject_id: string
  grade_actual: string | null
  grade_predicted: string | null
  qualification_type: string | null
}

type SavedCourse = {
  id: string
  course_name: string
  university_name: string
  course_id: string
  requirements: {
    subject_name: string
    subject_id: string
    qualification_level: string
    is_mandatory: boolean | null
  }[]
}

type WorksheetData = {
  student: {
    first_name: string
    last_name: string
    school_stage: string
    school_name: string | null
    simd_decile: number | null
  }
  transition: string
  transitionLabel: string
  previousTransition: string | null
  rules: {
    total_subjects: number
    compulsory_subjects: string[]
    num_free_choices: number
    num_reserves: number
    breadth_requirements: unknown
  } | null
  currentChoices: Choice[]
  previousChoices: PreviousChoice[]
  savedCourses: SavedCourse[]
  bursaries: { name: string; amount_description: string | null }[]
  saas: { bursary: string; loan: string } | null
  simdDeprived: boolean
  missingDataFlags: {
    noGrades: boolean
    noSavedCourses: boolean
    noCurrentChoices: boolean
    noPreviousChoices: boolean
    noPostcode: boolean
  }
  generatedAt: string
}

type ApiResponse = WorksheetData & { redirect?: boolean; stage?: string }

const QUAL_LABELS: Record<string, string> = {
  national_4: 'National 4',
  national_5: 'National 5',
  higher: 'Higher',
  advanced_higher: 'Advanced Higher',
  scottish_baccalaureate: 'Scottish Baccalaureate',
}

function qualLabel(type: string | null): string {
  if (!type) return ''
  return QUAL_LABELS[type] ?? type
}

function gradeInfo(c: PreviousChoice): { text: string; muted: boolean } | null {
  if (c.grade_actual) return { text: c.grade_actual, muted: false }
  if (c.grade_predicted) return { text: `${c.grade_predicted} (predicted)`, muted: true }
  return null
}

function handlePrint() {
  window.print()
}

function handleDownloadPdf(data: WorksheetData) {
  const date = new Date(data.generatedAt).toISOString().split('T')[0]
  const firstName = data.student.first_name.toLowerCase().replace(/\s+/g, '-')
  const prev = document.title
  document.title = `pathfinder-worksheet-${firstName}-${data.transition}-${date}`
  window.print()
  setTimeout(() => { document.title = prev }, 1000)
}

export function WorksheetClient() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/worksheet/data')
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href = '/auth/sign-in?redirect=/tools/worksheet'
          return null
        }
        if (!res.ok) throw new Error('Failed to load')
        return res.json() as Promise<ApiResponse>
      })
      .then((json) => {
        if (json) setApiData(json)
      })
      .catch(() => setError('Unable to load your worksheet. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh', padding: '64px 16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ height: '40px', backgroundColor: 'var(--pf-grey-200)', borderRadius: '6px', marginBottom: '16px', width: '55%' }} />
          <div style={{ height: '20px', backgroundColor: 'var(--pf-grey-100)', borderRadius: '6px', marginBottom: '32px', width: '75%' }} />
          <div style={{ height: '300px', backgroundColor: 'var(--pf-grey-100)', borderRadius: '8px' }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh', padding: '64px 16px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--pf-grey-600)', marginBottom: '16px' }}>{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="pf-btn-primary">
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!apiData) return null

  if (apiData.redirect) {
    return (
      <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '60vh', padding: '64px 16px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div className="pf-card" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <svg width="48" height="48" fill="none" stroke="var(--pf-blue-500)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 20px', display: 'block' }} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 style={{ fontSize: '1.375rem', marginBottom: '12px' }}>Worksheet not available for your year group</h1>
            <p style={{ color: 'var(--pf-grey-600)', lineHeight: 1.7, marginBottom: '24px' }}>
              Subject choice worksheets are for students in S2–S5. If you&apos;re in S6, at college, or a mature student,
              use the career comparison tool to explore your options.
            </p>
            <Link href="/careers/compare" className="pf-btn-primary no-underline hover:no-underline">
              Compare careers
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const data = apiData as WorksheetData
  const missingCount = Object.values(data.missingDataFlags).filter(Boolean).length
  const chosenSubjectIds = new Set(data.currentChoices.map((c) => c.subject_id))
  const allCareerSectors = [...new Set(data.currentChoices.flatMap((c) => c.career_sectors))].sort()

  return (
    <div className="worksheet-page">
      {/* Screen-only action bar */}
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
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
            <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>Home</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <Link href="/tools" style={{ color: 'var(--pf-grey-600)' }}>Tools</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>Subject Choice Worksheet</span>
          </nav>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="pf-btn-secondary"
              style={{ fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              type="button"
              onClick={() => handleDownloadPdf(data)}
              className="pf-btn-primary"
              style={{ fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download as PDF
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 16px 80px' }}>

        {/* Missing data banner */}
        {missingCount > 2 && (
          <div
            style={{
              marginBottom: '24px',
              padding: '14px 18px',
              backgroundColor: 'var(--pf-amber-50, #fffbeb)',
              border: '1px solid var(--pf-amber-300, #fcd34d)',
              borderRadius: '8px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-800)',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="var(--pf-amber-600, #d97706)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong>Your worksheet is missing some information.</strong>{' '}
              <Link href="/dashboard" className="no-print" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
                Complete your profile
              </Link>{' '}
              to see the full picture — add your grades, subject choices, and saved courses.
            </div>
          </div>
        )}

        {/* Worksheet header */}
        <div className="worksheet-section pf-card" style={{ padding: '22px 28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--pf-blue-700)', marginBottom: '8px' }}>
                Pathfinder Scotland — Subject Choice Worksheet
              </div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                {data.student.first_name} {data.student.last_name}
              </h1>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', margin: 0 }}>
                {data.student.school_name ? `${data.student.school_name} · ` : ''}
                Year group: {data.student.school_stage?.toUpperCase()}
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--pf-grey-500)', flexShrink: 0 }}>
              <div style={{ marginBottom: '4px' }}>
                Transition: <strong style={{ color: 'var(--pf-grey-800)' }}>{data.transitionLabel}</strong>
              </div>
              <div>Generated: {new Date(data.generatedAt).toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        </div>

        {/* Section 1: Your details */}
        <Section number={1} title="Your details">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <DetailField label="Full name" value={`${data.student.first_name} ${data.student.last_name}`} />
            <DetailField label="School" value={data.student.school_name ?? '—'} />
            <DetailField label="Current year" value={data.student.school_stage?.toUpperCase() ?? '—'} />
            <DetailField label="Choosing for" value={data.transitionLabel} />
          </div>
        </Section>

        {/* Section 2: Current subjects and grades */}
        <Section number={2} title="Your current subjects and grades">
          {data.missingDataFlags.noPreviousChoices ? (
            <EmptyState
              message="No subject choices recorded for your current year."
              cta={{ label: 'Add subject choices', href: '/pathways' }}
            />
          ) : (
            <>
              <table className="worksheet-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--pf-grey-200)' }}>
                    <Th>Subject</Th>
                    <Th>Qualification</Th>
                    <Th>Grade</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.previousChoices.map((c) => {
                    const g = gradeInfo(c)
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                        <Td>{c.subject_name}</Td>
                        <Td muted>{qualLabel(c.qualification_type)}</Td>
                        <Td>
                          {g ? (
                            <span style={{ color: g.muted ? 'var(--pf-grey-500)' : 'var(--pf-grey-900)' }}>
                              {g.text}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--pf-grey-400)' }}>Not recorded</span>
                          )}
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {data.missingDataFlags.noGrades && (
                <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--pf-grey-50)', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                  <Link href="/grades" className="no-print" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>Add your grades</Link>
                  <span className="no-print"> to see results alongside your subject choices.</span>
                  <span className="print-only">Add grades at pathfinderscot.co.uk to see results alongside your choices.</span>
                </div>
              )}
            </>
          )}
        </Section>

        {/* Section 3: Subject choices for next year */}
        <Section number={3} title={`Subject choices — ${data.transitionLabel}`}>
          {data.rules && (
            <div style={{ marginBottom: '14px', padding: '10px 14px', backgroundColor: 'var(--pf-blue-50)', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--pf-grey-700)', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span>Total subjects: <strong>{data.rules.total_subjects}</strong></span>
              <span>Free choices: <strong>{data.rules.num_free_choices}</strong></span>
              {data.rules.num_reserves > 0 && (
                <span>Reserve choices: <strong>{data.rules.num_reserves}</strong></span>
              )}
            </div>
          )}
          {data.missingDataFlags.noCurrentChoices ? (
            <div>
              <EmptyState
                message="No choices recorded yet. Add your choices in Pathfinder, or write them in the lines below."
                cta={{ label: 'Add subject choices', href: '/pathways' }}
              />
              <div style={{ marginTop: '16px' }}>
                <WritingLines count={data.rules?.total_subjects ?? 6} />
              </div>
            </div>
          ) : (
            <table className="worksheet-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--pf-grey-200)' }}>
                  <Th width="40px">#</Th>
                  <Th>Subject</Th>
                  <Th width="130px">Type</Th>
                </tr>
              </thead>
              <tbody>
                {data.currentChoices
                  .filter((c) => !c.is_reserve)
                  .map((c, i) => {
                    const isCompulsory = data.rules?.compulsory_subjects.includes(c.subject_name) ?? false
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                        <Td muted>{i + 1}</Td>
                        <Td><strong>{c.subject_name}</strong></Td>
                        <Td>
                          {isCompulsory ? (
                            <Badge color="blue">Compulsory</Badge>
                          ) : (
                            <span style={{ color: 'var(--pf-grey-500)', fontSize: '0.875rem' }}>Free choice</span>
                          )}
                        </Td>
                      </tr>
                    )
                  })}
                {data.currentChoices
                  .filter((c) => c.is_reserve)
                  .map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--pf-grey-100)', backgroundColor: 'var(--pf-grey-50)' }}>
                      <Td muted>R{i + 1}</Td>
                      <Td style={{ color: 'var(--pf-grey-600)' }}>{c.subject_name}</Td>
                      <Td><span style={{ color: 'var(--pf-grey-500)', fontStyle: 'italic', fontSize: '0.875rem' }}>Reserve</span></Td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Section 4: Where these choices could lead */}
        <Section number={4} title="Where these choices could lead">
          {data.missingDataFlags.noCurrentChoices ? (
            <EmptyState
              message="Add your subject choices to see which careers and courses they support."
              cta={{ label: 'Add choices', href: '/pathways' }}
            />
          ) : (
            <div>
              <table className="worksheet-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--pf-grey-200)' }}>
                    <Th>Subject</Th>
                    <Th>Career sectors</Th>
                    <Th width="110px">Uni courses</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.currentChoices
                    .filter((c) => !c.is_reserve)
                    .map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--pf-grey-100)', verticalAlign: 'top' }}>
                        <Td><strong>{c.subject_name}</strong></Td>
                        <Td>
                          {c.career_sectors.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingTop: '2px' }}>
                              {c.career_sectors.map((s) => (
                                <Badge key={s} color="grey">{s}</Badge>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--pf-grey-400)', fontSize: '0.875rem' }}>Not mapped</span>
                          )}
                        </Td>
                        <Td>
                          {c.uni_course_count > 0 ? (
                            <span style={{ fontWeight: 700, color: 'var(--pf-blue-700)' }}>{c.uni_course_count}</span>
                          ) : (
                            <span style={{ color: 'var(--pf-grey-400)' }}>—</span>
                          )}
                        </Td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {allCareerSectors.length > 0 && (
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--pf-blue-50)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--pf-blue-800)', marginBottom: '8px' }}>
                    Career sectors supported by your choices
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {allCareerSectors.map((s) => (
                      <Badge key={s} color="blue">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Section 5: Alignment with saved courses */}
        <Section number={5} title="How your choices align with saved courses">
          {data.missingDataFlags.noSavedCourses ? (
            <EmptyState
              message="You have no saved courses yet."
              cta={{ label: 'Browse courses', href: '/courses' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.savedCourses.map((course) => {
                const mandatory = course.requirements.filter((r) => r.is_mandatory !== false)
                const optional = course.requirements.filter((r) => r.is_mandatory === false)
                const mandatoryMet = mandatory.filter((r) => chosenSubjectIds.has(r.subject_id))
                const mandatoryMissing = mandatory.filter((r) => !chosenSubjectIds.has(r.subject_id))
                const optionalMet = optional.filter((r) => chosenSubjectIds.has(r.subject_id))
                return (
                  <div key={course.id} style={{ padding: '14px 16px', border: '1px solid var(--pf-grey-200)', borderRadius: '8px', backgroundColor: 'var(--pf-white)' }}>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>{course.course_name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '10px' }}>{course.university_name}</div>
                    {course.requirements.length === 0 ? (
                      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-400)', margin: 0 }}>No subject requirements recorded.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {mandatoryMet.map((r) => (
                          <RequirementPill key={r.subject_id + r.qualification_level} met text={`${r.subject_name} (${qualLabel(r.qualification_level)})`} />
                        ))}
                        {mandatoryMissing.map((r) => (
                          <RequirementPill key={r.subject_id + r.qualification_level} met={false} text={`${r.subject_name} (${qualLabel(r.qualification_level)})`} />
                        ))}
                        {optionalMet.map((r) => (
                          <RequirementPill key={r.subject_id + r.qualification_level} met optional text={`${r.subject_name} (${qualLabel(r.qualification_level)})`} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-500)', margin: '2px 0 0' }}>
                <span style={{ color: 'var(--pf-green-600, #059669)', fontWeight: 700 }}>✓</span> requirement met by your current choices.{' '}
                <span style={{ color: 'var(--pf-red-600, #dc2626)', fontWeight: 700 }}>✗</span> requirement not in your current choices.
              </p>
            </div>
          )}
        </Section>

        {/* Section 6: Funding and support */}
        <Section number={6} title="Funding and support snapshot">
          {data.missingDataFlags.noPostcode && !data.saas && data.bursaries.length === 0 ? (
            <EmptyState
              message="Complete your profile with your postcode and household income to see funding you may be eligible for."
              cta={{ label: 'Update profile', href: '/account/profile' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.simdDeprived && (
                <div style={{ padding: '14px 16px', backgroundColor: 'var(--pf-green-50, #ecfdf5)', border: '1px solid var(--pf-green-200, #a7f3d0)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--pf-green-800, #065f46)', marginBottom: '4px' }}>
                    You may be eligible for widening access programmes
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--pf-green-800, #065f46)', margin: 0 }}>
                    Many Scottish universities offer lower entry requirements and extra support for students from SIMD deciles 1–4.
                    Ask your guidance teacher about widening access routes or visit{' '}
                    <span className="no-print">
                      <Link href="/widening-access" style={{ color: 'var(--pf-green-700, #047857)', fontWeight: 600 }}>pathfinderscot.co.uk/widening-access</Link>
                    </span>
                    <span className="print-only">pathfinderscot.co.uk/widening-access</span>.
                  </p>
                </div>
              )}
              {data.saas && (
                <div style={{ padding: '14px 16px', border: '1px solid var(--pf-grey-200)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>SAAS student support estimate</div>
                  <p style={{ fontSize: '0.9375rem', margin: 0, color: 'var(--pf-grey-700)', lineHeight: 1.6 }}>
                    {data.saas.bursary} {data.saas.loan}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-500)', marginTop: '6px', marginBottom: 0 }}>
                    Based on your household income band. Actual amounts depend on full SAAS assessment.
                    Visit saas.gov.uk to apply.
                  </p>
                </div>
              )}
              {data.bursaries.length > 0 && (
                <div style={{ padding: '14px 16px', border: '1px solid var(--pf-grey-200)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '10px' }}>Bursaries you may be eligible for</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.bursaries.map((b) => (
                      <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.9375rem' }}>
                        <span style={{ color: 'var(--pf-grey-800)' }}>{b.name}</span>
                        {b.amount_description && (
                          <span style={{ color: 'var(--pf-blue-700)', fontWeight: 600, flexShrink: 0 }}>{b.amount_description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-500)', marginTop: '10px', marginBottom: 0 }}>
                    <span className="no-print">
                      <Link href="/bursaries" style={{ color: 'var(--pf-blue-700)' }}>See all bursaries and funding</Link>
                    </span>
                    <span className="print-only">See all bursaries at pathfinderscot.co.uk/bursaries</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Section 7: Guidance meeting notes — page break before in print */}
        <div className="print-break-before">
          <Section number={7} title="Notes for your guidance teacher meeting">
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', marginBottom: '24px', lineHeight: 1.7 }}>
              Use this space to jot down questions and notes before or during your guidance meeting.
              Three starter questions are pre-filled below.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <GuidanceQuestion
                number={1}
                question="I'm considering these subjects. Are there any timetable clashes or alternatives I should know about?"
              />
              <GuidanceQuestion
                number={2}
                question="I'm interested in these career areas. What subjects and qualifications do I need to keep those options open?"
                detail={allCareerSectors.length > 0 ? `(Your mapped career interests: ${allCareerSectors.join(', ')})` : undefined}
              />
              <GuidanceQuestion
                number={3}
                question="Are there any widening access routes, bursaries, or support programmes I should be applying for?"
              />
            </div>
          </Section>
        </div>
      </div>

      {/* Print-only footer — fixed so it appears on every printed page */}
      <div className="print-only worksheet-print-footer" aria-hidden="true">
        Pathfinder Scotland · pathfinderscot.co.uk · Generated {new Date(data.generatedAt).toLocaleDateString('en-GB')}
      </div>
    </div>
  )
}

// ---- Sub-components ----

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="worksheet-section pf-card" style={{ padding: '22px 28px', marginBottom: '20px' }}>
      <h2
        style={{
          fontSize: '1.0625rem',
          marginBottom: '16px',
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
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: 'var(--pf-blue-700)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          {number}
        </span>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Th({ children, width }: { children: React.ReactNode; width?: string }) {
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
        width,
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  muted,
  style,
}: {
  children: React.ReactNode
  muted?: boolean
  style?: React.CSSProperties
}) {
  return (
    <td
      style={{
        padding: '10px 12px',
        color: muted ? 'var(--pf-grey-500)' : 'var(--pf-grey-900)',
        fontSize: '0.9375rem',
        verticalAlign: 'top',
        ...style,
      }}
    >
      {children}
    </td>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: 'var(--pf-grey-500)',
          marginBottom: '3px',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', fontWeight: 500 }}>
        {value}
      </div>
    </div>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: 'blue' | 'grey' }) {
  const styles = {
    blue: { backgroundColor: 'var(--pf-blue-100)', color: 'var(--pf-blue-800)' },
    grey: { backgroundColor: 'var(--pf-grey-100)', color: 'var(--pf-grey-700)' },
  }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.8125rem',
        fontWeight: 500,
        lineHeight: 1.5,
        ...styles[color],
      }}
    >
      {children}
    </span>
  )
}

function RequirementPill({
  text,
  met,
  optional,
}: {
  text: string
  met: boolean
  optional?: boolean
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.8125rem',
        fontWeight: 500,
        backgroundColor: met ? 'var(--pf-green-50, #ecfdf5)' : 'var(--pf-red-50, #fef2f2)',
        border: `1px solid ${met ? 'var(--pf-green-200, #a7f3d0)' : 'var(--pf-red-200, #fecaca)'}`,
        color: met ? 'var(--pf-green-800, #065f46)' : 'var(--pf-red-800, #991b1b)',
        opacity: optional ? 0.75 : 1,
      }}
    >
      <span aria-hidden="true">{met ? '✓' : '✗'}</span>
      {text}
    </span>
  )
}

function EmptyState({
  message,
  cta,
}: {
  message: string
  cta?: { label: string; href: string }
}) {
  return (
    <div
      style={{
        padding: '20px 16px',
        borderRadius: '8px',
        backgroundColor: 'var(--pf-grey-50)',
        border: '1px dashed var(--pf-grey-300)',
        textAlign: 'center',
      }}
    >
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', margin: cta ? '0 0 12px' : 0 }}>
        {message}
      </p>
      {cta && (
        <Link
          href={cta.href}
          className="no-print no-underline hover:no-underline"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: 'var(--pf-blue-700)',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  )
}

function WritingLines({ count }: { count: number }) {
  const lines = Math.max(count, 4)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '34px',
            borderBottom: '1px solid var(--pf-grey-300)',
            display: 'flex',
            alignItems: 'flex-end',
            paddingLeft: '6px',
            paddingBottom: '4px',
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-400)',
          }}
        >
          {i + 1}.
        </div>
      ))}
    </div>
  )
}

function GuidanceQuestion({
  number,
  question,
  detail,
}: {
  number: number
  question: string
  detail?: string
}) {
  return (
    <div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pf-grey-500)', marginBottom: '6px' }}>
        Question {number}
      </div>
      <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-800)', margin: '0 0 6px', lineHeight: 1.65, fontWeight: 500 }}>
        {question}
      </p>
      {detail && (
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-blue-700)', fontStyle: 'italic', margin: '0 0 10px' }}>
          {detail}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ height: '28px', borderBottom: '1px solid var(--pf-grey-300)' }} />
        ))}
      </div>
    </div>
  )
}
