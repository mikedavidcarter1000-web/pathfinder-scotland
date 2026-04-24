import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

const VALID_SCALE = new Set(['rating', 'yes_no', 'custom'])

export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('school_tracking_metrics')
    .select('*')
    .eq('school_id', ctx.schoolId)
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ metrics: data ?? [] })
}

export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi({ mustManageTracking: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    metric_name?: unknown
    metric_key?: unknown
    scale_type?: unknown
    scale_options?: unknown
    colour_coding?: unknown
    applies_to_departments?: unknown
    sort_order?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const name = typeof body.metric_name === 'string' ? body.metric_name.trim() : ''
  const key = typeof body.metric_key === 'string' ? body.metric_key.trim() : slugKey(name)
  const scaleType = typeof body.scale_type === 'string' ? body.scale_type : ''
  if (!name || !key || !VALID_SCALE.has(scaleType)) {
    return NextResponse.json({ error: 'metric_name and valid scale_type required.' }, { status: 400 })
  }

  const scaleOptions = Array.isArray(body.scale_options) ? body.scale_options.filter((v): v is string => typeof v === 'string') : null
  const colourCoding = body.colour_coding && typeof body.colour_coding === 'object' ? (body.colour_coding as Record<string, string>) : null
  const departments = Array.isArray(body.applies_to_departments) ? body.applies_to_departments.filter((v): v is string => typeof v === 'string') : null
  const sortOrder = typeof body.sort_order === 'number' ? body.sort_order : 99

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('school_tracking_metrics')
    .insert({
      school_id: ctx.schoolId,
      metric_name: name,
      metric_key: key,
      scale_type: scaleType,
      scale_options: scaleOptions,
      colour_coding: colourCoding,
      applies_to_departments: departments,
      sort_order: sortOrder,
      is_active: true,
    })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ metric: data })
}

function slugKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}
