import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/reports/templates -- list all templates at the school
export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('report_templates')
    .select('id, name, header_colour, school_logo_url, is_default, created_at')
    .eq('school_id', ctx.schoolId)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ templates: data ?? [] })
}

// POST /api/school/reports/templates -- create a new template
export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    name?: unknown
    template_html?: unknown
    header_colour?: unknown
    school_logo_url?: unknown
    is_default?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const templateHtml = typeof body.template_html === 'string' ? body.template_html : ''
  const headerColour = typeof body.header_colour === 'string' ? body.header_colour : '#1B3A5C'
  const schoolLogoUrl = typeof body.school_logo_url === 'string' && body.school_logo_url.trim() ? body.school_logo_url.trim() : null
  const isDefault = body.is_default === true

  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  if (!templateHtml) return NextResponse.json({ error: 'Template HTML is required.' }, { status: 400 })

  // If setting as default, unset any other default at this school.
  if (isDefault) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('report_templates')
      .update({ is_default: false })
      .eq('school_id', ctx.schoolId)
      .eq('is_default', true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('report_templates')
    .insert({
      school_id: ctx.schoolId,
      name,
      template_html: templateHtml,
      header_colour: headerColour,
      school_logo_url: schoolLogoUrl,
      is_default: isDefault,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}
