/**
 * Statistical disclosure control utilities for the LA portal.
 *
 * Cohorts smaller than the threshold are suppressed to prevent
 * re-identification of individual students. Default threshold of 5
 * matches Scottish Government statistical disclosure guidance and the
 * architecture spec (sections 2b and 6b).
 */

export const DEFAULT_SUPPRESSION_THRESHOLD = 5

/** Returned for any cohort below the suppression threshold. */
export const SUPPRESSED_LABEL = '< 5'

/**
 * Returns the value if it meets or exceeds the threshold; otherwise null.
 * Use null in computations and SUPPRESSED_LABEL in display.
 */
export function suppressSmallCohorts(
  value: number | null | undefined,
  threshold: number = DEFAULT_SUPPRESSION_THRESHOLD,
): number | null {
  if (value == null) return null
  if (!Number.isFinite(value)) return null
  if (value < threshold) return null
  return value
}

/**
 * Returns the human-readable string for a cohort count: SUPPRESSED_LABEL when
 * below threshold, otherwise the locale-formatted number.
 */
export function formatCohortValue(
  value: number | null | undefined,
  threshold: number = DEFAULT_SUPPRESSION_THRESHOLD,
): string {
  const suppressed = suppressSmallCohorts(value, threshold)
  if (suppressed == null) return SUPPRESSED_LABEL
  return suppressed.toLocaleString('en-GB')
}

/**
 * Filters or masks rows of an array based on a numeric "count" field.
 * - mode 'drop': removes rows where the count is below threshold (default).
 * - mode 'mask': retains rows but replaces the count with null.
 *
 * Use 'drop' for chart data where suppressed rows should not be plotted.
 * Use 'mask' for tabular displays where the row label still has meaning
 * but the cohort size cannot be disclosed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyDisclosureToArray<T extends Record<string, any>>(
  rows: T[],
  countField: keyof T,
  threshold: number = DEFAULT_SUPPRESSION_THRESHOLD,
  mode: 'drop' | 'mask' = 'drop',
): T[] {
  if (!Array.isArray(rows)) return []
  if (mode === 'drop') {
    return rows.filter((r) => {
      const v = r[countField]
      return typeof v === 'number' && Number.isFinite(v) && v >= threshold
    })
  }
  return rows.map((r) => {
    const v = r[countField]
    if (typeof v !== 'number' || !Number.isFinite(v) || v < threshold) {
      return { ...r, [countField]: null } as T
    }
    return r
  })
}
