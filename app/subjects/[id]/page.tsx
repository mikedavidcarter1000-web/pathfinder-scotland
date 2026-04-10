'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { useSubjectDetail, type ProgressionLink, type CareerLink } from '@/hooks/use-subjects'
import { useStudentGrades } from '@/hooks/use-student'
import {
  getCurricularAreaColour,
  QUALIFICATION_LEVEL_LABELS,
  RELEVANCE_STYLES,
} from '@/lib/constants'
import type { Tables } from '@/types/database'

type StudentGrade = Tables<'student_grades'>

const LEVEL_ORDER: Record<string, number> = {
  bge: 0,
  n3: 1,
  n4: 2,
  n5: 3,
  higher: 4,
  adv_higher: 5,
}

const QUAL_TYPE_TO_LEVEL: Record<string, string> = {
  national_5: 'n5',
  higher: 'higher',
  advanced_higher: 'adv_higher',
}

type PathwayStep = {
  level: string
  label: string
  minGrade: string | null
  recommendedGrade: string | null
  notes: string | null
  isFromBge: boolean
  sameSubject: boolean
  achieved: boolean
  achievedGrade: string | null
  linkedSubjectId?: string | null
  linkedSubjectName?: string | null
}

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: subject, isLoading, error } = useSubjectDetail(id)
  const { data: studentGrades } = useStudentGrades() as { data: StudentGrade[] | undefined }

  const achievedLevels = useMemo(() => {
    if (!subject || !studentGrades) return {} as Record<string, string>
    const map: Record<string, string> = {}
    for (const g of studentGrades) {
      const matchesById = g.subject_id === subject.id
      const matchesByName = g.subject.toLowerCase() === subject.name.toLowerCase()
      if (!matchesById && !matchesByName) continue
      const level = QUAL_TYPE_TO_LEVEL[g.qualification_type]
      if (level) map[level] = g.grade
    }
    return map
  }, [subject, studentGrades])

  const pathwaySteps = useMemo<PathwayStep[]>(() => {
    if (!subject) return []

    const steps: PathwayStep[] = []

    const sameSubjectUpstream = subject.progressions_upstream.filter(
      (p) => p.from_subject_id === p.to_subject_id
    )
    for (const p of sameSubjectUpstream) {
      steps.push({
        level: p.to_level,
        label: QUALIFICATION_LEVEL_LABELS[p.to_level] ?? p.to_level,
        minGrade: p.min_grade,
        recommendedGrade: p.recommended_grade,
        notes: p.notes,
        isFromBge: p.from_level === 'bge',
        sameSubject: true,
        achieved: !!achievedLevels[p.to_level],
        achievedGrade: achievedLevels[p.to_level] ?? null,
      })
    }

    const sameSubjectDownstream = subject.progressions_downstream.filter(
      (p) => p.from_subject_id === p.to_subject_id
    )
    for (const p of sameSubjectDownstream) {
      steps.push({
        level: p.to_level,
        label: QUALIFICATION_LEVEL_LABELS[p.to_level] ?? p.to_level,
        minGrade: p.min_grade,
        recommendedGrade: p.recommended_grade,
        notes: p.notes,
        isFromBge: p.from_level === 'bge',
        sameSubject: true,
        achieved: !!achievedLevels[p.to_level],
        achievedGrade: achievedLevels[p.to_level] ?? null,
      })
    }

    const byLevel = new Map<string, PathwayStep>()
    for (const step of steps) {
      if (!byLevel.has(step.level)) byLevel.set(step.level, step)
    }

    return Array.from(byLevel.values()).sort(
      (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
    )
  }, [subject, achievedLevels])

  const crossSubjectDownstream = useMemo(
    () =>
      subject?.progressions_downstream.filter(
        (p) => p.from_subject_id !== p.to_subject_id
      ) ?? [],
    [subject]
  )

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-teal-50)' }}>
        <div className="pf-container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded w-1/3" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
            <div className="h-4 rounded w-1/4" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-64 rounded" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
              <div className="h-64 rounded" style={{ backgroundColor: 'var(--pf-grey-100)' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !subject) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--pf-teal-50)' }}
      >
        <div className="text-center">
          <h1 style={{ marginBottom: '8px' }}>Subject not found</h1>
          <p style={{ color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
            The subject you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/subjects" className="pf-btn-primary">
            Browse all subjects
          </Link>
        </div>
      </div>
    )
  }

  const area = subject.curricular_area
  const areaColour = getCurricularAreaColour(area?.name)

  const levels: string[] = []
  if (subject.is_available_n3) levels.push('N3')
  if (subject.is_available_n4) levels.push('N4')
  if (subject.is_available_n5) levels.push('N5')
  if (subject.is_available_higher) levels.push('Higher')
  if (subject.is_available_adv_higher) levels.push('Advanced Higher')
  if (subject.is_npa) levels.push('NPA')
  if (subject.is_academy) levels.push('Academy')

  const essentialCareers = subject.career_links.filter((l: CareerLink) => l.relevance === 'essential')
  const recommendedCareers = subject.career_links.filter((l: CareerLink) => l.relevance === 'recommended')
  const relatedCareers = subject.career_links.filter((l: CareerLink) => l.relevance === 'related')

  const isCrashHigher =
    subject.is_available_higher &&
    !subject.is_available_n5 &&
    !subject.is_available_n4

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-teal-50)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className={`h-1 bg-gradient-to-r ${areaColour.bar}`} />
        <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
          <nav className="flex items-center gap-2 mb-4" style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
            <Link href="/subjects" style={{ color: 'var(--pf-teal-500)' }}>
              Subjects
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>{subject.name}</span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 style={{ marginBottom: '12px' }}>{subject.name}</h1>
              {area && (
                <span className={`pf-area-badge ${areaColour.bg} ${areaColour.text}`}>
                  {area.name}
                </span>
              )}
            </div>
            <Link
              href="/subjects"
              style={{ color: 'var(--pf-grey-600)' }}
              className="p-2 hover:opacity-80"
              aria-label="Back to subjects"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {levels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {levels.map((lvl) => (
                <span key={lvl} className="pf-badge-grey">
                  {lvl}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content -- two-column on desktop */}
      <div className="pf-container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left column: Overview + Progression */}
          <div className="space-y-6">
            {/* Overview */}
            <section>
              <h2 style={{ marginBottom: '16px' }}>Overview</h2>
              <div className="pf-card space-y-4">
                {subject.description && (
                  <div>
                    <h3 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
                      About this subject
                    </h3>
                    <p style={{ color: 'var(--pf-grey-900)', lineHeight: 1.6 }}>{subject.description}</p>
                  </div>
                )}

                {subject.why_choose && (
                  <div>
                    <h3 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
                      Why choose {subject.name}?
                    </h3>
                    <p style={{ color: 'var(--pf-grey-900)', lineHeight: 1.6 }}>{subject.why_choose}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  {subject.assessment_type && (
                    <div>
                      <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pf-grey-600)', fontWeight: 600 }}>
                        Assessment
                      </dt>
                      <dd style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', marginTop: '4px' }}>
                        {subject.assessment_type}
                      </dd>
                    </div>
                  )}
                  {subject.typical_availability && (
                    <div>
                      <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pf-grey-600)', fontWeight: 600 }}>
                        Typically delivered via
                      </dt>
                      <dd className="capitalize" style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', marginTop: '4px' }}>
                        {subject.typical_availability.replace(/_/g, ' ')}
                      </dd>
                    </div>
                  )}
                  {subject.sqa_course_code && (
                    <div>
                      <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pf-grey-600)', fontWeight: 600 }}>
                        SQA Course Code
                      </dt>
                      <dd className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', marginTop: '4px' }}>
                        {subject.sqa_course_code}
                      </dd>
                    </div>
                  )}
                </div>

                {subject.skills_tags && subject.skills_tags.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
                      Skills developed
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {subject.skills_tags.map((tag) => (
                        <span key={tag} className="pf-badge-teal">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Progression Pathway */}
            <section>
              <h2 style={{ marginBottom: '16px' }}>Progression Pathway</h2>
              <div className="pf-card">
                {isCrashHigher && (
                  <div
                    className="mb-4 p-3 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(245,158,11,0.1)',
                      borderLeft: '3px solid var(--pf-amber-500)',
                    }}
                  >
                    <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
                      <span style={{ fontWeight: 600 }}>Crash Higher:</span> This subject is commonly taken straight at Higher level in S5 or S6 without a formal National 5 predecessor.
                    </p>
                  </div>
                )}

                {subject.is_academy && (
                  <div
                    className="mb-4 p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--pf-teal-100)',
                      borderLeft: '3px solid var(--pf-teal-700)',
                    }}
                  >
                    <p style={{ fontSize: '0.875rem', color: 'var(--pf-teal-900)' }}>
                      <span style={{ fontWeight: 600 }}>Academy / elective:</span> An enrichment option in the Broad General Education phase. Does not lead directly to an SQA qualification but builds skills for senior phase choices.
                    </p>
                  </div>
                )}

                {pathwaySteps.length === 0 && !subject.is_academy && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                    No structured progression data available for this subject yet.
                  </p>
                )}

                {pathwaySteps.length > 0 && <ProgressionStepper steps={pathwaySteps} />}

                {crossSubjectDownstream.length > 0 && (
                  <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--pf-grey-100)' }}>
                    <h3 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
                      Feeds into
                    </h3>
                    <ul className="space-y-2">
                      {crossSubjectDownstream.map((p: ProgressionLink) => (
                        <li key={p.id} className="flex items-start gap-2" style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)' }}>
                          <svg
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            style={{ color: 'var(--pf-teal-500)' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span>
                            {p.to_subject && (
                              <Link
                                href={`/subjects/${p.to_subject.id}`}
                                style={{ fontWeight: 600, color: 'var(--pf-teal-700)' }}
                              >
                                {p.to_subject.name}
                              </Link>
                            )}
                            <span style={{ color: 'var(--pf-grey-600)' }}>
                              {' '}at {QUALIFICATION_LEVEL_LABELS[p.to_level] ?? p.to_level}
                            </span>
                            {p.notes && (
                              <span style={{ color: 'var(--pf-grey-600)' }}> — {p.notes}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right column: Career + Courses */}
          <div className="space-y-6">
            {subject.career_links.length > 0 && (
              <section>
                <h2 style={{ marginBottom: '16px' }}>Career Connections</h2>
                <div className="space-y-4">
                  {essentialCareers.length > 0 && (
                    <CareerGroup title="Essential for" relevance="essential" links={essentialCareers} />
                  )}
                  {recommendedCareers.length > 0 && (
                    <CareerGroup title="Recommended for" relevance="recommended" links={recommendedCareers} />
                  )}
                  {relatedCareers.length > 0 && (
                    <CareerGroup title="Related to" relevance="related" links={relatedCareers} />
                  )}
                </div>
              </section>
            )}

            {subject.related_courses.length > 0 && (
              <section>
                <h2 style={{ marginBottom: '16px' }}>
                  University Courses Requiring {subject.name}
                </h2>
                <div className="pf-card-flat" style={{ overflow: 'hidden' }}>
                  {subject.related_courses.map((course, i) => {
                    const req = course.entry_requirements as {
                      required_subjects?: string[]
                      highers?: string
                    } | null
                    return (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="block p-4 group no-underline hover:no-underline"
                        style={{
                          borderTop: i === 0 ? 'none' : '1px solid var(--pf-grey-100)',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--pf-teal-50)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 style={{ fontSize: '1rem', color: 'var(--pf-grey-900)', marginBottom: '4px' }}>
                              {course.name}
                            </h3>
                            {course.university && (
                              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                                {course.university.name}
                              </p>
                            )}
                            {req?.highers && (
                              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
                                Highers:{' '}
                                <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>
                                  {req.highers}
                                </span>
                              </p>
                            )}
                          </div>
                          <svg
                            className="w-5 h-5 flex-shrink-0 mt-1"
                            style={{ color: 'var(--pf-teal-500)' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {subject.career_links.length === 0 && subject.related_courses.length === 0 && (
              <div className="pf-card text-center">
                <svg
                  className="w-10 h-10 mx-auto mb-3"
                  style={{ color: 'var(--pf-grey-300)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                  Career and university course links coming soon for this subject.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressionStepper({ steps }: { steps: PathwayStep[] }) {
  return (
    <ol className="relative space-y-5">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1
        const dotBg = step.achieved ? 'var(--pf-green-500)' : 'var(--pf-teal-500)'

        return (
          <li key={step.level} className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full"
                style={{
                  backgroundColor: dotBg,
                  boxShadow: '0 0 0 4px var(--pf-white)',
                }}
              >
                {step.achieved ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: '#fff' }}
                  />
                )}
              </span>
              {!isLast && (
                <span
                  className="w-0.5 flex-1 my-1"
                  style={{
                    backgroundColor: step.achieved ? 'var(--pf-green-500)' : 'var(--pf-teal-500)',
                    opacity: step.achieved ? 1 : 0.35,
                  }}
                />
              )}
            </div>

            <div className="pb-2 flex-1">
              <div className="flex items-baseline flex-wrap gap-2 mb-1">
                <h3 style={{ fontSize: '1rem', margin: 0 }}>{step.label}</h3>
                {step.achieved && step.achievedGrade && (
                  <span className="pf-badge-green">
                    Achieved: {step.achievedGrade}
                  </span>
                )}
                {step.isFromBge && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', fontWeight: 500 }}>
                    (from BGE)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }} className="space-y-1">
                {(step.minGrade || step.recommendedGrade) && (
                  <p>
                    {step.minGrade && (
                      <>
                        Min grade to progress:{' '}
                        <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>
                          {step.minGrade}
                        </span>
                      </>
                    )}
                    {step.minGrade && step.recommendedGrade && ' · '}
                    {step.recommendedGrade && (
                      <>
                        Recommended:{' '}
                        <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>
                          {step.recommendedGrade}
                        </span>
                      </>
                    )}
                  </p>
                )}
                {step.notes && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>{step.notes}</p>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function CareerGroup({
  title,
  relevance,
  links,
}: {
  title: string
  relevance: string
  links: CareerLink[]
}) {
  const style = RELEVANCE_STYLES[relevance] ?? RELEVANCE_STYLES.related
  return (
    <div className={`rounded-lg ${style.bg} ${style.border} border`} style={{ padding: '20px' }}>
      <h3 className={style.text} style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => {
          if (!link.career_sector) return null
          return (
            <Link
              key={link.career_sector.id}
              href={`/subjects?career_sector=${link.career_sector.id}`}
              className="inline-flex items-center transition-colors no-underline hover:no-underline"
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 500,
                backgroundColor: 'var(--pf-white)',
                border: '1px solid var(--pf-grey-300)',
                color: 'var(--pf-grey-900)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--pf-teal-500)'
                e.currentTarget.style.color = 'var(--pf-teal-700)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--pf-grey-300)'
                e.currentTarget.style.color = 'var(--pf-grey-900)'
              }}
            >
              {link.career_sector.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
