import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { getSimdGap, getCesCapacities } from '@/lib/school/analytics'

export async function GET(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  const { searchParams } = new URL(req.url)
  const academicYear = searchParams.get('academic_year') ?? new Date().getFullYear().toString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any).from('curriculum_rationale').select('*').eq('school_id', ctx.schoolId).eq('academic_year', academicYear).maybeSingle()
  if (existing) return NextResponse.json({ rationale: existing, auto: false })

  // Auto-generate a draft.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any).from('schools').select('name, local_authority, subjects_offered, roll_count').eq('id', ctx.schoolId).maybeSingle()
  const simd = await getSimdGap(admin, ctx.schoolId)
  const q12Students = simd.filter((r) => r.simd_quintile <= 2).reduce((a, b) => a + b.student_count, 0)
  const total = simd.reduce((a, b) => a + b.student_count, 0)
  const q12Pct = total > 0 ? Math.round((q12Students / total) * 1000) / 10 : 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rounds } = await (admin as any).from('choice_rounds').select('id').eq('school_id', ctx.schoolId)
  const roundIds = (rounds ?? []).map((r: { id: string }) => r.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: columnsCount } = roundIds.length
    ? await (admin as any).from('choice_round_columns').select('id', { count: 'exact', head: true }).in('round_id', roundIds)
    : { count: 0 }

  // Top 5 saved-course subject areas (proxy for career-sector interest).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any).from('school_student_links').select('student_id').eq('school_id', ctx.schoolId)
  const ids = (links ?? []).map((l: { student_id: string }) => l.student_id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: saved } = ids.length ? await (admin as any).from('saved_courses').select('course_id').in('student_id', ids) : { data: [] }
  const courseIds = Array.from(new Set((saved ?? []).map((s: { course_id: string }) => s.course_id)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: courses } = courseIds.length ? await (admin as any).from('courses').select('id, subject_area').in('id', courseIds) : { data: [] }
  const sectorCounts = new Map<string, number>()
  for (const c of courses ?? []) {
    if (c.subject_area) sectorCounts.set(c.subject_area, (sectorCounts.get(c.subject_area) ?? 0) + 1)
  }
  const topSectors = Array.from(sectorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name)

  const ces = await getCesCapacities(admin, ctx.schoolId)

  const rationaleData = {
    school_context: `${school?.name ?? 'This school'} serves approximately ${school?.roll_count ?? 'an unreported number of'} students${total > 0 ? ` across S1-S6 tracking cohorts (${total} linked to Pathfinder)` : ''}. ${q12Pct}% of our Pathfinder cohort are from SIMD Q1-Q2 areas. The school is located in ${school?.local_authority ?? 'its local authority'}.`,
    subject_offer: `We offer ${school?.subjects_offered?.length ?? 0} subjects across ${columnsCount ?? 0} choice columns in the senior phase across ${rounds?.length ?? 0} choice-round configurations.`,
    labour_market: `Our subject offer connects to the 19 career sectors in the Pathfinder database. ${topSectors.length > 0 ? `The top career sectors of interest among our pupils are: ${topSectors.join(', ')}.` : 'Pupil career-sector interest data will populate as students save courses.'} Scotland's fastest-growing sectors include health and social care, digital technology, and green energy.`,
    destinations: 'Positive-destination data will populate from alumni tracking once the first cohort graduates through Pathfinder.',
    widening_access: `${q12Pct}% of our Pathfinder cohort are eligible for widening-access programmes.`,
    rationale_statement: 'Our curriculum is designed to provide broad choice while ensuring all pupils can access pathways to positive destinations. We prioritise [edit to describe local priorities].',
    ces_snapshot: { self: ces.self.score, strengths: ces.strengths.score, horizons: ces.horizons.score, networks: ces.networks.score },
  }

  return NextResponse.json({ rationale: null, auto: true, draft: { academic_year: academicYear, rationale_data: rationaleData } })
}

export async function PUT(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Curriculum rationale is leadership-only' }, { status: 403 })
  }
  const body = await req.json().catch(() => null)
  if (!body || !body.academic_year || !body.rationale_data) {
    return NextResponse.json({ error: 'academic_year and rationale_data required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any).from('curriculum_rationale').upsert({
    school_id: ctx.schoolId,
    academic_year: body.academic_year,
    rationale_data: body.rationale_data,
    vision_statement: body.vision_statement ?? null,
    local_context: body.local_context ?? null,
    published_at: body.publish ? new Date().toISOString() : null,
  }, { onConflict: 'school_id,academic_year' }).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ rationale: data })
}
