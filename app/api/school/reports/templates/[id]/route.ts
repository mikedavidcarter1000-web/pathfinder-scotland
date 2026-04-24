import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// GET /api/school/reports/templates/[id] -- fetch a single template
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('report_templates')
    .select('id, name, template_html, header_colour, school_logo_url, is_default, created_at')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Template not found.' }, { status: 404 })
  return NextResponse.json({ template: data })
}

// PUT /api/school/reports/templates/[id] -- update
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const patch: Record<string, unknown> = {}
  if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim()
  if (typeof body.template_html === 'string' && body.template_html) patch.template_html = body.template_html
  if (typeof body.header_colour === 'string') patch.header_colour = body.header_colour
  if (typeof body.school_logo_url === 'string') {
    patch.school_logo_url = body.school_logo_url.trim() || null
  } else if (body.school_logo_url === null) {
    patch.school_logo_url = null
  }

  if (body.is_default === true) {
    // Unset any other default first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('report_templates')
      .update({ is_default: false })
      .eq('school_id', ctx.schoolId)
      .eq('is_default', true)
    patch.is_default = true
  } else if (body.is_default === false) {
    patch.is_default = false
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('report_templates')
    .update(patch)
    .eq('id', id)
    .eq('school_id', ctx.schoolId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/school/reports/templates/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // Block deleting the last remaining template / the current default.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current } = await (admin as any)
    .from('report_templates')
    .select('is_default')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!current) return NextResponse.json({ error: 'Template not found.' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (admin as any)
    .from('report_templates')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', ctx.schoolId)

  if ((count ?? 0) <= 1) {
    return NextResponse.json({ error: 'Cannot delete the last remaining template.' }, { status: 400 })
  }
  if (current.is_default) {
    return NextResponse.json(
      { error: 'This is the default template. Set another template as default before deleting.' },
      { status: 400 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('report_templates')
    .delete()
    .eq('id', id)
    .eq('school_id', ctx.schoolId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
