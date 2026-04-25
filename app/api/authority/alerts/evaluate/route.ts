import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/admin-auth'
import { authoriseCron } from '@/lib/authority/cron-auth'
import { evaluateAlertsForAllVerifiedAuthorities } from '@/lib/authority/alert-engine'

export const runtime = 'nodejs'
// Generous timeout for the bulk evaluation; the runner serialises per
// authority but parallelises evaluators inside each authority.
export const maxDuration = 300

export async function POST(req: Request) {
  if (!authoriseCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })
  }
  const results = await evaluateAlertsForAllVerifiedAuthorities(admin)
  const summary = {
    authorities: results.length,
    inserted: results.reduce((acc, r) => acc + r.inserted, 0),
    skipped_dedup: results.reduce((acc, r) => acc + r.skipped_dedup, 0),
    skipped_quiet_period: results.filter((r) => r.skipped_quiet_period).length,
    nudges_sent: results.reduce((acc, r) => acc + r.nudges_sent, 0),
    errors: results.flatMap((r) => r.errors),
  }
  return NextResponse.json({ ok: true, ...summary, results })
}
