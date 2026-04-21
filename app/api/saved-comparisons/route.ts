import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const MAX_NAME_LENGTH = 60
const MIN_ROLES = 2
const MAX_ROLES = 3

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('saved_comparisons')
    .select('id, name, role_ids, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[saved-comparisons] list error:', error)
    return NextResponse.json({ error: 'Failed to load comparisons' }, { status: 500 })
  }

  return NextResponse.json({ comparisons: data ?? [] })
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: unknown; roleIds?: unknown }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name is required (max ${MAX_NAME_LENGTH} characters)` },
        { status: 400 },
      )
    }

    if (!Array.isArray(body.roleIds)) {
      return NextResponse.json({ error: 'roleIds must be an array' }, { status: 400 })
    }

    const seen = new Set<string>()
    const roleIds: string[] = []
    for (const raw of body.roleIds) {
      if (typeof raw !== 'string') continue
      const id = raw.trim().toLowerCase()
      if (!UUID_RE.test(id)) continue
      if (seen.has(id)) continue
      seen.add(id)
      roleIds.push(id)
    }

    if (roleIds.length < MIN_ROLES || roleIds.length > MAX_ROLES) {
      return NextResponse.json(
        { error: `Comparison must include ${MIN_ROLES}–${MAX_ROLES} roles` },
        { status: 400 },
      )
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('saved_comparisons')
      .insert({ user_id: user.id, name, role_ids: roleIds })
      .select('id, name, role_ids, created_at, updated_at')
      .single()

    if (error) {
      console.error('[saved-comparisons] insert error:', error)
      return NextResponse.json({ error: 'Failed to save comparison' }, { status: 500 })
    }

    return NextResponse.json({ comparison: data })
  } catch (err) {
    console.error('[saved-comparisons] unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
