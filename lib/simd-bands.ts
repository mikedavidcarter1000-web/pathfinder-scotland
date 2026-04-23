export type SimdBand = 'simd20' | 'simd40' | 'outside'

export function getSimdBand(decile: number): SimdBand {
  if (decile <= 2) return 'simd20'
  if (decile <= 4) return 'simd40'
  return 'outside'
}

export interface SimdHeadlineCopy {
  headline: string
  footnote: string
}

export function getSimdHeadlineCopy(decile: number): SimdHeadlineCopy {
  const band = getSimdBand(decile)
  if (band === 'simd20') {
    return {
      headline:
        'Based on your postcode, you live in one of the most disadvantaged areas in Scotland. Many universities offer lower entry requirements and extra support for students from your area.',
      footnote: `SIMD decile ${decile} -- most deprived 20%`,
    }
  }
  if (band === 'simd40') {
    return {
      headline:
        'Based on your postcode, you may qualify for adjusted entry requirements at some Scottish universities. This is called widening access -- it means universities take your circumstances into account.',
      footnote: `SIMD decile ${decile} -- most deprived 40%`,
    }
  }
  return {
    headline:
      'Based on your postcode, standard entry requirements apply. You can still access bursaries, scholarships, and support -- explore your options below.',
    footnote: `SIMD decile ${decile}`,
  }
}

export function getSimdLine2Copy(
  decile: number,
  simd20Count: number,
  simd40Count: number,
): string {
  const band = getSimdBand(decile)
  if (band === 'simd20') {
    return `${simd20Count} widening access courses available for your area`
  }
  if (band === 'simd40') {
    return `${simd40Count} widening access courses may offer adjusted entry at SIMD40 level`
  }
  return `Widening access by postcode doesn't apply here - sign up and tell us about your circumstances to see which WA routes fit`
}
