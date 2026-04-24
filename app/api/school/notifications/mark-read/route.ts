import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { markAsRead } from '@/lib/school/notifications'

export const runtime = 'nodejs'

// POST /api/school/notifications/mark-read
// Body: { notification_id: string }
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as { notification_id?: unknown } | null
  const id = typeof body?.notification_id === 'string' ? body.notification_id : ''
  if (!id) return NextResponse.json({ error: 'notification_id required' }, { status: 400 })

  // Ensure the notification belongs to this staff member's school.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (admin as any)
    .from('school_notifications')
    .select('id, school_id')
    .eq('id', id)
    .maybeSingle()
  if (!row || row.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const result = await markAsRead(admin, id, ctx.userId)
  return NextResponse.json({ ok: result.ok })
}
