/**
 * Shared ROI calculator.
 *
 * The standalone /tools/roi-calculator UI collects explicit user inputs
 * (city, accommodation, household bracket, part-time work). The career
 * comparison grid needs ROI figures without asking those questions -- it
 * falls back to a sensible set of defaults (average Scottish uni city,
 * halls, mid-income household, ~10h part-time term-time work) so figures
 * can be rendered directly. Users who want personalised numbers are
 * pointed back to the full calculator.
 *
 * The study context is derived from the role's `typical_entry_qualification`:
 * - `degree` / `degree_plus_professional` -> 4-year on-campus degree
 * - `hnd` -> 2-year college-based HND
 * - `hnc` -> 1-year HNC
 * - `highers` / `national_5` / `national_4` / `none` / unknown
 *   -> treated as direct entry (no study cost, no SAAS support)
 *
 * For the non-study roles the net lifetime value is simply the lifetime
 * earnings projected by lib/earnings/lifetime-calculator.
 */

import {
  calculateAnnualBreakdown,
  getCityById,
  type AccommodationType,
  type CityId,
  type HouseholdBracket,
  type PartTimeWork,
} from '@/app/tools/roi-calculator/constants'
import { calculateLifetimeEarnings } from '@/lib/earnings/lifetime-calculator'
import { trainingSlugForTitle } from '@/lib/earnings/role-slug'

export type EntryQualification =
  | 'none'
  | 'national_4'
  | 'national_5'
  | 'highers'
  | 'hnc'
  | 'hnd'
  | 'degree'
  | 'degree_plus_professional'

export interface StudyContext {
  city: CityId
  accommodation: AccommodationType
  household: HouseholdBracket
  work: PartTimeWork
}

export const DEFAULT_STUDY_CONTEXT: StudyContext = {
  city: 'glasgow', // Mid-range Scottish uni city; Edinburgh is above average, Dundee below.
  accommodation: 'halls',
  household: '21k-34k',
  work: '10h',
}

export interface RoiRoleInput {
  title: string
  typicalEntryQualification: EntryQualification | null
  typicalStartingSalaryGbp: number | null
  typicalExperiencedSalaryGbp: number | null
  typicalEntryAge: number
}

export interface RoiResult {
  /** Study duration in years (0 for non-study routes). */
  studyYears: number
  /** Total out-of-pocket study cost across all study years (outgoings minus SAAS support and part-time income). */
  studyCostTotal: number
  /** Total SAAS non-repayable support across all study years. */
  saasSupportTotal: number
  /** Projected net lifetime earnings (post-tax, post-NI; no pension contribution added). */
  netLifetimeValue: number
  /** Years after entry for net lifetime value to exceed study cost. `null` if no study cost or never. */
  breakevenYears: number | null
  /** True if the role requires structured study (degree / HND / HNC). */
  requiresStudy: boolean
}

/** Map a qualification to the assumed study duration in years. */
export function studyYearsForQualification(q: EntryQualification | null): number {
  switch (q) {
    case 'degree_plus_professional':
    case 'degree':
      return 4
    case 'hnd':
      return 2
    case 'hnc':
      return 1
    default:
      return 0
  }
}

export function calculateROI(params: {
  role: RoiRoleInput
  studyContext?: StudyContext
}): RoiResult {
  const context = params.studyContext ?? DEFAULT_STUDY_CONTEXT
  const studyYears = studyYearsForQualification(params.role.typicalEntryQualification)

  let studyCostTotal = 0
  let saasSupportTotal = 0
  if (studyYears > 0) {
    const city = getCityById(context.city)
    const annual = calculateAnnualBreakdown({
      city,
      accommodation: context.accommodation,
      household: context.household,
      work: context.work,
    })
    studyCostTotal = Math.max(0, annual.netCost) * studyYears
    saasSupportTotal = annual.saasSupport * studyYears
  }

  const slug = trainingSlugForTitle(params.role.title)
  const lifetime = calculateLifetimeEarnings({
    roleSlug: slug ?? '__none__',
    typicalStartingSalaryGbp: params.role.typicalStartingSalaryGbp ?? 0,
    typicalExperiencedSalaryGbp: params.role.typicalExperiencedSalaryGbp ?? 0,
    typicalEntryAge: params.role.typicalEntryAge,
    options: { mode: 'net', includeEmployerPension: false },
  })
  const netLifetimeValue = lifetime.lifetimeTotal

  let breakevenYears: number | null = null
  if (studyCostTotal > 0) {
    // Cumulative net earnings by age, post-study. Break-even when cumulative
    // exceeds studyCostTotal.
    let cumulative = 0
    const postStudyYearly = lifetime.yearly.filter(
      (y) => y.age >= params.role.typicalEntryAge,
    )
    for (let i = 0; i < postStudyYearly.length; i += 1) {
      cumulative += postStudyYearly[i].value
      if (cumulative >= studyCostTotal) {
        breakevenYears = i + 1
        break
      }
    }
  }

  return {
    studyYears,
    studyCostTotal,
    saasSupportTotal,
    netLifetimeValue,
    breakevenYears,
    requiresStudy: studyYears > 0,
  }
}
