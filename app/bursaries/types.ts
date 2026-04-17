export type AwardType =
  | 'grant'
  | 'bursary'
  | 'fee_waiver'
  | 'accommodation'
  | 'loan'
  | 'discount'
  | 'entitlement'

export type MatchConfidence = 'definite' | 'likely' | 'check_eligibility'

export type MatchStatus = 'eligible' | 'applied' | 'received' | 'dismissed'

export interface Bursary {
  id: string
  name: string
  administering_body: string
  description: string | null
  student_stages: string[]
  award_type: AwardType
  amount_description: string | null
  amount_min: number | null
  amount_max: number | null
  is_means_tested: boolean | null
  is_repayable: boolean | null
  application_process: string | null
  application_deadline: string | null
  url: string | null
  notes: string | null
  is_active: boolean
  // Eligibility criteria (used by filter panel)
  requires_care_experience: boolean | null
  requires_estranged: boolean | null
  requires_carer: boolean | null
  requires_disability: boolean | null
  requires_refugee_or_asylum: boolean | null
  requires_young_parent: boolean | null
  income_threshold_max: number | null
  simd_quintile_max: number | null
  min_age: number | null
  max_age: number | null
}

export interface StudentProfile {
  school_stage: string | null
  care_experienced: boolean | null
  has_disability: boolean
  is_young_carer: boolean
  is_young_parent: boolean | null
  simd_decile: number | null
}

export interface BursaryFilterState {
  stage: string
  age: string
  careExperienced: boolean
  disability: boolean
  youngCarer: boolean
  youngParent: boolean
  meansTested: string // 'all' | 'yes' | 'no'
}

const STAGE_MAP: Record<string, string> = {
  s2: 'S2', s3: 'S3', s4: 'S4', s5: 'S5', s6: 'S6',
  college: 'FE', mature: 'undergraduate',
}

export function profileToFilters(profile: StudentProfile | null): BursaryFilterState {
  if (!profile) return emptyFilters()
  return {
    stage: profile.school_stage ? (STAGE_MAP[profile.school_stage] ?? '') : '',
    age: '',
    careExperienced: !!profile.care_experienced,
    disability: !!profile.has_disability,
    youngCarer: !!profile.is_young_carer,
    youngParent: !!profile.is_young_parent,
    meansTested: 'all',
  }
}

export function emptyFilters(): BursaryFilterState {
  return {
    stage: '',
    age: '',
    careExperienced: false,
    disability: false,
    youngCarer: false,
    youngParent: false,
    meansTested: 'all',
  }
}

export function applyBursaryFilters(bursaries: Bursary[], filters: BursaryFilterState): Bursary[] {
  return bursaries.filter(b => {
    // Stage filter
    if (filters.stage && !b.student_stages.includes(filters.stage)) return false

    // Age filter
    if (filters.age) {
      const age = parseInt(filters.age, 10)
      if (!isNaN(age)) {
        if (b.min_age != null && age < b.min_age) return false
        if (b.max_age != null && age > b.max_age) return false
      }
    }

    // Demographic filters: only apply when at least one is checked.
    // When active, hide bursaries requiring unchecked demographics.
    const anyDemographic = filters.careExperienced || filters.disability ||
                           filters.youngCarer || filters.youngParent
    if (anyDemographic) {
      const hasFilterableReq = b.requires_care_experience || b.requires_disability ||
                               b.requires_carer || b.requires_young_parent
      if (hasFilterableReq) {
        const matches = (b.requires_care_experience && filters.careExperienced) ||
                        (b.requires_disability && filters.disability) ||
                        (b.requires_carer && filters.youngCarer) ||
                        (b.requires_young_parent && filters.youngParent)
        if (!matches) return false
      }
    }

    // Means-tested filter
    if (filters.meansTested === 'yes' && !b.is_means_tested) return false
    if (filters.meansTested === 'no' && b.is_means_tested) return false

    return true
  })
}

export interface BursaryMatch {
  bursary_id: string
  name: string
  administering_body: string
  description: string | null
  award_type: AwardType
  amount_description: string | null
  amount_max: number | null
  url: string | null
  application_deadline: string | null
  match_confidence: MatchConfidence
}

export interface StudentMatchRow {
  bursary_id: string
  match_status: MatchStatus
}

// Grouping for the browse (logged-out) view.
export type BrowseCategory =
  | 'secondary'
  | 'undergraduate'
  | 'college'
  | 'professional'
  | 'charitable'
  | 'universal'

export const BROWSE_CATEGORY_LABELS: Record<BrowseCategory, string> = {
  secondary: 'Secondary school (S1–S6)',
  undergraduate: 'Undergraduate',
  college: 'College / Further Education',
  professional: 'Professional & vocational',
  charitable: 'Charitable trusts',
  universal: 'Universal entitlements',
}

const SECONDARY_STAGES = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']

export function categoriseBursary(b: Bursary): BrowseCategory {
  if (b.award_type === 'entitlement') return 'universal'
  const body = b.administering_body.toLowerCase()
  if (body.includes('trust') || body.includes('foundation') || body.includes('carnegie')) {
    return 'charitable'
  }
  const stages = b.student_stages
  if (stages.some((s) => ['nursing', 'midwifery', 'paramedic'].includes(s))) {
    return 'professional'
  }
  const isSecondary = stages.some((s) => SECONDARY_STAGES.includes(s))
  const isUndergrad = stages.includes('undergraduate')
  const isFE = stages.includes('FE')
  if (isSecondary && !isUndergrad) return 'secondary'
  if (isFE && !isUndergrad) return 'college'
  if (isUndergrad) return 'undergraduate'
  return 'undergraduate'
}
