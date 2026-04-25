import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/admin-auth'
import { authoriseCron } from '@/lib/authority/cron-auth'
import { sendDigestsForAllAuthorities } from '@/lib/authority/alert-digest'
import type { DigestFrequency } from '@/lib/authority/alerts'

export const runtime = 'nodejs'
export const maxDuration = 300

const VALID_FREQUENCIES: DigestFrequency[] = ['daily', 'weekly']

export async function POST(req: Request) {
  if (!authoriseCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const periodParam = url.searchParams.get('period') ?? 'weekly'
  if (!VALID_FREQUENCIES.includes(periodParam as DigestFrequency)) {
    return NextResponse.json({ error: 'period must be daily or weekly' }, { status: 400 })
  }
  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })
  }
  const results = await sendDigestsForAllAuthorities(admin, periodParam as DigestFrequency)
  const summary = {
    period: periodParam,
    authorities: results.length,
    sent: results.reduce((acc, r) => acc + r.sent, 0),
    failed: results.reduce((acc, r) => acc + r.failed, 0),
    skipped: results.filter((r) => r.skipped_reason).length,
  }
  return NextResponse.json({ ok: true, ...summary, results })
}
