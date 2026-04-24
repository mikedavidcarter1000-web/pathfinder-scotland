import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

const GUIDANCE_ROLES = new Set(['guidance_teacher', 'pt_guidance', 'depute', 'head_teacher'])

// GET /api/school/guidance/wellbeing/surveys
// Lists surveys + aggregate response counts for the caller's school.
export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: surveys } = await (admin as any)
    .from('wellbeing_surveys')
    .select('id, name, target_year_groups, opens_at, closes_at, is_anonymous, created_at')
    .eq('school_id', ctx.schoolId)
    .order('created_at', { ascending: false })

  const surveyIds = ((surveys ?? []) as Array<{ id: string }>).map((s) => s.id)

  const countBySurvey = new Map<string, number>()
  if (surveyIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: responses } = await (admin as any)
      .from('wellbeing_responses')
      .select('survey_id')
      .in('survey_id', surveyIds)
    for (const r of (responses ?? []) as Array<{ survey_id: string }>) {
      countBySurvey.set(r.survey_id, (countBySurvey.get(r.survey_id) ?? 0) + 1)
    }
  }

  const now = new Date()
  const enriched = ((surveys ?? []) as Array<{
    id: string
    name: string
    target_year_groups: string[] | null
    opens_at: string | null
    closes_at: string | null
    is_anonymous: boolean | null
    created_at: string
  }>).map((s) => {
    const status = !s.opens_at
      ? 'draft'
      : new Date(s.opens_at) > now
        ? 'scheduled'
        : s.closes_at && new Date(s.closes_at) < now
          ? 'closed'
          : 'open'
    return {
      ...s,
      status,
      responseCount: countBySurvey.get(s.id) ?? 0,
    }
  })

  return NextResponse.json({ surveys: enriched })
}

// POST /api/school/guidance/wellbeing/surveys
// Creates a survey.
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  if (!GUIDANCE_ROLES.has(ctx.role) && !ctx.isAdmin && !ctx.canManageTracking) {
    return NextResponse.json({ error: 'Only guidance staff / leadership can create surveys.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const target = Array.isArray(body.target_year_groups) ? body.target_year_groups : []
  const opensAt = typeof body.opens_at === 'string' && body.opens_at ? body.opens_at : null
  const closesAt = typeof body.closes_at === 'string' && body.closes_at ? body.closes_at : null
  const isAnonymous = body.is_anonymous === true

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  if (target.length === 0) return NextResponse.json({ error: 'At least one target year group required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error } = await (admin as any)
    .from('wellbeing_surveys')
    .insert({
      school_id: ctx.schoolId,
      name,
      target_year_groups: target,
      opens_at: opensAt,
      closes_at: closesAt,
      is_anonymous: isAnonymous,
      created_by: ctx.staffId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[guidance/wellbeing POST] insert failed:', error)
    return NextResponse.json({ error: 'Could not create survey.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, id: inserted?.id })
}
