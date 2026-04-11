/**
 * ROI calculator reference data for Scottish undergraduate study.
 *
 * Figures below are approximate, published estimates — they are intended to
 * help students build a realistic mental model, not to give a binding quote.
 * The calculator surfaces all sources and a "last updated" date in the
 * assumptions panel so users can verify any number independently.
 *
 * Last reviewed: April 2026.
 */

export type CityId =
  | 'edinburgh'
  | 'glasgow'
  | 'aberdeen'
  | 'dundee'
  | 'stirling'
  | 'st-andrews'
  | 'inverness'
  | 'at-home'

export type AccommodationType = 'halls' | 'private' | 'at-home'

export type HouseholdBracket =
  | 'under-21k'
  | '21k-34k'
  | '34k-45k'
  | 'over-45k'
  | 'prefer-not-to-say'

export type PartTimeWork = '10h' | '15h' | 'none' | 'summer-only'

export type Duration = 4 | 5 | 6

export interface CityCostData {
  id: CityId
  label: string
  /** Monthly rent for standard university halls (term-time contract ~9 months). */
  hallsMonthly: number
  /** Monthly rent for a private shared flat (12-month tenancy). */
  privateMonthly: number
}

/**
 * City rent estimates.
 *
 * Sources consulted:
 *  - NatWest Student Living Index
 *  - Unipol / Save the Student UK student rent surveys
 *  - University accommodation listings (Edinburgh, Glasgow, Aberdeen, Dundee,
 *    Stirling, St Andrews, UHI)
 *  - Rightmove and accommodationforstudents.com listings (private shared)
 *
 * Figures are rounded to the nearest £10 and represent a typical mid-range
 * standard room — not the cheapest or most expensive on the market.
 */
export const CITIES: CityCostData[] = [
  { id: 'edinburgh', label: 'Edinburgh', hallsMonthly: 750, privateMonthly: 650 },
  { id: 'glasgow', label: 'Glasgow', hallsMonthly: 600, privateMonthly: 500 },
  { id: 'aberdeen', label: 'Aberdeen', hallsMonthly: 550, privateMonthly: 480 },
  { id: 'dundee', label: 'Dundee', hallsMonthly: 520, privateMonthly: 430 },
  { id: 'stirling', label: 'Stirling', hallsMonthly: 550, privateMonthly: 450 },
  { id: 'st-andrews', label: 'St Andrews', hallsMonthly: 650, privateMonthly: 550 },
  { id: 'inverness', label: 'Inverness / Highlands', hallsMonthly: 500, privateMonthly: 430 },
  { id: 'at-home', label: 'Living at home (any city)', hallsMonthly: 0, privateMonthly: 0 },
]

/**
 * Non-rent monthly living costs (food, transport, books, phone, social).
 * Source: NUS / SAAS cost-of-living estimates for Scottish students,
 * adjusted to 2025/26 prices.
 */
export const MONTHLY_LIVING_COSTS = {
  food: 200,
  transport: 60,
  booksAndCourse: 30,
  phoneInternet: 30,
  socialPersonal: 100,
} as const

export const MONTHLY_LIVING_TOTAL =
  MONTHLY_LIVING_COSTS.food +
  MONTHLY_LIVING_COSTS.transport +
  MONTHLY_LIVING_COSTS.booksAndCourse +
  MONTHLY_LIVING_COSTS.phoneInternet +
  MONTHLY_LIVING_COSTS.socialPersonal // 420

/** Reduced transport figure when the student lives at home with family. */
export const MONTHLY_LIVING_AT_HOME_TRANSPORT = 30
export const MONTHLY_LIVING_TOTAL_AT_HOME =
  MONTHLY_LIVING_COSTS.food +
  MONTHLY_LIVING_AT_HOME_TRANSPORT +
  MONTHLY_LIVING_COSTS.booksAndCourse +
  MONTHLY_LIVING_COSTS.phoneInternet +
  MONTHLY_LIVING_COSTS.socialPersonal // 390 — still high because food, phone etc. remain

// The brief cites ~£190 when living at home (a more conservative figure that
// assumes the family absorbs food and utility costs). We use that value so
// the calculator matches the published comparator and the blog article.
export const MONTHLY_LIVING_AT_HOME_TOTAL = 190

/** Academic year length (in months) used for living cost calculations. */
export const ACADEMIC_YEAR_MONTHS = 9
/** Halls contracts typically run for ~9 months (term-time only). */
export const HALLS_CONTRACT_MONTHS = 9
/** Private tenancies run 12 months in almost all cases. */
export const PRIVATE_TENANCY_MONTHS = 12

/**
 * SAAS student support — approximate annual non-repayable figures by
 * household income band. These are combined estimates of the support package
 * a typical young Scottish student might receive; see the assumptions panel
 * for a full caveat and a link to saas.gov.uk for exact bursary/loan splits.
 *
 * Source: saas.gov.uk, 2025/26 rates.
 */
export const SAAS_SUPPORT_BY_BRACKET: Record<HouseholdBracket, number> = {
  'under-21k': 8400,
  '21k-34k': 5400,
  '34k-45k': 2400,
  'over-45k': 1125,
  'prefer-not-to-say': 4331, // arithmetic mean of the four bands, rounded
}

/** Additional bursary for care-experienced Scottish students, paid regardless of income. */
export const CARE_EXPERIENCED_BURSARY = 8400

