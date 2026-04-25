// Unit tests for lib/authority/pricing.ts
//
// Run via: npm run test  (uses tsx --test)

import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import {
  calculateLAPrice,
  getSchoolUpgradePrice,
  LA_BASE_FEE_GBP,
  LA_TIER_1_RATE_GBP,
  LA_TIER_2_RATE_GBP,
  LA_TIER_3_RATE_GBP,
  SCHOOL_PREMIUM_PRICE_GBP,
  SCHOOL_UPGRADE_PRICE_GBP,
} from '../pricing'

test('calculateLAPrice: 0 schools returns base fee only', () => {
  const r = calculateLAPrice(0)
  assert.equal(r.schoolCount, 0)
  assert.equal(r.base, LA_BASE_FEE_GBP)
  assert.equal(r.annualPounds, LA_BASE_FEE_GBP)
  assert.equal(r.annual, LA_BASE_FEE_GBP * 100)
  assert.equal(r.perSchoolBreakdown[0].count, 0)
  assert.equal(r.perSchoolBreakdown[1].count, 0)
  assert.equal(r.perSchoolBreakdown[2].count, 0)
  assert.equal(r.savingsVsIndividual, -LA_BASE_FEE_GBP)
})

test('calculateLAPrice: 1 school sits in tier 1', () => {
  const r = calculateLAPrice(1)
  assert.equal(r.annualPounds, LA_BASE_FEE_GBP + LA_TIER_1_RATE_GBP)
  assert.equal(r.perSchoolBreakdown[0].count, 1)
  assert.equal(r.perSchoolBreakdown[1].count, 0)
  assert.equal(r.perSchoolBreakdown[2].count, 0)
})

test('calculateLAPrice: 3 schools (Orkney shape) -- 9,500 GBP', () => {
  const r = calculateLAPrice(3)
  assert.equal(r.annualPounds, 9500)
  assert.equal(r.perSchoolBreakdown[0].subtotal, 4500)
  // Buying 3 Premium individually = 7500; bundle is 9500, so savings is -2000
  assert.equal(r.savingsVsIndividual, 7500 - 9500)
})

test('calculateLAPrice: 10 schools (lower boundary of tier 1)', () => {
  const r = calculateLAPrice(10)
  assert.equal(r.perSchoolBreakdown[0].count, 10)
  assert.equal(r.perSchoolBreakdown[1].count, 0)
  assert.equal(r.perSchoolBreakdown[2].count, 0)
  assert.equal(r.annualPounds, LA_BASE_FEE_GBP + 10 * LA_TIER_1_RATE_GBP) // 20000
})

test('calculateLAPrice: 11 schools spills 1 into tier 2', () => {
  const r = calculateLAPrice(11)
  assert.equal(r.perSchoolBreakdown[0].count, 10)
  assert.equal(r.perSchoolBreakdown[1].count, 1)
  assert.equal(r.perSchoolBreakdown[2].count, 0)
  assert.equal(r.annualPounds, LA_BASE_FEE_GBP + 10 * LA_TIER_1_RATE_GBP + LA_TIER_2_RATE_GBP)
})

test('calculateLAPrice: 20 schools fills tier 1 + tier 2', () => {
  const r = calculateLAPrice(20)
  assert.equal(r.perSchoolBreakdown[0].count, 10)
  assert.equal(r.perSchoolBreakdown[1].count, 10)
  assert.equal(r.perSchoolBreakdown[2].count, 0)
  assert.equal(r.annualPounds, 5000 + 15000 + 12500) // 32500 (Fife shape)
})

test('calculateLAPrice: 21 schools spills 1 into tier 3', () => {
  const r = calculateLAPrice(21)
  assert.equal(r.perSchoolBreakdown[0].count, 10)
  assert.equal(r.perSchoolBreakdown[1].count, 10)
  assert.equal(r.perSchoolBreakdown[2].count, 1)
  assert.equal(r.annualPounds, 5000 + 15000 + 12500 + 1000) // 33500
})

test('calculateLAPrice: 30 schools (Glasgow shape) -- 42,500 GBP', () => {
  const r = calculateLAPrice(30)
  assert.equal(r.perSchoolBreakdown[0].count, 10)
  assert.equal(r.perSchoolBreakdown[1].count, 10)
  assert.equal(r.perSchoolBreakdown[2].count, 10)
  assert.equal(r.annualPounds, 42500)
  // Buying 30 Premium individually = 75000; saving is 32500
  assert.equal(r.savingsVsIndividual, 30 * SCHOOL_PREMIUM_PRICE_GBP - 42500)
})

test('calculateLAPrice: 23 schools (Edinburgh shape) -- 35,500 GBP', () => {
  const r = calculateLAPrice(23)
  assert.equal(r.perSchoolBreakdown[0].count, 10)
  assert.equal(r.perSchoolBreakdown[1].count, 10)
  assert.equal(r.perSchoolBreakdown[2].count, 3)
  assert.equal(r.annualPounds, 35500)
})

test('calculateLAPrice: negative count collapses to 0 schools', () => {
  const r = calculateLAPrice(-5)
  assert.equal(r.schoolCount, 0)
  assert.equal(r.annualPounds, LA_BASE_FEE_GBP)
})

test('calculateLAPrice: NaN collapses to 0 schools', () => {
  const r = calculateLAPrice(Number.NaN)
  assert.equal(r.schoolCount, 0)
  assert.equal(r.annualPounds, LA_BASE_FEE_GBP)
})

test('calculateLAPrice: decimal count rounds down', () => {
  const r = calculateLAPrice(10.9)
  assert.equal(r.schoolCount, 10)
})

test('calculateLAPrice: annual is in pence and divisible by 100', () => {
  const r = calculateLAPrice(13)
  assert.equal(r.annual, r.annualPounds * 100)
  assert.equal(r.annual % 100, 0)
})

test('calculateLAPrice: includedSchoolTier is always standard', () => {
  assert.equal(calculateLAPrice(0).includedSchoolTier, 'standard')
  assert.equal(calculateLAPrice(30).includedSchoolTier, 'standard')
})

test('getSchoolUpgradePrice: returns 1000 (Premium 2500 - Standard 1500)', () => {
  assert.equal(getSchoolUpgradePrice(), 1000)
  assert.equal(getSchoolUpgradePrice(), SCHOOL_UPGRADE_PRICE_GBP)
})

// Tier-3 rate sanity check (referenced by Highland: 29 schools = 41500)
test('calculateLAPrice: 29 schools (Highland shape) -- 41,500 GBP', () => {
  const r = calculateLAPrice(29)
  assert.equal(r.perSchoolBreakdown[2].count, 9)
  assert.equal(r.perSchoolBreakdown[2].rate, LA_TIER_3_RATE_GBP)
  assert.equal(r.annualPounds, 41500)
})
