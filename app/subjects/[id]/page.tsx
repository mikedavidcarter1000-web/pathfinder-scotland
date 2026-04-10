'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { useSubjectDetail, type ProgressionLink, type CareerLink } from '@/hooks/use-subjects'
import {
  CURRICULAR_AREA_COLOURS,
  DEFAULT_CURRICULAR_AREA_COLOUR,
  QUALIFICATION_LEVEL_LABELS,
  RELEVANCE_STYLES,
} from '@/lib/constants'

const LEVEL_ORDER: Record<string, number> = {
  bge: 0,
  n3: 1,
  n4: 2,
  n5: 3,
  higher: 4,
  adv_higher: 5,
}

type PathwayStep = {
  level: string
  label: string
  minGrade: string | null
  recommendedGrade: string | null
  notes: string | null
  isFromBge: boolean
  sameSubject: boolean
  linkedSubjectId?: string | null
  linkedSubjectName?: string | null
}

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: subject, isLoading, error } = useSubjectDetail(id)

  // Build a vertical pathway chain from the progressions.
  // Upstream entries (this subject is the to_subject) show the starting levels.
  // Downstream entries (this subject is the from_subject) show where it leads.
  const pathwaySteps = useMemo<PathwayStep[]>(() => {
    if (!subject) return []

    const steps: PathwayStep[] = []

    // Same-subject upstream: routes INTO this subject (bge/n4/n5 → current level)
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
      })
    }

    // Same-subject downstream: routes OUT of this subject
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
      })
    }

    // Deduplicate by level, preferring the earliest match
    const byLevel = new Map<string, PathwayStep>()
    for (const step of steps) {
      if (!byLevel.has(step.level)) byLevel.set(step.level, step)
    }

    return Array.from(byLevel.values()).sort(
      (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
    )
  }, [subject])

  // Cross-subject links (feeds into / crash into other subjects)
  const crossSubjectDownstream = useMemo(
    () =>
      subject?.progressions_downstream.filter(
        (p) => p.from_subject_id !== p.to_subject_id
      ) ?? [],
    [subject]
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Subject not found</h1>
          <p className="text-gray-600 mb-4">The subject you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/subjects" className="text-blue-600 hover:text-blue-700 font-medium">
            Browse all subjects
          </Link>
        </div>
      </div>
    )
  }

  const area = subject.curricular_area
  const areaColour =
    (area && CURRICULAR_AREA_COLOURS[area.name]) || DEFAULT_CURRICULAR_AREA_COLOUR

  const levels: string[] = []
  if (subject.is_available_n3) levels.push('N3')
  if (subject.is_available_n4) levels.push('N4')
  if (subject.is_available_n5) levels.push('N5')
  if (subject.is_available_higher) levels.push('Higher')
  if (subject.is_available_adv_higher) levels.push('Advanced Higher')
  if (subject.is_npa) levels.push('NPA')
  if (subject.is_academy) levels.push('Academy')

  // Group career links by relevance
  const essentialCareers = subject.career_links.filter((l: CareerLink) => l.relevance === 'essential')
  const recommendedCareers = subject.career_links.filter((l: CareerLink) => l.relevance === 'recommended')
  const relatedCareers = subject.career_links.filter((l: CareerLink) => l.relevance === 'related')

  const isCrashHigher =
    subject.is_available_higher &&
    !subject.is_available_n5 &&
    !subject.is_available_n4

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className={`h-1.5 bg-gradient-to-r ${areaColour.bar}`} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/subjects" className="hover:text-gray-700">Subjects</Link>
            <span>/</span>
            <span className="text-gray-900">{subject.name}</span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{subject.name}</h1>
              {area && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${areaColour.bg} ${areaColour.text}`}
                >
                  {area.name}
                </span>
              )}
            </div>
            <Link href="/subjects" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {/* Level pills */}
          {levels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {levels.map((lvl) => (
                <span
                  key={lvl}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                >
                  {lvl}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Section 1: Overview */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            {subject.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">About this subject</h3>
                <p className="text-gray-700 leading-relaxed">{subject.description}</p>
              </div>
            )}

            {subject.why_choose && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Why choose {subject.name}?</h3>
                <p className="text-gray-700 leading-relaxed">{subject.why_choose}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {subject.assessment_type && (
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assessment</dt>
                  <dd className="text-sm text-gray-900 mt-1">{subject.assessment_type}</dd>
                </div>
              )}
              {subject.typical_availability && (
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Typically delivered via</dt>
                  <dd className="text-sm text-gray-900 mt-1 capitalize">
                    {subject.typical_availability.replace(/_/g, ' ')}
                  </dd>
                </div>
              )}
              {subject.sqa_course_code && (
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SQA Course Code</dt>
                  <dd className="text-sm text-gray-900 mt-1 font-mono">{subject.sqa_course_code}</dd>
                </div>
              )}
            </div>

            {subject.skills_tags && subject.skills_tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Skills developed</h3>
                <div className="flex flex-wrap gap-2">
                  {subject.skills_tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Progression Pathway */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progression Pathway</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {isCrashHigher && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Crash Higher:</span> This subject is commonly taken straight at Higher level in S5 or S6 without a formal National 5 predecessor.
                </p>
              </div>
            )}

            {subject.is_academy && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <span className="font-semibold">Academy / elective:</span> This is an enrichment option offered in the Broad General Education phase. It does not lead directly to an SQA qualification but builds skills that feed into senior phase choices.
                </p>
              </div>
            )}

            {pathwaySteps.length === 0 && !subject.is_academy && (
              <p className="text-sm text-gray-500">
                No structured progression data available for this subject yet.
              </p>
            )}

            {pathwaySteps.length > 0 && (
              <ol className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                {pathwaySteps.map((step, idx) => {
                  const isFirst = idx === 0
                  return (
                    <li key={step.level} className="ml-6">
                      <span
                        className={`absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white ${
                          isFirst ? 'bg-blue-600' : 'bg-blue-400'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-white" />
                      </span>
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900">{step.label}</h3>
                        {step.isFromBge && (
                          <span className="text-xs font-medium text-gray-500">(from BGE)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {(step.minGrade || step.recommendedGrade) && (
                          <p>
                            {step.minGrade && (
                              <>
                                Min grade to progress: <span className="font-semibold text-gray-900">{step.minGrade}</span>
                              </>
                            )}
                            {step.minGrade && step.recommendedGrade && ' · '}
                            {step.recommendedGrade && (
                              <>
                                Recommended: <span className="font-semibold text-gray-900">{step.recommendedGrade}</span>
                              </>
                            )}
                          </p>
                        )}
                        {step.notes && <p className="text-xs text-gray-500">{step.notes}</p>}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}

            {/* Cross-subject downstream links */}
            {crossSubjectDownstream.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Feeds into
                </h3>
                <ul className="space-y-2">
                  {crossSubjectDownstream.map((p: ProgressionLink) => (
                    <li key={p.id} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>
                        {p.to_subject && (
                          <Link
                            href={`/subjects/${p.to_subject.id}`}
                            className="font-medium text-blue-600 hover:text-blue-700"
                          >
                            {p.to_subject.name}
                          </Link>
                        )}
                        <span className="text-gray-500">
                          {' '}
                          at {QUALIFICATION_LEVEL_LABELS[p.to_level] ?? p.to_level}
                        </span>
                        {p.notes && <span className="text-gray-500"> — {p.notes}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Career Connections */}
        {subject.career_links.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Career Connections</h2>
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

        {/* Section 4: University Courses */}
        {subject.related_courses.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              University Courses Requiring {subject.name}
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {subject.related_courses.map((course) => {
                const req = course.entry_requirements as {
                  required_subjects?: string[]
                  highers?: string
                } | null
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {course.name}
                        </h3>
                        {course.university && (
                          <p className="text-sm text-gray-500 mt-0.5">{course.university.name}</p>
                        )}
                        {req?.highers && (
                          <p className="text-sm text-gray-600 mt-1">
                            Highers: <span className="font-medium text-gray-900">{req.highers}</span>
                          </p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
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
    <div className={`rounded-xl border ${style.border} ${style.bg} p-5`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${style.text}`}>
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => {
          if (!link.career_sector) return null
          return (
            <Link
              key={link.career_sector.id}
              href={`/subjects?career_sector=${link.career_sector.id}`}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {link.career_sector.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
