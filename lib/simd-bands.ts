export type SimdBand = 'simd20' | 'simd40' | 'outside'

export function getSimdBand(decile: number): SimdBand {
  if (decile <= 2) return 'simd20'
  if (decile <= 4) return 'simd40'
  return 'outside'
}

export function getSimdLine1Copy(decile: number): string {
  const band = getSimdBand(decile)
  if (band === 'simd20') {
    return `You live in a SIMD ${decile} area. This is in the most-deprived 20% (SIMD20), which unlocks adjusted entry requirements at all 18 Scottish universities.`
  }
  if (band === 'simd40') {
    return `You live in a SIMD ${decile} area. This is in the most-deprived 40% (SIMD40), and some Scottish universities offer adjusted entry requirements at this band.`
  }
  return `You live in a SIMD ${decile} area. This is outside the standard postcode-based widening access bands, but you may still qualify through other routes - care experience, young carer status, estranged student, first in your family to attend university, and others.`
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
