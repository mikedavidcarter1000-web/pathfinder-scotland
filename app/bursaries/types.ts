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
