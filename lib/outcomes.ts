// Shared types + helpers for graduate outcomes and university rankings.
// The underlying columns were added by
// supabase/migrations/20260422204126_add_graduate_outcomes_and_rankings.sql
// but `types/database.ts` is not re-generated per the project convention
// (see MEMORY.md). This module is the single place callers cast through.

export interface CourseOutcomes {
  employment_rate_15m: number | null
  highly_skilled_employment_pct: number | null
  salary_median_1yr: number | null
  salary_median_3yr: number | null
  salary_median_5yr: number | null
  student_satisfaction_pct: number | null
  continuation_rate_pct: number | null
  subject_ranking_cug: number | null
  outcomes_data_year: string | null
  outcomes_needs_verification: boolean | null
}

export interface UniversityRankings {
  ranking_cug: number | null
  ranking_cug_scotland: number | null
  ranking_guardian: number | null
  ranking_times: number | null
  graduate_employment_rate: number | null
  rankings_year: string | null
  rankings_needs_verification: boolean | null
}

// Read outcomes off a courses row without widening the generated Row type.
export function pickCourseOutcomes(row: unknown): CourseOutcomes {
  const r = (row ?? {}) as Record<string, unknown>
  return {
    employment_rate_15m: toInt(r.employment_rate_15m),
    highly_skilled_employment_pct: toInt(r.highly_skilled_employment_pct),
    salary_median_1yr: toInt(r.salary_median_1yr),
    salary_median_3yr: toInt(r.salary_median_3yr),
    salary_median_5yr: toInt(r.salary_median_5yr),
    student_satisfaction_pct: toInt(r.student_satisfaction_pct),
    continuation_rate_pct: toInt(r.continuation_rate_pct),
    subject_ranking_cug: toInt(r.subject_ranking_cug),
    outcomes_data_year: typeof r.outcomes_data_year === 'string' ? r.outcomes_data_year : null,
    outcomes_needs_verification:
      typeof r.outcomes_needs_verification === 'boolean' ? r.outcomes_needs_verification : null,
  }
}

export function pickUniversityRankings(row: unknown): UniversityRankings {
  const r = (row ?? {}) as Record<string, unknown>
  return {
    ranking_cug: toInt(r.ranking_cug),
    ranking_cug_scotland: toInt(r.ranking_cug_scotland),
    ranking_guardian: toInt(r.ranking_guardian),
    ranking_times: toInt(r.ranking_times),
    graduate_employment_rate: toInt(r.graduate_employment_rate),
    rankings_year: typeof r.rankings_year === 'string' ? r.rankings_year : null,
    rankings_needs_verification:
      typeof r.rankings_needs_verification === 'boolean' ? r.rankings_needs_verification : null,
  }
}

function toInt(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v)
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Math.round(Number(v))
  return null
}

export function hasAnyCourseOutcomes(o: CourseOutcomes): boolean {
  return (
    o.employment_rate_15m !== null ||
    o.highly_skilled_employment_pct !== null ||
    o.salary_median_1yr !== null ||
    o.salary_median_3yr !== null ||
    o.salary_median_5yr !== null ||
    o.student_satisfaction_pct !== null
  )
}

export function hasAnyUniversityRanking(r: UniversityRankings): boolean {
  return (
    r.ranking_cug !== null ||
    r.ranking_cug_scotland !== null ||
    r.ranking_guardian !== null ||
    r.ranking_times !== null ||
    r.graduate_employment_rate !== null
  )
}

// Integer ordinal (1 -> 1st, 2 -> 2nd, 3 -> 3rd, 4 -> 4th, 21 -> 21st).
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}

// Format a GBP salary to "around £XX,000" (nearest thousand).
export function formatApproxSalary(pounds: number): string {
  const nearest = Math.round(pounds / 1000) * 1000
  return `£${nearest.toLocaleString('en-GB')}`
}

// Traffic-light colour for an employment rate percentage.
// Green >= 85, amber 70-84, red < 70.
export function employmentRateTone(pct: number): 'green' | 'amber' | 'red' {
  if (pct >= 85) return 'green'
  if (pct >= 70) return 'amber'
  return 'red'
}
