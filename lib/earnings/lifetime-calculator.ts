import { getTrainingSegment } from "./training-phases";
import { calculateNetFromGross } from "./tax-ni";

// Office for National Statistics — Annual Survey of Hours and Earnings 2024
// (release: 29 October 2024). Median gross annual pay for full-time employees
// in the UK. Re-check when ASHE 2025 (Oct 2025) and 2026 (Oct 2026) land.
export const UK_MEDIAN_SALARY_GBP = 37430;

const FIRST_WORKING_AGE = 16;
const DEFAULT_RETIREMENT_AGE = 68;
const PROGRESSION_YEARS = 14; // ramp from starting to experienced over 15 points (inclusive)
const DEFAULT_PENSION_PCT = 15; // blended NHS / STPS / LGPS / auto-enrolment employer band

export type EarningsMode = "gross" | "net";

export interface LifetimeCalculatorOptions {
  mode: EarningsMode;
  includeEmployerPension: boolean;
  pensionPct?: number;
}

export interface LifetimeCalculatorInput {
  roleSlug: string;
  typicalStartingSalaryGbp: number;
  typicalExperiencedSalaryGbp: number;
  typicalEntryAge: number;
  retirementAge?: number;
  options: LifetimeCalculatorOptions;
}

export interface LifetimeYear {
  age: number;
  value: number;
}

export interface LifetimeCalculatorResult {
  yearly: LifetimeYear[];
  lifetimeTotal: number;
}

function grossForAge(
  age: number,
  input: LifetimeCalculatorInput,
): number {
  const {
    roleSlug,
    typicalStartingSalaryGbp,
    typicalExperiencedSalaryGbp,
    typicalEntryAge,
  } = input;

  if (age < typicalEntryAge) {
    const segment = getTrainingSegment(roleSlug, age);
    return segment ? segment.annualSalaryGbp : 0;
  }

  const yearsIn = age - typicalEntryAge;
  if (yearsIn >= PROGRESSION_YEARS) {
    return typicalExperiencedSalaryGbp;
  }

  // Linear interpolation across PROGRESSION_YEARS steps (inclusive endpoints).
  const progressFraction = yearsIn / PROGRESSION_YEARS;
  return (
    typicalStartingSalaryGbp +
    (typicalExperiencedSalaryGbp - typicalStartingSalaryGbp) * progressFraction
  );
}

export function calculateLifetimeEarnings(
  input: LifetimeCalculatorInput,
): LifetimeCalculatorResult {
  const retirementAge = input.retirementAge ?? DEFAULT_RETIREMENT_AGE;
  const { mode, includeEmployerPension } = input.options;
  const pensionPct = input.options.pensionPct ?? DEFAULT_PENSION_PCT;
  const pensionFraction = pensionPct / 100;

  const yearly: LifetimeYear[] = [];
  let lifetimeTotal = 0;

  for (let age = FIRST_WORKING_AGE; age <= retirementAge; age += 1) {
    const gross = grossForAge(age, input);

    // Employer pension contribution is not subject to income tax or NI from
    // the employee's perspective, so it is added on top after any net-mode
    // deduction on the base salary.
    const pensionValue = includeEmployerPension ? gross * pensionFraction : 0;
    const baseValue = mode === "net" ? calculateNetFromGross(gross) : gross;
    const value = baseValue + pensionValue;

    yearly.push({ age, value });
    lifetimeTotal += value;
  }

  return { yearly, lifetimeTotal };
}
