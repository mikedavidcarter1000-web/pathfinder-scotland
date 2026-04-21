import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { calculateLifetimeEarnings } from "../lifetime-calculator";
import { calculateNetFromGross } from "../tax-ni";

const baseOptions = {
  mode: "gross" as const,
  includeEmployerPension: false,
};

describe("calculateLifetimeEarnings", () => {
  it("unknown role has no training phase; every pre-entry year is 0", () => {
    const result = calculateLifetimeEarnings({
      roleSlug: "unknown_role_xyz",
      typicalStartingSalaryGbp: 25000,
      typicalExperiencedSalaryGbp: 45000,
      typicalEntryAge: 22,
      options: baseOptions,
    });

    // Ages 16..21 yield 0.
    for (let age = 16; age <= 21; age += 1) {
      const year = result.yearly.find((y) => y.age === age);
      assert.equal(year?.value, 0, `age ${age} should be 0`);
    }
    // Entry year gets starting salary.
    assert.equal(result.yearly.find((y) => y.age === 22)?.value, 25000);
    // Age 22 + PROGRESSION_YEARS (14) = 36 onwards → experienced salary.
    assert.equal(result.yearly.find((y) => y.age === 36)?.value, 45000);
    assert.equal(result.yearly.find((y) => y.age === 68)?.value, 45000);

    // Sanity: lifetime total is positive and less than 53 years at experienced.
    assert.ok(result.lifetimeTotal > 0);
    assert.ok(result.lifetimeTotal < 45000 * 53);
  });

  it("doctor: training-phase ages are 0, FY1 is 33k, lifetime exceeds training-free equivalent", () => {
    // typicalEntryAge is passed as 24 so that age 23 falls within the
    // training window and picks up the FY1 segment (ageFrom=23, ageTo=23).
    // The training-phases lookup is consulted for ages below typicalEntryAge;
    // the FY1 salary is therefore credited during the training window.
    const doctor = calculateLifetimeEarnings({
      roleSlug: "doctor",
      typicalStartingSalaryGbp: 36000,
      typicalExperiencedSalaryGbp: 110000,
      typicalEntryAge: 24,
      options: baseOptions,
    });

    for (let age = 18; age <= 22; age += 1) {
      assert.equal(
        doctor.yearly.find((y) => y.age === age)?.value,
        0,
        `medical school age ${age} should be 0`,
      );
    }
    assert.equal(doctor.yearly.find((y) => y.age === 23)?.value, 33000);
    assert.equal(doctor.yearly.find((y) => y.age === 24)?.value, 36000);

    // Equivalent career with no training phase (unknown role slug, same
    // typicalEntryAge / starting / experienced). Doctor's FY1 income during
    // training means its lifetime total must exceed the equivalent.
    const equivalent = calculateLifetimeEarnings({
      roleSlug: "no_phase_equivalent",
      typicalStartingSalaryGbp: 36000,
      typicalExperiencedSalaryGbp: 110000,
      typicalEntryAge: 24,
      options: baseOptions,
    });

    assert.ok(
      doctor.lifetimeTotal > equivalent.lifetimeTotal,
      "doctor should earn more than training-free equivalent due to FY1 income",
    );
    // The single year of FY1 at 33,000 is the only difference.
    assert.equal(doctor.lifetimeTotal - equivalent.lifetimeTotal, 33000);
  });

  it("electrician apprentice: ages 16-19 use stepped apprentice wages", () => {
    const result = calculateLifetimeEarnings({
      roleSlug: "electrician_apprentice",
      typicalStartingSalaryGbp: 22000,
      typicalExperiencedSalaryGbp: 45000,
      typicalEntryAge: 20,
      options: baseOptions,
    });

    assert.equal(result.yearly.find((y) => y.age === 16)?.value, 8000);
    assert.equal(result.yearly.find((y) => y.age === 17)?.value, 11000);
    assert.equal(result.yearly.find((y) => y.age === 18)?.value, 14000);
    assert.equal(result.yearly.find((y) => y.age === 19)?.value, 18000);
    assert.equal(result.yearly.find((y) => y.age === 20)?.value, 22000);
  });

  it("net mode produces a lower lifetime total than gross by a plausible tax-and-NI margin", () => {
    const input = {
      roleSlug: "unknown_role_xyz",
      typicalStartingSalaryGbp: 30000,
      typicalExperiencedSalaryGbp: 60000,
      typicalEntryAge: 22,
    };
    const gross = calculateLifetimeEarnings({
      ...input,
      options: { mode: "gross" as const, includeEmployerPension: false },
    });
    const net = calculateLifetimeEarnings({
      ...input,
      options: { mode: "net" as const, includeEmployerPension: false },
    });

    assert.ok(net.lifetimeTotal < gross.lifetimeTotal);
    // Net should retain somewhere between ~60% and ~80% of gross for this
    // salary range under Scottish 2025-26 bands; the ratio is the ballpark
    // test (pinning to an exact figure would be brittle if rates change).
    const ratio = net.lifetimeTotal / gross.lifetimeTotal;
    assert.ok(ratio > 0.6 && ratio < 0.8, `net/gross ratio ${ratio} out of expected range`);

    // Cross-check: net total equals sum of calculateNetFromGross over yearly grosses.
    const expectedNet = gross.yearly.reduce(
      (acc, y) => acc + calculateNetFromGross(y.value),
      0,
    );
    assert.equal(net.lifetimeTotal, expectedNet);
  });

  it("pension toggle increases lifetime total by roughly pensionPct of total gross career earnings", () => {
    const input = {
      roleSlug: "unknown_role_xyz",
      typicalStartingSalaryGbp: 28000,
      typicalExperiencedSalaryGbp: 55000,
      typicalEntryAge: 22,
    };
    const noPension = calculateLifetimeEarnings({
      ...input,
      options: { mode: "gross" as const, includeEmployerPension: false },
    });
    const withPension = calculateLifetimeEarnings({
      ...input,
      options: {
        mode: "gross" as const,
        includeEmployerPension: true,
        pensionPct: 15,
      },
    });

    const uplift = withPension.lifetimeTotal - noPension.lifetimeTotal;
    const expectedUplift = noPension.lifetimeTotal * 0.15;
    // Exact equality modulo floating-point noise because pension is simply
    // pensionPct × gross for every year.
    assert.ok(
      Math.abs(uplift - expectedUplift) < 1,
      `pension uplift ${uplift} should equal ${expectedUplift}`,
    );
  });

  it("retirement age 68 means year 68 IS included and year 69 is NOT", () => {
    const result = calculateLifetimeEarnings({
      roleSlug: "unknown_role_xyz",
      typicalStartingSalaryGbp: 25000,
      typicalExperiencedSalaryGbp: 25000,
      typicalEntryAge: 22,
      retirementAge: 68,
      options: baseOptions,
    });

    const ages = result.yearly.map((y) => y.age);
    assert.equal(ages[0], 16);
    assert.equal(ages[ages.length - 1], 68);
    assert.ok(ages.includes(68), "age 68 must be present");
    assert.ok(!ages.includes(69), "age 69 must be absent");
    assert.equal(result.yearly.length, 68 - 16 + 1);
  });
});
