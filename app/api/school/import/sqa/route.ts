import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { parseUploaded, currentAcademicYear } from '@/lib/school/import-parsing'
import { runSqaImport } from '@/lib/school/import'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const gate = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!gate.ok) return gate.response
  const { admin, ctx } = gate

  const form = await req.formData()
  const file = form.get('file')
  const mapRaw = String(form.get('map') ?? '{}')
  const academicYear = String(form.get('academic_year') ?? currentAcademicYear())
  if (!(file instanceof File)) return NextResponse.json({ error: 'file required' }, { status: 400 })
  let map: Record<string, string | null> = {}
  try { map = JSON.parse(mapRaw) } catch { return NextResponse.json({ error: 'invalid map JSON' }, { status: 400 }) }

  const parsed = await parseUploaded(file)
  const result = await runSqaImport(admin, {
    headers: parsed.headers,
    rows: parsed.rows,
    map,
    schoolId: ctx.schoolId,
    staffId: ctx.staffId,
    fileName: file.name ?? 'upload',
    academicYear,
  })
  return NextResponse.json(result)
}
