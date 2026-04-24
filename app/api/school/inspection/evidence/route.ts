import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

const VALID_TYPES = new Set(['quantitative', 'qualitative', 'observation', 'stakeholder_voice', 'document'])

export async function GET(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  const { searchParams } = new URL(req.url)
  const year = searchParams.get('academic_year')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (admin as any).from('inspection_evidence').select('*').eq('school_id', ctx.schoolId)
  if (year) q = q.eq('academic_year', year)
  const { data: evidence } = await q.order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: indicators } = await (admin as any)
    .from('inspection_indicators').select('id, indicator_code, indicator_name, category')
    .eq('framework_name', 'HGIOS4')
    .order('indicator_code', { ascending: true })

  return NextResponse.json({ evidence: evidence ?? [], indicators: indicators ?? [] })
}

export async function POST(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  const body = await req.json().catch(() => null)
  if (!body || !body.evidence_type || !body.title || !body.description) {
    return NextResponse.json({ error: 'evidence_type, title, description required' }, { status: 400 })
  }
  if (!VALID_TYPES.has(body.evidence_type)) return NextResponse.json({ error: 'invalid evidence_type' }, { status: 400 })

  // Resolve indicator_id: accept either indicator_id (UUID) or indicator_code (e.g. "2.4").
  let indicatorId: string | null = body.indicator_id ?? null
  if (!indicatorId && body.indicator_code) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ind } = await (admin as any)
      .from('inspection_indicators')
      .select('id')
      .eq('framework_name', 'HGIOS4')
      .eq('indicator_code', body.indicator_code)
      .maybeSingle()
    indicatorId = ind?.id ?? null
  }

  const academicYear = body.academic_year ?? new Date().getFullYear().toString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any).from('inspection_evidence').insert({
    school_id: ctx.schoolId,
    indicator_id: indicatorId,
    evidence_type: body.evidence_type,
    title: body.title,
    description: body.description,
    data_snapshot: body.data_snapshot ?? null,
    source: body.source ?? null,
    academic_year: academicYear,
  }).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ evidence: data })
}
