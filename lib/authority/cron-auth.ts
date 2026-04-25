// Authority-13: shared cron caller authentication.
//
// Cron invokers (Vercel cron, external scheduler, manual trigger) must
// present `Authorization: Bearer ${CRON_SECRET}`. In production, missing
// CRON_SECRET hard-fails. In development, an unset secret allows local
// testing without setup overhead.

export function authoriseCron(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[authority/alerts] CRON_SECRET not set in production -- request blocked')
      return false
    }
    return true
  }
  const header = request.headers.get('authorization')
  if (!header) return false
  const expected = `Bearer ${cronSecret}`
  if (header.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < header.length; i++) {
    mismatch |= header.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return mismatch === 0
}
