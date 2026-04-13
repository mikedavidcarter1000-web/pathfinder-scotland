import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as { link_id?: unknown } | null
    const linkId = body?.link_id
    if (typeof linkId !== 'string' || !UUID_RE.test(linkId)) {
      return NextResponse.json({ error: 'Invalid link id.' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc('revoke_parent_link', {
      p_link_id: linkId,
    })

    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('not found') || msg.includes('not yours')) {
        return NextResponse.json(
          { error: 'Link not found or already revoked.' },
          { status: 404 }
        )
      }
      console.error('[parent-link/revoke] RPC error:', error)
      return NextResponse.json(
        { error: 'Could not revoke the link. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[parent-link/revoke] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
