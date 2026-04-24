import { NextResponse } from 'next/server'
import { requireStudentApi } from '@/lib/school/student-auth'

export const runtime = 'nodejs'

// GET /api/student/choices/available -- rounds the student can submit to.
export async function GET() {
  const guard = await requireStudentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (ctx.schoolIds.length === 0) {
    return NextResponse.json({ rounds: [] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rounds } = await (admin as any)
    .from('choice_rounds')
    .select('*, schools(name, slug)')
    .in('school_id', ctx.schoolIds)
    .in('status', ['open', 'closed', 'finalised'])
    .order('status', { ascending: true })
    .order('closes_at', { ascending: true })

  // Student's existing submissions.
  const roundIds = (rounds ?? []).map((r: { id: string }) => r.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = roundIds.length > 0
    ? await (admin as any)
        .from('student_choices')
        .select('round_id, status, submitted_at, parent_approved_at, parent_rejected_at')
        .eq('student_id', ctx.userId)
        .in('round_id', roundIds)
    : { data: [] }

  const subByRound = new Map<string, { status: string; submitted_at: string | null; parent_approved_at: string | null; parent_rejected_at: string | null }>()
  for (const s of subs ?? []) {
    subByRound.set(s.round_id, s)
  }

  const enriched = (rounds ?? []).map((r: { id: string }) => ({
    ...r,
    my_submission: subByRound.get(r.id) ?? null,
  }))

  return NextResponse.json({ rounds: enriched })
}
