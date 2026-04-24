import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// POST /api/student/wellbeing/responses
// Body: { survey_id, scores: { safe, healthy, achieving, nurtured, active,
//         respected, responsible, included }, free_text? }
// Writes a wellbeing_responses row. For anonymous surveys student_id is
// set NULL so no direct attribution is stored in the row; the unique
// (survey_id, student_id) constraint can't apply because anonymous rows
// all have NULL student_id (PostgreSQL treats NULLs as distinct).
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const surveyId = typeof body.survey_id === 'string' ? body.survey_id : ''
  if (!surveyId) return NextResponse.json({ error: 'survey_id required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, school_id, school_stage')
    .eq('id', user.id)
    .maybeSingle()
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: survey } = await (admin as any)
    .from('wellbeing_surveys')
    .select('id, school_id, opens_at, closes_at, is_anonymous, target_year_groups')
    .eq('id', surveyId)
    .maybeSingle()
  if (!survey) return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
  if (survey.school_id !== student.school_id) {
    return NextResponse.json({ error: 'Survey is not for your school' }, { status: 403 })
  }

  const now = new Date()
  if (survey.opens_at && new Date(survey.opens_at) > now) {
    return NextResponse.json({ error: 'Survey has not opened yet' }, { status: 400 })
  }
  if (survey.closes_at && new Date(survey.closes_at) < now) {
    return NextResponse.json({ error: 'Survey has closed' }, { status: 400 })
  }

  const stages = survey.target_year_groups ?? []
  if (stages.length > 0 && (!student.school_stage || !stages.includes(student.school_stage))) {
    return NextResponse.json({ error: 'Survey is not for your year group' }, { status: 403 })
  }

  const scores = typeof body.scores === 'object' && body.scores ? (body.scores as Record<string, unknown>) : {}
  const pick = (key: string): number | null => {
    const v = scores[key]
    if (typeof v === 'number' && v >= 1 && v <= 5) return v
    return null
  }

  // For named surveys we de-dup by (survey_id, student_id); anonymous
  // surveys use null student_id so multiple submits are allowed -- but
  // we still rate-limit to one per session by checking the audit if
  // client state isn't trustworthy. Keep simple for now.
  if (!survey.is_anonymous) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (admin as any)
      .from('wellbeing_responses')
      .select('id')
      .eq('survey_id', surveyId)
      .eq('student_id', student.id)
      .maybeSingle()
    if (existing) return NextResponse.json({ error: 'You have already responded to this survey' }, { status: 409 })
  }

  const freeText = typeof body.free_text === 'string' ? body.free_text.slice(0, 500) : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('wellbeing_responses')
    .insert({
      survey_id: surveyId,
      student_id: survey.is_anonymous ? null : student.id,
      safe_score: pick('safe'),
      healthy_score: pick('healthy'),
      achieving_score: pick('achieving'),
      nurtured_score: pick('nurtured'),
      active_score: pick('active'),
      respected_score: pick('respected'),
      responsible_score: pick('responsible'),
      included_score: pick('included'),
      free_text: freeText,
    })

  if (error) {
    console.error('[student/wellbeing POST] insert failed:', error)
    return NextResponse.json({ error: 'Could not submit response.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
