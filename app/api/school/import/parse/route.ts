import { NextResponse, type NextRequest } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { parseUploaded } from '@/lib/school/import-parsing'
import {
  autoMapAttendance, autoMapClassList, autoMapDestinations,
  autoMapPupils, autoMapSqa, autoMapTransition, autoMapDemographics,
} from '@/lib/school/import'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const gate = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!gate.ok) return gate.response

  const form = await req.formData()
  const file = form.get('file')
  const kind = String(form.get('kind') ?? '')
  if (!(file instanceof File)) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max file size is 5MB' }, { status: 400 })

  const parsed = await parseUploaded(file)
  if (parsed.headers.length === 0) return NextResponse.json({ error: 'Empty file' }, { status: 400 })

  let autoMap: Record<string, string | null> = {}
  switch (kind) {
    case 'pupils': autoMap = autoMapPupils(parsed.headers); break
    case 'attendance': autoMap = autoMapAttendance(parsed.headers); break
    case 'classes': autoMap = autoMapClassList(parsed.headers); break
    case 'sqa': autoMap = autoMapSqa(parsed.headers); break
    case 'transition': autoMap = autoMapTransition(parsed.headers); break
    case 'destinations': autoMap = autoMapDestinations(parsed.headers); break
    case 'demographics': autoMap = autoMapDemographics(parsed.headers); break
    default: return NextResponse.json({ error: `Unknown kind: ${kind}` }, { status: 400 })
  }

  return NextResponse.json({
    headers: parsed.headers,
    preview: parsed.rows.slice(0, 10),
    rowCount: parsed.rows.length,
    autoMap,
  })
}
