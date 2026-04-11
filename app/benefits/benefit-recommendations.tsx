'use client'

import { useMemo } from 'react'
import type { Tables } from '@/types/database'
import { BenefitCard } from './benefit-card'

type Benefit = Tables<'student_benefits'>
type Student = Tables<'students'>
type Stage = 's1_s4' | 's5_s6' | 'college' | 'university'

function stageFromSchoolStage(
  schoolStage: string | null | undefined
): Stage | null {
  if (!schoolStage) return null
  if (['s1', 's2', 's3', 's4'].includes(schoolStage)) return 's1_s4'
  if (['s5', 's6'].includes(schoolStage)) return 's5_s6'
  if (schoolStage === 'college') return 'college'
  if (schoolStage === 'mature') return 'university'
  return null
}

function stageEligible(stage: Stage, benefit: Benefit): boolean {
  if (stage === 's1_s4') return !!benefit.eligibility_s1_s4
  if (stage === 's5_s6') return !!benefit.eligibility_s5_s6
  if (stage === 'college') return !!benefit.eligibility_college
  if (stage === 'university') return !!benefit.eligibility_university
  return true
}

const TECHNOLOGY_SUBJECT_HINTS = [
  'computing',
  'computer',
  'software',
  'engineering',
  'graphic communication',
  'digital media',
  'data',
]
const CREATIVE_SUBJECT_HINTS = [
  'art',
  'design',
  'music',
  'drama',
  'media',
  'photography',
  'dance',
  'expressive',
]

export function personalisedBenefitList(
  benefits: Benefit[],
  student: Student | null,
  studentSubjectNames: string[]
): Benefit[] {
  const stage = stageFromSchoolStage(student?.school_stage)
  const simd = student?.simd_decile ?? null
  const isCareExperienced = !!student?.care_experienced
  const isFirstGen = !!student?.first_generation

  const subjectsLower = studentSubjectNames.map((n) => n.toLowerCase())
  const hasTechSubject = subjectsLower.some((n) =>
    TECHNOLOGY_SUBJECT_HINTS.some((hint) => n.includes(hint))
  )
  const hasCreativeSubject = subjectsLower.some((n) =>
    CREATIVE_SUBJECT_HINTS.some((hint) => n.includes(hint))
  )

  return benefits
    .filter((b) => {
      if (!b.is_active) return false
      if (stage && !stageEligible(stage, b)) return false
      if (b.is_care_experienced_only && !isCareExperienced) return false
      return true
    })
    .map((b) => {
      let boost = 0
      if (isCareExperienced && b.is_care_experienced_only) boost += 40
      if (isFirstGen && b.category === 'funding') boost += 15
      if (simd !== null && simd <= 2 && b.is_means_tested) boost += 15
      if (hasTechSubject && b.category === 'technology') boost += 20
      if (
        hasCreativeSubject &&
        (b.name.toLowerCase().includes('adobe') ||
          b.name.toLowerCase().includes('canva') ||
          b.name.toLowerCase().includes('figma'))
      )
        boost += 20
      return { b, score: (b.priority_score ?? 50) + boost }
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.b)
}

interface BenefitRecommendationsProps {
  benefits: Benefit[]
  student: Student | null
  studentSubjectNames: string[]
  limit?: number
}

export function BenefitRecommendations({
  benefits,
  student,
  studentSubjectNames,
  limit = 8,
}: BenefitRecommendationsProps) {
  const stage = stageFromSchoolStage(student?.school_stage)

  const sorted = useMemo(
    () => personalisedBenefitList(benefits, student, studentSubjectNames).slice(0, limit),
    [benefits, student, studentSubjectNames, limit]
  )

  if (sorted.length === 0) return null

  return (
    <div className="mb-6">
      <div className="mb-3">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
          {student ? 'Recommended for you' : 'Top benefits for Scottish students'}
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
          {student
            ? 'Based on your profile and interests.'
            : 'The highest-value benefits for every Scottish student.'}
        </p>
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {sorted.map((b) => (
          <div
            key={b.id}
            style={{ flex: '0 0 300px', scrollSnapAlign: 'start' }}
          >
            <BenefitCard
              benefit={b}
              stage={stage}
              variant="commercial"
              sourcePage="/benefits#recommended"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
