import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { aggregateResponses, flagFreeText, SHANARRI_INDICATORS } from '@/lib/school/shanarri'

export const runtime = 'nodejs'

// GET /api/school/guidance/wellbeing/surveys/[id]
// Returns the survey's aggregated SHANARRI scores + flagged / named
// responses (anonymous surveys NEVER return student attribution, even
// for staff viewing as admin).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: survey } = await (admin as any)
    .from('wellbeing_surveys')
    .select('id, school_id, name, target_year_groups, opens_at, closes_at, is_anonymous')
    .eq('id', id)
    .maybeSingle()

  if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (survey.school_id !== ctx.schoolId) return NextResponse.json({ error: 'Cross-school access denied' }, { status: 403 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: responses } = await (admin as any)
    .from('wellbeing_responses')
    .select('id, student_id, safe_score, healthy_score, achieving_score, nurtured_score, active_score, respected_score, responsible_score, included_score, free_text, submitted_at, students:student_id(first_name, last_name, school_stage)')
    .eq('survey_id', id)
    .order('submitted_at', { ascending: false })

  type ResponseRow = {
    id: string
    student_id: string | null
    safe_score: number | null
    healthy_score: number | null
    achieving_score: number | null
    nurtured_score: number | null
    active_score: number | null
    respected_score: number | null
    responsible_score: number | null
    included_score: number | null
    free_text: string | null
    submitted_at: string
    students: { first_name: string | null; last_name: string | null; school_stage: string | null } | null
  }
  const rows = (responses ?? []) as ResponseRow[]

  const aggregates = aggregateResponses(rows as Array<Record<string, unknown>>)

  // Flag any free-text that matches safeguarding keywords.
  const freeTextFlags = rows.filter((r) => flagFreeText(r.free_text)).map((r) => ({
    id: r.id,
    text: r.free_text,
    // Attribution depends on anonymity.
    student: survey.is_anonymous
      ? null
      : r.students
        ? { name: `${r.students.first_name ?? ''} ${r.students.last_name ?? ''}`.trim(), stage: r.students.school_stage }
        : null,
  }))

  // Low-score attention list (any 1 or 2 across indicators). Only for
  // named surveys; anonymous surveys return a count only.
  const lowScoreAttention = survey.is_anonymous
    ? { count: rows.filter((r) => SHANARRI_INDICATORS.some((ind) => {
        const v = r[ind.column as keyof ResponseRow]
        return typeof v === 'number' && v <= 2
      })).length, students: null as null | Array<{ id: string; name: string; lowIndicators: string[] }> }
    : {
        count: 0,
        students: (() => {
          const out: Array<{ id: string; name: string; lowIndicators: string[] }> = []
          for (const r of rows) {
            const lowInd: string[] = []
            for (const ind of SHANARRI_INDICATORS) {
              const v = r[ind.column as keyof ResponseRow]
              if (typeof v === 'number' && v <= 2) lowInd.push(ind.label)
            }
            if (lowInd.length > 0 && r.student_id) {
              out.push({
                id: r.student_id,
                name: r.students ? `${r.students.first_name ?? ''} ${r.students.last_name ?? ''}`.trim() : 'Unknown',
                lowIndicators: lowInd,
              })
            }
          }
          return out
        })(),
      }
  if (lowScoreAttention.students) lowScoreAttention.count = lowScoreAttention.students.length

  // Invited-student count (those matching the target year groups).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: invitedCount } = await (admin as any)
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', ctx.schoolId)
    .in('school_stage', survey.target_year_groups ?? [])

  return NextResponse.json({
    survey,
    aggregates,
    responseCount: rows.length,
    invitedCount: invitedCount ?? 0,
    responseRatePct: invitedCount && invitedCount > 0 ? Math.round((rows.length / invitedCount) * 100) : null,
    freeTextFlags,
    lowScoreAttention,
    // For anonymous surveys we expose free-text (no attribution) and
    // aggregate distributions only. Never individual score rows.
    responses: survey.is_anonymous
      ? null
      : rows.map((r) => ({
          id: r.id,
          studentId: r.student_id,
          studentName: r.students ? `${r.students.first_name ?? ''} ${r.students.last_name ?? ''}`.trim() : 'Unknown',
          stage: r.students?.school_stage ?? null,
          scores: {
            safe: r.safe_score,
            healthy: r.healthy_score,
            achieving: r.achieving_score,
            nurtured: r.nurtured_score,
            active: r.active_score,
            respected: r.respected_score,
            responsible: r.responsible_score,
            included: r.included_score,
          },
          freeText: r.free_text,
          submittedAt: r.submitted_at,
        })),
  })
}
