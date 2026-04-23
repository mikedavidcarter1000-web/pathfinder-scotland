import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const guard = await requireAdminApi()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') ?? ''
  const helpful = searchParams.get('helpful') ?? 'all'
  const sortField = searchParams.get('sortField') ?? 'created_at'
  const sortDir = searchParams.get('sortDir') ?? 'desc'
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = guard.admin as any

  // Rows query
  let query = admin
    .from('feedback')
    .select('id, page_path, is_helpful, comment, created_at, user_id')

  if (path) query = query.ilike('page_path', `%${path}%`)
  if (helpful === 'yes') query = query.eq('is_helpful', true)
  if (helpful === 'no') query = query.eq('is_helpful', false)

  const validSortFields = ['created_at', 'page_path', 'is_helpful']
  const safeField = validSortFields.includes(sortField) ? sortField : 'created_at'
  query = query.order(safeField, { ascending: sortDir === 'asc' })
  query = query.range(offset, offset + limit - 1)

  const { data: rawRows, error: rowsError } = await query

  if (rowsError) {
    console.error('[admin/feedback] rows error:', rowsError)
    return NextResponse.json({ error: 'Failed to load rows' }, { status: 500 })
  }

  // Resolve user emails via auth admin API
  const userIds: string[] = [...new Set(
    (rawRows as Array<{ user_id: string | null }>)
      .map((r) => r.user_id)
      .filter((id): id is string => id !== null)
  )]

  const emailMap = new Map<string, string>()
  if (userIds.length > 0) {
    try {
      const { data: usersData } = await guard.admin.auth.admin.listUsers({ perPage: 1000 })
      for (const u of usersData?.users ?? []) {
        if (u.email) emailMap.set(u.id, u.email)
      }
    } catch {
      // Non-fatal — emails will show as null
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (rawRows as any[]).map((r) => ({
    id: r.id,
    page_path: r.page_path,
    is_helpful: r.is_helpful,
    comment: r.comment,
    created_at: r.created_at,
    user_email: r.user_id ? (emailMap.get(r.user_id) ?? null) : null,
  }))

  // Stats query — unfiltered aggregates
  const { data: allRows, error: statsError } = await admin
    .from('feedback')
    .select('page_path, is_helpful')

  if (statsError) {
    console.error('[admin/feedback] stats error:', statsError)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }

  const all = allRows as Array<{ page_path: string; is_helpful: boolean }>
  const total = all.length
  const helpful_count = all.filter((r) => r.is_helpful).length
  const rate = total > 0 ? (helpful_count / total) * 100 : 0

  // Per-page aggregates (minimum 3 responses to surface)
  const pageMap = new Map<string, { total: number; helpful: number }>()
  for (const r of all) {
    const entry = pageMap.get(r.page_path) ?? { total: 0, helpful: 0 }
    entry.total++
    if (r.is_helpful) entry.helpful++
    pageMap.set(r.page_path, entry)
  }

  const pageStats = Array.from(pageMap.entries())
    .filter(([, v]) => v.total >= 3)
    .map(([page_path, v]) => ({
      page_path,
      total: v.total,
      helpful: v.helpful,
      unhelpful: v.total - v.helpful,
      rate: (v.helpful / v.total) * 100,
    }))

  const worstPages = [...pageStats].sort((a, b) => a.rate - b.rate).slice(0, 10)
  const topPages = [...pageStats].sort((a, b) => b.rate - a.rate).slice(0, 10)

  return NextResponse.json({
    rows,
    stats: { total, helpful: helpful_count, rate, worstPages, topPages },
  })
}
