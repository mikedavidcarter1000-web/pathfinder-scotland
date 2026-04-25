import { NextResponse } from 'next/server'
import { requireAuthorityStaffApi } from '@/lib/authority/auth'
import { ALERT_TYPES, type AlertType, type AlertSeverity } from '@/lib/authority/alerts'

export const runtime = 'nodejs'

const SEVERITIES: AlertSeverity[] = ['info', 'warning', 'critical']

const PAGE_DEFAULT = 1
const PAGE_SIZE_DEFAULT = 20
const PAGE_SIZE_MAX = 100

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminAny = any

export async function GET(req: Request) {
  const guard = await requireAuthorityStaffApi({ mustBeVerified: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const sp = url.searchParams

  const types = sp.getAll('type').filter((t): t is AlertType => ALERT_TYPES.includes(t as AlertType))
  const severities = sp.getAll('severity').filter((s): s is AlertSeverity => SEVERITIES.includes(s as AlertSeverity))
  const acknowledgedParam = sp.get('acknowledged')
  const schoolId = sp.get('school_id')
  const fromDate = sp.get('from')
  const toDate = sp.get('to')
  const limitParam = parseInt(sp.get('limit') ?? '', 10)
  const pageParam = parseInt(sp.get('page') ?? '', 10)
  const limit = Math.min(Number.isFinite(limitParam) && limitParam > 0 ? limitParam : PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : PAGE_DEFAULT
  const offset = (page - 1) * limit

  // QIO scope: clamp school_id and assigned_school_ids list.
  let allowedSchoolIds: string[] | null = null
  if (ctx.role === 'qio') {
    const { data: staff } = await (admin as AdminAny)
      .from('authority_staff')
      .select('assigned_school_ids')
      .eq('id', ctx.staffId)
      .maybeSingle()
    const assigned = Array.isArray(staff?.assigned_school_ids) ? (staff!.assigned_school_ids as string[]) : []
    allowedSchoolIds = assigned
    if (allowedSchoolIds.length === 0) {
      return NextResponse.json({ alerts: [], total: 0, page, limit })
    }
  }

  let query = (admin as AdminAny)
    .from('authority_alerts')
    .select(
      'id, alert_type, school_id, severity, title, detail, acknowledged, acknowledged_by, acknowledged_at, created_at',
      { count: 'exact' }
    )
    .eq('authority_id', ctx.authorityId)

  if (types.length > 0) query = query.in('alert_type', types)
  if (severities.length > 0) query = query.in('severity', severities)
  if (acknowledgedParam === 'true') query = query.eq('acknowledged', true)
  else if (acknowledgedParam === 'false') query = query.eq('acknowledged', false)
  if (schoolId) query = query.eq('school_id', schoolId)
  if (fromDate) query = query.gte('created_at', fromDate)
  if (toDate) query = query.lte('created_at', toDate)
  if (allowedSchoolIds) query = query.in('school_id', allowedSchoolIds)

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Resolve school names for display.
  const rows = (data ?? []) as Array<{
    id: string
    alert_type: string
    school_id: string | null
    severity: string
    title: string
    detail: Record<string, unknown> | null
    acknowledged: boolean
    acknowledged_by: string | null
    acknowledged_at: string | null
    created_at: string
  }>
  const schoolIds = Array.from(new Set(rows.map((r) => r.school_id).filter((s): s is string => !!s)))
  const schoolNameById: Record<string, string> = {}
  if (schoolIds.length > 0) {
    const { data: schools } = await (admin as AdminAny)
      .from('schools')
      .select('id, name')
      .in('id', schoolIds)
    for (const s of ((schools ?? []) as Array<{ id: string; name: string }>)) {
      schoolNameById[s.id] = s.name
    }
  }

  const alerts = rows.map((r) => ({ ...r, school_name: r.school_id ? schoolNameById[r.school_id] ?? null : null }))
  return NextResponse.json({ alerts, total: count ?? 0, page, limit })
}
