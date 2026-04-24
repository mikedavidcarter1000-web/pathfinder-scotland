import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function GET() {
  const gate = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const { data: seemis } = await (admin as any)
    .from('seemis_imports')
    .select('id, import_type, imported_by, file_name, row_count, matched_count, created_count, skipped_count, error_count, errors, warnings, notes, imported_at, school_staff:imported_by(full_name)')
    .eq('school_id', ctx.schoolId)
    .order('imported_at', { ascending: false })
    .limit(100)

  const { data: sqa } = await (admin as any)
    .from('sqa_results_imports')
    .select('id, academic_year, imported_by, file_name, row_count, matched_count, unmatched_count, unmatched_details, imported_at, notes, school_staff:imported_by(full_name)')
    .eq('school_id', ctx.schoolId)
    .order('imported_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ seemis: seemis ?? [], sqa: sqa ?? [] })
}
