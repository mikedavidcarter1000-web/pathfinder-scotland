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

// FSM pilot areas — students here may have expanded eligibility
const FSM_PILOT_AREAS = [
  'Aberdeen City', 'Comhairle nan Eilean Siar', 'Fife',
  'Glasgow City', 'Moray', 'North Ayrshire',
  'Shetland Islands', 'South Lanarkshire',
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
  const income = student?.household_income_band ?? null
  const isEstranged = !!student?.is_estranged
  const hasDisability = !!student?.has_disability
  const isRefugee = !!student?.is_refugee_or_asylum_seeker
  const isYoungParent = !!student?.is_young_parent
  const receivesFSM = !!student?.receives_free_school_meals
  const localAuth = student?.local_authority ?? null
  const isInFSMPilot = localAuth ? FSM_PILOT_AREAS.includes(localAuth) : false
  const isLowIncome = income === 'under_21000' || income === '21000_24000'

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
      const nameLower = b.name.toLowerCase()
      const descLower = (b.short_description ?? '').toLowerCase()
      const haystack = nameLower + ' ' + descLower

      // Existing boosts
      if (isCareExperienced && b.is_care_experienced_only) boost += 40
      if (isFirstGen && b.category === 'funding') boost += 15
      if (simd !== null && simd <= 2 && b.is_means_tested) boost += 15
      if (hasTechSubject && b.category === 'technology') boost += 20
      if (
        hasCreativeSubject &&
        (nameLower.includes('adobe') || nameLower.includes('canva') || nameLower.includes('figma'))
      )
        boost += 20

      // Income-based boost — means-tested benefits rank higher for low-income students
      if (isLowIncome && b.is_means_tested) boost += 20
      if (income === '24000_34000' && b.is_means_tested) boost += 10

      // Estranged student boost
      if (isEstranged && (haystack.includes('estranged') || haystack.includes('independent')))
        boost += 35

      // Disability boost — DSA, Snowdon Trust, disability-specific
      if (hasDisability && (haystack.includes('disab') || haystack.includes('dsa') || haystack.includes('snowdon')))
        boost += 30

      // Refugee/asylum seeker boost
      if (isRefugee && (haystack.includes('refugee') || haystack.includes('asylum') || haystack.includes('carnegie')))
        boost += 30

      // Young parent boost — lone parents grant, childcare
      if (isYoungParent && (haystack.includes('parent') || haystack.includes('childcare') || haystack.includes('lone')))
        boost += 25

      // FSM / low-income indicator
      if (receivesFSM && (haystack.includes('school meal') || haystack.includes('clothing grant')))
        boost += 15

      // FSM pilot area boost
      if (isInFSMPilot && haystack.includes('school meal'))
        boost += 10

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
