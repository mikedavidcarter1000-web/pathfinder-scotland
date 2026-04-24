import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { autoGenerateEvidenceFor, AUTO_GEN_SUPPORTED } from '@/lib/school/inspection-autogen'

export async function POST(req: Request) {
  const auth = await requireSchoolStaffApi()
  if (!auth.ok) return auth.response
  const { ctx, admin } = auth
  if (!ctx.isAdmin && ctx.role !== 'depute' && ctx.role !== 'head_teacher') {
    return NextResponse.json({ error: 'Auto-generate is leadership-only' }, { status: 403 })
  }
  const body = await req.json().catch(() => null)
  const code = body?.indicator_code
  if (!code || !AUTO_GEN_SUPPORTED.has(code)) {
    return NextResponse.json({ error: 'indicator_code must be one of ' + Array.from(AUTO_GEN_SUPPORTED).join(', ') }, { status: 400 })
  }

  const generated = await autoGenerateEvidenceFor(admin, ctx.schoolId, code)

  // Resolve indicator_id for the code.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: indicator } = await (admin as any).from('inspection_indicators')
    .select('id').eq('framework_name', 'HGIOS4').eq('indicator_code', code).maybeSingle()
  if (!indicator) return NextResponse.json({ error: 'indicator not found' }, { status: 404 })

  const year = new Date().getFullYear().toString()
  // Insert every generated statement.
  const rows = generated.map((g) => ({
    school_id: ctx.schoolId,
    indicator_id: indicator.id,
    evidence_type: g.evidence_type,
    title: g.title,
    description: g.description,
    source: g.source,
    data_snapshot: g.data_snapshot,
    academic_year: year,
  }))
  if (rows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('inspection_evidence').insert(rows)
  }

  return NextResponse.json({ generated: rows.length, items: generated })
}
