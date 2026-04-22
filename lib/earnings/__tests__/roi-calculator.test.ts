import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateROI,
  studyYearsForQualification,
  DEFAULT_STUDY_CONTEXT,
  type EntryQualification,
} from "../roi-calculator";

const electricianInput = {
  title: "Electrician",
  typicalEntryQualification: "national_5" as EntryQualification,
  typicalStartingSalaryGbp: 22000,
  typicalExperiencedSalaryGbp: 45000,
  typicalEntryAge: 17,
};

const nurseInput = {
  title: "Nurse",
  typicalEntryQualification: "degree_plus_professional" as EntryQualification,
  typicalStartingSalaryGbp: 31000,
  typicalExperiencedSalaryGbp: 46000,
  typicalEntryAge: 23,
};

const primaryTeacherInput = {
  title: "Primary Teacher",
  typicalEntryQualification: "degree_plus_professional" as EntryQualification,
  typicalStartingSalaryGbp: 33000,
  typicalExperiencedSalaryGbp: 53000,
  typicalEntryAge: 22,
};

describe("studyYearsForQualification", () => {
  it("maps degree tiers to 4 years", () => {
    assert.equal(studyYearsForQualification("degree"), 4);
    assert.equal(studyYearsForQualification("degree_plus_professional"), 4);
  });

  it("maps HND to 2 years", () => {
    assert.equal(studyYearsForQualification("hnd"), 2);
  });

  it("maps HNC to 1 year", () => {
    assert.equal(studyYearsForQualification("hnc"), 1);
  });

  it("returns 0 for direct-entry qualifications", () => {
    assert.equal(studyYearsForQualification("national_4"), 0);
    assert.equal(studyYearsForQualification("national_5"), 0);
    assert.equal(studyYearsForQualification("highers"), 0);
    assert.equal(studyYearsForQualification("none"), 0);
    assert.equal(studyYearsForQualification(null), 0);
  });

  it("returns 0 for unknown enum values (safe default)", () => {
    // @ts-expect-error deliberately pass an unsupported value
    assert.equal(studyYearsForQualification("apprenticeship"), 0);
  });
});

describe("calculateROI", () => {
  it("apprenticeship-like role (Electrician / national_5) has zero study cost, zero SAAS, positive lifetime value", () => {
    const result = calculateROI({ role: electricianInput });
    assert.equal(result.requiresStudy, false);
    assert.equal(result.studyYears, 0);
    assert.equal(result.studyCostTotal, 0);
    assert.equal(result.saasSupportTotal, 0);
    assert.equal(result.netStudyCost, 0);
    assert.equal(result.breakevenYears, null);
    assert.ok(
      result.netLifetimeValue > 500_000,
      `expected electrician net lifetime > £500k, got ${result.netLifetimeValue}`,
    );
    assert.ok(Number.isFinite(result.netLifetimeValue));
  });

  it("degree role (Nurse) reports positive gross study cost and SAAS support", () => {
    const result = calculateROI({ role: nurseInput });
    assert.equal(result.requiresStudy, true);
    assert.equal(result.studyYears, 4);
    assert.ok(
      result.studyCostTotal > 20_000,
      `expected Nurse study cost > £20k, got ${result.studyCostTotal}`,
    );
    assert.ok(
      result.saasSupportTotal > 0,
      "expected Nurse SAAS support > 0 in mid-income default context",
    );
    assert.ok(result.netStudyCost >= 0);
    assert.ok(result.netLifetimeValue > 500_000);
    assert.ok(Number.isFinite(result.studyCostTotal));
    assert.ok(Number.isFinite(result.saasSupportTotal));
  });

  it("degree + professional (Primary Teacher) returns finite values across all fields", () => {
    const result = calculateROI({ role: primaryTeacherInput });
    assert.equal(result.requiresStudy, true);
    assert.equal(result.studyYears, 4);
    assert.ok(Number.isFinite(result.studyCostTotal));
    assert.ok(Number.isFinite(result.saasSupportTotal));
    assert.ok(Number.isFinite(result.netStudyCost));
    assert.ok(Number.isFinite(result.netLifetimeValue));
  });

  it("HND role returns 2-year study cost (~half of degree total)", () => {
    const result = calculateROI({
      role: {
        title: "HND Role",
        typicalEntryQualification: "hnd",
        typicalStartingSalaryGbp: 24000,
        typicalExperiencedSalaryGbp: 38000,
        typicalEntryAge: 20,
      },
    });
    assert.equal(result.studyYears, 2);
    assert.ok(result.studyCostTotal > 0);
  });

  it("null qualification is treated as direct entry", () => {
    const result = calculateROI({
      role: {
        title: "Unknown",
        typicalEntryQualification: null,
        typicalStartingSalaryGbp: 22000,
        typicalExperiencedSalaryGbp: 30000,
        typicalEntryAge: 18,
      },
    });
    assert.equal(result.requiresStudy, false);
    assert.equal(result.studyCostTotal, 0);
    assert.equal(result.saasSupportTotal, 0);
    assert.equal(result.netStudyCost, 0);
  });

  it("null salaries do not produce NaN", () => {
    const result = calculateROI({
      role: {
        title: "Electrician",
        typicalEntryQualification: "national_5",
        typicalStartingSalaryGbp: null,
        typicalExperiencedSalaryGbp: null,
        typicalEntryAge: 17,
      },
    });
    assert.ok(Number.isFinite(result.netLifetimeValue));
    assert.ok(!Number.isNaN(result.netLifetimeValue));
  });

  it("custom over-45k household context yields positive net out-of-pocket cost for degree role", () => {
    const result = calculateROI({
      role: nurseInput,
      studyContext: {
        ...DEFAULT_STUDY_CONTEXT,
        household: "over-45k",
        work: "none",
      },
    });
    assert.ok(
      result.netStudyCost > 20_000,
      `expected high-income/no-work netStudyCost > £20k, got ${result.netStudyCost}`,
    );
    assert.ok(result.breakevenYears !== null && result.breakevenYears > 0);
  });

  it("breakeven is null when no out-of-pocket cost", () => {
    const result = calculateROI({ role: electricianInput });
    assert.equal(result.breakevenYears, null);
  });
});
