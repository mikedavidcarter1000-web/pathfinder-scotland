import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

// Rate limit: 10 submissions per user (by IP for anon) per hour
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_MAX = 10
const RATE_WINDOW_MS = 60 * 60 * 1000

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_MAX
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const rateKey = userId ?? ip
    if (isRateLimited(rateKey)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json() as { page_path?: string; is_helpful?: boolean }
    const { page_path, is_helpful } = body

    if (typeof page_path !== 'string' || !page_path.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid page_path' }, { status: 400 })
    }
    if (typeof is_helpful !== 'boolean') {
      return NextResponse.json({ error: 'Invalid is_helpful' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('feedback')
      .insert({ page_path, is_helpful, user_id: userId })
      .select('id')
      .single()

    if (error) {
      console.error('[feedback] insert error:', error)
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('[feedback] unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json() as { id?: string; comment?: string }
    const { id, comment } = body

    if (!id || !UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
    if (typeof comment !== 'string' || comment.length === 0 || comment.length > 500) {
      return NextResponse.json({ error: 'Invalid comment' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (supabase as any)
      .from('feedback')
      .update({ comment })
      .eq('id', id)

    // Only allow updating own rows (or anon rows when user_id is null)
    if (userId) {
      query.eq('user_id', userId)
    } else {
      query.is('user_id', null)
    }

    const { error } = await query

    if (error) {
      console.error('[feedback] update error:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[feedback] patch error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
