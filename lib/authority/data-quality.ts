export type StudentWithDemographics = {
  id: string
  gender: string | null
  care_experienced: boolean | null
  has_asn: boolean | null
  receives_free_school_meals: boolean | null
  eal: boolean | null
  is_young_carer: boolean | null
  ethnicity: string | null
  student_type: string | null
  demographic_source: string | null
}

type FieldStat = { count: number; pct: number }

export type SchoolDataQuality = {
  total_students: number
  fields: {
    gender: FieldStat
    care_experienced: FieldStat
    has_asn: FieldStat
    receives_free_school_meals: FieldStat
    eal: FieldStat
    is_young_carer: FieldStat
    ethnicity: FieldStat
    student_type: FieldStat
  }
  overall_score: 1 | 2 | 3 | 4 | 5
  demographic_sources: {
    seemis_import: number
    guidance_teacher: number
    self_declared: number
    mixed: number
    none: number
  }
}

const SCORED_FIELDS: Array<keyof Omit<StudentWithDemographics, 'id' | 'demographic_source'>> = [
  'gender',
  'care_experienced',
  'has_asn',
  'receives_free_school_meals',
  'eal',
  'is_young_carer',
  'ethnicity',
  'student_type',
]

function isPopulated(value: string | boolean | null | undefined): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true // boolean true or false are both meaningful populated values
}

function toScore(avgPct: number): 1 | 2 | 3 | 4 | 5 {
  if (avgPct >= 80) return 5
  if (avgPct >= 60) return 4
  if (avgPct >= 40) return 3
  if (avgPct >= 20) return 2
  return 1
}

export function calculateSchoolDataQuality(students: StudentWithDemographics[]): SchoolDataQuality {
  const total = students.length

  const sources = { seemis_import: 0, guidance_teacher: 0, self_declared: 0, mixed: 0, none: 0 }
  for (const s of students) {
    const src = s.demographic_source
    if (src === 'seemis_import') sources.seemis_import++
    else if (src === 'guidance_teacher') sources.guidance_teacher++
    else if (src === 'self_declared') sources.self_declared++
    else if (src === 'mixed') sources.mixed++
    else sources.none++
  }

  const fieldCounts: Record<string, number> = {}
  for (const field of SCORED_FIELDS) fieldCounts[field] = 0

  for (const s of students) {
    for (const field of SCORED_FIELDS) {
      if (isPopulated(s[field])) fieldCounts[field]++
    }
  }

  const pct = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100))

  const fields = {
    gender: { count: fieldCounts.gender, pct: pct(fieldCounts.gender) },
    care_experienced: { count: fieldCounts.care_experienced, pct: pct(fieldCounts.care_experienced) },
    has_asn: { count: fieldCounts.has_asn, pct: pct(fieldCounts.has_asn) },
    receives_free_school_meals: { count: fieldCounts.receives_free_school_meals, pct: pct(fieldCounts.receives_free_school_meals) },
    eal: { count: fieldCounts.eal, pct: pct(fieldCounts.eal) },
    is_young_carer: { count: fieldCounts.is_young_carer, pct: pct(fieldCounts.is_young_carer) },
    ethnicity: { count: fieldCounts.ethnicity, pct: pct(fieldCounts.ethnicity) },
    student_type: { count: fieldCounts.student_type, pct: pct(fieldCounts.student_type) },
  }

  const avgPct =
    total === 0
      ? 0
      : SCORED_FIELDS.reduce((sum, f) => sum + fields[f as keyof typeof fields].pct, 0) / SCORED_FIELDS.length

  return {
    total_students: total,
    fields,
    overall_score: toScore(avgPct),
    demographic_sources: sources,
  }
}
