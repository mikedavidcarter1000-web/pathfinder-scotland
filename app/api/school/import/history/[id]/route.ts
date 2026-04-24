import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const kind = new URL(_req.url).searchParams.get('kind') ?? 'seemis'
  const table = kind === 'sqa' ? 'sqa_results_imports' : 'seemis_imports'

  // Verify ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any).from(table).select('id, school_id').eq('id', id).maybeSingle()
  if (!data || data.school_id !== ctx.schoolId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from(table).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, note: 'Audit row deleted. Imported data is retained; full rollback is a Phase-2 feature.' })
}
