import { NextResponse } from 'next/server'
import { requireStudentApi } from '@/lib/school/student-auth'
import { computeConsequences } from '@/lib/school/choice-consequences'

export const runtime = 'nodejs'

// POST /api/student/choices/[roundId]/consequences
// Body: { subject_ids: string[] }
// Returns course fit + sector coverage for the proposed subject set.
export async function POST(req: Request, { params }: { params: Promise<{ roundId: string }> }) {
  await params
  const guard = await requireStudentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => ({}))) as { subject_ids?: unknown }
  const raw = Array.isArray(body.subject_ids) ? body.subject_ids : []
  const subjectIds = raw.filter((v): v is string => typeof v === 'string')

  const result = await computeConsequences(admin, ctx.userId, subjectIds)
  return NextResponse.json(result)
}
