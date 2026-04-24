import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/guidance/safeguarding/[id]
// Fetches a single concern with full detail + access-log trail. Every
// viewing is itself logged to safeguarding_access_log -- PostgreSQL does
// not support SELECT triggers, so the logging lives here in the API.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const guard = await requireSchoolStaffApi({ mustViewSafeguarding: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: concern } = await (admin as any)
    .from('safeguarding_concerns')
    .select('id, school_id, student_id, concern_type, description, immediate_actions_taken, escalation_level, escalated_to, escalated_at, outcome, resolved_at, created_at, supersedes_id, reported_by, students:student_id(first_name, last_name, school_stage, registration_class), reporter:reported_by(full_name, role), escalated_to_staff:escalated_to(full_name, role)')
    .eq('id', id)
    .maybeSingle()

  if (!concern) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (concern.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Cross-school access denied' }, { status: 403 })
  }

  // Log the view.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('safeguarding_access_log').insert({
    concern_id: id,
    accessed_by: ctx.staffId,
    action: 'viewed',
  })

  // Fetch the access-log trail for the audit panel.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: log } = await (admin as any)
    .from('safeguarding_access_log')
    .select('id, accessed_by, action, accessed_at, school_staff:accessed_by(full_name, role)')
    .eq('concern_id', id)
    .order('accessed_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ concern, access_log: log ?? [] })
}
