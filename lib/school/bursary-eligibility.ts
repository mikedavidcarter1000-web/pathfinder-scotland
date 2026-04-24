// Simple bursary-eligibility match for guidance-side alerts.
// Mirrors the student-facing match but limits to flags a guidance teacher
// can legitimately reason about from the student record alone.

type BursaryRow = {
  id: string
  name: string
  administering_body: string | null
  amount_description: string | null
  url: string | null
  is_active: boolean | null
  student_stages: string[] | null
  requires_care_experience: boolean | null
  requires_estranged: boolean | null
  requires_carer: boolean | null
  requires_young_carer: boolean | null
  requires_disability: boolean | null
  requires_refugee_or_asylum: boolean | null
  requires_young_parent: boolean | null
  requires_lone_parent: boolean | null
  simd_quintile_max: number | null
  requires_scottish_residency: boolean | null
}

type StudentFlags = {
  school_stage: string | null
  simd_decile: number | null
  care_experienced: boolean | null
  is_estranged: boolean
  is_young_carer: boolean
  is_carer: boolean | null
  has_disability: boolean
  is_refugee_or_asylum_seeker: boolean
  is_young_parent: boolean
  is_single_parent_household: boolean | null
  receives_free_school_meals: boolean | null
}

export function matchesBursary(b: BursaryRow, s: StudentFlags): boolean {
  if (b.is_active === false) return false

  // Stage match (if configured)
  if (b.student_stages && b.student_stages.length > 0) {
    if (!s.school_stage || !b.student_stages.includes(s.school_stage)) {
      // Some bursaries use 'university' rather than a year code; we treat
      // post-school (uni) as non-matching for s1-s6 students.
      return false
    }
  }

  // Required-trait gates -- each trait is either required-and-matched or required-and-unmatched (reject).
  if (b.requires_care_experience && !s.care_experienced) return false
  if (b.requires_estranged && !s.is_estranged) return false
  if (b.requires_young_carer && !s.is_young_carer) return false
  if (b.requires_carer && !(s.is_young_carer || s.is_carer)) return false
  if (b.requires_disability && !s.has_disability) return false
  if (b.requires_refugee_or_asylum && !s.is_refugee_or_asylum_seeker) return false
  if (b.requires_young_parent && !s.is_young_parent) return false
  if (b.requires_lone_parent && !s.is_single_parent_household) return false

  // SIMD gate (quintile_max of 2 means SIMD quintile 1 or 2).
  // SIMD decile 1-2 = quintile 1; 3-4 = quintile 2, etc.
  if (b.simd_quintile_max !== null && b.simd_quintile_max !== undefined) {
    if (s.simd_decile === null) return false
    const studentQuintile = Math.ceil(s.simd_decile / 2)
    if (studentQuintile > b.simd_quintile_max) return false
  }

  return true
}

export type BursaryMatch = {
  id: string
  name: string
  administeringBody: string | null
  amountDescription: string | null
  url: string | null
}

export function bursaryToMatch(b: BursaryRow): BursaryMatch {
  return {
    id: b.id,
    name: b.name,
    administeringBody: b.administering_body,
    amountDescription: b.amount_description,
    url: b.url,
  }
}
