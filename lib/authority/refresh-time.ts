/**
 * Reads the most recent successful pg_cron run time for either of the
 * authority materialised view refresh jobs. Falls back to null if pg_cron
 * is unavailable or no successful runs have been recorded yet.
 *
 * The function is best-effort: a missing schema (e.g. cron not installed
 * locally) must not crash the dashboard. Errors are swallowed and null is
 * returned so the header just shows "—" in that case.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = any

export async function getLastMaterialisedViewRefresh(
  admin: AdminClient,
): Promise<Date | null> {
  try {
    const { data, error } = await admin.rpc('get_last_authority_mv_refresh')
    if (error) return null
    if (!data) return null
    if (typeof data === 'string') {
      const d = new Date(data)
      return Number.isNaN(d.getTime()) ? null : d
    }
    return null
  } catch {
    return null
  }
}
