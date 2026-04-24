import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

const EXAM_ACCESS_TYPES = new Set(['exam_access', 'reader', 'scribe', 'extra_time', 'separate_room'])

export async function GET() {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  // Analytics leadership view required.
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Analytics is leadership-only' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: provisions } = await (admin as any)
    .from('asn_provisions')
    .select('id, student_id, provision_type, is_active, review_date')
    .eq('school_id', ctx.schoolId)
    .eq('is_active', true)
  const rows = provisions ?? []
  const byType = new Map<string, number>()
  let examAccess = 0
  let overdue = 0
  const today = new Date().toISOString().split('T')[0]
  for (const r of rows) {
    byType.set(r.provision_type, (byType.get(r.provision_type) ?? 0) + 1)
    if (EXAM_ACCESS_TYPES.has(r.provision_type)) examAccess += 1
    if (r.review_date && r.review_date <= today) overdue += 1
  }
  const byTypeArr = Array.from(byType.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count)
  return NextResponse.json({
    active_total: rows.length,
    by_type: byTypeArr,
    overdue,
    exam_access_count: examAccess,
  })
}
