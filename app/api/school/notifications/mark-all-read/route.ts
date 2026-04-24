import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { fetchRelevantNotifications } from '@/lib/school/notifications'

export const runtime = 'nodejs'

// POST /api/school/notifications/mark-all-read
// Stamps the current staff user id into read_by for every relevant
// notification at this school that does not already contain it.
export async function POST() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const rows = await fetchRelevantNotifications(admin, {
    schoolId: ctx.schoolId,
    audience: 'staff',
    staffId: ctx.staffId,
    staffRole: ctx.role,
    limit: 500,
  })
  const targets = rows.filter((r) => !r.read_by.includes(ctx.userId))
  if (targets.length === 0) return NextResponse.json({ ok: true, updated: 0 })

  let updated = 0
  for (const r of targets) {
    const next = [...(r.read_by ?? []), ctx.userId]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from('school_notifications')
      .update({ read_by: next })
      .eq('id', r.id)
    if (!error) updated += 1
  }
  return NextResponse.json({ ok: true, updated })
}
