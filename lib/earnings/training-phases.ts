/**
 * Pre-entry training phases for roles whose typical_entry_age
 * follows an extended qualification or apprenticeship pathway.
 *
 * Each entry is an ordered list of { ageFrom, ageTo, annualSalaryGbp, label }
 * segments covering the period BEFORE typical_entry_age. Ranges are inclusive
 * on both ends (ageFrom <= age <= ageTo). Lookup is first-match-wins, so
 * order segments from earliest to latest; any overlap resolves to the
 * earlier segment.
 *
 * Roles not listed here have an empty training phase — all ages below
 * typical_entry_age simply yield 0.
 *
 * Salaries reflect public-sector / typical-contract figures as of 2025-26
 * (NHS FY1 Scotland pay point 1, SSSB dental foundation training, etc.)
 * rounded to the nearest £1k. Apprentice wages follow a stepped progression
 * typical of Scottish construction-trades apprenticeship frameworks.
 */

export interface TrainingSegment {
  ageFrom: number;
  ageTo: number;
  annualSalaryGbp: number;
  label: string;
}

export type TrainingPhaseMap = Record<string, TrainingSegment[]>;

export const TRAINING_PHASES: TrainingPhaseMap = {
  doctor: [
    { ageFrom: 18, ageTo: 22, annualSalaryGbp: 0, label: "Medical school" },
    { ageFrom: 23, ageTo: 23, annualSalaryGbp: 33000, label: "FY1" },
  ],
  dentist: [
    { ageFrom: 18, ageTo: 22, annualSalaryGbp: 0, label: "Dental school" },
    { ageFrom: 23, ageTo: 23, annualSalaryGbp: 35000, label: "Dental foundation training" },
  ],
  vet: [
    { ageFrom: 18, ageTo: 22, annualSalaryGbp: 0, label: "Veterinary school" },
  ],
  pharmacist: [
    { ageFrom: 18, ageTo: 21, annualSalaryGbp: 0, label: "MPharm" },
    { ageFrom: 22, ageTo: 22, annualSalaryGbp: 28000, label: "Foundation training year" },
  ],
  solicitor: [
    { ageFrom: 18, ageTo: 21, annualSalaryGbp: 0, label: "LLB" },
    { ageFrom: 22, ageTo: 22, annualSalaryGbp: 0, label: "Diploma in Professional Legal Practice" },
    { ageFrom: 23, ageTo: 24, annualSalaryGbp: 28000, label: "Traineeship" },
  ],
  advocate: [
    { ageFrom: 18, ageTo: 21, annualSalaryGbp: 0, label: "LLB" },
    { ageFrom: 22, ageTo: 22, annualSalaryGbp: 0, label: "Diploma in Professional Legal Practice" },
    { ageFrom: 23, ageTo: 24, annualSalaryGbp: 0, label: "Devilling" },
  ],

  teacher_primary: [
    { ageFrom: 18, ageTo: 21, annualSalaryGbp: 0, label: "Undergraduate ITE" },
  ],
  teacher_secondary_english: [
    { ageFrom: 18, ageTo: 21, annualSalaryGbp: 0, label: "Subject undergraduate" },
  ],
  teacher_secondary_maths: [
    { ageFrom: 18, ageTo: 21, annualSalaryGbp: 0, label: "Subject undergraduate" },
  ],
  teacher_secondary_science: [
    { ageFrom: 18, ageTo: 21, annualSalaryGbp: 0, label: "Subject undergraduate" },
  ],
  teacher_secondary_modern_languages: [
    { ageFrom: 18, ageTo: 21, annualSalaryGbp: 0, label: "Subject undergraduate" },
  ],

  clinical_psychologist: [
    { ageFrom: 18, ageTo: 21, annualSalaryGbp: 0, label: "Psychology undergraduate" },
    { ageFrom: 22, ageTo: 23, annualSalaryGbp: 26000, label: "Assistant psychologist" },
    { ageFrom: 24, ageTo: 26, annualSalaryGbp: 22000, label: "DClinPsy (bursary)" },
  ],

  electrician_apprentice: [
    { ageFrom: 16, ageTo: 16, annualSalaryGbp: 8000, label: "Apprentice year 1" },
    { ageFrom: 17, ageTo: 17, annualSalaryGbp: 11000, label: "Apprentice year 2" },
    { ageFrom: 18, ageTo: 18, annualSalaryGbp: 14000, label: "Apprentice year 3" },
    { ageFrom: 19, ageTo: 19, annualSalaryGbp: 18000, label: "Apprentice year 4" },
  ],
  plumber_apprentice: [
    { ageFrom: 16, ageTo: 16, annualSalaryGbp: 8000, label: "Apprentice year 1" },
    { ageFrom: 17, ageTo: 17, annualSalaryGbp: 11000, label: "Apprentice year 2" },
    { ageFrom: 18, ageTo: 18, annualSalaryGbp: 14000, label: "Apprentice year 3" },
    { ageFrom: 19, ageTo: 19, annualSalaryGbp: 18000, label: "Apprentice year 4" },
  ],
  joiner_apprentice: [
    { ageFrom: 16, ageTo: 16, annualSalaryGbp: 8000, label: "Apprentice year 1" },
    { ageFrom: 17, ageTo: 17, annualSalaryGbp: 11000, label: "Apprentice year 2" },
    { ageFrom: 18, ageTo: 18, annualSalaryGbp: 14000, label: "Apprentice year 3" },
    { ageFrom: 19, ageTo: 19, annualSalaryGbp: 18000, label: "Apprentice year 4" },
  ],
  mechanic_apprentice: [
    { ageFrom: 16, ageTo: 16, annualSalaryGbp: 8000, label: "Apprentice year 1" },
    { ageFrom: 17, ageTo: 17, annualSalaryGbp: 11000, label: "Apprentice year 2" },
    { ageFrom: 18, ageTo: 18, annualSalaryGbp: 14000, label: "Apprentice year 3" },
    { ageFrom: 19, ageTo: 19, annualSalaryGbp: 18000, label: "Apprentice year 4" },
  ],
};

export function getTrainingSegment(
  roleSlug: string,
  age: number,
): TrainingSegment | undefined {
  const phases = TRAINING_PHASES[roleSlug];
  if (!phases) return undefined;
  return phases.find((p) => age >= p.ageFrom && age <= p.ageTo);
}
