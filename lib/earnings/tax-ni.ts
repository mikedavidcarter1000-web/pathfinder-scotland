/**
 * Scottish income tax + UK National Insurance calculators for tax year 2025-26.
 *
 * Rates and thresholds verified against:
 *   - Scottish Government Budget 2025-26 (Scottish income tax)
 *   - HMRC Class 1 NI rates 2025-26 (employee primary contributions)
 *
 * Re-check at the start of each new tax year (6 April). Last verified: 2026-04-21.
 *
 * Figures are GBP per annum. All functions assume a single source of
 * employment income; dividend, savings, and multi-employment scenarios are
 * out of scope for the lifetime-earnings calculator.
 */

export const PERSONAL_ALLOWANCE_GBP = 12570;

// Personal allowance taper: reduced by £1 for every £2 of income above £100,000,
// so fully withdrawn at £125,140.
export const PA_TAPER_START_GBP = 100000;
export const PA_TAPER_END_GBP = 125140;

// Scottish income tax bands 2025-26. `upperGbp` is the top of the band
// (Infinity for the top rate). `rate` is a decimal fraction of gross.
export interface TaxBand {
  name: string;
  lowerGbp: number;
  upperGbp: number;
  rate: number;
}

export const SCOTTISH_TAX_BANDS_2025_26: TaxBand[] = [
  { name: "Starter",      lowerGbp: 12570,  upperGbp: 15397,  rate: 0.19 },
  { name: "Basic",        lowerGbp: 15397,  upperGbp: 27491,  rate: 0.20 },
  { name: "Intermediate", lowerGbp: 27491,  upperGbp: 43662,  rate: 0.21 },
  { name: "Higher",       lowerGbp: 43662,  upperGbp: 75000,  rate: 0.42 },
  { name: "Advanced",     lowerGbp: 75000,  upperGbp: 125140, rate: 0.45 },
  { name: "Top",          lowerGbp: 125140, upperGbp: Infinity, rate: 0.48 },
];

// Class 1 employee National Insurance 2025-26.
export const NI_PRIMARY_THRESHOLD_GBP = 12570;
export const NI_UPPER_EARNINGS_LIMIT_GBP = 50270;
export const NI_MAIN_RATE = 0.08;
export const NI_ADDITIONAL_RATE = 0.02;

/**
 * Effective personal allowance after tapering. At gross <= £100k the full
 * £12,570 applies; between £100k and £125,140 it reduces linearly; above
 * £125,140 it is zero.
 */
function effectivePersonalAllowance(grossAnnualGbp: number): number {
  if (grossAnnualGbp <= PA_TAPER_START_GBP) return PERSONAL_ALLOWANCE_GBP;
  if (grossAnnualGbp >= PA_TAPER_END_GBP) return 0;
  const reduction = (grossAnnualGbp - PA_TAPER_START_GBP) / 2;
  return Math.max(0, PERSONAL_ALLOWANCE_GBP - reduction);
}

export function calculateTaxOnly(grossAnnualGbp: number): number {
  if (grossAnnualGbp <= 0) return 0;

  const pa = effectivePersonalAllowance(grossAnnualGbp);
  // When PA is tapered below the default £12,570, the portion between the
  // effective PA and £12,570 becomes taxable at the Starter rate in Scotland.
  const taxableBase = Math.max(0, grossAnnualGbp - pa);
  if (taxableBase === 0) return 0;

  let tax = 0;
  // Build an effective band list shifted down so that income above the PA
  // starts at the Starter band. We express bands as cumulative gross-income
  // thresholds assuming default PA; when PA is tapered, the tapered-away
  // portion (PA_default - effective PA) is taxed at the Starter rate in
  // addition to the income that was already in the Starter band.
  for (const band of SCOTTISH_TAX_BANDS_2025_26) {
    if (grossAnnualGbp <= band.lowerGbp) break;
    const taxedInBand =
      Math.min(grossAnnualGbp, band.upperGbp) - band.lowerGbp;
    tax += taxedInBand * band.rate;
  }

  // If PA was tapered, the withdrawn portion (between effective PA and
  // £12,570) has not yet been taxed above — add it at the Starter rate.
  const paWithdrawn = PERSONAL_ALLOWANCE_GBP - pa;
  if (paWithdrawn > 0) {
    tax += paWithdrawn * SCOTTISH_TAX_BANDS_2025_26[0].rate;
  }

  return tax;
}

export function calculateNiOnly(grossAnnualGbp: number): number {
  if (grossAnnualGbp <= NI_PRIMARY_THRESHOLD_GBP) return 0;
  const mainBandTop = Math.min(grossAnnualGbp, NI_UPPER_EARNINGS_LIMIT_GBP);
  const mainBandAmount = mainBandTop - NI_PRIMARY_THRESHOLD_GBP;
  let ni = mainBandAmount * NI_MAIN_RATE;
  if (grossAnnualGbp > NI_UPPER_EARNINGS_LIMIT_GBP) {
    ni += (grossAnnualGbp - NI_UPPER_EARNINGS_LIMIT_GBP) * NI_ADDITIONAL_RATE;
  }
  return ni;
}

export function calculateNetFromGross(grossAnnualGbp: number): number {
  if (grossAnnualGbp <= 0) return 0;
  const tax = calculateTaxOnly(grossAnnualGbp);
  const ni = calculateNiOnly(grossAnnualGbp);
  return grossAnnualGbp - tax - ni;
}
