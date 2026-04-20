// Postcode validation utilities shared by the homepage teaser and the
// onboarding location step. See docs/session-learnings.md (2026-04-26 entry)
// for context: the simd_postcodes seed is incomplete, so we need a fallback
// path that distinguishes real-but-unseeded Scottish postcodes from genuinely
// invalid input.

const UK_POSTCODE_REGEX =
  /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/

const POSTCODES_IO_TIMEOUT_MS = 3000

export function isValidUkPostcodeFormat(input: string): boolean {
  if (!input) return false
  // Collapse any internal whitespace to a single space so "  eh11   4bn  "
  // is accepted equivalently to "EH11 4BN".
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, ' ')
  if (cleaned.length < 5 || cleaned.length > 8) return false
  return UK_POSTCODE_REGEX.test(cleaned)
}

// Returns the canonical spaced form, e.g. "eh114bn" -> "EH11 4BN".
// UK postcodes always end in 3 inward characters (digit + two letters).
export function normalisePostcode(input: string): string {
  const cleaned = (input ?? '').trim().toUpperCase().replace(/\s+/g, '')
  if (cleaned.length < 5) return cleaned
  return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`
}

// DB-lookup form: uppercase, no spaces (matches simd_postcodes storage).
export function stripPostcode(input: string): string {
  return (input ?? '').trim().toUpperCase().replace(/\s+/g, '')
}

export interface PostcodeExistsResult {
  exists: boolean
  scottish: boolean
}

export async function checkPostcodeExists(
  normalised: string,
): Promise<PostcodeExistsResult> {
  const encoded = encodeURIComponent(normalised)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), POSTCODES_IO_TIMEOUT_MS)

  try {
    const detailRes = await fetch(
      `https://api.postcodes.io/postcodes/${encoded}`,
      { signal: controller.signal, cache: 'no-store' },
    )

    if (detailRes.status === 404) {
      return { exists: false, scottish: false }
    }

    if (!detailRes.ok) {
      // Unknown upstream state -- fail closed (treat as not found) but log.
      console.warn(
        `[postcode-validation] postcodes.io unexpected status ${detailRes.status} for ${normalised}`,
      )
      return { exists: false, scottish: false }
    }

    const body = (await detailRes.json()) as {
      result?: { country?: string | null }
    }

    const country = body.result?.country ?? ''
    return { exists: true, scottish: country === 'Scotland' }
  } catch (err) {
    console.warn(
      `[postcode-validation] postcodes.io fetch failed for ${normalised}:`,
      err instanceof Error ? err.message : err,
    )
    return { exists: false, scottish: false }
  } finally {
    clearTimeout(timer)
  }
}