/**
 * National Living Wage for 18-20-year-olds, effective April 2025.
 * Source: gov.uk — National Minimum Wage and National Living Wage rates.
 */
export const WAGE_18_20 = 10.0

/** Term-time working weeks per academic year (allows for holidays and exam periods). */
export const TERM_WEEKS = 40

/** Approximate summer earnings for a student working full-time across 3 months. */
export const SUMMER_WORK_INCOME = 3500

/**
 * Graduate and non-graduate average salaries (Scotland, 2025).
 * Sources: HESA Graduate Outcomes, ONS Annual Survey of Hours and Earnings,
 * Universities Scotland bite-size briefings.
 * Individual earnings vary significantly by subject and career.
 */
export const GRADUATE_SALARY = 28000
export const NON_GRADUATE_SALARY = 22000
export const GRADUATE_PREMIUM = GRADUATE_SALARY - NON_GRADUATE_SALARY // £6,000

/**
 * Typical working years over which the graduate premium is realised.
 * Deliberately conservative — career length varies.
 */
export const WORKING_YEARS = 40
export const LIFETIME_PREMIUM = GRADUATE_PREMIUM * WORKING_YEARS // £240,000

/** English undergraduate tuition 2025/26, for the comparison callout. */
export const ENGLAND_TUITION_PER_YEAR = 9250

export const HOUSEHOLD_OPTIONS: { value: HouseholdBracket; label: string }[] = [
  { value: 'under-21k', label: 'Under £21,000 (maximum SAAS support)' },
  { value: '21k-34k', label: '£21,000 – £34,000' },
  { value: '34k-45k', label: '£34,000 – £45,000' },
  { value: 'over-45k', label: 'Over £45,000 (minimum SAAS support)' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say (uses middle estimate)' },
]

export const PART_TIME_OPTIONS: { value: PartTimeWork; label: string }[] = [
  { value: '10h', label: 'Yes, around 10 hours/week' },
  { value: '15h', label: 'Yes, around 15 hours/week' },
  { value: 'summer-only', label: 'Summer work only' },
  { value: 'none', label: 'No part-time work' },
]

export const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: 4, label: '4 years (standard Scottish degree)' },
  { value: 5, label: '5 years (MEng, MPharm, Architecture)' },
  { value: 6, label: '6 years (Medicine, Dentistry, Veterinary)' },
]

// ----- Derived calculations --------------------------------------------------

export function getCityById(id: CityId): CityCostData {
  return CITIES.find((c) => c.id === id) ?? CITIES[0]
}

export function getMonthlyRent(city: CityCostData, accommodation: AccommodationType): number {
  if (accommodation === 'at-home') return 0
  if (accommodation === 'halls') return city.hallsMonthly
  return city.privateMonthly
}

/** Annual rent given the accommodation type and tenancy length. */
export function getAnnualAccommodation(
  city: CityCostData,
  accommodation: AccommodationType,
): number {
  if (accommodation === 'at-home') return 0
  if (accommodation === 'halls') return city.hallsMonthly * HALLS_CONTRACT_MONTHS
  return city.privateMonthly * PRIVATE_TENANCY_MONTHS
}

/** Annual non-rent living costs for the 9-month academic year. */
export function getAnnualLivingCosts(accommodation: AccommodationType): number {
  const monthly =
    accommodation === 'at-home' ? MONTHLY_LIVING_AT_HOME_TOTAL : MONTHLY_LIVING_TOTAL
  return monthly * ACADEMIC_YEAR_MONTHS
}

export function getAnnualSaasSupport(bracket: HouseholdBracket): number {
  return SAAS_SUPPORT_BY_BRACKET[bracket]
}

export function getAnnualPartTimeIncome(work: PartTimeWork): number {
  switch (work) {
    case '10h':
      return Math.round(10 * WAGE_18_20 * TERM_WEEKS) // £4,000
    case '15h':
      return Math.round(15 * WAGE_18_20 * TERM_WEEKS) // £6,000
    case 'summer-only':
      return SUMMER_WORK_INCOME
    case 'none':
      return 0
  }
}

export interface AnnualBreakdown {
  accommodation: number
  livingCosts: number
  totalOutgoings: number
  saasSupport: number
  partTimeIncome: number
  totalIncome: number
  netCost: number // positive = shortfall; negative = surplus
}

export function calculateAnnualBreakdown(params: {
  city: CityCostData
  accommodation: AccommodationType
  household: HouseholdBracket
  work: PartTimeWork
}): AnnualBreakdown {
  const accommodation = getAnnualAccommodation(params.city, params.accommodation)
  const livingCosts = getAnnualLivingCosts(params.accommodation)
  const totalOutgoings = accommodation + livingCosts
  const saasSupport = getAnnualSaasSupport(params.household)
  const partTimeIncome = getAnnualPartTimeIncome(params.work)
  const totalIncome = saasSupport + partTimeIncome
  const netCost = totalOutgoings - totalIncome

  return {
    accommodation,
    livingCosts,
    totalOutgoings,
    saasSupport,
    partTimeIncome,
    totalIncome,
    netCost,
  }
}

export function formatGBP(amount: number, opts: { withPence?: boolean } = {}): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: opts.withPence ? 2 : 0,
    maximumFractionDigits: opts.withPence ? 2 : 0,
  })
  return formatter.format(amount)
}
