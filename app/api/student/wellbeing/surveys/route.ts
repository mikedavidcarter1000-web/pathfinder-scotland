import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// GET /api/student/wellbeing/surveys
// Returns surveys open to the current student + whether they've already
// responded (so the dashboard banner can hide once they submit).
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, school_id, school_stage')
    .eq('id', user.id)
    .maybeSingle()
  if (!student || !student.school_id) return NextResponse.json({ surveys: [] })

  const now = new Date().toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: surveys } = await (admin as any)
    .from('wellbeing_surveys')
    .select('id, name, target_year_groups, opens_at, closes_at, is_anonymous')
    .eq('school_id', student.school_id)
    .or(`opens_at.is.null,opens_at.lte.${now}`)
    .or(`closes_at.is.null,closes_at.gte.${now}`)

  const matching = ((surveys ?? []) as Array<{
    id: string
    target_year_groups: string[] | null
  }>).filter((s) => {
    if (!s.target_year_groups || s.target_year_groups.length === 0) return true
    return student.school_stage && s.target_year_groups.includes(student.school_stage)
  })

  const ids = matching.map((s) => s.id)
  const submitted = new Set<string>()
  if (ids.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mine } = await (admin as any)
      .from('wellbeing_responses')
      .select('survey_id')
      .eq('student_id', student.id)
      .in('survey_id', ids)
    for (const r of (mine ?? []) as Array<{ survey_id: string }>) submitted.add(r.survey_id)
  }

  return NextResponse.json({
    surveys: matching.map((s) => ({ ...s, alreadySubmitted: submitted.has(s.id) })),
  })
}
